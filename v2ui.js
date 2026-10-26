/* =====================================================================
   BrandFit v2 — UI (carregada por último; redefine as telas v1)
   ===================================================================== */
"use strict";

/* ---------- helpers v2 ---------- */
function sparkline(vals,w,h){
  if(!vals||vals.length<2) return "";
  const min=Math.min(...vals), max=Math.max(...vals), rng=(max-min)||1;
  const pts=vals.map((v,i)=>(i/(vals.length-1)*w).toFixed(1)+","+(h-2-(v-min)/rng*(h-4)).toFixed(1)).join(" ");
  return '<svg width="'+w+'" height="'+h+'" style="display:block"><polyline points="'+pts+'" fill="none" stroke="var(--red)" stroke-width="2"/></svg>';
}
function chipAmbar(txt){ return '<span class="chip warn">'+esc(txt)+'</span>'; }
function fmtDur(min){ const h=Math.floor(min/60), m=Math.round(min%60); return (h?h+"h":"")+(m?(h?String(m).padStart(2,"0"):m)+"m":h?"":"0m"); }
function seta(v){ return v>0?'<span style="color:var(--ok)">▲ +'+fmtN(v,1)+'</span>':v<0?'<span style="color:var(--bad)">▼ '+fmtN(v,1)+'</span>':'<span class="muted">= '+fmtN(v,1)+'</span>'; }

/* ---------- F5: rota curada ---------- */
function propostaRota(n){
  const norm=scoreOportunidadeNorm();
  const elegiveis=BASE.pdvs.filter(p=>p.anamnese==="completa").sort((a,b)=>(norm[b.id]||0)-(norm[a.id]||0));
  const top=elegiveis.slice(0,n);
  // agrupa por bairro (mantém os N melhores, só reordena para reduzir deslocamento)
  const porBairro={}; top.forEach(p=>{ (porBairro[p.bairro||"—"]=porBairro[p.bairro||"—"]||[]).push(p); });
  const ordem=[]; Object.keys(porBairro).sort((a,b)=>porBairro[b].length-porBairro[a].length)
    .forEach(b=>porBairro[b].forEach(p=>ordem.push(p)));
  return ordem;
}
function rotaDia(){
  if(!ESTADO.rotaDia||ESTADO.rotaDia.ids==null||ESTADO.rotaDia.n!==rotaN()){
    ESTADO.rotaDia={n:rotaN(), ids:propostaRota(rotaN()).map(p=>p.id), data:"hoje"};
    salvarEstado();
  }
  return ESTADO.rotaDia;
}
function rotaN(){ return Math.min(PARAMS.rota_n_max,Math.max(PARAMS.rota_n_min,ESTADO.rotaDia&&ESTADO.rotaDia.n||PARAMS.rota_n_default)); }
function tempoDia(pds){
  const desl=PARAMS.deslocamento_min||12;
  return pds.reduce((a,p)=>a+(acaoDoDia(p).tempo||10)+desl,0);
}
function visitasRegistradas(iniISO,fimISO){
  const out=[];
  BASE.pdvs.forEach(p=>{
    const r=ESTADO["reg_"+p.id];
    if(r&&r.data>=iniISO&&r.data<=fimISO) out.push({p,r,st:ESTADO.visitas[p.id]||"pendente"});
  });
  return out.sort((a,b)=>b.r.data.localeCompare(a.r.data));
}

