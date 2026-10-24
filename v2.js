/* =====================================================================
   BrandFit v2 — correção de método + base de gestão comercial.
   Camada de overrides: carregada por último, redefine funções v1.
   F1 gate de anamnese · F2 meta=gap×captura com memória · F3/F4 dois scores
   F5 rota curada · F6 camada de prova · Bloco A economia do PDV · Bloco B canal
   ===================================================================== */
"use strict";

/* ---------- F2: conversão correta (causa-raiz do bug das 2424 caixas) ----------
   1 caixa lata = 24 × 350 ml = 8.400 ml = 0,084 HL. A v1 dividia por 1e6 (10× a menos). */
function hlPorCaixa(fmt){ return PARAMS.fatores_caixa[fmt] * PARAMS.ml_por_unidade[fmt] / 1e5; }

/* ---------- parâmetros v2 (fonte + data em cada) ---------- */
const PARAMS_V2 = {
  fator_captura: { balde:0.20, fridge:0.15, reprecificacao:0.10, material:0.08 },
  pesos_equidade: { demanda:0.35, fridge:0.25, material:0.20, preco:0.20 },
  rota_n_default: 10, rota_n_min: 6, rota_n_max: 14,
  perda_linha_pct: 8, dose_padrao_ml: 300,
  markup_alvo: { "on-trade":1.9, "off-trade":1.35 },
  politica_comercial: {
    "on-trade":  { desconto_max_pct:8,  prazo_dias:21, bonificacao:"1/12", verba_trade_pct:3 },
    "off-trade": { desconto_max_pct:5,  prazo_dias:30, bonificacao:"1/20", verba_trade_pct:2 }
  },
  faixa_preco_canal_pct: 15
};
const FONTE_V2 = {
  fator_captura: { fonte:"Curva de captura de ativações — a calibrar no piloto 90 dias", data:"2026-10-24", validado:false },
  pesos_equidade: { fonte:"Modelo de equidade — decisão de projeto (a validar com BI)", data:"2026-10-24", validado:false },
  rota_n_default: { fonte:"Rotina comercial — capacidade diária do rep", data:"2026-10-24", validado:true },
  perda_linha_pct: { fonte:"Ficha técnica de chope — estimativa de linha", data:"2026-10-24", validado:false },
  markup_alvo: { fonte:"Política de preço por canal", data:"2026-10-24", validado:false },
  politica_comercial: { fonte:"Política comercial 2026 por canal", data:"2026-10-24", validado:true },
  faixa_preco_canal_pct: { fonte:"Gestão de preço — tolerância de balcão", data:"2026-10-24", validado:false }
};
function hidratarParamsV2(){
  let mudou=false;
  Object.keys(PARAMS_V2).forEach(k=>{ if(PARAMS[k]==null){ PARAMS[k]=JSON.parse(JSON.stringify(PARAMS_V2[k])); mudou=true; } });
  Object.keys(FONTE_V2).forEach(k=>{ if(!PARAMS_FONTE[k]) PARAMS_FONTE[k]=FONTE_V2[k]; });
  if(mudou) salvarParams();
}

/* ---------- Bloco B: canal (on-trade × off-trade) ---------- */
function canalDe(p){
  if(p.canal) return p.canal;
  return ["Mercado","Distribuidora"].includes(p.tipo) ? "off-trade" : "on-trade";
}
const CANAL_NOME = { "on-trade":"on-trade (consumo no local)", "off-trade":"off-trade (para casa)" };

/* F3/B: fair share SEGMENTADO POR CANAL — bar e mercado não se misturam */
function fairShareTier(p,t){
  const canal=canalDe(p);
  const pares=BASE.pdvs.filter(x=>x.anamnese==="completa"&&x.id!==p.id&&canalDe(x)===canal);
  const grupos=[
    {nome:"tipo+classe · "+canal, f:x=>x.tipo===p.tipo&&x.classe===p.classe},
    {nome:"tipo · "+canal, f:x=>x.tipo===p.tipo},
    {nome:"classe · "+canal, f:x=>x.classe===p.classe},
    {nome:"canal "+canal, f:()=>true}
  ];
  for(const g of grupos){
    const a=pares.filter(g.f).map(x=>shareTier(x,t));
    if(a.length>=PARAMS.fair_share_min_amostra) return {v:mediana(a), n:a.length, grupo:g.nome, ok:true};
  }
  /* fallback final SEMPRE dentro do canal — nunca mistura on-trade com off-trade */
  const tudo=pares.map(x=>shareTier(x,t));
  return {v:tudo.length?mediana(tudo):null, n:tudo.length, grupo:"canal "+canal, ok:tudo.length>=PARAMS.fair_share_min_amostra};
}

