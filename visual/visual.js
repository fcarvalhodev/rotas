/* Rotas · versão em gráficos. Renders window.RV_DATA into animated cards.
   Card types: hero, big, waffles, bars, line, gauge, flow, compare, verdicts, chips, text.
   Every card: {type, span:"s4", rows:1|2, label, title, text, src:[[name,url],...]} */
(function(){
const D=window.RV_DATA; if(!D) return;
const EN=D.lang==='en',T=(pt,en)=>EN?en:pt,LOC=EN?'en-US':'pt-BR';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v,dec)=>v.toLocaleString(LOC,{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});
const foot=c=>c.src&&c.src.length?`<div class="foot">${c.src.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener">${esc(s[0])}</a>`).join('')}</div>`:'';
const head=c=>`${c.label?`<span class="lbl">${esc(c.label)}</span>`:''}${c.title?`<h3>${c.title}</h3>`:''}`;
const txt=c=>c.text?`<p>${c.text}</p>`:'';
const R={};
const ICONS=window.RV_ICONS||{};
const ic=(n,cls,st)=>ICONS[n]?(n.startsWith('iso-')?`<svg class="ico${cls?' '+cls:''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"${st?` style="${st}"`:''}>${ICONS[n]}</svg>`:`<svg class="ico${cls?' '+cls:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${st?` style="${st}"`:''}>${ICONS[n]}</svg>`):'';
const icn=(n,count,color,off)=>{let h='';const full=Math.floor(count+1e-9),fr=count-full;for(let i=0;i<full;i++)h+=ic(n,off?'off':'on',off?'':`color:${color}`);if(fr>.04)h+=`<span class="pt" style="width:${fr.toFixed(2)}em">${ic(n,off?'off':'on',off?'':`color:${color}`)}</span>`;return h};
const sym=x=>x.icon?ic(x.icon):(x.emo||'');

R.hero=c=>`${D.heroIcons?`<div class="hfl" aria-hidden="true">${D.heroIcons.map((n,i)=>ic(n,"f",`left:${(i*37)%92+2}%;top:${(i*53)%80+6}%;`)).join("")}</div>`:""}<span class="kick">${esc(D.kicker||'')}</span><h1 aria-label="${esc(D.title)}">${D.title.split(' ').map(w=>`<span class="w" aria-hidden="true">${[...w].map(ch=>`<span class="ch">${esc(ch)}</span>`).join('')}</span>`).join(' ')}</h1><p class="ans">${D.answer}</p>
 <div class="go"><a href="${D.full||'index.html'}">${T('Ler a versão completa','Read the full version')}</a>${D.easy?`<a class="ghost" href="${D.easy}">${T('Versão fácil','Easy version')}</a>`:''}</div>`;

R.big=c=>`${head(c)}<div><span class="n" data-count="${c.value}" data-dec="${c.dec||0}" data-pre="${esc(c.pre||'')}" data-suf="${esc(c.suf||'')}">${esc(c.pre||'')}0${esc(c.suf||'')}</span></div>${c.unit?`<span class="u">${c.unit}</span>`:''}${c.dots?dots(c.dots):''}${txt(c)}${foot(c)}`;

function dots(d){ // {n:100, on:[[count,color],...], sq, max}
 let h='',k=0;d.on.forEach(([n,col])=>{for(let i=0;i<n;i++)h+=`<i data-c="${col}" style="transition-delay:${(k++*12)}ms"></i>`;});
 for(;k<(d.n||100);k++)h+=`<i style="transition-delay:${k*12}ms"></i>`;
 return `<div class="waf${d.sq?' sq':''}" style="${d.max?`max-width:${d.max}px`:''}" role="img" aria-label="${esc(d.alt||'')}">${h}</div>`;
}
R.waffles=c=>`${head(c)}${c.legend?leg(c.legend):''}<div class="wafrow">${c.items.map(w=>`<div class="w"><b>${esc(w.name)}</b>${dots(w)}<span style="color:${w.color||'var(--ink)'}">${esc(w.big)}</span></div>`).join('')}</div>${txt(c)}${foot(c)}`;
const leg=l=>`<div class="leg">${l.map(x=>`<span><i style="background:${x[1]}"></i>${esc(x[0])}</span>`).join('')}</div>`;

