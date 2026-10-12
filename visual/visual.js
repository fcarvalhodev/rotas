/* Rotas · versão em gráficos. Renders window.RV_DATA into animated cards.
   Card types: hero, big, waffles, bars, line, gauge, flow, compare, verdicts, chips, text.
   Every card: {type, span:"s4", rows:1|2, label, title, text, src:[[name,url],...]} */
(function(){
const D=window.RV_DATA; if(!D) return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,dec)=>v.toLocaleString('pt-BR',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});
const foot=c=>c.src&&c.src.length?`<div class="foot">${c.src.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('')}</div>`:'';
const head=c=>`${c.label?`<span class="lbl">${esc(c.label)}</span>`:''}${c.title?`<h3>${c.title}</h3>`:''}`;
const txt=c=>c.text?`<p>${c.text}</p>`:'';
const R={};

R.hero=c=>`<span class="kick">${esc(D.kicker||'')}</span><h1>${esc(D.title)}</h1><p class="ans">${D.answer}</p>
 <div class="go"><a href="${D.full||'index.html'}">Ler a versão completa</a>${D.easy?`<a class="ghost" href="${D.easy}">Versão fácil</a>`:''}</div>`;

R.big=c=>`${head(c)}<div><span class="n" data-count="${c.value}" data-dec="${c.dec||0}" data-pre="${esc(c.pre||'')}" data-suf="${esc(c.suf||'')}">${esc(c.pre||'')}0${esc(c.suf||'')}</span></div>${c.unit?`<span class="u">${c.unit}</span>`:''}${c.dots?dots(c.dots):''}${txt(c)}${foot(c)}`;

function dots(d){ // {n:100, on:[[count,color],...], sq, max}
 let h='',k=0;d.on.forEach(([n,col])=>{for(let i=0;i<n;i++)h+=`<i data-c="${col}" style="transition-delay:${(k++*12)}ms"></i>`;});
 for(;k<(d.n||100);k++)h+=`<i style="transition-delay:${k*12}ms"></i>`;
 return `<div class="waf${d.sq?' sq':''}" style="${d.max?`max-width:${d.max}px`:''}" role="img" aria-label="${esc(d.alt||'')}">${h}</div>`;
}
R.waffles=c=>`${head(c)}${c.legend?leg(c.legend):''}<div class="wafrow">${c.items.map(w=>`<div class="w"><b>${esc(w.name)}</b>${dots(w)}<span style="color:${w.color||'var(--ink)'}">${esc(w.big)}</span></div>`).join('')}</div>${txt(c)}${foot(c)}`;
const leg=l=>`<div class="leg">${l.map(x=>`<span><i style="background:${x[1]}"></i>${esc(x[0])}</span>`).join('')}</div>`;

R.bars=c=>{const m=c.max||Math.max(...c.items.map(i=>i.v));return `${head(c)}<div class="bars">${c.items.map((b,i)=>`<div class="bar" data-tip="${esc(b.tip||b.name+': '+b.label)}"><div class="t">${esc(b.name)}<span>${esc(b.label)}</span></div><div class="tr"><div class="f" data-w="${Math.max(b.v/m*100,.8)}" style="--c:${b.color||'var(--accent)'};transition-delay:${i*120}ms"></div></div>${b.sub?`<small>${esc(b.sub)}</small>`:''}</div>`).join('')}</div>${txt(c)}${foot(c)}`};