/* ---------- F1: gate de anamnese + campos faltantes nomeados ---------- */
function camposChaveStatus(p){
  return [
    ["potencial medido",      p.origem_potencial==="coletado"?0 : (p.pot_med?0.4:1)],
    ["custo de compra/caixa", p.custo_lata? (p.custo_origem==="estimado"?0.4:0) : 1],
    ["estoque médio",         p.estoque_medio?0.4:1],
    ["verba de trade",        (p.verba_trade_mes!=null&&p.verba_trade_mes!=="")?0.4:1],
    ["subtipo de compra",     p.subtipo_compra?0.4:1],
    ["custo fixo mensal",     p.custo_fixo_mes?0.4:1]
  ];
}
function camposFaltantes(p){ return camposChaveStatus(p).filter(d=>d[1]>=1).map(d=>d[0]); }
function scoreColeta(p){
  if(p.anamnese==="completa") return null;
  const d=camposChaveStatus(p);
  return Math.round(d.reduce((a,x)=>a+x[1],0)/d.length*100);
}

/* ---------- F3/F4: score de Oportunidade (piso × confiança) ---------- */
function scoreOportunidadeRaw(p){
  if(p.anamnese!=="completa") return null;
  const piso=p.origem_potencial==="coletado"? p.pot_med : p.pot_inf;
  return piso*(scoreConfianca(p)/100);
}
function scoreOportunidadeNorm(){
  const vals=BASE.pdvs.map(p=>scoreOportunidadeRaw(p)).filter(v=>v!=null);
  const max=Math.max(...vals,1);
  const out={}; BASE.pdvs.forEach(p=>{ const r=scoreOportunidadeRaw(p); if(r!=null) out[p.id]=Math.round(r/max*100); });
  return out;
}

/* ---------- F1: ação do dia com gate ---------- */
function acaoDoDia(p){
  if(p.anamnese==="pendente")
    return {titulo:"Completar anamnese — coleta antes de qualquer execução",
      justificativa:"sem anamnese completa não há marca-alvo nem ação prescritiva (regra de método v2)", tempo:20, bloqueada:true};
  const v=veredito(p), a=v.ma.alvo, m=a.m, tp=v.ma.tp;
  if(hlMarca(p,m)===0)
    return {titulo:"Colocar "+m+" no cardápio — entrada negociada com o decisor",
      justificativa:"encaixe de posicionamento: "+TIER_NOME[a.t]+" em PDV "+TIER_NOME[tp]+"; sem presença hoje", tempo:15, tipo:"material"};
  if(p.ruptura_mensal_pct>PARAMS.meta_ruptura_max)
    return {titulo:"Acertar frequência de pedido de "+m+" — ruptura "+p.ruptura_mensal_pct.toFixed(1)+"%",
      justificativa:"volume que some por falta de produto; meta máx. "+PARAMS.meta_ruptura_max+"%", tempo:10, tipo:"reprecificacao"};
  if(p.share_geladeira<ambevShare(p)-3)
    return {titulo:"Negociar porta do fridge para "+m+" (fridge "+p.share_geladeira.toFixed(0)+"% vs share Ambev "+ambevShare(p).toFixed(0)+"%)",
      justificativa:"exposição abaixo do share — geladeira é o primeiro driver de share no PDV", tempo:10, tipo:"fridge"};
  if(!p.cold_door)
    return {titulo:"Garantir cerveja gelada (cold door) do portfólio",
      justificativa:"sem gelada não tem venda por impulso — pré-requisito de consumo no local", tempo:5, tipo:"fridge"};
  if(!p.ponto_extra && p.fluxo==="Alto")
    return {titulo:"Fachada + ponto extra de "+m+" na entrada",
      justificativa:"fluxo alto do PDV multiplica o retorno de exposição da marca-alvo", tempo:15, tipo:"material"};
  if(!p.ponto_extra)
    return {titulo:"Ponto extra de "+m+"", justificativa:"exposição adicional com retorno direto em share", tempo:10, tipo:"material"};
  if(v.gap.gapPct!=null&&v.gap.gapPct>2)
    return {titulo:"Balde promocional de "+m+" no pico de fluxo",
      justificativa:"gap vs fair share do tier: "+v.gap.hl.toFixed(1)+" HL/mês; balde acelera volume no consumidor certo", tempo:10, tipo:"balde"};
  if(tp>=3&&p.bsv<PARAMS.meta_bsv)
    return {titulo:"Subir mix: "+m+" com posição destacada no cardápio e preço posicionado",
      justificativa:"PDV "+TIER_NOME[tp]+" suporta premium — BSV "+p.bsv.toFixed(1)+"% < meta "+PARAMS.meta_bsv+"%", tempo:10, tipo:"reprecificacao"};
  return {titulo:"Consolidar "+m+": revisar preço de balcão e validade na geladeira",
    justificativa:"execução em dia — foco em defender share e valorizar mix", tempo:10, tipo:"reprecificacao"};
}

