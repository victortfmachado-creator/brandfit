/* =====================================================================
   BrandFit v6 — UI: META DE MIX, ELEGIBILIDADE, ALAVANCAGEM, PLANO
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* ---------- sub-aba META DE MIX ---------- */
function secMetaMix(p){
  const pm=planoMix(p), bm=pm.bm;
  let h=`<div class="card"><h3 style="font-size:1.1rem">📐 Benchmark da meta</h3>
    <div class="rua-num med">${bm.n} PDVs comparáveis</div>
    <div class="tiny" style="margin-top:4px">${esc(bm.desc)} · quartil superior (${bm.nQ} PDVs) define a meta</div>
    ${bm.aviso?`<div class="aviso">${esc(bm.aviso)}</div>`:""}
    <div class="tiny" style="margin-top:4px">Meta = distribuição de marcas do quartil superior. Nenhum número inventado.</div></div>`;
  pm.linhas.forEach(l=>{
    const cor=l.gapHl>0?"var(--red2)":"var(--ok)";
    h+=`<div class="card"><h3 style="font-size:1.05rem">${l.papel.ic} ${esc(l.m)} · ${esc(l.papel.papel)}</h3>
      <div class="grid g2">
        <div><div class="rua-num med">${l.cur.toFixed(1)}%</div><div class="rua-lbl small">share atual (${l.atualHl.toFixed(1)} HL)</div></div>
        <div><div class="rua-num med" style="color:${cor}">${l.metaSh.toFixed(1)}%</div><div class="rua-lbl small">meta do quartil (${l.metaHl.toFixed(1)} HL)</div></div>
      </div>
      <div class="bar" style="margin-top:8px;height:12px">
        <div style="width:${Math.min(100,l.cur)}%;background:#3a3f45"></div>
        <div style="width:${Math.min(100-l.cur,Math.max(0,l.metaSh-l.cur))}%;background:var(--red)"></div>
      </div>
      <div class="tiny" style="margin-top:4px">gap ${l.gapHl>0?"+":""}${l.gapHl.toFixed(1)} HL/mês · meta = quartil superior de ${bm.n} ${esc(bm.desc)}</div>`;
    if(l.formatos.length){
      h+=`<table style="margin-top:8px"><tr><th>Formato</th><th>Atual</th><th>Meta</th><th>Gap</th><th>Caixas</th></tr>`;
      l.formatos.forEach(f=>{
        h+=`<tr><td>${esc(f.nome)}</td>
          <td>${f.atualF.toFixed(1)} HL (${(f.fracAtual*100).toFixed(0)}%)</td>
          <td>${f.metaF.toFixed(1)} HL (${(f.fracMeta*100).toFixed(0)}%)</td>
          <td style="color:${f.gapF>0?"var(--red2)":"var(--ok)"}">${f.gapF>0?"+":""}${f.gapF.toFixed(1)} HL</td>
          <td>${f.gapCx>0?Math.round(f.gapCx):"—"}</td></tr>`;
      });
      h+=`</table>`;
      const maior=l.formatos.slice().sort((a,b)=>b.gapF-a.gapF)[0];
      if(maior&&maior.gapF>0){
        h+=`<div class="tiny" style="margin-top:6px">Tática do formato com maior gap (${esc(maior.nome)}): ${esc(maior.tatica||"execução de presença")}${maior.alvo?" — contra "+esc(maior.alvo.join(", "))+" ("+esc(maior.grupoAlvo)+")":""}</div>`;
      }
    }
    if(l.entradas.length){
      h+=`<div class="tiny" style="margin-top:6px"><b>Oportunidade de entrada (não é meta):</b> ${l.entradas.map(e=>esc(e.nome)+(e.elegivel?" (tem estrutura)":" (sem estrutura: "+esc(e.motivo)+")")).join(" · ")}</div>`;
    }
    h+=`</div>`;
  });
  return h;
}

/* ---------- bloco PORTFÓLIO ELEGÍVEL ---------- */
function secElegivel(p){
  const vendidos=formatosVendidos(p);
  const todos=["retornavel_600","garrafa_600","long_neck_330","lata_350","lata_473","litrao_1000","chope_30","chope_50"];
  let h=`<div class="card"><h3 style="font-size:1.1rem">📦 Portfólio elegível</h3>`;
  h+=`<div class="tiny" style="margin-bottom:6px">O que o PDV vende, o que tem estrutura para passar a vender e o que está descartado.</div>`;
  h+=`<div class="tiny" style="color:var(--ok);font-weight:700">VENDE</div>`;
  vendidos.forEach(fk=>h+=`<div class="marca-linha" style="padding:6px 0"><div class="nm" style="width:auto;flex:1">${esc(nomeFormato(fk))}</div><div class="pct" style="font-size:1.1rem">${((p.mix_formato[fk]||0)*100).toFixed(0)}%</div></div>`);
  const pode=todos.filter(fk=>!vendidos.includes(fk)&&formatoElegivel(p,fk).ok);
  const nao=todos.filter(fk=>!vendidos.includes(fk)&&!formatoElegivel(p,fk).ok);
  if(pode.length){
    h+=`<div class="tiny" style="color:var(--warn);font-weight:700;margin-top:8px">TEM ESTRUTURA — OPORTUNIDADE DE ENTRADA</div>`;
    pode.forEach(fk=>{ const el=formatoElegivel(p,fk);
      h+=`<div class="marca-linha" style="padding:6px 0"><div class="nm" style="width:auto;flex:1">${esc(nomeFormato(fk))}</div><div class="alv">${esc(el.motivo)}</div></div>`; });
  }
  if(nao.length){
    h+=`<div class="tiny" style="color:var(--txt3);font-weight:700;margin-top:8px">DESCARTADO</div>`;
    nao.forEach(fk=>{ const el=formatoElegivel(p,fk);
      h+=`<div class="marca-linha" style="padding:6px 0"><div class="nm" style="width:auto;flex:1">${esc(nomeFormato(fk))}</div><div class="alv">${esc(el.motivo)}</div></div>`; });
  }
  h+=`</div>`;
  return h;
}

