const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],au=$('#au');
const fmt=t=>isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
let rep=false,liked=false,speeds=[1,1.25,1.5,.75],si=0;
function tab(n){$$('.page').forEach(p=>p.classList.toggle('on',p.id==='p-'+n));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===n))}
$$('nav button').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function toggle(){au.paused?au.play().catch(()=>{}):au.pause()}
function openFull(){$('#full').classList.add('on')}
$('#mini').onclick=openFull;$('#mini').onkeydown=e=>{if(e.key==='Enter')openFull()};
$('#mplay').onclick=e=>{e.stopPropagation();toggle()};
$('#close').onclick=()=>$('#full').classList.remove('on');
$('#play').onclick=toggle;
function sync(){const p=!au.paused;$('#mplay').textContent=p?'⏸':'▶';$('#play').innerHTML=p?PAUSE:PLAY;$('#full').classList.toggle('playing',p)}
au.onplay=au.onpause=sync;
au.onloadedmetadata=()=>{$('#dur').textContent=fmt(au.duration);$('#seek').max=au.duration};
au.ontimeupdate=()=>{$('#cur').textContent=fmt(au.currentTime);$('#seek').value=au.currentTime;$('#mbar').style.width=(au.currentTime/au.duration*100||0)+'%'};
au.onended=()=>{if(rep){au.currentTime=0;au.play()}else if(AUTO&&Q.length>1)step(1);else sync()};
$('#seek').oninput=e=>au.currentTime=+e.target.value;
$('#back').onclick=()=>step(-1);
$('#fwd').onclick=()=>step(1);
$('#rep').onclick=e=>{rep=!rep;e.currentTarget.classList.toggle('on',rep)};
$('#spd').onclick=e=>{si=(si+1)%speeds.length;au.playbackRate=speeds[si];e.currentTarget.textContent=speeds[si]+'x'};
$('#vol').oninput=e=>{au.volume=+e.target.value;$('#vp').textContent=Math.round(e.target.value*100)+'%'};
$('#like').onclick=e=>{liked=!liked;e.currentTarget.classList.toggle('on',liked);e.currentTarget.textContent=liked?'♥':'♡'};
$$('.seg button').forEach(b=>b.onclick=()=>{$$('.seg button').forEach(x=>x.classList.toggle('on',x===b));const l=b.dataset.v==='lyr';$('#cv').style.display=l?'none':'grid';$('#lyr').style.display=l?'flex':'none'});
$('#lt').oninput=e=>{try{localStorage.setItem('lyr:'+SONGS[cur].t,e.target.value)}catch(x){}};
const SONGS=[];let cur=0,Q=SONGS;
function load(i,play){if(!SONGS.length){$('#mini').style.display='none';au.removeAttribute('src');return}$('#mini').style.display='';cur=(i+SONGS.length)%SONGS.length;const s=SONGS[cur],bg=s.img?'url('+s.img+') center/cover':'';
au.src=s.src;au.playbackRate=speeds[si];$('#mt').textContent=$('#ft').textContent=s.t;$('#mar').textContent=$('#fa').textContent=s.a;
$('#ma').style.background=bg;$('#cv').style.background=bg;$('#cv i').style.display=s.img?'none':'';
$('#lt').value='';try{$('#lt').value=localStorage.getItem('lyr:'+s.t)||''}catch(e){}
if(play)au.play().catch(()=>{})}
function rows(box,list){box.innerHTML='';list.forEach(s=>{const b=document.createElement('button');b.className='row';b.style.marginBottom='8px';
b.innerHTML='<div class="art" style="'+(s.img?'background:url('+s.img+') center/cover':'')+'"></div><div><b></b><span></span></div>';
b.querySelector('b').textContent=s.t;b.querySelector('span').textContent=s.a;b.onclick=()=>{Q=list;load(SONGS.indexOf(s),true);openFull()};box.appendChild(b)})}
rows($('#hl'),SONGS);$('#cnt').textContent=SONGS.length+' lagu tersimpan';load(0,false);