/* ---------- F2: meta nascida do gap, com trava e memória de cálculo ---------- */
function metaDaAcao(p, tipoAcao){
  const v=veredito(p);
  const gapHl=v.gap.hl||0;
  const fc=(PARAMS.fator_captura||{})[tipoAcao]||0.10;
  const fmt=p.mix_formato||{lata_350:1};
  const fk=Object.keys(fmt).reduce((a,b)=>fmt[a]>=fmt[b]?a:b);
  const hlCx=hlPorCaixa(fk);
  const gapCx=gapHl/hlCx;
  let metaHl=gapHl*fc, metaCx=metaHl/hlCx, aviso=null;
  if(metaCx>gapCx){ metaCx=gapCx; metaHl=gapHl; aviso="Configuração inconsistente: fator de captura geraria meta acima do gap — meta limitada ao gap."; }
  const memoria="gap "+gapHl.toFixed(1)+" HL/mês × captura "+(fc*100).toFixed(0)+"% = "+metaHl.toFixed(1)+" HL/mês ÷ "+hlCx.toFixed(4)+" HL/caixa ("+fk.replace(/_/g," ")+") = "+Math.max(1,Math.round(metaCx))+" caixas/mês";
  return {metaHl:+metaHl.toFixed(1), metaCx:Math.max(1,Math.round(metaCx)), gapCx:Math.round(gapCx), fk, fc, memoria, aviso, gapHl:+gapHl.toFixed(1)};
}
function modalMemoria(titulo, memoria, extra){
  abrirModal('<h3>'+esc(titulo)+'</h3><div class="veredito">'+esc(memoria)+
    (extra?'<div class="tiny" style="margin-top:8px">'+esc(extra)+'</div>':'')+
    '</div><button class="btn block" style="margin-top:10px" onclick="fecharModal()">Fechar</button>');
}

/* ---------- F6: histórico de medições (localStorage) ---------- */
const LS_HIST="brandfit_hist_v1";
let HIST={}; try{ HIST=JSON.parse(localStorage.getItem(LS_HIST)||"{}")||{}; }catch(e){ HIST={}; }
function salvarHist(){ localStorage.setItem(LS_HIST, JSON.stringify(HIST)); }
function equidadePDV(p){
  const w=PARAMS.pesos_equidade;
  const de=(p.demanda_espontanea||0)/5;
  const fr=Math.min(1,(p.share_geladeira||0)/100);
  const mat=p.material_pdv?1:(p.ponto_extra?0.6:0);
  const pc=precoCompliance(p);
  return Math.round((de*w.demanda+fr*w.fridge+mat*w.material+pc*w.preco)*100);
}
function precoCompliance(p){
  const v=veredito(p), m=v.ma.alvo.m;
  const mult=p.classe==="A"?1.18:p.classe==="C"?0.88:1;
  const ref=PORT[m].preco*mult, pr=p.preco[m]||ref;
  return Math.abs(pr-ref)<=ref*(PARAMS.faixa_preco_canal_pct/100)?1:0;
}
function medicaoDe(p){
  const v=veredito(p);
  return { data:new Date().toISOString().slice(0,10), marca:v.ma.alvo.m,
    share_alvo:+shareMarca(p,v.ma.alvo.m).toFixed(2), bsv:+bsvPDV(p).toFixed(2),
    preco:p.preco[v.ma.alvo.m], ruptura:+p.ruptura_mensal_pct.toFixed(1),
    portas:+p.share_geladeira.toFixed(0), hl_ambev:+ambevHL(p).toFixed(1),
    share_ambev:+ambevShare(p).toFixed(2), equidade:equidadePDV(p),
    origem:BASE.ficticio?"demo":"coletado" };
}
function gravarMedicao(id){
  const p=BASE.pdvs.find(x=>x.id===id); if(!p) return;
  (HIST[id]=HIST[id]||[]).push(medicaoDe(p));
  if(HIST[id].length>24) HIST[id]=HIST[id].slice(-24);
  salvarHist();
}
function addDays(iso,d){ const dt=new Date(iso+"T12:00:00"); dt.setDate(dt.getDate()+d); return dt.toISOString().slice(0,10); }
/* linha de base de demonstração para os 2 PDVs demo (badged "demo") — NUNCA simula ganho:
   grava apenas o passado; o ganho só aparece quando houver medição real futura */
