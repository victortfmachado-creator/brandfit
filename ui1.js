/* helpers de UI + TABs 1-3 (Hoje, PDV, Território) */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtBRL=v=>"R$ "+Number(v||0).toLocaleString("pt-BR",{maximumFractionDigits:0});
const fmtN=(v,d)=>Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
function toast(msg,tipo){ const t=$("#toast"); t.textContent=msg; t.className="show"+(tipo?" "+tipo:"");
  clearTimeout(t._h); t._h=setTimeout(()=>t.className="",2600); }
function abrirModal(html){ $("#modal").innerHTML=html; $("#modal-bg").classList.add("show"); }
function fecharModal(){ $("#modal-bg").classList.remove("show"); }
$("#modal-bg").addEventListener("click",e=>{ if(e.target.id==="modal-bg") fecharModal(); });
function badgeOrigem(o){ return o? '<span class="badge '+esc(o)+'">'+esc(o)+'</span>' : ""; }
function semaforo(v,bom,medio){ return '<span class="semaforo '+(v>=bom?"g":v>=medio?"y":"r")+'"></span>'; }
function semaforoInv(v,bomMax,medioMax){ return '<span class="semaforo '+(v<=bomMax?"g":v<=medioMax?"y":"r")+'"></span>'; }

/* TAB 1 · HOJE */
function renderHoje(){
  const hoje=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"});
  const pds=BASE.pdvs;
  const rota=ESTADO.ordemHoje||pds.map(p=>p.id);
  const emOrdem=rota.map(id=>pds.find(p=>p.id===id)).filter(Boolean).concat(pds.filter(p=>!rota.includes(p.id)));
  const st=ESTADO.visitas;
  const concl=emOrdem.filter(p=>st[p.id]==="concluido").length;
  const emVisita=emOrdem.filter(p=>st[p.id]==="em_visita").length;
  const hlRota=emOrdem.reduce((a,p)=>a+p.hl_total_mes,0);
  const hlTrab=emOrdem.filter(p=>st[p.id]==="concluido").reduce((a,p)=>a+p.hl_total_mes,0);
  const coleta=emOrdem.filter(p=>p.anamnese!=="completa"&&st[p.id]!=="concluido");
  const pend=emOrdem.filter(p=>p.anamnese==="completa"&&st[p.id]!=="concluido");
  let h=`
  <div class="card">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="flex:1">
        <div style="font-size:.78rem;color:var(--txt2);text-transform:capitalize">${esc(hoje)}</div>
        <div class="mid">${concl} de ${emOrdem.length} visitas concluídas</div>
        <div class="tiny">HL já trabalhado: ${fmtN(hlTrab,1)} de ${fmtN(hlRota,1)} HL (${pct(hlTrab,hlRota).toFixed(0)}%)</div>
      </div>
      <button class="btn" onclick="copiarResumoDia()">📋 Resumo p/ gerente</button>
    </div>
    <div class="bar ${concl===emOrdem.length?"ok":""}" style="margin-top:8px"><div style="width:${pct(concl,emOrdem.length)}%"></div></div>
  </div>`;
  h+=`<div class="card"><h3>⚡ Ações rápidas</h3><div class="grid g2">
    <button class="btn" onclick="ordenarPorPrioridade()">Ordenar por prioridade</button>
    <button class="btn" onclick="ordenarPorHL()">Ordenar por HL</button>
  </div><div class="tiny" style="margin-top:6px">Prioridade = gap até fair share da marca-alvo + anamnese incompleta + ruptura.</div></div>`;
  h+=`<div class="card"><h3>🚚 Fila de coleta <span class="hint">${coleta.length} PDVs com anamnese incompleta</span></h3>`;
  if(!coleta.length) h+=`<div class="empty"><div class="ic">✅</div>Toda a anamnese do território está completa.</div>`;
  else coleta.forEach((p,i)=>h+=cardVisita(p,i+1,true));
  h+=`</div>`;
  h+=`<div class="card"><h3>📍 Rota do dia <span class="hint">${pend.length} pendentes · ${emVisita} em visita</span></h3>`;
  if(!pend.length) h+=`<div class="empty"><div class="ic">🎉</div>Rota concluída. Use o ＋ para registro rápido.</div>`;
  else pend.forEach((p,i)=>h+=cardVisita(p,i+1,false));
  h+=`</div>`;
  return h;
}
function cardVisita(p,num,coleta){
  const st=ESTADO.visitas[p.id]||"pendente";
  const a=acaoDoDia(p), v=veredito(p);
  const cls=st==="concluido"?" done":"";
  const pill=st==="concluido"?'<span class="progress-pill c">concluído</span>'
    :st==="em_visita"?'<span class="progress-pill e">em visita</span>'
    :'<span class="progress-pill p">pendente</span>';
  return `<div class="visita${cls}" data-id="${p.id}">
    <div class="head" onclick="toggleVisita('${p.id}')">
      ${coleta?"":'<span class="handle" onclick="event.stopPropagation();dragStart(event,\''+p.id+'\')" draggable="true">⠿</span>'}
      <span class="n">${num}</span>
      <div style="flex:1;min-width:0">
        <div class="nome">${esc(p.nome)} ${p.demo?'<span class="chip '+(p.demo==="premium"?"info":"ok")+'">demo '+esc(p.demo)+'</span>':""}</div>
        <div class="meta">${esc(p.tipo)} · classe ${esc(p.classe)} · ${esc(p.bairro)} · potencial ${esc(potencialTexto(p))} <span class="badge ${esc(p.origem_potencial)}">${esc(p.origem_potencial)}</span> · confiança ${scoreConfianca(p)}%</div>
      </div>
      ${pill}<span style="color:var(--txt3)">▾</span>
    </div>
    <div class="body">
      <div class="acao-dia">
        <div class="t">Ação do dia · marca-alvo: ${esc(v.ma.alvo.m)}</div>
        <div class="a">${esc(a.titulo)}</div>
        <div class="j">Por quê: ${esc(a.justificativa)}</div>
      </div>
      <div class="grid g3 tiny" style="margin-bottom:8px">
        <div>Share Ambev<br><b class="small">${fmtN(ambevShare(p),1)}%</b></div>
        <div>BSV<br><b class="small">${fmtN(p.bsv,1)}%</b></div>
        <div>Tempo estimado<br><b class="small">${a.tempo} min</b></div>
      </div>
      <div class="acts">
        <button class="btn" onclick="registrarVisita('${p.id}')">⏱️ Registrar (5 min)</button>
        <button class="btn" onclick="abrirPDV('${p.id}')">🏪 Abrir PDV</button>
        <button class="btn ${st==="concluido"?"":"primary"}" onclick="marcarFeita('${p.id}')">${st==="concluido"?"✓ Feita":"Marcar feita"}</button>
      </div>
    </div>
  </div>`;
}
function toggleVisita(id){ document.querySelector('.visita[data-id="'+id+'"]').classList.toggle("open"); }
function ordenarPorPrioridade(){
  const score=p=>{ const v=veredito(p);
    return (v.gap.gapPct!=null?Math.max(0,v.gap.gapPct):0)*2+(p.anamnese!=="completa"?100:0)+p.ruptura_mensal_pct*0.5; };
  ESTADO.ordemHoje=[...BASE.pdvs].sort((a,b)=>score(b)-score(a)).map(p=>p.id);
  salvarEstado(); go("hoje"); toast("Rota ordenada por prioridade do motor");
}
function ordenarPorHL(){
  ESTADO.ordemHoje=[...BASE.pdvs].sort((a,b)=>b.hl_total_mes-a.hl_total_mes).map(p=>p.id);
  salvarEstado(); go("hoje"); toast("Rota ordenada por HL/mês");
}
let dragId=null;
function dragStart(ev,id){ dragId=id; }
document.addEventListener("dragover",e=>{
  const card=e.target.closest&&e.target.closest(".visita[data-id]");
  if(card&&dragId&&card.dataset.id!==dragId){
    const ord=(ESTADO.ordemHoje||BASE.pdvs.map(p=>p.id)).filter(x=>x!==dragId);
    ord.splice(ord.indexOf(card.dataset.id),0,dragId);
    ESTADO.ordemHoje=ord; salvarEstado(); if(ESTADO.aba==="hoje") go("hoje");
  }
});
function marcarFeita(id){
  ESTADO.visitas[id]=ESTADO.visitas[id]==="concluido"?"pendente":"concluido";
  salvarEstado(); go(ESTADO.aba);
  if(ESTADO.visitas[id]==="concluido") toast("Visita marcada como concluída");
}
function copiarResumoDia(){
  const pds=BASE.pdvs, st=ESTADO.visitas;
  const ord=(ESTADO.ordemHoje||pds.map(p=>p.id)).map(id=>pds.find(p=>p.id===id)).filter(Boolean);
  const linhas=["RESUMO DA ROTA — "+new Date().toLocaleDateString("pt-BR"),
    "Concluídas: "+ord.filter(p=>st[p.id]==="concluido").length+"/"+ord.length,""];
  ord.forEach(p=>{ const a=acaoDoDia(p);
    linhas.push((st[p.id]==="concluido"?"✓":"•")+" "+p.nome+" — "+a.titulo+(st[p.id]==="concluido"?" (feito)":" (pendente)")); });
  const txt=linhas.join("\n");
  const done=ok=>toast(ok?"Resumo copiado":"Copie manualmente abaixo",ok?"":"warn");
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>done(true),()=>done(false)); else done(false);
  abrirModal('<h3>Resumo do dia</h3><textarea class="copyarea" rows="12" onclick="this.select()">'+esc(txt)+'</textarea><br><button class="btn block" onclick="fecharModal()">Fechar</button>');
}
function registrarVisita(id){
  const p=BASE.pdvs.find(x=>x.id===id);
  abrirModal(`<h3>Registro rápido · ${esc(p.nome)}</h3>
    <label>Conversa com o decisor</label><textarea id="rv-nota" placeholder="O que foi tratado..."></textarea>
    <label>Compromisso gerado</label><input id="rv-comp" placeholder="Ex.: levar proposta de ponto extra na próxima">
    <div class="grid g2" style="margin-top:12px">
      <button class="btn" onclick="fecharModal()">Cancelar</button>
      <button class="btn primary" onclick="salvarRegistro('${id}')">Salvar</button></div>`);
}
function salvarRegistro(id){
  ESTADO.visitas[id]="em_visita";
  ESTADO["reg_"+id]={data:new Date().toISOString().slice(0,10),nota:$("#rv-nota").value,comp:$("#rv-comp").value};
  salvarEstado(); fecharModal(); go(ESTADO.aba); toast("Registro salvo (rascunho em visita)");
}

