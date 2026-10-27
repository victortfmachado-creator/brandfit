/* =====================================================================
   BrandFit v8 UI — VISUAL PROFISSIONAL AMBEV (v8.2)
   Hierarquia: decisão em 1 linha → BSV (valor) → números-herói →
   alavancas de valor → diagnóstico agrupado → plano consolidado →
   evidências recolhidas. Sem backslashes.
   ===================================================================== */
"use strict";

/* ---------- design system v8.2 ---------- */
(function(){
  const st=document.createElement("style");
  st.textContent=`
  .v8-sec{margin:18px 0 10px}
  .v8-sec .kick{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:var(--red2);margin-bottom:2px}
  .v8-sec .tit{font-size:1.02rem;font-weight:800;color:var(--txt);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .v8-sec .tit .hint{font-size:.68rem;color:var(--txt3);font-weight:400;margin-left:auto;text-align:right}
  .v8-sec .linha{height:2px;background:linear-gradient(90deg,var(--red) 0 42px,var(--line) 42px);border-radius:2px;margin-top:6px}

  .v8-decisao{display:flex;align-items:center;gap:12px;background:linear-gradient(90deg,var(--red-dim),rgba(224,32,32,.04));border:1px solid rgba(224,32,32,.35);border-left:4px solid var(--red);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:12px;flex-wrap:wrap}
  .v8-decisao .d-k{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:var(--red2)}
  .v8-decisao .d-t{font-size:.95rem;font-weight:800;color:var(--txt);line-height:1.35}
  .v8-decisao .d-t b{color:var(--red2)}
  .v8-decisao .d-r{margin-left:auto;text-align:right;flex:none}
  .v8-decisao .d-r .n{font-size:1.3rem;font-weight:800;color:var(--ok);font-variant-numeric:var(--tabnum);line-height:1}
  .v8-decisao .d-r .l{font-size:.62rem;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em}

  .v8-hero{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
  @media(max-width:900px){.v8-hero{grid-template-columns:repeat(2,1fr)}}
  .v8-kpi{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:12px 14px;position:relative;overflow:hidden}
  .v8-kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--line)}
  .v8-kpi.ok:before{background:var(--ok)} .v8-kpi.warn:before{background:var(--warn)} .v8-kpi.bad:before{background:var(--red)}
  .v8-kpi .lbl{font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--txt3)}
  .v8-kpi .val{font-size:1.7rem;font-weight:800;letter-spacing:-.03em;line-height:1.15;margin:.25rem 0;font-variant-numeric:var(--tabnum)}
  .v8-kpi .val.red{color:var(--red2)} .v8-kpi .val.green{color:var(--ok)} .v8-kpi .val.yellow{color:var(--warn)}
  .v8-kpi .sub{font-size:.66rem;color:var(--txt2);line-height:1.4}
  .v8-kpi.sm .val{font-size:1.35rem}

  .v8-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
  .v8-chip{background:var(--card2);border:1px solid var(--line);border-radius:20px;font-size:.7rem;font-weight:600;padding:4px 11px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
  .v8-chip.red{background:var(--red-dim);border-color:rgba(224,32,32,.4);color:var(--red2)}
  .v8-chip.yellow{background:rgba(232,161,60,.12);border-color:rgba(232,161,60,.4);color:var(--warn)}
  .v8-chip.green{background:rgba(49,180,107,.12);border-color:rgba(49,180,107,.4);color:var(--ok)}
  .v8-stepper{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:9px 14px;margin-bottom:14px;flex-wrap:wrap}
  .v8-step{display:flex;align-items:center;gap:8px;font-size:.74rem;font-weight:600;color:var(--txt2)}
  .v8-step .c{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.66rem;font-weight:800;background:var(--card2);color:var(--txt3);border:1px solid var(--line);flex:none}
  .v8-step.ok .c{background:rgba(49,180,107,.15);color:var(--ok);border-color:rgba(49,180,107,.5)}
  .v8-step .t{font-size:.62rem;color:var(--txt3);font-weight:400;display:block}
  .v8-step-sep{flex:1;height:1px;background:var(--line);min-width:12px}

  .v8-duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
  @media(max-width:900px){.v8-duo{grid-template-columns:1fr}}

  .v8-ladder{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px}
  .v8-ladder .barra{display:flex;align-items:flex-end;gap:6px;min-width:520px;height:170px;padding:0 6px 20px;border-bottom:2px solid var(--line);overflow-x:auto}
  .v8-pilar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;min-width:48px}
  .v8-pilar .fill{width:100%;border-radius:7px 7px 0 0;background:var(--card2);border:1px solid var(--line);border-bottom:none;display:flex;flex-direction:column;align-items:center;padding-top:5px;transition:transform .15s}
  .v8-pilar:hover .fill{transform:translateY(-3px)}
  .v8-pilar .fill.foco{background:var(--red-dim);border-color:rgba(224,32,32,.6)}
  .v8-pilar .fill.ancora{background:rgba(76,155,232,.15);border-color:rgba(76,155,232,.5)}
  .v8-pilar .fill.quebrada{background:rgba(224,80,80,.25);border-color:rgba(224,80,80,.7)}
  .v8-pilar .preco{font-size:.74rem;font-weight:700;color:var(--txt);font-variant-numeric:var(--tabnum)}
  .v8-pilar .nome{font-size:.66rem;font-weight:600;color:var(--txt2);margin-top:5px;text-align:center;white-space:nowrap}
  .v8-pilar .pill{font-size:.55rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:2px 5px;border-radius:4px;margin-bottom:3px}
  .v8-pilar .pill.foco{background:var(--red);color:#fff}
  .v8-pilar .pill.ancora{background:var(--info);color:#fff}
  .v8-pilar .pill.alerta{background:var(--bad);color:#fff}
  .v8-alerta{border-radius:8px;padding:9px 12px;margin-top:8px}
  .v8-alerta .t{font-size:.74rem;font-weight:700}
  .v8-alerta .d{font-size:.7rem;color:var(--txt2);margin-top:2px;line-height:1.5}

  .v8-score{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px}
  .v8-score .tit{font-size:1.05rem;font-weight:800;margin:2px 0 10px}
  .v8-score .kicker{font-size:.62rem;font-weight:800;text-transform:uppercase;color:var(--red2);letter-spacing:.08em}
  .v8-barras{display:grid;grid-template-columns:1fr;gap:10px;background:var(--bg2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px;margin-bottom:10px}
  .v8-barras .bt{display:flex;justify-content:space-between;font-size:.68rem;font-weight:700;color:var(--txt2);margin-bottom:3px}
  .v8-barras .track{background:var(--card2);height:7px;border-radius:99px;overflow:hidden}
  .v8-barras .fill{height:100%;border-radius:99px}

  .v8-frentes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  @media(max-width:760px){.v8-frentes{grid-template-columns:1fr}}
  .v8-frente{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:12px;border-top:3px solid var(--red)}
  .v8-frente.f2{border-top-color:var(--warn)} .v8-frente.f3{border-top-color:var(--info)}
  .v8-frente h4{font-size:.78rem;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .v8-frente .item{font-size:.74rem;color:var(--txt2);padding:5px 0;border-bottom:1px dashed var(--line);line-height:1.45}
  .v8-frente .item:last-child{border-bottom:none}
  .v8-tl{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
  @media(max-width:760px){.v8-tl{grid-template-columns:1fr 1fr}}
  .v8-tl .passo{background:var(--card);border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px}
  .v8-tl .tag{display:inline-block;background:var(--red);color:#fff;font-size:.58rem;font-weight:800;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px}
  .v8-tl .desc{font-size:.72rem;color:var(--txt2);line-height:1.45}

  .v8-acc{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:8px;overflow:hidden}
  .v8-acc>button{width:100%;background:transparent;border:none;color:var(--txt);padding:12px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:.84rem;font-weight:600;text-align:left;gap:8px}
  .v8-acc>button .esq{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .v8-acc .corpo{display:none;padding:0 14px 14px;border-top:1px solid var(--line)}
  .v8-acc.aberto .corpo{display:block}
  .v8-acc.aberto>button .seta{transform:rotate(180deg)}
  .v8-acc>button .seta{transition:transform .2s;color:var(--txt3);flex:none}

  .v8-badge{font-size:.62rem;font-weight:700;padding:2px 7px;border-radius:4px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
  .v8-badge.foco{background:var(--red-dim);color:var(--red2);border:1px solid rgba(224,32,32,.35)}
  .v8-badge.sub{background:rgba(224,80,80,.12);color:var(--bad);border:1px solid rgba(224,80,80,.3)}
  .v8-badge.margem{background:rgba(232,161,60,.12);color:var(--warn);border:1px solid rgba(232,161,60,.3)}
  .v8-badge.ancora{background:rgba(76,155,232,.12);color:var(--info);border:1px solid rgba(76,155,232,.3)}
  .v8-badge.defesa{background:rgba(49,180,107,.12);color:var(--ok);border:1px solid rgba(49,180,107,.3)}
  .v8-badge.compl{background:var(--card2);color:var(--txt2);border:1px solid var(--line)}
  .v8-badge.audit{background:rgba(49,180,107,.12);color:var(--ok);border:1px solid rgba(49,180,107,.3);text-transform:uppercase;letter-spacing:.04em}

  .v8-check{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:640px){.v8-check{grid-template-columns:1fr}}
  .v8-rate{display:flex;gap:4px}
  .v8-rate button{flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt2);padding:7px 0;font-size:.78rem;font-weight:700;border-radius:6px;cursor:pointer;min-height:42px}
  .v8-rate button.on{background:var(--red);color:#fff;border-color:var(--red)}

  .v8-grupo{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:10px;overflow:hidden}
  .v8-grupo>.gh{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--line);font-size:.8rem;font-weight:700}
  .v8-grupo>.gh .cnt{margin-left:auto;font-size:.66rem;color:var(--txt3);font-weight:600}
  .v8-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer}
  .v8-row:last-child{border-bottom:none}
  .v8-row:hover{background:var(--card2)}
  .v8-row .nm{font-weight:700;font-size:.84rem;line-height:1.2}
  .v8-row .meta{font-size:.66rem;color:var(--txt3)}
  .v8-row .meio{flex:1;min-width:0}
  .v8-row .foco{font-weight:800;color:var(--red2);font-size:.8rem;white-space:nowrap}
  .v8-row .pot{font-size:.72rem;color:var(--ok);font-weight:700;white-space:nowrap;font-variant-numeric:var(--tabnum)}

  .v8-quad{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  @media(max-width:760px){.v8-quad{grid-template-columns:1fr}}
  .v8-quad .q{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:12px}
  .v8-quad .q h4{font-size:.76rem;margin-bottom:6px;display:flex;align-items:center;gap:6px}
  .v8-quad .q .qi{font-size:.72rem;color:var(--txt2);padding:4px 0;border-bottom:1px dashed var(--line);display:flex;gap:8px;align-items:baseline}
  .v8-quad .q .qi:last-child{border-bottom:none}
  .v8-quad .q .qi b{color:var(--txt)}
  .v8-quad .q .qi .v{margin-left:auto;font-weight:700;font-variant-numeric:var(--tabnum);white-space:nowrap}
  .v8-ration{font-size:.8rem;color:var(--txt2);line-height:1.6;margin:0}
  .v8-ration b{color:var(--txt)}
  .v8-filtros{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
  .v8-filtros select{width:auto;min-width:150px;flex:1;max-width:240px}
  `;
  document.head.appendChild(st);
})();

