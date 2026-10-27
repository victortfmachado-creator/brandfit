/* =====================================================================
   BrandFit v8 UI — VISUAL DO GABARITO (porta fiel)
   Escada de preço em degraus, scorecard auditável, accordions com
   títulos-pergunta, chips de alerta clicáveis, 3 frentes, timeline 4
   semanas, racional 3 frases, KPIs do território, ranking clicável.
   Sem backslashes.
   ===================================================================== */
"use strict";

/* ---------- CSS do gabarito ---------- */
(function(){
  const st=document.createElement("style");
  st.textContent=`
  .v8-hero{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
  @media(max-width:760px){.v8-hero{grid-template-columns:1fr}}
  .v8-kpi{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:14px 16px}
  .v8-kpi .lbl{font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--txt3)}
  .v8-kpi .val{font-size:2.2rem;font-weight:800;letter-spacing:-.03em;line-height:1.1;margin:.3rem 0;font-variant-numeric:var(--tabnum)}
  .v8-kpi .sub{font-size:.72rem;color:var(--txt2)}
  .v8-kpi .val.red{color:var(--red2)} .v8-kpi .val.green{color:var(--ok)} .v8-kpi .val.yellow{color:var(--warn)}
  .v8-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
  .v8-chip{background:var(--card2);border:1px solid var(--line);border-radius:20px;font-size:.75rem;font-weight:600;padding:5px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
  .v8-chip.red{background:var(--red-dim);border-color:rgba(224,32,32,.4);color:var(--red2)}
  .v8-chip.yellow{background:rgba(232,161,60,.12);border-color:rgba(232,161,60,.4);color:var(--warn)}
  .v8-chip.green{background:rgba(49,180,107,.12);border-color:rgba(49,180,107,.4);color:var(--ok)}
  .v8-stepper{display:flex;align-items:center;justify-content:space-between;background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:12px 16px;margin-bottom:12px;gap:10px;flex-wrap:wrap}
  .v8-step{display:flex;align-items:center;gap:10px;font-size:.8rem;font-weight:600;color:var(--txt2)}
  .v8-step .c{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-size:.75rem;font-weight:700;background:var(--card2);color:var(--txt3);border:1px solid var(--line)}
  .v8-step.ok .c{background:rgba(49,180,107,.15);color:var(--ok);border-color:rgba(49,180,107,.5)}
  .v8-step .t{font-size:.68rem;color:var(--txt3);font-weight:400}
  .v8-ladder{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:12px}
  .v8-ladder .barra{display:flex;align-items:flex-end;gap:8px;min-width:560px;height:190px;padding:0 8px 22px;border-bottom:2px solid var(--line);position:relative;overflow-x:auto}
  .v8-pilar{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;min-width:52px}
  .v8-pilar .fill{width:100%;border-radius:8px 8px 0 0;background:var(--card2);border:1px solid var(--line);border-bottom:none;display:flex;flex-direction:column;align-items:center;padding-top:6px;transition:transform .15s}
  .v8-pilar:hover .fill{transform:translateY(-3px)}
  .v8-pilar .fill.foco{background:var(--red-dim);border-color:rgba(224,32,32,.6)}
  .v8-pilar .fill.ancora{background:rgba(76,155,232,.15);border-color:rgba(76,155,232,.5)}
  .v8-pilar .fill.quebrada{background:rgba(224,80,80,.25);border-color:rgba(224,80,80,.7)}
  .v8-pilar .preco{font-size:.8rem;font-weight:700;color:var(--txt);font-variant-numeric:var(--tabnum)}
  .v8-pilar .nome{font-size:.72rem;font-weight:600;color:var(--txt2);margin-top:6px;text-align:center;white-space:nowrap}
  .v8-pilar .pill{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;padding:2px 6px;border-radius:4px;margin-bottom:4px}
  .v8-pilar .pill.foco{background:var(--red);color:#fff}
  .v8-pilar .pill.ancora{background:var(--info);color:#fff}
  .v8-pilar .pill.alerta{background:var(--bad);color:#fff}
  .v8-acc{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);margin-bottom:10px;overflow:hidden}
  .v8-acc>button{width:100%;background:transparent;border:none;color:var(--txt);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:.9rem;font-weight:600;text-align:left}
  .v8-acc .corpo{display:none;padding:0 16px 16px;border-top:1px solid var(--line)}
  .v8-acc.aberto .corpo{display:block}
  .v8-acc.aberto>button .seta{transform:rotate(180deg)}
  .v8-acc>button .seta{transition:transform .2s;color:var(--txt3)}
  .v8-score{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,.35)}
  .v8-score .tit{font-size:1.15rem;font-weight:800;margin:2px 0 10px}
  .v8-score .kicker{font-size:.68rem;font-weight:700;text-transform:uppercase;color:var(--red2);letter-spacing:.06em}
  .v8-barras{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:var(--bg2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px}
  @media(max-width:640px){.v8-barras{grid-template-columns:1fr}}
  .v8-barras .bt{display:flex;justify-content:space-between;font-size:.72rem;font-weight:700;color:var(--txt2);margin-bottom:4px}
  .v8-barras .track{background:var(--card2);height:8px;border-radius:99px;overflow:hidden}
  .v8-barras .fill{height:100%;border-radius:99px}
  .v8-frentes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  @media(max-width:760px){.v8-frentes{grid-template-columns:1fr}}
  .v8-frente{background:var(--bg2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:12px}
  .v8-frente h4{font-size:.85rem;margin-bottom:8px}
  .v8-frente .item{font-size:.78rem;color:var(--txt2);padding:6px 0;border-bottom:1px dashed var(--line);line-height:1.45}
  .v8-frente .item:last-child{border-bottom:none}
  .v8-tl{display:flex;flex-direction:column;gap:8px}
  .v8-tl .passo{display:flex;gap:10px;align-items:flex-start;background:var(--bg2);border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px 12px}
  .v8-tl .tag{flex:none;background:var(--red);color:#fff;font-size:.66rem;font-weight:800;padding:3px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.04em}
  .v8-tl .desc{font-size:.8rem;color:var(--txt2);line-height:1.5}
  .v8-badge{font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:4px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
  .v8-badge.foco{background:var(--red-dim);color:var(--red2);border:1px solid rgba(224,32,32,.35)}
  .v8-badge.sub{background:rgba(224,80,80,.12);color:var(--bad);border:1px solid rgba(224,80,80,.3)}
  .v8-badge.margem{background:rgba(232,161,60,.12);color:var(--warn);border:1px solid rgba(232,161,60,.3)}
  .v8-badge.ancora{background:rgba(76,155,232,.12);color:var(--info);border:1px solid rgba(76,155,232,.3)}
  .v8-badge.defesa{background:rgba(49,180,107,.12);color:var(--ok);border:1px solid rgba(49,180,107,.3)}
  .v8-badge.compl{background:var(--card2);color:var(--txt2);border:1px solid var(--line)}
  .v8-badge.audit{background:rgba(49,180,107,.12);color:var(--ok);border:1px solid rgba(49,180,107,.3);text-transform:uppercase;letter-spacing:.04em}
  .v8-check{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  @media(max-width:640px){.v8-check{grid-template-columns:1fr}}
  .v8-rate{display:flex;gap:4px}
  .v8-rate button{flex:1;background:var(--card2);border:1px solid var(--line);color:var(--txt2);padding:8px 0;font-size:.8rem;font-weight:700;border-radius:6px;cursor:pointer;min-height:44px}
  .v8-rate button.on{background:var(--red);color:#fff;border-color:var(--red)}
  .v8-ration{font-size:.85rem;color:var(--txt2);line-height:1.65;margin:0}
  .v8-ration b{color:var(--txt)}
  `;
  document.head.appendChild(st);
})();

