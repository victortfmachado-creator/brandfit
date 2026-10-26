/* =====================================================================
   BrandFit v3 — UI: Sala 6 · foco marca · celular na rua
   - Tipografia de rua (números grandes)
   - Aba Visões removida (4 abas)
   - PDV = analista de marca: marca foco, ataque por marca, concorrência por grupo
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* CSS de rua: injeta uma vez */
(function(){
  const st=document.createElement("style");
  st.textContent=`
  html.v3{font-size:18px}
  .rua-num{font-size:2.6rem;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
  .rua-num.med{font-size:1.9rem}
  .rua-lbl{font-size:.8rem;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-top:4px}
  .rua-lbl.small{font-size:.68rem}
  .hero-share{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px;text-align:center}
  .hero-share .grande{font-size:4.2rem;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
  .gbar{display:flex;height:34px;border-radius:8px;overflow:hidden;margin:10px 0}
  .gbar>div{display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;min-width:0;overflow:hidden;white-space:nowrap}
  .marca-linha{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)}
  .marca-linha:last-child{border-bottom:none}
  .marca-linha .nm{font-size:1.05rem;font-weight:700;width:7.2em;flex:none}
  .marca-linha .pct{font-size:1.6rem;font-weight:800;width:4.2em;text-align:right;font-variant-numeric:tabular-nums}
  .marca-linha .alv{flex:1;font-size:.82rem;color:var(--txt2);line-height:1.3}
  .grupo-card{background:var(--card2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px}
  .grupo-card .gh{display:flex;align-items:baseline;gap:8px}
  .grupo-card .gn{font-weight:800;font-size:1rem}
  .grupo-card .gv{margin-left:auto;font-size:1.5rem;font-weight:800;font-variant-numeric:tabular-nums}
  .chip-rua{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:5px 12px;font-size:.8rem;font-weight:700;white-space:nowrap}
  .tabs .tab{font-size:.85rem;min-width:88px}
  `;
  document.documentElement.classList.add("v3");
  document.head.appendChild(st);
})();

/* ---------- 4 abas (Visões sai) ---------- */
const TABS_V3=[["hoje","📍 Hoje"],["pdv","🏪 PDV"],["territorio","🗺️ Território"],["config","⚙️ Config"]];
function rebuildTabs(){
  const nav=$("#tabs");
  nav.innerHTML=TABS_V3.map(t=>'<button class="tab'+(t[0]==="hoje"?" active":"")+'" data-tab="'+t[0]+'"><span class="ic">'+t[1].split(" ")[0]+'</span>'+t[1].split(" ")[1]+'</button>').join("");
  nav.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
}

/* ---------- go(): sem visoes ---------- */
const goV1=go;
go=function(aba){
  if(aba==="visoes") aba="territorio";
  ESTADO.aba=aba; salvarEstado();
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===aba));
  const c=$("#conteudo");
  c.innerHTML='<div class="skeleton" style="height:80px;margin-bottom:12px"></div><div class="skeleton" style="height:200px"></div>';
  setTimeout(()=>{
    try{
      c.innerHTML=aba==="hoje"?renderHoje():aba==="pdv"?renderPdv():aba==="territorio"?renderTerritorio():renderConfig();
      $("#fab").style.display=aba==="hoje"?"":"none";
      $("#subtitulo").textContent={hoje:"Rota de execução e coleta",pdv:"Analista de marca do PDV",
        territorio:"Como está sua carteira",config:"Parâmetros e dados"}[aba]||"";
      window.scrollTo(0,0);
    }catch(e){ c.innerHTML='<div class="card"><div class="aviso red">Erro: '+esc(e.message)+'</div></div>'; console.error(e); }
  },120);
};