/* ---------- TAB 1 · HOJE (v2) ---------- */
function renderHoje(){
  const rd=rotaDia(), modo=ESTADO.hojeModo||"agir";
  const pds=BASE.pdvs;
  const rota=rd.ids.map(id=>pds.find(p=>p.id===id)).filter(Boolean);
  const st=ESTADO.visitas;
  const concl=rota.filter(p=>st[p.id]==="concluido").length;
  const coleta=BASE.pdvs.filter(p=>p.anamnese!=="completa").sort((a,b)=>scoreColeta(b)-scoreColeta(a));
  const hojeISO=new Date().toISOString().slice(0,10);
  const tDia=tempoDia(rota);
  let h=`<div class="card">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="flex:1">
        <div style="font-size:.78rem;color:var(--txt2)">${concl} de ${rota.length} visitas concluídas · ${fmtDur(tDia)} no total</div>
        <div class="tiny">Rota curada (máx. ${rotaN()}) · agrupada por bairro · ${coleta.length} PDVs na fila de coleta</div>
      </div>
      <button class="btn" onclick="copiarResumoDia()">📋 Resumo</button>
    </div>
    <div class="bar ${concl===rota.length?"ok":""}" style="margin-top:8px"><div style="width:${pct(concl,rota.length||1)}%"></div></div>
    <div class="grid g3" style="margin-top:10px">
      <select onchange="ESTADO.rotaDia.n=+this.value;ESTADO.rotaDia.ids=null;salvarEstado();go('hoje')">
        ${[6,8,10,12,14].map(n=>'<option value="'+n+'"'+(rotaN()===n?" selected":"")+'>'+n+' visitas</option>').join("")}
      </select>
      <select onchange="mudarDataRota(this.value)">
        <option value="hoje"${rd.data==="hoje"?" selected":""}>Hoje</option>
        <option value="ontem"${rd.data==="ontem"?" selected":""}>Ontem</option>
        <option value="semana"${rd.data==="semana"?" selected":""}>Esta semana</option>
      </select>
      <button class="btn" onclick="reproporRota()">↻ Re-propor rota</button>
    </div>
  </div>`;
  h+=`<div class="card"><h3>Dois trabalhos, dois rankings <span class="hint">nunca um índice único</span></h3>
    <div class="grid g2">
      <button class="btn ${modo==="agir"?"primary":""}" onclick="ESTADO.hojeModo='agir';salvarEstado();go('hoje')">🎯 Onde agir</button>
      <button class="btn ${modo==="medir"?"primary":""}" onclick="ESTADO.hojeModo='medir';salvarEstado();go('hoje')">📏 Onde medir</button>
    </div>
    <div class="tiny" style="margin-top:6px">"Onde agir" = score de oportunidade (piso da faixa × confiança) — só anamnese completa. "Onde medir" = score de coleta (campos-chave faltantes).</div></div>`;
  if(rd.data!=="hoje"){
    const ini=rd.data==="ontem"?hojeISO:addDays(hojeISO,-7), fim=hojeISO;
    const regs=visitasRegistradas(ini,fim);
    h+=`<div class="card"><h3>${rd.data==="ontem"?"Visitas de ontem":"Visitas desta semana"} <span class="hint">${regs.length} registradas</span></h3>`;
    if(!regs.length) h+=`<div class="empty"><div class="ic">🗓️</div>Sem visitas registradas neste período — os registros aparecem ao concluir visitas.</div>`;
    else regs.forEach(x=>h+=`<div class="degrau" style="margin:6px 0"><div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
      <span class="tiny">${esc(x.r.data)} · ${esc(x.r.nota||"sem nota")}</span><span class="progress-pill ${x.st==="concluido"?"c":"e"}">${x.st}</span></div>`);
    h+=`</div>`;
    return h;
  }
  if(modo==="agir"){
    h+=`<div class="card"><h3>🎯 Rota do dia — execução <span class="hint">só anamnese completa · ${fmtDur(tDia)}</span></h3>`;
    if(!rota.length) h+=`<div class="empty"><div class="ic">🎯</div>Sem PDVs elegíveis — complete anamneses para liberar execução.</div>`;
    else rota.forEach((p,i)=>h+=cardVisitaV2(p,i+1));
    h+=`</div>`;
    h+=`<div class="card"><h3>📏 Fila de coleta <span class="hint">${coleta.length} PDVs · fora da rota de execução</span></h3>
      <div class="tiny" style="margin-bottom:6px">PDV incompleto não recebe ação prescritiva — vive aqui até medir.</div>`;
    coleta.slice(0,4).forEach(p=>h+=linhaColeta(p));
    if(coleta.length>4) h+=`<button class="btn block" style="margin-top:8px" onclick="ESTADO.hojeModo='medir';salvarEstado();go('hoje')">Ver os ${coleta.length} PDVs a medir</button>`;
    h+=`</div>`;
  } else {
    h+=`<div class="card"><h3>📏 Fila de coleta <span class="hint">${coleta.length} PDVs por score de coleta</span></h3>
      <div class="tiny" style="margin-bottom:6px">Score = campos-chave faltantes ponderados (ausente 1,0 · estimado 0,4). Topo = medir primeiro.</div>`;
    if(!coleta.length) h+=`<div class="empty"><div class="ic">✅</div>Nada a medir — anamnese completa em todo o território.</div>`;
    else coleta.forEach(p=>h+=linhaColeta(p));
    h+=`</div>`;
    h+=`<div class="card"><h3>🎯 Rota do dia <span class="hint">${concl}/${rota.length} · ${fmtDur(tDia)}</span></h3>
      <button class="btn block" onclick="ESTADO.hojeModo='agir';salvarEstado();go('hoje')">Ver rota de execução</button></div>`;
  }
  return h;
}
function mudarDataRota(v){ if(ESTADO.rotaDia) ESTADO.rotaDia.data=v; salvarEstado(); go("hoje"); }
function reproporRota(){ ESTADO.rotaDia={n:rotaN(), ids:propostaRota(rotaN()).map(p=>p.id), data:"hoje"}; salvarEstado(); go("hoje"); toast("Rota re-proposta: top "+rotaN()+" por oportunidade, agrupada por bairro"); }
function linhaColeta(p){
  const sc=scoreColeta(p), falt=camposFaltantes(p);
  let acaoHtml="";
  if(p.anamnese==="parcial"){
    const a=acaoDoDia(p), mt=metaDaAcao(p,(a.tipo||"material"));
    acaoHtml=`<div class="acao-dia" style="border-color:rgba(232,161,60,.45);background:rgba(232,161,60,.08);margin:6px 0">
      <div class="t" style="color:var(--warn)">${chipAmbar("Ação provisória")} · sujeita a revisão após completar a anamnese</div>
      <div class="a small">${esc(a.titulo)}</div>
      <div class="tiny">Faltam medir: <b>${esc(falt.join(", "))}</b></div>
      <div class="tiny">Meta provisória: +${mt.metaCx} caixas/mês <a style="cursor:pointer" onclick="modalMemoria('Memória de cálculo — ${esc(p.nome)}','${mt.memoria}','${mt.aviso?esc(mt.aviso):"Trava: meta ≤ gap (regra v2)."}')">ver cálculo</a></div></div>`;
  }
  return `<div class="degrau" style="margin:6px 0;align-items:flex-start">
    <span class="semaforo ${sc>60?"r":sc>30?"y":"g"}" style="margin-top:6px"></span>
    <div style="flex:1;min-width:0"><div class="small"><b>${esc(p.nome)}</b> · ${esc(p.tipo)} ${esc(p.classe)}</div>
    <div class="tiny">anamnese ${esc(p.anamnese)} · coleta pendente ${sc}%${falt.length?" · faltam: "+esc(falt.join(", ")):""}</div>
    ${acaoHtml}</div>
    <button class="btn" style="padding:5px 10px;font-size:.7rem" onclick="abrirPDV('${p.id}')">Medir</button></div>`;
}
/* card de visita com F1 (gate) + F2 (meta com memória) */
function cardVisitaV2(p,num){
  const st=ESTADO.visitas[p.id]||"pendente";
  const a=acaoDoDia(p), v=veredito(p);
  const cls=st==="concluido"?" done":"";
  const pill=st==="concluido"?'<span class="progress-pill c">concluído</span>'
    :st==="em_visita"?'<span class="progress-pill e">em visita</span>'
    :'<span class="progress-pill p">pendente</span>';
  let acaoHtml;
  if(p.anamnese==="pendente"){
    acaoHtml=`<div class="acao-dia"><div class="t">Ação do dia · coleta obrigatória</div>
      <div class="a">${esc(a.titulo)}</div><div class="j">Por quê: ${esc(a.justificativa)}</div></div>`;
  } else if(p.anamnese==="parcial"){
    const falt=camposFaltantes(p);
    const mt=metaDaAcao(p,(a.tipo||"material"));
    acaoHtml=`<div class="acao-dia" style="border-color:rgba(232,161,60,.45);background:rgba(232,161,60,.08)">
      <div class="t" style="color:var(--warn)">${chipAmbar("Ação provisória")} · sujeita a revisão após completar a anamnese</div>
      <div class="a">${esc(a.titulo)}</div><div class="j">Por quê: ${esc(a.justificativa)}</div>
      ${falt.length?'<div class="tiny" style="margin-top:4px">Faltam medir: <b>'+esc(falt.join(", "))+'</b></div>':""}
      <div class="tiny" style="margin-top:4px">Meta provisória: +${mt.metaCx} caixas/mês <a style="cursor:pointer" onclick="modalMemoria('Memória de cálculo — ${esc(p.nome)}','${mt.memoria}','${mt.aviso?esc(mt.aviso):"Trava: meta ≤ gap (regra v2)."}')">ver cálculo</a></div></div>`;
  } else {
    const mt=metaDaAcao(p,(a.tipo||"material"));
    acaoHtml=`<div class="acao-dia"><div class="t">Ação do dia · marca-alvo: ${esc(v.ma.alvo.m)}</div>
      <div class="a">${esc(a.titulo)}</div><div class="j">Por quê: ${esc(a.justificativa)}</div>
      <div class="tiny" style="margin-top:4px">Meta: <b>+${mt.metaCx} caixas/mês</b> (gap ${mt.gapCx} caixas) <a style="cursor:pointer" onclick="modalMemoria('Memória de cálculo — ${esc(p.nome)}','${mt.memoria}','${mt.aviso?esc(mt.aviso):"Trava dura: meta ≤ gap em caixas (regra v2)."}')">ver cálculo</a></div></div>`;
  }
  return `<div class="visita${cls}" data-id="${p.id}">
    <div class="head" onclick="toggleVisita('${p.id}')">
      <span class="handle" onclick="event.stopPropagation();dragStart(event,'${p.id}')" draggable="true">⠿</span>
      <span class="n">${num}</span>
      <div style="flex:1;min-width:0">
        <div class="nome">${esc(p.nome)} <span class="chip">bairro ${esc(p.bairro||"—")}</span></div>
        <div class="meta">${esc(p.tipo)} · classe ${esc(p.classe)} · oportunidade ${scoreOportunidadeNorm()[p.id]||0}/100 · confiança ${scoreConfianca(p)}%</div>
      </div>
      ${pill}<span style="color:var(--txt3)">▾</span>
    </div>
    <div class="body">
      ${acaoHtml}
      <div class="grid g3 tiny" style="margin-bottom:8px">
        <div>Share Ambev<br><b class="small">${fmtN(ambevShare(p),1)}%</b></div>
        <div>BSV<br><b class="small">${fmtN(p.bsv,1)}%</b></div>
        <div>Equidade<br><b class="small">${equidadePDV(p)}/100</b></div>
      </div>
      <div class="acts">
        <button class="btn" onclick="registrarVisita('${p.id}')">⏱️ Registrar</button>
        <button class="btn" onclick="abrirPDV('${p.id}')">🏪 Abrir PDV</button>
        <button class="btn ${st==="concluido"?"":"primary"}" onclick="marcarFeita('${p.id}')">${st==="concluido"?"✓ Feita":"Marcar feita"}</button>
      </div>
    </div>
  </div>`;
}
/* F4: ordenar rota = proposta curada (sem soma gap+anamnese+ruptura) */
function ordenarPorPrioridade(){ reproporRota(); }
function ordenarPorHL(){
  const rd=rotaDia();
  ESTADO.rotaDia={n:rd.n, ids:rd.ids.map(id=>BASE.pdvs.find(p=>p.id===id)).filter(Boolean)
    .sort((a,b)=>b.hl_total_mes-a.hl_total_mes).map(p=>p.id), data:rd.data};
  salvarEstado(); go("hoje"); toast("Rota reordenada por HL/mês");
}

