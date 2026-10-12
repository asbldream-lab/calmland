// ===== CALM LAND - AFFICHAGE ET INTERFACE =====
const PUBLIC=false,PLAN_FIGE='';MODE_PUBLIC=PUBLIC;
const MOBILE=typeof document!=='undefined'&&!!document.body&&!!document.body.classList&&document.body.classList.contains('mob');
let panneauMasque=false,pinch=null,derBh=0;const ptrs=new Map();
const VW=640,VH=360;
const cv=document.getElementById('jeu'),cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const IMG={};let charge=0;const total=Object.keys(ASSETS).length;
for(const k in ASSETS){const im=new Image();im.onload=()=>{charge++;if(charge===total)pret();};im.src=ASSETS[k];IMG[k]=im;}
let VITESSE=30; // secondes réelles par minute de jeu
let VOIR_COLL=false,EDIT=false,EC={x:0,y:0},drag=null,selEd=null,edMenu=false,zoomAvant=1,ZOOM=1,son=true,ac=null,pluieNode=null,eclair=0,prochainEclair=6,tReel=0,fond=null,attenteFx=0,mur=0;

// ---------- MUSIQUE D'AMBIANCE (un seul fichier, en boucle) ----------
const musique=new Audio();musique.loop=true;musique.volume=0;musique.src=MUSIQUE;
let volMusique=0,musiqueLancee=false;
function lancerMusique(){if(musiqueLancee)return;musiqueLancee=true;musique.play().catch(()=>{});}
function majMusique(dt){
 const dial=!$('dialogue').hidden||!$('titre').hidden;
 const cible=son?(G.mode==='jeu'?(dial?0.10:0.32):0.18):0;
 volMusique+=Math.max(-1,Math.min(1,cible-volMusique))*Math.min(1,dt*1.2);
 musique.volume=Math.max(0,Math.min(1,volMusique));
}

// ---------- FOND DU VILLAGE (dessiné une fois) ----------
function dessinerFond(){const R=SC.village,TS=1024;fond=[];
 for(let ty=0;ty<R.h;ty+=TS)for(let tx=0;tx<R.w;tx+=TS){const c=document.createElement('canvas');c.width=Math.min(TS,R.w-tx);c.height=Math.min(TS,R.h-ty);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.translate(-tx,-ty);dessinerFondSur(g,tx,ty,c.width,c.height);fond.push({x:tx,y:ty,w:c.width,h:c.height,c});}}
function dessinerFondSur(f,tx,ty,tw,th){
 for(let y=Math.floor(ty/32)*32;y<ty+th;y+=32)for(let x=Math.floor(tx/32)*32;x<tx+tw;x+=32)f.drawImage(IMG.t_herbe,x,y);
 for(const r of ROUTES){if(r.off)continue;const t=r[4]==='t',ts=t?32:64,im=t?IMG.t_terre:IMG.t_pave;for(let y=r[1];y<r[1]+r[3];y+=ts)for(let x=r[0];x<r[0]+r[2];x+=ts){const ww=Math.min(ts,r[0]+r[2]-x),hh=Math.min(ts,r[1]+r[3]-y);f.drawImage(im,0,0,ww,hh,x,y,ww,hh);}}
 const ch=CHEMINS;
 for(const c of ch)for(let y=c[1];y<c[1]+c[3];y+=32)for(let x=c[0];x<c[0]+c[2];x+=32)f.drawImage(IMG.t_terre,0,0,32,Math.min(32,c[1]+c[3]-y),x,y,32,Math.min(32,c[1]+c[3]-y));
 for(const b of BAT)if(!b.off)f.drawImage(IMG['b_'+b[0]],b[1],b[2]);
 const LBL={Maison_Aaron:'Maison d\'Aaron',Maison_Benjamin:'Maison de Benjamin et Nathalie',Maison_Paul:'Maison de Paul',Pharmacie:'Pharmacie de Lilya',Boulangerie:'Boulangerie de Cédric',Poste_Police:'Poste de police · Reda',Maison_Mami:'Maison de Mami',Maison_Zoe:'Maison de Zoé et ses parents',Maison_Marc:'Maison de Marc',Ecole:'École · Marc, le concierge'};
 f.font='bold 12px system-ui';f.textAlign='center';
 for(const b of BAT){if(b.off)continue;const t=LBL[b[0]],w=f.measureText(t).width+14,cxp=b[1]+b[3]/2,y=b[2]-14;f.fillStyle='#3a2a1c';f.fillRect(cxp-w/2-2,y-14,w+4,22);f.fillStyle='#8a6a42';f.fillRect(cxp-w/2,y-12,w,18);f.fillStyle='#f4ead2';f.fillText(t,cxp,y+1);}
 for(const b of [...BUISSONS].sort((p,q)=>p[1]-q[1])){const sp=SPR[b[2]];if(sp.h>=96){const c=coupe(sp);if(sp.h-c>0)f.drawImage(IMG.atlas,sp.x,sp.y+c,sp.w,sp.h-c,b[0],b[1]-sp.h+c,sp.w,sp.h-c);continue;}f.drawImage(IMG.atlas,sp.x,sp.y,sp.w,sp.h,b[0],b[1]-sp.h,sp.w,sp.h);}
}

// ---------- SONS (générés, aucun fichier) ----------
function initSon(){if(ac)return;try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;return;}
 const n=ac.sampleRate*2,buf=ac.createBuffer(1,n,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 const src=ac.createBufferSource();src.buffer=buf;src.loop=true;const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=1400;const g=ac.createGain();g.gain.value=0;src.connect(fl);fl.connect(g);g.connect(ac.destination);src.start();pluieNode=g;}
function bip(freq,dur,vol=0.08,type='square',t0=0){if(!ac||!son)return;const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,ac.currentTime+t0);g.gain.exponentialRampToValueAtTime(0.0001,ac.currentTime+t0+dur);o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+t0);o.stop(ac.currentTime+t0+dur+0.05);}
function sonReveil(){for(let i=0;i<6;i++)bip(i%2?880:1040,0.12,0.06,'square',i*0.18);}
function sonTonnerre(){if(!ac||!son)return;const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);const s=ac.createBufferSource();s.buffer=b;const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=180;const g=ac.createGain();g.gain.value=0.9;s.connect(f);f.connect(g);g.connect(ac.destination);s.start();}
function sonMarteau(){bip(140,0.08,0.12,'triangle');}