/* ---------- HOJE v3: números de rua ---------- */
function renderHoje(){
  const rd=rotaDia(), modo=ESTADO.hojeModo||"agir";
  const rota=rd.ids.map(id=>BASE.pdvs.find(p=>p.id===id)).filter(Boolean);
  const st=ESTADO.visitas;
  const concl=rota.filter(p=>st[p.id]==="concluido").length;
  const coleta=BASE.pdvs.filter(p=>p.anamnese!=="completa").sort((a,b)=>scoreColeta(b)-scoreColeta(a));
  const hojeISO=new Date().toISOString().slice(0,10);
  const tDia=tempoDia(rota);
  let h=`<div class="hero-share">
    <div class="grande">${concl}<span style="font-size:1.8rem;color:var(--txt3)"> / ${rota.length}</span></div>
    <div class="rua-lbl">visitas feitas hoje · ${fmtDur(tDia)} no total</div>
    <div class="bar ${concl===rota.length?"ok":""}" style="margin-top:10px;height:12px"><div style="width:${pct(concl,rota.length||1)}%"></div></div>
    <div class="grid g2" style="margin-top:12px">
      <select onchange="ESTADO.rotaDia.n=+this.value;ESTADO.rotaDia.ids=null;salvarEstado();go('hoje')" style="min-height:52px;font-size:1rem">
        ${[6,8,10,12,14].map(n=>'<option value="'+n+'"'+(rotaN()===n?" selected":"")+'>'+n+' visitas</option>').join("")}
      </select>
      <select onchange="mudarDataRota(this.value)" style="min-height:52px;font-size:1rem">
        <option value="hoje"${rd.data==="hoje"?" selected":""}>Hoje</option>
        <option value="ontem"${rd.data==="ontem"?" selected":""}>Ontem</option>
        <option value="semana"${rd.data==="semana"?" selected":""}>Semana</option>
      </select>
    </div>
    <button class="btn block" style="margin-top:8px;min-height:52px" onclick="reproporRota()">↻ Re-propor rota (top ${rotaN()} por oportunidade, por bairro)</button>
  </div>`;
  h+=`<div class="grid g2" style="margin:12px 0">
    <button class="btn ${modo==="agir"?"primary":""}" style="min-height:56px;font-size:1rem" onclick="ESTADO.hojeModo='agir';salvarEstado();go('hoje')">🎯 Onde agir</button>
    <button class="btn ${modo==="medir"?"primary":""}" style="min-height:56px;font-size:1rem" onclick="ESTADO.hojeModo='medir';salvarEstado();go('hoje')">📏 Onde medir</button>
  </div>`;
  if(rd.data!=="hoje"){
    const ini=rd.data==="ontem"?hojeISO:addDays(hojeISO,-7), fim=hojeISO;
    const regs=visitasRegistradas(ini,fim);
    h+=`<div class="card"><h3 style="font-size:1.1rem">${rd.data==="ontem"?"Ontem":"Esta semana"} · ${regs.length} visitas</h3>`;
    if(!regs.length) h+=`<div class="empty"><div class="ic">🗓️</div>Nada registrado neste período.</div>`;
    else regs.forEach(x=>h+=`<div class="marca-linha"><div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
      <span class="chip-rua ${x.st==="concluido"?"chip ok":"chip info"}">${x.st==="concluido"?"feita":"rascunho"}</span></div>`);
    h+=`</div>`;
    return h;
  }
  if(modo==="agir"){
    h+=`<div class="card"><h3 style="font-size:1.1rem">🎯 Rota de execução <span class="hint">só anamnese completa</span></h3>`;
    if(!rota.length) h+=`<div class="empty"><div class="ic">🎯</div>Sem PDVs elegíveis — complete anamneses primeiro.</div>`;
    else rota.forEach((p,i)=>h+=cardVisitaV2(p,i+1));
    h+=`</div>`;
    h+=`<div class="card"><h3 style="font-size:1.1rem">📏 Fila de coleta <span class="hint">${coleta.length} PDVs</span></h3>`;
    coleta.slice(0,3).forEach(p=>h+=linhaColeta(p));
    if(coleta.length>3) h+=`<button class="btn block" style="margin-top:8px;min-height:52px" onclick="ESTADO.hojeModo='medir';salvarEstado();go('hoje')">Ver os ${coleta.length} PDVs a medir</button>`;
    h+=`</div>`;
  } else {
    h+=`<div class="card"><h3 style="font-size:1.1rem">📏 Onde medir <span class="hint">${coleta.length} PDVs</span></h3>`;
    if(!coleta.length) h+=`<div class="empty"><div class="ic">✅</div>Tudo medido.</div>`;
    else coleta.forEach(p=>h+=linhaColeta(p));
    h+=`</div>`;
  }
  return h;
}

