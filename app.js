/* =====================================================================
   BrandFit v1.2 — motor com MARCA-ALVO dinâmica (portfólio Ambev).
   A marca a trabalhar é escolhida POR PDV: encaixe de posicionamento
   (qualitativo) + headroom vs fair share do tier (quantitativo).
   ===================================================================== */
"use strict";
const PORT = {
  "Skol":       {tier:1, dono:"ambev",        preco:3.99,  papel:"volume"},
  "Brahma":     {tier:2, dono:"ambev",        preco:5.49,  papel:"volume"},
  "Antarctica": {tier:2, dono:"ambev",        preco:5.29,  papel:"defesa"},
  "Original":   {tier:3, dono:"ambev",        preco:7.49,  papel:"valor"},
  "Spaten":     {tier:3, dono:"ambev",        preco:8.99,  papel:"valor"},
  "Bohemia":    {tier:3, dono:"ambev",        preco:9.49,  papel:"nicho"},
  "Budweiser":  {tier:4, dono:"ambev",        preco:10.99, papel:"valor"},
  "Corona":     {tier:4, dono:"ambev",        preco:11.99, papel:"valor"},
  "Heineken":   {tier:4, dono:"concorrente", preco:12.99, papel:"concorrente"},
  "Itaipava":   {tier:1, dono:"concorrente", preco:3.49,  papel:"concorrente"},
  "Sol":        {tier:2, dono:"concorrente", preco:5.99,  papel:"concorrente"},
  "Eisenbahn":  {tier:3, dono:"concorrente", preco:9.99,  papel:"concorrente"}
};
const CERVEJAS = Object.keys(PORT);
const AMBEV = CERVEJAS.filter(m=>PORT[m].dono==="ambev");
const CONCORRENTES = CERVEJAS.filter(m=>PORT[m].dono==="concorrente");
const TIER_NOME = {1:"econômica",2:"principal",3:"premium",4:"super premium"};
const OUTRAS_CATEGORIAS = [
  ["Guaraná Antarctica","—",5.00,"—","refrigerante","ambev"],
  ["Red Bull","—",12.00,"—","energético","concorrente"],
  ["Água Mineral","—",2.50,"—","água","—"]
];
const PARAMS_DEFAULT = {
  fatores_caixa: { lata_350: 24, garrafa_600: 12, long_neck_330: 24, retornavel_600: 24 },
  ml_por_unidade: { lata_350: 350, garrafa_600: 600, long_neck_330: 330, retornavel_600: 600 },
  preco_faixa_plausivel: { min: 2.0, max: 25.0 },
  share_soma_max: 100, fair_share_min_amostra: 3, preco_garrafa600_mult: 1.35,
  meta_share_ambev: 55, meta_ruptura_max: 5, meta_share_geladeira: 40,
  meta_execucao_pontos: 70, meta_bsv: 55, margem_contribuicao: 0.28,
  investimento_piloto_pdv: 1200,
  sazonalidade: {
    Bar:[0.92,0.94,1.00,0.98,1.04,1.12], Restaurante:[0.95,0.96,1.00,1.00,1.02,1.07],
    Distribuidora:[1.00,0.98,1.00,1.00,1.00,1.02], Mercado:[1.02,1.00,1.00,0.98,1.00,1.04],
    Lanchonete:[0.96,0.97,1.00,1.00,1.01,1.06], "Casa Noturna":[0.88,0.90,1.02,1.00,1.08,1.22]
  }
};
const PARAMS_FONTE = {
  fatores_caixa: { fonte: "Padrão comercial (caixa × 24 latas / 12 garrafas)", data: "2026-10-01", validado: true },
  ml_por_unidade: { fonte: "Catálogo de SKUs", data: "2026-10-01", validado: true },
  preco_faixa_plausivel: { fonte: "Gestão de preço balcão — região", data: "2026-09-15", validado: true },
  share_soma_max: { fonte: "Regra de negócio (share ≤ 100%)", data: "2026-10-01", validado: true },
  fair_share_min_amostra: { fonte: "Metodologia de mediana — decisão de projeto", data: "2026-10-20", validado: false },
  preco_garrafa600_mult: { fonte: "Levantamento de campo — amostra de 12 PDVs", data: "2026-09-28", validado: false },
  meta_share_ambev: { fonte: "Meta comercial 2026", data: "2026-08-30", validado: true },
  meta_ruptura_max: { fonte: "Meta de serviço", data: "2026-08-30", validado: true },
  meta_share_geladeira: { fonte: "Meta de execução", data: "2026-08-30", validado: true },
  meta_execucao_pontos: { fonte: "Meta de execução", data: "2026-08-30", validado: true },
  meta_bsv: { fonte: "Meta de valor de marca", data: "2026-08-30", validado: true },
  margem_contribuicao: { fonte: "Financeiro — margem estimada de cerveja no balcão", data: "2026-09-30", validado: false },
  investimento_piloto_pdv: { fonte: "Trade marketing — custo médio de kit por PDV", data: "2026-09-30", validado: false },
  sazonalidade: { fonte: "Estimativa interna — a calibrar com BI", data: "2026-10-01", validado: false }
};
const LS_BASE = "brandfit_base_v2", LS_ESTADO = "brandfit_estado_v2", LS_PARAMS = "brandfit_params_v2";
let BASE = null, ESTADO = null, PARAMS = null;
function carregar(){
  try { PARAMS = JSON.parse(localStorage.getItem(LS_PARAMS)) || null; } catch(e){ PARAMS = null; }
  if(!PARAMS) PARAMS = JSON.parse(JSON.stringify(PARAMS_DEFAULT));
  try { ESTADO = JSON.parse(localStorage.getItem(LS_ESTADO)) || null; } catch(e){ ESTADO = null; }
  if(!ESTADO) ESTADO = { aba:"hoje", pdvAtual:null, subVisoes:"executivo", subPdv:"anamnese",
                         visitas:{}, ordemHoje:null, filtrosTerr:{tipo:"",classe:""} };
  try { const raw = localStorage.getItem(LS_BASE); if(raw){ BASE = JSON.parse(raw); } } catch(e){ BASE = null; }
  if(!BASE || !BASE.pdvs || !BASE.pdvs[0].serie_marca || !BASE.pdvs[0].serie_marca[BASE.meses[5]]["Skol"]){
    BASE = gerarBaseMock(); salvarBase();
  }
}
function salvarBase(){ localStorage.setItem(LS_BASE, JSON.stringify(BASE)); }
function salvarEstado(){ localStorage.setItem(LS_ESTADO, JSON.stringify(ESTADO)); }
function salvarParams(){ localStorage.setItem(LS_PARAMS, JSON.stringify(PARAMS)); }
function gerarBaseMock(){
  const rnd = (()=>{ let s=42; return ()=>{ s=(s*1103515245+12345)%2147483648; return s/2147483648; };})();
  const gauss = ()=>{ let u=0,v=0; while(!u)u=rnd(); while(!v)v=rnd(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  const pick = a => a[Math.floor(rnd()*a.length)];
  const r1 = x=>Math.round(x*10)/10, r2 = x=>Math.round(x*100)/100;
  const meses = ["2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"];
  const tipos=["Bar","Restaurante","Distribuidora","Mercado","Lanchonete","Casa Noturna"];
  const classes=["A","B","C"];
  const bairros=["Centro","Jardins","Boa Vista","Industrial","Vila Nova","São Pedro","Alto da Serra","Cidade Nova","Praia Bela","Lagoa Sul"];
  const saz = PARAMS.sazonalidade;
  const baseHL = {"Bar":55,"Restaurante":90,"Distribuidora":260,"Mercado":140,"Lanchonete":22,"Casa Noturna":75};
  const multClasse = {"A":1.45,"B":1.0,"C":0.62};
  const mixCat = {
    "Bar":{"cerveja":.70,"refrigerante":.14,"energético":.08,"água":.08},
    "Restaurante":{"cerveja":.45,"refrigerante":.30,"energético":.05,"água":.20},
    "Distribuidora":{"cerveja":.72,"refrigerante":.16,"energético":.05,"água":.07},
    "Mercado":{"cerveja":.55,"refrigerante":.25,"energético":.06,"água":.14},
    "Lanchonete":{"cerveja":.40,"refrigerante":.38,"energético":.10,"água":.12},
    "Casa Noturna":{"cerveja":.62,"refrigerante":.12,"energético":.18,"água":.08}
  };
  const mixFmt = (t,c)=> t==="Distribuidora"||t==="Mercado" ? {retornavel_600:.45,long_neck_330:.20,lata_350:.25,garrafa_600:.10}
      : t==="Casa Noturna" ? {retornavel_600:.05,long_neck_330:.25,lata_350:.55,garrafa_600:.15}
      : c==="C" ? {retornavel_600:.50,long_neck_330:.15,lata_350:.25,garrafa_600:.10}
      : {retornavel_600:.30,long_neck_330:.25,lata_350:.35,garrafa_600:.10};
  const W = {
    1:{Skol:34,Itaipava:16,Brahma:18,Antarctica:8,Sol:5,Original:3,Spaten:3,Eisenbahn:2,Bohemia:1,Budweiser:1.5,Corona:1,Heineken:1.5},
    2:{Skol:22,Itaipava:8,Brahma:20,Antarctica:10,Sol:5,Original:8,Spaten:6,Eisenbahn:3,Bohemia:2,Budweiser:3,Corona:3,Heineken:3},
    3:{Skol:10,Itaipava:3,Brahma:16,Antarctica:8,Sol:4,Original:12,Spaten:10,Eisenbahn:4,Bohemia:5,Budweiser:8,Corona:9,Heineken:7},
    4:{Skol:4,Itaipava:1,Brahma:8,Antarctica:4,Sol:2,Original:10,Spaten:9,Eisenbahn:3,Bohemia:6,Budweiser:14,Corona:16,Heineken:12}
  };
  const W_DEMO = {
    "Bar do Zé":{Spaten:40,Skol:10,Brahma:10,Itaipava:15,Sol:10,Original:4,Eisenbahn:3,Bohemia:2,Budweiser:2,Corona:2,Heineken:2,Antarctica:0},
    "Bar Premium Rooftop 9":{Corona:18,Budweiser:12,Heineken:14,Spaten:12,Original:10,Bohemia:8,Eisenbahn:5,Brahma:8,Antarctica:4,Sol:3,Skol:3,Itaipava:3}
  };
  const nomes = ["Bar do Zé","Bar Premium Rooftop 9","Boteco da Esquina","Barbearia & Bar Central",
    "Bar do Porto","Peixaria do Litoral","Bar Lume","Bar do Alemão","Toca do Chopp","Bar Vila",
    "Bar do Caído","Bar do Gato","Bar Mirante","Bar do Parque","Bar do Lago","Bar Tradição",
    "Bar do Freitas","Bar Portão","Bar do Centro","Bar Colina","Restaurante Sabor & Arte",
    "Cantina da Nona","Churrascaria Fogo Alto","Restaurante Maré","Bistrô Jardim",
    "Restaurante Dona Lena","Distribuidora Bebidas Já","Distribuidora Central","Mercado Bom Preço",
    "Mercado da Vila","Supermercado Aliança","Lanchonete Big Lanche","Lanchonete Ponto",
    "Casa Noturna Neon","Clube Noturno Aurora","Distribuidora Zona Sul"];
  const plan = [
    {nome:"Bar do Zé", tipo:"Bar", classe:"C", bairro:"Vila Nova", anamnese:"completa", demo:"simples"},
    {nome:"Bar Premium Rooftop 9", tipo:"Bar", classe:"A", bairro:"Jardins", anamnese:"completa", demo:"premium"}
  ];
  const dist = [].concat(Array(10).fill("completa"), Array(14).fill("parcial"), Array(10).fill("pendente"));
  dist.forEach(a=>plan.push({nome:null, tipo:pick(tipos), classe:pick(classes), bairro:pick(bairros), anamnese:a, demo:null}));
  const pdvs = plan.map((pl, i)=>{
    const nome = pl.nome || nomes[i+2] || ("PDV Demo "+(i+1));
    const tipo = pl.tipo, classe = pl.classe;
    const imagem = pick(["Tradicional","Moderno","Desleixado","Premium","Popular"]);
    const hlTotal = baseHL[tipo]*multClasse[classe]*(0.75+rnd()*0.55);
    const mix = mixCat[tipo];
    const hlCat = {}; for(const c in mix) hlCat[c]=hlTotal*mix[c];
    const fmt = mixFmt(tipo,classe);
    const hlCerv = hlCat["cerveja"];
    const baseT = {"A":3.4,"B":2.4,"C":1.5}[classe];
    const adjT = {"Premium":.8,"Moderno":.3,"Tradicional":0,"Popular":-.4,"Desleixado":-.6}[imagem]||0;
    const tp = Math.max(1,Math.min(4,Math.round(baseT+adjT)));
    const wBase = W_DEMO[nome] || W[tp];
    const w = {}; CERVEJAS.forEach(m=>w[m]=(wBase[m]||0)*(0.7+rnd()*0.6));
    const sw = CERVEJAS.reduce((a,m)=>a+w[m],0);
    const hlMarca={}; CERVEJAS.forEach(m=>hlMarca[m]=hlCerv*w[m]/sw);
    const pmult = {"A":1.18,"B":1.0,"C":0.88}[classe];
    const preco={}; CERVEJAS.forEach(m=>preco[m]=r2(PORT[m].preco*pmult*(0.95+rnd()*0.13)));
    const recMarca={}, cxMarca={};
    CERVEJAS.forEach(m=>{
      let rec=0, cx=0;
      for(const fk in fmt){
        const hlF=hlMarca[m]*fmt[fk];
        const un=hlF*1e5/PARAMS.ml_por_unidade[fk];
        cx+=un/PARAMS.fatores_caixa[fk];
        rec+=un*preco[m]*(fk==="garrafa_600"?PARAMS.preco_garrafa600_mult:1);
      }
      recMarca[m]=r2(rec); cxMarca[m]=r1(cx);
    });
    const recTotal = r2(CERVEJAS.reduce((a,m)=>a+recMarca[m],0));
    const hlAmbev = r1(AMBEV.reduce((a,m)=>a+hlMarca[m],0));
    const recAmbev = r2(AMBEV.reduce((a,m)=>a+recMarca[m],0));
    const marcaTop = AMBEV.reduce((best,m)=>hlMarca[m]>hlMarca[best]?m:best, AMBEV[0]);
    const bsv = recTotal? r2(recAmbev/recTotal*100):0;
    const serieAmbev = {}; const serieRecAmbev = {};
    meses.forEach((mes,k)=>{ const esc=(saz[tipo]&&saz[tipo][k])||1;
      serieAmbev[mes]=r1(hlAmbev*esc); serieRecAmbev[mes]=r2(recAmbev*esc); });
    const medido = pl.anamnese==="completa";
    const geladeiras = tipo==="Distribuidora"? 10+Math.floor(rnd()*15) : 4+Math.floor(rnd()*11);
    const serieMarca={}, serieTotal={};
    meses.forEach((mes,k)=>{
      const esc = (saz[tipo]&&saz[tipo][k])||1;
      serieMarca[mes]={}; CERVEJAS.forEach(m=>serieMarca[mes][m]={hl:r1(hlMarca[m]*esc), rec:r2(recMarca[m]*esc)});
      const somaHl=Object.values(serieMarca[mes]).reduce((a,d)=>a+d.hl,0);
      const alvoHl=r1(hlCerv*esc); const maior=AMBEV.reduce((b,m)=>hlMarca[m]>hlMarca[b]?m:b,AMBEV[0]);
      serieMarca[mes][maior].hl=r1(serieMarca[mes][maior].hl+(alvoHl-somaHl));
      const somaRec=Object.values(serieMarca[mes]).reduce((a,d)=>a+d.rec,0);
      const alvoRec=r2(recTotal*esc);
      serieMarca[mes][maior].rec=r2(serieMarca[mes][maior].rec+(alvoRec-somaRec));
      serieTotal[mes]={hl:r1(hlTotal*esc), rec:r2(recTotal*esc), hl_cerv:alvoHl, rec_cerv:alvoRec};
    });
    return {
      id:"PDV"+String(i+1).padStart(3,"0"), nome, tipo, classe, bairro:pl.bairro,
      endereco:"Rua "+pick(["das Flores","Principal","XV de Novembro","São João","do Comércio"])+", "+(10+Math.floor(rnd()*990))+" - "+pl.bairro,
      visitador:"Rep "+pick(["Ana","Bruno","Carla","Diego"]),
      freq_visita: rnd()<.6?"Semanal":"Quinzenal", tempo_visita_min: pick([30,40,45,60]),
      dias_sem_comprar: 1+Math.floor(rnd()*40),
      hl_total_mes:r1(hlTotal), hl_cerveja_mes:r1(hlCerv), hl_refri_mes:r1(hlCat["refrigerante"]),
      hl_energetico_mes:r1(hlCat["energético"]), hl_agua_mes:r1(hlCat["água"]),
      share_ambev:r2(hlCerv?hlAmbev/hlCerv*100:0), hl_ambev_mes:hlAmbev,
      bsv:r2(recTotal?recAmbev/recTotal*100:0),
      receita_total_mes:recTotal, marca_top:marcaTop,
      preco, mix_formato:fmt, caixas_ambev_mes:r1(AMBEV.reduce((a,m)=>a+cxMarca[m],0)),
      serie_ambev:serieAmbev, serie_rec_ambev:serieRecAmbev,
      share_geladeira:r2(Math.min(.95,Math.max(.05,(hlCerv?hlAmbev/hlCerv:0)*(0.8+rnd()*0.45)))*100),
      geladeiras_porte:geladeiras,
      ruptura_mensal_pct:r1(Math.min(35,Math.max(0,8+gauss()*6))),
      demanda_espontanea:Math.min(5,Math.max(1,Math.round(1+(hlCerv?hlAmbev/hlCerv:0)*8+(rnd()-0.5)*1.4))),
      ponto_extra: rnd()<((hlCerv?hlAmbev/hlCerv:0)>.35?0.25:0.08), cold_door: rnd()<((hlCerv?hlAmbev/hlCerv:0)>.3?0.7:0.35),
      frente_gondola: rnd()<((hlCerv?hlAmbev/hlCerv:0)>.3?0.6:0.25),
      porta_garrafas: (tipo!=="Mercado"&&tipo!=="Distribuidora")&&rnd()<0.5,
      mesas: {"Bar":5+Math.floor(rnd()*14),"Restaurante":15+Math.floor(rnd()*46),"Lanchonete":6+Math.floor(rnd()*15),
              "Casa Noturna":10+Math.floor(rnd()*21),"Distribuidora":0,"Mercado":0}[tipo],
      fluxo: pick(["Baixo","Médio","Médio","Alto"]),
      imagem, publico: {"Bar":"Local","Restaurante":"Famílias","Casa Noturna":"Jovem","Lanchonete":"Trabalhador","Distribuidora":"Revenda","Mercado":"Local"}[tipo],
      percepcao_marca: pick(["Boa","Média","Excelente","Desconhecida"]),
      relacao: pick(["Excelente","Boa","Neutra","Tensa"]),
      decisor: pick(["Dono","Gerente","Sócio","Filho do dono"]),
      observacoes: pick(["","","","Prefere negociar no fim do mês.","Reclama do prazo de entrega.","Quer ponto extra na entrada.","Só compra com nota fiscal separada.","Interessado em evento no sábado."]),
      conc_acao: pick(["Nenhuma","Degustação mensal","Brindes","Preço agressivo","Ponto extra pago","Vendedor exclusivo","Contrato de exclusividade"]),
      pagto: pick(["À vista","7 dias","14 dias","21 dias","30 dias"]),
      limite_credito: r2(hlTotal*(300+rnd()*600)), inadimplencia: r1(Math.max(0,4+gauss()*3)),
      anamnese: pl.anamnese, demo: pl.demo,
      pot_med:r1(hlTotal), pot_inf:r1(hlTotal*(medido?0.9:0.75)), pot_sup:r1(hlTotal*(medido?1.1:1.35)),
      origem_potencial: medido?"coletado":"estimado",
      serie_marca:serieMarca, serie_total:serieTotal
    };
  });
  return {
    ficticio:true, gerado_em:new Date().toISOString().slice(0,10), moeda:"BRL", meses,
    marcas: CERVEJAS.map(m=>[m,TIER_NOME[PORT[m].tier],PORT[m].preco,PORT[m].papel,"cerveja",PORT[m].dono])
      .concat(OUTRAS_CATEGORIAS.map(x=>x)),
    pdvs,
    aviso:"Base mock gerada localmente — DADOS FICTÍCIOS para demonstração."
  };
}
function hlPorCaixa(fmt){ return PARAMS.fatores_caixa[fmt] * PARAMS.ml_por_unidade[fmt] / 1e6; }
function pct(a,b){ return b? a/b*100 : 0; }
function mediana(arr){
  if(!arr.length) return null;
  const s=[...arr].sort((a,b)=>a-b), m=Math.floor(s.length/2);
  return s.length%2 ? s[m] : (s[m-1]+s[m])/2;
}
function scoreConfianca(p){
  return Math.min(100, Math.max(5, {completa:92, parcial:58, pendente:20}[p.anamnese] || 20));
}
function potencialTexto(p){
  if(p.origem_potencial==="coletado") return p.pot_med.toFixed(1)+" HL/mês";
  return p.pot_inf.toFixed(0)+"–"+p.pot_sup.toFixed(0)+" HL/mês";
}
function tierPDV(p){
  const base={"A":3.4,"B":2.4,"C":1.5}[p.classe]||2.4;
  const adj={"Premium":.8,"Moderno":.3,"Tradicional":0,"Popular":-.4,"Desleixado":-.6}[p.imagem]||0;
  return Math.max(1,Math.min(4,Math.round(base+adj)));
}
function hlMarca(p,m,mes){ const d=(p.serie_marca[mes||BASE.meses[5]]||{})[m]; return d?d.hl:0; }
function recMarca(p,m,mes){ const d=(p.serie_marca[mes||BASE.meses[5]]||{})[m]; return d?d.rec:0; }
function hlCervMes(p,mes){ mes=mes||BASE.meses[5]; return (p.serie_total[mes]&&p.serie_total[mes].hl_cerv!=null)? p.serie_total[mes].hl_cerv : p.hl_cerveja_mes; }
function hlTotalMes(p,mes){ mes=mes||BASE.meses[5]; return (p.serie_total[mes]&&p.serie_total[mes].hl!=null)? p.serie_total[mes].hl : p.hl_total_mes; }
function recTotalMes(p,mes){ mes=mes||BASE.meses[5]; return (p.serie_total[mes]&&p.serie_total[mes].rec!=null)? p.serie_total[mes].rec : p.receita_total_mes; }
function shareMarca(p,m){ const tot=hlCervMes(p); return tot? hlMarca(p,m)/tot*100 : 0; }
function shareTier(p,t){ return CERVEJAS.filter(m=>PORT[m].tier===t).reduce((a,m)=>a+shareMarca(p,m),0); }
function ambevHL(p,mes){ mes=mes||BASE.meses[5];
  return (p.serie_ambev&&p.serie_ambev[mes]!=null)? p.serie_ambev[mes] : AMBEV.reduce((a,m)=>a+hlMarca(p,m,mes),0); }
function ambevRec(p,mes){ mes=mes||BASE.meses[5];
  return (p.serie_rec_ambev&&p.serie_rec_ambev[mes]!=null)? p.serie_rec_ambev[mes] : AMBEV.reduce((a,m)=>a+recMarca(p,m,mes),0); }
function ambevShare(p,mes){ return pct(ambevHL(p,mes), hlCervMes(p,mes)); }
function bsvPDV(p,mes){ return pct(ambevRec(p,mes), recTotalMes(p,mes)); }
function ambevShareMes(p,mes){ return pct(ambevHL(p,mes), hlCervMes(p,mes)); }
function fairShareTier(p,t){
  const grupos=[
    {nome:"tipo+classe", f:x=>x.tipo===p.tipo&&x.classe===p.classe},
    {nome:"tipo", f:x=>x.tipo===p.tipo},
    {nome:"classe", f:x=>x.classe===p.classe},
    {nome:"território", f:()=>true}
  ];
  const pares=BASE.pdvs.filter(x=>x.anamnese==="completa"&&x.id!==p.id);
  for(const g of grupos){
    const a=pares.filter(g.f).map(x=>shareTier(x,t));
    if(a.length>=PARAMS.fair_share_min_amostra) return {v:mediana(a), n:a.length, grupo:g.nome, ok:true};
  }
  const tudo=pares.map(x=>shareTier(x,t));
  return {v:tudo.length?mediana(tudo):null, n:tudo.length, grupo:"território", ok:tudo.length>=PARAMS.fair_share_min_amostra};
}
function marcaAlvo(p){
  const tp=tierPDV(p);
  const cands=AMBEV.map(m=>{
    const t=PORT[m].tier, cur=shareMarca(p,m), fs=fairShareTier(p,t);
    const fit=1-Math.abs(t-tp)*0.35;
    const head=fs.v!=null? Math.max(0,fs.v-cur):0;
    const pres=hlMarca(p,m)>0?1:0.55;
    const bonus=(PORT[m].papel==="valor"&&tp>=3)?0.6:0;
    return {m,t,cur,fs,fit,head,pres,score:head*1.2+fit*8+pres*1.5+bonus};
  }).sort((a,b)=>b.score-a.score);
  const alvo=cands[0];
  const topAmbev=AMBEV.map(m=>({m,hl:hlMarca(p,m)})).sort((a,b)=>b.hl-a.hl)[0];
  const papeis=AMBEV.filter(m=>m!==alvo.m).map(m=>{
    const t=PORT[m].tier;
    let papel = m===topAmbev.m?"defender"
      : Math.abs(t-alvo.t)===1?"ponte de preço"
      : (t>alvo.t&&tp>=3)?"puxar valor":"manter";
    if(hlMarca(p,m)===0) papel="sem presença — avaliar entrada";
    return {m,papel};
  });
  const concDominante=CONCORRENTES.map(m=>({m,sh:shareMarca(p,m)})).sort((a,b)=>b.sh-a.sh)[0];
  return {alvo, papeis, topAmbev, concDominante, tp};
}
function execucaoScore(p){
  const itens=[p.ponto_extra,p.cold_door,p.frente_gondola];
  const ok=itens.filter(Boolean).length+(p.share_geladeira>=PARAMS.meta_share_geladeira?1:0)
    +(p.ruptura_mensal_pct<=PARAMS.meta_ruptura_max?1:0);
  return Math.round(ok/5*100);
}
function veredito(p){
  const ma=marcaAlvo(p), a=ma.alvo;
  const gapPct=a.fs.v!=null? a.fs.v-a.cur : null;
  const hl=gapPct!=null? Math.max(0,gapPct/100*p.hl_cerveja_mes):0;
  const caixas=hl/hlPorCaixa("lata_350");
  const motivos=[],contra=[];
  if(gapPct!=null&&gapPct>2) motivos.push("tier "+TIER_NOME[a.t]+" tem fair share "+a.fs.v.toFixed(1)+"% vs "+a.cur.toFixed(1)+"% atual (mediana de "+a.fs.n+" PDVs por "+a.fs.grupo+") → gap "+hl.toFixed(1)+" HL/mês (≈"+caixas.toFixed(0)+" caixas)");
  if(hlMarca(p,a.m)===0) motivos.push(a.m+" não está no cardápio — oportunidade de distribuição com encaixe de posicionamento (tier "+TIER_NOME[a.t]+" em PDV "+TIER_NOME[ma.tp]+")");
  if(ma.topAmbev && PORT[ma.topAmbev.m].tier-ma.tp>=2 && shareMarca(p,ma.topAmbev.m)>25)
    motivos.push(ma.topAmbev.m+" ("+TIER_NOME[PORT[ma.topAmbev.m].tier]+") domina num PDV de posicionamento "+TIER_NOME[ma.tp]+" — desalinho preço×público: usar "+a.m+" para volume e "+ma.topAmbev.m+" em balde/promoção");
  if(p.share_geladeira<ambevShare(p)-3) motivos.push("geladeira sub-representada ("+p.share_geladeira.toFixed(0)+"% vs share Ambev "+ambevShare(p).toFixed(0)+"%)");
  if(p.ruptura_mensal_pct>PARAMS.meta_ruptura_max) motivos.push("ruptura "+p.ruptura_mensal_pct.toFixed(1)+"% ao mês > meta "+PARAMS.meta_ruptura_max+"%");
  if(p.demanda_espontanea<=2) motivos.push("demanda espontânea baixa ("+p.demanda_espontanea+"/5) — marca não pedida sem oferta");
  if(!p.ponto_extra) motivos.push("sem ponto extra");
  if(!p.cold_door) motivos.push("sem cerveja gelada garantida");
  if(p.bsv<PARAMS.meta_bsv) contra.push("BSV "+p.bsv.toFixed(1)+"% < meta "+PARAMS.meta_bsv+"% — mix puxado para preço");
  if(ma.concDominante.sh>35) contra.push(ma.concDominante.m+" pressiona com "+ma.concDominante.sh.toFixed(0)+"% do volume de cerveja");
  const precoAlvo=p.preco[a.m];
  const concMesmoTier=CONCORRENTES.filter(c=>PORT[c].tier===a.t).map(c=>p.preco[c]).filter(x=>x>0);
  if(precoAlvo&&concMesmoTier.length){
    const ref=Math.min(...concMesmoTier);
    if(precoAlvo>ref*1.3) contra.push("preço da "+a.m+" (R$ "+precoAlvo.toFixed(2)+") >1,3× concorrente do mesmo tier (R$ "+ref.toFixed(2)+") — barreira no balcão");
  }
  let decisao;
  if(gapPct!=null&&gapPct>2) decisao="TRABALHAR "+a.m.toUpperCase();
  else if(ma.concDominante.sh>35) decisao="DEFENDER "+(ma.topAmbev?ma.topAmbev.m.toUpperCase():"PORTFÓLIO");
  else decisao="CONSOLIDAR MIX";
  return {ma, decisao, motivos, contra,
    gap:{fs:a.fs.v, gapPct, hl, caixas, ok:a.fs.ok, n:a.fs.n, grupo:a.fs.grupo,
         aviso:a.fs.ok?null:"Amostra fraca ("+a.fs.n+" pares) — fair share indicativo."},
    exec:execucaoScore(p)};
}
function acaoDoDia(p){
  const v=veredito(p), a=v.ma.alvo, m=a.m, tp=v.ma.tp;
  if(p.anamnese!=="completa")
    return {titulo:"Completar anamnese ("+p.anamnese+")",
      justificativa:"dado incompleto trava o fair share e a escolha da marca-alvo — coleta primeiro", tempo:15};
  if(hlMarca(p,m)===0)
    return {titulo:"Colocar "+m+" no cardápio — entrada negociada com o decisor",
      justificativa:"encaixe de posicionamento: "+TIER_NOME[a.t]+" em PDV "+TIER_NOME[tp]+"; sem presença hoje", tempo:15};
  if(p.ruptura_mensal_pct>PARAMS.meta_ruptura_max)
    return {titulo:"Acertar frequência de pedido de "+m+" — ruptura "+p.ruptura_mensal_pct.toFixed(1)+"%",
      justificativa:"volume que some por falta de produto; meta máx. "+PARAMS.meta_ruptura_max+"%", tempo:10};
  if(p.share_geladeira<ambevShare(p)-3)
    return {titulo:"Negociar espaço de geladeira para "+m+" (geladeira "+p.share_geladeira.toFixed(0)+"% vs share Ambev "+ambevShare(p).toFixed(0)+"%)",
      justificativa:"exposição abaixo do share — geladeira é o primeiro driver de share no PDV", tempo:10};
  if(!p.cold_door)
    return {titulo:"Garantir cerveja gelada (cold door) do portfólio",
      justificativa:"sem gelada não tem venda por impulso — pré-requisito de consumo no local", tempo:5};
  if(!p.ponto_extra && p.fluxo==="Alto")
    return {titulo:"Fachada + ponto extra de "+m+" na entrada",
      justificativa:"fluxo alto do PDV multiplica o retorno de exposição da marca-alvo", tempo:15};
  if(!p.ponto_extra)
    return {titulo:"Ponto extra de "+m+"",
      justificativa:"exposição adicional com retorno direto em share", tempo:10};
  if(v.gap.gapPct!=null&&v.gap.gapPct>2)
    return {titulo:"Balde promocional de "+m+" no pico de fluxo — meta +"+Math.max(1,Math.round(v.gap.caixas))+" caixas/mês",
      justificativa:"gap vs fair share do tier: "+v.gap.hl.toFixed(1)+" HL/mês; balde acelera volume no consumidor certo", tempo:10};
  if(tp>=3&&p.bsv<PARAMS.meta_bsv)
    return {titulo:"Subir mix: "+m+" com posição destacada no cardápio e preço posicionado",
      justificativa:"PDV "+TIER_NOME[tp]+" suporta premium — BSV "+p.bsv.toFixed(1)+"% < meta "+PARAMS.meta_bsv+"%", tempo:10};
  return {titulo:"Consolidar "+m+": revisar preço de balcão e validade na geladeira",
    justificativa:"execução em dia — foco em defender share e valorizar mix", tempo:10};
}
function disputaEspaco(p){
  const cats=[
    {c:"cerveja", hl:p.hl_cerveja_mes},
    {c:"refrigerante", hl:p.hl_refri_mes},
    {c:"energético", hl:p.hl_energetico_mes},
    {c:"água", hl:p.hl_agua_mes}
  ];
  const total=cats.reduce((a,x)=>a+x.hl,0);
  cats.forEach(x=>x.fr=pct(x.hl,total));
  const fr=cats[0].fr;
  const leitura=fr>=60?"cerveja domina o espaço — defesa é prioridade"
    : fr>=40?"cerveja disputa com outras categorias — espaço a conquistar"
    : "outras categorias dominam o espaço — cerveja é oportunidade de entrada";
  return {cats, leitura};
}
function tendencia(p){
  const ms=BASE.meses, cur=ms[5], ant=ms[4];
  const sA=ambevShareMes(p,cur), sAnt=ambevShareMes(p,ant);
  const delta=sAnt? sA-sAnt : 0;
  return {delta, txt:(delta>=0?"+":"")+delta.toFixed(1)+" p.p. m/m", ajustado:!!PARAMS.sazonalidade[p.tipo]};
}
function caixasDeHL(hl,fmt){
  let cx=0; for(const fk in fmt){ const un=hl*fmt[fk]*1e5/PARAMS.ml_por_unidade[fk]; cx+=un/PARAMS.fatores_caixa[fk]; }
  return cx;
}
const LS_FEED = "brandfit_feed_v1";
let FEED = { url:"", auto:true, ultimaColeta:null, fonte:"mock" };
try { const f=JSON.parse(localStorage.getItem(LS_FEED)); if(f) FEED=Object.assign(FEED,f); } catch(e){}
function salvarFeed(){ localStorage.setItem(LS_FEED, JSON.stringify(FEED)); }
function validarBase(b){
  const erros=[];
  if(!b || !Array.isArray(b.pdvs) || !b.pdvs.length) erros.push("sem PDVs");
  if(!b.meses || !Array.isArray(b.meses) || b.meses.length<2) erros.push("série mensal ausente");
  if(b.pdvs) b.pdvs.forEach((p,i)=>{
    if(!p.id) erros.push("PDV "+(i+1)+" sem id");
    if(!(p.hl_total_mes>=0)) erros.push(p.nome||p.id+": HL total inválido");
    if(p.hl_cerveja_mes!=null && p.hl_cerveja_mes>p.hl_total_mes*1.01) erros.push(p.nome||p.id+": HL cerveja > HL total");
  });
  return erros;
}
function hidratarBase(b){
  if(!b.marca_foco) b.marca_foco="Brahma";
  b.cervejas = b.cervejas || CERVEJAS;
  b.marcas = b.marcas || CERVEJAS.map(m=>[m,TIER_NOME[PORT[m].tier],PORT[m].preco,PORT[m].papel,"cerveja",PORT[m].dono]);
  const mesU = b.meses[b.meses.length-1];
  b.pdvs.forEach(p=>{
    if(p.serie_marca && p.serie_marca[mesU]){
      p.share_ambev = +ambevShare(p,mesU).toFixed(2);
      p.bsv = +bsvPDV(p,mesU).toFixed(2);
      p.marca_top = AMBEV.reduce((bt,m)=>hlMarca(p,m,mesU)>hlMarca(p,bt,mesU)?m:bt, AMBEV[0]);
      p.caixas_ambev_mes = +CERVEJAS.reduce((a,m)=>a+caixasDeHL(hlMarca(p,m,mesU),p.mix_formato||{lata_350:1}),0).toFixed(1);
      p.serie_ambev = p.serie_ambev || {}; p.serie_rec_ambev = p.serie_rec_ambev || {};
      b.meses.forEach(mes=>{ p.serie_ambev[mes]=+ambevHL(p,mes).toFixed(1); p.serie_rec_ambev[mes]=+ambevRec(p,mes).toFixed(2); });
    }
    if(p.pot_med==null){ p.pot_med=p.hl_total_mes; p.pot_inf=+(p.hl_total_mes*0.75).toFixed(1); p.pot_sup=+(p.hl_total_mes*1.35).toFixed(1); p.origem_potencial="estimado"; }
    if(p.anamnese==null) p.anamnese="parcial";
    if(p.coletado_em==null) p.coletado_em=b.gerado_em||null;
  });
  return b;
}
function publicarBase(b, fonte){
  const erros = validarBase(b);
  if(erros.length) return {ok:false, erros};
  b = hidratarBase(b);
  b.ficticio = (fonte==="mock");
  if(b.ficticio!==false) b.ficticio = fonte==="mock";
  BASE = b; FEED.fonte=fonte; FEED.ultimaColeta=new Date().toISOString();
  salvarBase(); salvarFeed();
  document.getElementById("badge-mock").style.display = BASE.ficticio ? "" : "none";
  return {ok:true};
}
async function puxarBaseRemota(url){
  const r = await fetch(url, {credentials:"include"});
  if(!r.ok) throw new Error("HTTP "+r.status);
  const txt = await r.text();
  let b;
  try { b = JSON.parse(txt); }
  catch(e){ b = csvParaBase(txt); }
  return b;
}
function csvParaBase(txt){
  const linhas = txt.split(/\r?\n/).filter(l=>l.trim());
  const head = linhas[0].split(";").map(s=>s.trim());
  const idx = c=>head.indexOf(c);
  const pds = linhas.slice(1).map(l=>{
    const c=l.split(";"); const g=(k,d)=>{ const i=idx(k); return i>=0&&c[i]!==undefined&&c[i]!==""? c[i]:d; };
    const preco={}; CERVEJAS.forEach(m=>preco[m]=PORT[m].preco);
    ["Skol","Brahma","Heineken"].forEach(k=>{ const v=+g("preco_"+k,0); if(v) preco[k]=v; });
    return { id:g("pdv_id","PDV"+Math.random().toString(36).slice(2,7)), nome:g("nome_pdv","PDV sem nome"),
      tipo:g("tipo","Bar"), classe:g("classe","B"), bairro:g("bairro",""), endereco:g("endereco",""),
      visitador:g("visitador",""), freq_visita:g("freq_visita","Semanal"), tempo_visita_min:+g("tempo_visita_min",40),
      dias_sem_comprar:+g("dias_sem_comprar",0), hl_total_mes:+g("hl_total_mes",0), hl_cerveja_mes:+g("hl_cerveja_mes",0),
      hl_refri_mes:+g("hl_refri_mes",0), hl_energetico_mes:+g("hl_energetico_mes",0), hl_agua_mes:+g("hl_agua_mes",0),
      share_ambev:+g("share_ambev_pct",0), bsv:+g("bsv_pct",0), receita_total_mes:+g("receita_total_mes",0),
      marca_top:g("marca_top",""), preco,
      share_geladeira:+g("share_geladeira_pct",0), geladeiras_porte:+g("geladeiras_porte",0),
      ruptura_mensal_pct:+g("ruptura_mensal_pct",0), demanda_espontanea:+g("demanda_espontanea_1a5",1),
      ponto_extra:g("ponto_extra","0")==="1", cold_door:g("cold_door","0")==="1", frente_gondola:g("frente_gondola","0")==="1",
      porta_garrafas:g("porta_garrafas","0")==="1", mesas:+g("mesas",0), fluxo:g("fluxo","Médio"),
      imagem:g("imagem","Tradicional"), publico:g("publico",""), percepcao_marca:g("percepcao_marca",""),
      relacao:g("relacao",""), decisor:g("decisor",""), observacoes:g("observacoes",""),
      conc_acao:g("concorrente_acao","Nenhuma"), pagto:g("pagto",""), limite_credito:+g("limite_credito",0),
      inadimplencia:+g("inadimplencia_pct",0), pot_inf:+g("potencial_inf",0), pot_sup:+g("potencial_sup",0),
      pot_med:+g("potencial_med",0), origem_potencial:g("origem_potencial","estimado"),
      anamnese:g("anamnese_status","parcial"), demo:g("demo","")||null, coletado_em:g("coletado_em",null) };
  });
  return {gerado_em:new Date().toISOString().slice(0,10), meses:BASE?BASE.meses:["2026-05","2026-06","2026-07","2026-08","2026-09","2026-10"], pdvs:pds};
}
function rodarMotor(){
  const t0=performance.now();
  const r = publicarBase(BASE, FEED.fonte||"mock");
  if(!r.ok) return r;
  ESTADO.ordemHoje=null; ESTADO.visitas=ESTADO.visitas||{};
  salvarEstado();
  return {ok:true, ms:Math.round(performance.now()-t0), pdvs:BASE.pdvs.length};
}
function frescorDado(p){
  if(!p.coletado_em) return {estado:"sem-data", cor:"y", txt:"sem data de coleta"};
  const dias = Math.round((Date.now()-new Date(p.coletado_em))/864e5);
  if(dias<=30) return {estado:"fresco", cor:"g", txt:dias+" d"};
  if(dias<=60) return {estado:"atencao", cor:"y", txt:dias+" d"};
  return {estado:"velho", cor:"r", txt:dias+" d"};
}
function premioValor(p,m){ return shareValorMarca(p,m)-shareMarca(p,m); }
function shareValorMarca(p,m){
  const mes=BASE.meses[5];
  const rec=recMarca(p,m,mes), recC=p.serie_total[mes]?(p.serie_total[mes].rec_cerv||p.serie_total[mes].rec):p.receita_total_mes;
  const hlC=hlCervMes(p,mes);
  return (recC&&hlC)? rec/recC*100 : 0;
}
function equityMarca(p,m){
  const sv=shareMarca(p,m), sr=shareValorMarca(p,m), de=p.demanda_espontanea/5;
  const gel=p.share_geladeira/100;
  return Math.round((sv*0.4+sr*0.3+de*100*0.2+gel*100*0.1));
}
function alertasGerente(){
  const out=[];
  BASE.pdvs.forEach(p=>{
    const fr=frescorDado(p);
    if(p.dias_sem_comprar>21) out.push({p, tipo:"rota", sev:"r", txt:p.nome+" — "+p.dias_sem_comprar+" dias sem comprar ("+p.visitador+")"});
    if(p.ruptura_mensal_pct>15) out.push({p, tipo:"ruptura", sev:"r", txt:p.nome+" — ruptura "+p.ruptura_mensal_pct.toFixed(1)+"% (meta ≤"+PARAMS.meta_ruptura_max+"%)"});
    if(p.inadimplencia>10) out.push({p, tipo:"crédito", sev:"y", txt:p.nome+" — inadimplência "+p.inadimplencia.toFixed(1)+"% (limite "+fmtBRL(p.limite_credito)+")"});
    if(fr.estado==="velho") out.push({p, tipo:"dado", sev:"y", txt:p.nome+" — coleta velha ("+fr.txt+") — refazer anamnese"});
    if(p.anamnese==="pendente") out.push({p, tipo:"coleta", sev:"y", txt:p.nome+" — anamnese pendente, fair share travado"});
  });
  const ordem={r:0,y:1};
  return out.sort((a,b)=>ordem[a.sev]-ordem[b.sev]);
}