// ---------- DESSIN ----------
function perso(sheet,x,y,dir,marche,t){
 const im=IMG[sheet+(marche?'_walk':'_idle')];if(!im)return;const fr=dir*6+Math.floor(t*(marche?10:6))%6;
 cx.drawImage(im,fr*32,0,32,64,Math.round(x-16),Math.round(y-60),32,64);
}
function balade(id,t){ // petit mouvement des personnages fixes : ils ne restent jamais figés
 let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%997;const T=9,p=((t+h)%T)/T;
 if(p<0.22)return {dx:p/0.22*18,marche:true,dir:0};if(p<0.5)return {dx:18,marche:false,dir:3};
 if(p<0.72)return {dx:18-(p-0.5)/0.22*18,marche:true,dir:2};return {dx:0,marche:false,dir:(h%2?3:1)};
}
function camera(){
 if(EDIT){const R=SC[G.player.scene],vw=VW/ZOOM,vh=VH/ZOOM,cl=(p,v,r)=>v>=r?-(v-r)/2:Math.max(0,Math.min(r-v,p));return {x:cl(EC.x,vw,R.w),y:cl(EC.y,vh,R.h)};}
 const pl=G.player,R=SC[pl.scene],vw=VW/ZOOM,vh=VH/ZOOM;
 const ax=(p,v,r)=>v>=r?-(v-r)/2:Math.max(0,Math.min(r-v,p-v/2));
 return {x:ax(pl.x,vw,R.w),y:ax(pl.y,vh,R.h)};
}
function dessiner(t){
 const pl=G.player,cam=camera(),L=G.L,m=G.minute;
 cx.fillStyle='#0d0d12';cx.fillRect(0,0,VW,VH);
 if(!L)return;
 cx.save();cx.scale(ZOOM,ZOOM);cx.translate(-Math.round(cam.x),-Math.round(cam.y));
 const labels=[];
 if(pl.scene==='village'){for(const t of fond){if(t.x+t.w<cam.x||t.y+t.h<cam.y||t.x>cam.x+VW/ZOOM||t.y>cam.y+VH/ZOOM)continue;cx.drawImage(t.c,0,0,t.w,t.h,t.x,t.y,t.w+1,t.h+1);}}else cx.drawImage(baseDe(pl.scene),0,0);
 const objs=[];
 if(pl.scene==='village')for(const u of BUISSONS){const sp=SPR[u[2]];if(sp.h>=96){const ux=u[0],uy=u[1],c=coupe(sp),yb=sp.sol?sp.sol[1]+sp.sol[3]:sp.h;if(c>0)objs.push({y:uy-sp.h+yb,d:()=>cx.drawImage(IMG.atlas,sp.x,sp.y,sp.w,c,ux,uy-sp.h,sp.w,c)});}}
 // objets
 if(pl.scene==='village'){
  if(L.cleAuSol){const b=Math.sin(t*4)*1.5;objs.push({y:646,d:()=>{cx.drawImage(IMG.cle,P.cleSol.x-16,P.cleSol.y-26+b);}});}
  if(m>=6&&!G.prologue)objs.push({y:600,d:()=>cx.drawImage(IMG.mot,P.motPaul.x-16,P.motPaul.y-26)});
 }
 if(pl.scene==='salon'){
  const mp=machinePos();
  const mb=machineBase();if(L.machineBougee)objs.push({y:-2,d:()=>cx.drawImage(IMG.trappe,(L.trappeOuverte?5:0)*32,0,32,32,mb.x-16,mb.y-14,32,32)});
  const vib=L.machineBougee?0:(Math.floor(t*12)%2);if(itemDe('salon','machine'))objs.push({y:mp.y,d:()=>cx.drawImage(IMG.machine,mp.x-20+vib,mp.y-58)});
  const w=balade('chienb',t*0.8);objs.push({y:P.chienBlanc.y+22,d:()=>cx.drawImage(IMG.chien_blanc,(w.dir*6+(w.marche?Math.floor(t*8)%6:0))*32,0,32,32,P.chienBlanc.x+w.dx-16,P.chienBlanc.y-8,32,32)});
 }
 if(pl.scene==='soussol'){
  const c=chienNoir();objs.push({y:c.y,d:()=>cx.drawImage(IMG.chien_noir,((L.dogFed?3:2)*6)*32,0,32,32,c.x-16,c.y-30+(L.dogFed?Math.round(Math.sin(t*6)):0),32,32)});
 }
 if(pl.scene!=='village')for(const it of ITEMS[pl.scene]){const sp=SPRI[it[2]];if(!sp||it[2]==='machine')continue;const ix=it[0],iy=it[1];objs.push({y:(sp.mur||it[3])?-1000+iy:iy,d:()=>cx.drawImage(IMG.atlas_int,sp.x,sp.y,sp.w,sp.h,ix,iy-sp.h,sp.w,sp.h)});}
 if(pl.scene!=='village')for(const r of (MURS[pl.scene]||[])){const col=INTS[pl.scene].wc||[200,190,170];objs.push({y:r[1]+r[3],d:()=>dessinerMur(r,col)});}
 // personnages
 const pos=positions();
 for(const id in pos){const n=pos[id];if(n.scene!==pl.scene)continue;
  let x=n.x,y=n.y,dir=n.dir??3,mar=!!n.bouge;
  if(!n.bouge&&!n.suiveur&&(FIXES[id]||id==='paul'||id==='loulou')){const w=balade(id,t);x+=w.dx-9;mar=w.marche;dir=w.dir;}
  objs.push({y,d:()=>perso(n.sheet,x,y,dir,mar,t)});
  if(Math.hypot(x-pl.x,y-pl.y)<95)labels.push({x,y:y-66,t:NOMS[n.who]||''});
  if(id==='benjamin'&&n.marteau&&!L.cleReprise)objs.push({y:999,d:()=>bulle('toc… toc…',x,y-70,t)});
 }
 if(pl.scene==='village'&&m>=8&&m<10&&!L.cleReprise&&!G.prologue){objs.push({y:999,d:()=>bulle('toc… toc…',P.porteBen.x,P.porteBen.y-56,t)});}
 objs.push({y:pl.y,d:()=>perso('Aaron',pl.x,pl.y,pl.dir,pl.marche,t)});
 objs.sort((a,b)=>a.y-b.y);for(const o of objs)o.d();
 cx.font='bold 9px system-ui';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='rgba(0,0,0,.85)';
 for(const l of labels){cx.strokeText(l.t,l.x,l.y);cx.fillStyle='#ffe9a8';cx.fillText(l.t,l.x,l.y);}
 const ob=objectif();
 if(ob&&ob.scene===pl.scene){const dx=ob.x-pl.x,dy=ob.y-pl.y,d=Math.hypot(dx,dy);
  cx.fillStyle='rgba(255,220,90,'+(0.45+0.25*Math.sin(t*5))+')';cx.beginPath();cx.arc(ob.x,ob.y-6,10+Math.sin(t*5)*2,0,7);cx.fill();
  if(d>90){const a=Math.atan2(dy,dx),px=pl.x+Math.cos(a)*46,py=pl.y-28+Math.sin(a)*46;cx.save();cx.translate(px,py);cx.rotate(a);cx.fillStyle='rgba(255,220,90,.95)';cx.strokeStyle='#000';cx.lineWidth=1;cx.beginPath();cx.moveTo(10,0);cx.lineTo(-6,-7);cx.lineTo(-3,0);cx.lineTo(-6,7);cx.closePath();cx.fill();cx.stroke();cx.restore();}}
 // indication d'action
 const c=(G.queue.length||G.keypad||EDIT)?null:cible();
 if(c){const x=c.x,y=(c.type==='pnj'?c.y-92:c.y-34);cx.fillStyle='rgba(255,255,255,.92)';cx.fillRect(x-7,y-7+Math.sin(t*5),14,13);cx.fillStyle='#222';cx.font='bold 10px system-ui';cx.textAlign='center';cx.fillText('E',x,y+3+Math.sin(t*5));if(c.type==='porte'){cx.font='bold 8px system-ui';cx.lineWidth=3;cx.strokeStyle='#000';cx.strokeText('entrer',x,y-11);cx.fillStyle='#fff';cx.fillText('entrer',x,y-11);}}
 if(VOIR_COLL){cx.fillStyle='rgba(255,0,0,.28)';cx.strokeStyle='rgba(255,60,60,.9)';cx.lineWidth=1/ZOOM;for(const r of solids(pl.scene)){cx.fillRect(r[0],r[1],r[2],r[3]);cx.strokeRect(r[0],r[1],r[2],r[3]);}cx.strokeStyle='#ffe15a';cx.strokeRect(pl.x-6,pl.y-3,12,3);}
 if(EDIT)dessinerEditeur(cam);
 cx.restore();
 // ambiance
 if(pl.scene==='village'&&!EDIT){
  cx.fillStyle='rgba(18,26,52,.30)';cx.fillRect(0,0,VW,VH);
  cx.strokeStyle='rgba(190,205,235,.45)';cx.lineWidth=1;cx.beginPath();
  for(let i=0;i<140;i++){const sx=(i*97+t*60)%VW,sy=(i*53+t*420)%VH;cx.moveTo(sx,sy);cx.lineTo(sx-3,sy+9);}cx.stroke();
 } else {cx.fillStyle='rgba(10,12,24,.12)';cx.fillRect(0,0,VW,VH);}
 if(eclair>0){cx.fillStyle=`rgba(235,240,255,${eclair})`;cx.fillRect(0,0,VW,VH);}
}
function bulle(txt,x,y,t){cx.font='italic 9px system-ui';cx.textAlign='center';const w=cx.measureText(txt).width+8;cx.fillStyle='rgba(20,20,30,.75)';cx.fillRect(x-w/2,y-9+Math.sin(t*9),w,13);cx.fillStyle='#f1e6c8';cx.fillText(txt,x,y+1+Math.sin(t*9));}

// ---------- ENTRÉES ----------
const touches={};
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if(e.target&&e.target.tagName==='TEXTAREA')return;
 if(PUBLIC&&k.length===1&&'itcjkg'.includes(k))return;
 if(EDIT&&(e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();annuler();return;}
 if(EDIT&&(k==='delete'||k==='backspace')){e.preventDefault();supprimerSel();return;}
 if(EDIT&&k==='x'){basculerColl();return;}if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
 if(G.keypad&&!G.queue.length){if(/^[0-9]$/.test(k))pave(k);else if(k==='backspace')pave('⌫');else if(k==='enter')pave('OK');else if(k==='escape')pave('X');return;}
 if(k==='t'&&G.mode!=='menu'){basculerTest();return;}
 if(k==='m'){basculerSon();return;}
 if(k==='c'){VOIR_COLL=!VOIR_COLL;return;}
 if(k==='j'){sauterTemps(1);return;} if(k==='k'){sauterTemps(5);return;}
 if(k==='o'||k==='-'){zoom(-1);return;} if(k==='p'||k==='+'||k==='='){zoom(1);return;}
 if(k==='g'&&G.mode!=='menu'){$('guide').hidden=!$('guide').hidden;return;}
 if(k==='i'&&G.mode==='jeu'){basculerEditeur();return;}
 touches[k]=true;
 if(['e',' ','enter'].includes(k)&&!e.repeat)action();
});
addEventListener('keyup',e=>{touches[e.key.toLowerCase()]=false;});
function basculerSon(){son=!son;majBoutonSon();}
function majBoutonSon(){const b=$('b-son');if(b)b.textContent=son?'🔊':'🔇';}
function sauterTemps(d){if(EDIT||G.mode!=='jeu'||G.prologue||G.queue.length||G.keypad)return;sauter(d);pomper();}
function zoom(d){const Z=[0.08,0.11,0.14,0.2,0.28,0.4,0.5,0.7,1,1.4,1.8,2.4];let i=Z.indexOf(ZOOM);if(i<0){i=Z.findIndex(z=>z>=ZOOM);if(i<0)i=Z.length-1;if(d<0&&Z[i]>ZOOM)i=Math.max(0,i);else if(d>0&&Z[i]>ZOOM)i=Math.max(0,i-1);}ZOOM=Z[Math.max(0,Math.min(Z.length-1,i+d))];$('zoom-val').textContent=Math.round(ZOOM*100)+' %';}
function dirClavier(){let dx=0,dy=0;const T=touches;
 if(T.arrowleft||T.q||T.a||T.tg)dx-=1;if(T.arrowright||T.d||T.td)dx+=1;if(T.arrowup||T.z||T.w||T.th)dy-=1;if(T.arrowdown||T.s||T.tb)dy+=1;
 if(dx&&dy){dx*=0.707;dy*=0.707;}return {dx,dy};}
function action(){
 if(EDIT)return;
 initSon();
 if(G.mode==='lettre'){pageLettre();return;}
 if(G.queue.length){const it=G.queue[0];if(it.choice)return;if(it.who!==undefined||it.title){if(ecriture<1){ecriture=1;return;}G.queue.shift();pomper();}return;}
 if(G.mode==='jeu')interagir()&&pomper();
}

// ---------- VISAGES ----------
const FACE={A:'Aaron',N:'Nathalie',B:'Benjamin',R:'Reda',P:'Paul',C:'Cedric',L:'Lilya',M:'Marc',Mi:'Mami',Z:'Zoe',ZM:'Mere_Zoe',ZP:'Pere_Zoe',Lo:'Loulou',V:'Loulou'};
const facesCache={};
function visageCanvas(sheet){if(facesCache[sheet]!==undefined)return facesCache[sheet];let out=null;
 try{const c=document.createElement('canvas');c.width=32;c.height=64;const x=c.getContext('2d');x.drawImage(IMG[sheet+'_idle'],18*32,0,32,64,0,0,32,64);const d=x.getImageData(0,0,32,64).data;
  let x0=32,x1=0,y0=64;for(let y=0;y<64;y++)for(let xx=0;xx<32;xx++)if(d[(y*32+xx)*4+3]>128){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(y<y0)y0=y;}
  const w=x1-x0+1;out={c,x0,y0,w,h:Math.min(64-y0,Math.round(w*1.05))};}catch(e){out=null;}
 facesCache[sheet]=out;return out;}
