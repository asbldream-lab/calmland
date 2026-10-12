// faux navigateur minimal pour exécuter tout l'affichage
const vm=require('vm'),fs=require('fs');
const els={};function el(id){if(!els[id])els[id]={id,hidden:true,textContent:'',innerHTML:'',className:'',dataset:{},style:{},children:[],onclick:null,
 appendChild(c){this.children.push(c);},getContext(){return ctx;},querySelector(){return {onchange:null};},addEventListener(){} ,focus(){}};return els[id];}
const ctx=new Proxy({},{get:(t,k)=>k==='measureText'?(()=>({width:20})):(k in t?t[k]:()=>{}),set:(t,k,v)=>{t[k]=v;return true;}});
let rafs=[];let now=0;
const sandbox={console,Math,JSON,String,Number,setTimeout:(f,ms)=>{f();},
 document:{getElementById:el,createElement:(t)=>t==='canvas'?{getContext:()=>ctx,width:0,height:0,style:{},title:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},remove(){}}:el('x'+Math.random()),querySelectorAll:()=>[]},
 Image:class{set src(v){this._s=v;setImmediate(()=>this.onload&&this.onload());} get src(){return this._s;} },
 Audio:class{constructor(){this._vol=1;this.loop=false;this.paused=true;} set src(v){this._s=v;} get src(){return this._s;} play(){this.paused=false;return Promise.resolve();} pause(){this.paused=true;} set volume(v){this._vol=v;} get volume(){return this._vol;} },
 addEventListener:()=>{},innerWidth:1280,innerHeight:720,matchMedia:()=>({matches:false}),performance:{now:()=>now},
 requestAnimationFrame:(f)=>rafs.push(f),window:{},setImmediate};
