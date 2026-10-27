/* =====================================================================
   BrandFit v8 — MOTOR AUDITÁVEL DO GABARITO (porta fiel)
   Fonte: protótipo v8 "visual pro" (Adapta). O que entra, com os números do nosso motor:
   1. Perfil qualitativo pelo checklist (mesas/fachada/preço ref/público) — limiares do gabarito
   2. Compatibilidade marca × perfil (BRAND_PREFERENCES + distância de rank)
   3. Analytics por marca: gap vs fair share dos pares, potencial em caixas, tendência (série real),
      preço sustenta (escada) → nota quanti 50/25/15/10
   4. Veredito: 60% quanti + 40% (quali × compat) — pesos declarados
   5. 6 papéis no cardápio: FOCO / MARGEM / ÂNCORA / DEFESA / COMPLEMENTO / SUBSTITUIR
   6. Alertas de escada: âncora quebrada, escada invertida, Petrópolis presente, superindexada
   7. Saúde do PDV (fórmula do gabarito), potencial total cx + R$
   8. Plano 3 frentes (marketing/trade/comercial) + 4 semanas + racional 3 frases
   Sem backslashes — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- perfil qualitativo v8 (limiares do gabarito) ---------- */
const PERFIL_RANK_V8={"Econômico":1,"Popular":2,"Tradicional":3,"Alto padrão":4,"Premium":5};
const BRAND_PREF_V8={
  "Skol":      {pref:["Popular","Tradicional","Econômico"], tier:"Core entrada",  ideal:"bares populares, adegas e giro rápido de balcão"},
  "Brahma":    {pref:["Popular","Tradicional","Econômico"], tier:"Core volume",   ideal:"botecos e bares de volume com mesa cheia"},
  "Antarctica":{pref:["Tradicional","Popular"],             tier:"Core regional", ideal:"boteco de 600 retornável e mesa de calçada"},
  "Original":  {pref:["Alto padrão","Premium","Tradicional"],tier:"Premium mesa", ideal:"botecos nobres e mesas gastronômicas"},
  "Spaten":    {pref:["Alto padrão","Premium"],             tier:"Premium cervejeira", ideal:"gastrobares e carta de chopp"},
  "Bohemia":   {pref:["Premium","Alto padrão"],             tier:"Premium nicho", ideal:"carta de cervejas e público apreciador"},
  "Budweiser": {pref:["Alto padrão","Tradicional"],         tier:"Mainstream valor", ideal:"baladas e bares de público jovem"},
  "Corona":    {pref:["Premium","Alto padrão"],             tier:"Super premium lifestyle", ideal:"rooftops, baladas nobres e ocasião pôr do sol"},
  "Stella":    {pref:["Premium","Alto padrão"],             tier:"Super premium gastro", ideal:"alta gastronomia e bistrôs"},
  "Heineken":  {pref:["Alto padrão","Premium"],             tier:"Âncora concorrente", ideal:"gastrobares e baladas — âncora de preço do ponto"},
  "Itaipava":  {pref:["Econômico","Popular"],               tier:"Entrada Petrópolis", ideal:"preço baixo ocupando espaço de fridge"},
  "Crystal":   {pref:["Econômico"],                         tier:"Entrada Petrópolis", ideal:"preço de entrada em lata/litrão"},
  "Lokal":     {pref:["Econômico"],                         tier:"Entrada Petrópolis", ideal:"preço de entrada"},
  "Petra":     {pref:["Popular","Tradicional"],             tier:"Mainstream Petrópolis", ideal:"600 e mesa popular"},
  "Amstel":    {pref:["Alto padrão","Tradicional"],         tier:"Premium Heineken", ideal:"gastrobar que não tem Heineken"},
  "Sol":       {pref:["Popular","Tradicional"],             tier:"Lifestyle Heineken", ideal:"ocasião jovem e mexicana"}
};
function perfilV8(p){
  const c=ESTADO.checklist[p.id];
  if(!c||!CHECK_DEFS.every(d=>c[d.k]!==undefined&&c[d.k]!=="")) return {perfil:"Pendente", pendente:true, scoreQuali:50};
  const avg=(+c.mesas + +c.fachada)/2, pr=+c.precoRef;
  let perfil="Tradicional";
  if(avg>=4.2||pr>=22||((c.publico||"").includes("Alto padrão")&&avg>=3.5)){
    perfil=(avg>=4.6&&pr>=24)?"Premium":"Alto padrão";
  } else if(avg<=1.8||pr<=11||((c.publico||"").includes("Trabalhador")&&avg<=2.2)){
    perfil="Econômico";
  } else if(avg<=2.8||pr<=14){
    perfil="Popular";
  }
  const scoreQuali=Math.round(Math.min(100,Math.max(20,(avg/5)*50+Math.min(50,(pr/26)*50))));
  return {perfil, pendente:false, scoreQuali, c};
}
function compatMarcaV8(m,perfil){
  if(!perfil||perfil==="Pendente") return 70;
  const pref=BRAND_PREF_V8[m]; if(!pref) return 60;
  if(pref.pref.includes(perfil)) return 95;
  const r=PERFIL_RANK_V8[perfil]||3;
  const dist=Math.min(...pref.pref.map(x=>Math.abs(r-(PERFIL_RANK_V8[x]||3))));
  return dist===1?75:dist===2?50:30;
}

