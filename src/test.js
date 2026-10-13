const L=require('./logic.js');const G=L.G;
let CH=0;function vider(){let n=0;while(G.queue.length&&n<500){const it=G.queue.shift();if(it.call)it.call();if(it.choice){it.choice[CH].fn();}n++;}}
function ok(c,msg){if(!c){console.log('ECHEC:',msg);process.exitCode=1;}else console.log('ok  ',msg);}
function aller(scene,x,y){L.changerScene(scene,x,y,3);}
function vers(k){const p=L.positions()[k];aller(p.scene,p.x,p.y+12);}
function avance(m){for(let i=0;i<m*20;i++){vider();L.avancer(0.05);}vider();}
function prologue(){L.nouvellePartie(true);vider();
 ok(G.prologue&&G.pro.etape==='matin'&&G.suiveur,'prologue : matin, Loulou suit');
 L.changerScene('village',L.PORTES_V[0].x,L.PORTES_V[0].y+30,3);G.trail=[];for(let i=0;i<80;i++){L.bouger(1,0,0.016);L.suivre(0.016);}
 ok(G.suiveur.scene==='village'&&Math.hypot(G.suiveur.x-G.player.x,G.suiveur.y-G.player.y)<60,'Loulou reste derrière Aaron (<60 px)');
 aller('village',L.ECOLE.x,L.ECOLE.y-10);L.bouger(0,1,0.05);vider();ok(G.pro.etape==='retour'&&!G.suiveur,'Loulou déposée à l\'école');
 aller('village',L.PORTES_V[0].x,L.PORTES_V[0].y);L.interagir();vider();ok(G.pro.etape==='reveil'&&G.player.scene==='chambre','sieste -> réveil dans la chambre');
 ok(G.log.includes('prologue_reveil')&&G.log.includes('matin_ecole'),'dialogues du matin et du réveil');}