R.line=c=>{ // points [[x,y,label]], eras [[x0,x1,name]], ymax
 const W=c.w||400,H=c.h||230,pl=10,pr=26,pt=24,pb=34,xs=c.points.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs),ymax=c.ymax||Math.max(...c.points.map(p=>p[1]))*1.1,ymin=c.ymin||0;
 const X=x=>pl+(x-x0)/(x1-x0)*(W-pl-pr),Y=y=>H-pb-(y-ymin)/(ymax-ymin)*(H-pt-pb);
 const d=c.points.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
 const area=d+` L${X(x1)} ${H-pb} L${X(x0)} ${H-pb} Z`;
 const eras=(c.eras||[]).map((e,i)=>`<rect class="band" x="${X(Math.max(e[0],x0))}" y="${pt-14}" width="${X(Math.min(e[1],x1))-X(Math.max(e[0],x0))}" height="${H-pb-pt+14}" opacity="${i%2?0:.55}"/><text class="era" x="${(X(Math.max(e[0],x0))+X(Math.min(e[1],x1)))/2}" y="${H-pb+22}" text-anchor="middle">${esc(e[2])}</text>`).join('');
 const pts=c.points.map((p,i)=>`<g data-tip="${esc(p[2]+': '+fmt(p[1],1)+(c.suf||''))}"><circle class="pt${p[3]?' pk':''}" cx="${X(p[0])}" cy="${Y(p[1])}" r="${p[3]?6:4.5}" style="opacity:0;transition:opacity .3s ${300+i*140}ms"/>${p[4]?"":`<text class="vl" x="${X(p[0])}" y="${Y(p[1])-11}" text-anchor="middle" style="opacity:0;transition:opacity .3s ${300+i*140}ms">${fmt(p[1],c.dec===undefined?1:c.dec)}${c.suf||''}</text>`}</g>`).join('');
 return `${head(c)}<div class="lc"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.alt||c.title||'')}">${eras}<line class="ax" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/><path class="ar" d="${area}" style="opacity:0;transition:opacity .8s 1.2s"/><path class="ln" d="${d}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) .2s"/>${pts}</svg></div>${txt(c)}${foot(c)}`};

R.gauge=c=>{const r=80,len=Math.PI*r,frac=c.value/c.max;return `${head(c)}<div class="gauge"><svg viewBox="0 0 200 134" role="img" aria-label="${esc(c.alt||'')}"><path class="trk" d="M20 105 A80 80 0 0 1 180 105"/><path class="val" d="M20 105 A80 80 0 0 1 180 105" style="stroke-dasharray:${len};stroke-dashoffset:${len}" data-off="${len*(1-frac)}"/><text class="gt" x="100" y="98" data-count="${c.value}" data-dec="${c.dec||0}" data-suf="${esc(c.suf||'')}">0</text><text class="gs" x="100" y="130">${esc(c.sub||'')}</text></svg></div>${txt(c)}${foot(c)}`};

R.flow=c=>`${head(c)}<div class="flow">${c.steps.map((s,i)=>`<div class="st${s.hot?' hot':''}" style="transition-delay:${i*220}ms"><span class="emo" aria-hidden="true">${s.emo}</span><b>${esc(s.name)}</b>${s.sub?`<small>${esc(s.sub)}</small>`:''}</div>`).join('')}</div>${txt(c)}${foot(c)}`;

R.compare=c=>`${head(c)}<div class="cmp"><div class="side"><b style="color:${c.a.color||'var(--accent)'}" data-count="${c.a.v}" data-dec="${c.a.dec||0}" data-pre="${esc(c.a.pre||'')}" data-suf="${esc(c.a.suf||'')}">0</b><span>${esc(c.a.name)}</span></div><span class="vs">${esc(c.vs||'×')}</span><div class="side"><b style="color:${c.b.color||'var(--ink)'}" data-count="${c.b.v}" data-dec="${c.b.dec||0}" data-pre="${esc(c.b.pre||'')}" data-suf="${esc(c.b.suf||'')}">0</b><span>${esc(c.b.name)}</span></div></div>${c.strip?(()=>{const m=Math.max(c.a.v,c.b.v);return `<div class="bars">${[c.a,c.b].map((x,i)=>`<div class="bar"><div class="t">${esc(x.name)}<span>${esc((x.pre||'')+fmt(x.v,x.dec||0)+(x.suf||''))}</span></div><div class="tr"><div class="f" data-w="${Math.max(x.v/m*100,.8)}" style="--c:${x.color||'var(--accent)'};transition-delay:${400+i*200}ms"></div></div></div>`).join('')}</div>`})():''}${txt(c)}${foot(c)}`;