if(process.env.POISON)sandbox.localStorage={getItem:()=>JSON.stringify({b:{Maison_Aaron:[5,5]},ro:[[0,0,64,64,'p'],[0,0,64,64,'p'],[0,0,64,64,'p']]}),setItem(){global.ECRIT=true;}};
sandbox.window=sandbox;el('jeu').getContext=()=>ctx;
vm.createContext(sandbox);
for(const f of ['assets.js','logic.js',process.env.MAIN||'main.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});
setTimeout(()=>{},0);
setImmediate(()=>setImmediate(()=>{
 const S=sandbox;const run=(n)=>{for(let i=0;i<n;i++){now+=16;const f=rafs.shift();if(f)f(now);}};
 run(5);console.log('ÉTAT : '+vm.runInContext('JSON.stringify({PUBLIC:PUBLIC,aaron:[BATM.Maison_Aaron[1],BATM.Maison_Aaron[2]],route0:[ROUTES[0][0],ROUTES[0][1]]})',S));
 vm.runInContext("demarrer(true);",S);run(200);
 const G=vm.runInContext('G',S);console.log('mode',G.mode,'prologue',G.prologue,'file',G.queue.length);
 for(let i=0;i<8&&G.queue.length;i++){vm.runInContext('action()',S);run(30);}
 vm.runInContext("changerScene('village',PORTES_V[0].x,PORTES_V[0].y+30,3);G.trail=[];for(let i=0;i<60;i++){bouger(1,0,0.016);suivre(0.016);}",S);run(60);
 vm.runInContext("changerScene('village',ECOLE.x,ECOLE.y-10,3);bouger(0,1,0.05);pomper();",S);run(30);
 for(let i=0;i<12&&G.queue.length;i++){vm.runInContext('action()',S);run(60);}
 console.log('étape après école:',G.pro&&G.pro.etape,'file',G.queue.length);
 vm.runInContext("changerScene('village',PORTES_V[0].x,PORTES_V[0].y+24,3);action();",S);run(30);
 for(let i=0;i<14&&G.queue.length;i++){vm.runInContext('action()',S);run(60);}
 console.log('étape après sieste:',G.pro&&G.pro.etape,'scène',G.player.scene);
 vm.runInContext("changerScene('village',FIXES.marc.x,FIXES.marc.y+14,1);action();",S);run(30);
 for(let i=0;i<40&&G.queue.length;i++){vm.runInContext('action()',S);run(60);}
 console.log('après école: prologue',G.prologue,'boucle',vm.runInContext('numeroBoucle()',S),'file',G.queue.length);
 vm.runInContext("zoom(1);zoom(1);zoom(-1);sauterTemps(5);",S);run(20);
 // parcours des scènes et des minutes
 for(const [s,x,y] of [['village',1222,650],['salon',300,240],['soussol',90,140],['chambre',110,180]]){vm.runInContext(`changerScene('${s}',${x},${y},3)`,S);run(20);}
 for(const m of [4.2,8.5,10.5,15.5]){vm.runInContext(`regler(${m});pomper();`,S);run(40);for(let i=0;i<10;i++){vm.runInContext('action()',S);run(20);}}
 vm.runInContext("basculerTest();document.getElementById('t-dialogues').onclick&&document.getElementById('t-dialogues').onclick();",S);run(5);
 vm.runInContext("G.mem.codeAppris=true;G.L.cleEnMain=true;G.L.cleReprise=false;G.L.repriseA=null;G.L.perdu=false;changerScene('salon',360,226,3);regler(10.6);",S);run(10);
 vm.runInContext("action();",S);run(20);for(let i=0;i<6;i++){vm.runInContext('action()',S);run(20);}
 console.log('pavé',!!G.keypad,JSON.stringify(G.log.slice(-6)),G.minute.toFixed(2),JSON.stringify({b:G.L.machineBougee,u:G.L.cleUtilisee,bl:G.L.cadenasBloque,lim:G.L.codeLimite,sc:G.player.scene,q:G.queue.length,mode:G.mode}));
 vm.runInContext("pave('0');pave('8');pave('0');pave('9');pave('1');pave('2');",S);run(20);
 console.log('scène après code',G.player.scene,'trappe',G.L.trappeOuverte);
 vm.runInContext("G.L.aLaViande=true;changerScene('soussol',226,214,0);action();",S);run(10);for(let i=0;i<5;i++){vm.runInContext('action()',S);run(20);}
 vm.runInContext("changerScene('soussol',322,206,3);action();",S);run(10);for(let i=0;i<30;i++){vm.runInContext('action()',S);run(30);}
 console.log('mode final',G.mode,'page',G.fin&&G.fin.page);
 for(let i=0;i<10;i++){vm.runInContext('action()',S);run(5);}
 vm.runInContext("G.mode='jeu';G.queue=[];G.keypad=null;G.prologue=false;changerScene('chambre',110,166,3);document.getElementById('np-taille').value='10,8';basculerEditeur();document.getElementById('np-nom').value='Cuisine';document.getElementById('np-creer').onclick();",S);run(40);
 console.log('pièce créée via l\'interface :',vm.runInContext("G.player.scene+' | '+Object.keys(INTS).filter(k=>INTS[k].user).join(',')+' | porte retour: '+ITEMS[G.player.scene].filter(i=>i[2]==='porte').length",S));
 vm.runInContext("document.getElementById('np-suppr').onclick();basculerEditeur();",S);run(10);
 console.log('après suppression :',vm.runInContext("G.player.scene+' | '+Object.keys(INTS).filter(k=>INTS[k].user).length",S));
 vm.runInContext("G.mode='jeu';G.queue=[];EDIT=true;changerScene('salon',256,250,3);document.getElementById('np-passage').checked=true;document.getElementById('np-taille').value='14,10';document.getElementById('np-creer').onclick();",S);run(20);
 console.log('passage créé via l\'interface :',vm.runInContext("G.player.scene+' | passages dans la pièce: '+ITEMS[G.player.scene].filter(i=>i[2]==='passage').length",S));
 vm.runInContext("changerScene('chambre',110,166,3);document.getElementById('ag-cote').value='gauche';document.getElementById('ag-n').value='4';document.getElementById('ag-go').onclick();",S);run(40);
 console.log('chambre agrandie via l\'interface :',vm.runInContext("SC.chambre.w+'x'+SC.chambre.h+' | départ x='+P.chambreDepart.x",S));
 vm.runInContext("planReinit();EDIT=false;",S);run(10);
 console.log('écritures dans le stockage :',global.ECRIT||false);console.log('menu visible',!els_menu(),'OK smoke');
 function els_menu(){return vm.runInContext("document.getElementById('menu').hidden",S);}
}));