function dessinerVisage(who){const el=$('visage'),f=FACE[who];if(!f){el.style.display='none';return;}el.style.display='block';
 const x=el.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#1b1b2a';x.fillRect(0,0,48,48);
 const o=visageCanvas(f);if(!o)return;const s=Math.max(1,Math.floor(44/Math.max(o.w,o.h))),dw=o.w*s,dh=o.h*s;x.drawImage(o.c,o.x0,o.y0,o.w,o.h,Math.round((48-dw)/2),Math.round((48-dh)/2),dw,dh);}
// ---------- FILE DES DIALOGUES ----------
let ecriture=1,courant=null;
function pomper(){
 while(G.queue.length){const it=G.queue[0];
  if(it.call){G.queue.shift();it.call();continue;}
  if(it.fx){if(attenteFx>0)return;if(it.fx==='reveil'){sonReveil();montrerTitre('♪ Le réveil sonne.',true);attenteFx=1.3;}else{montrerTitre('',true);attenteFx=1.0;}return;}
  break;}
 afficherItem();
}
function afficherItem(){
 const it=G.queue[0],box=$('dialogue'),ti=$('titre'),ch=$('choix');
 ch.innerHTML='';ch.hidden=true;
 if(!it){box.hidden=true;if(G.mode!=='lettre')ti.hidden=true;courant=null;majPave();return;}
 if(it===courant)return;courant=it;
 if(it.title){box.hidden=true;montrerTitre(it.title,false);return;}
 if(it.choice){box.hidden=false;dessinerVisage('A');$('nom').textContent='';$('texte').textContent='Que faire ?';ch.hidden=false;
  it.choice.forEach((o,i)=>{const b=document.createElement('button');b.textContent=o.label;b.onclick=()=>{G.queue.shift();o.fn();pomper();};ch.appendChild(b);if(i===0)setTimeout(()=>b.focus(),0);});return;}
 ti.hidden=true;
 box.hidden=false;dessinerVisage(it.who);$('nom').textContent=NOMS[it.who]||'';box.dataset.who=it.who;ecriture=0;$('texte').textContent='';
}
function montrerTitre(txt,auto){const ti=$('titre');ti.hidden=false;ti.textContent=txt;ti.dataset.noir='1';$('dialogue').hidden=true;}

// ---------- PAVÉ DU CODE ----------
function majPave(){const p=$('pave');if(!G.keypad||G.queue.length){p.hidden=true;return;}p.hidden=false;
 $('pave-val').textContent=(G.keypad.value+'______').slice(0,6).split('').join(' ');
 const rest=Math.max(0,(G.L.codeLimite-G.minute)*VITESSE);$('pave-temps').textContent=`Temps restant : ${Math.ceil(rest)} s`;}
function pave(k){if(!G.keypad)return;initSon();bip(600,0.05,0.05);
 if(k==='X'){G.keypad=null;majPave();return;}
 if(k==='⌫'){G.keypad.value=G.keypad.value.slice(0,-1);majPave();return;}
 if(k==='OK'||G.keypad.value.length>=6){if(G.keypad.value.length===6){code(G.keypad.value);pomper();}majPave();return;}
 G.keypad.value+=k;if(G.keypad.value.length===6){const v=G.keypad.value;setTimeout(()=>{if(G.keypad&&G.keypad.value===v){code(v);pomper();majPave();}},250);}majPave();}

// ---------- LETTRE ET FIN ----------
function pageLettre(){const f=G.fin;f.page++;afficherLettre();}
function afficherLettre(){const f=G.fin,l=$('lettre');l.hidden=false;$('dialogue').hidden=true;$('titre').hidden=true;
 if(f.page<LETTRE.length){l.className='papier';$('lettre-txt').textContent=LETTRE.slice(0,f.page+1).join('\n\n');}
 else if(f.page===LETTRE.length){l.className='final';$('lettre-txt').textContent=MESSAGE_FINAL;}
 else{l.hidden=true;G.mode='menu';$('menu').hidden=false;$('menu-titre').textContent='Fin de la démo';}}

// ---------- PANNEAU DE TEST ----------
const DRAPEAUX=[['cleEnMain','Aaron a la clé'],['cleAuSol','Clé au sol'],['aLaViande','Aaron a la viande'],['vuReda','Passé voir Reda'],['braceletVu','Bracelet vu'],['machineBougee','Machine bougée'],['trappeOuverte','Trappe ouverte'],['dogFed','Chien noir nourri'],['cleReprise','Clé reprise (boucle perdue)'],['cadenasBloque','Cadenas bloqué']];
const LIEUX=[['Chambre d\'Aaron','chambre',110,180],['Salon de Benjamin','salon',300,250],['Sous-sol','soussol',90,140]];
function basculerTest(){const p=$('test');p.hidden=!p.hidden;if(!p.hidden)majTest();}
function majTest(){if($('test').hidden||!G.L)return;
 $('t-etat').textContent=`${G.prologue?'Prologue':'Boucle '+numeroBoucle()} · minute ${G.minute.toFixed(1)} / 20${G.L.perdu?' · boucle perdue':''}`;
 $('t-code').checked=G.mem.codeAppris;$('t-mami').checked=G.mem.mamiPhraseConnue;
 for(const [k] of DRAPEAUX){const c=$('t-'+k);if(c)c.checked=!!G.L[k];}}
function construireTest(){
 const d=$('t-drapeaux');for(const [k,l] of DRAPEAUX){const lab=document.createElement('label');lab.innerHTML=`<input type="checkbox" id="t-${k}"> ${l}`;lab.querySelector('input').onchange=e=>{G.L[k]=e.target.checked;if(k==='cleReprise'&&e.target.checked){G.L.perdu=true;G.L.repriseA=G.minute;G.L.repriseDe={scene:'salon',x:0,y:0};}};d.appendChild(lab);}
 $('t-code').onchange=e=>G.mem.codeAppris=e.target.checked;$('t-mami').onchange=e=>G.mem.mamiPhraseConnue=e.target.checked;
 const l=$('t-lieux');for(const [n,s,x,y] of LIEUX){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{changerScene(s,x,y,3);};l.appendChild(b);}
 for(const [n,id] of [['Devant chez Aaron','p_aaron'],['Devant chez Benjamin','p_benjamin'],['Paul','p_paul'],['Pharmacie (Lilya)','p_pharmacie'],['Boulangerie (Cédric)','p_boulangerie'],['Poste (Reda)','p_poste'],['Mami','p_mami'],['Zoé et ses parents','p_zoe'],['Marc','p_marc'],['École','p_ecole']]){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{const p=PORTES_V.find(q=>q.id===id);changerScene('village',p.x,p.y+40,3);};l.appendChild(b);}
 const mm=$('t-minutes');for(const m of [0,2,4,5.5,7,8,10,12,15,19.5]){const b=document.createElement('button');b.textContent=m;b.onclick=()=>{regler(m);pomper();majTest();};mm.appendChild(b);}
 $('t-plus').onclick=()=>{regler(Math.min(19.99,G.minute+1));pomper();};
 $('t-mourir').onclick=()=>{G.queue=[];G.keypad=null;regler(19.99);G.minute=19.99;avancer(0.02);pomper();};
 $('t-boucle').onclick=()=>{G.queue=[];demarrerBoucle();pomper();};
 $('t-dialogues').onclick=()=>{const v=$('liste');v.hidden=false;const c=$('liste-contenu');c.innerHTML='';
  for(const k in D){const h=document.createElement('h3');h.textContent=k+(AJOUTS_DEMO.includes(k)?'  (ajout pour la démo)':'');c.appendChild(h);
   for(const [w,t] of D[k]){const p=document.createElement('p');p.innerHTML=`<b>${NOMS[w]||'—'}</b> ${t.replace(/</g,'&lt;')}`;c.appendChild(p);}}
  const h=document.createElement('h3');h.textContent='lettre de Loulou';c.appendChild(h);for(const t of LETTRE){const p=document.createElement('p');p.textContent=t;c.appendChild(p);}};
 $('liste-fermer').onclick=()=>$('liste').hidden=true;
}

// ---------- PIÈCES CRÉÉES ----------
const BASES={};const NP={fl:0,wl:0};
function fabriquerBase(w,h,fl,col,gap,clo,ph){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 col=col||[200,190,170];const rgb=f=>'rgb('+col.map(v=>Math.round(v*f)).join(',')+')';
 x.fillStyle='#1e191e';x.fillRect(0,0,w,h);
 x.save();x.beginPath();x.rect(12,64,w-24,h-76);x.clip();const fx=(fl%8)*96,fy=Math.floor(fl/8)*64;{const px=((ph&&ph[0])||0)%96,py=((ph&&ph[1])||0)%64;for(let yy=64+py-(py?64:0);yy<h;yy+=64)for(let xx=px-(px?96:0);xx<w;xx+=96)x.drawImage(IMG.floors,fx,fy,96,64,xx,yy,96,64);}x.restore();
 x.fillStyle=rgb(.45);x.fillRect(0,0,12,h);x.fillRect(w-12,0,12,h);x.fillRect(0,h-12,w,12);
 x.fillStyle=rgb(1);x.fillRect(0,0,w,64);x.fillStyle=rgb(.45);x.fillRect(0,0,w,4);x.fillStyle=rgb(.8);x.fillRect(0,52,w,6);x.fillStyle=rgb(.6);x.fillRect(0,58,w,6);
 x.fillStyle='rgba(0,0,0,.18)';x.fillRect(12,64,w-24,7);
 x.fillStyle=rgb(.7);for(const q of (clo||[]))x.fillRect(q[0],q[1],q[2],q[3]);
 if(gap){x.fillStyle='#281e19';x.fillRect(gap[0],h-12,gap[1]-gap[0],12);}return c;}