/* TAB 2 · PDV */
function abrirPDV(id){ ESTADO.pdvAtual=id; ESTADO.aba="pdv"; salvarEstado(); go("pdv"); }
function pdvAtual(){ return BASE.pdvs.find(p=>p.id===ESTADO.pdvAtual)||BASE.pdvs[0]; }
function renderPdv(){
  const p=pdvAtual(); if(!p) return '<div class="empty">Sem PDV.</div>';
  const v=veredito(p), sub=ESTADO.subPdv||"anamnese";
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
      <div class="kpi" onclick="ESTADO.subPdv='anamnese';salvarEstado();go('pdv')">
        <div class="v">${scoreConfianca(p)}%</div><div class="l">Score confiança</div><div class="m">${p.anamnese}</div></div>
      <div class="kpi" onclick="ESTADO.subPdv='diagnostico';salvarEstado();go('pdv')">
        <div class="v">${esc(v.ma.alvo.m)}</div><div class="l">Marca-alvo</div><div class="m">${esc(TIER_NOME[v.ma.alvo.t])} · ${esc(v.decisao.split(" ")[0].toLowerCase())}</div></div>
    </div>
  </div>
  <div class="subtabs">
    ${[["anamnese","📋 Anamnese"],["diagnostico","🔍 Diagnóstico"],["kpis","📊 KPIs"],["estrategia","🎯 Estratégia"],["plano","🗓️ Plano"]]
      .map(x=>'<button class="subtab'+(sub===x[0]?" active":"")+"\" onclick=\"ESTADO.subPdv='"+x[0]+"';salvarEstado();go('pdv')\">"+x[1]+'</button>').join("")}
  </div>`;
  if(sub==="anamnese") h+=secAnamnese(p);
  if(sub==="diagnostico") h+=secDiagnostico(p,v);
  if(sub==="kpis") h+=secKpis(p);
  if(sub==="estrategia") h+=secEstrategia(p);
  if(sub==="plano") h+=secPlano(p);
  return h;
}
function secAnamnese(p){
  const bloco=(t,campos)=>`<div class="card"><h3>${t}</h3>`+campos.map(c=>{
    if(c.type==="select") return `<label>${c.l}</label><select onchange="anamSave('${p.id}','${c.k}',this.value)">
      ${c.opts.map(o=>'<option'+(String(p[c.k]||"")===o?" selected":"")+'>'+esc(o)+'</option>').join("")}</select>`;
    if(c.type==="bool") return `<label>${c.l}</label><select onchange="anamSave('${p.id}','${c.k}',this.value==='true')">
      <option value="true"${p[c.k]?" selected":""}>Sim</option><option value="false"${!p[c.k]?" selected":""}>Não</option></select>`;
    return `<label>${c.l}</label><input type="${c.type||"text"}" value="${esc(p[c.k])}" onchange="anamSave('${p.id}','${c.k}',this.value)">`;
  }).join("")+`</div>`;
  const blocos=[
    ["1 · Identificação",[ {k:"nome",l:"Nome do PDV"},{k:"tipo",l:"Tipo",type:"select",opts:["Bar","Restaurante","Distribuidora","Mercado","Lanchonete","Casa Noturna"]},
      {k:"classe",l:"Classe",type:"select",opts:["A","B","C"]},{k:"bairro",l:"Bairro"},{k:"endereco",l:"Endereço"},
      {k:"decisor",l:"Decisor",type:"select",opts:["Dono","Gerente","Sócio","Filho do dono"]},{k:"freq_visita",l:"Frequência de visita",type:"select",opts:["Semanal","Quinzenal"]} ]],
    ["2 · Estrutura física",[ {k:"hl_total_mes",l:"Volume total (HL/mês)",type:"number"},{k:"hl_cerveja_mes",l:"Volume cerveja (HL/mês)",type:"number"},
      {k:"hl_refri_mes",l:"Refrigerante (HL/mês)",type:"number"},{k:"hl_energetico_mes",l:"Energético (HL/mês)",type:"number"},
      {k:"hl_agua_mes",l:"Água (HL/mês)",type:"number"},{k:"geladeiras_porte",l:"Porta-garrafas / geladeiras (un)",type:"number"},
      {k:"mesas",l:"Mesas",type:"number"},{k:"porta_garrafas",l:"Tem porta-garrafas?",type:"bool"} ]],
    ["3 · Comercial",[ {k:"share_geladeira",l:"Share de geladeira (%)",type:"number"},{k:"receita_total_mes",l:"Receita total mês (R$)",type:"number"},
      {k:"ruptura_mensal_pct",l:"Ruptura mensal (%)",type:"number"},
      {k:"preco.Skol",l:"Preço balcão Skol (R$)",type:"number"},{k:"preco.Brahma",l:"Preço balcão Brahma (R$)",type:"number"},
      {k:"preco.Heineken",l:"Preço balcão Heineken (R$)",type:"number"},
      {k:"pagto",l:"Prazo de pagamento",type:"select",opts:["À vista","7 dias","14 dias","21 dias","30 dias"]},
      {k:"limite_credito",l:"Limite de crédito (R$)",type:"number"},{k:"inadimplencia",l:"Inadimplência (%)",type:"number"} ]],
    ["4 · Qualitativo / percepção",[ {k:"demanda_espontanea",l:"Demanda espontânea (1–5)",type:"number"},
      {k:"imagem",l:"Imagem do PDV",type:"select",opts:["Tradicional","Moderno","Desleixado","Premium","Popular"]},
      {k:"publico",l:"Público"},{k:"percepcao_marca",l:"Percepção da marca",type:"select",opts:["Excelente","Boa","Média","Desconhecida"]},
      {k:"conc_acao",l:"Ação do concorrente"} ]],
    ["5 · Relacionamento",[ {k:"relacao",l:"Relação",type:"select",opts:["Excelente","Boa","Neutra","Tensa"]},
      {k:"observacoes",l:"Observações"},{k:"ponto_extra",l:"Tem ponto extra?",type:"bool"},
      {k:"cold_door",l:"Cerveja gelada garantida?",type:"bool"},{k:"frente_gondola",l:"Frente de gôndola?",type:"bool"} ]]
  ];
  let h=`<div class="card"><h3>Status da anamnese <span class="hint">salva automaticamente com toast</span></h3>
    <div class="grid g2">
      <select onchange="anamStatus('${p.id}',this.value)">
        ${["completa","parcial","pendente"].map(s=>'<option'+(p.anamnese===s?" selected":"")+'>'+s+'</option>').join("")}
      </select>
      <div class="kpi"><div class="v">${scoreConfianca(p)}%</div><div class="l">score de confiança</div></div>
    </div>
    <div class="tiny" style="margin-top:6px">Score = % de campos medidos (completa ≈92%, parcial ≈58%, pendente ≈20%).</div>
  </div>`;
  blocos.forEach(b=>h+=bloco(b[0],b[1]));
  return h;
}
function anamSave(id,campo,valor){
  const p=BASE.pdvs.find(x=>x.id===id); if(!p) return;
  if(campo==="share_foco"&&Number(valor)>PARAMS.share_soma_max){
    toast("Share "+Number(valor)+"% > "+PARAMS.share_soma_max+"% — salvamento bloqueado","err"); return; }
  if(campo.startsWith("preco.")){ const v=Number(valor)||0;
    if(v<PARAMS.preco_faixa_plausivel.min||v>PARAMS.preco_faixa_plausivel.max)
      toast("Preço fora da faixa plausível (R$ "+PARAMS.preco_faixa_plausivel.min+"–"+PARAMS.preco_faixa_plausivel.max+") — confira","warn");
    p.preco[campo.split(".")[1]]=v; }
  else if(typeof p[campo]==="boolean") p[campo]=valor===true||valor==="true";
  else if(typeof p[campo]==="number") p[campo]=Number(valor)||0;
  else p[campo]=valor;
  salvarBase(); toast("Campo salvo");
  if(["hl_total_mes","hl_cerveja_mes","receita_total_mes","imagem","classe"].includes(campo)) go("pdv");
}
function anamStatus(id,s){ const p=BASE.pdvs.find(x=>x.id===id); p.anamnese=s; salvarBase(); go("pdv"); toast("Status: "+s); }
function secDiagnostico(p,v){
  const d=disputaEspaco(p), t=tendencia(p), ma=v.ma;
  let h=`<div class="card"><h3>Filtro quantitativo <span class="hint">tier ${esc(TIER_NOME[ma.alvo.t])} — fair share do tier</span></h3>`;
  if(v.gap.fs!=null){
    h+=`<table><tr><th>Fair share do tier (${esc(v.gap.grupo)})</th><th>Share atual</th><th>Gap HL/mês</th><th>Gap caixas</th></tr>
      <tr><td>${fmtN(v.gap.fs,1)}% <span class="tiny">(mediana ${v.gap.n} PDVs)</span></td>
      <td>${fmtN(ma.alvo.cur,1)}%</td><td class="t-right">${fmtN(v.gap.hl,1)}</td><td class="t-right">${fmtN(v.gap.caixas,0)}</td></tr></table>`;
    if(!v.gap.ok) h+=`<div class="aviso">⚠️ ${esc(v.gap.aviso)}</div>`;
  } else h+=`<div class="aviso">Sem amostra para fair share — complete anamneses de PDVs do mesmo segmento.</div>`;
  h+=`<div class="grid g3" style="margin-top:8px">
    <div class="kpi"><div class="v">${fmtN(ambevHL(p),1)}</div><div class="l">HL Ambev/mês</div></div>
    <div class="kpi"><div class="v">${fmtN(p.bsv,1)}%</div><div class="l">BSV</div></div>
    <div class="kpi"><div class="v">${fmtN(p.receita_total_mes/p.hl_total_mes,0)}</div><div class="l">R$/HL do PDV</div></div>
  </div></div>`;
  h+=`<div class="card"><h3>Filtro qualitativo</h3><div class="grid g2 small">
      <div>${semaforo(p.demanda_espontanea,4,3)} Demanda espontânea: <b>${p.demanda_espontanea}/5</b></div>
      <div>${semaforo(p.share_geladeira,PARAMS.meta_share_geladeira,15)} Share geladeira: <b>${fmtN(p.share_geladeira,0)}%</b></div>
      <div>${semaforoInv(p.ruptura_mensal_pct,PARAMS.meta_ruptura_max,12)} Ruptura: <b>${fmtN(p.ruptura_mensal_pct,1)}%</b></div>
      <div>Relação: <b>${esc(p.relacao)}</b></div>
      <div>Ação do concorrente: <b>${esc(p.conc_acao)}</b></div>
      <div>Tendência Ambev: <b>${esc(t.txt)}</b> ${t.ajustado?'<span class="badge estimativa">a calibrar com BI</span>':""}</div>
    </div></div>`;
  h+=`<div class="card"><h3>Veredito do motor <span class="hint">auditável — mostra a razão</span></h3>
    <div class="veredito"><div class="v-title">${esc(v.decisao)}</div>
    ${v.motivos.length?"<b>Por quê:</b><ul style='margin:4px 0 8px 18px'>"+v.motivos.map(m=>"<li>"+esc(m)+"</li>").join("")+"</ul>":""}
    ${v.contra.length?"<b>Atenção:</b><ul style='margin:4px 0 0 18px'>"+v.contra.map(m=>"<li>"+esc(m)+"</li>").join("")+"</ul>":""}
    ${!v.motivos.length&&!v.contra.length?"Sem gaps relevantes — consolidar posição.":""}</div>
    <div class="tiny" style="margin-top:8px">Marca-alvo = encaixe de posicionamento (tier marca × tier PDV) + headroom vs fair share do tier + distribuição. Insumos: share e volumes ${badgeOrigem(p.origem_potencial==="coletado"?"coletado":"estimado")}, metas do painel.</div>
  </div>`;
  h+=`<div class="card"><h3>Disputa de espaço por categoria</h3>
    ${d.cats.map(c=>`<div class="degrau"><div class="nm">${esc(c.c)}</div><div class="bar" style="flex:1"><div style="width:${c.fr.toFixed(0)}%"></div></div><div class="tiny">${c.fr.toFixed(0)}%</div></div>`).join("")}
    <div class="small" style="margin-top:8px">${esc(d.leitura)}</div></div>`;
  return h;
}
function secKpis(p){
  const v=veredito(p);
  const kpi=(t,val,meta,ok,leitura,origem)=>`<div class="kpi" style="cursor:default">
    <div class="v" style="color:${ok===true?"var(--ok)":ok===false?"var(--warn)":"var(--txt)"}">${val}</div><div class="l">${t} ${origem?badgeOrigem(origem):""}</div>
    <div class="m">meta: ${meta}</div><div class="m" style="color:var(--txt2)">${leitura}</div></div>`;
  let h=`<div class="card"><h3>Volume</h3><div class="grid g2">
    ${kpi("HL Ambev/mês",fmtN(ambevHL(p),1),"crescer gap "+(v.gap.hl?fmtN(v.gap.hl,1):"—")+" HL",v.gap.hl<1,"soma das marcas Ambev","coletado")}
    ${kpi("Caixas Ambev/mês",fmtN(p.caixas_ambev_mes||0,0),">"+Math.max(1,Math.round(v.gap.caixas||0))+" p/ fechar gap",(v.gap.caixas||0)<1,"conversão por fator de caixa (painel)","coletado")}
  </div></div>`;
  h+=`<div class="card"><h3>Valor</h3><div class="grid g2">
    ${kpi("BSV",fmtN(bsvPDV(p),1)+"%",PARAMS.meta_bsv+"%",p.bsv>=PARAMS.meta_bsv,"receita Ambev ÷ receita total a preço de balcão","coletado")}
    ${kpi("R$/HL do PDV",fmtN(p.receita_total_mes/p.hl_total_mes,0),"—",null,"receita total ÷ HL total — proxy de valorização do ponto","coletado")}
  </div></div>`;
  h+=`<div class="card"><h3>Execução</h3><div class="grid g2">
    ${kpi("Share geladeira",fmtN(p.share_geladeira,0)+"%",PARAMS.meta_share_geladeira+"%",p.share_geladeira>=PARAMS.meta_share_geladeira,p.share_geladeira<ambevShare(p)-3?"abaixo do share — negociar espaço":"proporcional ao share","coletado")}
    ${kpi("Ruptura mensal",fmtN(p.ruptura_mensal_pct,1)+"%","≤"+PARAMS.meta_ruptura_max+"%",p.ruptura_mensal_pct<=PARAMS.meta_ruptura_max,p.ruptura_mensal_pct>PARAMS.meta_ruptura_max?"venda perdida por falta de produto":"serviço ok","coletado")}
    ${kpi("Ponto extra",p.ponto_extra?"Sim":"Não","ter",p.ponto_extra,p.ponto_extra?"exposição ativa":"oportunidade de exposição","coletado")}
    ${kpi("Índice de execução",v.exec+"%",PARAMS.meta_execucao_pontos+"%",v.exec>=PARAMS.meta_execucao_pontos,"5 itens: ponto extra, gelada, gôndola, geladeira, ruptura","calculado")}
  </div></div>`;
  h+=`<div class="card"><h3>Marca</h3><div class="grid g2">
    ${kpi("Share Ambev",fmtN(ambevShare(p),1)+"%",PARAMS.meta_share_ambev+"%",ambevShare(p)>=PARAMS.meta_share_ambev,"volume Ambev ÷ volume cerveja do PDV","coletado")}
    ${kpi("Demanda espontânea",p.demanda_espontanea+"/5","≥3",p.demanda_espontanea>=3,"pedida sem oferta — proxy de brand equity","coletado")}
  </div></div>`;
  h+=`<div class="card"><h3>Tendência <span class="badge estimativa">a calibrar com BI</span></h3><div class="grid g2">
    ${kpi("Δ share Ambev m/m",(tendencia(p).delta>=0?"+":"")+fmtN(tendencia(p).delta,1)+" p.p.","positivo",tendencia(p).delta>=0,"série mensal com índice de sazonalidade do tipo "+esc(p.tipo),"calculado")}
    ${kpi("Potencial",potencialTexto(p),"—",null,p.origem_potencial==="coletado"?"medido na anamnese":"faixa — input estimado, nunca número exato",p.origem_potencial)}
  </div></div>`;
  return h;
}
function secEstrategia(p){
  const v=veredito(p), ma=v.ma;
  const precos=BASE.marcas.filter(m=>m[5]==="cerveja").map(m=>{
    const nome=m[0], pr=p.preco[nome]||m[2];
    return {nome, pr, papel:m[3], tier:TIER_NOME[m[1]], dono:m[5]};
  }).sort((a,b)=>a.pr-b.pr);
  const maxPr=Math.max(...precos.map(x=>x.pr));
  let h=`<div class="card"><h3>Escada de preço (balcão) <span class="hint">R$/un — onde a marca-alvo entra</span></h3><div class="escada">`;
  precos.forEach(x=>{ const alvo=x.nome===ma.alvo.m;
    h+=`<div class="degrau${alvo?" foco":""}"><div class="nm">${esc(x.nome)}${x.dono==="ambev"?" <span class='badge coletado'>ambev</span>":""}</div>
    <div class="r" style="width:${(x.pr/maxPr*100).toFixed(0)}%">R$ ${fmtN(x.pr,2)}</div>
    <span class="tiny">${esc(x.tier)} · ${esc(x.papel)}</span></div>`; });
  h+=`</div><div class="escada-leg">A escada mostra onde cada marca se posiciona — a marca-alvo (${esc(ma.alvo.m)}) entra no degrau coerente com o PDV. Preços editáveis na Anamnese.</div></div>`;
  h+=`<div class="card"><h3>Cardápio — papel de cada marca</h3><table>
    <tr><th>Marca</th><th>Tier</th><th>Preço</th><th>HL/mês</th><th>Share</th><th>Papel aqui</th></tr>
    ${CERVEJAS.map(m=>{ const hl=hlMarca(p,m), pr=p.preco[m]||PORT[m].preco;
      const papel=ma.papeis.find(x=>x.m===m);
      return "<tr"+(m===ma.alvo.m?" style='background:var(--red-dim)'":"")+"><td>"+esc(m)+"</td><td>"+esc(TIER_NOME[PORT[m].tier])+"</td><td>R$ "+fmtN(pr,2)+"</td><td>"+fmtN(hl,1)+"</td><td>"+fmtN(shareMarca(p,m),1)+"%</td><td class='small'>"+esc(papel?papel.papel:"—")+"</td></tr>"; }).join("")}
  </table><div class="tiny" style="margin-top:6px">Papel por marca: defender (top Ambev), ponte de preço (tier adjacente), puxar valor (premium em PDV que suporta), manter. Marca-alvo destacada.</div></div>`;
  h+=`<div class="card"><h3>Plano de conquista de share — 3 frentes</h3>
    ${v.motivos.slice(0,3).map((m,i)=>`<div class="acao-dia" style="margin:6px 0"><div class="t">Frente ${i+1}</div><div class="a small">${esc(m)}</div></div>`).join("")}
    ${!v.motivos.length?'<div class="small muted">Sem gap relevante — frentes de defesa: manter geladeira, cold door e frequência de pedido.</div>':""}</div>`;
  h+=`<div class="card"><h3>Nível de serviço</h3><div class="grid g2 small">
    <div>${semaforoInv(p.ruptura_mensal_pct,5,12)} Ruptura: <b>${fmtN(p.ruptura_mensal_pct,1)}%</b></div>
    <div>Prazo: <b>${esc(p.pagto)}</b></div>
    <div>Limite crédito: <b>${fmtBRL(p.limite_credito)}</b></div>
    <div>Inadimplência: <b>${fmtN(p.inadimplencia,1)}%</b></div>
    <div>Frequência: <b>${esc(p.freq_visita)}</b></div>
    <div>${p.cold_door?"✅":"❌"} Cold door</div></div>
    <div class="small" style="margin-top:8px">${p.ruptura_mensal_pct>PARAMS.meta_ruptura_max?"⚠️ Serviço abaixo da meta — ruptura mata share conquistado.":"✅ Serviço dentro da meta."}</div></div>`;
  const d=disputaEspaco(p);
  h+=`<div class="card"><h3>Disputa de espaço por categoria</h3>
    ${d.cats.map(c=>`<div class="degrau"><div class="nm">${esc(c.c)}</div><div class="bar" style="flex:1"><div style="width:${c.fr.toFixed(0)}%"></div></div><div class="tiny">${c.fr.toFixed(0)}%</div></div>`).join("")}
    <div class="small" style="margin-top:8px">${esc(d.leitura)}</div></div>`;
  return h;
}
function secPlano(p){
  const v=veredito(p), a=acaoDoDia(p);
  const semanas=[
    {s:"Semana 1", f:"Diagnóstico na prática: validar anamnese, medir geladeira e ruptura com o dono.", kpi:"anamnese 100% + fotos"},
    {s:"Semana 2", f:a.titulo+" — executar a ação do dia com o decisor.", kpi:"compromisso assinado"},
    {s:"Semana 3", f:"Execução: ponto extra/cold door/espaço na geladeira conforme gap.", kpi:"execução ≥"+PARAMS.meta_execucao_pontos+"%"},
    {s:"Semana 4", f:"Medição: pedido médio, ruptura e share Ambev vs linha de base.", kpi:"share +"+Math.max(1,(v.gap.gapPct||2)).toFixed(0)+" p.p."}
  ];
  let h=`<div class="card"><h3>Plano 4 semanas</h3>`;
  semanas.forEach(w=>h+=`<div class="acao-dia" style="margin:6px 0"><div class="t">${w.s} · alvo: ${esc(w.kpi)}</div><div class="a small">${esc(w.f)}</div></div>`);
  h+=`</div>`;
  const icbm=Math.round(Math.min(100, v.exec*0.5+(v.gap.gapPct!=null?Math.min(50,Math.max(0,v.gap.gapPct*5)):10)+p.demanda_espontanea*4));
  h+=`<div class="card"><h3>Piloto com índice de construção de marca</h3>
    <div class="grid g2"><div class="kpi"><div class="v">${icbm}/100</div><div class="l">ICBM do PDV</div>
    <div class="m">50% execução + gap vs fair share + demanda espontânea</div></div>
    <div class="kpi"><div class="v">${v.decisao.startsWith("TRABALHAR")?"Sim":"Não"}</div><div class="l">Candidato a piloto</div>
    <div class="m">critério: veredito do motor</div></div></div>
    <div class="tiny" style="margin-top:8px">ICBM é índice relativo (0–100) para priorizar pilotos — não é previsão de resultado.</div></div>`;
  return h;
}

/* TAB 3 · TERRITÓRIO */
function renderTerritorio(){
  const f=ESTADO.filtrosTerr||{tipo:"",classe:""};
  let pds=BASE.pdvs;
  if(f.tipo) pds=pds.filter(p=>p.tipo===f.tipo);
  if(f.classe) pds=pds.filter(p=>p.classe===f.classe);
  const hlTotal=pds.reduce((a,p)=>a+hlTotalMes(p),0);
  const hlAm=pds.reduce((a,p)=>a+ambevHL(p),0);
  const recTotal=pds.reduce((a,p)=>a+recTotalMes(p),0);
  const recAm=pds.reduce((a,p)=>a+ambevRec(p),0);
  const shareTerr=pct(hlAm,hlTotal), bsvTerr=pct(recAm,recTotal);
  const execMedia=pds.reduce((a,p)=>a+execucaoScore(p),0)/(pds.length||1);
  const anamOk=pds.filter(p=>p.anamnese==="completa").length;
  let h=`<div class="card"><h3>Indicadores do território <span class="hint">${pds.length} PDVs</span></h3>
    <div class="grid g4">
      <div class="kpi"><div class="v">${fmtN(hlTotal,0)}</div><div class="l">HL/mês território</div><div class="m">soma dos PDVs</div></div>
      <div class="kpi"><div class="v">${fmtN(shareTerr,1)}%</div><div class="l">Share Ambev</div><div class="m">meta ${PARAMS.meta_share_ambev}%</div></div>
      <div class="kpi"><div class="v">${fmtN(bsvTerr,1)}%</div><div class="l">BSV</div><div class="m">meta ${PARAMS.meta_bsv}%</div></div>
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
  const rows=pds.map(p=>{ const v=veredito(p); return {p,v,gap:v.gap.hl||0,pot:p.pot_med}; })
    .sort((a,b)=>b.gap*b.pot-a.gap*a.pot);
  h+=`<div class="card"><h3>Matriz de priorização <span class="hint">gap da marca-alvo × potencial — topo = prioridade</span></h3>
    <table><tr><th>#</th><th>PDV</th><th>Segmento</th><th>Potencial</th><th>Marca-alvo</th><th>Share Ambev</th><th>Gap HL</th><th>Exec</th></tr>
    ${rows.slice(0,12).map((r,i)=>"<tr><td>"+(i+1)+"</td><td><a onclick=\"abrirPDV('"+r.p.id+"')\" style='cursor:pointer'>"+esc(r.p.nome)+"</a>"+
      (r.p.demo?' <span class="chip '+(r.p.demo==="premium"?"info":"ok")+'">demo</span>':"")+"</td><td>"+esc(r.p.tipo)+" "+esc(r.p.classe)+
      "</td><td>"+esc(potencialTexto(r.p))+"</td><td><b>"+esc(r.v.ma.alvo.m)+"</b></td><td>"+fmtN(ambevShare(r.p),1)+"%</td>"+
      "<td class='t-right' style='color:"+(r.gap>0?"var(--red2)":"var(--ok)")+"'>"+fmtN(r.gap,1)+"</td><td>"+r.v.exec+"%</td></tr>").join("")}
  </table><div class="tiny" style="margin-top:6px">Fair share do tier por mediana (mín. ${PARAMS.fair_share_min_amostra} pares, fallback tipo+classe → tipo → classe → território).</div></div>`;
  h+=`<div class="card"><h3>Ranking de oportunidades <span class="hint">gap em caixas/mês</span></h3>
    <table><tr><th>PDV</th><th>Marca-alvo</th><th>Gap HL/mês</th><th>≈ Caixas/mês</th><th>Ação do motor</th></tr>
    ${rows.filter(r=>r.gap>0.3).slice(0,8).map(r=>{ const a=acaoDoDia(r.p);
      return "<tr><td>"+esc(r.p.nome)+"</td><td><b>"+esc(r.v.ma.alvo.m)+"</b></td><td>"+fmtN(r.gap,1)+"</td><td>"+fmtN(r.gap/hlPorCaixa("lata_350"),0)+
      "</td><td class='small'>"+esc(a.titulo)+"</td></tr>"; }).join("")}
    </table></div>`;
  const hlM={},recM={};
  pds.forEach(p=>CERVEJAS.forEach(m=>{ hlM[m]=(hlM[m]||0)+hlMarca(p,m); recM[m]=(recM[m]||0)+recMarca(p,m); }));
  const hlC=CERVEJAS.reduce((a,m)=>a+hlM[m],0), recC=CERVEJAS.reduce((a,m)=>a+recM[m],0);
  h+=`<div class="card"><h3>Visão de marca (mês atual)</h3><table>
    <tr><th>Marca</th><th>HL</th><th>Share vol.</th><th>Receita</th><th>Share valor</th><th>Tier</th></tr>
    ${CERVEJAS.map(m=>"<tr"+(PORT[m].dono==="ambev"?"":" style='opacity:.75'")+"><td>"+esc(m)+(PORT[m].dono==="ambev"?" <span class='badge coletado'>ambev</span>":"")+"</td><td>"+fmtN(hlM[m],1)+"</td><td>"+fmtN(pct(hlM[m],hlC),1)+"%</td><td>"+
      fmtBRL(recM[m])+"</td><td>"+fmtN(pct(recM[m],recC),1)+"%</td><td>"+esc(TIER_NOME[PORT[m].tier])+"</td></tr>").join("")}
  </table><div class="tiny" style="margin-top:6px">Share volume e share valor lado a lado — valor a preço de balcão.</div></div>`;
  const pilotos=rows.filter(r=>r.v.decisao.startsWith("TRABALHAR")).slice(0,5);
  h+=`<div class="card"><h3>Pilotos sugeridos <span class="hint">top 5 pelo motor</span></h3>
    ${pilotos.length?"<table><tr><th>PDV</th><th>Marca-alvo</th><th>ICBM</th><th>Gap HL</th><th>Confiança</th></tr>"+
      pilotos.map(r=>{ const icbm=Math.round(Math.min(100,r.v.exec*0.5+Math.min(50,Math.max(0,(r.v.gap.gapPct||0)*5))+r.p.demanda_espontanea*4));
        return "<tr><td>"+esc(r.p.nome)+"</td><td>"+esc(r.v.ma.alvo.m)+"</td><td>"+icbm+"/100</td><td>"+fmtN(r.gap,1)+"</td><td>"+scoreConfianca(r.p)+"%</td></tr>"; }).join("")+"</table>"
      :'<div class="empty"><div class="ic">—</div>Sem candidatos no recorte atual.</div>'}</div>`;
  h+=`<div class="card"><h3>Saúde da execução</h3><div class="grid g4">
    <div class="kpi"><div class="v">${fmtN(pds.reduce((a,p)=>a+p.ruptura_mensal_pct,0)/(pds.length||1),1)}%</div><div class="l">Ruptura média</div><div class="m">meta ≤${PARAMS.meta_ruptura_max}%</div></div>
    <div class="kpi"><div class="v">${pds.filter(p=>p.ponto_extra).length}</div><div class="l">Com ponto extra</div></div>
    <div class="kpi"><div class="v">${pds.filter(p=>p.cold_door).length}</div><div class="l">Com cold door</div></div>
    <div class="kpi"><div class="v">${anamOk}/${pds.length}</div><div class="l">Anamnese completa</div></div>
  </div></div>`;
  h+=secAlertas();
  return h;
}