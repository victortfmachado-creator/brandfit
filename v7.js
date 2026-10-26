/* =====================================================================
   BrandFit v7 — VEREDITO AUDITÁVEL, CHECKLIST QUALI, ATIVOS, SIMULADOR
   Porta do protótipo v8 (o que faltava), sem score de encaixe 0-100:
   1. Checklist qualitativo estruturado (6 perguntas, 5 min) -> perfil homologado
   2. Veredito auditável: nota quantitativa (60%) + qualitativa (40%), critérios explícitos
   3. Papéis estendidos (Defesa, Substituir) com justificativa numérica
   4. Ativos de trade homologados derivados da marca foco + perfil
   5. Plano tático de 4 semanas a partir do plano de mix
   6. Simulador de captura (conservador/base/agressivo) com receita
   7. Matriz de priorização do território (atacar já vs planejar)
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- checklist qualitativo (persistido por PDV) ---------- */
if(!ESTADO.checklist) ESTADO.checklist={};
const CHECK_DEFS=[
  {k:"mesas", p:"Estado de cadeiras e mesas", tipo:"esc", opts:["1 (Ruim)","2","3","4","5 (Excelente)"]},
  {k:"fachada", p:"Estado geral / fachada / higiene", tipo:"esc", opts:["1 (Precário)","2","3","4","5 (Alto nível)"]},
  {k:"publico", p:"Público predominante", tipo:"sel", opts:["Trabalhador / Operário","Família / Tradicional","Jovem / Balada","Universitário","Alto padrão / Executivo"]},
  {k:"precoRef", p:"Preço de referência do balcão (long neck mais cara, R$)", tipo:"num"},
  {k:"ocasiao", p:"Ocasião dominante", tipo:"sel", opts:["Bar de mesa / Calçada","Balada / Noite","Restaurante / Almoço e jantar","Petiscaria / Happy hour","Balcão / Delivery / Rápido"]},
  {k:"local", p:"Localização do ponto", tipo:"sel", opts:["Periferia / bairro afastado","Bairro residencial classe C/B","Corredor comercial movimentado","Zona nobre / polo gastronômico"]}
];
function checklistCompleto(p){
  const c=ESTADO.checklist[p.id];
  return c&&CHECK_DEFS.every(d=>c[d.k]!==undefined&&c[d.k]!=="");
}
/* compatibilidade público × classe (critério explícito, não score opaco) */
const PUBLICO_CLASSE={"Trabalhador / Operário":["C"],"Família / Tradicional":["B","C"],"Jovem / Balada":["B","A"],"Universitário":["B"],"Alto padrão / Executivo":["A"]};
function perfilQualificado(p){
  const c=ESTADO.checklist[p.id]||{};
  if(!checklistCompleto(p)) return null;
  const pub=c.publico;
  const classes=PUBLICO_CLASSE[pub]||[];
  const compat=classes.includes(p.classe)?100:(classes.length?60:30);
  const perfil=(c.local||"").includes("nobre")||pub.includes("Alto padrão")?"Alto padrão"
    :pub.includes("Trabalhador")||(c.local||"").includes("Periferia")?"Popular"
    :pub.includes("Família")?"Tradicional":"Econômico";
  return {perfil, compat, c};
}

/* ---------- veredito auditável: 60% quant + 40% quali ---------- */
function vereditoAuditavel(p){
  const q=perfilQualificado(p);
  /* nota quantitativa: execução (0-100 já existe) + captura do gap */
  const exec=execucaoScore(p);
  const v=veredito(p);
  const captura=v.gap.fs!=null?Math.max(0,Math.min(100,100-(v.gap.gapPct||0)*4)):50;
  const notaQuant=Math.round(exec*0.7+captura*0.3);
  /* nota qualitativa: estado físico (mesas+fachada) + compatibilidade */
  let notaQuali=null, detalheQ=null;
  if(q){
    const fisico=((+q.c.mesas)+(+q.c.fachada))/10*100;
    notaQuali=Math.round(fisico*0.5+q.compat*0.5);
    detalheQ="estado físico "+Math.round(fisico)+"/100 · compatibilidade público×classe "+q.compat+"%";
  }
  const final=(notaQuali!=null)?Math.round(notaQuant*0.6+notaQuali*0.4):null;
  const nivel=final==null?null:(final>=80?"Serviço alto — defender e expandir":final>=60?"Serviço médio — corrigir execução":"Serviço crítico — recuperar base");
  return {notaQuant, notaQuali, final, nivel, q, captura,
    criterios:["nota quantitativa = 70% execução ("+exec+") + 30% captura do gap ("+Math.round(captura)+")",
      "nota qualitativa = 50% estado físico + 50% compatibilidade público×classe",
      "final = 60% quantitativa + 40% qualitativa (pesos declarados, auditáveis)"]};
}