function baseDe(sc){const I=INTS[sc],R=SC[sc];const sig=[R.w,R.h,I.fl,I.wc,I.gap,I.dec,JSON.stringify(I.cloisons||[])].join('|');if(!BASES[sc]||BASES[sc].sig!==sig)BASES[sc]={sig,c:fabriquerBase(R.w,R.h,I.fl,I.wc,I.gap,I.cloisons,I.dec)};return BASES[sc].c;}
function dessinerMur(r,col){const x=r[0],y=r[1],w=r[2],h=r[3],c=f=>'rgb('+col.map(v=>Math.round(v*f)).join(',')+')';
 if(w>=h){cx.fillStyle=c(1);cx.fillRect(x,y,w,h);cx.fillStyle=c(.8);cx.fillRect(x,y+h-14,w,6);cx.fillStyle=c(.6);cx.fillRect(x,y+h-8,w,8);cx.fillStyle=c(.45);cx.fillRect(x,y,w,3);}
 else{cx.fillStyle=c(.75);cx.fillRect(x,y,w,h);cx.fillStyle=c(1);cx.fillRect(x,y,w,5);cx.fillStyle=c(.5);cx.fillRect(x,y,2,h);cx.fillRect(x+w-2,y,2,h);}}
const MT=[{nom:'Mur horizontal (4 cases)',w:128,h:48},{nom:'Mur horizontal (8 cases)',w:256,h:48},{nom:'Mur vertical (4 cases)',w:16,h:128},{nom:'Mur vertical (8 cases)',w:16,h:256}];
function ajouterMursBiblio(L){const h=document.createElement('h4');h.textContent='Murs de séparation (infranchissables)';L.appendChild(h);const g=document.createElement('div');g.className='grille';L.appendChild(g);
 for(const mt of MT){const c=document.createElement('canvas');c.width=44;c.height=44;c.title=mt.nom;const x=c.getContext('2d'),s=Math.min(40/mt.w,40/mt.h),dw=Math.max(4,Math.round(mt.w*s)),dh=Math.max(4,Math.round(mt.h*s));
  x.fillStyle='#b98fa8';x.fillRect(Math.round((44-dw)/2),Math.round((44-dh)/2),dw,dh);c.addEventListener('pointerdown',e=>{e.preventDefault();glisserMur(mt,e);});g.appendChild(c);}}
function glisserMur(mt,e){const r0=cv.getBoundingClientRect(),f=document.createElement('div');f.style.cssText='position:fixed;pointer-events:none;z-index:99;opacity:.7;background:#b98fa8;width:'+Math.round(mt.w*ZOOM*r0.width/VW)+'px;height:'+Math.round(mt.h*ZOOM*r0.height/VH)+'px;';document.body.appendChild(f);
 const place=ev=>{f.style.left=(ev.clientX-f.offsetWidth/2)+'px';f.style.top=(ev.clientY-f.offsetHeight/2)+'px';};place(e);const mv=ev=>place(ev);
 const up=ev=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);f.remove();const r=cv.getBoundingClientRect();let w;
  if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom&&document.elementFromPoint(ev.clientX,ev.clientY)===cv)w=mondeDe(ev);else{const c=camera();w={x:c.x+VW/ZOOM/2,y:c.y+VH/ZOOM/2};}
  const R=SC[G.player.scene];pushUndo();const q=[Math.max(12,Math.min(R.w-12-mt.w,Math.round((w.x-mt.w/2)/16)*16)),Math.max(20,Math.min(R.h-12-mt.h,Math.round((w.y-mt.h/2)/16)*16)),mt.w,mt.h];MURS[G.player.scene].push(q);selEd={kind:'m',ref:q,w:q[2],h:q[3]};majApres();msg('Posé : '+mt.nom);};
 document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);}
function majScenesEd(){const sel=$('ed-scenes');sel.innerHTML='';[['village','Village'],...Object.keys(INTS).map(k=>[k,INTS[k].nom])].forEach(([k,n])=>{const o=document.createElement('option');o.value=k;o.textContent=n;sel.appendChild(o);});sel.value=G.player.scene;sel.onchange=()=>{allerEd(sel.value);sel.blur();};}
function majDest(){const l=$('ed-dest-l'),s=$('ed-dest'),ok=!!(selEd&&selEd.kind==='i'&&(selEd.ref[2]==='porte'||selEd.ref[2]==='passage'));l.hidden=!ok;
 if(ok){s.innerHTML='';const add=(v,n)=>{const o=document.createElement('option');o.value=v;o.textContent=n;s.appendChild(o);};add('','(aucune destination)');add('@village','Dehors (le village)');for(const k in INTS)if(k!==G.player.scene)add(k,INTS[k].nom);s.value=selEd.ref[4]||'';}
 const I=INTS[G.player.scene];$('np-suppr').hidden=!(I&&I.user);}
function construireStyles(){const fs=$('np-sols'),ws=$('np-murs');
 for(let i=0;i<STYLES.nf;i++){const c=document.createElement('canvas');c.width=48;c.height=32;c.title='Sol '+(i+1);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(IMG.floors,(i%8)*96,Math.floor(i/8)*64,96,64,0,0,48,32);
  c.onclick=()=>{NP.fl=i;fs.querySelectorAll('canvas').forEach(e=>e.classList.remove('sel'));c.classList.add('sel');};if(i===0)c.classList.add('sel');fs.appendChild(c);}
 STYLES.walls.forEach((col,i)=>{const c=document.createElement('canvas');c.width=36;c.height=24;c.title='Mur '+(i+1);const x=c.getContext('2d');x.fillStyle='rgb('+col.join(',')+')';x.fillRect(0,0,36,24);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,18,36,6);
  c.onclick=()=>{NP.wl=i;ws.querySelectorAll('canvas').forEach(e=>e.classList.remove('sel'));c.classList.add('sel');};if(i===0)c.classList.add('sel');ws.appendChild(c);});}
