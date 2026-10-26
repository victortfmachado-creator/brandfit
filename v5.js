/* =====================================================================
   BrandFit v5 — MOTOR DE POSICIONAMENTO E ENCAIXE
   Parte do que o PDV COMPRA (mix de formatos) -> infere público e
   suscetibilidades (promo, cardápio, material) -> encaixa a marca Ambev
   certa usando o POSICIONAMENTO de cada marca. Roda sozinho.
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- posicionamento das marcas (o papel de cada uma no mercado) ---------- */
const POSICIONAMENTO = {
  "Skol":      {publico:"trabalhador, consumo diário", pdvTipo:["Bar","Lanchonete","Distribuidora"], classe:["C","B"], versatil:.45, papel:"volume puro — a cerveja do dia a dia", sinomimo:false},
  "Brahma":    {publico:"popular urbano, mesa cheia", pdvTipo:["Bar","Lanchonete","Restaurante"], classe:["C","B"], versatil:.55, papel:"volume com aceitação ampla", sinonimo:false},
  "Antarctica":{publico:"tradicional, boteco raiz", pdvTipo:["Bar","Lanchonete"], classe:["C","B"], versatil:.60, papel:"tradição — a cerveja do boteco de confiança", sinonimo:false},
  "Original":  {publico:"de esquina a chique — agrada todo mundo", pdvTipo:["Bar","Restaurante","Casa Noturna"], classe:["A","B","C"], versatil:.95, papel:"quase sinônimo de categoria — a 'cerveja' que todo mundo conhece", sinonimo:true},
  "Spaten":    {publico:"puro malte acessível, bares de encontro", pdvTipo:["Bar","Restaurante"], classe:["B","A"], versatil:.70, papel:"puro malte com preço de entrada", sinonimo:false},
  "Bohemia":   {publico:"que aprecia cerveja, conversa longa", pdvTipo:["Restaurante","Bar"], classe:["B","A"], versatil:.50, papel:"sabor — para quem escolhe cerveja", sinonimo:false},
  "Budweiser": {publico:"jovem, noite, música", pdvTipo:["Casa Noturna","Bar"], classe:["A","B"], versatil:.40, papel:"festa — a marca da noite", sinonimo:false},
  "Corona":    {publico:"premium descontraído, praia e rooftop", pdvTipo:["Bar","Restaurante","Casa Noturna"], classe:["A"], versatil:.35, papel:"premium refrescante — status com leveza", sinonimo:false},
  "Heineken":  {publico:"premium global, status", pdvTipo:["Bar","Restaurante","Casa Noturna"], classe:["A","B"], versatil:.60, papel:"concorrente premium de referência", sinonimo:false}
};

/* ---------- perfil do PDV a partir do que ele COMPRA ---------- */
function perfilPDV(p){
  const f=p.mix_formato||{};
  const tot=(f.retornavel_600||0)+(f.garrafa_600||0)+(f.long_neck_330||0)+(f.lata_350||0);
  const pct=k=>tot?((f[k]||0)/tot*100):0;
  const p600=pct("retornavel_600")+pct("garrafa_600");
  const pLata=pct("lata_350"), pLong=pct("long_neck_330");
  const refri=(p.hl_refri_mes||0)/Math.max(0.1,p.hl_total_mes||1)*100;
  /* público inferido */
  let publico, base;
  if(p600>=45){ publico="tradicional — bebe garrafa, mesa e conversa"; base="Skol"; }
  else if(pLong>=30){ publico="jovem urbano — long neck na mão"; base="Budweiser"; }
  else if(pLata>=40){ publico="prático — lata gelada, giro rápido"; base="Brahma"; }
  else { publico="misto — de tudo um pouco"; base="Original"; }
  if(p.classe==="A") publico+=" · poder aquisitivo alto";
  if(p.classe==="C") publico+=" · preço é decisivo";
  /* suscetibilidades (o que o PDV aceita negociar) */
  const susc=[];
  if(p600>=40) susc.push({t:"promoção de volume", porquê:"compra garrafa/litrão — responde a balde e caixa em promo"});
  if(pLata>=30) susc.push({t:"promoção de lata", porquê:"giro de lata alto — responde a preço e combo"});
  if(pLong>=25||p.classe==="A") susc.push({t:"negociação de cardápio", porquê:"long neck em cardápio — marca visível vale espaço"});
  if((p.mesas||0)>=8) susc.push({t:"material de ponto", porquê:p.mesas+" mesas — lousa/porta-menus mudam pedido na mesa"});
  if(refri>=20) susc.push({t:"mix além de cerveja", porquê:"refrigerante pesa "+refri.toFixed(0)+"% — conta completa aumenta frequência"});
  if(p.share_geladeira<ambevShare(p)-3) susc.push({t:"espaço frio", porquê:"geladeira "+p.share_geladeira.toFixed(0)+"% < share Ambev — porta do fridge é moeda"});
  return {publico, base, susc, p600, pLata, pLong, refri};
}