function seedHistDemo(){
  ["PDV001","PDV002"].forEach(id=>{
    if(HIST[id]&&HIST[id].length) return;
    const p=BASE.pdvs.find(x=>x.id===id); if(!p) return;
    const m=medicaoDe(p), hoje=new Date().toISOString().slice(0,10);
    const b1=Object.assign({},m,{data:addDays(hoje,-60)});
    const b2=Object.assign({},m,{data:addDays(hoje,-30), share_alvo:+(m.share_alvo+0.8).toFixed(2),
      bsv:+(m.bsv+0.5).toFixed(2), equidade:Math.min(100,m.equidade+2)});
    HIST[id]=[b1,b2]; salvarHist();
  });
}

/* ---------- F6c/e: antes-depois e piloto 90 dias ---------- */
function deltasPDV(p){
  const h=HIST[p.id]||[];
  if(h.length<2) return null;
  const a=h[0], b=h[h.length-1];
  return { n:h.length, primeira:a.data, ultima:b.data,
    dShare:+(b.share_alvo-a.share_alvo).toFixed(1), dBSV:+(b.bsv-a.bsv).toFixed(1),
    dHL:+(b.hl_ambev-a.hl_ambev).toFixed(1), dEq:b.equidade-a.equidade, demo:h.some(m=>m.origem==="demo") };
}
function piloto90(){
  const norm=scoreOportunidadeNorm();
  return BASE.pdvs.filter(p=>p.anamnese==="completa")
    .sort((a,b)=>(norm[b.id]||0)-(norm[a.id]||0)).slice(0,10).map(p=>{
      const h=HIST[p.id]||[], base=h[0]||null;
      const inicio=base?base.data:(BASE.gerado_em||new Date().toISOString().slice(0,10));
      const fim=addDays(inicio,90);
      const status=!base?"Não iniciado":(new Date(fim+"T23:59")>new Date()?"Em curso":"Concluído");
      const metaPp=Math.max(1,Math.round((veredito(p).gap.gapPct||2)*((PARAMS.fator_captura||{}).balde||0.2)));
      const real=h.length>=2?+(h[h.length-1].share_alvo-base.share_alvo).toFixed(1):null;
      return {p, inicio, fim, status, metaPp, base, real, bateu:real==null?null:real>=metaPp};
    });
}

