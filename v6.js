/* =====================================================================
   BrandFit v6 — META DE MIX, ELEGIBILIDADE, PAPEL×ALVO, ALAVANCAGEM
   Correções do motor sobre v5:
   1. Encaixe vira decisão qualitativa (sem score 0-100 na frente)
   2. Meta de share por marca = quartil superior de PDVs comparáveis
   3. Meta desce ao formato, com gap em HL e caixas
   4. Portfólio elegível com filtro duro de estrutura
   5. Papel (foco/âncora/trava/margem/complemento) + alvo + tática
   6. Alavancagem: correlação com série (6 meses) ou associação rotulada
   7. Ação do dia gerada do plano de mix
   Catálogo parametrizável — CONFERIR COM PORTFÓLIO OFICIAL (editável no Config).
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- catálogo parametrizável (NÃO hardcoded: editável no Config) ---------- */
const CATALOGO = {
  aviso:"CATÁLOGO DE REFERÊNCIA — CONFERIR COM O PORTFÓLIO OFICIAL DA EMPRESA ANTES DE USAR EM CAMPO. Editável no Config.",
  skus:{
    litrao_1000:{nome:"litrão 1L retornável", hl_caixa:0.12, familia:"garrafa"},
    garrafa_1000_desc:{nome:"garrafa 1L descartável", hl_caixa:0.12, familia:"garrafa"},
    pet_1000:{nome:"PET 1L", hl_caixa:0.12, familia:"pet"},
    lata_473:{nome:"lata 473ml", hl_caixa:0.1135, familia:"lata"},
    chope_30:{nome:"barril 30L", hl_caixa:3.0, familia:"chope"},
    chope_50:{nome:"barril 50L", hl_caixa:5.0, familia:"chope"}
  },
  csd:{alvo:"Coca-Cola, Fanta, Kuat (sistema Coca)", resposta:"Guaraná Antarctica + linha Ambev na conta completa"}
};
/* aplica catálogo editado pelo usuário (Config) */
(function(){
  try{
    if(ESTADO.catalogoJSON){
      const j=JSON.parse(ESTADO.catalogoJSON);
      if(j.skus) Object.assign(CATALOGO.skus, j.skus);
      if(j.csd) Object.assign(CATALOGO.csd, j.csd);
      if(j.alvo_mapa) Object.assign(ALVO_MAPA, j.alvo_mapa);
    }
  }catch(e){ console.warn("catálogo do usuário inválido — usando padrão", e); }
})();

/* ---------- fatores, nomes e elegibilidade de formato ---------- */
function fatorCaixa(fk){
  if(PARAMS.fatores_caixa&&PARAMS.fatores_caixa[fk]) return PARAMS.fatores_caixa[fk];
  const s=CATALOGO.skus[fk]; return s?s.hl_caixa:null;
}
function nomeFormato(fk){
  const fixos={retornavel_600:"600ml retornável",garrafa_600:"600ml não-retornável",long_neck_330:"long neck 330",lata_350:"lata 350"};
  return fixos[fk]||(CATALOGO.skus[fk]?CATALOGO.skus[fk].nome:fk);
}
/* formatos que o PDV VENDE (mix > 0) */
function formatosVendidos(p){
  return Object.keys(p.mix_formato||{}).filter(fk=>p.mix_formato[fk]>0);
}
/* estrutura física do PDV (mock: geladeiras; chopeira não registrada) */
function estruturaDe(p){
  return {geladeira:(p.geladeiras_porte||0)>0, chopeira:false, balcao:p.tipo!=="Mercado"};
}
function formatoElegivel(p,fk){
  if((p.mix_formato||{})[fk]>0) return {ok:true, motivo:"vende"};
  const e=estruturaDe(p);
  const fam=(CATALOGO.skus[fk]&&CATALOGO.skus[fk].familia)||"";
  if(fam==="chope") return {ok:false, motivo:"sem chopeira registrada"};
  if(fk==="long_neck_330"||fk==="lata_350"||fk==="lata_473") return e.geladeira?{ok:true, motivo:"tem geladeira — oportunidade de entrada"}:{ok:false, motivo:"sem geladeira para resfriar"};
  if(fam==="garrafa") return e.balcao?{ok:true, motivo:"tem balcão — oportunidade de entrada"}:{ok:false, motivo:"sem espaço de balcão"};
  return {ok:true, motivo:"sem restrição registrada"};
}