/* ---------- helpers ---------- */
function v8Acc(id,titulo,badge,aberto,corpo){
  return `<div class="v8-acc${aberto?" aberto":""}" id="${id}">
    <button onclick="v8Toggle('${id}')"><span class="esq">${titulo}${badge?` <span class="v8-badge ${badge[1]}" style="margin-left:4px">${badge[0]}</span>`:""}</span><span class="seta">▾</span></button>
    <div class="corpo">${corpo}</div></div>`;
}
function v8Toggle(id){ const e=document.getElementById(id); e.classList.toggle("aberto"); }
function v8BadgePapel(p){
  const map={FOCO:["foco","🎯 FOCO"],SUBSTITUIR:["sub","🚫 SUBSTITUIR"],MARGEM:["margem","💎 MARGEM"],"ÂNCORA":["ancora","⚓ ÂNCORA"],DEFESA:["defesa","🛡️ DEFESA"],COMPLEMENTO:["compl","🥶 COMPLEMENTO"]};
  const m=map[p]||["compl",p]; return `<span class="v8-badge ${m[0]}">${m[1]}</span>`;
}
function v8Sec(kick,titulo,hint){
  return `<div class="v8-sec"><div class="kick">${kick}</div><div class="tit">${titulo}${hint?`<span class="hint">${hint}</span>`:""}</div><div class="linha"></div></div>`;
}