/* ---------- Bloco A: economia do ponto ---------- */
function dosesPorBarril(p){
  const litros=p.barril_litros||30, perda=((p.perda_linha_pct!=null?p.perda_linha_pct:PARAMS.perda_linha_pct))/100,
    dose=p.dose_ml||PARAMS.dose_padrao_ml;
  return { doses:(litros*1000*(1-perda))/dose, litros, perda, dose };
}
function litrosMensaisFmt(p,fk){
  const fmt=p.mix_formato||{lata_350:1};
  const fr=fmt[fk]||0;
  return (p.hl_cerveja_mes||0)*fr*100; // HL→L
}
function linhasEconomia(p){
  const out=[];
  if(p.custo_lata){
    const cxL=PARAMS.fatores_caixa.lata_350*PARAMS.ml_por_unidade.lata_350/1000;
    const custoL=p.custo_lata/cxL, doseL=PARAMS.ml_por_unidade.lata_350/1000;
    const custoDose=custoL*doseL, precoV=p.preco["Skol"]||PORT["Skol"].preco;
    const margemR=precoV-custoDose, margemPct=margemR/precoV*100, markup=precoV/custoDose;
    const litrosMes=litrosMensaisFmt(p,"lata_350");
    const giro=p.estoque_medio? (litrosMes/(p.estoque_medio*cxL)) : null;
    const dias=giro? (p.estoque_medio*cxL)/(litrosMes/30) : null;
    out.push({sku:"Lata 350 ml (Skol)", custoL, custoDose, precoV, margemR, margemPct, markup,
      litrosMes, giro, dias, memoria:"custo caixa R$ "+p.custo_lata.toFixed(2)+" ÷ "+cxL.toFixed(1)+" L = R$ "+custoL.toFixed(2)+"/L × "+doseL.toFixed(2)+" L/dose = R$ "+custoDose.toFixed(2)+"/dose; preço R$ "+precoV.toFixed(2)+" → margem R$ "+margemR.toFixed(2)+" ("+margemPct.toFixed(0)+"%), markup "+markup.toFixed(2)+"×"});
  }
  if(p.custo_barril){
    const b=dosesPorBarril(p), custoDose=p.custo_barril/b.doses;
    const precoV=p.preco_chope||12;
    const margemR=precoV-custoDose, margemPct=margemR/precoV*100, markup=precoV/custoDose;
    const litrosMes=p.hl_chope_mes||(litrosMensaisFmt(p,"garrafa_600")*0.3);
    const giro=p.estoque_barril? (litrosMes/(p.estoque_barril*b.litros)) : null;
    out.push({sku:"Chope barril "+b.litros+" L", custoL:p.custo_barril/b.litros, custoDose, precoV, margemR, margemPct, markup,
      litrosMes, giro, dias:giro?(p.estoque_barril*b.litros)/(litrosMes/30):null,
      memoria:"barril "+b.litros+" L × (1−"+(b.perda*100).toFixed(0)+"% perda) ÷ dose "+b.dose+" ml = "+b.doses.toFixed(0)+" doses; custo barril R$ "+p.custo_barril.toFixed(2)+" ÷ "+b.doses.toFixed(0)+" = R$ "+custoDose.toFixed(2)+"/dose; preço R$ "+precoV.toFixed(2)+" → margem R$ "+margemR.toFixed(2)+" ("+margemPct.toFixed(0)+"%)"});
  }
  return out;
}
function pontoEquilibrioLitros(p){
  if(!p.custo_fixo_mes||!p.custo_lata) return null;
  const cxL=PARAMS.fatores_caixa.lata_350*PARAMS.ml_por_unidade.lata_350/1000;
  const custoL=p.custo_lata/cxL, precoV=p.preco["Skol"]||PORT["Skol"].preco;
  const margemUnitL=precoV*1000/PARAMS.ml_por_unidade.lata_350-custoL; // R$ por litro vendido em lata
  if(margemUnitL<=0) return null;
  return {litros:p.custo_fixo_mes/margemUnitL, margemUnitL,
    memoria:"custo fixo R$ "+p.custo_fixo_mes.toFixed(0)+"/mês ÷ margem R$ "+margemUnitL.toFixed(2)+"/L = "+Math.round(p.custo_fixo_mes/margemUnitL).toLocaleString("pt-BR")+" L/mês"};
}
function semaforoSKU(l){
  if(l.margemPct>=40&&(l.giro==null||l.giro>=2)) return {c:"g",t:"estrela — margem alta + giro alto"};
  if(l.margemPct<25&&(l.giro!=null&&l.giro<1)) return {c:"r",t:"candidato a sair do cardápio"};
  return {c:"y",t:"acompanhar"};
}

/* ---------- Bloco B: política comercial, aderência, trade spend ---------- */
function aderenciaPolitica(){
  const pds=BASE.pdvs.filter(p=>p.anamnese==="completa");
  let ok=0;
  pds.forEach(p=>{ if(precoCompliance(p)) ok++; });
  return {ok, total:pds.length, pct:pds.length?Math.round(ok/pds.length*100):0};
}
function tradeSpend(p){
  if(!p.verba_trade_mes) return null;
  const d=deltasPDV(p);
  if(!d||d.dHL<=0) return {verba:p.verba_trade_mes, hl:null, ratio:null, status:"pendente"};
  const ratio=p.verba_trade_mes/d.dHL;
  const lim=PARAMS.politica_comercial[canalDe(p)].verba_trade_pct*100; // R$/HL teto = verba_pct×100 (3%→R$300/HL ref)
  return {verba:p.verba_trade_mes, hl:d.dHL, ratio, status: ratio>lim?"vermelho":"ok", lim};
}