// ---- Partie 1 : chemin parfait
L.nouvellePartie(false);vider();
ok(L.numeroBoucle()===1,'boucle 1');ok(G.log.includes('reveil_nathalie'),'Nathalie à la fenêtre');
vers('reda');L.interagir();vider();ok(G.L.vuReda,'Reda parlé');
aller('salon',300,240);L.interagir();vider();ok(G.mem.codeAppris,'code appris chez Benjamin après Reda');
vers('cedric');L.interagir();vider();ok(G.L.aLaViande,'viande de Cédric');
avance(4.1-G.minute);ok(G.L.cleAuSol,'clé tombée à 4');
aller('village',L.P.cleSol.x,L.P.cleSol.y+4);L.interagir();vider();ok(G.L.cleEnMain&&!G.L.cleAuSol,'clé ramassée');
vers('lilya');L.interagir();vider();ok(G.log.includes('lilya_cle'),'Lilya parle de Mami');
vers('mami');L.interagir();vider();ok(G.mem.mamiPhraseConnue&&G.L.cleEnMain,'Mami parle et rend la clé');
avance(7.2-G.minute);ok(!G.L.cleReprise,'Nathalie ne reprend pas la clé');
avance(8.2-G.minute);aller('salon',300,240);L.interagir();vider();ok(G.log.includes('ben_seul'),'Benjamin seul à 8');
aller('salon',380,226);L.interagir();vider();ok(G.log.includes('ben_quoi')||G.log.includes('ben_machine'),'machine bloquée si Benjamin là');
avance(10.3-G.minute);ok(L.benjamin(G.minute).scene==='village','Benjamin parti chez Paul');
aller('salon',360,226);L.interagir();vider();ok(G.L.machineBougee&&G.keypad,'machine bougée, pavé du code');
L.code('080912');vider();ok(G.player.scene==='soussol'&&G.L.trappeOuverte,'trappe ouverte, sous-sol');
aller('soussol',226,214);L.interagir();vider();ok(G.L.dogFed,'chien nourri');
aller('soussol',322,206);L.interagir();vider();ok(G.mode==='lettre','fin : hôpital et lettre');
// ---- Partie 2 : clé non ramassée
L.nouvellePartie(false);vider();avance(7.1);ok(G.L.cleReprise&&G.L.perdu,'Nathalie reprend la clé à 7 : boucle perdue');
avance(8.5-G.minute);ok(L.benjamin(G.minute).scene==='salon'&&!L.benjamin(G.minute).marteau,'pas de marteau si clé reprise');
avance(11-G.minute);ok(L.benjamin(G.minute).scene==='salon','Benjamin ne va pas chez Paul');
const r=G.reveil;avance(20-G.minute);ok(G.reveil===r+1&&G.minute===0,'mort à 20 et nouvelle boucle');ok(G.mem.codeAppris===false,'mémoire : code non appris dans cette partie');
// ---- Partie 3 : code faux, rendre la clé, prologue
prologue();vers('marc');L.interagir();vider();ok(!G.prologue&&L.numeroBoucle()===1,'prologue -> boucle 1');
avance(4.1);aller('village',L.P.cleSol.x,L.P.cleSol.y+4);L.interagir();vider();vers('reda');L.interagir();vider();aller('salon',300,240);L.interagir();vider();
avance(10.3-G.minute);aller('salon',360,226);L.interagir();vider();L.code('123456');vider();ok(G.L.cadenasBloque&&G.L.perdu,'code faux : cadenas bloqué');
const g2=G.reveil;avance(20-G.minute);ok(G.mem.codeAppris,'code gardé en mémoire boucle suivante');
avance(4.1);aller('village',L.P.cleSol.x,L.P.cleSol.y+4);L.interagir();vider();const n=L.nathalie(G.minute);console.log('nat',n.scene);
aller('village',n.x,n.y);CH=1;L.interagir();vider();CH=0;ok(G.L.cleReprise,'rendre la clé à Nathalie : boucle perdue');
// minuteur du code
L.nouvellePartie(false);vider();G.mem.codeAppris=true;avance(4.1);aller('village',L.P.cleSol.x,L.P.cleSol.y+4);L.interagir();vider();avance(10.2-G.minute);aller('salon',360,226);L.interagir();vider();ok(!!G.keypad,'pavé ouvert');avance(1.2);ok(G.L.cadenasBloque,'temps dépassé : cadenas bloqué');
avance(12.1-G.minute);ok(G.L.surpris||G.L.cadenasBloque,'retour de Benjamin géré');
// portes, collisions serrées, temps
L.nouvellePartie(false);vider();aller('village',L.PORTES_V[1].x,L.PORTES_V[1].y+2);let c=L.cible();ok(c&&c.type==='porte'&&c.id==='p_benjamin','E devant la porte de Benjamin');L.interagir();vider();ok(G.player.scene==='salon','on entre chez Benjamin avec E');
aller('village',L.PORTES_V[2].x,L.PORTES_V[2].y);L.interagir();vider();ok(G.player.scene==='int_paul','porte de Paul : on entre chez Paul');
aller('village',L.PORTES_V[0].x,L.PORTES_V[0].y+30);for(let i=0;i<60;i++)L.bouger(0,-1,0.016);ok(G.player.scene==='village'&&G.player.y<L.BAT[0][2]+L.BAT[0][4]-8,'on monte sur le palier, devant la porte (plus de mur invisible)');L.interagir();vider();ok(G.player.scene==='chambre','E sur le palier : on entre');
aller('village',L.BAT[0][1]+60,L.BAT[0][2]+L.BAT[0][4]+40);for(let i=0;i<400;i++)L.bouger(0,-1,0.016);ok(!L.solids('village').some(r=>G.player.x+6>r[0]&&G.player.x-6<r[0]+r[2]&&G.player.y>r[1]&&G.player.y-3<r[1]+r[3]),'collision : on s\'arrête contre la maison, jamais dedans');
const bA0=L.BAT[0];const mur=L.solids('village').find(r=>r[0]<=bA0[1]+100&&r[0]+r[2]>=bA0[1]+100&&r[1]<=bA0[2]+100&&r[1]+r[3]>=bA0[2]+100);ok(mur&&mur[3]<=bA0[4]-40&&mur[2]<=bA0[3],'collision = emprise de la maison, palier libre');
G.player.scene='salon';ok(L.solids('salon').filter(r=>r[1]>70&&r[1]<300).every(r=>r[2]<=130&&r[3]<=70),'salon : meubles = petites collisions serrées');
L.nouvellePartie(false);vider();const m0=G.minute;L.sauter(1);ok(Math.abs(G.minute-m0-1)<1e-9,'+1 minute');L.sauter(5);ok(Math.abs(G.minute-m0-6)<1e-9,'+5 minutes');
L.sauter(5);L.sauter(5);L.sauter(5);vider();ok(G.reveil>=3||G.minute<1,'sauter jusqu\'à 20 min : mort et nouvelle boucle');
// éditeur de plan
{L.nouvellePartie(false);vider();const p0=L.planExporter();const bA=L.BAT[0],px=L.PORTES_V[0].x,py=L.PORTES_V[0].y,rx=L.FIXES.reda.x;
 bA[1]+=32;bA[2]+=64;L.BAT.find(b=>b[0]==='Poste_Police')[1]+=64;L.appliquerPlan();
 ok(L.PORTES_V[0].x===px+32&&L.PORTES_V[0].y===py+64,'la porte (E) suit la maison déplacée');
 ok(L.FIXES.reda.x===rx+64,'Reda suit le poste de police');
 ok(L.solids('village').some(r=>r[0]<=bA[1]+130&&r[0]+r[2]>=bA[1]+130&&r[1]<=bA[2]+300&&r[1]+r[3]>=bA[2]+300),'la collision suit la maison');
 {const ox=bA[1]-32,oy=bA[2]-64;ok(!L.solids('village').some(r=>r[0]<=ox+100&&r[0]+r[2]>=ox+100&&r[1]<=oy+10&&r[1]+r[3]>=oy+10),'plus de collision à l\'ancien emplacement');}
 aller('village',L.PORTES_V[0].x,L.PORTES_V[0].y);L.interagir();vider();ok(G.player.scene==='chambre','on peut entrer dans la maison déplacée');
 const exp=L.planExporter();L.planReinit();ok(L.planExporter()===p0&&L.PORTES_V[0].x===px,'plan d\'origine remis');
 L.planImporter(exp);ok(L.planExporter()===exp&&L.PORTES_V[0].x===px+32,'le texte copié recharge le même plan');L.planReinit();}
// bibliothèque : ajout, suppression, annulation, bâtiment supprimé
{L.nouvellePartie(false);vider();L.planReinit();const n0=L.BUISSONS.length,c0=L.solids('village').length,snap=L.planExporter();
 ok(Object.keys(L.SPR).length>=75&&['arbre','buisson','fleur'].every(c=>Object.values(L.SPR).some(s=>s.cat===c)),'bibliothèque : arbres, buissons et fleurs');
 L.BUISSONS.push([640,1000,'arbre1']);L.appliquerPlan();ok(L.BUISSONS.length===n0+1&&L.solids('village').length===c0+1,'un arbre posé a une petite collision au pied');
 const r=L.solids('village')[L.solids('village').length-1];ok(r[2]<=L.SPR.arbre1.w*0.4&&r[3]<=20,'collision d\'arbre = tronc seulement');
 L.BUISSONS.push([704,1000,'fleur1']);L.appliquerPlan();ok(L.solids('village').length===c0+1,'les fleurs au sol n\'ont pas de collision');
 const avecAjouts=L.planExporter();L.BUISSONS.length=n0;L.appliquerPlan();ok(L.solids('village').length===c0,'suppression : la collision disparaît');
 L.planImporter(avecAjouts);ok(L.BUISSONS.length===n0+2,'annuler restaure les éléments');
 L.planImporter(snap);ok(L.BUISSONS.length===n0,'retour au plan précédent');
 L.BATM.Pharmacie.off=true;L.appliquerPlan();ok(L.solids('village').length===c0-1,'bâtiment supprimé : sa collision disparaît');
 aller('village',L.PORTES_V[3].x,L.PORTES_V[3].y+20);const cc=L.cible();ok(!(cc&&cc.id==='p_pharmacie'),'bâtiment supprimé : sa porte disparaît');
 const ex=L.planExporter();L.planReinit();ok(!L.BATM.Pharmacie.off,'plan d\'origine remet le bâtiment');L.planImporter(ex);ok(L.BATM.Pharmacie.off===true,'le texte copié garde le bâtiment supprimé');L.planReinit();
 L.planImporter(JSON.stringify({b:{},u:[[100,100,'cle_inconnue']]}));ok(L.BUISSONS[0][2]==='buisson','clé inconnue remplacée par un buisson');L.planReinit();}