R.bars=c=>{const m=c.max||Math.max(...c.items.map(i=>i.v));return `${head(c)}<div class="bars">${c.items.map((b,i)=>`<div class="bar" data-tip="${esc(b.tip||b.name+': '+b.label)}"><div class="t">${esc(b.name)}<span>${esc(b.label)}</span></div><div class="tr"><div class="f" data-w="${Math.max(b.v/m*100,.8)}" style="--bc:${b.color||'var(--accent)'};transition-delay:${i*120}ms"></div></div>${b.sub?`<small>${esc(b.sub)}</small>`:''}</div>`).join('')}</div>${txt(c)}${foot(c)}`};

R.line=c=>{ // points [[x,y,label]], eras [[x0,x1,name]], ymax
 const W=c.w||400,H=c.h||230,pl=10,pr=26,pt=24,pb=34,xs=c.points.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs),ymax=c.ymax||Math.max(...c.points.map(p=>p[1]))*1.1,ymin=c.ymin||0;
 const X=x=>pl+(x-x0)/(x1-x0)*(W-pl-pr),Y=y=>H-pb-(y-ymin)/(ymax-ymin)*(H-pt-pb);
 const d=c.points.map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join(' ');
 const area=d+` L${X(x1)} ${H-pb} L${X(x0)} ${H-pb} Z`;
 const eras=(c.eras||[]).map((e,i)=>`<rect class="band" x="${X(Math.max(e[0],x0))}" y="${pt-14}" width="${X(Math.min(e[1],x1))-X(Math.max(e[0],x0))}" height="${H-pb-pt+14}" opacity="${i%2?0:.55}"/><text class="era" x="${(X(Math.max(e[0],x0))+X(Math.min(e[1],x1)))/2}" y="${H-pb+22}" text-anchor="middle">${esc(e[2])}</text>`).join('');
 const pts=c.points.map((p,i)=>`<g data-tip="${esc(p[2]+': '+fmt(p[1],1)+(c.suf||''))}"><circle class="pt${p[3]?' pk':''}" cx="${X(p[0])}" cy="${Y(p[1])}" r="${p[3]?6:4.5}" style="opacity:0;transition:opacity .3s ${300+i*140}ms"/>${p[4]?"":`<text class="vl" x="${X(p[0])}" y="${Y(p[1])-11}" text-anchor="middle" style="opacity:0;transition:opacity .3s ${300+i*140}ms">${fmt(p[1],c.dec===undefined?1:c.dec)}${c.suf||''}</text>`}</g>`).join('');
 return `${head(c)}<div class="lc"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(c.alt||c.title||'')}">${eras}<line class="ax" x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}"/><path class="ar" d="${area}" style="opacity:0;transition:opacity .8s 1.2s"/><path class="ln" d="${d}" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1) .2s"/>${pts}</svg></div>${txt(c)}${foot(c)}`};

R.gauge=c=>{const r=80,len=Math.PI*r,frac=c.value/c.max;return `${head(c)}<div class="gauge"><svg viewBox="0 0 200 156" role="img" aria-label="${esc(c.alt||'')}"><path class="trk" d="M20 105 A80 80 0 0 1 180 105"/><path class="val" d="M20 105 A80 80 0 0 1 180 105" style="stroke-dasharray:${len};stroke-dashoffset:${len}" data-off="${len*(1-frac)}"/><g class="ndl" data-a="${-90+Math.min(frac,1)*180}"><line x1="100" y1="105" x2="100" y2="48"/><circle cx="100" cy="105" r="7"/></g><text class="gt" x="100" y="138" data-count="${c.value}" data-dec="${c.dec||0}" data-suf="${esc(c.suf||'')}">0</text><text class="gs" x="100" y="154">${esc(c.sub||'')}</text></svg></div>${txt(c)}${foot(c)}`};

R.flow=c=>`${head(c)}<div class="flow">${c.steps.map((s,i)=>`<div class="st${s.hot?' hot':''}" style="transition-delay:${i*220}ms"><span class="emo" aria-hidden="true">${sym(s)}</span><b>${esc(s.name)}</b>${s.sub?`<small>${esc(s.sub)}</small>`:''}</div>`).join('')}</div>${txt(c)}${foot(c)}`;