const BL={v:'Verdade',m:'Meia verdade',f:'Falso',o:'Em aberto',u:'Não demonstrado'};
R.verdicts=c=>`${head(c)}<div class="vds">${c.items.map((v,i)=>`<div class="vd" style="transition-delay:${i*140}ms"><span class="bdg ${v[0]==='u'?'o':v[0]}">${BL[v[0]]}</span><p>${v[1]}</p></div>`).join('')}</div>${foot(c)}`;

R.chips=c=>`${head(c)}<div class="chips">${c.items.map((x,i)=>`<div class="chip" style="--c:${x[3]||'var(--accent)'};transition-delay:${i*130}ms"><span class="y">${esc(x[0])}</span><div><b>${x[1]}</b>${x[2]?`<small>${x[2]}</small>`:''}</div></div>`).join('')}</div>${txt(c)}${foot(c)}`;

R.govs=c=>{const dm=c.dmax||100,jm=c.jmax||10;return `${head(c)}<div class="govs">${c.items.map((g,gi)=>{const d=g.debt;return `<div class="gv" style="transition-delay:${gi*260}ms"><h4>${esc(g.name)}</h4><span class="yrs">${esc(g.years)}</span>
 <div class="cols" role="img" aria-label="${esc(g.name+': dívida de '+fmt(d[0][1],1)+'% para '+fmt(d[d.length-1][1],1)+'% do PIB')}">${d.map((x,i)=>`<div class="col${i===d.length-1?' end':''}${x[2]?' pk':''}" data-tip="${esc(x[0]+': '+fmt(x[1],1)+'% do PIB')}"><b>${fmt(x[1],1)}%</b><i data-h="${x[1]/dm*72}" style="transition-delay:${gi*260+300+i*220}ms"></i><small>${esc(x[0])}</small></div>`).join('')}</div>
 <span class="dl ${g.delta>0?'up':'dn'}">${g.delta>0?'▲ +':'▼ '}${fmt(g.delta,1)} pontos</span>
 <div class="jr"><span class="cap">Juros, % do PIB no ano</span>${g.juros.map((j,i)=>`<div class="r" data-tip="${esc(j[0]+': juros de '+fmt(j[1],2)+'% do PIB')}"><span>${esc(j[0])}</span><span class="t"><span class="f" data-w="${j[1]/jm*100}" style="transition-delay:${gi*260+700+i*150}ms"></span></span><b>${fmt(j[1],1)}%</b></div>`).join('')}</div>
 ${g.note?`<p>${g.note}</p>`:''}</div>`}).join('')}</div>${txt(c)}${foot(c)}`};
R.contrib=c=>{const m=c.max||Math.max(...c.groups.flatMap(g=>g.items.map(i=>Math.abs(i[1]))));return `${head(c)}<div class="ctb">${c.groups.map((g,gi)=>`<div class="g"><h4>${esc(g.title)}</h4><span class="se">de ${fmt(g.start,1)}% para ${fmt(g.end,1)}% do PIB</span>${g.items.map((x,i)=>{const w=Math.abs(x[1])/m*100,dl=`transition-delay:${gi*300+i*160}ms`;return `<div class="r" data-tip="${esc(x[0]+': '+(x[1]>0?'+':'')+fmt(x[1],1)+' ponto(s)')}"><span class="nm">${esc(x[0])}</span><span class="neg">${x[1]<0?`<i style="width:${w}%;${dl}"></i>`:''}</span><span class="pos">${x[1]>0?`<i style="width:${w}%;${dl}"></i>`:''}</span><b>${x[1]>0?'+':''}${fmt(x[1],1)}</b></div>`}).join('')}<div class="tot">Resultado<span>${(g.total??g.end-g.start)>0?"+":""}${fmt(g.total??g.end-g.start,1)} pontos</span></div></div>`).join('')}</div>${c.legend?leg(c.legend):''}${txt(c)}${foot(c)}`};
R.text=c=>`${c.emo?`<span class="emo" aria-hidden="true">${c.emo}</span>`:''}${head(c)}${txt(c)}${foot(c)}`;