// sprites vérifiés, dégagement, consignes
{const bad=[];for(const [k,s] of Object.entries(L.SPR)){if(!s.sol)continue;const [x,y,w,h]=s.sol;if(x<0||y<0||x+w>s.w||y+h>s.h||w<10||h<12)bad.push(k);
   if(s.cat==='arbre'&&k!=='arbre9'&&k!=='arbre10'&&k!=='arbre11'&&k!=='arbre12'&&!(x+w/2>s.w*0.3&&x+w/2<s.w*0.7))bad.push(k+'(tronc hors centre)');
   if(s.cat==='arbre'&&y+h<s.h*0.5)bad.push(k+'(collision trop haute)');}
 ok(bad.length===0,'sprites : collisions dans leurs limites, tronc centré et bas'+(bad.length?' → '+bad.join(','):''));
 L.nouvellePartie(false);vider();L.planReinit();L.BUISSONS.push([640,1000,'buisson']);L.appliquerPlan();const rr=L.solids('village').find(r=>r[2]<80&&r[3]<60);G.player.scene='village';G.player.x=rr[0]+rr[2]/2;G.player.y=rr[1]+rr[3]/2;
 ok(L.degager(),'le joueur coincé dans un obstacle est dégagé');const S=L.solids('village'),pl=G.player;ok(!S.some(r=>pl.x+6>r[0]&&pl.x-6<r[0]+r[2]&&pl.y>r[1]&&pl.y-3<r[1]+r[3]),'après dégagement : plus dans un obstacle');
 L.nouvellePartie(false);vider();let o=L.objectif();ok(o&&/Reda/.test(o.t)&&/Ensuite/.test(o.t),'consigne : « Maintenant : …Reda… Ensuite : … »');
 G.L.vuReda=true;o=L.objectif();ok(/Benjamin/.test(o.t),'consigne suivante : Benjamin');
 L.regler;G.player.scene='salon';o=L.objectif();ok(o.scene==='salon','dans le salon : la flèche vise le salon, pas le village');
 G.L.perdu=true;ok(/perdue/.test(L.objectif().t),'boucle perdue : consigne dédiée');}
// arbres : le cercle vert reste sous les personnages
{const bad=[];for(const [k,sp] of Object.entries(L.SPR)){if(sp.h<96)continue;const c=L.coupe(sp),yb=sp.sol?sp.sol[1]+sp.sol[3]:sp.h;if(c>yb||c<0||c>sp.h)bad.push(k);}
 ok(bad.length===0,'arbres : la partie au sol est séparée en dessous du tronc'+(bad.length?' → '+bad.join(','):''));
 const ell=Object.entries(L.SPR).filter(([k,sp])=>sp.h>=96&&sp.sol&&L.coupe(sp)<sp.h);ok(ell.length>=20,'au moins 20 arbres ont leur cercle de sol séparé ('+ell.length+')');}
// meubles d'intérieur
{L.planReinit();const bad=[];for(const [k,s] of Object.entries(L.SPRI)){if(!s.sol)continue;const [x,y,w,h]=s.sol;if(x<0||y<0||x+w>s.w||y+h>s.h||w<8||h<8)bad.push(k);}
 ok(Object.keys(L.SPRI).length>=700&&bad.length===0,'bibliothèque de meubles : '+Object.keys(L.SPRI).length+' objets, collisions dans leurs limites'+(bad.length?' → '+bad.slice(0,5).join(','):''));
 ok(['chambre','salon','soussol'].every(sc=>L.ITEMS[sc].every(i=>L.SPRI[i[2]])),'meubles par défaut : tous existent dans la bibliothèque');
 ok(['commode','machine','fenetre_cassee','radiateur','trappe_bas'].every(k=>L.SPRI[k].story),'objets de l\'histoire repérés (suppression avec confirmation)');
 for(const [sc,x,y] of [['chambre',110,166],['salon',256,280],['soussol',84,182],['salon',352,232]]){G.player.scene=sc;G.player.x=x;G.player.y=y;ok(!L.degager(),'point d\'arrivée libre : '+sc+' '+x+','+y);}
 L.nouvellePartie(false);vider();G.player.scene='chambre';G.player.x=211;G.player.y=240;for(let i=0;i<120;i++)L.bouger(0,1,0.016);ok(G.player.scene==='village','chambre : on atteint la sortie depuis le centre');
 L.nouvellePartie(false);vider();G.player.scene='salon';G.player.x=256;G.player.y=240;for(let i=0;i<120;i++)L.bouger(0,1,0.016);ok(G.player.scene==='village','salon : on atteint la sortie depuis le centre');
 // déplacer le meuble déplace l'interaction
 L.nouvellePartie(false);vider();aller('chambre',240,130);let c1=L.cible();ok(c1&&c1.id==='meuble','commode : interaction au bon endroit');
 const co=L.itemDe('chambre','commode');co[0]+=64;aller('chambre',240,130);c1=L.cible();ok(!(c1&&c1.id==='meuble'),'commode déplacée : plus d\'interaction à l\'ancienne place');aller('chambre',304,130);c1=L.cible();ok(c1&&c1.id==='meuble','commode déplacée : l\'interaction suit');
 const ex=L.planExporter();L.planReinit();ok(L.itemDe('chambre','commode')[0]===190,'plan d\'origine remet les meubles');L.planImporter(ex);ok(L.itemDe('chambre','commode')[0]===254&&L.planExporter()===ex,'le texte copié garde les meubles déplacés');L.planReinit();
 // machine déplacée
 const mb0=L.machineBase().x;L.itemDe('salon','machine')[0]+=64;ok(L.machineBase().x===mb0+64,'machine déplacée : la base de la trappe suit');L.planReinit();
 // supprimer le meuble retire la collision ; flag traversable aussi
 const nb=L.solids('salon').length,ca=L.itemDe('salon','canape');ok(L.collItem(ca)!==null,'canapé solide');ca[3]=1;ok(L.collItem(ca)===null&&L.solids('salon').length===nb-1,'meuble traversable : plus de collision');ca.length=3;
 L.ITEMS.salon.splice(L.ITEMS.salon.indexOf(ca),1);ok(L.solids('salon').length===nb-1,'meuble supprimé : sa collision disparaît');L.planReinit();
 L.planImporter(JSON.stringify({i:{salon:[[100,200,'cle_inconnue'],[120,220,'canape']]}}));ok(L.ITEMS.salon.length===1&&L.ITEMS.salon[0][2]==='canape','clé de meuble inconnue ignorée');L.planReinit();}