/* ---------- PDV v3: ANALISTA DE MARCA ---------- */
function renderPdv(){
  const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
  const v=veredito(p), sub=ESTADO.subPdv||"marca";
  const subs=[["marca","🏷️ Marca foco"],["concorrencia","⚔️ Concorrência"],["portfolio","📊 Portfólio"],["economia","💰 Economia"],["evolucao","📈 Evolução"],["anamnese","📋 Coleta"],["plano","🗓️ Plano"]];
  let h=`<div class="sticky-top">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <button class="btn ghost" onclick="go('hoje')" style="padding:8px 14px;min-height:52px">←</button>
      <select onchange="ESTADO.pdvAtual=this.value;salvarEstado();go('pdv')" style="flex:1;min-height:52px;font-size:1rem">
        ${BASE.pdvs.map(x=>'<option value="'+x.id+'"'+(x.id===p.id?" selected":"")+'>'+esc(x.nome)+" · "+esc(x.tipo)+" "+esc(x.classe)+" · "+fmtN(x.hl_total_mes,1)+" HL</option>").join("")}
      </select>
    </div>
  </div>
  <div class="subtabs">
    ${subs.map(x=>`<button class="subtab${sub===x[0]?" active":""}" onclick="ESTADO.subPdv='${x[0]}';salvarEstado();go('pdv')">${x[1]}</button>`).join("")}
  </div>`;
  if(sub==="marca") h+=secMarcaFoco(p,v);
  else if(sub==="concorrencia") h+=secConcorrencia(p,v);
  else if(sub==="portfolio") h+=secPortfolio(p,v);
  else if(sub==="economia") h+=secEconomia(p);
  else if(sub==="evolucao") h+=secEvolucao(p);
  else if(sub==="anamnese") h+=secAnamnese(p);
  else if(sub==="plano") h+=secPlano(p);
  return h;
}

/* Marca foco: número gigante + como atacar cada marca Ambev */
function secMarcaFoco(p,v){
  const share=ambevShare(p), bsv=bsvPDV(p);
  let h=`<div class="hero-share">
    <div class="grande" style="color:var(--red)">${fmtN(share,1)}<span style="font-size:2rem">%</span></div>
    <div class="rua-lbl">share Ambev no PDV · meta ${PARAMS.meta_share_ambev}%</div>
    <div class="gbar">
      <div style="width:${Math.min(100,share)}%;background:var(--red)">Ambev</div>
      <div style="flex:1;background:#3a3f45">resto</div>
    </div>
    <div class="grid g2" style="margin-top:8px">
      <div><div class="rua-num med">${fmtN(bsv,1)}%</div><div class="rua-lbl small">BSV (valor)</div></div>
      <div><div class="rua-num med">${equidadePDV(p)}</div><div class="rua-lbl small">equidade 0–100</div></div>
    </div>
  </div>`;
  if(p.anamnese!=="completa"){
    h+=`<div class="card" style="margin-top:12px"><div class="aviso" style="font-size:.95rem">${chipAmbar(p.anamnese==="pendente"?"Coleta obrigatória":"Ação provisória")}<div style="margin-top:8px">${p.anamnese==="pendente"?"Complete a anamnese antes de executar — sem dado medido não há marca foco.":"Ação sujeita a revisão após completar a anamnese. Faltam medir: <b>"+esc(camposFaltantes(p).join(", ")||"—")+"</b>"}</div></div></div>`;
    return h;
  }
  h+=`<div class="card" style="margin-top:12px"><h3 style="font-size:1.1rem">Como atacar o share — marca por marca</h3>`;
  AMBEV.forEach(m=>{
    const at=ataqueMarca(p,m), cur=shareMarca(p,m);
    const cor=at.gap!=null&&at.gap>2?"var(--red2)":"var(--txt)";
    h+=`<div class="marca-linha">
      <div class="nm">${esc(m)}</div>
      <div class="pct" style="color:${cor}">${fmtN(cur,1)}%</div>
      <div class="alv">${esc(at.txt)}${at.gap!=null&&at.gap>2?" · <b style='color:var(--red2)'>+"+fmtN(at.gap,1)+" p.p.</b>":""}</div>
    </div>`;
  });
  h+=`<div class="tiny" style="margin-top:8px">Cada linha = a alavanca única daquela marca neste PDV. Gap = distância até o fair share do tier (mediana dos PDVs do mesmo canal).</div></div>`;
  const a=acaoDoDia(p), mt=metaDaAcao(p,(a.tipo||"material"));
  h+=`<div class="card"><h3 style="font-size:1.1rem">Ação do dia · ${esc(v.ma.alvo.m)}</h3>
    <div class="veredito" style="font-size:1rem"><div class="v-title" style="font-size:1.1rem">${esc(a.titulo)}</div>
    <div style="margin-top:6px">Por quê: ${esc(a.justificativa)}</div></div>
    <div class="grid g2" style="margin-top:10px">
      <div class="kpi" style="cursor:default"><div class="rua-num med">+${mt.metaCx}</div><div class="rua-lbl small">caixas/mês (meta)</div></div>
      <div class="kpi" style="cursor:default"><div class="rua-num med">${mt.gapCx}</div><div class="rua-lbl small">caixas/mês (gap total)</div></div>
    </div>
    <button class="btn block" style="margin-top:8px;min-height:52px" onclick="modalMemoria('Memória de cálculo','${mt.memoria}','Trava: meta ≤ gap (regra v2).')">🧮 Ver cálculo da meta</button>
  </div>`;
  return h;
}