/* ---------- mapa de alvo por formato (parametrizável) ---------- */
const ALVO_MAPA = {
  litrao_1000:{alvo:["Crystal","Itaipava"], grupo:"Grupo Petrópolis (popular)", tatica:"paridade de preço por litro + logística de retornável"},
  lata_350:{alvo:["Crystal","Itaipava"], grupo:"Grupo Petrópolis (popular)", tatica:"multipack e preço por ml"},
  retornavel_600:{alvo:["Petra","Itaipava"], grupo:"Grupo Petrópolis (mainstream)", tatica:"promo de mesa, temperatura, incentivo ao garçom"},
  garrafa_600:{alvo:["Petra","Itaipava"], grupo:"Grupo Petrópolis (mainstream)", tatica:"promo de mesa, temperatura, incentivo ao garçom"},
  long_neck_330:{alvo:["Heineken","Amstel","Sol"], grupo:"Grupo Heineken (premium)", tatica:"presença no cardápio, balde de gelo, destaque visual"},
  chope_30:{alvo:["Heineken","Amstel"], grupo:"Grupo Heineken (premium)", tatica:"chopeira, treinamento de tiragem, credencial no ponto"},
  chope_50:{alvo:["Heineken","Amstel"], grupo:"Grupo Heineken (premium)", tatica:"chopeira, treinamento de tiragem, credencial no ponto"},
  csd:{alvo:["Coca-Cola","Fanta"], grupo:"sistema Coca", tatica:CATALOGO.csd.resposta}
};

/* ---------- CORREÇÃO 2: benchmark = quartil superior de comparáveis ---------- */
function canalDe(p){ return (p.tipo==="Mercado"||p.tipo==="Distribuidora")?"off-trade":"on-trade"; }
function perfilFormato(p){
  const pf=perfilPDV(p);
  return pf.p600>=45?"garrafa":(pf.pLata>=40?"lata":(pf.pLong>=30?"long neck":"misto"));
}
function benchmarkGrupo(p){
  const desc="bares/lojas "+canalDe(p)+" · perfil "+perfilFormato(p);
  let nivel=0, g=[];
  const camadas=[
    {f:x=>x.tipo===p.tipo&&x.classe===p.classe&&canalDe(x)===canalDe(p)&&perfilFormato(x)===perfilFormato(p), d:p.tipo+" classe "+p.classe+" · "+canalDe(p)+" · perfil "+perfilFormato(p)},
    {f:x=>x.tipo===p.tipo&&canalDe(x)===canalDe(p)&&perfilFormato(x)===perfilFormato(p), d:p.tipo+" · "+canalDe(p)+" · perfil "+perfilFormato(p)},
    {f:x=>canalDe(x)===canalDe(p)&&perfilFormato(x)===perfilFormato(p), d:canalDe(p)+" · perfil "+perfilFormato(p)},
    {f:x=>canalDe(x)===canalDe(p), d:canalDe(p)}
  ];
  for(const c of camadas){
    g=BASE.pdvs.filter(c.f); nivel++;
    if(g.length>=5) break;
  }
  const ordenado=g.slice().sort((a,b)=>ambevShare(b)-ambevShare(a));
  const nQ=Math.max(2,Math.round(ordenado.length*0.25));
  const quartil=ordenado.slice(0,nQ);
  return {grupo:g, quartil, n:g.length, nQ,
    desc:camadas[Math.min(nivel,camadas.length)-1].d,
    aviso:g.length<5?"benchmark com amostra reduzida ("+g.length+" PDVs) — a calibrar":null};
}
function mediaQuartil(q,fn){ return q.length?q.reduce((a,x)=>a+fn(x),0)/q.length:0; }
/* fração de cada formato DENTRO da marca, média do quartil (só quem tem a marca) */
function fracaoFormatoQuartil(q,m){
  const com=q.filter(x=>hlMarca(x,m)>0);
  if(!com.length) return null;
  const acc={}, n=com.length;
  com.forEach(x=>{ for(const fk in (x.mix_formato||{})) acc[fk]=(acc[fk]||0)+(x.mix_formato[fk]||0); });
  const out={}; for(const fk in acc) out[fk]=acc[fk]/n;
  return out;
}