function step(d){let k=Q.indexOf(SONGS[cur]);if(k<0)k=0;load(SONGS.indexOf(Q[(k+d+Q.length)%Q.length]),true)}
let PL={},op=null;try{PL=JSON.parse(localStorage.getItem('pl')||'{}')}catch(e){}
const sv=()=>{try{localStorage.setItem('pl',JSON.stringify(PL))}catch(e){}};
const ps=n=>(PL[n]||[]).map(t=>SONGS.find(s=>s.t===t)).filter(Boolean);
function plRender(){if(op&&!PL[op])op=null;$('#pd').hidden=!op;$('#pls').hidden=$('#pcr').hidden=!!op;
if(!op){const b=$('#pls');b.innerHTML='';const ks=Object.keys(PL);if(!ks.length)b.innerHTML='<p class="empty">Belum ada playlist. Buat satu di atas.</p>';
ks.forEach(k=>{const x=document.createElement('button');x.className='row';x.style.marginBottom='8px';x.innerHTML='<div class="art"></div><div><b></b><span></span></div>';x.querySelector('b').textContent=k;x.querySelector('span').textContent=ps(k).length+' lagu';x.onclick=()=>{op=k;plRender()};b.appendChild(x)});return}
$('#pt').textContent=op;const l=ps(op);rows($('#pi'),l);if(!l.length)$('#pi').innerHTML='<p class="empty">Playlist kosong. Buka pemutar lalu tekan ＋ Playlist untuk menambah lagu.</p>'}
$('#pc').onclick=()=>{const n=$('#pn').value.trim();if(!n||PL[n])return;PL[n]=[];sv();$('#pn').value='';plRender()};
$('#pb').onclick=()=>{op=null;plRender()};
$('#pp').onclick=()=>{const l=ps(op);if(!l.length)return;Q=l;load(SONGS.indexOf(l[0]),true);openFull()};
$('#px').onclick=()=>{delete PL[op];op=null;sv();plRender()};
function sheet(){const h=$('#sheet');h.hidden=false;h.innerHTML='<h2 style="margin-top:0">Tambah ke playlist</h2>';const t=SONGS[cur].t,ks=Object.keys(PL);
if(!ks.length)h.innerHTML+='<p class="empty">Belum ada playlist. Buat dulu di tab Playlist.</p>';
ks.forEach(k=>{const b=document.createElement('button');b.className='row';b.style.marginBottom='8px';const has=PL[k].includes(t);b.textContent=(has?'✓ ':'＋ ')+k;b.onclick=()=>{PL[k]=has?PL[k].filter(x=>x!==t):[...PL[k],t];sv();sheet();plRender()};h.appendChild(b)});
const c=document.createElement('button');c.className='pill';c.textContent='Selesai';c.onclick=()=>h.hidden=true;h.appendChild(c)}
$('#addpl').onclick=sheet;plRender();