/* ---------- TAB 2 · PDV (v2): + Economia, Canal, Evolução ---------- */
function renderPdv(){
  const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
  const v=veredito(p), sub=ESTADO.subPdv||"anamnese";
  const subs=[["anamnese","📋 Anamnese"],["diagnostico","🔍 Diagnóstico"],["kpis","📊 KPIs"],["estrategia","🎯 Estratégia"],["plano","🗓️ Plano"],["economia","💰 Economia"],["canal","🚚 Canal"],["evolucao","📈 Evolução"]];
  let h=`<div class="sticky-top">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <button class="btn ghost" onclick="go('hoje')" style="padding:6px 10px">←</button>
      <select onchange="ESTADO.pdvAtual=this.value;salvarEstado();go('pdv')" style="flex:1">
        ${BASE.pdvs.map(x=>'<option value="'+x.id+'"'+(x.id===p.id?" selected":"")+'>'+esc(x.nome)+" · "+esc(x.tipo)+" "+esc(x.classe)+" · "+fmtN(x.hl_total_mes,1)+" HL</option>").join("")}
      </select>
    </div>
    <div class="grid g4">
      <div class="kpi" onclick="ESTADO.subPdv='anamnese';salvarEstado();go('pdv')">
        <div class="v">${fmtN(p.pot_med,1)}${p.origem_potencial!=="coletado"?"<span class='tiny'> ±</span>":""}</div>
        <div class="l">Potencial HL/mês</div><div class="m">${p.origem_potencial==="coletado"?"medido":"faixa "+fmtN(p.pot_inf,0)+"–"+fmtN(p.pot_sup,0)}</div></div>
      <div class="kpi" onclick="ESTADO.subPdv='diagnostico';salvarEstado();go('pdv')">
        <div class="v">${fmtN(ambevShare(p),1)}%</div><div class="l">Share Ambev</div>
        <div class="m">BSV ${fmtN(p.bsv,1)}%</div></div>
      <div class="kpi" onclick="ESTADO.subPdv='evolucao';salvarEstado();go('pdv')">
        <div class="v">${equidadePDV(p)}</div><div class="l">Equidade 0–100</div><div class="m">${esc(CANAL_NOME[canalDe(p)].split(" ")[0])}</div></div>
      <div class="kpi" onclick="ESTADO.subPdv='diagnostico';salvarEstado();go('pdv')">
        <div class="v">${p.anamnese!=="completa"?"—":esc(v.ma.alvo.m)}</div><div class="l">Marca-alvo</div>
        <div class="m">${p.anamnese==="completa"?esc(TIER_NOME[v.ma.alvo.t]):"requer anamnese completa"}</div></div>
    </div>
  </div>
  <div class="subtabs">
    ${subs.map(x=>'<button class="subtab'+(sub===x[0]?" active":"")+'" onclick="ESTADO.subPdv=\''+x[0]+'\';salvarEstado();go(\'pdv\')">'+x[1]+'</button>').join("")}
  </div>`;
  if(sub==="anamnese") h+=secAnamneseV2(p); /* fix v7b: dispatch para a v2 (v1 + bloco 6) */
  else if(sub==="diagnostico") h+=secDiagnostico(p,v);
  else if(sub==="kpis") h+=secKpis(p);
  else if(sub==="estrategia") h+=secEstrategia(p);
  else if(sub==="plano") h+=secPlano(p);
  else if(sub==="economia") h+=secEconomia(p);
  else if(sub==="canal") h+=secCanal(p);
  else if(sub==="evolucao") h+=secEvolucao(p);
  return h;
}
/* anamnese v1 + bloco 6 (economia e canal) */
/* fix v7b: função com nome próprio — secAnamneseV1 (v1, ui1.js) + bloco 6.
   Antes: const secAnamneseV1=secAnamnese; function secAnamnese(){...} — o hoisting
   fazia V1 capturar a própria nova e a Coleta entrava em recursão infinita. */