/* ---------- conversões ---------- */
function volCxV8(p){
  const fks=Object.keys(p.mix_formato||{}).filter(f=>p.mix_formato[f]>0);
  if(!fks.length) return p.hl_cerveja_mes/hlPorCaixa("lata_350");
  /* caixas por HL = soma da fração de cada formato ÷ HL-por-caixa do formato */
  let cxPorHl=0;
  fks.forEach(f=>{ cxPorHl+=(p.mix_formato[f])/hlPorCaixa(f); });
  return p.hl_cerveja_mes*cxPorHl;
}
function precoV8(p,m){
  if(p.preco&&p.preco[m]>0) return p.preco[m];
  const d=PORT[m]||PORT_V3[m]; return d?d.preco:10;
}
function recPorCxV8(p){
  let rec=0; CERVEJAS.forEach(m=>rec+=recMarca(p,m));
  const cx=volCxV8(p);
  return cx>0?rec/cx:95;
}

/* ---------- fair share dos pares por marca (gabarito: média de todos os pares) ---------- */
function paresV8(p){
  let g=BASE.pdvs.filter(x=>x.tipo===p.tipo&&x.classe===p.classe);
  if(g.length<3) g=BASE.pdvs.filter(x=>x.tipo===p.tipo);
  if(g.length<3) g=BASE.pdvs.filter(x=>canalDe(x)===canalDe(p));
  return g;
}
function fairShareMarcaV8(p,m,pares){
  /* gabarito: média de TODOS os pares (share 0 conta) — mostra o gap real */
  if(!pares.length) return {v:null,n:0};
  return {v:+(pares.reduce((a,x)=>a+shareMarca(x,m),0)/pares.length).toFixed(1), n:pares.length};
}

/* ---------- preço sustenta (escada) ---------- */
function precoSustentaV8(p,m,perfil){
  const pr=precoV8(p,m), d=PORT[m]||PORT_V3[m];
  if(m==="Heineken"&&pr<=precoV8(p,"Original")) return 20;
  if(m==="Skol"&&pr>precoV8(p,"Budweiser")) return 35;
  if((m==="Original"||m==="Spaten"||m==="Stella"||m==="Corona")&&perfil==="Econômico"&&pr>=13) return 45;
  if((m==="Original"||m==="Spaten")&&perfil==="Premium"&&pr<12) return 40;
  if(d&&d.tier===1&&pr>precoV8(p,"Brahma")) return 40;
  return 85;
}
function tendenciaV8(p,m){
  const h=HIST[p.id]||[];
  if(h.length>=2){
    const sh=h.map(x=>(x.shares&&x.shares[m]!=null)?x.shares[m]:null).filter(v=>v!=null);
    if(sh.length>=2){ const d=sh[sh.length-1]-sh[0]; return d>1?85:d<-1?60:75; }
  }
  return 75;
}

