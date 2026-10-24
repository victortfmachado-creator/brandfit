/* TAB 4 · VISÕES + TAB 5 · CONFIG + navegação + v1.3 (CMO/alertas/feed) */
function renderVisoes(){
  const sub=ESTADO.subVisoes||"executivo";
  let h=`<div class="subtabs">
    ${[["executivo","💼 Executivo"],["trade","🚚 Trade"],["marketing","📣 Marketing"],["equipe","👥 Gestão de equipe"]]
      .map(x=>'<button class="subtab'+(sub===x[0]?" active":"")+"\" onclick=\"ESTADO.subVisoes='"+x[0]+"';salvarEstado();go('visoes')\">"+x[1]+'</button>').join("")}
  </div>`;
  if(sub==="executivo") h+=visExecutivo();
  if(sub==="trade") h+=visTrade();
  if(sub==="marketing") h+=visMarketing();
  if(sub==="equipe") h+=visEquipe();
  return h;
}
function visExecutivo(){
  const pds=BASE.pdvs;
  const hlTotal=pds.reduce((a,p)=>a+hlTotalMes(p),0), hlAm=pds.reduce((a,p)=>a+ambevHL(p),0);
  const recTotal=pds.reduce((a,p)=>a+recTotalMes(p),0), recAm=pds.reduce((a,p)=>a+ambevRec(p),0);
  const margem=PARAMS.margem_contribuicao;
  const contribAm=recAm*margem;
  const pilotos=pds.filter(p=>veredito(p).decisao.startsWith("TRABALHAR")).slice(0,10);
  const gapTotal=pilotos.reduce((a,p)=>a+(veredito(p).gap.hl||0),0);
  const caixasGap=gapTotal/hlPorCaixa("lata_350");
  const precoRef=pds[0].preco["Brahma"]||5.49;
  const recGap=caixasGap*24*precoRef;
  const invPiloto=pilotos.length*PARAMS.investimento_piloto_pdv;
  const roi=invPiloto? (recGap*margem-invPiloto)/invPiloto*100 : 0;
  const tipos={}; pds.forEach(p=>{ (tipos[p.tipo]=tipos[p.tipo]||[]).push(p); });
  let h=`<div class="card"><h3>P&L do território (mês atual, dados fictícios)</h3>
    <div class="grid g4">
      <div class="kpi"><div class="v">${fmtN(hlTotal,0)}</div><div class="l">HL/mês</div></div>
      <div class="kpi"><div class="v">${fmtBRL(recTotal)}</div><div class="l">Receita balcão</div></div>
      <div class="kpi"><div class="v">${fmtN(pct(hlAm,hlTotal),1)}%</div><div class="l">Share Ambev (vol.)</div></div>
      <div class="kpi"><div class="v">${fmtN(pct(recAm,recTotal),1)}%</div><div class="l">BSV</div></div>
    </div>
    <div class="tiny" style="margin-top:8px">Receita a preço de balcão. Contribuição estimada: ${fmtBRL(contribAm)} (margem ${(margem*100).toFixed(0)}% — parâmetro do caso de negócio, badge ${badgeOrigem("estimado")}).</div></div>`;
  h+=`<div class="card"><h3>ROI dos pilotos <span class="badge estimativa">estimativa — não é fato</span></h3>
    <table><tr><th>Parâmetro</th><th>Valor</th><th>Origem</th></tr>
    <tr><td>PDVs no piloto</td><td>${pilotos.length}</td><td>${badgeOrigem("calculado")}</td></tr>
    <tr><td>Gap total (marca-alvo)</td><td>${fmtN(gapTotal,1)} HL/mês (≈${fmtN(caixasGap,0)} caixas)</td><td>${badgeOrigem("calculado")}</td></tr>
    <tr><td>Investimento estimado</td><td>${fmtBRL(invPiloto)} (${fmtBRL(PARAMS.investimento_piloto_pdv)}/PDV)</td><td>${badgeOrigem("estimado")}</td></tr>
    <tr><td>Receita adicional potencial</td><td>${fmtBRL(recGap)}/mês</td><td>${badgeOrigem("estimado")}</td></tr>
    <tr><td><b>ROI estimado</b></td><td><b>${fmtN(roi,0)}%</b></td><td>${badgeOrigem("estimado")}</td></tr>
    </table><div class="tiny" style="margin-top:6px">ROI = (receita adicional × margem − investimento) ÷ investimento. Valida no piloto real de 90 dias.</div></div>`;
  h+=`<div class="card"><h3>Comparativo entre recortes <span class="hint">por tipo de PDV</span></h3>
    <table><tr><th>Recorte</th><th>PDVs</th><th>HL/mês</th><th>Share Ambev</th><th>BSV</th><th>Execução</th></tr>
    ${Object.keys(tipos).map(t=>{ const g=tipos[t]; const hl=g.reduce((a,p)=>a+p.hl_total_mes,0), ha=g.reduce((a,p)=>a+ambevHL(p),0);
      const rec=g.reduce((a,p)=>a+p.receita_total_mes,0), ra=g.reduce((a,p)=>a+ambevRec(p),0);
      const ex=g.reduce((a,p)=>a+execucaoScore(p),0)/g.length;
      return "<tr><td>"+esc(t)+"</td><td>"+g.length+"</td><td>"+fmtN(hl,0)+"</td><td>"+fmtN(pct(ha,hl),1)+"%</td><td>"+
        fmtN(pct(ra,rec),1)+"%</td><td>"+fmtN(ex,0)+"%</td></tr>"; }).join("")}
    </table></div>`;
  h+=`<div class="card"><h3>Caso de negócio</h3><div class="veredito">
    Fechar o gap até o fair share do tier nos ${pilotos.length} PDVs prioritários vale <b>${fmtN(caixasGap,0)} caixas/mês</b>
    (≈${fmtN(gapTotal,1)} HL) e <b>${fmtBRL(recGap)}</b> de receita balcão/mês — sem abrir um PDV novo.
    O investimento para isso, no piloto, é de ${fmtBRL(invPiloto)}.</div>
    <button class="btn block" style="margin-top:10px" onclick="copiarRelatorioPagina()">📄 Relatório de uma página (copiável)</button></div>`;
  return h;
}
function copiarRelatorioPagina(){
  const pds=BASE.pdvs;
  const hlTotal=pds.reduce((a,p)=>a+hlTotalMes(p),0), hlAm=pds.reduce((a,p)=>a+ambevHL(p),0);
  const recTotal=pds.reduce((a,p)=>a+recTotalMes(p),0), recAm=pds.reduce((a,p)=>a+ambevRec(p),0);
  const pilotos=pds.filter(p=>veredito(p).decisao.startsWith("TRABALHAR")).slice(0,10);
  const gapTotal=pilotos.reduce((a,p)=>a+(veredito(p).gap.hl||0),0);
  const caixasGap=gapTotal/hlPorCaixa("lata_350");
  const txt=["BRANDFIT — RELATÓRIO EXECUTIVO (dados fictícios)","",
    "Território: "+pds.length+" PDVs · "+fmtN(hlTotal,0)+" HL/mês",
    "Share Ambev: "+fmtN(pct(hlAm,hlTotal),1)+"% (meta "+PARAMS.meta_share_ambev+"%)",
    "BSV: "+fmtN(pct(recAm,recTotal),1)+"% (meta "+PARAMS.meta_bsv+"%)",
    "Anamnese completa: "+pds.filter(p=>p.anamnese==="completa").length+"/"+pds.length,"",
    "OPORTUNIDADE: fechar gap até fair share do tier nos top "+pilotos.length+" PDVs = "+fmtN(caixasGap,0)+" caixas/mês",
    "PDVs prioritários (marca-alvo):",
    ...pilotos.map(p=>{ const v=veredito(p); return "• "+p.nome+" — "+v.ma.alvo.m+" — gap "+fmtN(v.gap.hl,1)+" HL/mês"; }),
    "","Fonte: base de campo ativa; fair share do tier por mediana; parâmetros no painel."].join("\n");
  const done=ok=>toast(ok?"Relatório copiado":"Copie manualmente abaixo",ok?"":"warn");
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>done(true),()=>done(false)); else done(false);
  abrirModal('<h3>Relatório de uma página</h3><textarea class="copyarea" rows="14" onclick="this.select()">'+esc(txt)+'</textarea><br><button class="btn block" onclick="fecharModal()">Fechar</button>');
}
function visTrade(){
  const pds=BASE.pdvs;
  const ativ=[
    {nome:"Balde Spaten — Bar do Zé", antes:22.5, depois:29.1, mes:"2026-09"},
    {nome:"Ponto extra Brahma — Churrascaria Fogo Alto", antes:18.0, depois:24.3, mes:"2026-09"},
    {nome:"Kit gelada — Casa Noturna Neon", antes:12.2, depois:19.8, mes:"2026-08"}
  ];
  let h=`<div class="card"><h3>Calendário de ativação <span class="badge mock">lift de exemplo — substituir por medição real</span></h3>
    <table><tr><th>Ativação</th><th>Mês</th><th>Share antes</th><th>Share depois</th><th>Lift</th></tr>
    ${ativ.map(a=>"<tr><td>"+esc(a.nome)+"</td><td>"+a.mes+"</td><td>"+fmtN(a.antes,1)+"%</td><td>"+fmtN(a.depois,1)+"%</td><td style='color:var(--ok)'>+"+fmtN(a.depois-a.antes,1)+" p.p.</td></tr>").join("")}
    </table><div class="tiny" style="margin-top:6px">Lift = share depois − share antes, medido na base. Registros acima são exemplo até a primeira ativação real.</div></div>`;
  h+=`<div class="card"><h3>Pipeline de material <span class="hint">status por PDV</span></h3>
    <div class="grid g4">
      <div class="kpi"><div class="v">${pds.filter(p=>!p.ponto_extra).length}</div><div class="l">Sem ponto extra</div><div class="m">pipeline: propor</div></div>
      <div class="kpi"><div class="v">${pds.filter(p=>!p.cold_door).length}</div><div class="l">Sem cold door</div><div class="m">pipeline: negociar</div></div>
      <div class="kpi"><div class="v">${pds.filter(p=>p.ponto_extra&&p.cold_door).length}</div><div class="l">Execução completa</div></div>
      <div class="kpi"><div class="v">${pds.filter(p=>p.frente_gondola).length}</div><div class="l">Com frente de gôndola</div></div>
    </div></div>`;
  const rows=pds.map(p=>({p,v:veredito(p),gap:veredito(p).gap.hl||0})).filter(r=>r.gap>0.3).sort((a,b)=>b.gap-a.gap);
  h+=`<div class="card"><h3>Plano agregado de conquista <span class="hint">por marca-alvo</span></h3>
    <table><tr><th>PDV</th><th>Marca-alvo</th><th>Gap HL/mês</th><th>Caixas/mês</th><th>Ação</th></tr>
    ${rows.slice(0,10).map(r=>{ const a=acaoDoDia(r.p);
      return "<tr><td>"+esc(r.p.nome)+"</td><td><b>"+esc(r.v.ma.alvo.m)+"</b></td><td>"+fmtN(r.gap,1)+"</td><td>"+fmtN(r.gap/hlPorCaixa("lata_350"),0)+"</td><td class='small'>"+esc(a.titulo)+"</td></tr>"; }).join("")}
    </table>
    <div class="small" style="margin-top:8px">Total top 10: <b>${fmtN(rows.slice(0,10).reduce((a,r)=>a+r.gap,0),1)} HL/mês</b> (≈${fmtN(rows.slice(0,10).reduce((a,r)=>a+r.gap,0)/hlPorCaixa("lata_350"),0)} caixas).</div></div>`;
  const tipos={}; pds.forEach(p=>{ (tipos[p.tipo]=tipos[p.tipo]||[]).push(p); });
  h+=`<div class="card"><h3>Índice de execução por segmento</h3><table>
    <tr><th>Segmento</th><th>PDVs</th><th>Execução média</th><th>Ruptura média</th></tr>
    ${Object.keys(tipos).map(t=>{ const g=tipos[t];
      const ex=g.reduce((a,p)=>a+execucaoScore(p),0)/g.length, ru=g.reduce((a,p)=>a+p.ruptura_mensal_pct,0)/g.length;
      return "<tr><td>"+esc(t)+"</td><td>"+g.length+"</td><td>"+semaforo(ex,PARAMS.meta_execucao_pontos,50)+fmtN(ex,0)+"%</td><td>"+semaforoInv(ru,5,12)+fmtN(ru,1)+"%</td></tr>"; }).join("")}
    </table></div>`;
  return h;
}
function visMarketing(){
  const pds=BASE.pdvs;
  const hlM={},recM={};
  pds.forEach(p=>CERVEJAS.forEach(m=>{ hlM[m]=(hlM[m]||0)+hlMarca(p,m); recM[m]=(recM[m]||0)+recMarca(p,m); }));
  const hlC=CERVEJAS.reduce((a,m)=>a+hlM[m],0), recC=CERVEJAS.reduce((a,m)=>a+recM[m],0);
  let h=`<div class="card"><h3>Saúde de marca por semáforo <span class="hint">share vol. × share valor</span></h3>
    <table><tr><th>Marca</th><th>Tier</th><th>Share vol.</th><th>Share valor</th><th>Semáforo</th><th>Leitura</th></tr>`;
  CERVEJAS.forEach(m=>{
    const sv=pct(hlM[m],hlC), sr=pct(recM[m],recC);
    const dono=PORT[m].dono, papel=PORT[m].papel;
    let cor, leitura;
    if(dono==="concorrente"){ cor=sv>15?"r":"y"; leitura=sv>15?"pressão forte — monitorar preço":"pressão moderada"; }
    else if(papel==="volume"){ cor=sv>=18?"g":sv>=12?"y":"r"; leitura=sv>=18?"meta de volume ok":"abaixo da meta — plano ativo"; }
    else { cor=sv>=8?"g":sv>=4?"y":"r"; leitura="papel de "+papel+" — presença seletiva"; }
    h+="<tr><td>"+esc(m)+"</td><td>"+esc(TIER_NOME[PORT[m].tier])+"</td><td>"+fmtN(sv,1)+"%</td><td>"+fmtN(sr,1)+"%</td><td><span class='semaforo "+cor+"'></span></td><td class='small'>"+esc(leitura)+"</td></tr>";
  });
  h+=`</table><div class="tiny" style="margin-top:6px">Semáforo: verde = meta, amarelo = perto, vermelho = abaixo (concorrente: vermelho = pressão alta).</div></div>`;
  h+=`<div class="card"><h3>Pressão do concorrente</h3><div class="grid g2">`;
  CONCORRENTES.forEach(c=>{
    const sv=pct(hlM[c],hlC);
    const dominantes=pds.filter(p=>shareMarca(p,c)>30);
    h+=`<div class="kpi"><div class="v">${fmtN(sv,1)}%</div><div class="l">${esc(c)} — share território</div>
      <div class="m">dominante em ${dominantes.length} PDVs${dominantes.length?" ("+esc(dominantes.slice(0,2).map(x=>x.nome).join(", "))+")":""}</div></div>`;
  });
  h+=`</div></div>`;
  h+=`<div class="card"><h3>Prioridade de portfólio do trimestre</h3>
    <table><tr><th>Marca</th><th>Papel</th><th>Ação do trimestre</th></tr>
    ${AMBEV.map(m=>{ const papel=PORT[m].papel;
      const acao=papel==="volume"?"Crescer share: plano por PDV com marca-alvo do motor"
        :papel==="defesa"?"Sustentar distribuição e ruptura baixa"
        :"Puxar valor: presença onde o público pede (premium/super premium)";
      return "<tr><td>"+esc(m)+"</td><td>"+esc(papel)+"</td><td class='small'>"+esc(acao)+"</td></tr>"; }).join("")}
    </table></div>`;
  h+=secCMO();
  return h;
}
function visEquipe(){
  const pds=BASE.pdvs;
  const reps={}; pds.forEach(p=>{ (reps[p.visitador]=reps[p.visitador]||[]).push(p); });
  let h=`<div class="card"><h3>KPIs por representante</h3><table>
    <tr><th>Rep</th><th>PDVs</th><th>HL/mês carteira</th><th>Share Ambev</th><th>Execução</th><th>Anamnese ok</th></tr>
    ${Object.keys(reps).map(r=>{ const g=reps[r];
      const hl=g.reduce((a,p)=>a+p.hl_total_mes,0), ha=g.reduce((a,p)=>a+ambevHL(p),0);
      const ex=g.reduce((a,p)=>a+execucaoScore(p),0)/g.length;
      const ok=g.filter(p=>p.anamnese==="completa").length;
      return "<tr><td>"+esc(r)+"</td><td>"+g.length+"</td><td>"+fmtN(hl,0)+"</td><td>"+fmtN(pct(ha,hl),1)+"%</td><td>"+semaforo(ex,70,50)+fmtN(ex,0)+"%</td><td>"+ok+"/"+g.length+"</td></tr>"; }).join("")}
    </table></div>`;
  h+=`<div class="card"><h3>Cobertura de rota <span class="hint">frequência × dias sem comprar</span></h3>
    <table><tr><th>PDV</th><th>Rep</th><th>Frequência</th><th>Dias sem comprar</th><th>Alerta</th></tr>
    ${[...pds].sort((a,b)=>b.dias_sem_comprar-a.dias_sem_comprar).slice(0,8).map(p=>"<tr><td>"+esc(p.nome)+"</td><td>"+esc(p.visitador)+
      "</td><td>"+esc(p.freq_visita)+"</td><td>"+p.dias_sem_comprar+"</td><td>"+(p.dias_sem_comprar>21?"<span class='semaforo r'></span>risco":p.dias_sem_comprar>14?"<span class='semaforo y'></span>atenção":"<span class='semaforo g'></span>ok")+"</td></tr>").join("")}
    </table></div>`;
  const pilotos=pds.filter(p=>veredito(p).decisao.startsWith("TRABALHAR")).slice(0,10);
  h+=`<div class="card"><h3>Progresso dos pilotos</h3>
    ${pilotos.map(p=>{ const st=ESTADO.visitas[p.id]||"pendente";
      return "<div class='degrau' style='margin:6px 0'><div class='nm'>"+esc(p.nome)+"</div><div class='bar' style='flex:1'><div style='width:"+(st==="concluido"?100:st==="em_visita"?50:10)+"%'></div></div><span class='tiny'>"+st+"</span></div>"; }).join("")}
    </div>`;
  h+=`<div class="card"><h3>Resumo semanal <span class="hint">copiável</span></h3>
    <button class="btn block" onclick="copiarResumoSemanal()">📋 Copiar resumo semanal</button></div>`;
  h+=secFrescor();
  return h;
}
function copiarResumoSemanal(){
  const pds=BASE.pdvs, reps={};
  pds.forEach(p=>{ (reps[p.visitador]=reps[p.visitador]||[]).push(p); });
  const linhas=["RESUMO SEMANAL — TERRITÓRIOS (dados fictícios)",""];
  Object.keys(reps).forEach(r=>{ const g=reps[r];
    linhas.push(r+": "+g.length+" PDVs · share Ambev "+fmtN(pct(g.reduce((a,p)=>a+ambevHL(p),0),g.reduce((a,p)=>a+p.hl_total_mes,0)),1)+"% · execução "+
      fmtN(g.reduce((a,p)=>a+execucaoScore(p),0)/g.length,0)+"% · anamnese ok "+g.filter(p=>p.anamnese==="completa").length+"/"+g.length); });
  linhas.push("", "Pendências: "+pds.filter(p=>p.anamnese!=="completa").length+" PDVs com anamnese incompleta (fila de coleta).");
  const txt=linhas.join("\n");
  const done=ok=>toast(ok?"Resumo copiado":"Copie manualmente abaixo",ok?"":"warn");
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>done(true),()=>done(false)); else done(false);
  abrirModal('<h3>Resumo semanal</h3><textarea class="copyarea" rows="10" onclick="this.select()">'+esc(txt)+'</textarea><br><button class="btn block" onclick="fecharModal()">Fechar</button>');
}
function renderConfig(){
  let h=`<div class="card"><h3>Painel de parâmetros <span class="hint">fonte e data em cada um — nada entra no motor sem isso</span></h3>
    <table><tr><th>Parâmetro</th><th>Valor</th><th>Fonte</th><th>Data</th><th>Status</th></tr>`;
  Object.keys(PARAMS_FONTE).forEach(k=>{
    const f=PARAMS_FONTE[k]; let val;
    if(k==="fatores_caixa") val=Object.keys(PARAMS.fatores_caixa).map(x=>x+": "+PARAMS.fatores_caixa[x]).join(", ");
    else if(k==="ml_por_unidade") val=Object.keys(PARAMS.ml_por_unidade).map(x=>x+": "+PARAMS.ml_por_unidade[x]).join(", ");
    else if(k==="preco_faixa_plausivel") val="R$ "+PARAMS.preco_faixa_plausivel.min+"–"+PARAMS.preco_faixa_plausivel.max;
    else if(k==="sazonalidade") val="índice mensal por tipo (6 meses)";
    else val=PARAMS[k];
    h+="<tr><td class='small'>"+esc(k)+"</td><td class='small'>"+esc(String(val))+"</td><td class='small'>"+esc(f.fonte)+
      "</td><td class='small'>"+f.data+"</td><td>"+(f.validado?'<span class="badge coletado">validado</span>':'<span class="badge estimativa">estimativa</span>')+"</td></tr>";
  });
  h+=`</table><div class="tiny" style="margin-top:6px">Parâmetro não validado aparece como <b>estimativa</b> e nunca como fato. Editáveis abaixo.</div>
    <details style="margin-top:10px"><summary class="btn" style="list-style:none">✏️ Editar parâmetros</summary>
    <div style="margin-top:10px">
      ${["meta_share_ambev","meta_bsv","meta_ruptura_max","meta_share_geladeira","meta_execucao_pontos","fair_share_min_amostra","preco_garrafa600_mult","margem_contribuicao","investimento_piloto_pdv"]
        .map(k=>'<label>'+k+'</label><input type="number" step="0.01" value="'+PARAMS[k]+'" onchange="paramSave(\''+k+'\',this.value)">').join("")}
      <label>fator lata_350 (un/caixa)</label><input type="number" value="${PARAMS.fatores_caixa.lata_350}" onchange="paramFator('lata_350',this.value)">
      <label>fator garrafa_600 (un/caixa)</label><input type="number" value="${PARAMS.fatores_caixa.garrafa_600}" onchange="paramFator('garrafa_600',this.value)">
      <label>fator long_neck_330 (un/caixa)</label><input type="number" value="${PARAMS.fatores_caixa.long_neck_330}" onchange="paramFator('long_neck_330',this.value)">
      <label>fator retornavel_600 (un/caixa)</label><input type="number" value="${PARAMS.fatores_caixa.retornavel_600}" onchange="paramFator('retornavel_600',this.value)">
    </div></details></div>`;
  h+=`<div class="card"><h3>Catálogo de marcas <span class="hint">caderno de regras v1.2 — editável</span></h3>
    <table><tr><th>Marca</th><th>Dono</th><th>Tier</th><th>Preço ref.</th><th>Papel</th></tr>
    ${CERVEJAS.map(m=>"<tr><td>"+esc(m)+"</td><td>"+esc(PORT[m].dono)+"</td><td>"+esc(TIER_NOME[PORT[m].tier])+"</td><td>R$ "+fmtN(PORT[m].preco,2)+"</td><td>"+esc(PORT[m].papel)+"</td></tr>").join("")}
    </table>
    <details style="margin-top:10px"><summary class="btn" style="list-style:none">✏️ Editar catálogo</summary>
    <div style="margin-top:10px">
      ${CERVEJAS.map(m=>'<label>'+m+' — tier (1=econômica…4=super premium)</label><input type="number" min="1" max="4" value="'+PORT[m].tier+'" onchange="portSave(\''+m+'\',\'tier\',this.value)">'
        +'<label>'+m+' — preço de referência (R$)</label><input type="number" step="0.01" value="'+PORT[m].preco+'" onchange="portSave(\''+m+'\',\'preco\',this.value)">').join("")}
    </div></details></div>`;
  h+=`<div class="card"><h3>Caderno de regras <span class="hint">versionado</span></h3>
    <table><tr><th>Versão</th><th>Data</th><th>Regra</th></tr>
    <tr><td>1.3</td><td>2026-10-24</td><td class="small">Motor autônomo: alimenta-se de base remota (URL JSON/CSV) ou import local; valida (base ruim nunca entra), hidrata derivados e recalcula tudo. Frescor do dado (coletado_em) com alerta >60 dias.</td></tr>
    <tr><td>1.3</td><td>2026-10-24</td><td class="small">Métricas CMO: prêmio de valor (share valor − share volume) e equity composto (40% share vol + 30% share valor + 20% demanda espontânea + 10% geladeira). Alertas acionáveis do gerente por severidade.</td></tr>
    <tr><td>1.2</td><td>2026-10-24</td><td class="small">Marca-alvo dinâmica por PDV: encaixe de posicionamento (tier marca × tier PDV) + headroom vs fair share do tier + distribuição. Papéis: defender / ponte de preço / puxar valor / manter.</td></tr>
    <tr><td>1.2</td><td>2026-10-24</td><td class="small">Portfólio real no catálogo (12 marcas, dono Ambev × concorrente), tiers 1–4, editável no painel.</td></tr>
    <tr><td>1.1</td><td>2026-10-24</td><td class="small">Fair share por mediana, mínimo de ${PARAMS.fair_share_min_amostra} pares, fallback hierárquico (tipo+classe → tipo → classe → território), aviso de amostra fraca.</td></tr>
    <tr><td>1.1</td><td>2026-10-24</td><td class="small">Share de volume = HL marca ÷ HL total; BSV = receita marca ÷ receita total a preço de balcão. Sempre lado a lado, mesmo mês da série.</td></tr>
    <tr><td>1.1</td><td>2026-10-24</td><td class="small">Conversão de caixas por fatores editáveis no painel. Potencial estimado como faixa. Rastreabilidade coletado/estimado/mock + score de confiança.</td></tr>
    <tr><td>1.0</td><td>2026-10-20</td><td class="small">Sazonalidade: índice mensal por tipo de PDV — badge "a calibrar com BI".</td></tr>
    </table></div>`;
  h+=`<div class="card"><h3>Fonte de dados</h3>
    <div class="grid g2">
      <button class="btn" onclick="exportCSV()">⬇️ Exportar CSV</button>
      <button class="btn" onclick="importCSV()">⬆️ Importar CSV</button>
      <button class="btn" onclick="exportXLSX()">📊 Exportar XLSX</button>
      <button class="btn" onclick="exportJSON()">🧬 Exportar JSON (backup)</button>
    </div>
    <div class="tiny" style="margin-top:8px">Base ativa: ${BASE.pdvs.length} PDVs · gerada em ${esc(BASE.gerado_em)} · ${BASE.ficticio?'<b style="color:var(--warn)">DADOS FICTÍCIOS</b>':'base própria'}</div>
    <button class="btn block" style="margin-top:10px" onclick="resetMock()">🔄 Restaurar base mock (36 PDVs)</button></div>`;
  h+=`<div class="card"><h3>Calibração previsto vs realizado</h3>
    <div class="aviso">Sem histórico de pilotos na base ativa — disponível após o primeiro ciclo de medição (share previsto pelo motor vs realizado na base).</div></div>`;
  h+=`<div class="card"><h3>LGPD</h3>
    <div class="small muted">A base contém apenas dados comerciais de PDVs (pessoas jurídicas) e nomes de contato comercial. Sem dados pessoais sensíveis. Base armazenada localmente (localStorage); export só por decisão do usuário. Ao entrar com dados reais, registrar a origem e a permissão de uso.</div></div>`;
  h+=secFeed();
  return h;
}
function paramSave(k,v){ PARAMS[k]=Number(v)||0; salvarParams(); go("config"); toast("Parâmetro salvo: "+k); }
function paramFator(k,v){ PARAMS.fatores_caixa[k]=Number(v)||1; salvarParams(); go("config"); toast("Fator salvo: "+k); }
function portSave(m,campo,v){ PORT[m][campo]=Number(v)||PORT[m][campo]; salvarParams(); go("config"); toast(m+": "+campo+" salvo"); }
function resetMock(){ BASE=gerarBaseMock(); salvarBase(); go("config"); toast("Base mock restaurada"); }
function csvEsc(v){ v=String(v==null?"":v); return /[,;\n]/.test(v)? '"'+v.replace(/"/g,'""')+'"' : v; }
function exportCSV(){
  const cols=["pdv_id","nome_pdv","tipo","classe","bairro","endereco","visitador","freq_visita","tempo_visita_min",
    "dias_sem_comprar","hl_total_mes","hl_cerveja_mes","hl_refri_mes","hl_energetico_mes","hl_agua_mes",
    "share_ambev_pct","hl_ambev_mes","bsv_pct","receita_total_mes","marca_top","preco_Skol","preco_Brahma","preco_Heineken",
    "share_geladeira_pct","geladeiras_porte","ruptura_mensal_pct","demanda_espontanea_1a5","ponto_extra","cold_door",
    "frente_gondola","porta_garrafas","mesas","fluxo","imagem","publico","percepcao_marca","relacao","decisor",
    "observacoes","concorrente_acao","pagto","limite_credito","inadimplencia_pct","potencial_inf","potencial_sup",
    "potencial_med","origem_potencial","anamnese_status","demo","origem_dados"];
  const linhas=[cols.join(";")];
  BASE.pdvs.forEach(p=>linhas.push([
    p.id,p.nome,p.tipo,p.classe,p.bairro,p.endereco,p.visitador,p.freq_visita,p.tempo_visita_min,p.dias_sem_comprar,
    p.hl_total_mes,p.hl_cerveja_mes,p.hl_refri_mes,p.hl_energetico_mes,p.hl_agua_mes,ambevShare(p).toFixed(2),
    ambevHL(p).toFixed(1),p.bsv,p.receita_total_mes,p.marca_top,p.preco["Skol"],p.preco["Brahma"],p.preco["Heineken"],
    p.share_geladeira,p.geladeiras_porte,p.ruptura_mensal_pct,p.demanda_espontanea,
    +p.ponto_extra,+p.cold_door,+p.frente_gondola,+p.porta_garrafas,p.mesas,p.fluxo,p.imagem,p.publico,
    p.percepcao_marca,p.relacao,p.decisor,p.observacoes,p.conc_acao,p.pagto,p.limite_credito,p.inadimplencia,
    p.pot_inf,p.pot_sup,p.pot_med,p.origem_potencial,p.anamnese,p.demo||"",BASE.ficticio?"mock":"coletado"
  ].map(csvEsc).join(";")));
  baixar("brandfit_base_de_campo.csv",linhas.join("\n"),"text/csv");
  toast("CSV exportado");
}
function importCSV(){
  abrirModal(`<h3>Importar CSV (base de campo)</h3>
    <div class="aviso">O CSV substitui a base ativa. Colunas mínimas: pdv_id;nome_pdv;tipo;classe;hl_total_mes;hl_cerveja_mes. Use ; como separador.</div>
    <input type="file" id="csv-file" accept=".csv,text/csv">
    <div class="grid g2" style="margin-top:12px">
      <button class="btn" onclick="fecharModal()">Cancelar</button>
      <button class="btn primary" onclick="lerCSV()">Importar</button></div>`);
}
function lerCSV(){
  const f=$("#csv-file").files[0]; if(!f){ toast("Selecione um arquivo","err"); return; }
  const rd=new FileReader();
  rd.onload=e=>{
    try{
      const linhas=e.target.result.split(/\r?\n/).filter(l=>l.trim());
      const head=linhas[0].split(";").map(s=>s.trim());
      const idx=c=>head.indexOf(c);
      const pds=linhas.slice(1).map(l=>{
        const c=l.split(";"); const g=(k,d)=>{ const i=idx(k); return i>=0&&c[i]!==undefined&&c[i]!==""? c[i]:d; };
        const preco={}; CERVEJAS.forEach(m=>preco[m]=PORT[m].preco);
        ["Skol","Brahma","Heineken"].forEach(k=>{ const v=+g("preco_"+k,0); if(v) preco[k]=v; });
        return { id:g("pdv_id","PDV"+Math.random().toString(36).slice(2,7)), nome:g("nome_pdv","PDV sem nome"),
          tipo:g("tipo","Bar"), classe:g("classe","B"), bairro:g("bairro",""), endereco:g("endereco",""),
          visitador:g("visitador",""), freq_visita:g("freq_visita","Semanal"), tempo_visita_min:+g("tempo_visita_min",40),
          dias_sem_comprar:+g("dias_sem_comprar",0), hl_total_mes:+g("hl_total_mes",0), hl_cerveja_mes:+g("hl_cerveja_mes",0),
          hl_refri_mes:+g("hl_refri_mes",0), hl_energetico_mes:+g("hl_energetico_mes",0), hl_agua_mes:+g("hl_agua_mes",0),
          share_ambev:+g("share_ambev_pct",0), bsv:+g("bsv_pct",0), receita_total_mes:+g("receita_total_mes",0),
          marca_top:g("marca_top",""), preco,
          share_geladeira:+g("share_geladeira_pct",0), geladeiras_porte:+g("geladeiras_porte",0),
          ruptura_mensal_pct:+g("ruptura_mensal_pct",0), demanda_espontanea:+g("demanda_espontanea_1a5",1),
          ponto_extra:g("ponto_extra","0")==="1", cold_door:g("cold_door","0")==="1", frente_gondola:g("frente_gondola","0")==="1",
          porta_garrafas:g("porta_garrafas","0")==="1", mesas:+g("mesas",0), fluxo:g("fluxo","Médio"),
          imagem:g("imagem","Tradicional"), publico:g("publico",""), percepcao_marca:g("percepcao_marca",""),
          relacao:g("relacao",""), decisor:g("decisor",""), observacoes:g("observacoes",""),
          conc_acao:g("concorrente_acao","Nenhuma"), pagto:g("pagto",""), limite_credito:+g("limite_credito",0),
          inadimplencia:+g("inadimplencia_pct",0), pot_inf:+g("potencial_inf",0), pot_sup:+g("potencial_sup",0),
          pot_med:+g("potencial_med",0), origem_potencial:g("origem_potencial","estimado"),
          anamnese:g("anamnese_status","parcial"), demo:g("demo","")||null };
      });
      if(!pds.length) throw new Error("sem linhas");
      BASE={ficticio:false, gerado_em:new Date().toISOString().slice(0,10), moeda:"BRL", meses:BASE.meses,
        marcas:BASE.marcas, pdvs:pds, aviso:"Base importada pelo usuário."};
      pds.forEach(p=>{
        p.serie_marca={}; p.serie_total={};
        const shareAm=(p.share_ambev||0)/100;
        const hlAm=shareAm*(p.hl_cerveja_mes||0);
        BASE.meses.forEach(mes=>{ p.serie_marca[mes]={};
          CERVEJAS.forEach(mc=>{ const frac=mc===p.marca_top&&hlAm? 0.5 : (PORT[mc].dono==="ambev"?0.3:0.25);
            p.serie_marca[mes][mc]={hl:+(hlAm*frac).toFixed(1), rec:+(hlAm*frac*1e5/PARAMS.ml_por_unidade.lata_350*(p.preco[mc]||PORT[mc].preco)).toFixed(2)}; });
          p.serie_total[mes]={hl:p.hl_total_mes||0, rec:p.receita_total_mes||0, hl_cerv:p.hl_cerveja_mes||0}; });
        p.caixas_ambev_mes=caixasDeHL(hlAm,p.mix_formato||{lata_350:1});
      });
      salvarBase(); fecharModal(); go("config"); toast("Base importada: "+pds.length+" PDVs");
      $("#badge-mock").style.display=BASE.ficticio?"":"none";
    }catch(err){ toast("Falha no import: "+err.message,"err"); }
  };
  rd.readAsText(f);
}
function exportJSON(){ baixar("brandfit_backup.json",JSON.stringify(BASE),"application/json"); toast("Backup exportado"); }
function baixar(nome,conteudo,mime){
  const b=new Blob([conteudo],{type:mime+";charset=utf-8"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=nome; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
function exportXLSX(){
  if(typeof XLSX==="undefined"){ exportCSV(); return; }
  const wb=XLSX.utils.book_new();
  const wide=[["pdv_id","nome_pdv","tipo","classe","bairro","endereco","visitador","freq_visita","hl_total_mes",
    "hl_cerveja_mes","hl_refri_mes","hl_energetico_mes","hl_agua_mes","share_ambev_pct","hl_ambev_mes","bsv_pct",
    "receita_total_mes","marca_top","preco_Skol","preco_Brahma","preco_Heineken","share_geladeira_pct","geladeiras_porte",
    "ruptura_mensal_pct","demanda_espontanea_1a5","ponto_extra","cold_door","frente_gondola","anamnese_status",
    "potencial_inf","potencial_sup","potencial_med","origem_potencial","demo","origem_dados"]];
  BASE.pdvs.forEach(p=>wide.push([p.id,p.nome,p.tipo,p.classe,p.bairro,p.endereco,p.visitador,p.freq_visita,
    p.hl_total_mes,p.hl_cerveja_mes,p.hl_refri_mes,p.hl_energetico_mes,p.hl_agua_mes,+ambevShare(p).toFixed(2),
    +ambevHL(p).toFixed(1),p.bsv,p.receita_total_mes,p.marca_top,p.preco["Skol"],p.preco["Brahma"],p.preco["Heineken"],
    p.share_geladeira,p.geladeiras_porte,p.ruptura_mensal_pct,p.demanda_espontanea,+p.ponto_extra,+p.cold_door,
    +p.frente_gondola,p.anamnese,p.pot_inf,p.pot_sup,p.pot_med,p.origem_potencial,p.demo||"",BASE.ficticio?"mock":"coletado"]));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(wide),"base_de_campo");
  const longo=[["pdv_id","nome_pdv","mes","marca","dono","categoria","tier","hl_mes","caixas_mes","receita_mes","share_volume_pct","share_valor_pct","origem"]];
  BASE.pdvs.forEach(p=>BASE.meses.forEach(mes=>{
    const st=p.serie_total[mes]||{hl:p.hl_total_mes,rec:p.receita_total_mes,hl_cerv:p.hl_cerveja_mes};
    CERVEJAS.forEach(m=>{ const d=(p.serie_marca[mes]||{})[m]; if(!d) return;
      const cx=caixasDeHL(d.hl,p.mix_formato||{lata_350:1});
      longo.push([p.id,p.nome,mes,m,PORT[m].dono,"cerveja",TIER_NOME[PORT[m].tier],d.hl,+cx.toFixed(1),d.rec,
        +(st.hl_cerv?d.hl/st.hl_cerv*100:0).toFixed(2),+(st.rec?d.rec/st.rec*100:0).toFixed(2),BASE.ficticio?"mock":"coletado"]);
    });
  }));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(longo),"fato_Vendas");
  const dimP=[["pdv_id","nome_pdv","tipo","classe","bairro","anamnese_status","potencial_inf","potencial_sup","potencial_med","score_confianca_pct","demo"]];
  BASE.pdvs.forEach(p=>dimP.push([p.id,p.nome,p.tipo,p.classe,p.bairro,p.anamnese,p.pot_inf,p.pot_sup,p.pot_med,scoreConfianca(p),p.demo||""]));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(dimP),"dim_PDV");
  const dimM=[["marca","dono","tier","papel","preco_ref","nossa"]];
  CERVEJAS.forEach(m=>dimM.push([m,PORT[m].dono,TIER_NOME[PORT[m].tier],PORT[m].papel,PORT[m].preco,PORT[m].dono==="ambev"?"sim":"não"]));
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(dimM),"dim_Marca");
  XLSX.writeFile(wb,"brandfit_export.xlsx");
  toast("XLSX exportado (wide + fato_Vendas + dims)");
}
function go(aba){
  ESTADO.aba=aba; salvarEstado();
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===aba));
  const c=$("#conteudo");
  c.innerHTML='<div class="skeleton" style="height:80px;margin-bottom:12px"></div><div class="skeleton" style="height:200px"></div>';
  setTimeout(()=>{
    try{
      c.innerHTML=aba==="hoje"?renderHoje():aba==="pdv"?renderPdv():aba==="territorio"?renderTerritorio()
        :aba==="visoes"?renderVisoes():renderConfig();
      $("#fab").style.display=aba==="hoje"?"":"none";
      $("#subtitulo").textContent={hoje:"Rota do representante",pdv:"Workspace do ponto de venda",
        territorio:"Visão agregada do gestor",visoes:"Recortes por área",config:"Governança e dados"}[aba]||"";
      window.scrollTo(0,0);
    }catch(e){ c.innerHTML='<div class="card"><div class="aviso red">Erro ao renderizar: '+esc(e.message)+'</div></div>'; console.error(e); }
  },120);
}
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>go(t.dataset.tab)));
$("#fab").addEventListener("click",()=>{
  abrirModal(`<h3>Registro rápido de visita</h3>
    <label>PDV</label><select id="rq-pdv">${BASE.pdvs.map(p=>'<option value="'+p.id+'">'+esc(p.nome)+'</option>').join("")}</select>
    <label>Nota</label><textarea id="rq-nota" placeholder="O que aconteceu na visita..."></textarea>
    <div class="grid g2" style="margin-top:12px">
      <button class="btn" onclick="fecharModal()">Cancelar</button>
      <button class="btn primary" onclick="salvarRapido()">Salvar</button></div>`);
});
function salvarRapido(){
  const id=$("#rq-pdv").value; ESTADO.visitas[id]="em_visita";
  ESTADO["reg_"+id]={data:new Date().toISOString().slice(0,10),nota:$("#rq-nota").value,comp:""};
  salvarEstado(); fecharModal(); go(ESTADO.aba); toast("Registro rápido salvo");
}
carregar();
document.getElementById("badge-mock").style.display=BASE.ficticio?"":"none";
go("hoje");
function secAlertas(){
  const al=alertasGerente();
  if(!al.length) return `<div class="card"><h3>🔔 Alertas <span class="hint">nenhum risco ativo</span></h3>
    <div class="empty"><div class="ic">✅</div>Rota, serviço, crédito e frescor de dado em dia.</div></div>`;
  return `<div class="card"><h3>🔔 Alertas <span class="hint">${al.length} acionáveis — por severidade</span></h3>
    ${al.slice(0,10).map(a=>`<div class="degrau" style="margin:5px 0"><span class="semaforo ${a.sev}"></span>
      <div class="small" style="flex:1">${esc(a.txt)}</div>
      <button class="btn" style="padding:5px 10px;font-size:.7rem" onclick="abrirPDV('${a.p.id}')">Abrir</button></div>`).join("")}
    ${al.length>10?`<div class="tiny" style="margin-top:6px">+ ${al.length-10} alertas no mesmo padrão.</div>`:""}
  </div>`;
}
function secCMO(){
  const pds=BASE.pdvs;
  const rows=AMBEV.map(m=>{
    const sv=pds.reduce((a,p)=>a+shareMarca(p,m),0)/pds.length;
    const sr=pds.reduce((a,p)=>a+shareValorMarca(p,m),0)/pds.length;
    const eq=pds.reduce((a,p)=>a+equityMarca(p,m),0)/pds.length;
    return {m, sv, sr, prem:sr-sv, eq};
  }).sort((a,b)=>b.eq-a.eq);
  return `<div class="card"><h3>💎 Prêmio de valor e equity por marca <span class="hint">média dos PDVs — visão CMO</span></h3>
    <table><tr><th>Marca</th><th>Share vol.</th><th>Share valor</th><th>Prêmio de valor</th><th>Equity (0–100)</th></tr>
    ${rows.map(r=>"<tr><td>"+esc(r.m)+"</td><td>"+fmtN(r.sv,1)+"%</td><td>"+fmtN(r.sr,1)+"%</td><td style='color:"+(r.prem>=0?"var(--ok)":"var(--bad)")+"'>"+(r.prem>=0?"+":"")+fmtN(r.prem,1)+" p.p.</td><td>"+semaforo(r.eq,60,40)+fmtN(r.eq,0)+"</td></tr>").join("")}
    </table>
    <div class="tiny" style="margin-top:6px">Prêmio de valor = share valor − share volume (positivo = a marca cobre preço acima do peso). Equity = 40% share vol + 30% share valor + 20% demanda espontânea + 10% geladeira. Uso: investir onde o prêmio é alto e o share baixo — espaço para subir de degrau.</div>
  </div>`;
}
function secFeed(){
  return `<div class="card"><h3>🔌 Alimentação do motor <span class="hint">aponte a fonte e ele recalcula tudo</span></h3>
    <div class="grid g2">
      <label>URL da base (JSON ou CSV — mesmo formato do export)</label>
      <input id="feed-url" type="url" placeholder="https://.../base.json" value="${esc(FEED.url)}">
    </div>
    <div class="grid g2" style="margin-top:8px">
      <button class="btn primary" onclick="feedPuxar()">⬇️ Puxar e recalcular agora</button>
      <button class="btn" onclick="feedMock()">🔄 Voltar para base mock</button>
    </div>
    <div class="tiny" style="margin-top:8px">Última coleta: ${FEED.ultimaColeta?esc(new Date(FEED.ultimaColeta).toLocaleString("pt-BR")):"—"} · fonte: <b>${esc(FEED.fonte)}</b> · ${BASE.pdvs.length} PDVs ativos</div>
    <div class="tiny">Ao puxar: valida a base (base ruim nunca entra), hidrata campos derivados, recalcula todos os indicadores e atualiza as 5 abas. Sem passo manual.</div>
  </div>`;
}
async function feedPuxar(){
  const url=$("#feed-url").value.trim();
  if(!url){ toast("Informe a URL da base","err"); return; }
  toast("Puxando base...","warn");
  try{
    const b=await puxarBaseRemota(url);
    const r=publicarBase(b,"remota");
    if(!r.ok){ toast("Base rejeitada: "+r.erros[0],"err"); return; }
    FEED.url=url; salvarFeed(); rodarMotor();
    toast("Motor recalculado: "+BASE.pdvs.length+" PDVs");
    go("config");
  }catch(e){ toast("Falha ao puxar: "+e.message,"err"); }
}
function feedMock(){ FEED.url=""; FEED.fonte="mock"; salvarFeed();
  BASE=gerarBaseMock(); salvarBase(); rodarMotor(); go("config"); toast("Base mock restaurada e recalculada"); }