const secAnamneseV1=(typeof secAnamnese==="function"&&secAnamnese!==secAnamneseV2)?secAnamnese:null;
function secAnamneseV2(p){
  return secAnamneseV1(p)+`<div class="card"><h3>6 · Economia do ponto e canal <span class="hint">alimenta 💰 Economia e 🚚 Canal</span></h3>
    <div class="grid g2">
      <div><label>Canal</label><select onchange="anamSave('${p.id}','canal',this.value)">
        <option value=""${!p.canal?" selected":""}>— derivado do tipo —</option>
        <option value="on-trade"${p.canal==="on-trade"?" selected":""}>on-trade</option>
        <option value="off-trade"${p.canal==="off-trade"?" selected":""}>off-trade</option></select></div>
      <div><label>Subtipo de compra</label><select onchange="anamSave('${p.id}','subtipo_compra',this.value)">
        <option value=""${!p.subtipo_compra?" selected":""}>—</option>
        ${["direto","distribuidor","atacado"].map(s=>'<option'+(p.subtipo_compra===s?" selected":"")+'>'+s+'</option>').join("")}</select></div>
    </div>
    <label>Custo da caixa de lata 350 (R$ — preço de compra)</label><input type="number" step="0.01" value="${esc(p.custo_lata||"")}" onchange="anamSave('${p.id}','custo_lata',this.value)">
    <label>Custo do barril de chope (R$)</label><input type="number" step="0.01" value="${esc(p.custo_barril||"")}" onchange="anamSave('${p.id}','custo_barril',this.value)">
    <div class="grid g2">
      <div><label>Barril (litros)</label><input type="number" value="${esc(p.barril_litros||"")}" onchange="anamSave('${p.id}','barril_litros',this.value)"></div>
      <div><label>Dose servida (ml)</label><input type="number" value="${esc(p.dose_ml||"")}" onchange="anamSave('${p.id}','dose_ml',this.value)"></div>
    </div>
    <label>Perda de linha (%)</label><input type="number" step="0.5" value="${esc(p.perda_linha_pct!=null&&p.perda_linha_pct!==""?p.perda_linha_pct:"")}" onchange="anamSave('${p.id}','perda_linha_pct',this.value)">
    <label>Preço da dose de chope (R$)</label><input type="number" step="0.5" value="${esc(p.preco_chope||"")}" onchange="anamSave('${p.id}','preco_chope',this.value)">
    <div class="grid g2">
      <div><label>Custo fixo mensal do PDV (R$)</label><input type="number" value="${esc(p.custo_fixo_mes||"")}" onchange="anamSave('${p.id}','custo_fixo_mes',this.value)"></div>
      <div><label>Estoque médio — caixas lata</label><input type="number" value="${esc(p.estoque_medio||"")}" onchange="anamSave('${p.id}','estoque_medio',this.value)"></div>
    </div>
    <label>Verba de trade do mês (R$)</label><input type="number" value="${esc(p.verba_trade_mes!=null&&p.verba_trade_mes!==""?p.verba_trade_mes:"")}" onchange="anamSave('${p.id}','verba_trade_mes',this.value)">
    <label>Material de PDV ativo?</label><select onchange="anamSave('${p.id}','material_pdv',this.value==='true')">
      <option value="true"${p.material_pdv?" selected":""}>Sim</option><option value="false"${!p.material_pdv?" selected":""}>Não</option></select>
    <div class="tiny" style="margin-top:6px">Sem custo + ficha técnica coletados, a seção 💰 Economia fica marcada como pendente de coleta — nunca estimada em silêncio.</div>
  </div>`;
}

