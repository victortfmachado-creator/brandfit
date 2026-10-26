/* =====================================================================
   BrandFit v4 — MOTOR DE DESENVOLVIMENTO DE MARCA
   Lê o que o rep digita (qualitativo) + dados do PDV (quantitativo)
   e traduz ao vivo em diretrizes por marca: foco, suporte, defesa, conter.
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- léxico qualitativo: o que o rep digita -> sinal estratégico ---------- */
const QUAL_LEX = [
  {re:/pre[çc]o|barat|desconto|caro|gast/i, sinal:"preço",
   leitura:"Preço é o tema no balcão",
   ajuste:"não entrar em guerra de preço — atacar com ativação (balde no pico) e serviço (frequência de pedido)"},
  {re:/geladeir|fridge|gelad|refriger|freezer/i, sinal:"fridge",
   leitura:"Espaço frio em discussão",
   ajuste:"negociar porta de fridge com volume garantido — share de geladeira ≥ share de volume"},
  {re:/balde|degusta|evento|festa|promo|amostr/i, sinal:"ativação",
   leitura:"PDV aceita ativação",
   ajuste:"usar balde/degustação no pico para empurrar a marca foco"},
  {re:/exclusiv|contrato/i, sinal:"exclusividade",
   leitura:"Concorrente tenta exclusividade",
   ajuste:"defender com portfólio completo + crédito, nunca com preço"},
  {re:/inadimpl|fiado|prazo|cr[eé]dit|pagament/i, sinal:"crédito",
   leitura:"Prazo/crédito é sensível",
   ajuste:"usar política de crédito como moeda de negociação por espaço frio"},
  {re:/entrega|atras|ruptura|falt|sumiu|esgot/i, sinal:"serviço",
   leitura:"Dor de serviço/abastecimento",
   ajuste:"frequência de pedido e ruptura zero viram argumento de venda"},
  {re:/heineken|itaipava|amstel|crystal|lokal|petra|sol|concorr|outro fornec/i, sinal:"concorrência",
   leitura:"Concorrência ativa no PDV",
   ajuste:"responder com marca do mesmo tier (ver aba Concorrência)"},
  {re:/dono|gerente|gosta|prefere|rela[çc]|convers|confia/i, sinal:"relação",
   leitura:"Relação com o decisor é alavanca",
   ajuste:"usar a relação para pedir 1 mudança concreta por visita"},
  {re:/ponto extra|porta|fachada|card[áa]pio|menu|lousa/i, sinal:"visibilidade",
   leitura:"Espaço de visibilidade disponível",
   ajuste:"pedir ponto extra/fachada/cardápio em troca de serviço ou ativação"},
  {re:/refrigerante|[áa]gua|energ[eé]tic|mix|destilad/i, sinal:"mix",
   leitura:"Mix além de cerveja em jogo",
   ajuste:"vender portfólio completo (refri/água/energético) para aumentar a conta e a frequência"}
];

/* lê as notas do rep (digitadas) e devolve os sinais detectados */
function lerNotas(p){
  const txt=(ESTADO.notasPDV&&ESTADO.notasPDV[p.id])||"";
  if(!txt||txt.length<3) return [];
  return QUAL_LEX.filter(x=>x.re.test(txt));
}

/* papel de cada marca no plano de desenvolvimento */
function papelDe(p,m){
  const foco=marcaAlvo(p).alvo.m;
  const d=(PORT[m]||PORT_V3[m]);
  if(m===foco) return {papel:"FOCO", icone:"🎯"};
  if(d.dono==="ambev"){
    const ranks=AMBEV.filter(x=>shareMarca(p,x)>0.05).sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
    if(ranks[1]===m) return {papel:"SUPORTE VOLUME", icone:"🛡️"};
    if(ranks[2]===m) return {papel:"PUXA VALOR", icone:"💎"};
    return {papel:"MANTER", icone:"✅"};
  }
  const ranks=CONC_V3.filter(x=>shareMarca(p,x)>0.05).sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
  if(ranks[0]===m) return {papel:"CONTER", icone:"⚔️"};
  return {papel:"OBSERVAR", icone:"👁️"};
}