R.compare=c=>`${head(c)}<div class="cmp"><div class="side"><b style="color:${c.a.color||'var(--accent)'}" data-count="${c.a.v}" data-dec="${c.a.dec||0}" data-pre="${esc(c.a.pre||'')}" data-suf="${esc(c.a.suf||'')}">0</b><span>${esc(c.a.name)}</span></div><span class="vs">${esc(c.vs||'×')}</span><div class="side"><b style="color:${c.b.color||'var(--ink)'}" data-count="${c.b.v}" data-dec="${c.b.dec||0}" data-pre="${esc(c.b.pre||'')}" data-suf="${esc(c.b.suf||'')}">0</b><span>${esc(c.b.name)}</span></div></div>${c.strip?(()=>{const m=Math.max(c.a.v,c.b.v);return `<div class="bars">${[c.a,c.b].map((x,i)=>`<div class="bar"><div class="t">${esc(x.name)}<span>${esc((x.pre||'')+fmt(x.v,x.dec||0)+(x.suf||''))}</span></div><div class="tr"><div class="f" data-w="${Math.max(x.v/m*100,.8)}" style="--bc:${x.color||'var(--accent)'};transition-delay:${400+i*200}ms"></div></div></div>`).join('')}</div>`})():''}${txt(c)}${foot(c)}`;

const BL=EN?{v:'True',m:'Half true',f:'False',o:'Open',u:'Not shown'}:{v:'Verdade',m:'Meia verdade',f:'Falso',o:'Em aberto',u:'Não demonstrado'};
R.verdicts=c=>`${head(c)}<div class="vds">${c.items.map((v,i)=>`<div class="vd" style="transition-delay:${i*140}ms"><span class="bdg ${v[0]==='u'?'o':v[0]}">${esc(v[2]||BL[v[0]])}</span><p>${v[1]}</p></div>`).join('')}</div>${foot(c)}`;

R.chips=c=>`${head(c)}<div class="chips">${c.items.map((x,i)=>`<div class="chip" style="--cc:${x[3]||'var(--accent)'};transition-delay:${i*130}ms"><span class="y">${esc(x[0])}</span><div><b>${x[1]}</b>${x[2]?`<small>${x[2]}</small>`:''}</div></div>`).join('')}</div>${txt(c)}${foot(c)}`;

R.govs=c=>{const dm=c.dmax||100,jm=c.jmax||10;return `${head(c)}<div class="govs">${c.items.map((g,gi)=>{const d=g.debt;return `<div class="gv" style="transition-delay:${gi*260}ms"><h4>${esc(g.name)}</h4><span class="yrs">${esc(g.years)}</span>
 <div class="cols" role="img" aria-label="${esc(g.name+T(': dívida de ',': debt from ')+fmt(d[0][1],1)+T('% para ','% to ')+fmt(d[d.length-1][1],1)+T('% do PIB','% of GDP'))}">${d.map((x,i)=>`<div class="col${i===d.length-1?' end':''}${x[2]?' pk':''}" data-tip="${esc(x[0]+': '+fmt(x[1],1)+T('% do PIB','% of GDP'))}"><b>${fmt(x[1],1)}%</b><i data-h="${x[1]/dm*72}" style="transition-delay:${gi*260+300+i*220}ms"></i><small>${esc(x[0])}</small></div>`).join('')}</div>
 <span class="dl ${g.delta>0?'up':'dn'}">${g.delta>0?'▲ +':'▼ '}${fmt(g.delta,1)} ${T('pontos','points')}</span>
 <div class="jr"><span class="cap">${T('Juros, % do PIB no ano','Interest, % of GDP in the year')}</span>${g.juros.map((j,i)=>`<div class="r" data-tip="${esc(j[0]+T(': juros de ',': interest of ')+fmt(j[1],2)+T('% do PIB','% of GDP'))}"><span>${esc(j[0])}</span><span class="t"><span class="f" data-w="${j[1]/jm*100}" style="transition-delay:${gi*260+700+i*150}ms"></span></span><b>${fmt(j[1],1)}%</b></div>`).join('')}</div>
 ${g.note?`<p>${g.note}</p>`:''}</div>`}).join('')}</div>${txt(c)}${foot(c)}`};