/* ---------- BLOCO A · Economia do ponto ---------- */
function secEconomia(p){
  const linhas=linhasEconomia(p);
  const pe=pontoEquilibrioLitros(p);
  let h=`<div class="card"><h3>💰 Economia do ponto <span class="hint">a conversa com o dono do bar</span></h3>
    <div class="tiny" style="margin-bottom:8px">Margem do PDV por SKU — o que o dono ganha, não o que a Ambev ganha. Todo número com memória de cálculo.</div>`;
  if(!linhas.length){
    h+=`<div class="aviso">Pendente de coleta: custo de compra e ficha técnica (caixa/barril, dose, perda de linha). Colete na aba 📋 Anamnese → bloco 6. Sem esses dados, nada é estimado aqui.</div></div>`;
    return h;
  }
  h+=`<table><tr><th>SKU</th><th>Custo/dose</th><th>Preço</th><th>Margem</th><th>Markup</th><th>Giro</th><th>Semáforo</th></tr>`;
  linhas.forEach(l=>{
    const s=semaforoSKU(l);
    h+=`<tr><td class="small">${esc(l.sku)}</td><td>R$ ${fmtN(l.custoDose,2)}</td><td>R$ ${fmtN(l.precoV,2)}</td>
      <td style="color:${l.margemPct>=40?"var(--ok)":l.margemPct<25?"var(--bad)":"var(--warn)"}">R$ ${fmtN(l.margemR,2)} · ${fmtN(l.margemPct,0)}%</td>
      <td>${fmtN(l.markup,2)}×</td><td class="small">${l.giro!=null?fmtN(l.giro,1)+"×/mês · "+Math.round(l.dias)+" d":"sem estoque médio"}</td>
      <td><span class="semaforo ${s.c}"></span><span class="tiny">${esc(s.t)}</span></td></tr>`;
  });
  h+=`</table>`;
  linhas.forEach((l,i)=>h+=`<button class="btn block" style="margin-top:6px;font-size:.72rem" onclick="modalMemoria('Memória de cálculo — ${esc(l.sku)}','${esc(l.memoria)}','Markup alvo do segmento: ${fmtN(PARAMS.markup_alvo[canalDe(p)],2)}× (parâmetro com fonte no painel).')">🧮 Ver cálculo — ${esc(l.sku.split(" (")[0])}</button>`);
  h+=`<div class="tiny" style="margin-top:6px">Markup praticado vs alvo do canal ${esc(canalDe(p))}: ${linhas.map(l=>fmtN(l.markup,2)+"×").join(" · ")} vs ${fmtN(PARAMS.markup_alvo[canalDe(p)],2)}×.</div>`;
  h+=`</div>`;
  if(pe) h+=`<div class="card"><h3>Ponto de equilíbrio</h3>
    <div class="grid g2"><div class="kpi"><div class="v">${Math.round(pe.litros).toLocaleString("pt-BR")} L</div><div class="l">litros/mês para cobrir custo fixo</div></div>
    <div class="kpi"><div class="v">${fmtN(pe.litros/100,1)} HL</div><div class="l">equivalente em HL/mês</div></div></div>
    <button class="btn block" style="margin-top:8px" onclick="modalMemoria('Memória de cálculo — ponto de equilíbrio','${esc(pe.memoria)}','')">🧮 Ver cálculo</button></div>`;
  else h+=`<div class="card"><h3>Ponto de equilíbrio</h3><div class="aviso">Pendente de coleta: custo fixo mensal do PDV (bloco 6 da anamnese).</div></div>`;
  return h;
}

/* ---------- BLOCO B · Canal e política comercial ---------- */
function secCanal(p){
  const canal=canalDe(p), pol=PARAMS.politica_comercial[canal];
  const fo=PARAMS_FONTE.politica_comercial;
  const ts=tradeSpend(p);
  const ad=aderenciaPolitica();
  const dentro=precoCompliance(p);
  let h=`<div class="card"><h3>🚚 Canal <span class="hint">on/off-trade são economias distintas</span></h3>
    <div class="grid g2">
      <div class="kpi"><div class="v" style="font-size:.95rem">${esc(CANAL_NOME[canal])}</div><div class="l">canal do PDV</div><div class="m">${p.canal?"informado na anamnese":"derivado do tipo "+esc(p.tipo)} ${badgeOrigem(p.canal?"coletado":"estimado")}</div></div>
      <div class="kpi"><div class="v" style="font-size:.95rem">${esc(p.subtipo_compra||"—")}</div><div class="l">subtipo de compra</div><div class="m">direto · distribuidor · atacado</div></div>
    </div>
    <div class="tiny" style="margin-top:8px">Fair share deste PDV é calculado só contra PDVs do mesmo canal — a mediana nunca mistura bar com mercado.</div></div>`;
  h+=`<div class="card"><h3>Política comercial do canal <span class="hint">${esc(fo.fonte)} · ${fo.data} ${fo.validado?badgeOrigem("coletado"):badgeOrigem("estimativa")}</span></h3>
    <table><tr><th>Parâmetro</th><th>${canal==="on-trade"?"On-trade":"Off-trade"}</th></tr>
    <tr><td>Desconto máximo</td><td>${pol.desconto_max_pct}%</td></tr>
    <tr><td>Prazo</td><td>${pol.prazo_dias} dias</td></tr>
    <tr><td>Bonificação</td><td>${esc(pol.bonificacao)}</td></tr>
    <tr><td>Verba de trade</td><td>${pol.verba_trade_pct}% da receita</td></tr>
    </table></div>`;
  h+=`<div class="card"><h3>Aderência à política comercial</h3>
    <div class="grid g2">
      <div class="kpi"><div class="v" style="color:${dentro?"var(--ok)":"var(--bad)"}">${dentro?"Dentro":"Fora"}</div><div class="l">preço praticado × faixa aprovada</div><div class="m">tolerância ±${PARAMS.faixa_preco_canal_pct}% da referência</div></div>
      <div class="kpi"><div class="v">${ad.pct}%</div><div class="l">aderência do território</div><div class="m">${ad.ok} de ${ad.total} PDVs completos</div></div>
    </div></div>`;
  h+=`<div class="card"><h3>Trade spend <span class="hint">verba ÷ HL incremental</span></h3>`;
  if(!ts) h+=`<div class="aviso">Sem verba de trade registrada neste PDV (bloco 6 da anamnese). Ao registrar, o retorno aparece aqui: verba ÷ HL incremental desde a linha de base.</div>`;
  else if(ts.status==="pendente") h+=`<div class="aviso">Verba de ${fmtBRL(ts.verba)} registrada, mas sem HL incremental medido ainda — aguardando 2ª medição (regra de honestidade).</div>`;
  else h+=`<div class="grid g2">
      <div class="kpi"><div class="v">${fmtBRL(ts.verba)}</div><div class="l">verba investida</div><div class="m">+${fmtN(ts.hl,1)} HL incrementais</div></div>
      <div class="kpi"><div class="v" style="color:${ts.status==="ok"?"var(--ok)":"var(--bad)"}">${fmtBRL(ts.ratio)}/HL</div><div class="l">trade spend por HL</div><div class="m">teto de referência ${fmtBRL(ts.lim)}/HL — ${ts.status==="ok"?"dentro":"ACIMA — sinalizar vermelho"}</div></div>
    </div>`;
  h+=`</div>`;
  return h;
}