// ---------- ÉDITEUR DE PLAN ----------
const CLE_PLAN='calmland_plan_v9';let undo=[],confirmDel=null;
// ---------- SAUVEGARDE SUR GITHUB (éditeur uniquement, le plan vit dans plan.json du dépôt) ----------
const GH_DEPOT='asbldream-lab/calmland',GH_FICHIER='plan.json',GH_BRANCHE='main',CLE_GH='calmland_gh_token',CLE_ATTENTE='calmland_gh_attente';
let ghTimer=null,ghEnCours=false,ghRelance=false;
function ghToken(){try{return localStorage.getItem(CLE_GH)||'';}catch(e){return '';}}
function ghEtat(t){const e=$('gh-etat');if(e)e.textContent=t;const m=$('mob-gh-etat');if(m)m.textContent=t;}
function ghUrl(){return 'https://api.github.com/repos/'+GH_DEPOT+'/contents/'+GH_FICHIER;}
function ghB64(t){const b=new TextEncoder().encode(t);let s='';for(const c of b)s+=String.fromCharCode(c);return btoa(s);}
function ghDecode(b){const s=atob(b.replace(/\s/g,'')),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new TextDecoder().decode(u);}
async function ghLire(){const r=await fetch(ghUrl()+'?ref='+GH_BRANCHE+'&t='+Date.now(),{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(r.status===404)return null;if(!r.ok)throw new Error('lecture '+r.status);const j=await r.json();return {sha:j.sha,texte:ghDecode(j.content)};}
async function ghEnvoyer(){
 const tok=ghToken();if(!tok){ghEtat('⚠️ Pas de clé GitHub sur cet appareil : modifs gardées ici seulement');return;}
 if(ghEnCours){ghRelance=true;return;}ghEnCours=true;ghEtat('Envoi vers GitHub…');
 try{
  const texte=planExporter();
  for(let essai=0;essai<2;essai++){
   const cur=await ghLire();
   const r=await fetch(ghUrl(),{method:'PUT',headers:{Authorization:'Bearer '+tok,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:JSON.stringify(Object.assign({message:'Plan modifié depuis l\'éditeur',content:ghB64(texte),branch:GH_BRANCHE},cur?{sha:cur.sha}:{}))});
   if(r.ok){try{localStorage.removeItem(CLE_ATTENTE);}catch(e){}ghEtat('✅ Enregistré sur GitHub à '+new Date().toLocaleTimeString());break;}
   if(r.status===401||r.status===403){ghEtat('⚠️ Clé GitHub refusée : vérifie-la dans « Sauvegarde GitHub »');break;}
   if(essai===1)ghEtat('⚠️ Échec de l\'envoi ('+r.status+')');
  }
 }catch(e){ghEtat('⚠️ Pas de connexion : modifs gardées ici, renvoi au prochain changement');}
 ghEnCours=false;if(ghRelance){ghRelance=false;ghPlanifier();}
}
function ghPlanifier(){if(PUBLIC)return;try{localStorage.setItem(CLE_ATTENTE,'1');}catch(e){}if(!ghToken())return;clearTimeout(ghTimer);ghTimer=setTimeout(ghEnvoyer,2500);ghEtat('Modifs à envoyer…');}
async function ghCharger(force){
 if(PUBLIC||typeof fetch==='undefined')return;
 try{
  let attente=false,local='';try{attente=!!localStorage.getItem(CLE_ATTENTE);local=localStorage.getItem(CLE_PLAN)||'';}catch(e){}
  if(!force&&attente&&ghToken()){await ghEnvoyer();return;}
  const cur=await ghLire();
  if(!cur){if(ghToken()&&local)ghPlanifier();else ghEtat(ghToken()?'Aucun plan sur GitHub pour l\'instant':'Pas de clé GitHub sur cet appareil : ouvre « Sauvegarde GitHub » pour enregistrer');return;}
  if(!force&&undo.length){return;}
  if(cur.texte!==planExporter()){planImporter(cur.texte);if(!SC[G.player.scene])allerEd('village');majScenesEd();dessinerFond();const neuf=planExporter();try{localStorage.setItem(CLE_PLAN,neuf);localStorage.removeItem(CLE_ATTENTE);}catch(e){}if(neuf!==cur.texte)ghPlanifier();}
  ghEtat(ghToken()?'✅ Plan chargé depuis GitHub':'Plan chargé depuis GitHub (lecture seule : pas de clé sur cet appareil)');
 }catch(e){ghEtat('⚠️ GitHub injoignable : plan local utilisé');}
}
function brancherGh(){if(PUBLIC)return;
 if(typeof location!=='undefined'){const m=(location.hash||'').match(/^#cle=(.+)$/);if(m){try{localStorage.setItem(CLE_GH,decodeURIComponent(m[1]));}catch(e){}try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}}
 $('gh-lien').onclick=()=>{const t=ghToken();if(!t){ghEtat('Enregistre d\'abord ta clé');return;}const u=location.origin+location.pathname+'#cle='+encodeURIComponent(t);const fin=()=>{try{prompt('Copie ce lien et garde-le (notes, favoris) :',u);}catch(e){}};try{navigator.clipboard.writeText(u).then(()=>ghEtat('✅ Lien copié : garde-le en lieu sûr'),fin);}catch(e){fin();}};
 $('gh-sauver-cle').onclick=()=>{const v=$('gh-token').value.trim();if(!v){ghEtat('Colle ta clé dans le champ avant');return;}try{localStorage.setItem(CLE_GH,v);}catch(e){}$('gh-token').value='';ghEtat('Clé enregistrée sur cet appareil');ghCharger(false);};
 $('gh-envoyer').onclick=()=>ghEnvoyer();
 $('gh-recharger').onclick=()=>ghCharger(true);}
function sauverPlan(){if(PUBLIC)return;try{localStorage.setItem(CLE_PLAN,planExporter());}catch(e){}ghPlanifier();}
function lirePlan(){try{const t=PUBLIC?PLAN_FIGE:localStorage.getItem(CLE_PLAN);if(t)planImporter(t);}catch(e){}}
function majTexteEd(){const t=$('ed-txt');if(document.activeElement!==t)t.value=planExporter();}
function msg(t){const e=$('ed-msg');e.textContent=t;setTimeout(()=>{e.textContent='';},2200);}
function basculerEditeur(depuisMenu){
 if(!EDIT){if(G.queue.length||G.keypad)return;EDIT=true;edMenu=!!depuisMenu;
  zoomAvant=ZOOM;centrerEd();
  $('editeur').hidden=false;$('biblio').hidden=false;majTexteEd();}
 else{EDIT=false;drag=null;selEd=null;degager();$('editeur').hidden=true;$('biblio').hidden=true;ZOOM=zoomAvant;$('zoom-val').textContent=Math.round(ZOOM*100)+' %';
  if(edMenu){G.mode='menu';$('menu').hidden=false;}}
}
function pushUndo(){undo.push(planExporter());if(undo.length>40)undo.shift();}
function majApres(){appliquerPlan();dessinerFond();sauverPlan();majTexteEd();majDest();}
function annuler(){if(!undo.length){msg('Rien à annuler');return;}try{planImporter(undo.pop());selEd=null;if(!SC[G.player.scene])allerEd('village');majScenesEd();dessinerFond();sauverPlan();majTexteEd();msg('Annulé');}catch(e){}}
function supprimerSel(){if(!selEd)return;
 if(selEd.kind==='m'){pushUndo();const a=MURS[G.player.scene],i=a.indexOf(selEd.ref);if(i>=0)a.splice(i,1);selEd=null;majApres();return;}
 if(selEd.kind==='r'){const r=selEd.ref,i=ROUTES.indexOf(r);if(i<3&&confirmDel!==r){confirmDel=r;msg('Route de l\'histoire (les personnages la suivent) : appuie encore sur Suppr pour confirmer');setTimeout(()=>{if(confirmDel===r)confirmDel=null;},4000);return;}pushUndo();if(i<3)r.off=true;else ROUTES.splice(i,1);confirmDel=null;selEd=null;majApres();return;}
 if(selEd.kind==='i'){const sc=G.player.scene,it=selEd.ref,sp=SPRI[it[2]];if(sp.story&&confirmDel!==it){confirmDel=it;msg('Objet de l\'histoire : appuie encore sur Suppr pour confirmer');setTimeout(()=>{if(confirmDel===it)confirmDel=null;},4000);return;}pushUndo();const i=ITEMS[sc].indexOf(it);if(i>=0)ITEMS[sc].splice(i,1);confirmDel=null;selEd=null;majApres();return;}
 if(selEd.kind==='u'){pushUndo();const i=BUISSONS.indexOf(selEd.ref);if(i>=0)BUISSONS.splice(i,1);}
 else{const b=selEd.ref;if(confirmDel!==b){confirmDel=b;msg('Bâtiment de l\'histoire : appuie encore sur Suppr pour confirmer');setTimeout(()=>{if(confirmDel===b)confirmDel=null;},4000);return;}pushUndo();b.off=true;confirmDel=null;}
 selEd=null;majApres();}
function poserDecor(key,wx,wy){if(G.player.scene!=='village'){const sp=SPRI[key],sc=G.player.scene;pushUndo();const it=[Math.round((wx-sp.w/2)/16)*16,Math.round((wy+sp.h/2)/16)*16,key];ITEMS[sc].push(it);selEd={kind:'i',ref:it,w:sp.w,h:sp.h};majApres();return;}
 const sp=SPR[key];pushUndo();const it=[Math.round((wx-sp.w/2)/32)*32,Math.round((wy+sp.h/2)/32)*32,key];BUISSONS.push(it);selEd={kind:'u',ref:it,w:sp.w,h:sp.h};majApres();}
function construireBiblio(){majBiblio();}
function majBiblio(){const L=$('biblio-liste');L.innerHTML='';const inter=G.player.scene!=='village',S=inter?SPRI:SPR,IM=inter?IMG.atlas_int:IMG.atlas;
 const cats=inter?[['base','Mobilier de base'],['chambre','Chambre'],['salon','Salon'],['cuisine','Cuisine'],['bain','Salle de bain'],['divers','Divers']]:[['arbre','Arbres'],['buisson','Buissons et haies'],['fleur','Fleurs et pots']];
 for(const [cat,titre] of cats){const h=document.createElement('h4');h.textContent=titre;L.appendChild(h);const g=document.createElement('div');g.className='grille';L.appendChild(g);
  for(const k in S){const sp=S[k];if(sp.cat!==cat||k==='machine')continue;const c=document.createElement('canvas');c.width=44;c.height=44;c.title=sp.nom;
   const x=c.getContext('2d');x.imageSmoothingEnabled=false;const s=Math.min(1,40/sp.w,40/sp.h),dw=Math.max(1,Math.round(sp.w*s)),dh=Math.max(1,Math.round(sp.h*s));x.drawImage(IM,sp.x,sp.y,sp.w,sp.h,Math.round((44-dw)/2),Math.round((44-dh)/2),dw,dh);
   c.addEventListener('pointerdown',e=>{e.preventDefault();demarrerGlisse(k,c,e);});g.appendChild(c);}}
 if(!inter)ajouterRoutesBiblio(L);else ajouterMursBiblio(L);}
const RT=[{nom:'Route horizontale (20 cases)',w:640,h:96,t:'p'},{nom:'Route horizontale (10 cases)',w:320,h:96,t:'p'},{nom:'Route verticale (20 cases)',w:64,h:640,t:'p'},{nom:'Route verticale (10 cases)',w:64,h:320,t:'p'},{nom:'Chemin de terre horizontal',w:320,h:64,t:'t'},{nom:'Chemin de terre vertical',w:64,h:320,t:'t'}];
function ajouterRoutesBiblio(L){const h=document.createElement('h4');h.textContent='Routes et chemins';L.appendChild(h);const g=document.createElement('div');g.className='grille';L.appendChild(g);
 for(const rt of RT){const c=document.createElement('canvas');c.width=44;c.height=44;c.title=rt.nom;const x=c.getContext('2d'),s=Math.min(40/rt.w,40/rt.h),dw=Math.max(4,Math.round(rt.w*s)),dh=Math.max(4,Math.round(rt.h*s));
  x.fillStyle=rt.t==='t'?'#9b6e3c':'#85858c';x.fillRect(Math.round((44-dw)/2),Math.round((44-dh)/2),dw,dh);
  c.addEventListener('pointerdown',e=>{e.preventDefault();glisserRoute(rt,e);});g.appendChild(c);}}
function glisserRoute(rt,e){const r0=cv.getBoundingClientRect(),f=document.createElement('div');f.style.cssText='position:fixed;pointer-events:none;z-index:99;opacity:.7;background:'+(rt.t==='t'?'#9b6e3c':'#85858c')+';width:'+Math.round(rt.w*ZOOM*r0.width/VW)+'px;height:'+Math.round(rt.h*ZOOM*r0.height/VH)+'px;';document.body.appendChild(f);
 const place=ev=>{f.style.left=(ev.clientX-f.offsetWidth/2)+'px';f.style.top=(ev.clientY-f.offsetHeight/2)+'px';};place(e);const mv=ev=>place(ev);
 const up=ev=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);f.remove();const r=cv.getBoundingClientRect();let w;
  if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom&&document.elementFromPoint(ev.clientX,ev.clientY)===cv)w=mondeDe(ev);else{const c=camera();w={x:c.x+VW/ZOOM/2,y:c.y+VH/ZOOM/2};}
  pushUndo();const q=[Math.max(0,Math.min(SC.village.w-rt.w,Math.round((w.x-rt.w/2)/32)*32)),Math.max(0,Math.min(SC.village.h-rt.h,Math.round((w.y-rt.h/2)/32)*32)),rt.w,rt.h,rt.t];ROUTES.push(q);selEd={kind:'r',ref:q,w:q[2],h:q[3]};majApres();msg('Posé : '+rt.nom);};
 document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);}
function demarrerGlisse(key,thumb,e){const inter=G.player.scene!=='village',sp=inter?SPRI[key]:SPR[key],IM=inter?IMG.atlas_int:IMG.atlas;const f=document.createElement('canvas');f.width=sp.w;f.height=sp.h;f.style.cssText='position:fixed;pointer-events:none;z-index:99;opacity:.85;image-rendering:pixelated;';
 f.style.width=Math.round(sp.w*ZOOM*cv.getBoundingClientRect().width/VW)+'px';f.style.height=Math.round(sp.h*ZOOM*cv.getBoundingClientRect().height/VH)+'px';
 const fx=f.getContext('2d');fx.imageSmoothingEnabled=false;fx.drawImage(IM,sp.x,sp.y,sp.w,sp.h,0,0,sp.w,sp.h);document.body.appendChild(f);
 const place=ev=>{f.style.left=(ev.clientX-f.offsetWidth/2)+'px';f.style.top=(ev.clientY-f.offsetHeight/2)+'px';};place(e);
 const mv=ev=>place(ev);
 const up=ev=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);f.remove();
  const r=cv.getBoundingClientRect();let w;
  if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom&&document.elementFromPoint(ev.clientX,ev.clientY)===cv)w=mondeDe(ev);
  else{const c=camera();w={x:c.x+VW/ZOOM/2,y:c.y+VH/ZOOM/2};}
  poserDecor(key,w.x,w.y);msg('Posé : '+sp.nom);};
 document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);}
