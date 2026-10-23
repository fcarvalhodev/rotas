/* Rotas · jogos: one engine for every route's game. Each page sets window.JG_DATA:
   {kicker,title,intro,host:[emoji,name],emo,full,updated,rounds:[...],ranks:[[minPct,text],...],quips:{ok:[],no:[]}}
   Round types:
   - boato:   {type,title,n,items:[{c,v:'v'|'m'|'f'|'u'|'o',e,s:[[name,url]],who}]}
   - mm:      {type,title,q,n,pre,suf,dec,more:true|false,note,src,items:[{l,sub,v}]}
   - escolha: {type,title,n,items:[{q,o:[...],a:index,e,s}]}
*/
(function(){
const D=window.JG_DATA;if(!D)return;
const EN=(document.documentElement.lang||'').toLowerCase().startsWith('en');
const T=(pt,en)=>EN?en:pt;
const LOC=EN?'en-US':'pt-BR';
const root=document.getElementById('jg');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmt=(v,d)=>v.toLocaleString(LOC,{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const LBL={v:T('Verdade','True'),m:T('Meia verdade','Half true'),f:T('Falso','False'),u:T('Não demonstrado','Not shown'),o:T('Em aberto','Open')};
const BTN=[['v',T('Verdade','True')],['m',T('Meia verdade','Half true')],['f',T('Falso','False')],['u',T('Sem prova','No proof')]];
const QOK=(D.quips&&D.quips.ok)||[T('Isso!','Right!')];
const QNO=(D.quips&&D.quips.no)||[T('Não foi dessa vez.','Not this time.')];
let steps=[],cur=0,score=0,missed=[];

function srcHTML(s){
  const L=(s||[]).filter(x=>x&&x[1]);
  if(!L.length)L.push([T('Explicação completa na rota','Full explanation on the route'),D.full||'index.html']);
  return '<div class="jg-src">'+L.map(x=>`<a href="${esc(x[1])}" target="_blank" rel="noopener">${esc(x[0])}</a>`).join('')+'</div>';
}
function build(){
  steps=[];
  (D.rounds||[]).forEach(r=>{
    if(r.type==='mm'){
      const it=r.items.slice();const n=r.n||6;let tries=0,used=new Set();
      while(steps.filter(s=>s.r===r).length<n&&tries<400){tries++;
        const a=pick(it),b=pick(it);if(a===b)continue;
        const lo=Math.min(a.v,b.v),hi=Math.max(a.v,b.v);if(hi<=0||(hi-lo)/hi<(r.gap||.06))continue;
        const key=[a.l,b.l].sort().join('|');if(used.has(key))continue;used.add(key);
        steps.push({r,a,b});}
    }else{
      shuffle(r.items).slice(0,r.n||r.items.length).forEach(x=>steps.push({r,x}));
    }
  });
}
function bar(){
  return `<div class="jg-bar"><span>${T('Pergunta','Question')} ${cur+1} ${T('de','of')} ${steps.length}</span><span class="prog" aria-hidden="true"><i style="width:${cur/steps.length*100}%"></i></span><span>${T('Pontos','Points')}: ${score}</span></div>`;
}
function start(){build();cur=0;score=0;missed=[];show();}
function show(){
  if(cur>=steps.length)return end();
  const st=steps[cur],r=st.r;let h=bar()+'<div class="jg-card" id="card">';
  h+=`<span class="rt">${esc(r.title||'')}</span>`;
  if(r.type==='boato'){
    h+=`<p class="jg-claim">“${esc(st.x.c)}”</p>`+(st.x.who?`<p class="jg-who">${T('Quem diz','Who says it')}: ${esc(st.x.who)}</p>`:'');
    h+='<div class="jg-opts" role="group" aria-label="'+T('Sua resposta','Your answer')+'">'+BTN.map(b=>`<button type="button" class="jg-opt ${b[0]}" data-k="${b[0]}">${b[1]}</button>`).join('')+'</div>';
  }else if(r.type==='escolha'){
    h+=`<p class="jg-claim">${esc(st.x.q)}</p>`;
    h+='<div class="jg-opts'+(st.x.o.some(o=>o.length>22)?' one':'')+'" role="group">'+st.x.o.map((o,i)=>`<button type="button" class="jg-opt" data-i="${i}">${esc(o)}</button>`).join('')+'</div>';
  }else{
    h+=`<p class="jg-q">${esc(r.q)}</p><div class="jg-vs">`+[st.a,st.b].map((x,i)=>`<button type="button" class="jg-pick" data-i="${i}"><b>${esc(x.l)}</b><span>${esc(x.sub||'')}</span><span class="val"></span></button>`).join(`<span class="jg-or">${T('ou','or')}</span>`)+'</div>';
  }
  h+='<div class="jg-reveal" id="rev" hidden></div></div>';
  root.innerHTML=h;
  const card=document.getElementById('card');
  card.querySelectorAll('.jg-opt,.jg-pick').forEach(b=>b.addEventListener('click',()=>answer(st,b)));
  const f=card.querySelector('.jg-opt,.jg-pick');if(f&&cur>0)f.focus({preventScroll:true});
  if(cur>0)root.scrollIntoView({behavior:'smooth',block:'start'});
}
function answer(st,btn){
  const r=st.r,card=document.getElementById('card'),rev=document.getElementById('rev');
  card.querySelectorAll('.jg-opt,.jg-pick').forEach(b=>b.disabled=true);
  let ok=false,body='';
  if(r.type==='boato'){
    const truth=st.x.v==='o'?'u':st.x.v;ok=btn.dataset.k===truth;
    card.querySelectorAll('.jg-opt').forEach(b=>{if(b.dataset.k===truth)b.classList.add('right');else if(b===btn)b.classList.add('wrong')});
    body=`<p><span class="bdg ${st.x.v}">${LBL[st.x.v]}</span>${esc(st.x.e)}</p>`+srcHTML(st.x.s);
    if(!ok)missed.push(st.x.c);
  }else if(r.type==='escolha'){
    ok=+btn.dataset.i===st.x.a;
    card.querySelectorAll('.jg-opt').forEach(b=>{if(+b.dataset.i===st.x.a)b.classList.add('right');else if(b===btn)b.classList.add('wrong')});
    body=`<p>${esc(st.x.e)}</p>`+srcHTML(st.x.s);
    if(!ok)missed.push(st.x.q);
  }else{
    const more=r.more!==false,win=(st.a.v>st.b.v)===more?0:1;ok=+btn.dataset.i===win;
    card.querySelectorAll('.jg-pick').forEach((b,i)=>{const x=i?st.b:st.a;b.querySelector('.val').textContent=(r.pre||'')+fmt(x.v,r.dec)+(r.suf||'');if(i===win)b.classList.add('right');else if(b===btn)b.classList.add('wrong')});
    body=(r.note?`<p>${esc(r.note)}</p>`:'')+srcHTML(r.src);
    if(!ok)missed.push(st.a.l+' × '+st.b.l);
  }
  if(ok)score++;
  rev.innerHTML=`<span class="jg-res ${ok?'ok':'no'}">${ok?T('Acertou','Correct'):T('Errou','Wrong')}</span><p class="jg-quip">${esc(ok?pick(QOK):pick(QNO))}</p>`+body+`<button type="button" class="jg-btn" id="nx">${cur+1<steps.length?T('Próxima →','Next →'):T('Ver o resultado','See the result')}</button>`;
  rev.hidden=false;
  const nx=document.getElementById('nx');nx.addEventListener('click',()=>{cur++;show()});nx.focus({preventScroll:true});
}
function end(){
  const pct=steps.length?score/steps.length*100:0;let rank='';
  (D.ranks||[]).forEach(r=>{if(pct>=r[0])rank=r[1]});
  root.innerHTML=`<div class="jg-card jg-end"><span class="rt">${T('Resultado','Result')}</span><h2>${T('Fim de jogo','Game over')}</h2><span class="jg-score">${score}/${steps.length}</span><p class="jg-rank">${esc(rank)}</p>`+
   (missed.length?`<p style="margin:0">${T('Vale reler','Worth rereading')}:</p><ul class="jg-list">${missed.slice(0,6).map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`:'')+
   `<div class="jg-row"><button type="button" class="jg-btn" id="again">${T('Jogar de novo','Play again')}</button><a class="jg-btn ghost" href="${esc(D.full||'index.html')}">${T('Ler a rota completa','Read the full route')}</a></div>`+
   `<p class="jg-foot">${T('As perguntas mudam a cada partida.','Questions change every round.')}</p></div>`;
  document.getElementById('again').addEventListener('click',start);
  root.scrollIntoView({behavior:'smooth',block:'start'});
}
function intro(){
  const h=D.host||['🎮',''];
  root.innerHTML=`<section class="jg-hero"><span class="emo" aria-hidden="true">${esc(D.emo||h[0])}</span><span class="k">${esc(D.kicker||'')}</span><h1>${esc(D.title)}</h1><p>${esc(D.intro||'')}</p>${h[1]?`<span class="host"><b aria-hidden="true">${esc(h[0])}</b>${esc(h[1])}</span>`:''}<button type="button" class="jg-btn light" id="go">${T('Começar','Start')} ▶</button></section>`+
   `<div class="jg-card"><span class="rt">${T('Como funciona','How it works')}</span><ul class="jg-list">${(D.rounds||[]).map(r=>`<li><b>${esc(r.title)}</b>: ${esc(r.how||'')}</li>`).join('')}</ul><p class="jg-foot">${T('É uma brincadeira, mas cada resposta vem da rota, com a fonte. Etiquetas: Verdade, Meia verdade, Falso e Não demonstrado.','It is a joke, but every answer comes from the route, with its source. Labels: True, Half true, False and Not shown.')}</p></div>`+
   `<p class="jg-foot">${esc(D.updated||'')} · <a href="${esc(D.full||'index.html')}">${T('Voltar para a rota','Back to the route')}</a></p>`;
  document.getElementById('go').addEventListener('click',start);
}
intro();
})();