/* ---------- F6 · Evolução e prova ---------- */
function secEvolucao(p){
  const hist=HIST[p.id]||[], d=deltasPDV(p);
  let h=`<div class="card"><h3>📈 Evolução <span class="hint">prova de que o share subiu</span></h3>`;
  if(!hist.length){
    h+=`<div class="aviso">Sem medições ainda. A primeira visita grava a linha de base — nada de resultado antes de 2 medições reais.</div>`;
  } else if(hist.length===1){
    h+=`<div class="aviso">Linha de base em ${esc(fmtData(hist[0].data))} — próxima medição sugerida em ${esc(fmtData(addDays(hist[0].data,30)))}. Aguardando 2ª medição.</div>`;
  } else {
    h+=`<div class="grid g2">
      <div class="kpi"><div class="v">${seta(d.dShare)}</div><div class="l">share marca-alvo (p.p.)</div><div class="m">${esc(fmtData(d.primeira))} → ${esc(fmtData(d.ultima))} · ${d.n} medições</div></div>
      <div class="kpi"><div class="v">${seta(d.dBSV)}</div><div class="l">BSV (p.p.)</div><div class="m">${seta(d.dHL)} HL Ambev</div></div>
    </div>
    <div style="margin-top:10px">${sparkline(hist.map(m=>m.share_alvo),280,48)}</div>
    <div class="tiny" style="margin-top:4px">Sparkline do share da marca-alvo entre medições.</div>`;
  }
  h+=`<button class="btn block" style="margin-top:10px" onclick="gravarAgora('${p.id}')">📍 Gravar medição agora</button>
    <div class="tiny" style="margin-top:6px">Cada visita concluída grava automaticamente: data, share da marca-alvo, BSV, preço, ruptura e portas de fridge.</div></div>`;
  const eq=equidadePDV(p), w=PARAMS.pesos_equidade;
  h+=`<div class="card"><h3>Índice de Brand Equity <span class="hint">0–100 · pesos no painel</span></h3>
    <div class="grid g2">
      <div class="kpi"><div class="v">${eq}</div><div class="l">equidade atual</div><div class="m">${d&&d.n>=2?seta(d.dEq)+" desde a 1ª medição":"aguardando 2ª medição p/ variação"}</div></div>
      <div class="kpi"><div class="v" style="font-size:.85rem;line-height:1.5">demanda ${fmtN(w.demanda*100,0)}% · fridge ${fmtN(w.fridge*100,0)}%<br>material ${fmtN(w.material*100,0)}% · preço ${fmtN(w.preco*100,0)}%</div><div class="l">pesos (parâmetro)</div></div>
    </div>
    <div class="tiny" style="margin-top:6px">Equidade = demanda espontânea normalizada × ${fmtN(w.demanda,2)} + presença porta fridge × ${fmtN(w.fridge,2)} + material × ${fmtN(w.material,2)} + compliance de preço × ${fmtN(w.preco,2)}.</div></div>`;
  return h;
}
function fmtData(iso){ const d=new Date(iso+"T12:00:00"); return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}); }
function gravarAgora(id){ gravarMedicao(id); toast("Medição gravada: "+(HIST[id].length)+"ª"); go("pdv"); }