/* ---------- ANALYTICS v8 (motor do gabarito) ---------- */
function analyticsV8(p){
  const perf=perfilV8(p), perfil=perf.perfil, pend=perf.pendente;
  const pares=paresV8(p);
  const fsMap={};
  CERVEJAS.forEach(m=>fsMap[m]=fairShareMarcaV8(p,m,pares));
  const preco={}; CERVEJAS.forEach(m=>preco[m]=precoV8(p,m));
  const rCx=recPorCxV8(p);
  const gapAnalysis=CERVEJAS.map(m=>{
    const cur=+shareMarca(p,m).toFixed(1);
    const fs=fsMap[m].v;
    const gap=fs!=null?+(cur-fs).toFixed(1):null;
    const ehConc=["Heineken","Itaipava","Crystal","Lokal","Petra","Sol","Eisenbahn"].includes(m);
    let potencial=0;
    if(gap!=null&&gap<0&&!ehConc) potencial=Math.round(Math.abs(gap)/100*volCxV8(p));
    const gapScore=gap!=null?Math.min(100,Math.max(0,Math.abs(gap)*5+(gap<0?50:20))):30;
    const potScore=Math.min(100,(potencial/Math.max(1,volCxV8(p)*0.2))*100);
    const tend=tendenciaV8(p,m);
    const pSust=precoSustentaV8(p,m,perfil);
    const notaQuanti=Math.round(gapScore*0.50+potScore*0.25+tend*0.15+pSust*0.10);
    const compat=compatMarcaV8(m,perfil);
    const notaQuali=pend?50:perf.scoreQuali;
    const scoreFinal=Math.round(0.60*notaQuanti+0.40*(notaQuali*compat/100));
    return {m, share:cur, fs, fsN:fsMap[m].n, gap, potencial, tend, pSust, notaQuanti, compat, scoreFinal};
  }).sort((a,b)=>b.scoreFinal-a.scoreFinal);

  /* marca foco: melhor score entre Ambev com gap <= -2.5 p.p. */
  const ambevOk=gapAnalysis.filter(g=>AMBEV.includes(g.m)&&g.gap!=null&&g.gap<=-2.5);
  const foco=ambevOk[0]||gapAnalysis.find(g=>AMBEV.includes(g.m))||gapAnalysis[0];
  /* marca de margem: melhor premium da casa (exceto foco) */
  const premiums=["Original","Spaten","Corona","Stella","Bohemia"];
  const margem=gapAnalysis.find(g=>premiums.includes(g.m)&&g.m!==foco.m)||{m:"Original",scoreFinal:80};

  /* cardápio completo com papéis (gabarito) */
  const cardapio=CERVEJAS.filter(m=>hlMarca(p,m)>0||shareMarca(p,m)>0)
    .map(m=>{
      const g=gapAnalysis.find(x=>x.m===m);
      const cx=Math.round(volCxV8(p)*shareMarca(p,m)/100);
      let papel="COMPLEMENTO", ic="🥶", just="baixo giro sem gap — manter conforme demanda", acao="manter no cardápio sem investimento";
      const ehPetrop=["Itaipava","Crystal","Lokal","Petra"].includes(m);
      if(ehPetrop){ papel="SUBSTITUIR"; ic="🚫"; just="cerveja sem margem ocupando espaço — plano de expulsão"; acao="substituir no fridge por Skol/Brahma no mesmo ponto de preço"; }
      else if(m==="Heineken"){ papel="ÂNCORA"; ic="⚓";
        just=preco.Heineken<=preco.Original?"ÂNCORA QUEBRADA: preço ≤ Original — reprecificar para cima imediatamente":"âncora do PDV (R$ "+preco.Heineken.toFixed(2)+") — usar para ancorar Spaten/Original";
        acao="manter no topo da escada (R$ 16,50+) sem concessão de desconto"; }
      else if(m===foco.m){ papel="FOCO"; ic="🎯"; just="score auditado "+g.scoreFinal+"/100: gap "+(g.gap!=null?g.gap:"—")+" p.p. (+"+g.potencial+" cx) e compatibilidade "+g.compat+"%"; acao="ativação prioritária de material, combo de mesa e pedido semanal"; }
      else if(m===margem.m){ papel="MARGEM"; ic="💎"; just="premium de mesa sustentada a R$ "+preco[m].toFixed(2)+" para preservar margem bruta"; acao="destacar no cardápio de entrada como opção nobre"; }
      else if(g.fs!=null&&g.share>=2*g.fs&&g.fs>5){ papel="DEFESA"; ic="🛡️"; just="superindexada (>2× fair share de "+g.fs+"%) — proteger contra migração"; acao="não alterar preço nem mexer no espaço consolidado"; }
      return {m, cx, share:+shareMarca(p,m).toFixed(1), gap:g.gap, fs:g.fs, papel, ic, just, acao, score:g.scoreFinal};
    })
    .sort((a,b)=>({FOCO:1,SUBSTITUIR:2,MARGEM:3,"ÂNCORA":4,DEFESA:5,COMPLEMENTO:6}[a.papel]||9)-({FOCO:1,SUBSTITUIR:2,MARGEM:3,"ÂNCORA":4,DEFESA:5,COMPLEMENTO:6}[b.papel]||9));

  /* alertas de escada (gabarito) */
  const priceAlerts=[];
  if(preco.Heineken<=preco.Original) priceAlerts.push({tipo:"RED", t:"🚨 ÂNCORA QUEBRADA DETECTADA",
    d:"Heineken a R$ "+preco.Heineken.toFixed(2)+" (≤ Original a R$ "+preco.Original.toFixed(2)+"). Deve estar ACIMA da Original e alinhada com Corona/Stella (R$ 16,50+). Cada real de desconto na Heineken é margem perdida em toda a escada."});
  if(preco.Skol>preco.Budweiser) priceAlerts.push({tipo:"YELLOW", t:"⚠️ ESCADA INVERTIDA (Skol × Budweiser)",
    d:"Skol (R$ "+preco.Skol.toFixed(2)+") mais cara que Budweiser (R$ "+preco.Budweiser.toFixed(2)+"). Ajustar Skol para R$ 9,00 e Budweiser para R$ 10,50."});
  const temIta=hlMarca(p,"Itaipava")>0||hlMarca(p,"Crystal")>0||hlMarca(p,"Lokal")>0;
  if(temIta) priceAlerts.push({tipo:"RED", t:"🚨 PETRÓPOLIS PRESENTE NO PDV",
    d:"Petrópolis ocupa espaço de fridge vendendo barato (R$ "+Math.min(preco.Itaipava,preco.Crystal,preco.Lokal).toFixed(2)+") e sem margem — plano de expulsão: substituir por Skol/Brahma no mesmo ponto de preço."});
  const gHei=gapAnalysis.find(g=>g.m==="Heineken");
  const heiSuper=gHei&&gHei.fs!=null&&gHei.share>2*gHei.fs;
  if(heiSuper) priceAlerts.push({tipo:"YELLOW", t:"⚠️ HEINEKEN SUPERINDEXADA (>2× FAIR SHARE)",
    d:"Não é derrubar o preço da Heineken — é roubar o volume com a premium da casa ("+margem.m+") um degrau abaixo no preço."});

  /* saúde do PDV (fórmula do gabarito) */
  let saude=90;
  if(preco.Heineken<=preco.Original) saude-=30;
  if(preco.Skol>preco.Budweiser) saude-=15;
  if(temIta) saude-=20;
  if(foco.gap!=null&&foco.gap<-10) saude-=15;
  saude=Math.max(15,Math.min(100,saude));

  /* potencial total + R$ */
  const totalCx=gapAnalysis.reduce((a,g)=>a+g.potencial,0);
  const totalBRL=totalCx*rCx;

  /* plano 3 frentes (gabarito) */
  const heiShare=gHei?gHei.share:0, heiFair=gHei&&gHei.fs!=null?gHei.fs:10;
  const heiTheft=Math.max(0,Math.round((heiShare-heiFair)/100*volCxV8(p)));
  const itaShare=CERVEJAS.filter(m=>["Itaipava","Crystal","Lokal"].includes(m)).reduce((a,m)=>a+shareMarca(p,m),0);
  const itaTheft=Math.round(itaShare*volCxV8(p)*0.70/100);
  const mkt=[],trade=[],comercial=[];
  if(heiTheft>0) mkt.push("Roubar ~"+heiTheft+" caixas/mês da Heineken via "+margem.m+" posicionada R$ 2,50 mais barata (cliente que acha Heineken cara desce para a casa, não para fora).");
  else mkt.push("Conter avanço da Heineken mantendo "+margem.m+" em destaque no cardápio de entrada.");
  if(itaTheft>0) mkt.push("Roubar ~"+itaTheft+" caixas/mês da Petrópolis via substituição direta por Skol/Brahma no ponto de preço de entrada.");
  const metaPct=(shareMarca(p,foco.m)+Math.abs(foco.gap||0)).toFixed(1);
  mkt.push("Meta do trimestre: elevar "+foco.m+" de "+shareMarca(p,foco.m).toFixed(1)+"% para "+metaPct+"% de share.");
  if(preco.Heineken<=preco.Original) trade.push("Reprecificação imediata da Heineken no cardápio para R$ 16,50 (hoje R$ "+preco.Heineken.toFixed(2)+").");
  trade.push("Ativação de materiais: balde/cervejela oficial "+foco.m+" na mesa e envelopamento da porta do fridge.");
  if(p.hl_cerveja_mes>=25) trade.push("Aprovação de chopeira "+foco.m+" (volume de "+fmtN(p.hl_cerveja_mes,1)+" HL/mês justifica investimento com payback < 4 meses).");
  trade.push("Espaço de geladeira: expandir share de gôndola Ambev de "+fmtN(p.share_geladeira||40,0)+"% para 70% dedicado à marca foco "+foco.m+".");
  if(temIta) comercial.push("Negociar troca do espaço da Petrópolis por ponto focal de Skol/Brahma no fridge principal.");
  else comercial.push("Renegociar preço da Heineken para cima no balcão com argumento de giro de margem bruta.");
  comercial.push("Ajustar pedido semanal: elevar combo de "+foco.m+" (+"+Math.max(10,foco.potencial)+" cx) aproveitando o headroom do segmento.");
  comercial.push("Tarefa da semana: fechar pedido semanal de "+foco.m+" garantindo balde na mesa na sexta-feira.");

  /* ativos de serviço (gabarito, adaptado ao portfólio) */
  const ativos=[];
  if(foco.m==="Original"&&(perfil==="Alto padrão"||perfil==="Premium")){
    ativos.push({i:"Geladeira porta Original envelopada", j:"foco Original em perfil nobre exige visibilidade de garrafa de alta classe"});
    ativos.push({i:"Balde e taças oficiais Original", j:"consumo de mesa com compartilhamento entre clientes nobres"});
  } else if(foco.m==="Original"&&perfil==="Econômico"){
    ativos.push({i:"Cervejela térmica de mesa Original", j:"garante cerveja trincando com giro rápido de garrafa no balcão"});
    ativos.push({i:"Troca de porta da geladeira para Original", j:"substitui comunicação antiga e reforça giro comprovado"});
  } else if(foco.m==="Spaten"){
    ativos.push({i:"Cervejeira Spaten dupla face com LED", j:"volume de "+fmtN(p.hl_cerveja_mes,1)+" HL sustenta ativo nobre; destaca o puro malte"});
    ativos.push({i:"Baldes de gelo em inox Spaten", j:"alinhamento com público de gastrobar e roubo de consumo da Heineken"});
  } else if(foco.m==="Skol"||foco.m==="Brahma"){
    ativos.push({i:"Freezer horizontal ou cervejela "+foco.m, j:"volume massivo exige capacidade estática para reposição rápida"});
    ativos.push({i:"Baldes plásticos e jogo de mesas "+foco.m, j:"padronização de calçada com custo unitário eficiente e payback em 60 dias"});
  } else {
    ativos.push({i:"Envelopamento de balcão e baldes "+foco.m, j:"positivação da marca foco com score final "+foco.scoreFinal+"/100"});
  }
  if(perfil==="Premium"&&p.hl_cerveja_mes>=30) ativos.push({i:"Torre de chopp "+foco.m+" (payback < 4 meses)", j:"perfil Premium com alto volume viabiliza chopp como acelerador de tíquete médio"});

  /* 4 semanas (gabarito) */
  const semanas=[
    {s:"Semana 1", d:"Alinhamento de escada: ajustar preço de cardápio"+(preco.Heineken<=preco.Original?" da Heineken para R$ 16,50+":" dos degraus desalinhados")+" e garantir combo promocional de "+foco.m+"."},
    {s:"Semana 2", d:"Positivação de ativos: envelopar porta do fridge e posicionar baldes oficiais de "+foco.m+" nas mesas de entrada."},
    {s:"Semana 3", d:"Substituição de concorrência: reduzir espaço de cerveja barata sem margem e reforçar gôndola Ambev (+"+Math.max(10,foco.potencial)+" cx)."},
    {s:"Semana 4", d:"Revisão de giro: checar sell-out da marca foco e renovar pedido programado mantendo tração contínua."}
  ];

  /* racional (máx 3 frases, gabarito) */
  const racional="O PDV "+p.nome+" opera com "+fmtN(volCxV8(p),0)+" caixas/mês, mas apresenta gap reprimido de "+fmtN(Math.abs(foco.gap||0),1)+" p.p. em "+foco.m+" frente aos pares de "+p.classe+". Ajustar a âncora da concorrência e destacar a premium "+margem.m+" recupera margem imediatamente sem atrito com o consumidor. Com essa execução, o ponto desbloqueia +"+fmtN(totalCx,0)+" caixas/mês em receita de alto valor.";

  return {p, perfil, pend, perf, pares, gapAnalysis, foco, margem, cardapio, priceAlerts, saude,
    totalCx, totalBRL, rCx, heiTheft, itaTheft, mkt, trade, comercial, ativos, semanas, racional, preco};
}