function centrerEd(){const sc=G.player.scene,R=SC[sc];ZOOM=sc==='village'?0.5:1.5;$('zoom-val').textContent=Math.round(ZOOM*100)+' %';
 EC.x=(sc==='village'?G.player.x:R.w/2)-VW/ZOOM/2;EC.y=(sc==='village'?G.player.y:R.h/2)-VH/ZOOM/2;majBiblio();majDest();}
const SPAWN={village:()=>({x:PORTES_V[0].x,y:PORTES_V[0].y+24}),chambre:()=>({x:110,y:166}),salon:()=>({x:256,y:280}),soussol:()=>({x:84,y:182})};
for(const k in INTS)if(!SPAWN[k])SPAWN[k]=()=>{const R=SC[k];return {x:R.w/2,y:R.h-50};};
function allerEd(sc){const p=(SPAWN[sc]||(()=>({x:SC[sc].w/2,y:SC[sc].h-80})))();changerScene(sc,p.x,p.y,3);selEd=null;drag=null;degager();centrerEd();majTexteEd();}
function basculerColl(){if(!selEd||selEd.kind!=='i'){msg('Sélectionne un meuble dans une pièce');return;}pushUndo();const it=selEd.ref;if(it[3])it.length=3;else it[3]=1;msg(it[3]?'Ce meuble est traversable':'Ce meuble est solide');majApres();}
function panEditeur(dt){const {dx,dy}=dirClavier();EC.x+=dx*420*dt/ZOOM;EC.y+=dy*420*dt/ZOOM;}
function debutPinch(){const v=[...ptrs.values()],a=v[0],b=v[1],r=cv.getBoundingClientRect();drag=null;const mx=((a.x+b.x)/2-r.left)*VW/r.width,my=((a.y+b.y)/2-r.top)*VH/r.height,c=camera();pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:ZOOM,mx,my,wx:c.x+mx/ZOOM,wy:c.y+my/ZOOM};}
function majPinch(){const v=[...ptrs.values()],a=v[0],b=v[1],d=Math.hypot(a.x-b.x,a.y-b.y)||1;ZOOM=Math.max(0.08,Math.min(2.4,pinch.z*d/pinch.d));EC.x=pinch.wx-pinch.mx/ZOOM;EC.y=pinch.wy-pinch.my/ZOOM;$('zoom-val').textContent=Math.round(ZOOM*100)+' %';}
// ---------- MODE MOBILE (page mobile.html : jeu, éditeur et test au doigt) ----------
let toastT=null;
function toast(t){const e=$('mob-toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{e.hidden=true;},3500);}
function ouvrirMenuMob(){majLibMob();$('mob-menu').hidden=false;}
function fermerMenuMob(){$('mob-menu').hidden=true;}
function majLibMob(){$('mm-son').textContent=son?'🔊 Son : oui':'🔇 Son : non';$('mm-courir').textContent=touches.shift?'🏃 Courir : oui':'🏃 Courir : non';$('mm-coll').textContent=VOIR_COLL?'🧱 Collisions : vues':'🧱 Collisions : cachées';$('mm-panneau').textContent=panneauMasque?'▤ Panneau : caché':'▤ Panneau : visible';}
function ouvrirCle(){$('mob-gh-etat').textContent=($('gh-etat')&&$('gh-etat').textContent)||'';$('mob-cle').hidden=false;}
function pleinEcran(){const d=typeof document!=='undefined'?document.documentElement:null;try{if(document.fullscreenElement){document.exitFullscreen();return;}if(d&&d.requestFullscreen){d.requestFullscreen();return;}}catch(e){}toast('Sur iPhone : touche Partager, puis « Sur l\'écran d\'accueil », et ouvre Calm Land depuis cette icône');}
let joyOn=null;
function joyReset(){joyOn=null;touches.tg=touches.td=touches.th=touches.tb=false;const k=$('mob-joy-knob');if(k)k.style.transform='translate(-50%,-50%)';}
function joyPoser(x,y){const r=$('mob-joy').getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2;let dx=x-cx,dy=y-cy;const m=Math.hypot(dx,dy);
 if(m>R*0.5){dx*=R*0.5/m;dy*=R*0.5/m;}$('mob-joy-knob').style.transform='translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';
 if(m<R*0.22){touches.tg=touches.td=touches.th=touches.tb=false;return;}
 const nx=(x-cx)/m,ny=(y-cy)/m;touches.tg=nx<-0.38;touches.td=nx>0.38;touches.th=ny<-0.38;touches.tb=ny>0.38;}
function majMobile(){const portrait=innerHeight>innerWidth;$('mob-barre').hidden=!EDIT;$('obj').hidden=EDIT;$('tactile').hidden=EDIT||G.mode!=='jeu'||(coteVisible&&portrait);$('mob-joy').hidden=$('tactile').hidden;if($('mob-joy').hidden&&joyOn!==null)joyReset();if(((MOBILE&&EDIT)?56:0)!==derBh)ajuster();}
function brancherMobile(){if(!MOBILE)return;
 const f=fn=>()=>{fn();fermerMenuMob();};
 const J=$('mob-joy');J.addEventListener('pointerdown',e=>{e.preventDefault();joyOn=e.pointerId;try{J.setPointerCapture(e.pointerId);}catch(x){}joyPoser(e.clientX,e.clientY);});
 J.addEventListener('pointermove',e=>{if(joyOn===e.pointerId)joyPoser(e.clientX,e.clientY);});
 const joyFin=e=>{if(joyOn===e.pointerId)joyReset();};J.addEventListener('pointerup',joyFin);J.addEventListener('pointercancel',joyFin);
 $('mob-fab').onclick=ouvrirMenuMob;$('gh-etat').onclick=ouvrirCle;$('mob-fermer').onclick=fermerMenuMob;$('mob-menu').onclick=e=>{if(e.target===$('mob-menu'))fermerMenuMob();};
 $('mm-edit').onclick=f(()=>{panneauMasque=false;if(!$('menu').hidden)$('b-editeur').onclick();else if(G.mode==='jeu'&&!EDIT&&(G.queue.length||G.keypad))toast('Termine d\'abord le dialogue en cours (touche l\'écran)');else if(G.mode==='jeu')basculerEditeur();});
 $('mm-test').onclick=f(()=>{panneauMasque=false;if(G.mode!=='menu')basculerTest();});
 $('mm-cle').onclick=f(ouvrirCle);$('mm-m1').onclick=f(()=>sauterTemps(1));$('mm-m5').onclick=f(()=>sauterTemps(5));
 $('mm-courir').onclick=()=>{touches.shift=!touches.shift;majLibMob();};
 $('mm-zm').onclick=()=>zoom(-1);$('mm-zp').onclick=()=>zoom(1);
 $('mm-coll').onclick=()=>{VOIR_COLL=!VOIR_COLL;majLibMob();};
 $('mm-panneau').onclick=()=>{panneauMasque=!panneauMasque;majLibMob();};
 $('mm-son').onclick=()=>{son=!son;majLibMob();};
 $('mm-guide').onclick=f(()=>{if(G.mode!=='menu')$('guide').hidden=!$('guide').hidden;});
 $('mm-plein').onclick=f(pleinEcran);
 $('mb-annuler').onclick=()=>annuler();$('mb-suppr').onclick=()=>supprimerSel();$('mb-zm').onclick=()=>zoom(-1);$('mb-zp').onclick=()=>zoom(1);
 $('mb-panneau').onclick=()=>{panneauMasque=!panneauMasque;};$('mb-quitter').onclick=()=>basculerEditeur();
 $('mob-cle-fermer').onclick=()=>{$('mob-cle').hidden=true;};
 $('mob-coller').onclick=async()=>{let t=($('mob-token').value||'').trim();if(!t){try{t=((await navigator.clipboard.readText())||'').trim();}catch(e){}}
  if(!t){ghEtat('Rien dans le presse-papiers : fais un appui long dans le champ du dessous, Coller, puis ré-appuie ici');$('mob-token').focus();return;}
  $('gh-token').value=t;$('mob-token').value='';$('gh-sauver-cle').onclick();setTimeout(()=>{$('mob-cle').hidden=true;},1500);};
 $('mob-token').oninput=()=>{const v=$('mob-token').value.trim();if(/^(github_pat_|ghp_|gho_)\w{20,}$/.test(v))$('mob-coller').onclick();};
 $('mob-envoyer').onclick=()=>ghEnvoyer();$('mob-recharger').onclick=()=>ghCharger(true);$('mob-lien').onclick=()=>$('gh-lien').onclick();
 if(!ghToken())ouvrirCle();}
function mondeDe(e){const r=cv.getBoundingClientRect(),c=camera();return {x:c.x+(e.clientX-r.left)*VW/r.width/ZOOM,y:c.y+(e.clientY-r.top)*VH/r.height/ZOOM};}
function toucher(w){let best=null,ba=1e12;
 if(G.player.scene!=='village'){for(const it of ITEMS[G.player.scene]){const sp=SPRI[it[2]];if(!sp)continue;if(w.x>=it[0]&&w.x<=it[0]+sp.w&&w.y>=it[1]-sp.h&&w.y<=it[1]){const a=sp.w*sp.h;if(a<=ba){ba=a;best={kind:'i',ref:it,w:sp.w,h:sp.h};}}}for(const r of (MURS[G.player.scene]||[])){if(w.x>=r[0]&&w.x<=r[0]+r[2]&&w.y>=r[1]&&w.y<=r[1]+r[3]){const a=r[2]*r[3];if(a<=ba){ba=a;best={kind:'m',ref:r,w:r[2],h:r[3]};}}}return best;}
 for(const b of BAT){if(!b.off&&w.x>=b[1]&&w.x<=b[1]+b[3]&&w.y>=b[2]&&w.y<=b[2]+b[4]){const a=b[3]*b[4];if(a<ba){ba=a;best={kind:'b',ref:b,w:b[3],h:b[4]};}}}
 for(const u of BUISSONS){const sp=SPR[u[2]],ww=sp.w,hh=sp.h;if(w.x>=u[0]&&w.x<=u[0]+ww&&w.y>=u[1]-hh&&w.y<=u[1]){const a=ww*hh;if(a<ba){ba=a;best={kind:'u',ref:u,w:ww,h:hh};}}}
 if(!best){for(const r of ROUTES){if(r.off)continue;if(w.x>=r[0]&&w.x<=r[0]+r[2]&&w.y>=r[1]&&w.y<=r[1]+r[3])best={kind:'r',ref:r,w:r[2],h:r[3]};}}
 return best;}
function deplacer(h,nx,ny){
 if(h.kind==='m'){const R=SC[G.player.scene];nx=Math.max(12,Math.min(R.w-12-h.w,nx));ny=Math.max(20,Math.min(R.h-12-h.h,ny));if(h.ref[0]===nx&&h.ref[1]===ny)return;h.ref[0]=nx;h.ref[1]=ny;sauverPlan();majTexteEd();return;}
 if(h.kind==='r'){const R=SC.village;nx=Math.max(0,Math.min(R.w-h.w,nx));ny=Math.max(0,Math.min(R.h-h.h,ny));if(h.ref[0]===nx&&h.ref[1]===ny)return;h.ref[0]=nx;h.ref[1]=ny;appliquerPlan();dessinerFond();sauverPlan();majTexteEd();return;}
 if(h.kind==='i'){const R=SC[G.player.scene];nx=Math.max(0,Math.min(R.w-h.w,nx));ny=Math.max(h.h,Math.min(R.h,ny));if(h.ref[0]===nx&&h.ref[1]===ny)return;h.ref[0]=nx;h.ref[1]=ny;sauverPlan();majTexteEd();return;}
const R=SC.village;nx=Math.max(0,Math.min(R.w-h.w,nx));
 if(h.kind==='b'){ny=Math.max(0,Math.min(R.h-h.h,ny));if(h.ref[1]===nx&&h.ref[2]===ny)return;h.ref[1]=nx;h.ref[2]=ny;}
 else{ny=Math.max(h.h,Math.min(R.h,ny));if(h.ref[0]===nx&&h.ref[1]===ny)return;h.ref[0]=nx;h.ref[1]=ny;}
 appliquerPlan();dessinerFond();sauverPlan();majTexteEd();}
const PAS_ED={v:16};let fondSale=false,dernFond=0;
function poignees(){if(!selEd||(selEd.kind!=='r'&&selEd.kind!=='m'))return [];const r=selEd.ref;if(r.off)return [];const hor=r[2]>=r[3];
 return hor?[{c:'debut',x:r[0],y:r[1]+r[3]/2},{c:'fin',x:r[0]+r[2],y:r[1]+r[3]/2}]:[{c:'debut',x:r[0]+r[2]/2,y:r[1]},{c:'fin',x:r[0]+r[2]/2,y:r[1]+r[3]}];}
function toucherPoignee(w){const k=cv.getBoundingClientRect().width/VW,R=(MOBILE?34:18)/(k*ZOOM);let best=null,bd=R;for(const p of poignees()){const d=Math.hypot(p.x-w.x,p.y-w.y);if(d<=bd){bd=d;best=p;}}return best;}
function dessinerPoignees(){const s=(MOBILE?16:8)/ZOOM;cx.lineWidth=2/ZOOM;for(const p of poignees()){cx.fillStyle='#ffe15a';cx.strokeStyle='#1b1b1b';cx.fillRect(p.x-s,p.y-s,2*s,2*s);cx.strokeRect(p.x-s,p.y-s,2*s,2*s);}}
function etirerSel(cote,d){if(!d)return true;const ok=selEd.kind==='r'?etirerRoute(selEd.ref,cote,d):etirerMur(G.player.scene,selEd.ref,cote,d);
 if(ok){selEd.w=selEd.ref[2];selEd.h=selEd.ref[3];appliquerPlan();if(G.player.scene==='village')fondSale=true;sauverPlan();majTexteEd();}return ok;}
function dessinerEditeur(cam){dessinerEditeur0(cam);dessinerPoignees();}
function dessinerEditeur0(cam){const vw=VW/ZOOM,vh=VH/ZOOM;
 cx.strokeStyle='rgba(255,255,255,.12)';cx.lineWidth=1/ZOOM;cx.beginPath();
 const gs=(G.player.scene==='village'?32:16)*(ZOOM<0.18?4:ZOOM<0.35?2:1);
 for(let x=Math.floor(cam.x/gs)*gs;x<cam.x+vw;x+=gs){cx.moveTo(x,cam.y);cx.lineTo(x,cam.y+vh);}
 for(let y=Math.floor(cam.y/gs)*gs;y<cam.y+vh;y+=gs){cx.moveTo(cam.x,y);cx.lineTo(cam.x+vw,y);}cx.stroke();
 if(G.player.scene!=='village'){cx.lineWidth=1.5/ZOOM;for(const it of ITEMS[G.player.scene]){const sp=SPRI[it[2]];if(!sp)continue;const s=selEd&&selEd.ref===it;cx.strokeStyle=s?'#ffe15a':(sp.story?'rgba(255,170,90,.9)':'rgba(120,200,255,.7)');cx.strokeRect(it[0],it[1]-sp.h,sp.w,sp.h);if(s){cx.fillStyle='rgba(255,225,90,.14)';cx.fillRect(it[0],it[1]-sp.h,sp.w,sp.h);cx.fillStyle='#ffe15a';cx.font='bold '+(11/ZOOM)+'px system-ui';cx.textAlign='left';cx.fillText(sp.nom+'  '+it[0]+', '+it[1]+(it[3]?'  (traversable)':''),it[0],it[1]-sp.h-3/ZOOM);}}for(const r of (MURS[G.player.scene]||[])){const s=selEd&&selEd.ref===r;cx.strokeStyle=s?'#ffe15a':'rgba(255,120,200,.9)';cx.strokeRect(r[0],r[1],r[2],r[3]);}return;}

 const fsz=Math.min(12/ZOOM,34);cx.lineWidth=2/ZOOM;cx.font='bold '+fsz+'px system-ui';cx.textAlign='left';
 for(const b of BAT){if(b.off)continue;const s=selEd&&selEd.ref===b;cx.strokeStyle=s?'#ffe15a':'rgba(120,200,255,.85)';cx.strokeRect(b[1],b[2],b[3],b[4]);if(s){cx.fillStyle='rgba(255,225,90,.12)';cx.fillRect(b[1],b[2],b[3],b[4]);}
  cx.fillStyle=s?'#ffe15a':'#bfe6ff';cx.fillText(b[0].replace('_',' ')+'  '+b[1]+', '+b[2],b[1]+4,b[2]+fsz*1.3);}
 for(const u of BUISSONS){const sp=SPR[u[2]],w=sp.w,h=sp.h,s=selEd&&selEd.ref===u;cx.strokeStyle=s?'#ffe15a':'rgba(120,255,160,.85)';cx.strokeRect(u[0],u[1]-h,w,h);}
 for(const r of ROUTES){if(r.off)continue;const s=selEd&&selEd.ref===r;cx.strokeStyle=s?'#ffe15a':'rgba(255,170,90,.85)';cx.strokeRect(r[0],r[1],r[2],r[3]);}}
function brancherEditeur(){
 cv.addEventListener('pointerdown',e=>{if(!EDIT)return;e.preventDefault();if(e.pointerType==='mouse')ptrs.clear();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){debutPinch();try{cv.setPointerCapture(e.pointerId);}catch(x){}return;}const w=mondeDe(e),hp=toucherPoignee(w);if(hp){drag={poignee:hp.c};try{cv.setPointerCapture(e.pointerId);}catch(x){}return;}const h=toucher(w);
  if(h){selEd=h;const p=h.kind==='b'?{x:h.ref[1],y:h.ref[2]}:{x:h.ref[0],y:h.ref[1]};drag={ox:w.x-p.x,oy:w.y-p.y};}
  else{selEd=null;drag={pan:true,sx:e.clientX,sy:e.clientY,cx:EC.x,cy:EC.y};}
  majDest();try{cv.setPointerCapture(e.pointerId);}catch(x){}});
 cv.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&ptrs.size>=2){majPinch();return;}if(!EDIT||!drag)return;
  if(drag.pan){const r=cv.getBoundingClientRect();EC.x=drag.cx-(e.clientX-drag.sx)*VW/r.width/ZOOM;EC.y=drag.cy-(e.clientY-drag.sy)*VH/r.height/ZOOM;return;}
  if(drag.poignee){if(!drag.pushed){pushUndo();drag.pushed=true;}const w=mondeDe(e),r=selEd.ref,pas=PAS_ED.v;
   if(r[2]>=r[3]){const t=Math.round(w.x/pas)*pas;etirerSel(drag.poignee,drag.poignee==='fin'?t-(r[0]+r[2]):r[0]-t);}else{const t=Math.round(w.y/pas)*pas;etirerSel(drag.poignee,drag.poignee==='fin'?t-(r[1]+r[3]):r[1]-t);}return;}
  if(!drag.pushed){pushUndo();drag.pushed=true;}
  const w=mondeDe(e);{const g=G.player.scene==='village'?32:16;deplacer(selEd,Math.round((w.x-drag.ox)/g)*g,Math.round((w.y-drag.oy)/g)*g);}});
 const finPtr=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;drag=null;};cv.addEventListener('pointerup',finPtr);cv.addEventListener('pointercancel',finPtr);
 $('ed-copier').onclick=()=>{const t=$('ed-txt');t.value=planExporter();const fin=()=>{t.select();try{document.execCommand('copy');}catch(x){}msg('Plan copié');};
  try{navigator.clipboard.writeText(t.value).then(()=>msg('Plan copié'),fin);}catch(x){fin();}};
 $('ed-appliquer').onclick=()=>{try{pushUndo();planImporter($('ed-txt').value);if(!SC[G.player.scene])allerEd('village');majScenesEd();dessinerFond();sauverPlan();msg('Plan appliqué');}catch(x){msg('Texte invalide');}};
 $('ed-reinit').onclick=()=>{planReinit();dessinerFond();sauverPlan();majTexteEd();msg('Plan d\'origine remis');};
 $('ed-quitter').onclick=()=>basculerEditeur();
 majScenesEd();construireStyles();
 $('ed-dest').onchange=e=>{if(selEd&&selEd.kind==='i'&&(selEd.ref[2]==='porte'||selEd.ref[2]==='passage')){pushUndo();selEd.ref[4]=e.target.value;sauverPlan();majTexteEd();msg('Destination changée');}};
 $('np-creer').onclick=()=>{const sc=G.player.scene;if(!INTS[sc]){msg('Entre d\'abord dans une maison (boutons de scène), puis crée la pièce');return;}
  const [tw,th]=$('np-taille').value.split(',').map(Number);pushUndo();const id=creerPiece($('np-nom').value.trim(),tw,th,NP.fl,NP.wl,sc,$('np-passage').checked?'passage':'porte');sauverPlan();majScenesEd();allerEd(id);majTexteEd();msg('Pièce créée : '+INTS[id].nom);$('np-nom').value='';};
 $('ag-go').onclick=()=>{const sc=G.player.scene;if(!INTS[sc]){msg('Entre d\'abord dans une pièce (boutons de scène)');return;}pushUndo();
  if(!agrandir(sc,$('ag-cote').value,+$('ag-n').value)){undo.pop();msg('Impossible : taille maximale 40 x 25 cases');return;}
  {const e=+$('ag-n').value*32,c=$('ag-cote').value;if(c==='gauche')EC.x+=e;if(c==='haut')EC.y+=e;}selEd=null;sauverPlan();majTexteEd();msg('Pièce agrandie');};
 $('np-suppr').onclick=()=>{const id=G.player.scene,I=INTS[id];if(!I||!I.user)return;const dep=Object.keys(ITEMS).find(k=>k!==id&&ITEMS[k].some(i=>i[2]==='porte'&&i[4]===id));pushUndo();supprimerPiece(id);sauverPlan();majScenesEd();allerEd(dep&&INTS[dep]?dep:'village');majTexteEd();msg('Pièce supprimée');};$('ed-coll').onclick=()=>basculerColl();
 const pasEd=()=>+$('ed-pas').value||16;
 const et=(cote,sg)=>()=>{if(!selEd||(selEd.kind!=='r'&&selEd.kind!=='m')){msg('Sélectionne une route ou un mur');return;}pushUndo();if(!etirerSel(cote,sg*pasEd())){undo.pop();msg('Limite atteinte');}};
 $('ed-rplus').onclick=et('fin',1);$('ed-rmoins').onclick=et('fin',-1);$('ed-dplus').onclick=et('debut',1);$('ed-dmoins').onclick=et('debut',-1);
 $('ed-pas').onchange=()=>{PAS_ED.v=pasEd();};
 $('vg-go').onclick=()=>{if(G.player.scene!=='village'){msg('Choisis « Village » dans Pièce');return;}pushUndo();const c=$('vg-cote').value,n=+$('vg-n').value,e=n*32,cs=c==='tout'?['haut','bas','gauche','droite']:[c];let fait=0;
  for(const q of cs){if(!agrandirVillage(q,n))break;fait++;if(q==='gauche')EC.x+=e;if(q==='haut')EC.y+=e;}
  if(!fait){undo.pop();msg('Taille maximale atteinte ('+VMAX.w+' x '+VMAX.h+')');return;}selEd=null;dessinerFond();sauverPlan();majTexteEd();majDest();msg(fait<cs.length?'Agrandi en partie (taille maximale)':'Village agrandi');};
 $('ed-suppr').onclick=()=>supprimerSel();$('ed-annuler').onclick=()=>annuler();
 $('b-editeur').onclick=()=>{demarrer(false);G.queue=[];courant=null;attenteFx=0;$('dialogue').hidden=true;$('titre').hidden=true;$('titre').dataset.noir='0';basculerEditeur(true);};
}
// ---------- BOUCLE PRINCIPALE ----------
let dernier=performance.now();
function frame(now){majCote();
 const dt=Math.min(0.05,(now-dernier)/1000);dernier=now;tReel+=dt;
 majMusique(dt);majBoutonSon();
 if(MOBILE)majMobile();
 if(EDIT){const sl=$('ed-scenes');if(sl&&sl.value!==G.player.scene)sl.value=G.player.scene;const vi=$('vg-info');if(vi){const t='Village : '+SC.village.w+' x '+SC.village.h+' px';if(vi.textContent!==t)vi.textContent=t;}}
 if(fondSale&&now-dernFond>70){fondSale=false;dernFond=now;dessinerFond();}
 if(attenteFx>0){attenteFx-=dt;if(attenteFx<=0){attenteFx=0;G.queue.shift();$('titre').hidden=true;$('titre').dataset.noir='0';courant=null;pomper();}}
 if(G.mode==='jeu'&&EDIT){panEditeur(dt);}
 if(G.mode==='jeu'&&!EDIT){
  const {dx,dy}=dirClavier();const course=touches.shift?2:1;
  G.player.marche=!!(dx||dy)&&!G.queue.length&&!G.keypad;
  if(dx||dy)bouger(dx,dy,dt*course);
  suivre(dt);degager();
  const avant=G.queue.length;avancer(dt/VITESSE);if(G.queue.length&&!avant)pomper();
  if(!G.prologue&&G.minute>=15&&G.queue.length===0){prochainEclair-=dt;if(prochainEclair<=0){eclair=0.85;prochainEclair=4+Math.random()*6;setTimeout(sonTonnerre,350);}}
  if(!G.prologue&&G.minute>=8&&G.minute<10&&!G.L.cleReprise&&G.queue.length===0){mur+=dt;if(mur>0.7){mur=0;const pr=G.player;const d=pr.scene==='salon'?0:Math.hypot(pr.x-P.porteBen.x,pr.y-P.porteBen.y-8);if(pr.scene==='salon'||(pr.scene==='village'&&d<260))sonMarteau();}}
  if(pluieNode&&ac)pluieNode.gain.value=son?(G.player.scene==='village'?0.05:0.015):0;
  const box=$('dialogue');if(!box.hidden&&courant&&courant.text){if(ecriture<1){ecriture=Math.min(1,ecriture+dt*2.2*Math.max(1,40/courant.text.length));}$('texte').textContent=courant.text.slice(0,Math.ceil(courant.text.length*ecriture));}
  {const o=objectif();$('obj').textContent=o?'➜ '+o.t:'';}
  $('hud').textContent=G.prologue?'Prologue':`Boucle ${numeroBoucle()} · ${String(Math.floor(G.minute)).padStart(2,'0')}:${String(Math.floor(G.minute%1*60)).padStart(2,'0')} / 20:00`;
  $('inv').textContent=(G.L.cleEnMain?'🔑 clé  ':'')+(G.L.aLaViande?'🥩 viande  ':'')+(G.mem.codeAppris?'🔢 code connu':'');
  majPave();if(Math.floor(tReel*4)%2===0)majTest();
 }
 if(eclair>0)eclair=Math.max(0,eclair-dt*2.5);
 dessiner(tReel);requestAnimationFrame(frame);
}
let coteVisible=false;
function majCote(){const v=!panneauMasque&&!($('editeur').hidden&&$('biblio').hidden&&$('test').hidden);if(v!==coteVisible){coteVisible=v;$('cote').hidden=!v;ajuster();}}
function ajuster(){const bh=(MOBILE&&EDIT)?56:0,etroit=MOBILE?innerHeight>innerWidth:innerWidth<=800,cw=coteVisible&&!etroit?(MOBILE?Math.min(340,Math.round(innerWidth*0.42)):340):0,ch=coteVisible&&etroit&&!MOBILE?Math.round(innerHeight*0.42):0;derBh=bh;if(MOBILE&&document.body.style){document.body.style.paddingBottom=bh+'px';if(document.body.style.setProperty)document.body.style.setProperty('--cw',cw+'px');}const s=Math.min((innerWidth-cw)/VW,(innerHeight-bh-ch)/VH);const w=Math.floor(VW*s),h=Math.floor(VH*s);if(MOBILE&&document.body.style&&document.body.style.setProperty)document.body.style.setProperty('--eh',h+'px');const z=$('ecran');z.style.width=w+'px';z.style.height=h+'px';z.style.fontSize=Math.max(MOBILE?14:11,Math.round(h/30))+'px';}
addEventListener('resize',ajuster);
function demarrer(prol){initSon();lancerMusique();VITESSE=+$('vitesse').value||30;$('menu').hidden=true;$('lettre').hidden=true;nouvellePartie(prol);courant=null;pomper();}
function pret(){
 lirePlan();dessinerFond();construireTest();ajuster();brancherEditeur();construireBiblio();brancherGh();ghCharger(false);brancherMobile();
 document.querySelectorAll('#outils [data-o]').forEach(b=>b.onclick=()=>{const o=b.dataset.o;if(o==='m1')sauterTemps(1);else if(o==='m5')sauterTemps(5);else if(o==='z-')zoom(-1);else if(o==='z+')zoom(1);else if(o==='guide')$('guide').hidden=!$('guide').hidden;else if(o==='edit')basculerEditeur();else if(o==='coll')VOIR_COLL=!VOIR_COLL;b.blur();});
 $('guide-fermer').onclick=()=>$('guide').hidden=true;
 $('b-son').onclick=()=>{basculerSon();$('b-son').blur();};
 $('b-prologue').onclick=()=>demarrer(true);$('b-boucle').onclick=()=>demarrer(false);
 $('b-test').onclick=()=>{demarrer(false);$('test').hidden=false;};
 $('dialogue').onclick=()=>action();$('titre').onclick=()=>action();$('lettre').onclick=()=>action();
 document.querySelectorAll('#pave button').forEach(b=>b.onclick=()=>pave(b.dataset.k));
 if(MOBILE||matchMedia('(pointer:coarse)').matches)$('tactile').hidden=false;
 document.querySelectorAll('#tactile [data-t]').forEach(b=>{const k=b.dataset.t;b.addEventListener('pointerdown',e=>{e.preventDefault();if(k==='e')action();else touches[k]=true;});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>touches[k]=false));});
 $('chargement').hidden=true;$('menu').hidden=false;requestAnimationFrame(frame);
}
