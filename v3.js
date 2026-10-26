/* =====================================================================
   BrandFit v3 — Sala 6 · foco MARCA · mobile de rua
   Camada sobre v2: catálogo com GRUPOS (concorrência), base regenerada
   com as marcas novas, veredito c/ concorrência completa, análise por
   grupo e "como atacar" por marca Ambev.
   ===================================================================== */
"use strict";

/* ---------- catálogo estendido (badged: estimativa — editar no painel) ---------- */
const PORT_V3 = {
  "Amstel":  {tier:3, dono:"concorrente", preco:8.49, papel:"concorrente"},
  "Crystal": {tier:1, dono:"concorrente", preco:3.29, papel:"concorrente"},
  "Lokal":   {tier:1, dono:"concorrente", preco:3.19, papel:"concorrente"},
  "Petra":   {tier:3, dono:"concorrente", preco:7.99, papel:"concorrente"}
};
const GRUPO_DE = {
  "Skol":"Ambev","Brahma":"Ambev","Antarctica":"Ambev","Original":"Ambev",
  "Spaten":"Ambev","Bohemia":"Ambev","Budweiser":"Ambev","Corona":"Ambev",
  "Heineken":"Grupo Heineken","Amstel":"Grupo Heineken","Sol":"Grupo Heineken",
  "Itaipava":"Grupo Petrópolis","Crystal":"Grupo Petrópolis","Lokal":"Grupo Petrópolis","Petra":"Grupo Petrópolis",
  "Eisenbahn":"Outras"
};
const GRUPOS_V3 = ["Ambev","Grupo Heineken","Grupo Petrópolis","Outras"];
const MARCAS_V3 = CERVEJAS.concat(Object.keys(PORT_V3));
const CONC_V3 = MARCAS_V3.filter(m=>(PORT[m]||PORT_V3[m]).dono==="concorrente");
const COR_GRUPO = {"Ambev":"var(--red)","Grupo Heineken":"#1f8a44","Grupo Petrópolis":"#2b6cb0","Outras":"#6b7075"};
const FONTE_V3 = {
  preco_marcas_novas:{fonte:"Preço de referência de balcão — estimativa inicial, editar no painel",data:"2026-10-26",validado:false},
  grupos:{fonte:"Estrutura de grupos do mercado cervejeiro BR — catálogo editável",data:"2026-10-26",validado:true}
};