/* Concorrência: grupos com barra de rua + resposta sugerida */
function secConcorrencia(p,v){
  const c=concorrenciaPDV(p);
  const shAm=ambevShare(p);
  let h=`<div class="card"><h3 style="font-size:1.1rem">Quem é quem no PDV</h3>
    <div class="gbar" style="height:44px">`;
  const parts=[{g:"Ambev",sh:shAm,cor:"var(--red)"}].concat(c.grupos.map(g=>({g:g.g,sh:g.sh,cor:COR_GRUPO[g.g]})));
  parts.forEach(x=>{ if(x.sh>0.5) h+=`<div style="width:${x.sh}%;background:${x.cor}">${Math.round(x.sh)}%</div>`; });
  h+=`</div>`;
  parts.forEach(x=>{
    h+=`<div class="marca-linha"><div class="nm" style="width:auto;flex:1;color:${x.cor}">${esc(x.g)}</div>
      <div class="pct">${fmtN(x.sh,1)}%</div></div>`;
  });
  h+=`</div>`;
  c.grupos.forEach(g=>{
    h+=`<div class="grupo-card"><div class="gh"><span class="gn" style="color:${COR_GRUPO[g.g]}">${esc(g.g)}</span>
      <span class="gv" style="color:${COR_GRUPO[g.g]}">${fmtN(g.sh,1)}%</span></div>`;
    g.marcas.forEach(m=>{
      h+=`<div class="marca-linha" style="padding:8px 0">
        <div class="nm" style="width:6em;font-size:.95rem">${esc(m.m)}</div>
        <div class="pct" style="font-size:1.25rem">${fmtN(m.sh,1)}%</div>
        <div class="alv">R$ ${fmtN(m.preco,2)} · ${esc(TIER_NOME[m.tier])}</div>
      </div>`;
    });
    if(!g.marcas.length) h+=`<div class="tiny">Sem presença relevante.</div>`;
    h+=`</div>`;
  });
  if(c.contra){
    const dR=PORT[c.contra.rival.m]||PORT_V3[c.contra.rival.m];
    h+=`<div class="card"><h3 style="font-size:1.1rem">Resposta sugerida</h3>
      <div class="veredito" style="font-size:.95rem"><b>${esc(c.contra.rival.m)} (${esc(c.contra.grupo)})</b> lidera o ataque concorrente com ${fmtN(c.contra.rival.sh,1)}%.
      Resposta: <b>${esc(c.contra.resp)}</b> (mesmo tier ${esc(TIER_NOME[dR.tier])}) — ${esc(ataqueMarca(p,c.contra.resp).txt)}.</div></div>`;
  }
  h+=`<div class="card"><h3 style="font-size:1.1rem">Ação do concorrente no PDV</h3>
    <div class="rua-num med" style="margin:4px 0">${esc(p.conc_acao)}</div>
    <div class="tiny">Relação com o decisor: ${esc(p.relacao)} · percepção da marca: ${esc(p.percepcao_marca)}</div></div>`;
  return h;
}