/* ---------- papéis estendidos com justificativa numérica ---------- */
function papelV7(p,m,foco){
  const base=papelV6(p,m,foco);
  const cur=shareMarca(p,m);
  const d=(PORT[m]||PORT_V3[m]);
  if(AMBEV.includes(m)&&m!==foco){
    const dom=CONC_V3.map(c=>({c,sh:shareMarca(p,c)})).sort((a,b)=>b.sh-a.sh)[0];
    /* SUBSTITUIR: marca Ambev fora de posição (tier desalinhado) e sem gap a capturar */
    const fs=fairShareTier(p,d.tier);
    const gap=fs.v!=null?+(fs.v-cur).toFixed(1):null;
    if(cur>0&&gap!=null&&gap<-2&&d.tier-tierPDV(p)>=2)
      return {papel:"SUBSTITUIR", ic:"🚫", just:"share "+cur.toFixed(1)+"% acima do fair share do tier ("+fs.v.toFixed(1)+"%) em PDV "+TIER_NOME[tierPDV(p)]+" — marca desalinhada, negociar troca de espaço"};
    /* DEFESA: concorrente do mesmo tier pressionando a marca */
    if(dom&&dom.sh>20&&d.tier===(PORT[dom.c]||PORT_V3[dom.c]).tier&&cur>5)
      return {papel:"DEFESA", ic:"🛡️", just:"concorrente "+dom.c+" com "+dom.sh.toFixed(0)+"% no mesmo tier — manter execução e preço"};
  }
  const just={
    "FOCO":"gap do benchmark define a meta — 1 por PDV",
    "ÂNCORA":"maior volume Ambev — quando cresce, puxa a cesta (porteira)",
    "TRAVA":"ocupa o tier do concorrente dominante e impede entrada",
    "MARGEM":"preço R$ "+d.preco.toFixed(2)+" sustenta a rentabilidade do dono",
    "COMPLEMENTO":"cobre ocasião/formato sem canibalizar o foco",
    "ALVO":"concorrente — share a roubar com a marca do mesmo tier"
  };
  return {papel:base.papel, ic:base.ic, just:just[base.papel]||""};
}

/* ---------- ativos de trade homologados ---------- */
function ativosTrade(p){
  const foco=leituraPDV(p).foco;
  const q=perfilQualificado(p);
  const at=[{a:"Fridge dedicado", porquê:"share de geladeira "+p.share_geladeira.toFixed(0)+"% < share Ambev "+ambevShare(p).toFixed(0)+"%", prio:"alta"}];
  const tier=(PORT[foco.m]||PORT_V3[foco.m]).tier;
  if(tier>=3) at.push({a:"Balde de gelo + pegador", porquê:"marca foco premium ("+foco.m+") vende no balde", prio:"alta"});
  if(tier<=2) at.push({a:"Lousa de promoção", porquê:"marca foco popular ("+foco.m+") gira com preço visível", prio:"média"});
  if((p.mesas||0)>=8) at.push({a:"Porta-menus / cardápio", porquê:p.mesas+" mesas — pedido na mesa muda com material", prio:"média"});
  if(q&&q.perfil==="Alto padrão") at.push({a:"Credencial de ponto", porquê:"perfil alto padrão — status Ambev na fachada", prio:"baixa"});
  if(p.ruptura_mensal_pct>PARAMS.meta_ruptura_max) at.push({a:"Calendário de abastecimento", porquê:"ruptura "+p.ruptura_mensal_pct.toFixed(0)+"% > meta", prio:"alta"});
  return at;
}

/* ---------- plano tático de 4 semanas (do plano de mix) ---------- */
function plano4Semanas(p){
  const pm=planoMix(p);
  const gaps=[];
  pm.linhas.forEach(l=>{ if(AMBEV.includes(l.m)) l.formatos.forEach(f=>{ if(f.gapCx>0) gaps.push({m:l.m, f, cx:Math.round(f.gapCx)}); }); });
  gaps.sort((a,b)=>b.cx-a.cx);
  const semanas=[];
  for(let i=0;i<4;i++){
    if(i<gaps.length){
      const g=gaps[i], al=ALVO_MAPA[g.f.fk];
      semanas.push({n:i+1, titulo:g.m+" "+g.f.nome+" — "+g.cx+" caixas/mês",
        tatica:al?al.tatica:"execução de presença",
        alvo:al?al.alvo:null});
    } else if(i===gaps.length){
      const ent=pm.linhas.flatMap(l=>l.entradas).find(e=>e.elegivel);
      semanas.push(ent?{n:i+1, titulo:"Entrada: "+ent.nome, tatica:"negociar com volume garantido"+(ent.alvo?" contra "+ent.alvo.join(", "):""), alvo:ent.alvo}
        :{n:i+1, titulo:"Consolidação", tatica:"medir evolução e ajustar metas", alvo:null});
    } else {
      semanas.push({n:i+1, titulo:"Medição", tatica:"registrar share e comparar com a meta do quartil", alvo:null});
    }
  }
  return semanas;
}

/* ---------- simulador de captura ---------- */
function simuladorCaptura(p, taxa){
  const pm=planoMix(p);
  /* HL concorrente capturável = soma dos gaps das marcas Ambev (limitado ao volume concorrente) */
  const gapHl=pm.linhas.filter(l=>AMBEV.includes(l.m)).reduce((a,l)=>a+Math.max(0,l.gapHl),0);
  const concHl=CONC_V3.reduce((a,m)=>a+hlMarca(p,m),0);
  const capturavel=Math.min(gapHl, concHl*taxa);
  const caixas=capturavel/fatorCaixa("lata_350");
  const rHl=p.hl_total_mes?p.receita_total_mes/p.hl_total_mes:0;
  const receita=capturavel*rHl;
  const margem=receita*0.35;
  return {taxa, capturavel, caixas, receita, margem};
}
function cenariosCaptura(p){
  return [{nome:"Conservador", t:0.35},{nome:"Base", t:0.5},{nome:"Agressivo", t:0.65}]
    .map(c=>({nome:c.nome, r:simuladorCaptura(p,c.t)}));
}

/* ---------- matriz de priorização do território ---------- */
function matrizPrioridade(){
  const pds=BASE.pdvs.filter(p=>p.anamnese==="completa");
  const itens=pds.map(p=>{
    const v=veredito(p);
    const gap=v.gap.hl||0;
    const exec=execucaoScore(p);
    return {p, gap, exec, potencial:gap*(exec/100)};
  }).sort((a,b)=>b.potencial-a.potencial);
  return {
    atacar:itens.filter(x=>x.gap>1&&x.exec>=60).slice(0,5),
    planejar:itens.filter(x=>x.gap>1&&x.exec<60).slice(0,5)
  };
}