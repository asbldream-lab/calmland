// Assemble le plan "village en tuiles" : bâtiments, objets (collisions), réseau de marche, sol en image (sl:1)
const L=require('./logic.js'),fs=require('fs'),D=JSON.parse(fs.readFileSync(__dirname+'/tuiles/data.json','utf8'));
const W=D.W,H=D.H;
L.SC.village.w=W;L.SC.village.h=H;
for(const b of L.BAT){const p=D.B[b[0]];b[1]=p[0];b[2]=p[1];b.off=false;}
L.appliquerPlan();
L.BUISSONS.length=0;for(const [x,y,k] of D.out)L.BUISSONS.push([x,y,'me_'+k]);
for(const r of L.ROUTES)r.off=true;
// réseau de marche : rues (axes) + liaisons porte -> rue
const hs=D.H_.map(y=>(y+2)*32),vs=D.V_.map(x=>(x+2)*32);
const line=(a,b)=>{const o=[];const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/40));for(let i=0;i<=n;i++)o.push([Math.round(a[0]+(b[0]-a[0])*i/n),Math.round(a[1]+(b[1]-a[1])*i/n)]);return o;};
const main=line([40,hs[1]],[W-40,hs[1]]);
const rues=[{p:main,w:100,t:'p'},{p:line([40,hs[0]],[W-40,hs[0]]),w:100,t:'p'},{p:line([40,hs[2]],[W-40,hs[2]]),w:100,t:'p'}];
for(const x of vs)rues.push({p:line([x,40],[x,H-40]),w:100,t:'p'});
for(const p of L.PORTES_V){const yc=hs.filter(y=>y>p.y).sort((a,b)=>a-b)[0]||hs[2];rues.push({p:line([p.x,p.y],[p.x,yc]),w:56,t:'t'});}
const near=(x)=>{let bi=0,bd=1e9;main.forEach((p,i)=>{if(Math.abs(p[0]-x)<bd){bd=Math.abs(p[0]-x);bi=i;}});return bi;};
L.rcImport({r:rues,c:[],e:[],pb:[near(1400),near(3400)]});
L.appliquerPlan();
const plan=JSON.parse(L.planExporter());plan.sl=1;
const txt=JSON.stringify(plan);
fs.writeFileSync(__dirname+'/plan_croquis.json',txt);fs.writeFileSync(__dirname+'/plan_defaut.json',txt);
console.log('plan',(txt.length/1024).toFixed(0),'ko ·',L.BUISSONS.length,'objets ·',rues.length,'routes de marche');