/* Portfólio: escada de preço + cardápio completo (todas as famílias) */
function secPortfolio(p,v){
  const ma=v.ma;
  const precos=MARCAS_V3.map(m=>{ const d=PORT[m]||PORT_V3[m];
    return {nome:m, pr:p.preco[m]||d.preco, tier:TIER_NOME[d.tier], dono:d.dono, grupo:GRUPO_DE[m]}; })
    .sort((a,b)=>a.pr-b.pr);
  const maxPr=Math.max(...precos.map(x=>x.pr));
  let h=`<div class="card"><h3 style="font-size:1.1rem">Escada de preço no balcão</h3><div class="escada">`;
  precos.forEach(x=>{
    const ambev=x.dono==="ambev", alvo=x.nome===ma.alvo.m;
    h+=`<div class="degrau${alvo?" foco":""}"><div class="nm" style="width:auto;min-width:6.5em;color:${COR_GRUPO[x.grupo]}">${esc(x.nome)}${ambev?" <span class='badge coletado'>ambev</span>":""}</div>
    <div class="r" style="width:${(x.pr/maxPr*100).toFixed(0)}%">R$ ${fmtN(x.pr,2)}</div>
    <span class="tiny">${esc(x.tier)}</span></div>`;
  });
  h+=`</div><div class="tiny" style="margin-top:6px">Cor = grupo do dono. A marca-alvo (${esc(ma.alvo.m)}) entra no degrau coerente com o PDV.</div></div>`;
  h+=`<div class="card"><h3 style="font-size:1.1rem">Cardápio completo — volume e valor</h3><table style="font-size:.9rem">
    <tr><th>Marca</th><th>Share</th><th>Preço</th><th>Grupo</th></tr>
    ${MARCAS_V3.map(m=>{ const d=PORT[m]||PORT_V3[m]; const sh=shareMarca(p,m);
      if(sh<0.05) return "";
      return "<tr"+(d.dono==="ambev"?"":" style='opacity:.85'")+"><td>"+esc(m)+(d.dono==="ambev"?" <span class='badge coletado'>ambev</span>":"")+"</td><td><b>"+fmtN(sh,1)+"%</b></td><td>R$ "+fmtN(p.preco[m]||d.preco,2)+"</td><td class='small' style='color:"+COR_GRUPO[GRUPO_DE[m]]+"'>"+esc(GRUPO_DE[m])+"</td></tr>"; }).join("")}
  </table></div>`;
  const d=disputaEspaco(p);
  h+=`<div class="card"><h3 style="font-size:1.1rem">Espaço por categoria</h3>
    ${d.cats.map(c=>`<div class="degrau"><div class="nm">${esc(c.c)}</div><div class="bar" style="flex:1;height:16px"><div style="width:${c.fr.toFixed(0)}%"></div></div><div class="tiny" style="font-size:.8rem">${c.fr.toFixed(0)}%</div></div>`).join("")}
    <div class="small" style="margin-top:8px">${esc(d.leitura)}</div></div>`;
  return h;
}