/* ---------- CORREÇÃO 5: papéis ---------- */
function papelV6(p,m,foco){
  if(m===foco) return {papel:"FOCO", ic:"🎯"};
  if(AMBEV.includes(m)){
    const ranks=AMBEV.filter(x=>x!==foco&&shareMarca(p,x)>0.05).sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
    if(ranks[0]===m) return {papel:"ÂNCORA", ic:"⚓"};
    const dom=CONC_V3.map(c=>({c,sh:shareMarca(p,c)})).sort((a,b)=>b.sh-a.sh)[0];
    if(dom&&dom.sh>20&&(PORT[m]||PORT_V3[m]).tier===(PORT[dom.c]||PORT_V3[dom.c]).tier) return {papel:"TRAVA", ic:"🔒"};
    if((PORT[m]||PORT_V3[m]).preco>=8) return {papel:"MARGEM", ic:"💎"};
    return {papel:"COMPLEMENTO", ic:"🧩"};
  }
  return {papel:"ALVO", ic:"⚔️"};
}

/* ---------- CORREÇÃO 3: linha de mix de uma marca ---------- */
function linhaMix(p,m,bm,foco){
  const cur=shareMarca(p,m);
  const metaSh=mediaQuartil(bm.quartil,x=>shareMarca(x,m));
  const gapPp=metaSh-cur;
  const metaHl=metaSh/100*p.hl_cerveja_mes;
  const atualHl=hlMarca(p,m);
  const papel=papelV6(p,m,foco);
  const vendidos=formatosVendidos(p);
  const fracs=fracaoFormatoQuartil(bm.quartil,m);
  const formatos=vendidos.map(fk=>{
    const fracAtual=p.mix_formato[fk];
    const fracMeta=(fracs&&fracs[fk]!=null)?fracs[fk]:fracAtual;
    const atualF=atualHl*fracAtual;
    const metaF=metaHl*fracMeta;
    const gapF=metaF-atualF;
    const fator=fatorCaixa(fk);
    const al=ALVO_MAPA[fk]||null;
    return {fk, nome:nomeFormato(fk), elegivel:true,
      fracAtual, fracMeta, atualF, metaF, gapF,
      gapCx:(fator&&gapF>0)?gapF/fator:0,
      tatica:al?al.tatica:null, alvo:al?al.alvo:null, grupoAlvo:al?al.grupo:null};
  }).sort((a,b)=>b.gapF-a.gapF);
  /* formatos NÃO vendidos que o benchmark usa — oportunidade de entrada, nunca meta */
  const entradas=[];
  if(fracs){
    Object.keys(fracs).forEach(fk=>{
      if(!(p.mix_formato||{})[fk]&&fracs[fk]>0.05){
        const el=formatoElegivel(p,fk);
        const al=ALVO_MAPA[fk]||null;
        entradas.push({fk, nome:nomeFormato(fk), fracBenchmark:fracs[fk],
          elegivel:el.ok, motivo:el.motivo,
          tatica:al?al.tatica:null, alvo:al?al.alvo:null});
      }
    });
  }
  return {m, papel, cur, metaSh, gapPp, atualHl, metaHl, gapHl:metaHl-atualHl, formatos, entradas};
}

/* ---------- plano de mix completo do PDV ---------- */
function planoMix(p){
  const bm=benchmarkGrupo(p);
  const foco=leituraPDV(p).foco.m;
  const presentes=MARCAS_V3.filter(m=>shareMarca(p,m)>0.05)
    .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a));
  const linhas=[];
  if(!presentes.includes(foco)) linhas.push(linhaMix(p,foco,bm,foco));
  presentes.forEach(m=>linhas.push(linhaMix(p,m,bm,foco)));
  /* ação do dia: maior gap em caixas entre formatos elegíveis de marcas Ambev */
  let topAcao=null;
  linhas.forEach(l=>{
    if(!AMBEV.includes(l.m)) return;
    l.formatos.forEach(f=>{
      if(f.gapCx>0&&(!topAcao||f.gapCx>topAcao.gapCx)){
        topAcao={m:l.m, f:f.fk, nome:f.nome, gapCx:Math.round(f.gapCx), gapHl:f.gapF,
          titulo:l.m+" "+f.nome+": +"+Math.round(f.gapCx)+" caixas/mês",
          argumento:"Tática: "+(f.tatica||"execução de presença")+(f.alvo?" contra "+f.alvo.join(", "):"")+
            ". Argumento: no seu perfil ("+bm.desc+"), os "+Math.round(bm.nQ)+" PDVs de melhor desempenho têm "+f.nome+
            " em "+(f.fracMeta*100).toFixed(0)+"% do volume da "+l.m+" — você está em "+(f.fracAtual*100).toFixed(0)+"%."};
      }
    });
  });
  return {bm, foco, linhas, topAcao};
}

