// teste la sauvegarde GitHub avec un faux GitHub (aucun réseau)
const vm=require('vm'),fs=require('fs');
const els={};function el(id){if(!els[id])els[id]={id,hidden:true,textContent:'',innerHTML:'',value:'',className:'',dataset:{},style:{},children:[],onclick:null,appendChild(c){this.children.push(c);},getContext(){return ctx;},querySelector(){return {onchange:null};},addEventListener(){},focus(){},blur(){}};return els[id];}
const ctx=new Proxy({},{get:(t,k)=>k==='measureText'?(()=>({width:20})):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});
let rafs=[],timers=[],now=0;const store={};
const remote={file:null,sha:0,puts:[]};
const fetchMock=async(url,opt={})=>{
 if(!opt.method||opt.method==='GET'){if(!remote.file)return {status:404,ok:false};return {status:200,ok:true,json:async()=>({sha:'s'+remote.sha,content:Buffer.from(remote.file,'utf8').toString('base64')})};}
 const b=JSON.parse(opt.body);if(!opt.headers.Authorization)return {status:401,ok:false};
 if(remote.file&&b.sha!=='s'+remote.sha)return {status:409,ok:false};if(!remote.file&&b.sha)return {status:422,ok:false};
 remote.file=Buffer.from(b.content,'base64').toString('utf8');remote.sha++;remote.puts.push(b);return {status:200,ok:true};};
const sandbox={console,Math,JSON,String,Number,Date,Promise,TextEncoder,TextDecoder,Object,Uint8Array,Error,
 atob:s=>Buffer.from(s,'base64').toString('binary'),btoa:s=>Buffer.from(s,'binary').toString('base64'),
 setTimeout:(f,ms)=>{timers.push(f);return timers.length;},clearTimeout:()=>{},fetch:fetchMock,
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
 document:{getElementById:el,createElement:(t)=>t==='canvas'?{getContext:()=>ctx,width:0,height:0,style:{},title:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}}:el('x'+Math.random()),querySelectorAll:()=>[]},
 Image:class{set src(v){this._s=v;setImmediate(()=>this.onload&&this.onload());} get src(){return this._s;} },
 Audio:class{constructor(){this._vol=1;} set src(v){} play(){return Promise.resolve();} set volume(v){this._vol=v;} get volume(){return this._vol;} },
 addEventListener:()=>{},innerWidth:1280,innerHeight:720,matchMedia:()=>({matches:false}),performance:{now:()=>now},requestAnimationFrame:(f)=>rafs.push(f),window:{},setImmediate};
sandbox.window=sandbox;el('jeu').getContext=()=>ctx;vm.createContext(sandbox);
for(const f of ['assets.js','logic.js','main.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});
const tick=async(n=6)=>{for(let i=0;i<n;i++)await new Promise(r=>setImmediate(r));};
const run=c=>vm.runInContext(c,sandbox);let bad=0;const ok=(c,m)=>{console.log(c?'ok  ':'ECHEC',m);if(!c){bad++;process.exitCode=1;}};
(async()=>{
 await tick(); // chargement des images + pret()
 ok(/Pas de clé GitHub/.test(els['gh-etat'].textContent),'sans clé : message clair, aucun envoi');
 ok(remote.puts.length===0,'rien envoyé sans clé');
 el('gh-token').value='ghp_TEST';els['gh-sauver-cle'].onclick();await tick();
 ok(store.calmland_gh_token==='ghp_TEST'&&el('gh-token').value==='','clé gardée sur l\'appareil, champ vidé');
 run("BATM.Maison_Aaron[1]+=64;sauverPlan();");timers.splice(0).forEach(f=>f());await tick();
 ok(remote.puts.length===1&&!remote.puts[0].sha,'1er envoi : fichier créé sur GitHub');
 ok(remote.file===run('planExporter()'),'le plan sur GitHub = le plan de l\'éditeur');
 const x1=run('BATM.Maison_Aaron[1]');
 run("BATM.Maison_Aaron[1]+=32;sauverPlan();");timers.splice(0).forEach(f=>f());await tick();
 ok(remote.puts.length===2&&remote.puts[1].sha==='s1','2e envoi : fichier mis à jour avec le bon sha');
 const x2=run('BATM.Maison_Aaron[1]');
 // autre appareil : plan local différent, rechargement depuis GitHub
 run("BATM.Maison_Aaron[1]=0;");
 els['gh-recharger'].onclick();await tick();
 ok(run('BATM.Maison_Aaron[1]')===x2,'« Recharger depuis GitHub » remet le plan enregistré');
 ok(/chargé depuis GitHub/.test(els['gh-etat'].textContent),'état affiché');
 // clé refusée
 store.calmland_gh_token='';run("BATM.Maison_Aaron[1]+=32;sauverPlan();ghEnvoyer();");await tick();
 ok(remote.puts.length===2,'sans clé : pas d\'envoi');
 console.log(bad?'ECHECS':'OK smoke GitHub');
})();