/* ---------- TERRITÓRIO v3: carteira do rep ---------- */
function renderTerritorio(){
  const f=ESTADO.filtrosTerr||{tipo:"",classe:""};
  let pds=BASE.pdvs;
  if(f.tipo) pds=pds.filter(p=>p.tipo===f.tipo);
  if(f.classe) pds=pds.filter(p=>p.classe===f.classe);
  const norm=scoreOportunidadeNorm();
  const agir=pds.filter(p=>p.anamnese==="completa").sort((a,b)=>(norm[b.id]||0)-(norm[a.id]||0));
  const medir=pds.filter(p=>p.anamnese!=="completa").sort((a,b)=>scoreColeta(b)-scoreColeta(a));
  const deltas=pds.map(p=>({p,d:deltasPDV(p)})).filter(x=>x.d);
  const hlTotal=pds.reduce((a,p)=>a+hlTotalMes(p),0);
  const hlAm=pds.reduce((a,p)=>a+ambevHL(p),0);
  let h=`<div class="hero-share">
    <div class="grande" style="color:var(--red)">${fmtN(pct(hlAm,hlTotal),1)}<span style="font-size:2rem">%</span></div>
    <div class="rua-lbl">share Ambev da carteira · ${pds.length} PDVs · ${fmtN(hlTotal,0)} HL/mês</div>
    <div class="bar" style="margin-top:10px;height:12px"><div style="width:${Math.min(100,pct(hlAm,hlTotal))}%"></div></div>
    <div class="grid g2" style="margin-top:10px">
      <select onchange="ESTADO.filtrosTerr.tipo=this.value;salvarEstado();go('territorio')" style="min-height:52px">
        <option value="">Todos os tipos</option>${["Bar","Restaurante","Distribuidora","Mercado","Lanchonete","Casa Noturna"]
          .map(t=>'<option'+(f.tipo===t?" selected":"")+'>'+t+'</option>').join("")}</select>
      <select onchange="ESTADO.filtrosTerr.classe=this.value;salvarEstado();go('territorio')" style="min-height:52px">
        <option value="">Todas as classes</option>${["A","B","C"].map(c=>'<option'+(f.classe===c?" selected":"")+'>'+c+'</option>').join("")}</select>
    </div>
  </div>`;
  h+=`<div class="card" style="margin-top:12px"><h3 style="font-size:1.1rem">🎯 Onde agir <span class="hint">top ${Math.min(10,agir.length)}</span></h3>
    ${agir.slice(0,10).map((p,i)=>{ const v=veredito(p);
      return `<div class="marca-linha" onclick="abrirPDV('${p.id}')" style="cursor:pointer">
        <div class="nm" style="width:auto">${(i+1)}. ${esc(p.nome)}</div>
        <div class="pct" style="font-size:1.3rem;color:var(--red2)">${fmtN(ambevShare(p),1)}%</div>
        <div class="alv" style="text-align:right"><b>${esc(v.ma.alvo.m)}</b><br><span class="tiny">gap ${fmtN(v.gap.hl||0,1)} HL</span></div>
      </div>`; }).join("")}
  </div>`;
  h+=`<div class="card"><h3 style="font-size:1.1rem">📏 Onde medir <span class="hint">${medir.length} PDVs</span></h3>
    ${medir.slice(0,8).map(p=>linhaColeta(p)).join("")||'<div class="empty"><div class="ic">✅</div>Tudo medido.</div>'}</div>`;
  h+=`<div class="card"><h3 style="font-size:1.1rem">📊 Antes e depois <span class="hint">2+ medições</span></h3>`;
  if(!deltas.length) h+=`<div class="aviso" style="font-size:.9rem">Aguardando 2ª medição — nenhum resultado sem prova.</div>`;
  else deltas.forEach(x=>h+=`<div class="marca-linha"><div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
    <div class="pct" style="font-size:1.3rem">${seta(x.d.dShare)}</div>
    <div class="alv" style="text-align:right"><span class="tiny">${esc(fmtData(x.d.primeira))} → ${esc(fmtData(x.d.ultima))}</span></div></div>`);
  h+=`</div>`;
  const pil=piloto90().filter(x=>pds.some(p=>p.id===x.p.id));
  h+=`<div class="card"><h3 style="font-size:1.1rem">🧪 Piloto 90 dias</h3>
    ${pil.slice(0,5).map(x=>`<div class="marca-linha"><div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
      <div class="alv" style="text-align:right">meta +${x.metaPp} p.p. · <span class="chip-rua ${x.status==="Em curso"?"chip info":"chip"}">${esc(x.status)}</span></div></div>`).join("")}
  </div>`;
  h+=secAlertas();
  return h;
}