/* ---------- CORREÇÃO 6: alavancagem — âncora e trava com evidência ---------- */
function pearson(xs,ys){
  const n=xs.length; if(n<3) return null;
  const mx=xs.reduce((a,b)=>a+b,0)/n, my=ys.reduce((a,b)=>a+b,0)/n;
  let sxy=0,sx=0,sy=0;
  for(let i=0;i<n;i++){ const dx=xs[i]-mx, dy=ys[i]-my; sxy+=dx*dy; sx+=dx*dx; sy+=dy*dy; }
  if(!sx||!sy) return null;
  return sxy/Math.sqrt(sx*sy);
}
function alavancagem(p){
  const meses=BASE.meses;
  const rival=CONC_V3.map(c=>({c,sh:shareMarca(p,c)})).sort((a,b)=>b.sh-a.sh)[0];
  const linhas=AMBEV.filter(m=>shareMarca(p,m)>0.05).map(m=>{
    const xs=[],ya=[],yt=[];
    let ok=true;
    meses.forEach(mes=>{
      const sm=p.serie_marca&&p.serie_marca[mes]&&p.serie_marca[mes][m];
      const ha=p.serie_ambev&&p.serie_ambev[mes];
      if(!sm||!ha||ha.hl==null){ ok=false; return; }
      const hlCerv=p.serie_total&&p.serie_total[mes]&&p.serie_total[mes].hl_cerv;
      const shM=hlCerv?sm.hl/hlCerv*100:0;
      xs.push(shM); ya.push(ha.hl);
      if(rival){
        const sr=p.serie_marca&&p.serie_marca[mes]&&p.serie_marca[mes][rival.c];
        yt.push(sr&&hlCerv?sr.hl/hlCerv*100:0);
      }
    });
    /* série suficiente (6+ medições)? usa série; senão, associação entre PDVs */
    if(ok&&xs.length>=6){
      return {m, modo:"série temporal ("+xs.length+" medições mensais)",
        rAncora:pearson(xs,ya), rTrava:rival?pearson(xs,yt):null, n:xs.length};
    }
    /* fallback: associação entre PDVs do território — NÃO causalidade */
    const pds=BASE.pdvs.filter(x=>canalDe(x)===canalDe(p));
    const ax=pds.map(x=>shareMarca(x,m)), ay=pds.map(x=>ambevShare(x));
    const at=pds.map(x=>rival?shareMarca(x,rival.c):0);
    return {m, modo:"associação entre PDVs — NÃO causalidade",
      rAncora:pearson(ax,ay), rTrava:rival?pearson(ax,at):null, n:pds.length};
  });
  const ancoras=linhas.filter(l=>l.rAncora!=null).sort((a,b)=>b.rAncora-a.rAncora);
  const travas=linhas.filter(l=>l.rTrava!=null).sort((a,b)=>a.rTrava-b.rTrava);
  return {rival, ancoras, travas};
}

/* ---------- CORREÇÃO 7: ação do dia nasce do plano de mix ---------- */
const acaoDoDiaV6=acaoDoDia;
acaoDoDia=function(p){
  const base=acaoDoDiaV6(p);
  try{
    const pm=planoMix(p);
    if(pm&&pm.topAcao&&p.anamnese==="completa"){
      return Object.assign({},base,{
        titulo:pm.topAcao.titulo,
        justificativa:pm.topAcao.argumento,
        tipo:"mix"
      });
    }
  }catch(e){}
  return base;
};
/* registro de ação executada */
if(!ESTADO.acoesFeitas) ESTADO.acoesFeitas={};
function registrarAcaoFeita(){
  const p=pdvAtual(); if(!p) return;
  ESTADO.acoesFeitas[p.id]={data:new Date().toISOString().slice(0,10)};
  salvarEstado(); toast("Ação registrada — gap vira referência de sucesso");
}