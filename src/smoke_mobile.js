// teste le mode mobile (menu, barre, pincement, clé collée) dans un faux navigateur
const vm=require('vm'),fs=require('fs');
const els={};function el(id){if(!els[id])els[id]={id,hidden:true,textContent:'',innerHTML:'',value:'',className:'',dataset:{},style:{},children:[],onclick:null,
 appendChild(c){this.children.push(c);},getContext(){return ctx;},querySelector(){return {onchange:null};},addEventListener(){},focus(){},blur(){}};return els[id];}
const ctx=new Proxy({},{get:(t,k)=>k==='measureText'?(()=>({width:20})):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});
let rafs=[],timers=[],now=0;const store={};const remote={file:null,sha:0};
const fetchMock=async(url,opt={})=>{if(!opt.method){if(!remote.file)return {status:404,ok:false};return {status:200,ok:true,json:async()=>({sha:'s'+remote.sha,content:Buffer.from(remote.file).toString('base64')})};}
 const b=JSON.parse(opt.body);remote.file=Buffer.from(b.content,'base64').toString('utf8');remote.sha++;return {status:200,ok:true};};
const body={classList:{contains:c=>c==='mob',add(){},remove(){}},style:{setProperty(k,v){this[k]=v;}},appendChild(){}};
const sandbox={console,Math,JSON,String,Number,Date,Promise,TextEncoder,TextDecoder,Object,Uint8Array,Error,Map,
 atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),
 setTimeout:(f)=>{timers.push(f);return 1;},clearTimeout:()=>{},fetch:fetchMock,
 navigator:{clipboard:{readText:async()=>'github_pat_ABCDEFGHIJKLMNOPQRSTUVWX'}},
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
 document:{body,getElementById:el,createElement:(t)=>t==='canvas'?{getContext:()=>ctx,width:0,height:0,style:{},title:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}}:el('x'+Math.random()),querySelectorAll:()=>[]},
 Image:class{set src(v){this._s=v;setImmediate(()=>this.onload&&this.onload());} get src(){return this._s;} },
 Audio:class{constructor(){this._vol=1;} set src(v){} play(){return Promise.resolve();} set volume(v){this._vol=v;} get volume(){return this._vol;} },
 location:{hash:'',pathname:'/calmland/mobile.html',search:'',origin:'https://x'},history:{replaceState(){}},prompt(){},
 addEventListener:()=>{},innerWidth:390,innerHeight:844,matchMedia:()=>({matches:true}),performance:{now:()=>now},requestAnimationFrame:(f)=>rafs.push(f),window:{},setImmediate};
sandbox.window=sandbox;el('jeu').getContext=()=>ctx;el('jeu').getBoundingClientRect=()=>({left:0,top:0,width:390,height:219});
vm.createContext(sandbox);
for(const f of ['assets.js','logic.js','main.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});
const tick=async(n=8)=>{for(let i=0;i<n;i++)await new Promise(r=>setImmediate(r));};
const run=c=>vm.runInContext(c,sandbox);const frames=n=>{for(let i=0;i<n;i++){now+=16;const f=rafs.shift();if(f)f(now);}};
let bad=0;const ok=(c,m)=>{console.log(c?'ok  ':'ECHEC',m);if(!c){bad++;process.exitCode=1;}};
(async()=>{
 await tick();frames(5);
 ok(run('MOBILE')===true,'page reconnue comme mobile');
 ok(el('mob-cle').hidden===false,'sans clé : la fenêtre « Clé GitHub » s\'ouvre toute seule');
 await el('mob-coller').onclick();await tick();
 ok(store.calmland_gh_token==='github_pat_ABCDEFGHIJKLMNOPQRSTUVWX','« Coller la clé » lit le presse-papiers et enregistre la clé');
 timers.splice(0).forEach(f=>f());await tick();ok(el('mob-cle').hidden===true,'la fenêtre se ferme après l\'enregistrement');
 el('mob-token').value='ghp_ABCDEFGHIJKLMNOPQRSTUV';store.calmland_gh_token='';el('mob-token').oninput();await tick();
 ok(store.calmland_gh_token==='ghp_ABCDEFGHIJKLMNOPQRSTUV','coller dans le champ enregistre tout seul');
 run("demarrer(false);");frames(30);
 ok(el('tactile').hidden===false,'croix de déplacement visible en jeu');
 el('mob-fab').onclick();ok(el('mob-menu').hidden===false,'le bouton ☰ ouvre le menu');
 el('mm-son').onclick();ok(run('son')===false,'Son : bouton bascule');el('mm-son').onclick();
 el('mm-courir').onclick();ok(run('touches.shift')===true,'Courir : bouton bascule');el('mm-courir').onclick();
 el('mm-edit').onclick();frames(3);ok(run('EDIT')===false&&el('mob-toast').hidden===false,'pendant un dialogue : message clair au lieu de rien');
 run('G.queue.length=0;courant=null;');el('mob-fab').onclick();el('mm-edit').onclick();frames(10);
 ok(run('EDIT')===true&&el('mob-menu').hidden===true,'« Éditeur » active l\'éditeur et ferme le menu');
 ok(el('mob-barre').hidden===false&&el('tactile').hidden===true,'éditeur : barre d\'outils visible, croix cachée');
 ok(sandbox.document.body.style.paddingBottom==='56px','place réservée pour la barre');
 // pincement : le point sous les doigts reste fixe
 run("ptrs.clear();ptrs.set(1,{x:150,y:100});ptrs.set(2,{x:250,y:100});debutPinch();");
 const z0=run('ZOOM'),avant=run("(()=>{const c=camera();return [c.x+200*VW/390/ZOOM,c.y+100*VH/219/ZOOM];})()");
 run("ptrs.set(2,{x:350,y:100});majPinch();");const z1=run('ZOOM');
 ok(Math.abs(z1/z0-2)<0.01||z1===2.4,'pincement : écarter les doigts zoome (x'+(z1/z0).toFixed(2)+')');
 const apres=run("(()=>{const c=camera();return [c.x+200*VW/390/ZOOM,c.y+100*VH/219/ZOOM];})()");
 ok(Math.abs(avant[0]-apres[0])<2&&Math.abs(avant[1]-apres[1])<2||run('ZOOM')===2.4,'pincement : le point entre les doigts ne bouge pas');
 run("ptrs.clear();pinch=null;");
 el('mb-zm').onclick();ok(run('ZOOM')<z1,'barre : zoom −');
 el('mb-panneau').onclick();frames(3);ok(run('panneauMasque')===true,'barre : masquer le panneau');el('mb-panneau').onclick();
 el('mb-annuler').onclick();el('mb-suppr').onclick();ok(true,'barre : annuler / supprimer sans erreur');
 el('mb-quitter').onclick();frames(10);
 ok(run('EDIT')===false&&el('mob-barre').hidden===true&&sandbox.document.body.style.paddingBottom==='0px','« Quitter » : barre cachée, place rendue');
 ok(el('tactile').hidden===false,'croix de déplacement de retour');
 el('mm-test')&&(el('mob-fab').onclick(),el('mm-test').onclick());frames(5);
 ok(el('test').hidden===false&&el('tactile').hidden===true,'atelier de test en portrait : croix cachée pour ne pas couvrir le panneau');
 console.log(bad?'ECHECS':'OK smoke mobile');
})();
