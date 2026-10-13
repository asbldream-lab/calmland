// Génère plan_croquis.json : le village du croquis (maisons, routes courbes, place, étang, forêt)
const L=require('./logic.js'),fs=require('fs');
const S=3.125,W=4800,H=3200;
let seed=20261013;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
// --- maisons : centres du croquis ---
const C={Maison_Aaron:[150,115],Maison_Benjamin:[375,265],Maison_Paul:[735,185],Pharmacie:[1040,310],Boulangerie:[1190,450],Poste_Police:[1330,200],Maison_Mami:[150,650],Maison_Zoe:[550,640],Maison_Marc:[990,640],Ecole:[1370,735]};
L.SC.village.w=W;L.SC.village.h=H;
for(const b of L.BAT){const c=C[b[0]];b[1]=Math.round(c[0]*S-b[3]/2);b[2]=Math.round(c[1]*S-b[4]/2);b.off=false;}
L.appliquerPlan();
const door={};for(const p of L.PORTES_V)door[p.id]=[p.x/S,(p.y+14)/S]; // en coordonnées croquis
// --- lissage Catmull-Rom, un point tous les ~40 px ---
function lisser(pts){const P=pts.map(p=>[p[0]*S,p[1]*S]);const out=[];const g=i=>P[Math.max(0,Math.min(P.length-1,i))];
 for(let i=0;i<P.length-1;i++){const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2),d=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(1,Math.round(d/40));
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(a=>Math.round(.5*((2*p1[a])+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t2+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t3))));}}
 out.push([Math.round(P[P.length-1][0]),Math.round(P[P.length-1][1])]);return out;}
const d=id=>door[id];
const R0=[[235,95],[330,115],[430,160],[500,225],[535,320],[575,410],[660,462],[780,490],[930,497],[1060,520],[1160,548],[1270,520],[1350,450],[1385,380],[1345,300],d('p_poste')];
const R1=[[1160,548],[1215,610],[1205,700],[1220,790],[1290,860],[1370,888]];
const T=[
 [[235,95],[205,128],[175,150],d('p_aaron')],
 [d('p_aaron'),[170,225],[240,290],[300,352],d('p_benjamin')],
 [d('p_benjamin'),[410,402],[480,422],[560,416],[575,410]],
 [d('p_paul'),[735,335],[705,400],[665,456]],
 [d('p_pharmacie'),[1042,420],[1052,480],[1060,520]],
 [d('p_boulangerie'),[1185,525],[1160,548]],
 [d('p_mami'),[230,790],[340,782],[430,742],[500,736],d('p_zoe')],
 [d('p_zoe'),[605,765],[690,705],[705,610],[668,520],[662,462]],
 [d('p_marc'),[1000,772],[1110,792],[1205,790]],
 [[305,355],[290,430],[300,512],[275,592],[240,684],[225,765]],
 [[520,740],[572,832],[650,892],[705,985]],
 [d('p_ecole'),[1345,884],[1370,888]],
];
const rues=[{p:lisser(R0),w:130,t:'p'},{p:lisser(R1),w:110,t:'p'}];
for(const t of T)rues.push({p:lisser(t),w:56,t:'t'});
const plaza=[760*S,402*S,330,'p'];
const etang=[165*S,468*S,300,160];
const main=rues[0].p;let i0=0,i1=main.length-1,best0=1e18,best1=1e18;
for(let i=0;i<main.length;i++){const a=Math.hypot(main[i][0]-540*S,main[i][1]-330*S),b=Math.hypot(main[i][0]-1160*S,main[i][1]-548*S);if(a<best0){best0=a;i0=i;}if(b<best1){best1=b;i1=i;}}
const RCd={r:rues,c:[plaza],e:[etang],pb:[i0,i1]};
L.rcImport(RCd);
// --- distances pour la végétation ---
const segs=[];for(const s of rues)for(let i=1;i<s.p.length;i++)segs.push([s.p[i-1],s.p[i],s.w/2]);
function dSeg(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)):0;return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy));}
function dRoute(x,y){let m=1e9;for(const s of segs){const dd=dSeg(x,y,s[0],s[1])-s[2];if(dd<m)m=dd;}
 m=Math.min(m,Math.hypot(x-plaza[0],y-plaza[1])-plaza[2]);
 const k=Math.hypot((x-etang[0])/etang[2],(y-etang[1])/etang[3]);m=Math.min(m,(k-1)*Math.min(etang[2],etang[3]));return m;}