function refresh(){rows($('#hl'),SONGS);$('#cnt').textContent=SONGS.length+' lagu tersimpan';if(!SONGS.length)$('#hl').innerHTML='<p class="empty">Belum ada lagu. Tekan ＋ Tambah lagu untuk memulai.</p>';else if(!au.getAttribute('src'))load(0,false)}
const DB=()=>new Promise((res,rej)=>{const r=indexedDB.open('riki',1);r.onupgradeneeded=()=>r.result.createObjectStore('s',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
async function dbAll(){const d=await DB();return new Promise((res,rej)=>{const q=d.transaction('s').objectStore('s').getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function dbPut(o){const d=await DB();return new Promise((res,rej)=>{const q=d.transaction('s','readwrite').objectStore('s').add(o);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
async function dbDel(id){const d=await DB();return new Promise((res,rej)=>{const t=d.transaction('s','readwrite');t.objectStore('s').delete(id);t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})}
const _load=load;load=(i,p)=>{_load(i,p);$('#del').hidden=$('#edit').hidden=!(SONGS[cur]&&SONGS[cur].id);$('#del').textContent='Hapus lagu ini'};
$('#addsong').onclick=()=>$('#fi').click();
$('#fi').onchange=async e=>{const fs=[...e.target.files];let ok=0,tmp=0;
for(const f of fs){const t=f.name.replace(/\.[^.]+$/,'').replace(/_?spotdown_org/i,'').replace(/_+/g,' ').trim()||'Tanpa judul';
const s={t,a:'Lagu saya',src:URL.createObjectURL(f),img:null};
try{s.id=await dbPut({t,a:s.a,blob:f});ok++}catch(x){tmp++}SONGS.push(s)}
e.target.value='';refresh();
$('#msg').textContent=(ok?ok+' lagu ditambahkan dan tersimpan di perangkat. ':'')+(tmp?tmp+' lagu hanya sementara karena penyimpanan browser tidak bisa dipakai.':'')};
$('#del').onclick=async e=>{const b=e.currentTarget,s=SONGS[cur];if(!s.id)return;
if(b.textContent!=='Yakin hapus?'){b.textContent='Yakin hapus?';return}
try{await dbDel(s.id)}catch(x){}
for(const k in PL)PL[k]=PL[k].filter(t=>t!==s.t);sv();au.pause();SONGS.splice(cur,1);Q=SONGS;
load(Math.min(cur,SONGS.length-1),false);refresh();plRender();$('#msg').textContent='Lagu dihapus.'};
dbAll().then(l=>{l.forEach(o=>SONGS.push({id:o.id,t:o.t,a:o.a,src:URL.createObjectURL(o.blob),img:o.img||null}));refresh();plRender()}).catch(()=>{});

async function dbUpd(id,ch){const d=await DB();return new Promise((res,rej)=>{const tx=d.transaction('s','readwrite'),os=tx.objectStore('s'),g=os.get(id);g.onsuccess=()=>{if(g.result)os.put({...g.result,...ch})};tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}
function toCover(f){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const c=document.createElement('canvas'),z=400,m=Math.min(im.width,im.height);c.width=c.height=z;c.getContext('2d').drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,z,z);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.85))};im.onerror=()=>rej(new Error('img'));im.src=u})}
$('#edit').onclick=()=>{const s=SONGS[cur],h=$('#sheet');h.hidden=false;
h.innerHTML='<h2 style="margin-top:0">Edit lagu</h2><label style="font-size:12px;color:var(--mut)">Judul</label><input class="inp" id="et"><label style="font-size:12px;color:var(--mut)">Artis</label><input class="inp" id="ea"><label style="font-size:12px;color:var(--mut)">Foto cover (opsional)</label><input class="inp" type="file" id="ef" accept="image/*"><p id="em" style="font-size:12px;color:var(--mut);margin-bottom:8px"></p><div style="display:flex;gap:8px"><button class="pill" id="es">Simpan</button><button class="pill" id="ex">Batal</button></div>';
$('#et').value=s.t;$('#ea').value=s.a;$('#ex').onclick=()=>h.hidden=true;
$('#es').onclick=async()=>{const t=$('#et').value.trim()||s.t,a=$('#ea').value.trim()||'Lagu saya',f=$('#ef').files[0];let img=s.img;
if(f){try{img=await toCover(f)}catch(x){$('#em').textContent='Foto tidak bisa dibaca. Pilih file gambar lain.';return}}
if(t!==s.t){try{const L=localStorage.getItem('lyr:'+s.t);if(L!==null){localStorage.setItem('lyr:'+t,L);localStorage.removeItem('lyr:'+s.t)}}catch(x){}
for(const k in PL)PL[k]=PL[k].map(n=>n===s.t?t:n);sv()}
Object.assign(s,{t,a,img});try{await dbUpd(s.id,{t,a,img})}catch(x){}
const bg=img?'url('+img+') center/cover':'';$('#mt').textContent=$('#ft').textContent=t;$('#mar').textContent=$('#fa').textContent=a;
$('#ma').style.background=bg;$('#cv').style.background=bg;$('#cv i').style.display=img?'none':'';
h.hidden=true;refresh();plRender();setBg()}};

const PLAY='<svg viewBox="0 0 24 24" width="58" height="58" fill="currentColor"><path d="M6 3.5v17l14-8.5z"/></svg>',PAUSE='<svg viewBox="0 0 24 24" width="58" height="58" fill="currentColor"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>';
const pf=el=>el.style.setProperty('--p',((el.value-el.min)/(el.max-el.min)*100||0)+'%');
function colorOf(s){return new Promise(res=>{const h=[...s.t].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7),hu=Math.abs(h)%360,d=['hsl('+hu+',38%,46%)','hsl('+hu+',48%,18%)'];if(!s.img)return res(d);
const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(im,0,0,8,8);const p=x.getImageData(0,0,8,8).data;let r=0,g=0,b=0;for(let i=0;i<p.length;i+=4){r+=p[i];g+=p[i+1];b+=p[i+2]}r/=64;g/=64;b/=64;
res(['rgb('+(r*.85|0)+','+(g*.85|0)+','+(b*.85|0)+')','rgb('+(r*.35|0)+','+(g*.35|0)+','+(b*.35|0)+')'])};im.onerror=()=>res(d);im.src=s.img})}
function setBg(){const s=SONGS[cur];if(!s)return;$('#ft2').textContent=s.t;$('#fa2').textContent=s.a;$('#ma2').style.background=s.img?'url('+s.img+') center/cover':'';
colorOf(s).then(([a,b])=>{const f=$('#full');f.style.setProperty('--c1',a);f.style.setProperty('--c2',b)})}
let LY={timed:false,l:[]};
function lyParse(){const raw=$('#lt').value.split('\n').map(x=>x.trim()).filter(Boolean),T=raw.map(x=>x.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/)).filter(Boolean);
if(T.length>1)return{timed:true,l:T.map(m=>({t:+m[1]*60+ +m[2],x:m[3]})).filter(o=>o.x).sort((a,b)=>a.t-b.t)};
return{timed:false,l:raw.map(x=>({x:x.replace(/\[[^\]]*\]/g,'').trim()})).filter(o=>o.x)}}
let LI=-2,OFF=0;
function llRender(){const b=$('#ll');b.innerHTML='';LY.l.forEach(o=>{const d=document.createElement('div');d.textContent=o.x;d.style.cssText='padding:6px 0;font-size:18px;font-weight:700;opacity:.4';b.appendChild(d)});
const B=$('#lbig');B.innerHTML='';LY.l.forEach(o=>{const d=document.createElement('div');d.className='bl';d.textContent=o.x;d.onclick=()=>{if(LY.timed&&o.t!==undefined)au.currentTime=o.t};B.appendChild(d)})}
function lyShow(){const l=LY.l;let t='',i=-1;if(l.length){i=0;if(LY.timed){for(let k=0;k<l.length;k++)if(l[k].t<=au.currentTime+OFF)i=k}else i=Math.min(l.length-1,Math.floor(au.currentTime/(au.duration||1)*l.length));t=l[i].x}
$('#lp').textContent=t;if(i!==LI){LI=i;[...$('#ll').children].forEach((d,k)=>{d.style.opacity=k===i?1:.4;if(k===i&&$('#lyr').style.display==='flex')d.scrollIntoView({block:'center',behavior:'smooth'})});const B=$('#lbig');[...B.children].forEach((d,k)=>{d.classList.toggle('on',k===i);if(k===i&&!$('#vB').hidden)B.scrollTo({top:Math.max(0,d.offsetTop-B.clientHeight/3),behavior:'smooth'})})}}
function lyUp(){LY=lyParse();LI=-2;llRender();lyShow()}
const _l2=load;load=(i,p)=>{_l2(i,p);setBg();lyUp();pf($('#seek'))};
$('#lt').addEventListener('input',lyUp);
au.addEventListener('timeupdate',()=>{$('#dur').textContent='-'+fmt(au.duration-au.currentTime);pf($('#seek'));lyShow()});
au.addEventListener('loadedmetadata',()=>{$('#dur').textContent='-'+fmt(au.duration)});
$('#vol').addEventListener('input',e=>pf(e.target));pf($('#vol'));
$('#lb').onclick=()=>$('#lyr').style.display='flex';$('#lc').onclick=()=>$('#lyr').style.display='none';
function openPhoto(){const s=SONGS[cur];if(!s)return;const im=$('#pimg');im.style.background=s.img?'url('+s.img+') center/cover':'';im.querySelector('i').style.display=s.img?'none':'';
const c=$('#pcap');c.innerHTML='';const b=document.createElement('b'),a=document.createElement('div');b.textContent=s.t;a.textContent=s.a;a.style.cssText='font-size:13px;opacity:.7;margin-top:2px';c.append(b,a);$('#photo').hidden=false}
$('#cv').onclick=openPhoto;$('#cv').onkeydown=e=>{if(e.key==='Enter')openPhoto()};$('#photo').onclick=()=>$('#photo').hidden=true;

const fin=h=>{const c=document.createElement('button');c.className='pill';c.textContent='Selesai';c.onclick=()=>h.hidden=true;h.appendChild(c)};
let FAV=[],AUTO=true;try{FAV=JSON.parse(localStorage.getItem('fav')||'[]');AUTO=localStorage.getItem('auto')!=='0'}catch(e){}
function likeUp(){const l=!!SONGS[cur]&&FAV.includes(SONGS[cur].t);$('#like').classList.toggle('on',l);$('#like').textContent=l?'♥':'♡'}
$('#like').onclick=()=>{const t=SONGS[cur].t;FAV=FAV.includes(t)?FAV.filter(x=>x!==t):[...FAV,t];try{localStorage.setItem('fav',JSON.stringify(FAV))}catch(e){}likeUp()};
const _l3=load;load=(i,p)=>{_l3(i,p);likeUp()};
function setAuto(v){AUTO=v;try{localStorage.setItem('auto',v?'1':'0')}catch(e){}$('#an').textContent=v?'Aktif':'Mati'}
$('#an').onclick=()=>setAuto(!AUTO);setAuto(AUTO);
function qrun(){const v=$('#q').value.trim().toLowerCase(),r=SONGS.filter(s=>(s.t+' '+s.a).toLowerCase().includes(v));rows($('#res'),r);if(!r.length)$('#res').innerHTML='<p class="empty">'+(v?'Tidak ada lagu yang cocok.':'Belum ada lagu. Tambahkan dulu di Beranda.')+'</p>'}
$('#qb').onclick=qrun;$('#q').oninput=qrun;
function offRender(){const b=$('#ol');b.innerHTML='';$('#oc').textContent=SONGS.length+' lagu tersimpan';if(!SONGS.length)b.innerHTML='<p class="empty">Belum ada lagu offline.</p>';
SONGS.forEach((s,n)=>{const d=document.createElement('div');d.className='row';d.style.marginBottom='8px';const g=document.createElement('button');g.style.cssText='display:flex;gap:12px;align-items:center;flex:1;text-align:left;min-width:0';
g.innerHTML='<div class="art" style="'+(s.img?'background:url('+s.img+') center/cover':'')+'"></div><div><b></b><span></span></div>';g.querySelector('b').textContent=s.t;g.querySelector('span').textContent=s.a;g.onclick=()=>{Q=SONGS;load(n,true);openFull()};
const x=document.createElement('button');x.textContent='🗑';x.setAttribute('aria-label','Hapus '+s.t);x.onclick=()=>rmSong(s);d.append(g,x);b.appendChild(d)})}
$('#oa').onclick=()=>{if(SONGS.length){Q=SONGS;load(0,true);openFull()}};
async function rmSong(s){if(s.id)try{await dbDel(s.id)}catch(e){}const c=SONGS[cur];SONGS.splice(SONGS.indexOf(s),1);for(const k in PL)PL[k]=PL[k].filter(t=>t!==s.t);sv();Q=SONGS;
if(c===s||!SONGS.length){au.pause();load(0,false)}else cur=SONGS.indexOf(c);refresh();plRender()}
const _rf=refresh;refresh=()=>{_rf();qrun();offRender()};refresh();
const _tb=tab;tab=n=>{_tb(n);if(n==='me')$('#lc2').textContent=Object.keys(localStorage).filter(k=>k.startsWith('lyr:')).length};
$('#cc').onclick=e=>{const b=e.currentTarget;if(b.textContent!=='Yakin hapus?'){b.textContent='Yakin hapus?';return}Object.keys(localStorage).filter(k=>k.startsWith('lyr:')).forEach(k=>localStorage.removeItem(k));b.textContent='Bersihkan lirik tersimpan';$('#lc2').textContent=0;$('#lt').value='';lyUp()};
$('#le').onclick=()=>{const e=$('#lt').hidden;$('#lt').hidden=!e;$('#ll').hidden=e;$('#le').textContent=e?'Lihat lirik':'Edit lirik'};
const so=()=>$('#so').textContent='Sync '+(OFF>0?'+':'')+OFF.toFixed(1)+'s';$('#sm').onclick=()=>{OFF-=.5;so();lyShow()};$('#sp').onclick=()=>{OFF+=.5;so();lyShow()};
const EQN=['Normal','Bass','Vokal','Treble'],EQG=[[0,0,0],[8,0,-2],[-3,4,2],[-2,0,8]],TM=[0,15,30,60];let eqi=0,ac,fl,ti=0,tmr=null;
function eqSet(i){eqi=i;try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();const s=ac.createMediaElementSource(au);fl=[['lowshelf',200],['peaking',1500],['highshelf',5000]].map(([t,f])=>{const b=ac.createBiquadFilter();b.type=t;b.frequency.value=f;return b});s.connect(fl[0]);fl[0].connect(fl[1]);fl[1].connect(fl[2]);fl[2].connect(ac.destination)}ac.resume();fl.forEach((b,k)=>b.gain.value=EQG[i][k])}catch(e){}}
function timer(){ti=(ti+1)%TM.length;clearTimeout(tmr);tmr=null;if(TM[ti])tmr=setTimeout(()=>{au.pause();ti=0;tmr=null},TM[ti]*6e4)}
function queue(){const h=$('#sheet');h.innerHTML='<h2 style="margin-top:0">Antrean</h2>';Q.forEach(s=>{const b=document.createElement('button');b.className='row';b.style.marginBottom='8px';b.textContent=(s===SONGS[cur]?'▶ ':'')+s.t+' — '+s.a;b.onclick=()=>{load(SONGS.indexOf(s),true);h.hidden=true};h.appendChild(b)});fin(h)}
async function share(){const s=SONGS[cur];try{await navigator.share({title:s.t,text:s.t+' — '+s.a})}catch(e){}}
async function dl(){const s=SONGS[cur];try{const b=await(await fetch(s.src)).blob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=s.t+'.'+(b.type.split('/')[1]||'mp3').replace('mpeg','mp3');a.click()}catch(e){}}
function opts(){const h=$('#sheet');h.hidden=false;h.innerHTML='<h2 style="margin-top:0">Opsi</h2><div class="og"></div>';const g=h.querySelector('.og'),own=!!(SONGS[cur]&&SONGS[cur].id);
const it=[['Auto Next: '+(AUTO?'Aktif':'Mati'),()=>{setAuto(!AUTO);opts()}],['EQ: '+EQN[eqi],()=>{eqSet((eqi+1)%EQN.length);opts()}],['Timer: '+(TM[ti]?TM[ti]+' mnt':'Mati'),()=>{timer();opts()}],['Ulangi: '+(rep?'Aktif':'Mati'),()=>{$('#rep').click();$('#r2').classList.toggle('on',rep);opts()}],['Kecepatan: '+speeds[si]+'x',()=>{$('#spd').click();$('#s2').textContent=$('#spd').textContent;opts()}],['＋ Playlist',()=>$('#addpl').click()],['Antrean',queue],['Alat lirik',()=>{h.hidden=true;$('#lb').click()}],['Bagikan',share],['Unduh',dl]];
if(own)it.push(['Edit judul, artis & foto',()=>$('#edit').click()],[$('#del').textContent,()=>{$('#del').click();opts()}]);
it.forEach(([t,f])=>{const b=document.createElement('button');b.className='row';b.style.justifyContent='center';b.textContent=t;b.onclick=f;g.appendChild(b)});fin(h)}
$('#opt').onclick=opts;
function alignLines(d,sr,lens){const w=Math.floor(sr*.05),n=Math.floor(d.length/w),e=new Float32Array(n);
for(let i=0;i<n;i++){let s=0;for(let j=i*w+1;j<(i+1)*w;j++){const x=d[j]-d[j-1];s+=x*x}e[i]=Math.sqrt(s/w)}
const m=new Float32Array(n),nv=new Float32Array(n),K=6;
for(let i=0;i<n;i++){let s=0,c=0;for(let j=Math.max(0,i-K);j<=Math.min(n-1,i+K);j++){s+=e[j];c++}m[i]=s/c}
for(let i=10;i<n;i++){let a=0;for(let j=i-10;j<i;j++)a+=m[j];nv[i]=Math.max(0,m[i]-a/10)}
const pct=(a,q)=>[...a].sort((x,y)=>x-y)[Math.floor(q*(a.length-1))],med=pct(m,.5),t1=pct(nv,.8),t2=pct(nv,.6);
let st=60;while(st<n&&!(nv[st]>t1))st++;let en=n-1;while(en>0&&m[en]<.6*med)en--;
st*=.05;en=Math.max(st+10,en*.05);
const cd=[];for(let i=1;i<n-1;i++)if(nv[i]>t2&&nv[i]>=nv[i-1]&&nv[i]>=nv[i+1])cd.push([i*.05,nv[i]]);
cd.sort((a,b)=>b[1]-a[1]);const ok=[];for(const[t]of cd)if(ok.every(x=>Math.abs(x-t)>1.2))ok.push(t);ok.sort((a,b)=>a-b);
const tot=lens.reduce((a,b)=>a+b,0);let cum=0,last=-9;
return lens.map(L=>{let t=st+(en-st)*cum/tot;cum+=L;let b=null,bd=1.5;for(const c of ok){const dd=Math.abs(c-t);if(dd<bd){bd=dd;b=c}}if(b!==null)t=b;if(t<last+.8)t=last+.8;last=t;return t})}