/* ---------- CONFIG v3: catálogo com grupos editáveis ---------- */
function renderConfig(){
  let h=`<div class="card"><h3>Catálogo de marcas e grupos <span class="hint">${FONTE_V3.grupos.fonte}</span></h3>
    <table><tr><th>Marca</th><th>Grupo</th><th>Tier</th><th>Preço ref.</th></tr>
    ${MARCAS_V3.map(m=>{ const d=PORT[m]||PORT_V3[m];
      return "<tr><td>"+esc(m)+"</td><td style='color:"+COR_GRUPO[GRUPO_DE[m]]+"'>"+esc(GRUPO_DE[m])+"</td><td>"+esc(TIER_NOME[d.tier])+"</td><td>R$ "+fmtN(d.preco,2)+"</td></tr>"; }).join("")}
    </table><div class="tiny" style="margin-top:6px">Preços das marcas novas (${Object.keys(PORT_V3).join(", ")}) são ${badgeOrigem("estimativa")} — editar abaixo antes de usar em campo.</div>
    <details style="margin-top:10px"><summary class="btn" style="list-style:none">✏️ Editar preços das marcas novas</summary>
    <div style="margin-top:10px">
      ${Object.keys(PORT_V3).map(m=>`<label>${m} — preço de referência (R$)</label><input type="number" step="0.01" value="${PORT_V3[m].preco}" onchange="PORT_V3['${m}'].preco=Number(this.value)||${PORT_V3[m].preco};toast('Preço salvo: ${m}')">`).join("")}
    </div></details></div>`;
  h+=`<div class="card"><h3>Painel de parâmetros <span class="hint">fonte e data em cada um</span></h3>
    <details style="margin-top:6px"><summary class="btn" style="list-style:none">✏️ Editar metas e fatores</summary>
    <div style="margin-top:10px">
      ${["meta_share_ambev","meta_bsv","meta_ruptura_max"].map(k=>`<label>${k}</label><input type="number" step="0.01" value="${PARAMS[k]}" onchange="paramSave('${k}',this.value)">`).join("")}
      <label>fator de captura — balde</label><input type="number" step="0.01" value="${PARAMS.fator_captura.balde}" onchange="PARAMS.fator_captura.balde=Number(this.value)||0.2;salvarParams()">
      <label>fator de captura — fridge</label><input type="number" step="0.01" value="${PARAMS.fator_captura.fridge}" onchange="PARAMS.fator_captura.fridge=Number(this.value)||0.15;salvarParams()">
      <label>pesos da equidade — demanda/fridge/material/preço</label>
      <div class="grid g4">
        <input type="number" step="0.01" value="${PARAMS.pesos_equidade.demanda}" onchange="PARAMS.pesos_equidade.demanda=Number(this.value)||0;salvarParams()">
        <input type="number" step="0.01" value="${PARAMS.pesos_equidade.fridge}" onchange="PARAMS.pesos_equidade.fridge=Number(this.value)||0;salvarParams()">
        <input type="number" step="0.01" value="${PARAMS.pesos_equidade.material}" onchange="PARAMS.pesos_equidade.material=Number(this.value)||0;salvarParams()">
        <input type="number" step="0.01" value="${PARAMS.pesos_equidade.preco}" onchange="PARAMS.pesos_equidade.preco=Number(this.value)||0;salvarParams()">
      </div>
    </div></details></div>`;
  h+=`<div class="card"><h3>Fonte de dados</h3>
    <div class="grid g2">
      <button class="btn" onclick="exportCSV()">⬇️ Exportar CSV</button>
      <button class="btn" onclick="importCSV()">⬆️ Importar CSV</button>
      <button class="btn" onclick="exportXLSX()">📊 Exportar XLSX</button>
      <button class="btn" onclick="resetMockV3()">🔄 Restaurar base mock</button>
    </div>
    <div class="tiny" style="margin-top:8px">Base ativa: ${BASE.pdvs.length} PDVs · ${BASE.ficticio?'<b style="color:var(--warn)">DADOS FICTÍCIOS</b>':"base própria"}</div></div>`;
  h+=secFeed();
  return h;
}
function resetMockV3(){ BASE=gerarBaseMockV3(); salvarBase(); hidratarV2Base(); seedHistDemo();
  ESTADO.rotaDia=null; ESTADO.ordemHoje=null; salvarEstado(); rodarMotor(); go("config"); toast("Base mock v3 restaurada"); }

/* ---------- boot v3 ---------- */
ensureBaseV3();
rebuildTabs();
go(ESTADO.aba==="visoes"?"territorio":(ESTADO.aba||"hoje"));