/* =====================================================================
   BrandFit v7 — UI: CHECKLIST, VEREDITO AUDITÁVEL, ATIVOS, SIMULADOR
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- sub-aba AUDITORIA (checklist + veredito auditável) ---------- */
function secAuditoria(p){
  const va=vereditoAuditavel(p);
  const c=ESTADO.checklist[p.id]||{};
  let h=`<div class="card"><h3 style="font-size:1.1rem">📋 Checklist qualitativo do ponto <span class="hint">5 min — libera o veredito</span></h3>`;
  CHECK_DEFS.forEach(d=>{
    h+=`<label>${esc(d.p)}</label>`;
    if(d.tipo==="num"){
      h+=`<input type="number" step="0.5" value="${c[d.k]||""}" onchange="salvarCheck('${d.k}',this.value)">`;
    } else {
      h+=`<select onchange="salvarCheck('${d.k}',this.value)" style="min-height:48px">
        <option value="">—</option>
        ${d.opts.map(o=>`<option${c[d.k]===o?" selected":""}>${esc(o)}</option>`).join("")}
      </select>`;
    }
  });
  if(va.q) h+=`<div class="tiny" style="margin-top:8px">Perfil apurado: <b>${esc(va.q.perfil)}</b> · compatibilidade público×classe: ${va.q.compat}%</div>`;
  h+=`</div>`;
  /* veredito auditável */
  h+=`<div class="card"><h3 style="font-size:1.1rem">⚖️ Veredito auditável <span class="hint">critérios explícitos</span></h3>`;
  if(va.final==null){
    h+=`<div class="aviso">⚠️ Sem avaliação qualitativa — preencha o checklist acima para o motor calcular o veredito completo. A leitura quantitativa já está disponível: nota ${va.notaQuant}/100.</div>`;
  } else {
    h+=`<div class="grid g3">
      <div class="kpi" style="cursor:default"><div class="v">${va.notaQuant}</div><div class="l">Quantitativa (60%)</div></div>
      <div class="kpi" style="cursor:default"><div class="v">${va.notaQuali}</div><div class="l">Qualitativa (40%)</div></div>
      <div class="kpi" style="cursor:default"><div class="v" style="color:var(--red2)">${va.final}</div><div class="l">Final</div></div>
    </div>
    <div class="veredito" style="margin-top:10px"><div class="v-title">${esc(va.nivel)}</div>
      ${va.criterios.map(x=>`<div class="tiny" style="margin-top:3px">· ${esc(x)}</div>`).join("")}
    </div>`;
  }
  h+=`</div>`;
  /* ativos de trade */
  const at=ativosTrade(p);
  h+=`<div class="card"><h3 style="font-size:1.1rem">📦 Ativos de trade para o ponto <span class="hint">derivados da marca foco + perfil</span></h3>`;
  at.forEach(a=>{
    h+=`<div class="marca-linha" style="align-items:flex-start">
      <div class="nm" style="width:auto;flex:1"><b>${esc(a.a)}</b><br><span class="tiny">${esc(a.porquê)}</span></div>
      <span class="chip-rua ${a.prio==="alta"?"chip":a.prio==="média"?"chip info":"chip ok"}">${esc(a.prio)}</span>
    </div>`;
  });
  h+=`</div>`;
  return h;
}
function salvarCheck(k,v){
  const p=pdvAtual(); if(!p) return;
  if(!ESTADO.checklist[p.id]) ESTADO.checklist[p.id]={};
  ESTADO.checklist[p.id][k]=v;
  salvarEstado();
  toast("Checklist salvo");
}