/* ---------- ALAVANCAGEM: âncora e trava ---------- */
function secAlavancagem(p){
  const al=alavancagem(p);
  let h=`<div class="card"><h3 style="font-size:1.1rem">⚓ Marcas que mais puxam a cesta</h3>`;
  al.ancoras.slice(0,3).forEach(l=>{
    h+=`<div class="marca-linha"><div class="nm" style="width:auto">${esc(l.m)}</div>
      <div class="pct" style="font-size:1.3rem">r=${l.rAncora.toFixed(2)}</div>
      <div class="alv">${esc(l.modo)}</div></div>`;
  });
  h+=`</div>`;
  if(al.rival){
    h+=`<div class="card"><h3 style="font-size:1.1rem">🔒 Marcas que mais travam ${esc(al.rival.c)}</h3>`;
    al.travas.slice(0,3).forEach(l=>{
      h+=`<div class="marca-linha"><div class="nm" style="width:auto">${esc(l.m)}</div>
        <div class="pct" style="font-size:1.3rem">r=${l.rTrava.toFixed(2)}</div>
        <div class="alv">${esc(l.modo)}</div></div>`;
    });
    h+=`</div>`;
  }
  h+=`<div class="aviso">⚠️ Coeficientes de correlação mostram força de associação — não provam causalidade. Com 6+ medições mensais por PDV, a leitura sobe para série temporal; hoje parte vem de comparação entre PDVs do território.</div>`;
  return h;
}

/* ---------- PLANO DE MIX imprimível ---------- */
function planoMixTexto(p){
  const pm=planoMix(p);
  let t="PLANO DE MIX — "+p.nome+" ("+p.tipo+" classe "+p.classe+", "+canalDe(p)+")\n";
  t+="Benchmark: "+pm.bm.desc+" — quartil superior de "+pm.bm.n+" PDVs ("+pm.bm.nQ+" no quartil)\n";
  if(pm.bm.aviso) t+="AVISO: "+pm.bm.aviso+"\n";
  t+="\n";
  pm.linhas.forEach(l=>{
    t+="\n"+l.papel.ic+" "+l.m.toUpperCase()+" · papel: "+l.papel.papel+" · atual "+l.cur.toFixed(1)+"% ("+l.atualHl.toFixed(1)+" HL) · meta "+l.metaSh.toFixed(1)+"% ("+l.metaHl.toFixed(1)+" HL) · gap "+(l.gapHl>0?"+":"")+l.gapHl.toFixed(1)+" HL/mês\n";
    l.formatos.forEach(f=>{
      t+="   "+f.nome+" → atual "+f.atualF.toFixed(1)+" HL ("+(f.fracAtual*100).toFixed(0)+"%) · meta "+f.metaF.toFixed(1)+" HL ("+(f.fracMeta*100).toFixed(0)+"%) · gap "+(f.gapF>0?"+":"")+f.gapF.toFixed(1)+" HL"+(f.gapCx>0?" ("+Math.round(f.gapCx)+" caixas)":"")+"\n";
      if(f.gapF>0&&f.tatica) t+="      tática: "+f.tatica+(f.alvo?" — contra "+f.alvo.join(", "):"")+"\n";
    });
    l.entradas.forEach(e=>{
      t+="   "+e.nome+" → oportunidade de entrada ("+(e.fracBenchmark*100).toFixed(0)+"% no benchmark)"+(e.elegivel?" — tem estrutura":" — sem estrutura: "+e.motivo)+"\n";
    });
  });
  if(pm.topAcao) t+="\nAÇÃO DO DIA: "+pm.topAcao.titulo+"\n"+pm.topAcao.argumento+"\n";
  t+="\nCatálogo: conferir com o portfólio oficial da empresa (editável no Config).\n";
  return t;
}
function copiarPlanoMix(){
  const p=pdvAtual(); if(!p) return;
  const t=planoMixTexto(p);
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(()=>toast("Plano copiado — cole onde precisar"),()=>toast("Não copiou"));
  } else toast("Selecione e copie");
}

/* ---------- injeta sub-abas v6 no PDV ---------- */
(function(){
  const rp5=renderPdv;
  renderPdv=function(){
    const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
    const v=veredito(p), sub=ESTADO.subPdv||"marca";
    const subs=[["marca","🏷️ Marca foco"],["encaixe","🧩 Encaixe"],["metamix","📐 Meta de mix"],["elegivel","📦 Elegível"],["alavancagem","⚓ Alavancagem"],["concorrencia","⚔️ Concorrência"],["portfolio","📊 Portfólio"],["economia","💰 Economia"],["evolucao","📈 Evolução"],["anamnese","📋 Coleta"],["plano","🗓️ Plano"]];
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
    else if(sub==="encaixe") h+=secEncaixe(p);
    else if(sub==="metamix") h+=secMetaMix(p);
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