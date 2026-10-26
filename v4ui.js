/* =====================================================================
   BrandFit v4 — UI: PLANO DE DESENVOLVIMENTO DE MARCA
   Rep digita o qualitativo -> sinais detectados -> diretrizes por marca
   -> frase pronta para falar com o dono.
   Nota: nenhum escape de barra invertida — só interpolação de template.
   ===================================================================== */
"use strict";

/* nota qualitativa do rep (persistida no ESTADO) */
if(!ESTADO.notasPDV) ESTADO.notasPDV={};
function salvarNota(txt){
  const p=pdvAtual(); if(!p) return;
  ESTADO.notasPDV[p.id]=txt; salvarEstado();
  renderPlanoAoVivo();
}
function copiarFrase(m){
  const p=pdvAtual();
  const f=frasePronta(p,m);
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(f).then(()=>toast("Frase copiada"),()=>toast("Não copiou — selecione o texto"));
  } else toast("Selecione o texto e copie");
}

/* ---------- sub-aba PLANO v4 (substitui a antiga) ---------- */
const secPlanoV4=secPlano;
secPlano=function(p){
  const pl=planoMarca(p);
  const notas=ESTADO.notasPDV[p.id]||"";
  let h=`<div class="card"><h3 style="font-size:1.1rem">📝 O que você viu no PDV <span class="hint">escreva livre — o app traduz</span></h3>
    <textarea id="notaRep" placeholder="Ex: dono reclama de preço da Heineken, fridge cheio de Itaipava, aceita degustação no sábado, pede prazo maior..." oninput="salvarNota(this.value)">${esc(notas)}</textarea>
    <div id="sinaisVivos" style="margin-top:8px"></div>
  </div>`;
  h+=`<div id="planoVivo">${secPlanoVivo(p,pl)}</div>`;
  h+=`<div class="tiny" style="margin:8px 4px">O plano reage ao que você digita — cada sinal detectado muda as ações das marcas.</div>`;
  return h;
};

/* sinais detectados ao vivo */
function sinaisVivosHTML(pl){
  if(!pl.sinais.length) return `<div class="tiny">Nenhum sinal ainda — escreva o que viu e o plano se ajusta.</div>`;
  return pl.sinais.map(s=>`<span class="chip-rua chip info" style="margin:2px 4px 2px 0">🔎 ${esc(s.leitura)}</span>`).join("");
}

/* plano por marca: diagnóstico + ações + frase pronta */
function secPlanoVivo(p,pl){
  let h=`<div class="card"><h3 style="font-size:1.1rem">🎯 Marca foco: ${esc(pl.foco)}</h3>`;
  const focoD=pl.plano.find(x=>x.m===pl.foco);
  if(focoD){
    h+=`<div class="veredito" style="font-size:.95rem">
      <div class="v-title">${focoD.papel.icone} ${esc(focoD.papel.papel)} · ${focoD.cur.toFixed(1)}% do volume${focoD.gap!=null&&focoD.gap>2?" · gap "+focoD.gap.toFixed(1)+" p.p.":""}</div>
      ${focoD.acoes.map(a=>`<div style="margin-top:6px">→ ${esc(a)}</div>`).join("")}
      ${focoD.meta!=null?`<div style="margin-top:6px"><b>Meta: +${focoD.meta} caixas/mês</b> (gap × fator de captura)</div>`:""}
    </div>`;
    h+=`<div class="frase-box" style="background:var(--red-dim);border:1px solid rgba(224,32,32,.35);border-radius:var(--radius-sm);padding:12px;margin-top:10px">
      <div class="tiny" style="color:var(--red2);font-weight:800;letter-spacing:.5px">FALA PRONTA</div>
      <div style="font-size:1rem;line-height:1.45;margin-top:4px" id="fraseFoco">${esc(frasePronta(p,pl.foco))}</div>
      <button class="btn block" style="margin-top:8px;min-height:48px" onclick="copiarFrase('${pl.foco}')">📋 Copiar fala</button>
    </div>`;
  }
  h+=`</div>`;
  const suportes=pl.plano.filter(x=>x.m!==pl.foco&&x.dono==="ambev");
  if(suportes.length){
    h+=`<div class="card"><h3 style="font-size:1.1rem">🛡️ Marcas de suporte <span class="hint">sustentam o crescimento do foco</span></h3>`;
    suportes.forEach(d=>{
      h+=`<div class="marca-linha" style="align-items:flex-start">
        <div class="nm">${d.papel.icone} ${esc(d.m)}</div>
        <div class="pct" style="font-size:1.25rem">${d.cur.toFixed(1)}%</div>
        <div class="alv"><b>${esc(d.papel.papel)}</b> · ${d.acoes.map(a=>esc(a)).join(" · ")}</div>
      </div>`;
    });
    h+=`</div>`;
  }
  const conc=pl.plano.filter(x=>x.dono!=="ambev");
  if(conc.length){
    h+=`<div class="card"><h3 style="font-size:1.1rem">⚔️ Concorrência <span class="hint">o que fazer com cada uma</span></h3>`;
    conc.forEach(d=>{
      h+=`<div class="marca-linha" style="align-items:flex-start">
        <div class="nm" style="color:${COR_GRUPO[GRUPO_DE[d.m]]}">${d.papel.icone} ${esc(d.m)}</div>
        <div class="pct" style="font-size:1.25rem">${d.cur.toFixed(1)}%</div>
        <div class="alv"><b>${esc(d.papel.papel)}</b> · ${d.acoes.map(a=>esc(a)).join(" · ")}</div>
      </div>`;
    });
    h+=`</div>`;
  }
  return h;
}

/* re-render ao vivo enquanto o rep digita */
function renderPlanoAoVivo(){
  const p=pdvAtual(); if(!p) return;
  const box=document.querySelector("#sinaisVivos");
  const vivo=document.querySelector("#planoVivo");
  if(!box||!vivo) return;
  const pl=planoMarca(p);
  box.innerHTML=sinaisVivosHTML(pl);
  vivo.innerHTML=secPlanoVivo(p,pl);
}