R.contrib=c=>{const m=c.max||Math.max(...c.groups.flatMap(g=>g.items.map(i=>Math.abs(i[1]))));return `${head(c)}<div class="ctb">${c.groups.map((g,gi)=>`<div class="g"><h4>${esc(g.title)}</h4><span class="se">${T('de ','from ')}${fmt(g.start,1)}${T('% para ','% to ')}${fmt(g.end,1)}${T('% do PIB','% of GDP')}</span>${g.items.map((x,i)=>{const w=Math.abs(x[1])/m*100,dl=`transition-delay:${gi*300+i*160}ms`;return `<div class="r" data-tip="${esc(x[0]+': '+(x[1]>0?'+':'')+fmt(x[1],1)+T(' ponto(s)',' point(s)'))}"><span class="nm">${esc(x[0])}</span><span class="neg">${x[1]<0?`<i style="width:${w}%;${dl}"></i>`:''}</span><span class="pos">${x[1]>0?`<i style="width:${w}%;${dl}"></i>`:''}</span><b>${x[1]>0?'+':''}${fmt(x[1],1)}</b></div>`}).join('')}<div class="tot">${T('Resultado','Result')}<span>${(g.total??g.end-g.start)>0?"+":""}${fmt(g.total??g.end-g.start,1)} ${T('pontos','points')}</span></div></div>`).join('')}</div>${c.legend?leg(c.legend):''}${txt(c)}${foot(c)}`};
R.stack=c=>{const t=c.items.reduce((a,x)=>a+x[1],0);return `${head(c)}<div class="stk" role="img" aria-label="${esc(c.alt||'')}">${c.items.map((x,i)=>`<i data-b="${x[1]/t*100}" data-tip="${esc(x[0]+': '+x[2])}" style="background:${x[3]};transition-delay:${200+i*250}ms">${x[1]/t>.12?esc(x[2]):''}</i>`).join('')}</div><div class="stkl">${c.items.map(x=>`<div><i style="background:${x[3]}"></i><b>${esc(x[0])}${x[4]?`<small>${x[4]}</small>`:''}</b><span>${esc(x[2])}</span></div>`).join('')}</div>${txt(c)}${foot(c)}`};
R.coins=c=>{const u=c.unit;return `${head(c)}<div class="coins">${c.items.map((x,xi)=>{const n=Math.max(1,Math.round(x.v/u));let h='';for(let i=0;i<n;i++)h+=`<i style="color:${x.color};transition-delay:${xi*300+i*40}ms">${ic("coin")||"<b>R$</b>"}</i>`;return `<div class="cstack" data-tip="${esc(x.name+': '+x.label)}"><div class="pile">${h}</div><b class="cl" style="color:${x.color}">${esc(x.label)}</b><span>${esc(x.name)}</span></div>`}).join('')}</div><p class="key">${T('Cada moeda','Each coin')} = ${esc(c.unitLabel)}</p>${txt(c)}${foot(c)}`};
R.scale=c=>`${head(c)}<div class="scl"><svg viewBox="0 0 320 150" aria-hidden="true"><polygon class="base" points="160,92 140,140 180,140"/><g class="beam" data-t="${c.tilt||0}"><line x1="30" y1="92" x2="290" y2="92"/><circle cx="160" cy="92" r="6"/><g class="pan l"><line x1="40" y1="92" x2="40" y2="118"/><path d="M8 118 h64 a32 14 0 0 1 -64 0z"/>${c.left.icon?`<foreignObject x="28" y="94" width="24" height="24"><div class="pi">${ic(c.left.icon)}</div></foreignObject>`:`<text x="40" y="112">${c.left.emo}</text>`}</g><g class="pan r"><line x1="280" y1="92" x2="280" y2="118"/><path d="M248 118 h64 a32 14 0 0 1 -64 0z"/>${c.right.icon?`<foreignObject x="268" y="94" width="24" height="24"><div class="pi">${ic(c.right.icon)}</div></foreignObject>`:`<text x="280" y="112">${c.right.emo}</text>`}</g></g></svg>
 <div class="sides"><div><b>${c.left.title}</b><p>${c.left.text}</p></div><div><b>${c.right.title}</b><p>${c.right.text}</p></div></div></div>${txt(c)}${foot(c)}`;