const bat=L.BAT.map(b=>({x0:b[1],y0:b[2],x1:b[1]+b[3],y1:b[2]+b[4]}));
function dBat(x,y){let m=1e9;for(const b of bat){const dx=Math.max(b.x0-x,0,x-b.x1),dy=Math.max(b.y0-y,0,y-b.y1+0),dd=Math.hypot(dx,dy);if(dd<m)m=dd;}return m;}
const dev=bat.map(b=>({x0:b.x0-40,x1:b.x1+40,y0:b.y1-40,y1:b.y1+230})); // devant les portes : toujours libre
const devant=(x,y)=>dev.some(b=>x>b.x0&&x<b.x1&&y>b.y0&&y<b.y1);
const SP=L.SPR,ids=c=>Object.keys(SP).filter(k=>SP[k].cat===c);
const AR=ids('arbre'),BU=ids('buisson').filter(k=>/^(buis(1|2|3|4|5|6|7|10|11|12|13|14|15|16|17|18|19|20|21|22|23)|buisson|buisson2)$/.test(k)),FL=ids('fleur').filter(k=>/^fleur\d+$/.test(k));
const pick=a=>a[Math.floor(rnd()*a.length)];
const U=[];const place=(id,cx,by)=>U.push([Math.round(cx-SP[id].w/2),Math.round(by),id]);
const libre=(x,y,m)=>x>60&&x<W-60&&y>110&&y<H-30&&dRoute(x,y)>m&&dBat(x,y)>m*0.8&&!devant(x,y);
// forêt : jittered grid
const G=100;
for(let gx=0;gx<W;gx+=G)for(let gy=0;gy<H+G;gy+=G){const x=gx+rnd()*G,y=gy+rnd()*G;
 const edge=Math.min(x,W-x,y,H-y)<170;const dist=Math.min(dRoute(x,y),dBat(x,y)*1.0);
 let p=edge?0.98:dist<115?0:dist<250?0.55:dist<430?0.82:0.96;
 if(rnd()>p)continue;if(!edge&&!libre(x,y,70))continue;
 if(edge&&(dRoute(x,y)<30||dBat(x,y)<30||devant(x,y)))continue;
 place(pick(AR),x,y);}
// arbre central de la place
place('arbre8',plaza[0],plaza[1]+60);
// buissons / haies autour des maisons et sur les bords des routes
for(const b of bat){const n=14+Math.floor(rnd()*8);for(let k=0;k<n;k++){const side=Math.floor(rnd()*3);let x,y;
  if(side===0){x=b.x0-30-rnd()*90;y=b.y0+rnd()*(b.y1-b.y0);}else if(side===1){x=b.x1+30+rnd()*90;y=b.y0+rnd()*(b.y1-b.y0);}else{x=b.x0+rnd()*(b.x1-b.x0);y=b.y0-10-rnd()*50;}
  if(!libre(x,y,26))continue;place(pick(BU),x,y);}
 for(let k=0;k<16;k++){const x=b.x0-110+rnd()*(b.x1-b.x0+220),y=b.y0+rnd()*(b.y1-b.y0+120);if(!libre(x,y,22)&&dBat(x,y)>10)continue;if(devant(x,y)||dBat(x,y)<14)continue;place(pick(FL),x,y);}}
for(let k=0;k<900;k++){const x=120+rnd()*(W-240),y=160+rnd()*(H-260);const dr=dRoute(x,y);if(dr<38||dr>260||dBat(x,y)<60||devant(x,y))continue;if(rnd()<0.5)place(pick(FL),x,y);else if(rnd()<0.5)place(pick(BU),x,y);}
// roseaux autour de l'étang
for(let k=0;k<26;k++){const a=rnd()*Math.PI*2,x=etang[0]+Math.cos(a)*(etang[2]+36),y=etang[1]+Math.sin(a)*(etang[3]+36);if(dRoute(x,y)>-6&&!devant(x,y))place(pick(['buis2','buis3','buis4','buis5','buis19','buis20']),x,y);}
U.sort((a,b)=>a[1]-b[1]);
L.BUISSONS.length=0;for(const u of U)L.BUISSONS.push(u);
for(const r of L.ROUTES)r.off=true;
L.appliquerPlan();
const plan=L.planExporter();JSON.parse(plan);
fs.writeFileSync(__dirname+'/plan_croquis.json',plan);
console.log('plan_croquis.json :',(plan.length/1024).toFixed(0),'ko ·',U.length,'éléments de végétation ·',rues.length,'routes/sentiers');