// build
const root=document.getElementById('rv');
root.innerHTML=D.cards.map(c=>`<section class="cd k ${c.span||'s4'}${c.rows===2?' r2':''}${c.type==='hero'?' hero':''}${c.type==='big'?' big':''}" ${c.style?`style="${c.style}"`:''}>${R[c.type](c)}</section>`).join('')+
 `<div class="rvfoot"><span>${esc(D.updated||'')}</span><button type="button" id="rvagain">▶ Ver a animação de novo</button><span><a href="${D.full||'index.html'}">Todas as fontes e os detalhes estão na versão completa →</a></span></div>`;

// animate
function countUp(el){const v=+el.dataset.count,dec=+el.dataset.dec||0,pre=el.dataset.pre||'',suf=el.dataset.suf||'';
 if(reduce){el.textContent=pre+fmt(v,dec)+suf;return}
 const t0=performance.now(),dur=1300;const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=pre+fmt(v*e,dec)+suf;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);}
function play(card){
 card.classList.add('in');
 card.querySelectorAll('[data-count]').forEach(countUp);
 card.querySelectorAll('.bar .f,.gv .jr .f').forEach(f=>f.style.width=f.dataset.w+'%');
 card.querySelectorAll('.gv .col i').forEach(i=>i.style.height=i.dataset.h+'%');
 card.querySelectorAll('.waf i[data-c]').forEach(i=>i.style.background=i.dataset.c);
 card.querySelectorAll('.lc .ln').forEach(p=>p.style.strokeDashoffset=0);
 card.querySelectorAll('.lc .ar,.lc .pt,.lc .vl').forEach(p=>p.style.opacity=p.classList.contains('ar')?'':1);
 card.querySelectorAll('.gauge .val').forEach(p=>p.style.strokeDashoffset=p.dataset.off);
}
const cards=[...root.querySelectorAll('.cd')];
if(reduce||!('IntersectionObserver' in window)){cards.forEach(play)}
else{
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);const i=cards.indexOf(e.target);setTimeout(()=>play(e.target),Math.min(i,8)*110)}}),{threshold:.15});
 cards.forEach(c=>io.observe(c));
}
document.getElementById('rvagain').addEventListener('click',()=>{cards.forEach(c=>{c.classList.remove('in');c.querySelectorAll('.bar .f,.gv .jr .f').forEach(f=>f.style.width=0);c.querySelectorAll('.gv .col i').forEach(i=>i.style.height=0);c.querySelectorAll('.waf i[data-c]').forEach(i=>i.style.background='');c.querySelectorAll('.lc .ln').forEach(p=>p.style.strokeDashoffset=1);c.querySelectorAll('.lc .ar,.lc .pt,.lc .vl').forEach(p=>p.style.opacity=0);c.querySelectorAll('.gauge .val').forEach(p=>p.style.strokeDashoffset=p.style.strokeDasharray)});scrollTo({top:0,behavior:reduce?'auto':'smooth'});setTimeout(()=>cards.forEach((c,i)=>{const r=c.getBoundingClientRect();if(r.top<innerHeight)setTimeout(()=>play(c),i*110);else{const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io2.disconnect();play(c)}}),{threshold:.15});io2.observe(c)}}),400)});
// tooltip
const tip=document.createElement('div');tip.className='tip';document.body.appendChild(tip);
root.addEventListener('pointerover',e=>{const t=e.target.closest('[data-tip]');if(!t)return;tip.textContent=t.dataset.tip;tip.classList.add('on')});
root.addEventListener('pointermove',e=>{if(!tip.classList.contains('on'))return;const x=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8);tip.style.left=x+'px';tip.style.top=(e.clientY+16)+'px'});
root.addEventListener('pointerout',e=>{if(e.target.closest('[data-tip]'))tip.classList.remove('on')});
})();