R.iso=c=>`${head(c)}<div class="iso${c.stack?' stk2':''}">${c.rows.map(r=>{if(r.head)return `<div class="ih">${esc(r.head)}</div>`;let h='';(r.parts||[r]).forEach(q=>{h+=icn(q.icon||r.icon||c.icon,q.n,q.color||'var(--accent)')});if(r.ghost)h+=icn(r.icon||c.icon,r.ghost,'',1);return `<div class="row" data-tip="${esc((r.name?r.name+': ':'')+r.value)}"><b class="nm">${esc(r.name||'')}</b><div class="icons" style="font-size:${r.size||c.size||24}px">${h}</div><span class="vl">${esc(r.value||'')}</span></div>`}).join('')}</div>${c.key?`<p class="key">${(Array.isArray(c.key)?c.key:[c.key]).map(k=>`<span>${ic(k.icon,'',`color:${k.color||'var(--muted)'}`)} = ${esc(k.text)}</span>`).join('')}</p>`:''}${txt(c)}${foot(c)}`;
R.isogrid=c=>{let h='';c.groups.forEach(g=>{for(let i=0;i<g.n;i++)h+=`<span class="gi" data-tip="${esc(g.name+': '+g.value)}">${ic(g.icon,'on',`color:${g.color}`)}</span>`});return `${head(c)}<div class="isog" style="font-size:${c.size||30}px">${h}</div><div class="isol">${c.groups.map(g=>`<div>${ic(g.icon,'',`color:${g.color}`)}<b>${esc(g.name)}</b><span>${esc(g.value)}</span></div>`).join('')}</div>${c.key?`<p class="key">${ic(c.key.icon,'',`color:var(--muted)`)} = ${esc(c.key.text)}</p>`:''}${txt(c)}${foot(c)}`};
R.text=c=>`${c.emo?`<span class="emo" aria-hidden="true">${c.emo}</span>`:''}${head(c)}${txt(c)}${foot(c)}`;

// build
const root=document.getElementById('rv');
root.innerHTML=D.cards.map(c=>`<section class="cd k ${c.span||'s4'}${c.rows===2?' r2':''}${c.type==='hero'?' hero':''}${c.type==='big'?' big':''}" ${c.style?`style="${c.style}"`:''}>${R[c.type](c)}</section>`).join('')+
 `<div class="rvfoot"><span>${esc(D.updated||'')}</span><button type="button" id="rvagain">▶ ${T('Ver a animação de novo','Play the animation again')}</button><span><a href="${D.full||'index.html'}">${T('Todas as fontes e os detalhes estão na versão completa →','All sources and details are in the full version →')}</a></span></div>`;

// animate
function countUp(el){const v=+el.dataset.count,dec=+el.dataset.dec||0,pre=el.dataset.pre||'',suf=el.dataset.suf||'';
 if(reduce){el.textContent=pre+fmt(v,dec)+suf;return}
 const t0=performance.now(),dur=1300;const step=t=>{const k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=pre+fmt(v*e,dec)+suf;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step);}
