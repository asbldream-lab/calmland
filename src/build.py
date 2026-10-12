# Assemble les deux versions du jeu à partir des sources.
# Usage : python3 build.py [plan.json]
#   sans argument : plan par défaut (plan_defaut.json)
#   avec un fichier : le texte de « Copier le plan » (éditeur) est figé dans la version publique
import json,os,sys
ici=os.path.dirname(os.path.abspath(__file__));out=os.path.join(ici,'..','dist');os.makedirs(out,exist_ok=True)
rd=lambda f:open(os.path.join(ici,f),encoding='utf-8').read()
plan=open(sys.argv[1],encoding='utf-8').read().strip() if len(sys.argv)>1 else rd('plan_defaut.json')
json.loads(plan)
main=rd('main.js');a="const PUBLIC=false,PLAN_FIGE='';"
assert a in main
mainpub=main.replace(a,"const PUBLIC=true,PLAN_FIGE="+json.dumps(plan,ensure_ascii=False)+";",1)
open(os.path.join(ici,'main_pub.js'),'w',encoding='utf-8').write(mainpub)
shell=rd('shell.html')
def build(mainsrc,pub):
    h=shell
    if pub:
        t=" · J / K : +1 / +5 min · O / P : zoom · T : test · G : guide · M : son";assert t in h
        h=h.replace(t," · O / P : zoom · M : son",1).replace("</style>","#outils,#cote,#guide,#b-test,#b-editeur,#b-guide{display:none!important}\n</style>",1)
    for k,s in [('/*ASSETS*/',rd('assets.js')),('/*LOGIC*/',rd('logic.js')),('/*MAIN*/',mainsrc)]:h=h.replace(k,s)
    return h
open(os.path.join(out,'calmland_demo.html'),'w',encoding='utf-8').write(build(main,False))
open(os.path.join(out,'calmland_public.html'),'w',encoding='utf-8').write(build(mainpub,True))

# --- version mobile (jeu + éditeur + test au doigt, plein écran) ---
import shutil
m=build(main,False)
for x,y in [('<title>Calm Land — démo jouable</title>','<title>Calm Land</title>'),
 ('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">','<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">\n<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black"><meta name="apple-mobile-web-app-title" content="Calm Land"><meta name="theme-color" content="#0b0b10"><link rel="manifest" href="manifest.json"><link rel="apple-touch-icon" href="icon-192.png">'),
 ('<body>','<body class="mob">'),('</style>',rd('mobile_extra.css')+'\n</style>'),('<script>const ASSETS=',rd('mobile_extra.html')+'\n<script>const ASSETS=')]:
    assert x in m,x;m=m.replace(x,y,1)
open(os.path.join(out,'mobile.html'),'w',encoding='utf-8').write(m)
for f in ('manifest.json','icon-192.png','icon-512.png'):shutil.copy(os.path.join(ici,'pwa',f),os.path.join(out,f))
print('OK : dist/calmland_demo.html (éditeur), dist/calmland_public.html (public, plan figé) et dist/mobile.html (mobile)')