let TP=null;const lines=()=>$('#lt').value.split('\n').map(x=>x.replace(/\[[^\]]*\]\s*/g,'').trim()).filter(Boolean);
const lrc=(t,x)=>'['+String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(2).padStart(5,'0')+'] '+x,note=t=>$('#ln').textContent=t;
function setLrc(a,tm){$('#lt').value=a.map((x,i)=>lrc(tm[i],x)).join('\n');$('#lt').dispatchEvent(new Event('input'))}
$('#la').onclick=async()=>{const r=lines();if(r.length<2)return note('Tempel minimal 2 baris lirik dulu (tombol Edit lirik).');note('Menganalisis audio...');
try{const c=new(window.AudioContext||window.webkitAudioContext)(),b=await c.decodeAudioData(await(await fetch(SONGS[cur].src)).arrayBuffer());c.close();
setLrc(r,alignLines(b.getChannelData(0),b.sampleRate,r.map(x=>Math.max(x.length,8))));note('Selesai. Geser dengan Sync −/+ kalau kurang pas.')}catch(e){note('Gagal menganalisis audio. Coba Tap sinkron.')}};
$('#lt2').onclick=()=>{const b=$('#lt2');if(!TP){const r=lines();if(r.length<2)return note('Tempel minimal 2 baris lirik dulu (tombol Edit lirik).');TP={r,t:[]};au.currentTime=0;au.play().catch(()=>{})}else TP.t.push(au.currentTime);
if(TP.t.length>=TP.r.length){setLrc(TP.r,TP.t);TP=null;b.textContent='Tap sinkron';note('Selesai. Lirik sudah sinkron.');return}
b.textContent='⏺ Tandai: '+TP.r[TP.t.length].slice(0,24);note('Tekan tombol ini tepat saat baris itu mulai dinyanyikan.')};
$('#lc').addEventListener('click',()=>{TP=null;$('#lt2').textContent='Tap sinkron'});