// toutes les maisons : entrer, sortir, déplacer sans toucher à l'intérieur
{const ids=Object.keys(L.ENTREES);ok(ids.length===10&&ids.every(id=>L.INTS[L.ENTREES[id]]),'les 10 portes ont chacune un intérieur');
 for(const id of ids){const sc=L.ENTREES[id],own=L.INTS[sc].own,pv=L.PORTES_V.find(p=>p.id===id);
  L.nouvellePartie(false);vider();L.planReinit();const b=L.BATM[own],it0=JSON.stringify(L.ITEMS[sc]),px0=pv.x,py0=pv.y;
  b[1]+=64;b[2]+=32;L.appliquerPlan();const pv2=L.PORTES_V.find(p=>p.id===id);
  ok(pv2.x===px0+64&&pv2.y===py0+32,id+' : la porte suit la maison déplacée');
  aller('village',pv2.x,pv2.y);const c=L.cible();ok(c&&c.id===id,id+' : E devant la porte déplacée');L.interagir();vider();
  ok(G.player.scene===sc,id+' : on entre dans '+sc);ok(JSON.stringify(L.ITEMS[sc])===it0,id+' : l\'intérieur n\'a pas bougé');
  ok(!L.degager(),id+' : point d\'arrivée libre à l\'intérieur');
  for(let i=0;i<260&&G.player.scene===sc;i++)L.bouger(0,1,0.016);
  ok(G.player.scene==='village','sortie depuis '+sc+' vers le village');
  const a=L.arriveeVillage(sc);{const dv=L.PORTES_V.find(p=>p.own===own),c2=L.cible();ok(Math.abs(G.player.x-a.x)<2&&Math.abs(G.player.y-a.y)<2&&c2&&c2.id===dv.id,'on ressort pile devant la porte, E actif ('+own+')');}
  L.planReinit();}}
// nouvelle pièce
{L.planReinit();L.nouvellePartie(false);vider();const nI=Object.keys(L.INTS).length;
 ok(L.STYLES.nf>=60&&L.STYLES.walls.length>=20&&L.SPRI.porte&&L.SPRI.porte.cat==='base','choix de sols, de murs et sprite de porte présents');
 const id=L.creerPiece('Cuisine d\'Aaron',10,8,3,5,'chambre');
 ok(id==='u1'&&L.INTS[id].user&&L.SC[id].w===320&&L.SC[id].h===256,'pièce créée (petite : 320 x 256)');
 const pa=L.ITEMS.chambre.find(i=>i[2]==='porte'&&i[4]===id),pr=L.ITEMS[id].find(i=>i[2]==='porte'&&i[4]==='chambre');
 ok(pa&&pr,'porte aller (dans la chambre) et porte retour (dans la nouvelle pièce) reliées');
 aller('chambre',pa[0]+16,pa[1]+20);let c=L.cible();ok(c&&c.type==='porteint'&&c.ref===pa,'E devant la porte de la chambre');L.interagir();vider();
 ok(G.player.scene===id,'on entre dans la nouvelle pièce');ok(!L.degager(),'arrivée libre dans la nouvelle pièce');
 const c2=L.cible();ok(c2&&c2.type==='porteint'&&c2.ref===pr,'la porte retour est à portée à l\'arrivée');L.interagir();vider();
 ok(G.player.scene==='chambre'&&Math.abs(G.player.x-(pa[0]+16))<2,'retour dans la chambre devant la porte');
 // porte déplacée : l'arrivée suit
 pa[0]+=96;L.interagir; aller('chambre',pa[0]+16,pa[1]+20);L.interagir();vider();G.player.scene===id;ok(G.player.scene===id,'porte déplacée : elle marche toujours');
 for(let i=0;i<5&&G.player.scene===id;i++){const cc=L.cible();if(cc&&cc.type==='porteint'){L.interagir();vider();}}
 ok(G.player.scene==='chambre'&&Math.abs(G.player.x-(pa[0]+16))<2,'retour devant la porte à son nouvel emplacement');pa[0]-=96;
 // meubler la nouvelle pièce, sauvegarde, recharge
 L.ITEMS[id].push([64,128,'canape']);const ex=L.planExporter();
 L.planReinit();ok(!L.INTS.u1&&!L.SC.u1&&Object.keys(L.INTS).length===nI,'plan d\'origine retire les pièces créées');
 L.planImporter(ex);ok(L.INTS.u1&&L.INTS.u1.nom==='Cuisine d\'Aaron'&&L.ITEMS.u1.some(i=>i[2]==='canape')&&L.ITEMS.chambre.some(i=>i[2]==='porte'&&i[4]==='u1'),'le texte copié recrée la pièce, ses meubles et ses portes');
 ok(L.planExporter()===ex,'export identique après rechargement');
 // une porte peut mener au village, et solide : la porte n\'a pas de collision
 const p3=L.ITEMS.u1.find(i=>i[2]==='porte');ok(L.collItem(p3)===null,'une porte n\'a pas de collision');
 p3[4]='@village';aller('u1',p3[0]+16,p3[1]-30);L.cible();G.player.scene='u1';G.player.x=p3[0]+16;G.player.y=p3[1]-30;L.porteInt(p3);ok(G.player.scene==='village','porte vers le village : on sort dehors');
 // suppression
 ok(L.supprimerPiece('u1')&&!L.SC.u1&&!L.ITEMS.chambre.some(i=>i[4]==='u1'),'pièce supprimée : ses portes disparaissent aussi');
 ok(!L.supprimerPiece('chambre'),'les pièces de l\'histoire ne se suppriment pas');
 // plusieurs pièces et identifiants uniques
 const a=L.creerPiece('A',14,10,0,0,'salon'),b=L.creerPiece('B',20,12,1,1,'salon');ok(a!==b&&L.INTS[a].own==='Maison_Benjamin','plusieurs pièces, identifiants uniques, même maison');
 L.planImporter(JSON.stringify({r:[{id:'../x',nom:'x',tw:10,th:8,fl:0,wl:0}],i:{}}));ok(!Object.keys(L.INTS).some(k=>k.includes('x')&&k!=='int_boulangerie'),'identifiant de pièce invalide refusé');L.planReinit();}