/* ---------- TAB 3 · TERRITÓRIO (v2): rankings separados + prova ---------- */
function renderTerritorio(){
  const f=ESTADO.filtrosTerr||{tipo:"",classe:""};
  let pds=BASE.pdvs;
  if(f.tipo) pds=pds.filter(p=>p.tipo===f.tipo);
  if(f.classe) pds=pds.filter(p=>p.classe===f.classe);
  const hlTotal=pds.reduce((a,p)=>a+hlTotalMes(p),0);
  const hlAm=pds.reduce((a,p)=>a+ambevHL(p),0);
  const recTotal=pds.reduce((a,p)=>a+recTotalMes(p),0);
  const recAm=pds.reduce((a,p)=>a+ambevRec(p),0);
  const execMedia=pds.reduce((a,p)=>a+execucaoScore(p),0)/(pds.length||1);
  const anamOk=pds.filter(p=>p.anamnese==="completa").length;
  const norm=scoreOportunidadeNorm();
  let h=`<div class="card"><h3>Indicadores do território <span class="hint">${pds.length} PDVs</span></h3>
    <div class="grid g4">
      <div class="kpi"><div class="v">${fmtN(hlTotal,0)}</div><div class="l">HL/mês território</div><div class="m">soma dos PDVs</div></div>
      <div class="kpi"><div class="v">${fmtN(pct(hlAm,hlTotal),1)}%</div><div class="l">Share Ambev</div><div class="m">meta ${PARAMS.meta_share_ambev}%</div></div>
      <div class="kpi"><div class="v">${fmtN(pct(recAm,recTotal),1)}%</div><div class="l">BSV</div><div class="m">meta ${PARAMS.meta_bsv}%</div></div>
      <div class="kpi"><div class="v">${fmtN(execMedia,0)}%</div><div class="l">Execução média</div><div class="m">meta ${PARAMS.meta_execucao_pontos}%</div></div>
    </div>
    <div class="filtro-linha" style="margin-top:10px">
      <select onchange="ESTADO.filtrosTerr.tipo=this.value;salvarEstado();go('territorio')">
        <option value="">Todos os tipos</option>${["Bar","Restaurante","Distribuidora","Mercado","Lanchonete","Casa Noturna"]
          .map(t=>'<option'+(f.tipo===t?" selected":"")+'>'+t+'</option>').join("")}</select>
      <select onchange="ESTADO.filtrosTerr.classe=this.value;salvarEstado();go('territorio')">
        <option value="">Todas as classes</option>${["A","B","C"].map(c=>'<option'+(f.classe===c?" selected":"")+'>'+c+'</option>').join("")}</select>
      <span class="chip">Anamnese completa: ${anamOk}/${pds.length}</span>
    </div></div>`;
  /* F3/F4: dois rankings separados */
  const agir=pds.filter(p=>p.anamnese==="completa").sort((a,b)=>(norm[b.id]||0)-(norm[a.id]||0));
  const medir=pds.filter(p=>p.anamnese!=="completa").sort((a,b)=>scoreColeta(b)-scoreColeta(a));
  h+=`<div class="card"><h3>🎯 Onde agir <span class="hint">score de oportunidade = piso da faixa × confiança</span></h3>
    <table><tr><th>#</th><th>PDV</th><th>Segmento</th><th>Score</th><th>Marca-alvo</th><th>Share</th><th>Gap HL</th></tr>
    ${agir.slice(0,10).map((p,i)=>{ const v=veredito(p);
      return "<tr><td>"+(i+1)+"</td><td><a onclick=\"abrirPDV('"+p.id+"')\" style='cursor:pointer'>"+esc(p.nome)+"</a>"+(p.demo?' <span class="chip '+(p.demo==="premium"?"info":"ok")+'">demo</span>':"")+"</td><td>"+esc(p.tipo)+" "+esc(p.classe)+"</td><td><b>"+(norm[p.id]||0)+"/100</b></td><td>"+esc(v.ma.alvo.m)+"</td><td>"+fmtN(ambevShare(p),1)+"%</td><td class='t-right'>"+fmtN(v.gap.hl||0,1)+"</td></tr>"; }).join("")}
    </table><div class="tiny" style="margin-top:6px">Usa o PISO da faixa (nunca o teto) e desconta pela confiança — incerteza não vira oportunidade.</div></div>`;
  h+=`<div class="card"><h3>📏 Onde medir <span class="hint">score de coleta = campos-chave faltantes</span></h3>
    ${medir.length?"<table><tr><th>#</th><th>PDV</th><th>Anamnese</th><th>Score coleta</th><th>Faltam</th></tr>"+
      medir.slice(0,10).map((p,i)=>"<tr><td>"+(i+1)+"</td><td><a onclick=\"abrirPDV('"+p.id+"')\" style='cursor:pointer'>"+esc(p.nome)+"</a></td><td>"+esc(p.anamnese)+"</td><td><b>"+scoreColeta(p)+"%</b></td><td class='small'>"+esc(camposFaltantes(p).join(", ")||"—")+"</td></tr>").join("")+"</table>"
      :'<div class="empty"><div class="ic">✅</div>Tudo medido no recorte atual.</div>'}</div>`;
  /* F6c: antes e depois */
  const deltas=pds.map(p=>({p,d:deltasPDV(p)})).filter(x=>x.d);
  h+=`<div class="card"><h3>📊 Antes e depois <span class="hint">só PDVs com 2+ medições reais</span></h3>`;
  if(!deltas.length) h+=`<div class="empty"><div class="ic">⏳</div>Aguardando 2ª medição — nenhum resultado é exibido sem prova (regra de honestidade).</div>`;
  else{
    const med=k=>deltas.length?deltas.reduce((a,x)=>a+x.d[k],0)/deltas.length:0;
    h+=`<div class="grid g3" style="margin-bottom:8px">
      <div class="kpi"><div class="v">${seta(+med("dShare").toFixed(1))}</div><div class="l">Δ share médio (p.p.)</div></div>
      <div class="kpi"><div class="v">${seta(+med("dBSV").toFixed(1))}</div><div class="l">Δ BSV médio (p.p.)</div></div>
      <div class="kpi"><div class="v">${seta(+med("dHL").toFixed(1))}</div><div class="l">Δ HL Ambev médio</div></div></div>
    <table><tr><th>PDV</th><th>Período</th><th>Δ share</th><th>Δ BSV</th><th>Δ HL</th><th>Origem</th></tr>
    ${deltas.map(x=>"<tr><td>"+esc(x.p.nome)+"</td><td class='tiny'>"+esc(fmtData(x.d.primeira))+" → "+esc(fmtData(x.d.ultima))+"</td><td>"+seta(x.d.dShare)+"</td><td>"+seta(x.d.dBSV)+"</td><td>"+seta(x.d.dHL)+"</td><td>"+(x.d.demo?badgeOrigem("mock"):"")+"</td></tr>").join("")}
    </table>`;
  }
  h+=`</div>`;
  /* F6e: piloto 90 dias */
  const pil=piloto90().filter(x=>pds.some(p=>p.id===x.p.id));
  h+=`<div class="card"><h3>🧪 Piloto 90 dias <span class="hint">10 PDVs · critério: meta p.p. de share</span></h3>
    <table><tr><th>PDV</th><th>Linha de base</th><th>Meta</th><th>Encerra</th><th>Status</th><th>Realizado</th></tr>
    ${pil.map(x=>"<tr><td><a onclick=\"abrirPDV('"+x.p.id+"')\" style='cursor:pointer'>"+esc(x.p.nome)+"</a></td><td class='tiny'>"+(x.base?esc(fmtData(x.base.data))+" · "+fmtN(x.base.share_alvo,1)+"% · "+fmtN(x.base.hl_ambev,1)+" HL":"—")+"</td><td>+"+x.metaPp+" p.p.</td><td class='tiny'>"+esc(fmtData(x.fim))+"</td><td>"+(x.status==="Concluído"?'<span class="progress-pill c">':x.status==="Em curso"?'<span class="progress-pill e">':'<span class="progress-pill p">')+x.status+"</span></td><td>"+(x.real==null?'<span class="tiny">aguardando 2ª medição</span>':(x.bateu?'<span style="color:var(--ok)">✓ +'+fmtN(x.real,1)+' — bateu</span>':'<span style="color:var(--bad)">✗ +'+fmtN(x.real,1)+' — não bateu</span>'))+"</td></tr>").join("")}
    </table><div class="tiny" style="margin-top:6px">Ao concluir: previsto (meta do gap × captura) vs realizado (medições) — informa se bateu. Nada aparece antes de 2 medições.</div></div>`;
  /* visão de marca (mantida) */
  const hlM={},recM={};
  pds.forEach(p=>CERVEJAS.forEach(m=>{ hlM[m]=(hlM[m]||0)+hlMarca(p,m); recM[m]=(recM[m]||0)+recMarca(p,m); }));
  const hlC=CERVEJAS.reduce((a,m)=>a+hlM[m],0), recC=CERVEJAS.reduce((a,m)=>a+recM[m],0);
  h+=`<div class="card"><h3>Visão de marca (mês atual)</h3><table>
    <tr><th>Marca</th><th>HL</th><th>Share vol.</th><th>Receita</th><th>Share valor</th><th>Tier</th></tr>
    ${CERVEJAS.map(m=>"<tr"+(PORT[m].dono==="ambev"?"":" style='opacity:.75'")+"><td>"+esc(m)+(PORT[m].dono==="ambev"?" <span class='badge coletado'>ambev</span>":"")+"</td><td>"+fmtN(hlM[m],1)+"</td><td>"+fmtN(pct(hlM[m],hlC),1)+"%</td><td>"+fmtBRL(recM[m])+"</td><td>"+fmtN(pct(recM[m],recC),1)+"%</td><td>"+esc(TIER_NOME[PORT[m].tier])+"</td></tr>").join("")}
  </table></div>`;
  h+=`<div class="card"><h3>Saúde da execução</h3><div class="grid g4">
    <div class="kpi"><div class="v">${fmtN(pds.reduce((a,p)=>a+p.ruptura_mensal_pct,0)/(pds.length||1),1)}%</div><div class="l">Ruptura média</div><div class="m">meta ≤${PARAMS.meta_ruptura_max}%</div></div>
    <div class="kpi"><div class="v">${pds.filter(p=>p.ponto_extra).length}</div><div class="l">Com ponto extra</div></div>
    <div class="kpi"><div class="v">${aderenciaPolitica().pct}%</div><div class="l">Aderência à política</div><div class="m">preço dentro da faixa do canal</div></div>
    <div class="kpi"><div class="v">${anamOk}/${pds.length}</div><div class="l">Anamnese completa</div></div>
  </div></div>`;
  h+=secAlertas();
  return h;
}