/* ============================================================
   SUB-ABA AUDITORIA v8.2
   ============================================================ */
const secAuditoriaV7=secAuditoria;
secAuditoria=function(p){
  const a=analyticsV8(p);
  const v=vereditoAuditavel(p);
  const preco=a.preco;
  let h="";

  /* 1 · FAIXA DE DECISÃO (1 linha) */
  h+=`<div class="v8-decisao">
    <div style="flex:1;min-width:220px">
      <div class="d-k">Decisão do motor</div>
      <div class="d-t">Trabalhar <b>${esc(a.foco.m)}</b> — gap ${a.foco.gap!=null?a.foco.gap:"—"} p.p. vs pares · perfil <b>${a.perfil}</b>${a.pend?" (pendente)":""}</div>
    </div>
    <div class="d-r"><div class="n">+${fmtN(a.totalCx,0)} cx</div><div class="l">${fmtBRL(a.totalBRL)}/mês</div></div>
  </div>`;

  /* 2 · NÚMEROS-HERÓI (BSV primeiro) */
  const saudeCls=a.saude<50?"bad":a.saude<75?"warn":"ok";
  const bsvCls=a.bsv.gap>=0?"ok":a.bsv.gap>=-5?"warn":"bad";
  h+=`<div class="v8-hero">
    <div class="v8-kpi ${bsvCls}"><div class="lbl">💎 Brand share of value</div><div class="val ${bsvCls==="bad"?"red":bsvCls==="warn"?"yellow":"green"}">${fmtN(a.bsv.atual,1)}<span style="font-size:1rem">%</span></div>
      <div class="sub">fair share de valor dos pares: ${fmtN(a.bsv.fair,1)}% · gap <b style="color:${a.bsv.gap>=0?"var(--ok)":"var(--bad)"}">${a.bsv.gap>0?"+":""}${fmtN(a.bsv.gap,1)} p.p.</b>${a.bsv.gap<0?` · recuperar ≈ ${fmtBRL(a.potBRL)}/mês`:""}</div></div>
    <div class="v8-kpi"><div class="lbl">🎯 Marca foco provada</div><div class="val">${esc(a.foco.m)}</div>
      <div class="sub">score auditado ${a.foco.scoreFinal}/100 · compat. ${a.foco.compat}%</div></div>
    <div class="v8-kpi ok"><div class="lbl">💰 Potencial de recuperação</div><div class="val green">+${fmtN(a.totalCx,0)} <span style="font-size:1rem">cx/mês</span></div>
      <div class="sub">${fmtBRL(a.totalBRL)} adicionais / mês</div></div>
    <div class="v8-kpi ${saudeCls}"><div class="lbl">🩺 Saúde do PDV</div><div class="val ${saudeCls==="bad"?"red":saudeCls==="warn"?"yellow":"green"}">${a.saude}<span style="font-size:1rem">/100</span></div>
      <div class="sub">${a.saude>=75?"escada alinhada, portfólio equilibrado":"quebra de margem e/ou concorrência"}</div></div>
  </div>`;

  /* 3 · CHIPS + STEPPER */
  h+=`<div class="v8-chips">`;
  if(a.pend) h+=`<span class="v8-chip yellow" onclick="v8Toggle('accChecklist');window.scrollTo(0,document.getElementById('accChecklist').offsetTop-70)">⚠️ Checklist quali pendente — 5 min</span>`;
  a.priceAlerts.forEach(al=>h+=`<span class="v8-chip ${al.tipo==="RED"?"red":"yellow"}" onclick="v8Toggle('accCardapio')">${al.t}</span>`);
  if(!a.pend&&!a.priceAlerts.length) h+=`<span class="v8-chip green">✓ Escada e portfólio homologados</span>`;
  h+=`</div>`;
  h+=`<div class="v8-stepper">
    <div class="v8-step ok"><div class="c">✓</div><div>Quantitativo<span class="t">gap & volume</span></div></div>
    <div class="v8-step-sep"></div>
    <div class="v8-step ${a.pend?"":"ok"}"><div class="c">${a.pend?"2":"✓"}</div><div>Qualitativo<span class="t">checklist do ponto</span></div></div>
    <div class="v8-step-sep"></div>
    <div class="v8-step ${a.pend?"":"ok"}"><div class="c">${a.pend?"3":"✓"}</div><div>Veredito<span class="t">scorecard auditável</span></div></div>
  </div>`;

  /* 4 · VALOR (BSV): alavanca nº1 + mapa de valor */
  h+=v8Sec("Valor","💎 Onde está o dinheiro — alavancas de BSV","share de valor vs fair share de valor dos pares");
  const al1=a.alavancaBSV;
  h+=`<div class="v8-decisao" style="border-left-color:var(--warn);background:linear-gradient(90deg,rgba(232,161,60,.12),rgba(232,161,60,.03));border-color:rgba(232,161,60,.35)">
    <div style="flex:1;min-width:220px">
      <div class="d-k" style="color:var(--warn)">Alavanca nº 1 de valor</div>
      <div class="d-t">${al1?`Subir <b>${esc(al1.m)}</b> — ${esc(al1.leitura)}`:`Portfólio em linha com os pares — defender preço e espaço`}</div>
    </div>
    ${al1?`<div class="d-r"><div class="n" style="color:var(--warn)">${fmtN(Math.max(0,al1.fsV-al1.vs),1)} p.p.</div><div class="l">de valor a capturar</div></div>`:""}
  </div>
  <div class="card">
    <div style="overflow-x:auto"><table><tr><th>Marca</th><th>Share valor</th><th>Fair valor</th><th>Δ</th><th>Preço</th><th>Leitura do motor</th></tr>
    ${a.alavancas.map(x=>`<tr><td><b>${esc(x.m)}</b>${x.dono==="ambev"?` <span class="badge coletado">ambev</span>`:""}</td>
      <td>${fmtN(x.vs,1)}%</td><td>${fmtN(x.fsV,1)}%</td>
      <td style="color:${x.d<0?"var(--bad)":x.d>2?"var(--ok)":"var(--txt2)"}"><b>${x.d>0?"+":""}${fmtN(x.d,1)}</b> p.p.</td>
      <td>R$ ${x.pr.toFixed(2)}</td>
      <td class="tiny"><span class="v8-badge ${x.tipo==="ALAVANCA"?"margem":x.tipo==="DEFESA"?"defesa":x.tipo==="CONTER"?"sub":"compl"}">${x.tipo}</span> ${esc(x.leitura)}</td></tr>`).join("")}
    </table></div>
    <div class="tiny" style="margin-top:6px">Prêmio de valor do PDV: <b>${a.bsv.premio>0?"+":""}${fmtN(a.bsv.premio,1)} p.p.</b> (share de valor ${a.bsv.premio>=0?"acima":"abaixo"} do share de volume — ${a.bsv.premio>=0?"mix puxando valor":"mix puxado para preço"}). Nota de valor: <b>${a.notaValor}/100</b>.</div>
  </div>`;

  /* 5 · DIAGNÓSTICO: escada + scorecard lado a lado */
  h+=v8Sec("Diagnóstico","🪜 Escada de preço & racional da marca foco","pesos declarados, auditável");
  const ladder=[["Itaipava",7,"entrada"],["Brahma",8.5,"core"],["Skol",9,"giro"],["Budweiser",10.5,"core+"],
    ["Spaten",12,"puro malte"],["Original",13.5,"mesa 600"],["Stella",14.5,"sofia"],["Corona",16,"lifestyle"],["Heineken",16.5,"âncora"]];
  const maxP=Math.max(...ladder.map(l=>preco[l[0]]||l[1]),20);
  const escada=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:6px;flex-wrap:wrap">
      <span class="v8-badge ${a.priceAlerts.length?"sub":"defesa"}">${a.priceAlerts.length?"⚠️ Escada com distorção":"✓ Escada verificada"}</span>
      <span class="tiny">preço de balcão (R$)</span>
    </div>
    <div class="barra">
      ${ladder.map(l=>{
        const pr=preco[l[0]]||l[1];
        const quebrada=(l[0]==="Heineken"&&pr<=preco.Original)||(l[0]==="Skol"&&pr>preco.Budweiser);
        const foco=l[0]===a.foco.m, ancora=l[0]==="Heineken";
        const hpx=Math.round(42+((pr/maxP)*105));
        let cls="fill", pill="";
        if(quebrada){cls+=" quebrada"; pill=`<span class="pill alerta">🚨</span>`;}
        else if(foco){cls+=" foco"; pill=`<span class="pill foco">🎯</span>`;}
        else if(ancora){cls+=" ancora"; pill=`<span class="pill ancora">⚓</span>`;}
        return `<div class="v8-pilar" title="${l[0]}: R$ ${pr.toFixed(2)} (${l[2]})">
          ${pill}<div class="${cls}" style="height:${hpx}px"><span class="preco">R$ ${pr.toFixed(2)}</span></div>
          <div class="nome">${l[0]}</div></div>`;
      }).join("")}
    </div>
    ${a.priceAlerts.length?a.priceAlerts.map(al=>`<div class="v8-alerta" style="background:${al.tipo==="RED"?"var(--red-dim)":"rgba(232,161,60,.1)"};border:1px solid ${al.tipo==="RED"?"rgba(224,32,32,.3)":"rgba(232,161,60,.3)"}">
      <div class="t" style="color:${al.tipo==="RED"?"var(--red2)":"var(--warn)"}">${al.t}</div>
      <div class="d">${al.d}</div></div>`).join(""):`<div class="tiny" style="margin-top:8px;color:var(--ok)">✓ Preços coerentes com o papel de cada marca na ocasião de consumo.</div>`}`;
  const scorecard=`
    <div class="kicker">Assinatura v8 · critérios explícitos</div>
    <div class="tit">Por que ${esc(a.foco.m)}?</div>
    <div class="v8-barras">
      <div><div class="bt"><span>Nota quantitativa — 60% do peso</span><span style="color:var(--info)">${a.foco.notaQuanti}/100</span></div>
        <div class="track"><div class="fill" style="background:var(--info);width:${a.foco.notaQuanti}%"></div></div>
        <div class="tiny" style="margin-top:3px">gap 50% · potencial 25% · tendência 15% · preço sustenta 10%</div></div>
      <div><div class="bt"><span>Qualitativa × compatibilidade — 40%</span><span style="color:var(--ok)">${a.pend?"50 (pendente)":a.perf.scoreQuali+" × "+a.foco.compat+"%"}</span></div>
        <div class="track"><div class="fill" style="background:var(--ok);width:${a.pend?50:Math.round(a.perf.scoreQuali*a.foco.compat/100)}%"></div></div>
        <div class="tiny" style="margin-top:3px">perfil ${a.perfil} · ${BRAND_PREF_V8[a.foco.m]?BRAND_PREF_V8[a.foco.m].tier:"—"} · ideal: ${BRAND_PREF_V8[a.foco.m]?BRAND_PREF_V8[a.foco.m].ideal:"—"}</div></div>
    </div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
      ${v8BadgePapel("FOCO")}<span class="v8-badge audit">Score final: ${a.foco.scoreFinal}/100</span>
      ${a.pend?`<span class="v8-badge margem">veredito provisório</span>`:""}
    </div>
    <p class="v8-ration">${a.racional}</p>`;
  h+=`<div class="v8-duo"><div class="v8-ladder">${escada}</div><div class="v8-score">${scorecard}</div></div>`;

  /* 6 · PLANO DE EXECUÇÃO */
  h+=v8Sec("Plano de execução","🎯 3 frentes + 4 semanas","copiável para a equipe");
  h+=`<div class="v8-frentes">
    <div class="v8-frente"><h4>📣 Marketing</h4>${a.mkt.map(t=>`<div class="item">${t}</div>`).join("")}</div>
    <div class="v8-frente f2"><h4>🪝 Trade</h4>${a.trade.map(t=>`<div class="item">${t}</div>`).join("")}</div>
    <div class="v8-frente f3"><h4>💼 Comercial</h4>${a.comercial.map(t=>`<div class="item">${t}</div>`).join("")}</div>
  </div>
  <div class="v8-tl">${a.semanas.map(s=>`<div class="passo"><span class="tag">${s.s}</span><div class="desc">${s.d}</div></div>`).join("")}</div>
  <button class="btn primary block" style="margin-top:10px;min-height:46px" onclick="v8CopiarPlano('${p.id}')">📋 Copiar plano completo (3 frentes + 4 semanas)</button>`;

  /* 7 · EVIDÊNCIAS */
  h+=v8Sec("Evidências","📊 De onde vêm os números","clique para expandir");
  const c=ESTADO.checklist[p.id]||{};
  h+=v8Acc("accChecklist","📋 Checklist qualitativo do ponto (5 min)",["Auditoria v8","audit"],a.pend,`
    ${a.pend?`<div class="aviso" style="margin-bottom:10px">⚠️ Sem avaliação qualitativa: preencha para o motor calcular o perfil e liberar o veredito auditado.</div>`:
    `<div class="tiny" style="margin-bottom:10px">Perfil apurado: <b style="color:var(--info)">${a.perfil}</b> · compatibilidade da marca foco: <b style="color:var(--ok)">${a.foco.compat}%</b></div>`}
    <div class="v8-check">
      <div><label>1. Estado de cadeiras & mesas (1 a 5)</label><div class="v8-rate" id="v8r-mesas">
        ${[1,2,3,4,5].map(n=>`<button type="button" class="${+c.mesas===n?"on":""}" onclick="v8Rate('mesas',${n},'${p.id}')">${n}</button>`).join("")}</div></div>
      <div><label>2. Estado geral / fachada / higiene (1 a 5)</label><div class="v8-rate" id="v8r-fachada">
        ${[1,2,3,4,5].map(n=>`<button type="button" class="${+c.fachada===n?"on":""}" onclick="v8Rate('fachada',${n},'${p.id}')">${n}</button>`).join("")}</div></div>
      <div><label>3. Público predominante</label><select onchange="v8Save('${p.id}','publico',this.value)">
        ${["Trabalhador / Operário","Família / Tradicional","Jovem / Balada","Universitário","Alto padrão / Executivo"].map(o=>`<option${c.publico===o?" selected":""}>${o}</option>`).join("")}</select></div>
      <div><label>4. Preço ref. balcão (long neck mais cara, R$)</label><input type="number" step="0.5" value="${esc(c.precoRef||"")}" onchange="v8Save('${p.id}','precoRef',this.value)" placeholder="Ex: 16.00"></div>
      <div><label>5. Ocasião dominante</label><select onchange="v8Save('${p.id}','ocasiao',this.value)">
        ${["Bar de mesa / Calçada","Balada / Noite","Restaurante / Almoço e jantar","Petiscaria / Happy hour","Balcão / Delivery / Rápido"].map(o=>`<option${c.ocasiao===o?" selected":""}>${o}</option>`).join("")}</select></div>
      <div><label>6. Localização do ponto</label><select onchange="v8Save('${p.id}','local',this.value)">
        ${["Periferia / bairro afastado","Bairro residencial classe C/B","Corredor comercial movimentado","Zona nobre / polo gastronômico"].map(o=>`<option${c.local===o?" selected":""}>${o}</option>`).join("")}</select></div>
    </div>
    <div style="margin-top:10px"><button class="btn primary block" style="min-height:46px" onclick="v8Recalc('${p.id}')">⚡ Calcular e salvar perfil auditável</button></div>`);

  const rv=rows_v8(a);
  h+=v8Acc("accGap","📊 Onde está o gap? — share PDV vs fair share dos pares",null,true,`
    <div class="tiny" style="margin-bottom:10px"><b>${a.pares.length}</b> estabelecimentos homogêneos (mesmo tipo + classe). Verde = acima do fair share · vermelho = oportunidade · linha amarela = fair share.</div>
    <div style="overflow-x:auto"><svg viewBox="0 0 580 ${rv.h}" style="width:100%;min-width:520px;height:auto;display:block">
      ${rv.svg}
    </svg></div>
    <div style="overflow-x:auto"><table><tr><th>Marca</th><th>Share PDV</th><th>Fair share</th><th>Gap</th><th>Potencial</th><th>Leitura do motor</th></tr>
    ${rv.linhas}
    </table></div>`);

  h+=v8Acc("accCardapio","🍻 Cardápio completo & papéis das marcas",["Portfólio","audit"],false,`
    <div class="tiny" style="margin-bottom:8px">🎯 Foco | 💎 Margem | ⚓ Âncora | 🛡️ Defesa | 🥶 Complemento | 🚫 Substituir (expulsão)</div>
    <div style="overflow-x:auto"><table><tr><th>Marca</th><th>cx/mês</th><th>Share</th><th>Gap vs fair</th><th>Papel</th><th>Justificativa numérica</th></tr>
    ${a.cardapio.map(x=>`<tr><td><b>${esc(x.m)}</b></td><td>${fmtN(x.cx,0)}</td><td>${fmtN(x.share,1)}%</td>
      <td style="color:${x.gap!=null&&x.gap<0?"var(--bad)":"var(--ok)"}">${x.gap!=null?(x.gap>0?"+":"")+x.gap:"—"} p.p.</td>
      <td>${v8BadgePapel(x.papel)}</td><td class="tiny">${esc(x.just)}</td></tr>`).join("")}
    </table></div>`);

  h+=v8Acc("accServico","🧰 Nível de serviço & ativos de trade homologados",null,false,`
    <div class="tiny" style="margin-bottom:8px">Derivação auditável: ativos exigidos pelo perfil <b>${a.perfil}</b> com marca foco <b>${esc(a.foco.m)}</b></div>
    ${a.ativos.map(x=>`<div class="v8-frente" style="margin-bottom:8px"><b style="font-size:.8rem">${esc(x.i)}</b><div class="tiny" style="margin-top:2px">${esc(x.j)}</div></div>`).join("")}`);

  h+=v8Acc("accRacional","💡 Por quê? — racional estratégico em 3 frases",null,false,`<p class="v8-ration">${a.racional}</p>`);

  /* 8 · VEREDITO v7 compacto */
  h+=`<div class="card" style="margin-top:12px"><h3>⚖️ Veredito auditável do PDV <span class="hint">pesos declarados</span></h3>
    <div class="grid g3">
      <div class="kpi"><div class="v">${v.notaQuant}</div><div class="l">quantitativa (60%)</div></div>
      <div class="kpi"><div class="v">${v.notaQuali!=null?v.notaQuali:"—"}</div><div class="l">qualitativa (40%)</div></div>
      <div class="kpi"><div class="v" style="color:${v.final==null?"var(--warn)":v.final>=60?"var(--ok)":"var(--bad)"}">${v.final!=null?v.final:"pendente"}</div><div class="l">score final</div></div>
    </div>
    <div class="tiny" style="margin-top:6px">${v.criterios.join(" · ")}</div>
    ${v.final!=null?`<div class="tiny" style="margin-top:4px"><b>${esc(v.nivel)}</b></div>`:""}
  </div>`;

  return h;
};

/* barras duplas do gap (helper) */
function rows_v8(a){
  const mainBrands=["Skol","Brahma","Antarctica","Original","Spaten","Budweiser","Corona","Heineken","Itaipava"];
  const rows=mainBrands.map(m=>a.gapAnalysis.find(g=>g.m===m)).filter(Boolean);
  const maxVal=Math.max(50,...rows.map(r=>Math.max(r.share,r.fs||0)));
  const svg=rows.map((r,i)=>{ const y=i*34+10;
    const w=Math.max(2,Math.round((r.share/maxVal)*360));
    const fx=Math.round(((r.fs||0)/maxVal)*360);
    const acima=r.fs!=null&&r.share>=r.fs;
    const cor=r.fs==null?"#6b7075":acima?"#31b46b":"#e05050";
    return `<g transform="translate(100,${y})">
      <text x="-12" y="11" text-anchor="end" fill="#e8eaed" font-size="12" font-weight="600">${esc(r.m)}</text>
      <rect x="0" y="0" width="360" height="14" rx="4" fill="#26292e"/>
      <rect x="0" y="0" width="${w}" height="14" rx="4" fill="${cor}" opacity="0.9"/>
      ${r.fs!=null?`<line x1="${fx}" y1="-3" x2="${fx}" y2="17" stroke="#e8a13c" stroke-width="2.5" stroke-linecap="round"/>`:""}
      <text x="375" y="11" fill="#e8eaed" font-size="12" font-weight="700">${fmtN(r.share,1)}%</text>
      <text x="430" y="11" fill="#9aa0a6" font-size="11">(FS: ${r.fs!=null?r.fs:"—"}%)</text>
    </g>`; }).join("");
  const linhas=rows.map(r=>`<tr><td><b>${esc(r.m)}</b></td><td>${fmtN(r.share,1)}%</td><td>${r.fs!=null?fmtN(r.fs,1)+"%":"—"}</td>
    <td style="color:${r.gap!=null&&r.gap<0?"var(--bad)":"var(--ok)"}">${r.gap!=null?(r.gap>0?"+":"")+r.gap:"—"} p.p.</td>
    <td>${r.potencial?`<b style="color:var(--ok)">+${r.potencial} cx</b>`:"—"}</td>
    <td class="tiny">${r.fs==null?"sem presença nos pares — fair share indefinido":r.gap<-5?"gap reprimido — prioridade de captura":r.gap<0?"abaixo dos pares — captura gradual":"acima dos pares — defender"}</td></tr>`).join("");
  return {h:rows.length*34+20, svg, linhas};
}

/* ---------- ações do checklist ---------- */
function v8Rate(k,n,id){
  if(!ESTADO.checklist[id]) ESTADO.checklist[id]={};
  ESTADO.checklist[id][k]=n; salvarEstado();
  const box=document.getElementById("v8r-"+k);
  box.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i===n-1));
}
function v8Save(id,k,v){ if(!ESTADO.checklist[id]) ESTADO.checklist[id]={}; ESTADO.checklist[id][k]=v; salvarEstado(); }
function v8Recalc(id){ salvarEstado(); toast("Perfil auditável recalculado"); go("pdv"); }
function v8CopiarPlano(id){
  const a=analyticsV8(BASE.pdvs.find(x=>x.id===id));
  const NL=String.fromCharCode(10);
  const t="[BRANDFIT v8 — PLANO DE EXECUÇÃO]"+NL+NL
    +"PDV: "+a.p.nome+" ("+a.p.tipo+" · "+a.p.classe+") · Volume: "+fmtN(volCxV8(a.p),0)+" cx/mês"+NL
    +"BSV: "+fmtN(a.bsv.atual,1)+"% (fair "+fmtN(a.bsv.fair,1)+"% · gap "+fmtN(a.bsv.gap,1)+" p.p.)"+NL
    +"Marca Foco: "+a.foco.m+" (score "+a.foco.scoreFinal+"/100) | Premium: "+a.margem.m+NL
    +(a.alavancaBSV?"Alavanca de valor nº1: "+a.alavancaBSV.m+" — "+a.alavancaBSV.leitura+NL+NL:""+NL)
    +"Potencial: +"+fmtN(a.totalCx,0)+" cx/mês ("+fmtBRL(a.totalBRL)+")"+NL
    +"--------------------------------------------------"+NL
    +"🎯 FRENTE MARKETING:"+NL+a.mkt.map(m=>" • "+m).join(NL)+NL+NL
    +"🪝 FRENTE TRADE MARKETING:"+NL+a.trade.map(m=>" • "+m).join(NL)+NL+NL
    +"💼 FRENTE COMERCIAL:"+NL+a.comercial.map(m=>" • "+m).join(NL)+NL+NL
    +"📅 4 SEMANAS:"+NL+a.semanas.map(s=>" "+s.s+": "+s.d).join(NL);
  navigator.clipboard.writeText(t).then(()=>toast("Plano copiado"),()=>toast("Não copiou — selecione o texto"));
}

/* ============================================================
   HOJE v8.2 — agrupado por prioridade
   ============================================================ */
const renderHojeV7=renderHoje;
renderHoje=function(){
  const pds=BASE.pdvs;
  const scored=pds.map(p=>({p,a:analyticsV8(p)}));
  const pend=scored.filter(x=>x.a.pend);
  const prontos=scored.filter(x=>!x.a.pend);
  const q1=prontos.filter(x=>x.a.foco.scoreFinal>=55).sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal);
  const resto=prontos.filter(x=>x.a.foco.scoreFinal<55).sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal);
  const totalCx=scored.reduce((s,x)=>s+x.a.totalCx,0);

  let h=`<div class="v8-hero">
    <div class="v8-kpi sm"><div class="lbl">PDVs na rota</div><div class="val">${pds.length}</div><div class="sub">base ativa</div></div>
    <div class="v8-kpi sm ok"><div class="lbl">Potencial mapeado</div><div class="val green">+${fmtN(totalCx,0)}</div><div class="sub">cx/mês somados</div></div>
    <div class="v8-kpi sm ${pend.length?"warn":"ok"}"><div class="lbl">Checklist pendente</div><div class="val ${pend.length?"yellow":"green"}">${pend.length}</div><div class="sub">5 min cada</div></div>
    <div class="v8-kpi sm bad"><div class="lbl">Prioridade máxima</div><div class="val red">${q1.length}</div><div class="sub">score ≥ 55</div></div>
  </div>`;

  const linha=x=>{
    const pend2=x.a.pend;
    return `<div class="v8-row" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')">
      <div class="meio"><div class="nm">${esc(x.p.nome)}</div>
        <div class="meta">${esc(x.p.tipo)} · ${esc(x.p.classe)} · ${fmtN(volCxV8(x.p),0)} cx/mês</div></div>
      <div>${pend2?`<span class="v8-badge sub">⚠️ sem perfil</span>`:`<span class="v8-badge compl">${esc(x.a.perfil)}</span>`}</div>
      <div class="foco">${esc(x.a.foco.m)} <span class="tiny" style="color:var(--txt3)">${x.a.foco.scoreFinal}</span></div>
      <div class="pot">${pend2?"5 min":"+"+fmtN(x.a.foco.potencial,0)+" cx"}</div>
      <span class="tiny" style="color:var(--red2)">Abrir →</span>
    </div>`;
  };

  h+=`<div class="v8-grupo"><div class="gh">🚨 Prioridade máxima — atacar hoje<span class="cnt">${q1.length} PDVs</span></div>
    ${q1.length?q1.map(linha).join(""):`<div class="tiny" style="padding:12px 14px;color:var(--txt3)">Nenhum PDV com score alto hoje.</div>`}</div>`;
  if(pend.length) h+=`<div class="v8-grupo"><div class="gh">⚠️ Avaliação qualitativa pendente — 5 min libera o veredito<span class="cnt">${pend.length} PDVs</span></div>
    ${pend.map(linha).join("")}</div>`;
  h+=`<div class="v8-grupo"><div class="gh">📋 Demais PDVs — manter cadência<span class="cnt">${resto.length} PDVs</span></div>
    ${resto.length?resto.map(linha).join(""):`<div class="tiny" style="padding:12px 14px;color:var(--txt3)">Tudo priorizado.</div>`}</div>`;

  h+=`<div class="tiny" style="margin-top:6px">Ordenação pelo motor: score auditado da marca foco. Toque em uma linha para abrir a auditoria completa.</div>`;
  return h;
};

/* ============================================================
   TERRITÓRIO v8.2 — KPIs + matriz + quadrantes + ranking com filtros
   ============================================================ */
const renderTerritorioV7=renderTerritorio;
renderTerritorio=function(){
  const pds=BASE.pdvs;
  const scored=pds.map(p=>({p,a:analyticsV8(p)}));
  const totalCx=scored.reduce((s,x)=>s+x.a.totalCx,0);
  const totalBRL=scored.reduce((s,x)=>s+x.a.totalBRL,0);
  const pend=scored.filter(x=>x.a.pend).length;
  const pilotos=(ESTADO.pilotosV8||[]).length;
  const emRisco=scored.filter(x=>x.a.saude<50).length;
  const bsvMed=scored.length?scored.reduce((s,x)=>s+x.a.bsv.atual,0)/scored.length:0;

  let h=`<div class="v8-hero">
    <div class="v8-kpi sm"><div class="lbl">PDVs na base</div><div class="val">${pds.length}</div><div class="sub">segmentação homogênea</div></div>
    <div class="v8-kpi sm ok"><div class="lbl">Potencial total</div><div class="val green">+${fmtN(totalCx,0)}</div><div class="sub">cx/mês · ${fmtBRL(totalBRL)}</div></div>
    <div class="v8-kpi sm"><div class="lbl">BSV médio do território</div><div class="val">${fmtN(bsvMed,1)}%</div><div class="sub">brand share of value</div></div>
    <div class="v8-kpi sm ${emRisco?"bad":"ok"}"><div class="lbl">PDVs em risco</div><div class="val ${emRisco?"red":"green"}">${emRisco}</div><div class="sub">saúde &lt; 50 · quali: ${pds.length-pend}/${pds.length} · piloto: ${pilotos}</div></div>
  </div>`;

  /* matriz scatter */
  const W=800,H=340,pL=70,pR=40,pT=30,pB=40;
  const minX=-25,maxX=20,minY=0,maxY=Math.max(...pds.map(p=>volCxV8(p)),500);
  const sx=v=>pL+((v-minX)/(maxX-minX))*(W-pL-pR);
  const sy=v=>pT+(H-pT-pB)-((v-minY)/(maxY-minY))*(H-pT-pB);
  const zeroX=sx(0), midY=sy(maxY/2);
  const cores={"Bar":"#4c9be8","Bar tradicional":"#8b7cf6","Gastro bar":"#ec4899","Restaurante":"#31b46b","Mercado":"#e8a13c","Distribuidora":"#e8a13c","Casa Noturna":"#a855f7","Lanchonete":"#e8a13c"};
  h+=v8Sec("Mapa do território","🗺️ Matriz de priorização","volume (tamanho) × gap da marca foco (posição)");
  h+=`<div class="card"><div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:640px;height:auto">
    <rect x="${pL}" y="${pT}" width="${zeroX-pL}" height="${midY-pT}" fill="#e05050" opacity="0.05"/>
    <rect x="${pL}" y="${midY}" width="${zeroX-pL}" height="${pT+H-pB-midY}" fill="#e8a13c" opacity="0.04"/>
    <rect x="${zeroX}" y="${pT}" width="${pL+W-pR-zeroX}" height="${midY-pT}" fill="#31b46b" opacity="0.04"/>
    <rect x="${zeroX}" y="${midY}" width="${pL+W-pR-zeroX}" height="${pT+H-pB-midY}" fill="#4c9be8" opacity="0.04"/>
    <text x="${pL+12}" y="${pT+20}" fill="#e05050" font-size="11" font-weight="700">🚨 ATACAR JÁ</text>
    <text x="${pL+12}" y="${pT+H-pB-12}" fill="#e8a13c" font-size="11" font-weight="700">⚡ PLANEJAR</text>
    <text x="${zeroX+12}" y="${pT+20}" fill="#31b46b" font-size="11" font-weight="700">🛡️ MANTER</text>
    <text x="${zeroX+12}" y="${pT+H-pB-12}" fill="#4c9be8" font-size="11" font-weight="700">📈 EXPANDIR</text>
    ${scored.map(x=>{ const gap=x.a.foco.gap!=null?x.a.foco.gap:0, vol=volCxV8(x.p);
      const r=Math.max(5,Math.min(13,Math.round((vol/maxY)*12)));
      return `<circle cx="${sx(gap).toFixed(1)}" cy="${sy(vol).toFixed(1)}" r="${r}" fill="${cores[x.p.tipo]||"#9aa0a6"}" fill-opacity="0.8" stroke="#fff" stroke-width="1.2" style="cursor:pointer" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')"><title>${esc(x.p.nome)} · ${esc(x.a.foco.m)} · gap ${gap} p.p. · ${fmtN(vol,0)} cx</title></circle>`; }).join("")}
    <line x1="${zeroX}" y1="${pT}" x2="${zeroX}" y2="${H-pB}" stroke="#6b7075" stroke-dasharray="4 4"/>
    <line x1="${pL}" y1="${midY}" x2="${W-pR}" y2="${midY}" stroke="#6b7075" stroke-dasharray="4 4"/>
  </svg></div>
  <div class="tiny">cada bolha = um PDV · cor = segmento · tamanho = volume · clique para abrir a auditoria</div></div>`;

  /* quadrantes 2×2 */
  const q1=scored.filter(x=>x.a.foco.gap!=null&&x.a.foco.gap<=-5&&volCxV8(x.p)>=maxY*0.3).sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal).slice(0,4);
  const q2=scored.filter(x=>x.a.totalCx>15&&x.a.totalCx<=40).sort((a,b)=>b.a.totalCx-a.a.totalCx).slice(0,4);
  const q3=scored.filter(x=>x.a.saude>=75).slice(0,4);
  const q4=scored.filter(x=>x.a.gapAnalysis.some(g=>g.m==="Heineken"&&g.share>15)).slice(0,4);
  h+=v8Sec("Onde agir","🎯 Quadrantes de decisão","top 4 de cada");
  h+=`<div class="v8-quad">
    <div class="q" style="border-left:3px solid var(--red)"><h4>🚨 Prioridade máxima</h4>${q1.length?q1.map(x=>`<div class="qi" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')" style="cursor:pointer"><b>${esc(x.p.nome)}</b><span class="v">${esc(x.a.foco.m)} · ${x.a.foco.scoreFinal} pts</span></div>`).join(""):`<div class="tiny">—</div>`}</div>
    <div class="q" style="border-left:3px solid var(--warn)"><h4>⚡ Quick wins</h4>${q2.length?q2.map(x=>`<div class="qi" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')" style="cursor:pointer"><b>${esc(x.p.nome)}</b><span class="v" style="color:var(--ok)">+${fmtN(x.a.totalCx,0)} cx</span></div>`).join(""):`<div class="tiny">—</div>`}</div>
    <div class="q" style="border-left:3px solid var(--ok)"><h4>🛡️ Fortaleza / defesa</h4>${q3.length?q3.map(x=>`<div class="qi"><b>${esc(x.p.nome)}</b><span class="v" style="color:var(--ok)">${x.a.saude}/100</span></div>`).join(""):`<div class="tiny">—</div>`}</div>
    <div class="q" style="border-left:3px solid var(--info)"><h4>🥊 Campo de batalha</h4>${q4.length?q4.map(x=>`<div class="qi" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')" style="cursor:pointer"><b>${esc(x.p.nome)}</b><span class="v" style="color:var(--info)">Heineken ${fmtN(x.a.gapAnalysis.find(g=>g.m==="Heineken").share,0)}%</span></div>`).join(""):`<div class="tiny">—</div>`}</div>
  </div>`;

  /* ranking com filtros */
  if(!ESTADO.v8f) ESTADO.v8f={seg:"",perf:""};
  const f=ESTADO.v8f;
  const segs=[...new Set(pds.map(p=>p.tipo))].sort();
  const perfs=["Premium","Alto padrão","Tradicional","Popular","Econômico"];
  let lista=scored;
  if(f.seg) lista=lista.filter(x=>x.p.tipo===f.seg);
  if(f.perf==="⚠️ Pendente") lista=lista.filter(x=>x.a.pend);
  else if(f.perf) lista=lista.filter(x=>!x.a.pend&&x.a.perfil===f.perf);
  lista=lista.sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal);
  h+=v8Sec("Ranking","📋 Oportunidades por PDV","clique para abrir");
  h+=`<div class="card">
    <div class="v8-filtros">
      <select onchange="ESTADO.v8f.seg=this.value;salvarEstado();go('territorio')">
        <option value="">Todos os segmentos</option>${segs.map(s=>`<option${f.seg===s?" selected":""}>${s}</option>`).join("")}</select>
      <select onchange="ESTADO.v8f.perf=this.value;salvarEstado();go('territorio')">
        <option value="">Todos os perfis</option>${perfs.map(s=>`<option${f.perf===s?" selected":""}>${s}</option>`).join("")}<option${f.perf==="⚠️ Pendente"?" selected":""}>⚠️ Pendente</option></select>
      <span class="chip">${lista.length} PDVs</span>
    </div>
    <div style="overflow-x:auto"><table><tr><th>PDV</th><th>Segmento</th><th>Perfil</th><th>Volume</th><th>BSV</th><th>Marca foco</th><th>Score</th><th>Saúde</th></tr>
    ${lista.map(x=>{
      const saude=x.a.saude<50?["sub","Risco"]:x.a.totalCx>25?["margem","Oportunidade"]:["defesa","Saudável"];
      return `<tr style="cursor:pointer" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')">
      <td><b>${esc(x.p.nome)}</b></td>
      <td class="tiny">${esc(x.p.tipo)} · ${esc(x.p.classe)}</td>
      <td>${x.a.pend?`<span class="v8-badge sub">Pendente</span>`:esc(x.a.perfil)}</td>
      <td>${fmtN(volCxV8(x.p),0)} cx</td>
      <td><b>${fmtN(x.a.bsv.atual,1)}%</b> <span class="tiny" style="color:${x.a.bsv.gap>=0?"var(--ok)":"var(--bad)"}">${x.a.bsv.gap>0?"+":""}${fmtN(x.a.bsv.gap,1)}</span></td>
      <td><b style="color:var(--red2)">${esc(x.a.foco.m)}</b> <span class="tiny">${x.a.foco.gap!=null?(x.a.foco.gap>0?"+":"")+x.a.foco.gap:"—"} p.p.</span></td>
      <td><b>${x.a.foco.scoreFinal}/100</b></td>
      <td><span class="v8-badge ${saude[0]}">${saude[1]}</span></td></tr>`;
    }).join("")}
    </table></div>
  </div>`;
  return h;
};