/* diretriz de uma marca: diagnóstico (dados) + ações (dados + qualitativo) + meta */
function diretrizMarca(p,m){
  const d=(PORT[m]||PORT_V3[m]), dono=d.dono, papel=papelDe(p,m);
  const cur=shareMarca(p,m), fs=fairShareTier(p,d.tier);
  const gap=fs.v!=null?+(fs.v-cur).toFixed(1):null;
  const sinais=lerNotas(p);
  const tem=s=>sinais.some(x=>x.sinal===s);
  const diag=[];
  if(cur>0) diag.push(cur.toFixed(1)+"% do volume");
  else diag.push("fora do cardápio");
  if(p.preco[m]) diag.push("R$ "+p.preco[m].toFixed(2));
  if(gap!=null&&gap>2) diag.push("gap "+gap.toFixed(1)+" p.p. vs fair share do tier");
  const acoes=[];
  if(dono==="ambev"){
    if(hlMarca(p,m)===0){
      acoes.push("Entrar no cardápio: encaixe "+TIER_NOME[d.tier]+" neste PDV "+TIER_NOME[tierPDV(p)]);
    } else if(p.share_geladeira<ambevShare(p)-3){
      acoes.push("Porta do fridge: geladeira "+p.share_geladeira.toFixed(0)+"% < share Ambev "+ambevShare(p).toFixed(0)+"%");
    } else if(gap!=null&&gap>2){
      acoes.push("Ativação no pico (balde) para fechar o gap de "+gap.toFixed(1)+" p.p.");
    } else {
      const conc=CONC_V3.filter(x=>(PORT[x]||PORT_V3[x]).tier===d.tier&&shareMarca(p,x)>0)
        .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a))[0];
      if(tem("preço")&&conc&&p.preco[m]&&p.preco[conc.m]&&p.preco[m]>p.preco[conc.m]*1.15){
        acoes.push("Reprecificar: R$ "+p.preco[m].toFixed(2)+" vs "+conc.m+" R$ "+p.preco[conc.m].toFixed(2));
      } else {
        acoes.push("Defender execução: gelada, validade, espaço na frente");
      }
    }
    if(tem("preço")) acoes.push("Preço em pauta: não entrar em guerra — ativação + serviço");
    if(tem("fridge")) acoes.push("Usar volume garantido como moeda pela porta do fridge");
    if(tem("serviço")) acoes.push("Frequência de pedido e ruptura zero como argumento");
    if(tem("crédito")) acoes.push("Crédito/prazo como moeda por espaço frio");
    if(tem("visibilidade")) acoes.push("Pedir ponto extra/cardápio em troca de ativação");
    if(tem("mix")) acoes.push("Completar a conta com refri/água/energético do portfólio");
  } else {
    const resp=AMBEV.filter(x=>(PORT[x]||PORT_V3[x]).tier===d.tier)
      .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a))[0];
    if(papel.papel==="CONTER"){
      acoes.push("Conter: responder com "+resp+" (mesmo tier) — "+ataqueMarca(p,resp).txt);
    } else {
      acoes.push("Monitorar: registrar preço e presença a cada visita");
    }
    if(tem("exclusividade")) acoes.push("Exclusividade em jogo: defender com portfólio + crédito, nunca com preço");
    if(tem("ativação")) acoes.push("Concorrente ativa: contra-ataque no mesmo dia da promoção");
    if(tem("preço")) acoes.push("Concorrente pressionou preço: manter valor — concorrer por execução");
  }
  const meta=(dono==="ambev"&&gap!=null&&gap>2)
    ? Math.max(1,Math.round(gap/100*p.hl_cerveja_mes/hlPorCaixa("lata_350")*PARAMS.fator_captura.balde))
    : null;
  return {m, dono, papel, cur, gap, diag, acoes, meta, sinais};
}

/* plano completo: foco + suportes + concorrentes, na ordem de leitura */
function planoMarca(p){
  const ativas=MARCAS_V3.filter(m=>shareMarca(p,m)>0.05||hlMarca(p,m)>0);
  const foco=marcaAlvo(p).alvo.m;
  const ambevAtivas=AMBEV.filter(m=>m!==foco&&ativas.includes(m))
    .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
  const concAtivas=CONC_V3.filter(m=>ativas.includes(m))
    .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
  const ordem=[foco].concat(ambevAtivas).concat(concAtivas).slice(0,10);
  return {foco, plano:ordem.map(m=>diretrizMarca(p,m)), sinais:lerNotas(p)};
}

/* frase pronta: a linha que o rep fala ao dono, ao vivo */
function frasePronta(p,m){
  const d=diretrizMarca(p,m);
  const nome=p.decisor||"dono";
  if(d.dono==="ambev"){
    if(d.papel.papel==="FOCO")
      return "Pro "+nome+": 'A "+m+" é a que combina com seu público — deixo ela gelada na porta do fridge e faço balde no sábado. Testa 1 mês comigo.'";
    if(d.papel.papel==="SUPORTE VOLUME")
      return "Pro "+nome+": 'A "+m+" é a que gira todo dia — garanto reposição semanal pra nunca faltar.'";
    if(d.papel.papel==="PUXA VALOR")
      return "Pro "+nome+": 'Pra quem pede algo especial, a "+m+" — rende mais por dose pra você.'";
    return "Pro "+nome+": 'A "+m+" continua no ponto — gelada e na frente.'";
  }
  if(d.papel.papel==="CONTER")
    return "Pro "+nome+": 'A "+m+" tá forte aí — deixa eu te mostrar a alternativa que rende mais por dose pra você.'";
  return "Observar "+m+": anotar preço e presença na visita.";
}