function secFrescor(){
  const reps={}; BASE.pdvs.forEach(p=>{ (reps[p.visitador]=reps[p.visitador]||[]).push(p); });
  return `<div class="card"><h3>🗓️ Frescor do dado por rep <span class="hint">dado velho = fair share vencido</span></h3>
    <table><tr><th>Rep</th><th>PDVs</th><th>Frescos (≤30d)</th><th>Atenção (31–60d)</th><th>Vencidos (>60d)</th><th>Sem data</th></tr>
    ${Object.keys(reps).map(r=>{ const g=reps[r];
      const c=g.filter(p=>frescorDado(p).estado==="fresco").length;
      const a=g.filter(p=>frescorDado(p).estado==="atencao").length;
      const v=g.filter(p=>frescorDado(p).estado==="velho").length;
      const s=g.filter(p=>frescorDado(p).estado==="sem-data").length;
      return "<tr><td>"+esc(r)+"</td><td>"+g.length+"</td><td>"+c+"</td><td>"+a+"</td><td>"+v+"</td><td>"+s+"</td></tr>"; }).join("")}
    </table>
    <div class="tiny" style="margin-top:6px">Uso: dado >60 dias vira alerta no Território — a coleta entra na rota antes de qualquer decisão.</div>
  </div>`;
}