/* ---------- boot v2 ---------- */
hidratarParamsV2();
PARAMS.deslocamento_min=PARAMS.deslocamento_min||12;
if(!PARAMS_FONTE.deslocamento_min) PARAMS_FONTE.deslocamento_min={fonte:"Deslocamento médio urbano entre PDVs — estimativa de rota",data:"2026-10-24",validado:false};
/* seed de economia no mock (badged): só PDVs com anamnese completa */
function hidratarV2Base(){
  BASE.pdvs.forEach((p,i)=>{
    if(p.anamnese!=="completa") return;
    if(p.custo_lata==null){
      const h=[...p.id].reduce((a,c)=>a+c.charCodeAt(0),0);
      p.custo_lata=+(72+(h%18)).toFixed(2); p.custo_origem="mock";
      p.estoque_medio=8+(h%12); p.custo_fixo_mes=3800+(h%9)*450;
      p.subtipo_compra=["direto","distribuidor","atacado"][h%3];
      p.verba_trade_mes=(h%3===0)?+(300+(h%5)*120).toFixed(0):null;
      p.material_pdv=h%2===0;
      if(h%4===0){ p.custo_barril=+(210+(h%6)*15).toFixed(2); p.barril_litros=30; p.dose_ml=300; p.preco_chope=+(10.9+(h%4)).toFixed(2); p.estoque_barril=2+(h%3); }
    }
  });
  salvarBase();
}
const rodarMotorV1=rodarMotor;
rodarMotor=function(){ const r=rodarMotorV1(); if(r&&r.ok){ hidratarV2Base(); } return r; };
hidratarV2Base();
seedHistDemo();
const marcarFeitaV1=marcarFeita;
marcarFeita=function(id){ marcarFeitaV1(id); if(ESTADO.visitas[id]==="concluido"){ gravarMedicao(id); toast("Medição gravada — série temporal atualizada"); } };
if(!ESTADO.rotaDia) ESTADO.rotaDia={n:PARAMS.rota_n_default, ids:null, data:"hoje"};
go(ESTADO.aba||"hoje");

/* fix v7b: secAnamnese global = v1 + bloco 6 (atribuição em runtime, sem hoisting) */
secAnamnese=secAnamneseV2;