const put=v=>{$('#lt').value=v;$('#lt').dispatchEvent(new Event('input'))};
$('#lw').onclick=async()=>{const s=SONGS[cur],q=new URLSearchParams({track_name:s.t});if(s.a&&s.a!=='Lagu saya')q.set('artist_name',s.a);note('Mencari lirik sinkron...');
try{const a=await(await fetch('https://lrclib.net/api/search?'+q)).json(),h=a.find(x=>x.syncedLyrics);
if(!h)return note('Lirik sinkron tidak ditemukan. Cek judul dan artis lewat Edit judul, artis & foto.');put(h.syncedLyrics);note('Ditemukan: '+h.trackName+' — '+h.artistName)}
catch(e){note('Tidak bisa terhubung. Fitur ini butuh internet dan hanya jalan di file HTML yang diunduh.')}};
$('#li').onclick=()=>$('#lf').click();
$('#lf').onchange=async e=>{const f=e.target.files[0];if(!f)return;put(await f.text());e.target.value='';note('File lirik dimuat.')};

const tf=t=>Math.floor(t/60)+':'+(t%60).toFixed(1).padStart(4,'0');
function tlSave(L){setLrc(L.map(o=>o.x),L.map(o=>o.t))}
function tlRender(){const b=$('#tlb'),L=LY.timed?LY.l:[],sc=b.scrollTop;b.innerHTML='';$('#tlm').innerHTML='';
if(!L.length){b.innerHTML='<p class="empty">Lirik belum bertanda waktu. Jalankan Sinkron otomatis atau Tap sinkron dulu.</p>';return}
const D=au.duration||L[L.length-1].t+10;
L.forEach(o=>{const m=document.createElement('i');m.style.left=o.t/D*100+'%';$('#tlm').appendChild(m);
const r=document.createElement('div');r.className='tr';const ts=document.createElement('button');ts.className='ts';ts.textContent=tf(o.t);ts.onclick=()=>{au.currentTime=o.t;au.play().catch(()=>{})};
const x=document.createElement('span');x.className='tx';x.textContent=o.x;
const mk=(t,f,l)=>{const q=document.createElement('button');q.className='pill';q.textContent=t;q.setAttribute('aria-label',l);q.onclick=()=>{o.t=Math.max(0,f());tlSave(L)};return q};
r.append(ts,x,mk('−',()=>o.t-.2,'Lebih awal 0,2 detik'),mk('+',()=>o.t+.2,'Lebih lambat 0,2 detik'),mk('⏺',()=>au.currentTime,'Set ke posisi sekarang'));b.appendChild(r)});b.scrollTop=sc}
$('#lv').onclick=()=>{const o=$('#tl').hidden;$('#tl').hidden=!o;$('#ll').hidden=o;$('#lt').hidden=true;$('#le').textContent='Edit lirik';if(o)tlRender()};
$('#le').addEventListener('click',()=>{$('#tl').hidden=true});
$('#lt').addEventListener('input',()=>{if(!$('#tl').hidden)tlRender()});
au.addEventListener('loadedmetadata',()=>{if(!$('#tl').hidden)tlRender()});
const _l4=load;load=(i,p)=>{_l4(i,p);if(!$('#tl').hidden)tlRender()};
au.addEventListener('timeupdate',()=>{$('#tlh').style.left=au.currentTime/(au.duration||1)*100+'%';if($('#tl').hidden)return;[...$('#tlb').children].forEach((d,k)=>d.classList.toggle('cur',k===LI))});
$('#tlbar').onclick=e=>{const R=e.currentTarget.getBoundingClientRect();au.currentTime=Math.max(0,Math.min(1,(e.clientX-R.left)/R.width))*(au.duration||0)};