/* ---------- helpers de render ---------- */
function v8Acc(id,titulo,badge,aberto,corpo){
  return `<div class="v8-acc${aberto?" aberto":""}" id="${id}">
    <button onclick="v8Toggle('${id}')"><span>${titulo}${badge?` <span class="v8-badge ${badge[1]}" style="margin-left:6px">${badge[0]}</span>`:""}</span><span class="seta">▾</span></button>
    <div class="corpo">${corpo}</div></div>`;
}
function v8Toggle(id){ const e=document.getElementById(id); e.classList.toggle("aberto"); }
function v8BadgePapel(p){
  const map={FOCO:["foco","🎯 FOCO"],SUBSTITUIR:["sub","🚫 SUBSTITUIR"],MARGEM:["margem","💎 MARGEM"],"ÂNCORA":["ancora","⚓ ÂNCORA"],DEFESA:["defesa","🛡️ DEFESA"],COMPLEMENTO:["compl","🥶 COMPLEMENTO"]};
  const m=map[p]||["compl",p]; return `<span class="v8-badge ${m[0]}">${m[1]}</span>`;
}

/* ---------- SUB-ABA AUDITORIA v8 (substitui a antiga) ---------- */
const secAuditoriaV7=secAuditoria;
secAuditoria=function(p){
  const a=analyticsV8(p);
  const v=vereditoAuditavel(p);
  const preco=a.preco;
  let h="";

  /* HERO 3 números */
  const saudeCls=a.saude<50?"red":a.saude<75?"yellow":"green";
  h+=`<div class="v8-hero">
    <div class="v8-kpi"><div class="lbl">🎯 Marca foco provada</div><div class="val">${esc(a.foco.m)}</div>
      <div class="sub">score auditado ${a.foco.scoreFinal}/100 · gap ${a.foco.gap!=null?a.foco.gap:"—"} p.p.</div></div>
    <div class="v8-kpi"><div class="lbl">💰 Potencial de recuperação</div><div class="val green">+${fmtN(a.totalCx,0)} cx/mês</div>
      <div class="sub">${fmtBRL(a.totalBRL)} adicionais / mês</div></div>
    <div class="v8-kpi"><div class="lbl">🩺 Score de saúde do PDV</div><div class="val ${saudeCls}">${a.saude}/100</div>
      <div class="sub">${a.saude>=75?"escada alinhada e portfólio equilibrado":"atenção a quebra de margem e concorrência"}</div></div>
  </div>`;

  /* chips de alerta */
  h+=`<div class="v8-chips">`;
  if(a.pend) h+=`<span class="v8-chip yellow" onclick="document.getElementById('accChecklist').classList.add('aberto');window.scrollTo(0,document.getElementById('accChecklist').offsetTop-60)">⚠️ Checklist quali pendente</span>`;
  a.priceAlerts.forEach(al=>h+=`<span class="v8-chip ${al.tipo==="RED"?"red":"yellow"}" onclick="v8Toggle('accCardapio')">${al.t}</span>`);
  if(!a.pend&&!a.priceAlerts.length) h+=`<span class="v8-chip green">✓ Escada e portfólio homologados</span>`;
  h+=`</div>`;

  /* stepper dos 2 filtros */
  h+=`<div class="v8-stepper">
    <div class="v8-step ok"><div class="c">✓</div><div>1. Filtro quantitativo<div class="t">triagem de gap & volume</div></div></div>
    <div class="v8-step ${a.pend?"":"ok"}"><div class="c">${a.pend?"2":"✓"}</div><div>2. Filtro qualitativo<div class="t">checklist de ponto & público</div></div></div>
    <div class="v8-step ${a.pend?"":"ok"}"><div class="c">${a.pend?"3":"✓"}</div><div>3. Veredito auditável<div class="t">scorecard & nível de serviço</div></div></div>
  </div>`;

  /* escada de preço */
  const ladder=[["Itaipava",7,"entrada"],["Brahma",8.5,"core"],["Skol",9,"giro"],["Budweiser",10.5,"core+"],
    ["Spaten",12,"puro malte"],["Original",13.5,"mesa 600"],["Stella",14.5,"sofia"],["Corona",16,"lifestyle"],["Heineken",16.5,"âncora"]];
  const maxP=Math.max(...ladder.map(l=>preco[l[0]]||l[1]),20);
  h+=`<div class="v8-ladder">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <div><h3 style="margin:0">🪜 Escada de preço praticada no ponto</h3>
      <div class="tiny">degraus graduais de preço de balcão (R$) — da cerveja de entrada à âncora de topo</div></div>
      <span class="v8-badge ${a.priceAlerts.length?"sub":"defesa"}">${a.priceAlerts.length?"⚠️ Escada com distorção":"✓ Escada verificada"}</span>
    </div>
    <div class="barra">
      ${ladder.map(l=>{
        const pr=preco[l[0]]||l[1];
        const quebrada=(l[0]==="Heineken"&&pr<=preco.Original)||(l[0]==="Skol"&&pr>preco.Budweiser);
        const foco=l[0]===a.foco.m, ancora=l[0]==="Heineken";
        const hpx=Math.round(45+((pr/maxP)*115));
        let cls="fill", pill="";
        if(quebrada){cls+=" quebrada"; pill=`<span class="pill alerta">🚨</span>`;}
        else if(foco){cls+=" foco"; pill=`<span class="pill foco">🎯 Foco</span>`;}
        else if(ancora){cls+=" ancora"; pill=`<span class="pill ancora">⚓ Âncora</span>`;}
        return `<div class="v8-pilar" title="${l[0]}: R$ ${pr.toFixed(2)} (${l[2]})">
          ${pill}<div class="${cls}" style="height:${hpx}px"><span class="preco">R$ ${pr.toFixed(2)}</span></div>
          <div class="nome">${l[0]}</div></div>`;
      }).join("")}
    </div>
    ${a.priceAlerts.length?`<div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
      ${a.priceAlerts.map(al=>`<div style="background:${al.tipo==="RED"?"var(--red-dim)":"rgba(232,161,60,.1)"};border:1px solid ${al.tipo==="RED"?"rgba(224,32,32,.3)":"rgba(232,161,60,.3)"};border-radius:8px;padding:10px 14px">
        <div style="font-size:.8rem;font-weight:700;color:${al.tipo==="RED"?"var(--red2)":"var(--warn)"}">${al.t}</div>
        <div style="font-size:.75rem;color:var(--txt2);margin-top:2px;line-height:1.5">${al.d}</div></div>`).join("")}
    </div>`:`<div class="tiny" style="margin-top:8px;color:var(--ok)">✓ Preços coerentes com o papel de cada marca na ocasião de consumo.</div>`}
  </div>`;

  /* scorecard: por que [marca foco]? */
  h+=`<div class="v8-score">
    <div class="kicker">Assinatura v8 · racional provado por critérios explícitos</div>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
      <div class="tit">Por que ${esc(a.foco.m)} neste PDV?</div>
      <div style="display:flex;gap:6px;align-items:center">
        ${v8BadgePapel("FOCO")}<span class="v8-badge audit">Score final: ${a.foco.scoreFinal}/100</span></div>
    </div>
    <div class="v8-barras">
      <div><div class="bt"><span>Nota quantitativa (60% do peso)</span><span style="color:var(--info)">${a.foco.notaQuanti}/100</span></div>
        <div class="track"><div class="fill" style="background:var(--info);width:${a.foco.notaQuanti}%"></div></div>
        <div class="tiny" style="margin-top:4px">gap 50% · potencial 25% · tendência 15% · preço sustenta 10%</div></div>
      <div><div class="bt"><span>Nota qualitativa × compatibilidade (40%)</span><span style="color:var(--ok)">${a.pend?"50 (pendente)":a.perf.scoreQuali+" × "+a.foco.compat+"%"}</span></div>
        <div class="track"><div class="fill" style="background:var(--ok);width:${a.pend?50:Math.round(a.perf.scoreQuali*a.foco.compat/100)}%"></div></div>
        <div class="tiny" style="margin-top:4px">perfil ${a.perfil} · ${BRAND_PREF_V8[a.foco.m]?BRAND_PREF_V8[a.foco.m].tier:"—"} · ideal: ${BRAND_PREF_V8[a.foco.m]?BRAND_PREF_V8[a.foco.m].ideal:"—"}</div></div>
    </div>
    ${a.pend?`<div class="aviso" style="margin-bottom:8px">⚠️ Perfil qualitativo pendente — preencha o checklist abaixo (5 min) para o veredito sair de estimativa para auditado.</div>`:""}
    <div class="v8-ration">${a.racional}</div>
  </div>`;

  /* accordion checklist */
  const c=ESTADO.checklist[p.id]||{};
  h+=v8Acc("accChecklist","📋 Checklist qualitativo do ponto",["Auditoria v8","audit"],a.pend,`
    ${a.pend?`<div class="aviso" style="margin-bottom:10px">⚠️ PDV sem avaliação qualitativa: preencha (5 min) para o motor calcular o perfil do ponto e liberar o veredito auditável.</div>`:
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
    <div style="margin-top:12px"><button class="btn primary block" style="min-height:48px" onclick="v8Recalc('${p.id}')">⚡ Calcular e salvar perfil auditável</button></div>`);

  /* accordion cardápio & papéis */
  h+=v8Acc("accCardapio","🍻 Cardápio completo & papéis das marcas",["Auditoria de portfólio","audit"],true,`
    <div class="tiny" style="margin-bottom:8px">Classificação rigorosa: 🎯 Foco | 💎 Margem | ⚓ Âncora | 🛡️ Defesa | 🥶 Complemento | 🚫 Substituir (expulsão)</div>
    <div style="overflow-x:auto"><table><tr><th>Marca</th><th>cx/mês</th><th>Share</th><th>Gap vs fair</th><th>Papel</th><th>Justificativa numérica</th><th>Ação</th></tr>
    ${a.cardapio.map(x=>`<tr><td><b>${esc(x.m)}</b></td><td>${fmtN(x.cx,0)}</td><td>${fmtN(x.share,1)}%</td>
      <td style="color:${x.gap!=null&&x.gap<0?"var(--bad)":"var(--ok)"}">${x.gap!=null?(x.gap>0?"+":"")+x.gap:"—"} p.p.</td>
      <td>${v8BadgePapel(x.papel)}</td><td class="tiny">${esc(x.just)}</td><td class="tiny">${esc(x.acao)}</td></tr>`).join("")}
    </table></div>`);

  /* accordion onde está o gap (barras duplas SVG) */
  const mainBrands=["Skol","Brahma","Antarctica","Original","Spaten","Budweiser","Corona","Heineken","Itaipava"];
  const rows=mainBrands.map(m=>a.gapAnalysis.find(g=>g.m===m)).filter(Boolean);
  const maxVal=Math.max(50,...rows.map(r=>Math.max(r.share,r.fs||0)));
  const svgH=rows.length*34+20;
  h+=v8Acc("accGap","📊 Onde está o gap? (share PDV vs fair share dos pares)",null,true,`
    <div class="tiny" style="margin-bottom:10px">Comparação com <b>${a.pares.length}</b> estabelecimentos homogêneos (mesmo tipo + classe). Verde = acima do fair share; vermelho = oportunidade de captura. Linha amarela = fair share.</div>
    <div style="overflow-x:auto"><svg viewBox="0 0 580 ${svgH}" style="width:100%;min-width:520px;height:auto;display:block">
      ${rows.map((r,i)=>{ const y=i*34+10;
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
        </g>`; }).join("")}
    </svg></div>
    <div style="overflow-x:auto"><table><tr><th>Marca</th><th>Share PDV</th><th>Fair share</th><th>Gap</th><th>Potencial</th><th>Leitura do motor</th></tr>
    ${rows.map(r=>`<tr><td><b>${esc(r.m)}</b></td><td>${fmtN(r.share,1)}%</td><td>${r.fs!=null?fmtN(r.fs,1)+"%":"—"}</td>
      <td style="color:${r.gap!=null&&r.gap<0?"var(--bad)":"var(--ok)"}">${r.gap!=null?(r.gap>0?"+":"")+r.gap:"—"} p.p.</td>
      <td>${r.potencial?`<b style="color:var(--ok)">+${r.potencial} cx</b>`:"—"}</td>
      <td class="tiny">${r.fs==null?"marca sem presença nos pares — fair share indefinido":r.gap<-5?"gap reprimido — prioridade de captura":r.gap<0?"abaixo dos pares — captura gradual":"acima dos pares — defender"}</td></tr>`).join("")}
    </table></div>`);

  /* accordion como roubar share (3 frentes) */
  h+=v8Acc("accRoubar","🎯 Como roubar share? (plano em 3 frentes)",null,true,`
    <div class="v8-frentes">
      <div class="v8-frente"><h4>📣 Marketing</h4>${a.mkt.map(t=>`<div class="item">${t}</div>`).join("")}</div>
      <div class="v8-frente"><h4>🪝 Trade marketing</h4>${a.trade.map(t=>`<div class="item">${t}</div>`).join("")}</div>
      <div class="v8-frente"><h4>💼 Comercial</h4>${a.comercial.map(t=>`<div class="item">${t}</div>`).join("")}</div>
    </div>
    <button class="btn block" style="margin-top:10px;min-height:48px" onclick="v8CopiarPlano('${p.id}')">📋 Copiar plano das 3 frentes</button>`);

  /* accordion nível de serviço */
  h+=v8Acc("accServico","🧰 Nível de serviço & ativos de trade homologados",null,false,`
    <div class="tiny" style="margin-bottom:8px">Derivação auditável: ativos exigidos pelo perfil <b>${a.perfil}</b> com marca foco <b>${esc(a.foco.m)}</b></div>
    ${a.ativos.map(x=>`<div class="v8-frente" style="margin-bottom:8px"><b style="font-size:.82rem">${esc(x.i)}</b><div class="tiny" style="margin-top:2px">${esc(x.j)}</div></div>`).join("")}`);

  /* accordion 4 semanas */
  h+=v8Acc("accSemanas","📅 O que fazer nas 4 semanas? (plano tático)",null,false,`
    <div class="v8-tl">${a.semanas.map(s=>`<div class="passo"><span class="tag">${s.s}</span><span class="desc">${s.d}</span></div>`).join("")}</div>`);

  /* accordion por quê */
  h+=v8Acc("accRacional","💡 Por quê? (racional estratégico)",null,false,`<p class="v8-ration">${a.racional}</p>`);

  /* veredito auditável v7 (mantido, pesos declarados) */
  h+=`<div class="card"><h3>⚖️ Veredito auditável do PDV <span class="hint">pesos declarados</span></h3>
    <div class="grid g3">
      <div class="kpi"><div class="v">${v.notaQuant}</div><div class="l">nota quantitativa (60%)</div></div>
      <div class="kpi"><div class="v">${v.notaQuali!=null?v.notaQuali:"—"}</div><div class="l">nota qualitativa (40%)</div></div>
      <div class="kpi"><div class="v" style="color:${v.final==null?"var(--warn)":v.final>=60?"var(--ok)":"var(--bad)"}">${v.final!=null?v.final:"pendente"}</div><div class="l">score final</div></div>
    </div>
    <div class="tiny" style="margin-top:6px">${v.criterios.join(" · ")}</div>
    ${v.final!=null?`<div class="tiny" style="margin-top:4px"><b>${esc(v.nivel)}</b></div>`:""}
  </div>`;

  return h;
};

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
  const t="[BRANDFIT v8 — PLANO DE SHARE THEFT DAS 3 FRENTES]"+"\n"+"PDV: "+a.p.nome+" ("+a.p.tipo+" · "+a.p.classe+")"+"\n"+"Volume: "+fmtN(volCxV8(a.p),0)+" cx/mês | Marca Foco: "+a.foco.m+" | Premium: "+a.margem.m+"\n"+"--------------------------------------------------"+"\n"+"🎯 FRENTE MARKETING:"+"\n"+a.mkt.map(m=>" • "+m).join("\n")+"\n\n"+"🪝 FRENTE TRADE MARKETING:"+"\n"+a.trade.map(m=>" • "+m).join("\n")+"\n\n"+"💼 FRENTE COMERCIAL:"+"\n"+a.comercial.map(m=>" • "+m).join("\n");
  navigator.clipboard.writeText(t).then(()=>toast("Plano copiado"),()=>toast("Não copiou — selecione o texto"));
}

/* ---------- HOJE v8: tabela de ações auditáveis ---------- */
const renderHojeV7=renderHoje;
renderHoje=function(){
  const pds=BASE.pdvs;
  const pend=pds.filter(p=>perfilV8(p).pendente).length;
  const linhas=pds.map(p=>({p,a:analyticsV8(p)})).sort((x,y)=>y.a.foco.scoreFinal-x.a.foco.scoreFinal);
  let h=`<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px">
      <div><h3 style="margin:0">⚡ Rota e prioridades de hoje</h3>
      <div class="tiny">ações recomendadas pelo motor de decisão para os PDVs da visita de hoje</div></div>
      <span class="v8-badge ${pend?"margem":"defesa"}">${pend} avaliações pendentes</span>
    </div>
    <div style="overflow-x:auto"><table><tr><th>PDV</th><th>Segmento</th><th>Perfil quali</th><th>Marca foco provada</th><th>Ação recomendada de hoje</th><th>Auditar</th></tr>
    ${linhas.map(x=>{
      const pend2=x.a.pend;
      return `<tr>
      <td><b>${esc(x.p.nome)}</b><div class="tiny">${fmtN(volCxV8(x.p),0)} cx/mês</div></td>
      <td class="tiny">${esc(x.p.tipo)} · ${esc(x.p.classe)}</td>
      <td>${pend2?`<span class="v8-badge sub">⚠️ Sem perfil</span>`:`<span class="v8-badge compl">${esc(x.a.perfil)}</span>`}</td>
      <td><b style="color:var(--red2)">${esc(x.a.foco.m)}</b> <span class="tiny">(${x.a.foco.scoreFinal} pts)</span></td>
      <td class="tiny">${pend2?"Preencher avaliação qualitativa (5 min)":"Visitar e executar plano de "+esc(x.a.foco.m)+" (+"+fmtN(x.a.foco.potencial,0)+" cx)"}</td>
      <td><button class="btn" style="padding:5px 10px;font-size:.7rem" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')">Abrir →</button></td></tr>`;
    }).join("")}
    </table></div>
    <div class="tiny" style="margin-top:8px">Próximo passo: iniciar rota do dia e preencher checklists pendentes.</div>
  </div>`;
  return h;
};

/* ---------- TERRITÓRIO v8: KPIs + matriz scatter + ranking ---------- */
const renderTerritorioV7=renderTerritorio;
renderTerritorio=function(){
  const pds=BASE.pdvs;
  const scored=pds.map(p=>({p,a:analyticsV8(p)}));
  const totalCx=scored.reduce((s,x)=>s+x.a.totalCx,0);
  const pend=scored.filter(x=>x.a.pend).length;
  const pilotos=(ESTADO.pilotosV8||[]).length;
  let h=`<div class="v8-hero" style="grid-template-columns:repeat(4,1fr)">
    <div class="v8-kpi"><div class="lbl">PDVs na base</div><div class="val">${pds.length}</div><div class="sub">segmentação homogênea</div></div>
    <div class="v8-kpi"><div class="lbl">Potencial total</div><div class="val green">+${fmtN(totalCx,0)} cx/mês</div><div class="sub">${fmtBRL(scored.reduce((s,x)=>s+x.a.totalBRL,0))} / mês</div></div>
    <div class="v8-kpi"><div class="lbl">Perfil quali concluído</div><div class="val ${pend?"yellow":"green"}">${pds.length-pend}/${pds.length}</div><div class="sub">${pend} pendentes de checklist</div></div>
    <div class="v8-kpi"><div class="lbl">PDVs em piloto (90d)</div><div class="val">${pilotos}</div><div class="sub">construção de marca ativa</div></div>
  </div>`;

  /* matriz scatter (gabarito) */
  const W=800,H=340,pL=70,pR=40,pT=30,pB=40;
  const minX=-25,maxX=20,minY=0,maxY=Math.max(...pds.map(p=>volCxV8(p)),500);
  const sx=v=>pL+((v-minX)/(maxX-minX))*(W-pL-pR);
  const sy=v=>pT+(H-pT-pB)-((v-minY)/(maxY-minY))*(H-pT-pB);
  const zeroX=sx(0), midY=sy(maxY/2);
  const cores={"Bar":"#4c9be8","Bar tradicional":"#8b7cf6","Gastro bar":"#ec4899","Restaurante":"#31b46b","Mercado":"#e8a13c","Distribuidora":"#e8a13c","Casa Noturna":"#a855f7","Lanchonete":"#e8a13c"};
  h+=`<div class="card"><h3>Matriz de priorização do território <span class="hint">volume mensal (tamanho) vs gap da marca foco (posição)</span></h3>
    <div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:640px;height:auto">
      <rect x="${pL}" y="${pT}" width="${zeroX-pL}" height="${midY-pT}" fill="#e05050" opacity="0.05"/>
      <rect x="${pL}" y="${midY}" width="${zeroX-pL}" height="${pT+H-pB-midY}" fill="#e8a13c" opacity="0.04"/>
      <rect x="${zeroX}" y="${pT}" width="${pL+W-pR-zeroX}" height="${midY-pT}" fill="#31b46b" opacity="0.04"/>
      <rect x="${zeroX}" y="${midY}" width="${pL+W-pR-zeroX}" height="${pT+H-pB-midY}" fill="#4c9be8" opacity="0.04"/>
      <text x="${pL+12}" y="${pT+20}" fill="#e05050" font-size="11" font-weight="700">🚨 ATACAR JÁ (alto vol + gap negativo)</text>
      <text x="${pL+12}" y="${pT+H-pB-12}" fill="#e8a13c" font-size="11" font-weight="700">⚡ PLANEJAR (vol médio + gap)</text>
      <text x="${zeroX+12}" y="${pT+20}" fill="#31b46b" font-size="11" font-weight="700">🛡️ MANTER (fair share atingido)</text>
      <text x="${zeroX+12}" y="${pT+H-pB-12}" fill="#4c9be8" font-size="11" font-weight="700">📈 EXPANDIR (acima do fair share)</text>
      ${scored.map(x=>{ const gap=x.a.foco.gap!=null?x.a.foco.gap:0, vol=volCxV8(x.p);
        const r=Math.max(5,Math.min(13,Math.round((vol/maxY)*12)));
        return `<circle class="v8-bolha" cx="${sx(gap).toFixed(1)}" cy="${sy(vol).toFixed(1)}" r="${r}" fill="${cores[x.p.tipo]||"#9aa0a6"}" fill-opacity="0.8" stroke="#fff" stroke-width="1.2" style="cursor:pointer" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')"><title>${esc(x.p.nome)} · ${esc(x.a.foco.m)} · gap ${gap} p.p. · ${fmtN(vol,0)} cx</title></circle>`; }).join("")}
      <line x1="${zeroX}" y1="${pT}" x2="${zeroX}" y2="${H-pB}" stroke="#6b7075" stroke-dasharray="4 4"/>
      <line x1="${pL}" y1="${midY}" x2="${W-pR}" y2="${midY}" stroke="#6b7075" stroke-dasharray="4 4"/>
    </svg></div>
    <div class="tiny">cada bolha = um PDV · cor = segmento · tamanho = volume · clique para abrir a auditoria</div>
  </div>`;

  /* quadrantes resumidos */
  const q1=scored.filter(x=>x.a.foco.gap!=null&&x.a.foco.gap<=-5&&volCxV8(x.p)>=maxY*0.3).sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal).slice(0,3);
  const q2=scored.filter(x=>x.a.totalCx>15&&x.a.totalCx<=40).slice(0,3);
  const q3=scored.filter(x=>x.a.saude>=75).slice(0,3);
  const q4=scored.filter(x=>x.a.gapAnalysis.some(g=>g.m==="Heineken"&&g.share>15)).slice(0,3);
  h+=`<div class="grid g2" style="margin-bottom:12px">
    ${q1.length?`<div class="card"><h3>🚨 Q1: prioridade máxima (score alto)</h3>${q1.map(x=>`<div class="tiny" style="padding:4px 0;border-bottom:1px dashed var(--line)"><b>${esc(x.p.nome)}</b> · ${esc(x.a.foco.m)} (${x.a.foco.scoreFinal} pts)</div>`).join("")}</div>`:""}
    ${q2.length?`<div class="card"><h3>⚡ Q2: quick wins (vol médio + demanda)</h3>${q2.map(x=>`<div class="tiny" style="padding:4px 0;border-bottom:1px dashed var(--line)"><b>${esc(x.p.nome)}</b> · +${fmtN(x.a.totalCx,0)} cx</div>`).join("")}</div>`:""}
    ${q3.length?`<div class="card"><h3>🛡️ Q3: fortaleza / defesa de base</h3>${q3.map(x=>`<div class="tiny" style="padding:4px 0;border-bottom:1px dashed var(--line)"><b>${esc(x.p.nome)}</b> · equilibrado</div>`).join("")}</div>`:""}
    ${q4.length?`<div class="card"><h3>🥊 Q4: campo de batalha (concorrência ativa)</h3>${q4.map(x=>`<div class="tiny" style="padding:4px 0;border-bottom:1px dashed var(--line)"><b>${esc(x.p.nome)}</b> · Heineken ${fmtN(x.a.gapAnalysis.find(g=>g.m==="Heineken").share,0)}%</div>`).join("")}</div>`:""}
  </div>`;

  /* ranking clicável */
  h+=`<div class="card"><h3>Ranking de oportunidades por PDV <span class="hint">clique para abrir a auditoria completa</span></h3>
    <div style="overflow-x:auto"><table><tr><th>PDV</th><th>Segmento</th><th>Perfil quali</th><th>Volume</th><th>Marca foco (v8)</th><th>Score final</th><th>Saúde</th><th>Ação</th></tr>
    ${scored.sort((a,b)=>b.a.foco.scoreFinal-a.a.foco.scoreFinal).map(x=>{
      const saude=x.a.saude<50?["sub","Risco"]:x.a.totalCx>25?["margem","Oportunidade"]:['defesa','Saudável'];
      return `<tr style="cursor:pointer" onclick="abrirPDV('${x.p.id}');ESTADO.subPdv='auditoria';salvarEstado();go('pdv')">
      <td><b>${esc(x.p.nome)}</b><div class="tiny">${x.a.gapAnalysis.some(g=>g.m==="Heineken"&&g.share>15)?"Concorrente: Heineken":"Sem ameaça direta"}</div></td>
      <td class="tiny">${esc(x.p.tipo)} · ${esc(x.p.classe)}</td>
      <td>${x.a.pend?`<span class="v8-badge sub">Pendente</span>`:esc(x.a.perfil)}</td>
      <td>${fmtN(volCxV8(x.p),0)} cx</td>
      <td><b style="color:var(--red2)">${esc(x.a.foco.m)}</b> <span class="tiny">${x.a.foco.gap!=null?(x.a.foco.gap>0?"+":"")+x.a.foco.gap:"—"} p.p.</span></td>
      <td><b>${x.a.foco.scoreFinal}/100</b></td>
      <td><span class="v8-badge ${saude[0]}">${saude[1]}</span></td>
      <td class="tiny" style="color:var(--red2)">Abrir →</td></tr>`;
    }).join("")}
    </table></div>
  </div>`;
  return h;
};