/* ---------- encaixe marca × PDV: score 0-100 com justificativa ---------- */
function fitMarca(p,m){
  const pos=POSICIONAMENTO[m]; if(!pos) return null;
  const d=(PORT[m]||PORT_V3[m]);
  const pf=perfilPDV(p);
  const cur=shareMarca(p,m), fs=fairShareTier(p,d.tier);
  const gap=fs.v!=null?+(fs.v-cur).toFixed(1):null;
  const comp=[];
  /* 1. afinidade com o público inferido do mix de compra (peso 25) */
  const afin = pf.base===m ? 25 : (pos.classe.includes(p.classe)&&pos.pdvTipo.includes(p.tipo) ? 15 : 5);
  comp.push({c:"afinidade de público", v:afin, txt:pf.base===m?"público inferido do mix ("+pf.publico.split(" —")[0]+") é o território natural da "+m:"público inferido puxa para "+pf.base+" — "+m+" entra por encaixe secundário"});
  /* 2. encaixe de classe (peso 25) */
  const cOk=pos.classe.includes(p.classe);
  comp.push({c:"classe", v:cOk?25:8, txt:cOk?"classe "+p.classe+" é território da "+m:"classe "+p.classe+" fora do núcleo da "+m});
  /* 3. encaixe de tipo (peso 20) */
  const tOk=pos.pdvTipo.includes(p.tipo);
  comp.push({c:"tipo de PDV", v:tOk?20:8, txt:tOk?p.tipo+" é casa da "+m:p.tipo+" não é o habitat natural da "+m});
  /* 4. headroom (peso 15) */
  comp.push({c:"espaço para crescer", v:gap!=null&&gap>2?15:(gap!=null&&gap>0?9:4), txt:gap!=null?"gap "+gap.toFixed(1)+" p.p. vs fair share do tier":"sem referência de fair share"});
  /* 5. presença atual (peso 10) — já existe? execução fica mais fácil */
  comp.push({c:"presença", v:cur>0?10:4, txt:cur>0?"já está no PDV ("+cur.toFixed(1)+"%) — só executar melhor":"precisa entrar no cardápio"});
  /* 6. versatilidade (peso 5) — desempate, não dominante */
  comp.push({c:"versatilidade", v:Math.round(pos.versatil*5), txt:pos.sinonimo?"quase sinônimo de categoria — encaixa em qualquer balcão":"versatilidade "+Math.round(pos.versatil*10)+"/10"});
  const score=comp.reduce((a,x)=>a+x.v,0);
  return {m, score, comp, pos, cur, gap, pf};
}

/* ranking de encaixe: as 5 melhores marcas Ambev para ESTE PDV */
function encaixePDV(p){
  const fits=AMBEV.filter(m=>POSICIONAMENTO[m]).map(m=>fitMarca(p,m)).filter(Boolean)
    .sort((a,b)=>b.score-a.score);
  return {top:fits.slice(0,5), pf:perfilPDV(p)};
}

/* leitura completa: o que o PDV compra -> quem encaixa -> como atacar */
function leituraPDV(p){
  const e=encaixePDV(p), foco=e.top[0];
  const concRef=CONC_V3.filter(x=>(PORT[x]||PORT_V3[x]).tier===(PORT[foco.m]||PORT_V3[foco.m]).tier&&shareMarca(p,x)>0)
    .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
  const escada=concRef.map(c=>({m:c.m, preco:p.preco[c]||0, sh:shareMarca(p,c)}));
  return {foco, top:e.top, pf:e.pf, escada};
}