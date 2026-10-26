/* =====================================================================
   BrandFit v5 — UI: ENCAIXE DE MARCA NO PDV
   Nova sub-aba "Encaixe" no PDV: o que o PDV compra -> público ->
   suscetibilidades -> ranking de marcas que encaixam -> escada de preço
   vs concorrente de referência. Roda sozinho, sem Power BI.
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- sub-aba ENCAIXE ---------- */
function secEncaixe(p){
  const L=leituraPDV(p), foco=L.foco, pf=L.pf;
  let h=`<div class="card"><h3 style="font-size:1.1rem">🧾 O que este PDV compra</h3>
    <div class="gbar" style="height:40px">`;
  const f=p.mix_formato||{};
  const fmts=[["retornavel_600","600","#e02020"],["garrafa_600","600 nr","#c0392b"],["long_neck_330","long neck","#4c9be8"],["lata_350","lata","#e8a13c"]];
  const tot=fmts.reduce((a,x)=>a+(f[x[0]]||0),0)||1;
  fmts.forEach(x=>{ const v=(f[x[0]]||0)/tot*100; if(v>2) h+=`<div style="width:${v}%;background:${x[2]}">${Math.round(v)}%</div>`; });
  h+=`</div>`;
  fmts.forEach(x=>{ const v=(f[x[0]]||0)/tot*100;
    h+=`<div class="marca-linha" style="padding:6px 0"><div class="nm" style="width:auto;flex:1">${x[1]}</div>
      <div class="pct" style="font-size:1.2rem">${v.toFixed(0)}%</div></div>`; });
  h+=`<div class="tiny" style="margin-top:6px">Refrigerante pesa ${pf.refri.toFixed(0)}% do volume total do PDV.</div></div>`;

  h+=`<div class="card"><h3 style="font-size:1.1rem">👥 Público inferido</h3>
    <div class="rua-num med" style="margin:4px 0">${esc(pf.publico)}</div>
    <div class="tiny">Lido do mix de compra + classe + tipo do PDV — sem chute manual.</div></div>`;

  if(pf.susc.length){
    h+=`<div class="card"><h3 style="font-size:1.1rem">🔓 O que este PDV aceita negociar</h3>`;
    pf.susc.forEach(s=>{
      h+=`<div class="marca-linha" style="align-items:flex-start">
        <div class="nm" style="width:auto;flex:1"><b>${esc(s.t)}</b><br><span class="tiny">${esc(s.porquê)}</span></div>
      </div>`;
    });
    h+=`</div>`;
  }

  h+=`<div class="card"><h3 style="font-size:1.1rem">🎯 Marca foco sugerida: ${esc(foco.m)}</h3>
    <div class="veredito" style="font-size:.95rem">
      <div class="v-title">${esc(foco.pos.papel)}</div>
      <div style="margin-top:6px"><b>Por que ela aqui:</b> ${esc(foco.pos.publico)} — casa com ${esc(pf.publico.toLowerCase())}.</div>
      <div style="margin-top:6px">Encaixe <b>${foco.score}/100</b>:</div>
      ${foco.comp.map(c=>`<div class="tiny" style="margin-top:3px">· ${esc(c.txt)} <b style="color:var(--red2)">+${c.v}</b></div>`).join("")}
      ${foco.gap!=null&&foco.gap>2?`<div style="margin-top:8px"><b>Gap: ${foco.gap.toFixed(1)} p.p.</b> vs fair share do tier — meta nasce daqui (aba Marca foco).</div>`:""}
    </div></div>`;

  h+=`<div class="card"><h3 style="font-size:1.1rem">🏆 Quais marcas encaixam neste PDV</h3>`;
  L.top.forEach((ft,i)=>{
    h+=`<div class="marca-linha" style="align-items:flex-start">
      <div class="nm" style="width:6.5em">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"·"} ${esc(ft.m)}</div>
      <div class="pct" style="font-size:1.3rem;color:${i===0?"var(--red2)":"var(--txt)"}">${ft.score}</div>
      <div class="alv">${esc(ft.pos.papel)}${ft.cur>0?" · já tem "+ft.cur.toFixed(1)+"%":""}</div>
    </div>`;
  });
  h+=`</div>`;

  if(L.escada.length){
    h+=`<div class="card"><h3 style="font-size:1.1rem">💰 Escadinha de preço — ${esc(foco.m)} vs concorrentes do mesmo tier</h3>`;
    const precoFoco=p.preco[foco.m]||0;
    L.escada.forEach(c=>{
      h+=`<div class="marca-linha" style="padding:8px 0">
        <div class="nm" style="width:auto;flex:1;color:${COR_GRUPO[GRUPO_DE[c.m]]}">${esc(c.m)}</div>
        <div class="pct" style="font-size:1.2rem">R$ ${c.preco.toFixed(2)}</div>
        <div class="alv">${c.sh.toFixed(1)}% do volume</div>
      </div>`;
    });
    h+=`<div class="marca-linha" style="padding:8px 0;background:var(--red-dim);border-radius:8px;padding:8px">
      <div class="nm" style="width:auto;flex:1;color:var(--red2)"><b>${esc(foco.m)}</b></div>
      <div class="pct" style="font-size:1.2rem;color:var(--red2)">R$ ${precoFoco.toFixed(2)}</div>
      <div class="alv">onde entrar na escadinha</div>
    </div>`;
    h+=`</div>`;
  }
  return h;
}

/* ---------- injeta a sub-aba Encaixe no PDV (depois de Marca foco) ---------- */
(function(){
  const rp=renderPdv;
  renderPdv=function(){
    const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
    const v=veredito(p), sub=ESTADO.subPdv||"marca";
    const subs=[["marca","🏷️ Marca foco"],["encaixe","🧩 Encaixe"],["concorrencia","⚔️ Concorrência"],["portfolio","📊 Portfólio"],["economia","💰 Economia"],["evolucao","📈 Evolução"],["anamnese","📋 Coleta"],["plano","🗓️ Plano"]];
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
    else if(sub==="encaixe") h+=secEncaixe(p);
    else if(sub==="concorrencia") h+=secConcorrencia(p,v);
    else if(sub==="portfolio") h+=secPortfolio(p,v);
    else if(sub==="economia") h+=secEconomia(p);
    else if(sub==="evolucao") h+=secEvolucao(p);
    else if(sub==="anamnese") h+=secAnamnese(p);
    else if(sub==="plano") h+=secPlano(p);
    return h;
  };
})();