$('#pc').onclick=()=>{const n=$('#pn').value.trim(),m=$('#pm');if(!n){m.textContent='Ketik nama playlist dulu.';return}
if(Object.prototype.hasOwnProperty.call(PL,n)){m.textContent='Nama playlist sudah ada.';return}
PL[n]=[];sv();$('#pn').value='';m.textContent='Playlist "'+n+'" dibuat. Buka pemutar lalu tekan ＋ Playlist untuk menambah lagu.';plRender()};
$('#pn').onkeydown=e=>{if(e.key==='Enter')$('#pc').click()};

// ===== tampilan baru =====
function mode(b){$('#full').classList.toggle('lyr',b);$('#vA').hidden=b;$('#vB').hidden=!b;$('#bl').classList.toggle('on',b);if(b){lyUp()}}
$('#bl').onclick=()=>mode(!$('#full').classList.contains('lyr'));$('#bl2').onclick=()=>mode(false);
$('#more').onclick=opts;$('#share2').onclick=share;$('#bq').onclick=queue;
const tUp=()=>$('#bt').textContent='🌙 '+(TM[ti]?TM[ti]+' mnt':'Timer');const _tm=timer;timer=function(){_tm();tUp()};
$('#bt').onclick=timer;
$('#r2').onclick=()=>{$('#rep').click();$('#r2').classList.toggle('on',rep)};$('#s2').onclick=()=>{$('#spd').click();$('#s2').textContent=$('#spd').textContent};
$('#goOff').onclick=()=>tab('off');
let NAME='Vinzz',BGP=true;try{NAME=localStorage.getItem('name')||'Vinzz';BGP=localStorage.getItem('bgph')!=='0'}catch(e){}
const hi=()=>$('#hi').textContent='Halo, '+NAME;hi();document.body.classList.toggle('nophoto',!BGP);
function sh(title,body){const h=$('#sheet');h.hidden=false;h.innerHTML='<h2 style="margin-top:0"></h2>';h.firstChild.textContent=title;body(h);fin(h)}
function nameSheet(){sh('Akun',h=>{const i=document.createElement('input');i.className='inp';i.value=NAME;i.setAttribute('aria-label','Nama');const b=document.createElement('button');b.className='pill';b.textContent='Simpan nama';b.onclick=()=>{NAME=i.value.trim()||'Vinzz';try{localStorage.setItem('name',NAME)}catch(e){}hi();setList();h.hidden=true};h.append(i,b)})}
function look(){sh('Tampilan',h=>{const b=document.createElement('button');b.className='row';b.textContent='Latar foto: '+(BGP?'Aktif':'Mati');b.onclick=()=>{BGP=!BGP;try{localStorage.setItem('bgph',BGP?'1':'0')}catch(e){}document.body.classList.toggle('nophoto',!BGP);look()};h.appendChild(b)})}
function info(){sh('Integrasi',h=>{const p=document.createElement('p');p.className='empty';p.textContent='Lirik sinkron diambil dari LRCLIB lewat tombol Cari lirik sinkron di Alat lirik. Butuh internet dan hanya jalan di file HTML yang diunduh.';h.appendChild(p)})}
function setList(){const L=[['👤','Akun','Nama: '+NAME,nameSheet],['📊','Statistik mendengarkan','Lagu dan artis teratas, waktu dengar',()=>tab('stats')],['🎨','Tampilan','Latar foto',look],['▶️','Pemutaran','Auto Next, EQ, kecepatan, timer',opts],['🎤','Lirik','Sinkron, timeline, impor .lrc',()=>{if(!SONGS.length)return $('#msg').textContent='Tambahkan lagu dulu.';$('#lyr').style.display='flex'}],['🔗','Integrasi','LRCLIB untuk lirik sinkron',info]],b=$('#setl');b.innerHTML='';
L.forEach(([i,t,s,f])=>{const x=document.createElement('button');x.className='sr';x.innerHTML='<div class="ci2"></div><div><b></b><span></span></div>';x.querySelector('.ci2').textContent=i;x.querySelector('b').textContent=t;x.querySelector('span').textContent=s;x.onclick=f;b.appendChild(x)})}
setList();
// ===== statistik =====
let ST=[],acc=0,lastT=0,accS=null,sess=null,SP=7;try{ST=JSON.parse(localStorage.getItem('st')||'[]')}catch(e){}
function flush(){if(accS&&acc>=1){const s=Math.round(acc);if(sess&&sess.t===accS.t){sess.s+=s;sess.ts=Date.now()}else{sess={ts:Date.now(),t:accS.t,a:accS.a,s};ST.push(sess)}if(ST.length>3000)ST=ST.slice(-3000);try{localStorage.setItem('st',JSON.stringify(ST))}catch(e){}}acc=0}
au.addEventListener('play',()=>{lastT=au.currentTime;accS=SONGS[cur]||accS});au.addEventListener('seeked',()=>{lastT=au.currentTime});
au.addEventListener('timeupdate',()=>{if(au.paused)return;const d=au.currentTime-lastT;if(d>0&&d<2)acc+=d;lastT=au.currentTime});
au.addEventListener('pause',flush);au.addEventListener('ended',()=>{flush();sess=null});document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
const _l7=load;load=(i,p)=>{flush();sess=null;_l7(i,p);accS=SONGS[cur]||null;lastT=0;mode($('#full').classList.contains('lyr'))};
const dur=s=>s>=3600?Math.floor(s/3600)+'j '+String(Math.floor(s%3600/60)).padStart(2,'0')+'m':Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'d';
const COL=['#8b5cf6','#3b82f6','#22c55e','#f59e0b','#ef4444'];
function stRender(){const from=SP?Date.now()-SP*864e5:0,E=ST.filter(e=>e.ts>=from),tot=E.reduce((a,e)=>a+e.s,0);
const by=k=>{const m={};E.forEach(e=>{const o=m[e[k]]||(m[e[k]]={n:e[k],s:0,c:0,a:e.a,u:new Set()});o.s+=e.s;o.c++;o.u.add(e.t)});return Object.values(m).sort((a,b)=>b.s-a.s)};
const sg=by('t'),ar=by('a'),cov=n=>{const s=SONGS.find(x=>(n.t?x.t===n.t:x.a===n.n)&&x.img);return s?'url('+s.img+') center/cover':''};
$('#st1').textContent=dur(tot);$('#st2').textContent=E.length;$('#st3').textContent=sg.length;$('#st4').textContent=ar.length;
const fa=ar[0],fs=sg[0];$('#st5').textContent=fa?fa.n:'-';$('#st5b').textContent=fa?fa.u.size+' lagu • '+dur(fa.s):'Belum ada data';$('#fa1').style.background=fa?(SONGS.find(x=>x.a===fa.n&&x.img)?'url('+SONGS.find(x=>x.a===fa.n&&x.img).img+') center/cover':''):'';
$('#st6').textContent=fs?fs.n:'-';$('#st6b').textContent=fs?fs.c+' kali • '+dur(fs.s):'Belum ada data';$('#fs1').style.background=fs?(SONGS.find(x=>x.t===fs.n&&x.img)?'url('+SONGS.find(x=>x.t===fs.n&&x.img).img+') center/cover':''):'';
const dn=$('#dn'),dl=$('#dl');dn.innerHTML='<circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>';dl.innerHTML='';let cum=0;
ar.slice(0,5).forEach((o,k)=>{const p=tot?o.s/tot*100:0,c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',21);c.setAttribute('cy',21);c.setAttribute('r',15.9155);c.setAttribute('fill','none');c.setAttribute('stroke',COL[k]);c.setAttribute('stroke-width',6);c.setAttribute('stroke-dasharray',p+' '+(100-p));c.setAttribute('stroke-dashoffset',25-cum);dn.appendChild(c);cum+=p;
const r=document.createElement('div');r.innerHTML='<i></i><em></em><span></span>';r.querySelector('i').style.background=COL[k];r.querySelector('em').textContent=o.n;r.querySelector('span').textContent=Math.round(p)+'%';dl.appendChild(r)});
if(!ar.length)dl.textContent='Putar lagu dulu untuk melihat statistik.';
const D=['Min','Sen','Sel','Rab','Kam','Jum','Sab'],now=new Date(),days=[];for(let k=6;k>=0;k--){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-k);days.push({l:D[d.getDay()],s:0,a:d.getTime(),b:d.getTime()+864e5})}
E.forEach(e=>{const d=days.find(x=>e.ts>=x.a&&e.ts<x.b);if(d)d.s+=e.s});const mx=Math.max(1,...days.map(d=>d.s)),B=$('#bars');B.innerHTML='';
days.forEach(d=>{const x=document.createElement('div');x.innerHTML='<i></i><span></span>';x.querySelector('i').style.height=Math.max(3,d.s/mx*90)+'px';x.querySelector('span').textContent=d.l;B.appendChild(x)})}
$$('#stc button').forEach(b=>b.onclick=()=>{SP=+b.dataset.d;$$('#stc button').forEach(x=>x.classList.toggle('on',x===b));stRender()});
const _tb2=tab;tab=n=>{_tb2(n);if(n==='stats'){flush();stRender()}};
mode(false);tUp();

if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