/* ---------- base v3: mock regenerado com o catálogo completo ---------- */
function hashId(s){ return [...s].reduce((a,c)=>a+c.charCodeAt(0),0); }
function gerarBaseMockV3(){
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
  /* pesos por tier do PDV — agora com Grupo Heineken e Grupo Petrópolis */
  const W = {
    1:{Skol:30,Itaipava:11,Crystal:7,Lokal:5,Brahma:16,Antarctica:8,Sol:4,Original:3,Spaten:2,Eisenbahn:2,Bohemia:1,Budweiser:1,Corona:1,Heineken:1,Amstel:.5,Petra:.5},
    2:{Skol:20,Itaipava:7,Crystal:5,Lokal:4,Brahma:18,Antarctica:9,Sol:5,Original:7,Spaten:5,Eisenbahn:3,Bohemia:2,Budweiser:3,Corona:3,Heineken:3,Amstel:2,Petra:2},
    3:{Skol:9,Itaipava:3,Crystal:1,Lokal:1,Brahma:14,Antarctica:7,Sol:4,Original:11,Spaten:9,Eisenbahn:4,Bohemia:5,Budweiser:7,Corona:8,Heineken:8,Amstel:6,Petra:5},
    4:{Skol:4,Itaipava:1,Crystal:.5,Lokal:.5,Brahma:7,Antarctica:4,Sol:2,Original:9,Spaten:8,Eisenbahn:3,Bohemia:6,Budweiser:13,Corona:15,Heineken:11,Amstel:5,Petra:5}
  };
  const W_DEMO = {
    "Bar do Zé":{Spaten:36,Skol:10,Brahma:9,Itaipava:13,Crystal:6,Lokal:4,Sol:9,Original:4,Eisenbahn:3,Bohemia:2,Budweiser:1,Corona:1,Heineken:1,Amstel:.5,Petra:.5,Antarctica:0},
    "Bar Premium Rooftop 9":{Corona:16,Budweiser:11,Heineken:12,Amstel:6,Spaten:11,Original:9,Bohemia:7,Eisenbahn:4,Brahma:7,Antarctica:4,Petra:4,Sol:3,Skol:3,Itaipava:2,Crystal:1,Lokal:1}
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
    const w = {}; MARCAS_V3.forEach(m=>w[m]=(wBase[m]||0)*(0.7+rnd()*0.6));
    const sw = MARCAS_V3.reduce((a,m)=>a+w[m],0);
    const hlM={}; MARCAS_V3.forEach(m=>hlM[m]=hlCerv*w[m]/sw);
    const pmult = {"A":1.18,"B":1.0,"C":0.88}[classe];
    const preco={}; MARCAS_V3.forEach(m=>preco[m]=r2((PORT[m]||PORT_V3[m]).preco*pmult*(0.95+rnd()*0.13)));
    const recM={}, cxM={};
    MARCAS_V3.forEach(m=>{
      let rec=0, cx=0;
      for(const fk in fmt){
        const hlF=hlM[m]*fmt[fk];
        const un=hlF*1e5/PARAMS.ml_por_unidade[fk];
        cx+=un/PARAMS.fatores_caixa[fk];
        rec+=un*preco[m]*(fk==="garrafa_600"?PARAMS.preco_garrafa600_mult:1);
      }
      recM[m]=r2(rec); cxM[m]=r1(cx);
    });
    const recTotal = r2(MARCAS_V3.reduce((a,m)=>a+recM[m],0));
    const hlAmbev = r1(AMBEV.reduce((a,m)=>a+hlM[m],0));
    const recAmbev = r2(AMBEV.reduce((a,m)=>a+recM[m],0));
    const marcaTop = AMBEV.reduce((best,m)=>hlM[m]>hlM[best]?m:best, AMBEV[0]);
    const bsv = recTotal? r2(recAmbev/recTotal*100):0;
    const serieAmbev = {}; const serieRecAmbev = {};
    meses.forEach((mes,k)=>{ const esc=(saz[tipo]&&saz[tipo][k])||1;
      serieAmbev[mes]=r1(hlAmbev*esc); serieRecAmbev[mes]=r2(recAmbev*esc); });
    const medido = pl.anamnese==="completa";
    const geladeiras = tipo==="Distribuidora"? 10+Math.floor(rnd()*15) : 4+Math.floor(rnd()*11);
    const serieMarca={}, serieTotal={};
    meses.forEach((mes,k)=>{
      const esc = (saz[tipo]&&saz[tipo][k])||1;
      serieMarca[mes]={}; MARCAS_V3.forEach(m=>serieMarca[mes][m]={hl:r1(hlM[m]*esc), rec:r2(recM[m]*esc)});
      const somaHl=Object.values(serieMarca[mes]).reduce((a,d)=>a+d.hl,0);
      const alvoHl=r1(hlCerv*esc); const maior=AMBEV.reduce((b,m)=>hlM[m]>hlM[b]?m:b,AMBEV[0]);
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
      preco, mix_formato:fmt, caixas_ambev_mes:r1(AMBEV.reduce((a,m)=>a+cxM[m],0)),
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
    marcas: MARCAS_V3.map(m=>{ const d=PORT[m]||PORT_V3[m];
        return [m,TIER_NOME[d.tier],d.preco,d.papel,"cerveja",d.dono]; })
      .concat(OUTRAS_CATEGORIAS.map(x=>x)),
    pdvs,
    aviso:"Base mock regenerada — DADOS FICTÍCIOS para demonstração."
  };
}
/* regenera quando a base ativa não tem as marcas novas (limpa histórico demo) */
function ensureBaseV3(){
  const mesU=BASE.meses[BASE.meses.length-1];
  const sm=BASE.pdvs[0].serie_marca&&BASE.pdvs[0].serie_marca[mesU];
  if(!sm||!sm["Amstel"]){
    BASE=gerarBaseMockV3(); salvarBase();
    try{ localStorage.removeItem(LS_HIST); }catch(e){}
    HIST={};
    hidratarV2Base(); seedHistDemo();
    ESTADO.ordemHoje=null; ESTADO.rotaDia=null; salvarEstado();
  }
}

/* ---------- fair share do tier agora conta TODAS as marcas do tier ---------- */
shareTier = function(p,t){
  return MARCAS_V3.filter(m=>(PORT[m]||PORT_V3[m]).tier===t).reduce((a,m)=>a+shareMarca(p,m),0);
};

/* ---------- veredito com concorrência completa (por marca, todas as famílias) ---------- */
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
  const concMesmoTier=CONC_V3.filter(c=>(PORT[c]||PORT_V3[c]).tier===a.t).map(c=>p.preco[c]).filter(x=>x>0);
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
/* concDominante da marcaAlvo considera todas as famílias concorrentes */
const marcaAlvoV1=marcaAlvo;
marcaAlvo=function(p){
  const r=marcaAlvoV1(p);
  r.concDominante=CONC_V3.map(m=>({m,sh:shareMarca(p,m)})).sort((a,b)=>b.sh-a.sh)[0]||{m:"—",sh:0};
  return r;
};

/* ---------- análise de concorrência por GRUPO ---------- */
function shareGrupo(p,g){
  return MARCAS_V3.filter(m=>GRUPO_DE[m]===g).reduce((a,m)=>a+shareMarca(p,m),0);
}
function concorrenciaPDV(p){
  const grupos=GRUPOS_V3.filter(g=>g!=="Ambev").map(g=>{
    const marcas=MARCAS_V3.filter(m=>GRUPO_DE[m]===g&&(hlMarca(p,m)>0||shareMarca(p,m)>0.05))
      .map(m=>{ const d=PORT[m]||PORT_V3[m];
        return {m, sh:shareMarca(p,m), preco:p.preco[m]||d.preco, tier:d.tier}; })
      .sort((a,b)=>b.sh-a.sh);
    return {g, sh:shareGrupo(p,g), marcas};
  }).sort((a,b)=>b.sh-a.sh);
  const pressao=grupos.find(g=>g.sh>0.5)||null;
  let contra=null;
  if(pressao&&pressao.marcas.length){
    const rival=pressao.marcas[0];
    const resp=AMBEV.filter(m=>(PORT[m]||PORT_V3[m]).tier===rival.tier)
      .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a))[0]||AMBEV[0];
    contra={rival, resp, grupo:pressao.g};
  }
  return {grupos, pressao, contra};
}
/* como atacar o share com CADA marca Ambev — 1 linha, alavanca única */
function ataqueMarca(p,m){
  const d=(PORT[m]||PORT_V3[m]), t=d.tier, cur=shareMarca(p,m), fs=fairShareTier(p,t);
  const gap=fs.v!=null?+(fs.v-cur).toFixed(1):null;
  if(hlMarca(p,m)===0)
    return {txt:"Entrar no cardápio — encaixe "+TIER_NOME[t]+" em PDV "+TIER_NOME[tierPDV(p)], gap, alavanca:"cardápio"};
  if(p.share_geladeira<ambevShare(p)-3)
    return {txt:"Porta do fridge — geladeira "+p.share_geladeira.toFixed(0)+"% < share Ambev "+ambevShare(p).toFixed(0)+"%", gap, alavanca:"fridge"};
  if(gap!=null&&gap>2)
    return {txt:"Ativação no pico (balde) — gap "+gap.toFixed(1)+" p.p. vs fair share do tier", gap, alavanca:"balde"};
  const conc=CONC_V3.filter(x=>(PORT[x]||PORT_V3[x]).tier===t&&shareMarca(p,x)>0)
    .sort((a,b)=>shareMarca(p,b)-shareMarca(p,a))[0];
  if(conc&&p.preco[m]&&p.preco[conc.m]&&p.preco[m]>p.preco[conc.m]*1.15)
    return {txt:"Reprecificar — R$ "+p.preco[m].toFixed(2)+" vs "+conc.m+" R$ "+p.preco[conc.m].toFixed(2), gap, alavanca:"preço"};
  if(p.ruptura_mensal_pct>PARAMS.meta_ruptura_max)
    return {txt:"Frequência de pedido — ruptura "+p.ruptura_mensal_pct.toFixed(1)+"% come o share", gap, alavanca:"serviço"};
  return {txt:"Defender — execução em dia (gelada, validade, espaço)", gap, alavanca:"defesa"};
}