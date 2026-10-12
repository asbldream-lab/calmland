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
print('OK : dist/calmland_demo.html (éditeur) et dist/calmland_public.html (public, plan figé)')