const G=!reduce&&window.gsap?window.gsap:null;
if(G){window.ScrollTrigger&&G.registerPlugin(window.ScrollTrigger);root.classList.add('gs')}
function play(card){
 card.classList.add('in');
 card.querySelectorAll('[data-count]').forEach(countUp);
 card.querySelectorAll('.bar .f,.gv .jr .f').forEach(f=>f.style.width=f.dataset.w+'%');
 card.querySelectorAll('.gv .col i').forEach(i=>i.style.height=i.dataset.h+'%');
 card.querySelectorAll('.stk i').forEach(i=>i.style.flexBasis=i.dataset.b+'%');
 card.querySelectorAll('.waf i[data-c]').forEach(i=>i.style.background=i.dataset.c);
 card.querySelectorAll('.lc .ln').forEach(p=>p.style.strokeDashoffset=0);
 card.querySelectorAll('.lc .ar,.lc .pt,.lc .vl').forEach(p=>p.style.opacity=p.classList.contains('ar')?'':1);
 card.querySelectorAll('.gauge .val').forEach(p=>p.style.strokeDashoffset=p.dataset.off);
 if(!G){card.querySelectorAll('.ndl').forEach(n=>n.style.transform=`rotate(${n.dataset.a}deg)`);card.querySelectorAll('.beam').forEach(b=>b.style.transform=`rotate(${b.dataset.t}deg)`);return}
 // GSAP flair
 G.fromTo(card,{opacity:0,y:46,rotationX:-12,transformPerspective:900},{opacity:1,y:0,rotationX:0,duration:.9,ease:'back.out(1.4)',clearProps:'transform'});
 const chs=card.querySelectorAll('.hero .ch');if(chs.length)G.fromTo(chs,{yPercent:110,opacity:0,rotation:8},{yPercent:0,opacity:1,rotation:0,duration:.6,ease:'back.out(2)',stagger:.025,delay:.15});
 card.querySelectorAll('.hero .ans,.hero .go').forEach((e,i)=>G.fromTo(e,{opacity:0,y:16},{opacity:1,y:0,duration:.6,delay:.7+i*.15}));
 card.querySelectorAll('.waf').forEach((w,wi)=>G.fromTo(w.children,{scale:0},{scale:1,duration:.45,ease:'back.out(3)',delay:wi*.25,stagger:{grid:[10,10],from:'center',amount:.9}}));
 card.querySelectorAll('.ndl').forEach(n=>G.fromTo(n,{rotation:-90,svgOrigin:'100 105'},{rotation:+n.dataset.a,svgOrigin:'100 105',duration:2.2,ease:'elastic.out(1,.32)',delay:.3}));
 card.querySelectorAll('.beam').forEach(b=>G.fromTo(b,{rotation:-16,svgOrigin:'160 92'},{rotation:+b.dataset.t,svgOrigin:'160 92',duration:2.6,ease:'elastic.out(1,.25)',delay:.4}));
 card.querySelectorAll('.pile').forEach((p,pi)=>G.fromTo(p.children,{y:-220,opacity:0},{y:0,opacity:1,duration:.7,ease:'bounce.out',delay:.2+pi*.35,stagger:{each:.035,from:'start'}}));
 card.querySelectorAll('.flow .st').forEach((s,i)=>G.fromTo(s,{scale:.3,opacity:0},{scale:1,opacity:1,duration:.6,ease:'back.out(2.5)',delay:.2+i*.25,clearProps:'transform'}));
 card.querySelectorAll('.iso .icons').forEach((w,wi)=>G.fromTo(w.children,{scale:0,y:-14},{scale:1,y:0,duration:.35,ease:'back.out(3)',delay:.2+wi*.18,stagger:Math.min(.035,1.2/Math.max(w.children.length,1))}));
 card.querySelectorAll('.isog').forEach(w=>G.fromTo(w.children,{scale:0,rotation:-25},{scale:1,rotation:0,duration:.45,ease:'back.out(3)',delay:.2,stagger:{each:.05,from:'random'}}));
 card.querySelectorAll('.hfl .f').forEach((f,i)=>{G.fromTo(f,{opacity:0,scale:.4},{opacity:.16,scale:1,duration:1,delay:.2+i*.08});G.to(f,{y:'random(-18,18)',x:'random(-14,14)',rotation:'random(-20,20)',duration:'random(3,5)',repeat:-1,yoyo:true,ease:'sine.inOut',delay:1})});
 card.querySelectorAll('.bdg').forEach((b,i)=>G.fromTo(b,{scale:0,rotation:-12},{scale:1,rotation:0,duration:.5,ease:'back.out(3)',delay:.3+i*.14}));
 card.querySelectorAll('.big .n,.cmp .side b,.cl').forEach(n=>G.fromTo(n,{scale:.6},{scale:1,duration:1,ease:'elastic.out(1,.5)'}));
 card.querySelectorAll('.lc svg').forEach(svg=>{const p=svg.querySelector('.ln');if(!p)return;const L=p.getTotalLength();const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','8');dot.setAttribute('class','flw');svg.appendChild(dot);const o={t:0};G.to(o,{t:1,duration:1.6,delay:.2,ease:'power2.inOut',onUpdate:()=>{const pt=p.getPointAtLength(o.t*L);dot.setAttribute('cx',pt.x);dot.setAttribute('cy',pt.y)}})});
}
const cards=[...root.querySelectorAll('.cd')];
if(reduce){cards.forEach(play)}
else if(G&&window.ScrollTrigger){cards.forEach((c,i)=>window.ScrollTrigger.create({trigger:c,start:'top 90%',once:true,onEnter:()=>setTimeout(()=>play(c),Math.min(i,6)*90)}))}
else if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);const i=cards.indexOf(e.target);setTimeout(()=>play(e.target),Math.min(i,8)*110)}}),{threshold:.15});cards.forEach(c=>io.observe(c))}
else cards.forEach(play);
document.getElementById('rvagain').addEventListener('click',()=>{try{history.scrollRestoration='manual'}catch(e){}scrollTo(0,0);location.reload()});
// tooltip
const tip=document.createElement('div');tip.className='tip';document.body.appendChild(tip);
root.addEventListener('pointerover',e=>{const t=e.target.closest('[data-tip]');if(!t)return;tip.textContent=t.dataset.tip;tip.classList.add('on')});
root.addEventListener('pointermove',e=>{if(!tip.classList.contains('on'))return;const x=Math.min(e.clientX+14,innerWidth-tip.offsetWidth-8);tip.style.left=x+'px';tip.style.top=(e.clientY+16)+'px'});
root.addEventListener('pointerout',e=>{if(e.target.closest('[data-tip]'))tip.classList.remove('on')});
})();