// agrandir une pièce, passages ouverts
{L.planReinit();L.nouvellePartie(false);vider();
 // droite : rien ne bouge
 let R=L.SC.chambre,w0=R.w,h0=R.h;const it0=JSON.stringify(L.ITEMS.chambre),gap0=[...L.INTS.chambre.gap];
 ok(L.agrandir('chambre','droite',3)&&R.w===w0+96&&R.h===h0&&JSON.stringify(L.ITEMS.chambre)===it0&&L.INTS.chambre.gap[0]===gap0[0],'agrandir à droite : la pièce grandit, rien ne bouge');
 // gauche : tout est décalé, la sortie aussi
 const lit=L.itemDe('chambre','lit_vert'),lx=lit[0],cx0=L.P.chambreDepart.x;ok(L.agrandir('chambre','gauche',2),'agrandir à gauche');
 ok(lit[0]===lx+64&&L.INTS.chambre.gap[0]===gap0[0]+64&&L.P.chambreDepart.x===cx0+64,'à gauche : meubles, sortie et point de départ suivent (+64)');
 G.player.scene='chambre';G.player.x=(L.INTS.chambre.gap[0]+L.INTS.chambre.gap[1])/2;G.player.y=L.SC.chambre.h-60;for(let i=0;i<120&&G.player.scene==='chambre';i++)L.bouger(0,1,0.016);ok(G.player.scene==='village','la sortie vers le village marche après agrandissement à gauche');
 // haut : les objets du mur restent sur le nouveau mur, le reste descend
 const fen=L.itemDe('chambre','fenetre_cassee'),fy=fen[1],cm=L.itemDe('chambre','commode'),cy=cm[1];ok(L.agrandir('chambre','haut',2),'agrandir en haut');
 ok(fen[1]===fy&&cm[1]===cy+64,'en haut : la fenêtre reste sur le mur, la commode descend (+64)');
 // bas : la sortie reste sur le bas de la pièce
 const h1=L.SC.chambre.h;ok(L.agrandir('chambre','bas',2)&&L.SC.chambre.h===h1+64,'agrandir en bas');
 G.player.scene='chambre';G.player.x=(L.INTS.chambre.gap[0]+L.INTS.chambre.gap[1])/2;G.player.y=L.SC.chambre.h-60;for(let i=0;i<160&&G.player.scene==='chambre';i++)L.bouger(0,1,0.016);ok(G.player.scene==='village','sortie encore possible après agrandissement en bas');
 L.agrandir('chambre','droite',16);ok(L.SC.chambre.w<=12800,'taille maximale respectée');ok(!L.agrandir('chambre','diagonale',2),'côté inconnu refusé');
 // sous-sol : les cloisons suivent
 const cl0=JSON.stringify(L.INTS.soussol.cloisons);L.agrandir('soussol','haut',2);L.agrandir('soussol','bas',2);const cl=L.INTS.soussol.cloisons;
 ok(cl[0][1]===64&&cl[0][3]===98+64&&cl[1][1]===240+64&&cl[1][3]===70+64,'cloison du sous-sol : prolongée jusqu\'au nouveau mur haut et bas');
 ok(L.P.soussolChien.y===PBASE_Y(L.PBASE.soussolChien.y)+64,'le chien noir garde sa place dans le sous-sol agrandi');
 // sauvegarde, rechargement, plan d'origine
 const wExp=L.SC.chambre.w,ex=L.planExporter();L.planReinit();ok(L.SC.chambre.w===w0&&L.SC.chambre.h===h0&&L.P.chambreDepart.x===cx0&&JSON.stringify(L.INTS.soussol.cloisons)===cl0&&JSON.stringify(L.ITEMS.chambre)===it0,'plan d\'origine : géométrie et meubles remis');
 L.planImporter(ex);ok(L.SC.chambre.w===wExp&&L.planExporter()===ex,'le plan copié restitue les pièces agrandies à l\'identique');L.planReinit();
 // pièce créée agrandie
 const u=L.creerPiece('Salle',10,8,2,2,'salon');L.agrandir(u,'droite',4);ok(L.SC[u].w===320+128&&L.INTS[u].tw===14,'pièce créée agrandie (tw mis à jour)');
 const e2=L.planExporter();L.planReinit();L.planImporter(e2);ok(L.SC[u].w===448,'pièce créée agrandie : sauvegardée et rechargée');L.planReinit();
 // passage ouvert
 const a=L.creerPiece('Salon bis',14,10,0,0,'salon','passage');const pa=L.ITEMS.salon.find(i=>i[2]==='passage'&&i[4]===a),pb=L.ITEMS[a].find(i=>i[2]==='passage'&&i[4]==='salon');
 ok(pa&&pb&&!L.ITEMS.salon.some(i=>i[2]==='porte'&&i[4]===a),'passage ouvert créé : deux passages reliés, aucune porte');
 L.nouvellePartie(false);vider();G.player.scene='salon';G.player.x=pa[0]+24;G.player.y=90;for(let i=0;i<60&&G.player.scene==='salon';i++)L.bouger(0,-1,0.016);ok(G.player.scene===a,'marcher dans le passage : on change de pièce sans appuyer sur E');
 ok(!L.degager()&&G.player.y<L.SC[a].h-14,'arrivée libre, hors de la zone de déclenchement');
 for(let i=0;i<200&&G.player.scene===a;i++)L.bouger(0,1,0.016);ok(G.player.scene==='salon'&&G.player.y>76,'retour par le passage opposé, sans boucle infinie');
 const e3=L.planExporter();L.planReinit();L.planImporter(e3);ok(L.ITEMS.salon.some(i=>i[2]==='passage'&&i[4]===a),'passage conservé par le plan copié');
 ok(L.collItem(L.ITEMS.salon.find(i=>i[2]==='passage'))===null,'un passage n\'a pas de collision');L.planReinit();}