/* ---------- sub-aba PLANO TÁTICO (4 semanas + simulador) ---------- */
function secTatico(p){
  const sem=plano4Semanas(p);
  let h=`<div class="card"><h3 style="font-size:1.1rem">📅 Plano tático — 4 semanas</h3>`;
  sem.forEach(s=>{
    h+=`<div class="marca-linha" style="align-items:flex-start">
      <div class="nm" style="width:2.2em;color:var(--red2)">S${s.n}</div>
      <div class="alv" style="width:auto;flex:1"><b>${esc(s.titulo)}</b><br><span class="tiny">${esc(s.tatica)}${s.alvo?" · contra "+esc(s.alvo.join(", ")):''}</span></div>
    </div>`;
  });
  h+=`</div>`;
  const cen=cenariosCaptura(p);
  h+=`<div class="card"><h3 style="font-size:1.1rem">🚀 Simulador de captura <span class="hint">impacto financeiro por cenário</span></h3>
    <table><tr><th>Cenário</th><th>Caixas/mês</th><th>Receita</th><th>Margem est.</th></tr>`;
  cen.forEach(c=>{
    h+=`<tr><td>${esc(c.nome)} (${(c.r.taxa*100).toFixed(0)}%)</td>
      <td><b>+${Math.round(c.r.caixas)}</b></td>
      <td>R$ ${fmtN(c.r.receita,0)}</td>
      <td>R$ ${fmtN(c.r.margem,0)}</td></tr>`;
  });
  h+=`</table><div class="tiny" style="margin-top:6px">Captura limitada ao volume concorrente e ao gap do benchmark. Margem estimada em 35% — conferir com a política real.</div></div>`;
  return h;
}

/* ---------- TERRITÓRIO: matriz de priorização ---------- */
function matrizPrioridadeHTML(){
  const m=matrizPrioridade();
  let h=`<div class="card"><h3 style="font-size:1.1rem">🎯 Atacar já <span class="hint">gap alto + execução boa</span></h3>`;
  if(!m.atacar.length) h+=`<div class="tiny">Nenhum PDV com gap alto e execução boa — priorize completar anamneses.</div>`;
  m.atacar.forEach(x=>{
    h+=`<div class="marca-linha" onclick="abrirPDV('${x.p.id}')" style="cursor:pointer">
      <div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
      <div class="pct" style="font-size:1.2rem;color:var(--red2)">${x.gap.toFixed(1)} HL</div>
      <div class="alv" style="text-align:right">execução ${x.exec}</div>
    </div>`;
  });
  h+=`</div>`;
  h+=`<div class="card"><h3 style="font-size:1.1rem">🗓️ Planejar <span class="hint">gap alto, execução fraca — corrigir base antes</span></h3>`;
  m.planejar.forEach(x=>{
    h+=`<div class="marca-linha" onclick="abrirPDV('${x.p.id}')" style="cursor:pointer">
      <div class="nm" style="width:auto;flex:1">${esc(x.p.nome)}</div>
      <div class="pct" style="font-size:1.2rem">${x.gap.toFixed(1)} HL</div>
      <div class="alv" style="text-align:right">execução ${x.exec}</div>
    </div>`;
  });
  h+=`</div>`;
  return h;
}

/* ---------- injeta sub-abas v7 no PDV ---------- */
(function(){
  const rp6=renderPdv;
  renderPdv=function(){
    const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
    const v=veredito(p), sub=ESTADO.subPdv||"marca";
    const subs=[["marca","🏷️ Marca foco"],["auditoria","⚖️ Auditoria"],["encaixe","🧩 Encaixe"],["metamix","📐 Meta de mix"],["tatico","📅 Tático"],["elegivel","📦 Elegível"],["alavancagem","⚓ Alavancagem"],["concorrencia","⚔️ Concorrência"],["portfolio","📊 Portfólio"],["economia","💰 Economia"],["evolucao","📈 Evolução"],["anamnese","📋 Coleta"],["plano","🗓️ Plano"]];
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
    </div>
    <div style="margin-bottom:10px"><button class="btn block" style="min-height:48px" onclick="copiarPlanoMix()">📋 Copiar plano de mix completo</button></div>`;
    if(sub==="marca") h+=secMarcaFoco(p,v);
    else if(sub==="auditoria") h+=secAuditoria(p);
    else if(sub==="encaixe") h+=secEncaixe(p);
    else if(sub==="metamix") h+=secMetaMix(p);
    else if(sub==="tatico") h+=secTatico(p);
    else if(sub==="elegivel") h+=secElegivel(p);
    else if(sub==="alavancagem") h+=secAlavancagem(p);
    else if(sub==="concorrencia") h+=secConcorrencia(p,v);
    else if(sub==="portfolio") h+=secPortfolio(p,v);
    else if(sub==="economia") h+=secEconomia(p);
    else if(sub==="evolucao") h+=secEvolucao(p);
    else if(sub==="anamnese") h+=secAnamnese(p);
    else if(sub==="plano") h+=secPlano(p);
    return h;
  };
})();

/* ---------- matriz no Território ---------- */
(function(){
  const rt6=renderTerritorio;
  renderTerritorio=function(){
    return rt6()+matrizPrioridadeHTML();
  };
})();