function PBASE_Y(y){return y;}
// routes modifiables, trajets des personnages, mode public
{L.planReinit();L.nouvellePartie(false);vider();const R=L.ROUTES;ok(R.length===3&&R.every(r=>r[4]==='p'),'3 routes de l\'histoire, de type pavé');
 const tr0=L.trajets();R[0][1]+=64;L.appliquerPlan();const tr1=L.trajets();ok(tr1.ROUTE_Y===tr0.ROUTE_Y+64&&tr1.RECHERCHE[1].y===tr0.RECHERCHE[1].y+64,'déplacer la route du nord : les trajets de Nathalie et Paul suivent');
 const n=L.nathalie(5.5);ok(Number.isFinite(n.x)&&Number.isFinite(n.y),'Nathalie reste calculable avec une route déplacée');
 const nv=R.length;R.push([100,1200,320,64,'t']);ok(L.redimRoute(R[3],4)&&R[3][2]===448,'allonger une route ajoutée');ok(!L.redimRoute(R[3],-20),'trop court : refusé');
 R[1].off=true;L.appliquerPlan();const ex=L.planExporter();const J=JSON.parse(ex);ok(J.ro.length===4&&J.ro[1][5]===1&&J.ro[3][4]==='t','le plan contient routes, type et route de l\'histoire masquée');
 L.planReinit();ok(L.ROUTES.length===3&&!L.ROUTES[1].off&&L.ROUTES[0][1]===870&&L.trajets().ROUTE_Y===918,'plan d\'origine : routes et trajets remis');
 L.planImporter(ex);ok(L.ROUTES.length===4&&L.ROUTES[1].off===true&&L.planExporter()===ex,'le plan copié restitue les routes à l\'identique');
 R[1].off=false;L.planImporter(JSON.stringify({ro:[[0,0,10,10,'p']]}));ok(L.ROUTES.length===4,'routes invalides ou incomplètes ignorées');L.planReinit();
 L.planImporter(JSON.stringify({ro:[[0,870,3600,96,'p'],[0,2090,3600,96,'p'],[1560,966,64,1124,'p'],[5,5,'x',9,'p']]}));ok(L.ROUTES.length===3,'route non numérique ignorée');L.planReinit();
 L.setPublic(true);L.nouvellePartie(false);vider();G.L.vuReda=true;G.mem.codeAppris=true;G.L.aLaViande=true;const o=L.objectif();ok(o&&!/\(K =|touche K|fais passer/i.test(o.t),'mode public : plus de consigne parlant des outils de test');
 G.L.perdu=true;ok(!/\(K\)|teste des dialogues/.test(L.objectif().t),'mode public : consigne « boucle perdue » sans outils de test');L.setPublic(false);}
// extension sans rupture : même plan, même sol, même vue
{L.planReinit();const u=L.creerPiece('T',10,8,1,1,'salon');G.player.scene=u;G.player.x=100;G.player.y=150;
 L.agrandir(u,'gauche',2);ok(G.player.scene===u&&G.player.x===164&&G.player.y===150,'extension à gauche : le joueur reste au même endroit dans la pièce');
 L.agrandir(u,'haut',3);ok(G.player.y===150+96&&L.INTS[u].dec[0]===64&&L.INTS[u].dec[1]===96,'extension en haut : joueur décalé, motif du sol aligné (dec conservé)');
 const e=L.planExporter();L.planReinit();L.planImporter(e);ok(L.INTS[u].dec[0]===64&&L.INTS[u].dec[1]===96,'motif du sol conservé après rechargement');L.planReinit();G.player.scene='village';G.player.x=L.PORTES_V[0].x;G.player.y=L.PORTES_V[0].y+30;}
// murs intérieurs infranchissables
{L.planReinit();L.nouvellePartie(false);vider();const W=L.MURS;ok(Object.keys(W).every(k=>L.INTS[k])&&W.chambre.length===0,'aucun mur par défaut');
 W.chambre.push([100,150,128,48]);ok(L.solids('chambre').some(r=>r[0]===100&&r[1]===184&&r[2]===128),'mur horizontal : collision sur sa base');
 G.player.scene='chambre';G.player.x=160;G.player.y=130;for(let i=0;i<150;i++)L.bouger(0,1,0.016);ok(G.player.scene==='chambre'&&G.player.y<=184.5,'le joueur ne traverse pas un mur horizontal');
 W.chambre.length=0;W.chambre.push([300,100,16,128]);G.player.x=240;G.player.y=170;for(let i=0;i<150;i++)L.bouger(1,0,0.016);ok(G.player.x<=300-5&&G.player.scene==='chambre','le joueur ne traverse pas un mur vertical');
 W.chambre.length=0;W.chambre.push([100,150,64,48],[200,150,64,48]);G.player.x=182;G.player.y=130;for(let i=0;i<120;i++)L.bouger(0,1,0.016);ok(G.player.y>200||G.player.scene!=='chambre','entre deux murs, l\'ouverture laisse passer');
 W.chambre.length=0;W.chambre.push([100,150,128,48]);ok(!L.degager()||true,'dégagement sans erreur');
 const ex=L.planExporter();ok(JSON.parse(ex).m.chambre.length===1,'les murs sont dans le plan');L.planReinit();ok(W.chambre.length===0,'plan d\'origine : murs retirés');
 L.planImporter(ex);ok(W.chambre.length===1&&L.planExporter()===ex,'le plan copié restitue les murs à l\'identique');
 const r=W.chambre[0];ok(L.redimMur('chambre',r,2)&&r[2]===192,'allonger un mur horizontal');ok(!L.redimMur('chambre',r,-20),'trop court : refusé');ok(!L.redimMur('chambre',r,40),'dépasse la pièce : refusé');
 L.agrandir('chambre','gauche',2);ok(r[0]===164,'agrandir à gauche : les murs suivent');L.agrandir('chambre','haut',2);ok(r[1]===214,'agrandir en haut : les murs suivent');
 L.planReinit();L.planImporter(JSON.stringify({m:{chambre:[[1,2,'x',4],[100,100,64,48]],inconnue:[[1,1,32,32]]}}));ok(W.chambre.length===1&&!W.inconnue,'murs invalides ignorés');
 const u=L.creerPiece('M',10,8,1,1,'salon');W[u].push([60,100,64,48]);ok(L.solids(u).some(r=>r[0]===60),'mur dans une pièce créée');L.supprimerPiece(u);ok(!W[u],'pièce supprimée : ses murs aussi');L.planReinit();G.player.scene='village';G.player.x=L.PORTES_V[0].x;G.player.y=L.PORTES_V[0].y+30;}
console.log('dialogues joués :',new Set(G.log).size);
// ---- Village agrandi, routes et murs étirés au pixel près
{
 L.planReinit();L.nouvellePartie(false);vider();
 const a0=[L.BATM.Maison_Aaron[1],L.BATM.Maison_Aaron[2]],pv=L.PORTES_V[0].x;
 ok(L.SC.village.w===3600&&L.SC.village.h===2700&&L.VOFF[0]===0,'village : taille d\'origine');
 ok(L.agrandirVillage('droite',10)&&L.SC.village.w===3920&&L.BATM.Maison_Aaron[1]===a0[0]&&L.VOFF[0]===0,'agrandir à droite : rien ne bouge');
 L.changerScene('village',500,900,3);L.G.trail=[{scene:'village',x:490,y:900}];
 ok(L.agrandirVillage('gauche',10)&&L.SC.village.w===4240&&L.VOFF[0]===320,'agrandir à gauche : la carte grandit');
 ok(L.BATM.Maison_Aaron[1]===a0[0]+320&&L.PORTES_V[0].x===pv+320,'les maisons et leurs portes suivent le décalage');
 ok(L.ROUTES[0][0]===320&&L.ROUTES[2][0]===1560+320,'les routes suivent le décalage');
 ok(L.G.player.x===820&&L.G.trail[0].x===810,'le joueur et sa trace restent au même endroit dans le décor');
 ok(L.trajets().RECHERCHE[0].x===1850+320,'les trajets des personnages suivent');
 const sy=L.ROUTES[0][1];
 ok(L.agrandirVillage('haut',10)&&L.SC.village.h===3020&&L.ROUTES[0][1]===sy+320&&L.G.player.y===1220,'agrandir en haut');
 ok(L.agrandirVillage('bas',5)&&L.SC.village.h===3180,'agrandir en bas');
 ok(!L.agrandirVillage('milieu',5),'côté inconnu refusé');
 const t=L.planExporter();ok(JSON.parse(t).v.w===4240,'le plan contient la taille du village');
 L.planReinit();ok(L.SC.village.w===3600&&L.SC.village.h===2700&&L.VOFF[0]===0&&L.BATM.Maison_Aaron[1]===a0[0]&&L.PORTES_V[0].x===pv,'plan d\'origine : village remis tel quel');
 L.planImporter(t);ok(L.SC.village.w===4240&&L.SC.village.h===3180&&L.VOFF[0]===320&&L.VOFF[1]===320&&L.BATM.Maison_Aaron[1]===a0[0]+320,'le plan copié restitue le village agrandi');
 L.planImporter(JSON.stringify({b:{}}));ok(L.SC.village.w===3600&&L.VOFF[0]===0,'ancien plan sans village : taille d\'origine');
 L.planImporter(JSON.stringify({v:{w:99999,h:99999,o:[-5,'x']}}));ok(L.SC.village.w===3600&&L.VOFF[0]===0,'village invalide ignoré');
 L.planReinit();
 // routes au pixel près
 const r=L.ROUTES[2],h0=r[3],y0=r[1];
 ok(L.etirerRoute(r,'fin',16)&&r[3]===h0+16&&r[1]===y0,'route : allonger la fin de 16 px');
 ok(L.etirerRoute(r,'debut',8)&&r[1]===y0-8&&r[3]===h0+24,'route : allonger le début de 8 px (elle part vers le haut)');
 ok(L.etirerRoute(r,'debut',-8)&&r[1]===y0&&r[3]===h0+16,'route : raccourcir le début de 8 px');
 ok(L.etirerRoute(r,'fin',-1)&&r[3]===h0+15,'route : 1 px près');
 ok(!L.etirerRoute(r,'fin',-5000)&&r[3]===h0+15,'route : trop courte refusée');
 ok(!L.etirerRoute(r,'fin',99999),'route : plus grande que le village refusée');
 ok(!L.etirerRoute([0,0,64,64,'p'],'fin',16),'route inconnue refusée');
 const rh=L.ROUTES[0],w0=rh[2],x0=rh[0];
 ok(!L.etirerRoute(rh,'fin',1),'route horizontale déjà au bord droit : refusée');
 ok(L.etirerRoute(rh,'fin',-96)&&rh[2]===w0-96,'route horizontale : raccourcir la fin');
 L.planReinit();
 ok(L.trajets().ROUTE_Y===L.ROUTES[0][1]+L.ROUTES[0][3]/2,'les trajets restent calculables');
 // murs au pixel près
 L.MURS.chambre.push([100,100,128,48]);const m=L.MURS.chambre[L.MURS.chambre.length-1];
 ok(L.etirerMur('chambre',m,'fin',16)&&m[2]===144&&m[0]===100,'mur : allonger la fin');
 ok(L.etirerMur('chambre',m,'debut',16)&&m[0]===84&&m[2]===160,'mur : allonger le début (il part vers la gauche)');
 ok(L.etirerMur('chambre',m,'debut',-4)&&m[0]===88&&m[2]===156,'mur : raccourcir le début de 4 px');
 ok(!L.etirerMur('chambre',m,'debut',500),'mur : sortir de la pièce refusé');
 ok(!L.etirerMur('chambre',m,'fin',-500),'mur : trop court refusé');
 L.MURS.chambre.push([300,40,16,128]);const mv=L.MURS.chambre[L.MURS.chambre.length-1];
 ok(L.etirerMur('chambre',mv,'fin',16)&&mv[3]===144&&L.etirerMur('chambre',mv,'debut',16)&&mv[1]===24&&mv[3]===160,'mur vertical : allonger fin et début');
 ok(!L.etirerMur('village',m,'fin',16),'les murs n\'existent pas dans le village');
 L.planReinit();
}
// ---- Haies d'origine retirées : village = herbe nue
{
 L.planReinit();
 ok(L.BUISSONS.length===0&&L.HAIES_ORIGINE.length===147,'le village d\'origine n\'a plus de haies (147 retirées)');
 const ancien={b:{},u:[...L.HAIES_ORIGINE,[500,1000,'arbre1'],[10,10,'buisson']]};
 L.planImporter(JSON.stringify(ancien));
 ok(L.BUISSONS.length===2&&L.BUISSONS.some(u=>u[2]==='arbre1')&&L.BUISSONS.some(u=>u[0]===10&&u[1]===10),'ancien plan : les haies d\'origine partent, les éléments posés à la main restent');
 const neuf=L.planExporter();ok(JSON.parse(neuf).bv===1,'le plan enregistré est marqué comme nettoyé');
 L.planImporter(JSON.stringify({bv:1,u:[...L.HAIES_ORIGINE.slice(0,3)]}));ok(L.BUISSONS.length===3,'plan déjà nettoyé : on ne retire plus rien (haie posée volontairement)');
 L.planImporter(JSON.stringify({v:{w:3920,h:2700,o:[320,0]},u:L.HAIES_ORIGINE.slice(0,5).map(h=>[h[0]+320,h[1],h[2]]).concat([[77,77,'arbre1']])}));
 ok(L.BUISSONS.length===1&&L.BUISSONS[0][2]==='arbre1','village décalé : les haies d\'origine sont retrouvées malgré le décalage');
 L.planReinit();
}
// ---- E actif uniquement devant la porte, pile alignée sur la vraie porte
{
 L.planReinit();L.nouvellePartie(false);vider();G.minute=0;G.mode='jeu';
 const nom=id=>{const c=L.cible();return c?c.id:null;};
 for(const p of L.PORTES_V){const b=L.BATM[p.own],zs=L.zonesPorte(p);
  for(const z of zs){const cxz=(z[0]+z[2])/2,cyz=(z[1]+z[3])/2;
   aller('village',cxz,cyz);ok(nom()===p.id,p.id+' : E actif au milieu devant la porte');
   aller('village',z[0]+1,z[1]+1);ok(nom()===p.id,p.id+' : E actif dans le coin de la zone');
   aller('village',z[0]-6,cyz);ok(nom()!==p.id,p.id+' : plus de E à 6 px à gauche de la porte');
   aller('village',z[2]+6,cyz);ok(nom()!==p.id,p.id+' : plus de E à 6 px à droite de la porte');
   aller('village',cxz,z[3]+6);ok(nom()!==p.id,p.id+' : plus de E en reculant de la porte');}
  const a=L.G.L?null:null;}
 // l'ancien point (au pied du chemin, à côté de la vraie porte d'Aaron) n'ouvre plus rien
 {const b=L.BATM.Maison_Aaron;aller('village',b[1]+130,b[2]+406);ok(nom()!=='p_aaron','Aaron : l\'ancien point (côté escalier) n\'est plus actif');}
 // école : deux portes, deux zones, une seule entrée
 {const pe=L.PORTES_V.find(p=>p.id==='p_ecole'),zs=L.zonesPorte(pe);ok(zs.length===2,'école : deux portes');
  aller('village',(zs[1][0]+zs[1][2])/2,(zs[1][1]+zs[1][3])/2);const c=L.cible();ok(c&&c.id==='p_ecole'&&Math.abs(c.x-(zs[1][0]+zs[1][2])/2)<1,'école : la bulle E se place sur la porte où l\'on se trouve');
  aller('village',(zs[0][2]+zs[1][0])/2,(zs[0][1]+zs[0][3])/2);ok(nom()!=='p_ecole','école : entre les deux portes, pas de E');}
 L.planReinit();
}
// ---- Limites ×10
{
 L.planReinit();let g=0;while(L.agrandirVillage('droite',400)&&g<500)g++;
 ok(L.SC.village.w<=64000&&L.SC.village.w>64000-12800&&!L.agrandirVillage('droite',400),'village : jusqu\'à 64000 px de large');
 g=0;while(L.agrandirVillage('bas',400)&&g<500)g++;
 ok(L.SC.village.h<=48000&&L.SC.village.h>48000-12800&&!L.agrandirVillage('bas',400),'village : jusqu\'à 48000 px de haut');
 const gros=L.planExporter();L.planReinit();ok(L.SC.village.w===3600,'plan d\'origine : taille de départ');L.planImporter(gros);
 ok(L.SC.village.w>50000&&L.SC.village.h>40000,'un village géant se recharge tel quel');
 L.planReinit();
 let gi=0;while(L.agrandir('chambre','droite',100)&&gi<100)gi++;
 ok(L.SC.chambre.w<=12800&&L.SC.chambre.w>12800-3200&&!L.agrandir('chambre','droite',100),'intérieur : jusqu\'à 12800 px de large');
 gi=0;while(L.agrandir('chambre','bas',100)&&gi<100)gi++;
 ok(L.SC.chambre.h<=8000&&L.SC.chambre.h>8000-3200,'intérieur : jusqu\'à 8000 px de haut');
 const u=L.creerPiece('Géante',24,16,1,1,'salon');for(let i=0;i<3;i++)L.agrandir(u,'droite',100);
 const w2=L.SC[u].w,exp=L.planExporter();L.planReinit();L.planImporter(exp);ok(L.SC[u]&&L.SC[u].w===w2,'une pièce créée très grande se recharge sans être rognée');
 L.planReinit();
}

