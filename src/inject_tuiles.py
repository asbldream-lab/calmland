# Injecte sol + atlas2 dans assets.js et les objets (SPR) dans logic.js, à partir de /home/claude/me/out
import json,base64,re
D=json.load(open('tuiles/data.json'));b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
a=open('assets.js',encoding='utf-8').read()
a=re.sub(r',\s*"sol": "data:[^"]*"','',a);a=re.sub(r',\s*"atlas2": "data:[^"]*"','',a)
j=a.rindex('}');a=a[:j]+',\n"sol": "data:image/png;base64,'+b64('tuiles/sol.png')+'",\n"atlas2": "data:image/png;base64,'+b64('tuiles/atlas2.png')+'"\n'+a[j:]
open('assets.js','w',encoding='utf-8').write(a)
def sol(k,w,h):
    if k=='hyd':return [4,h-14,w-8,12]
    n=int(k[1:])
    if n in(0,1,10,11):return [w//2-10,h-26,20,16]
    if n in(2,3):return [w//2-14,h-26,28,18]
    if n in(4,5):return [w//2-12,h-28,24,18]
    if n in(6,7,8,9,12,13):return [w//2-24,h-36,48,30]
    if n==14:return [w//2-30,h-28,60,18]
    if n in(15,16,21):return [6,h-30,w-12,22]
    if n in(17,18,19,20):return [2,h-34,w-4,24]
    if n in(22,23):return [4,h-50,w-8,44]
    if n in(24,25,26,27):return [w//2-10,h-22,20,14]
    if n==28:return [w//2-7,h-16,14,12]
    if 29<=n<=34 or n in(59,60):return [0,8,w,20]
    if n in(61,62):return [0,h-34,w,26]
    if 63<=n<=68:return [8,h-32,w-16,24]
    return [4,h-22,w-8,16]
spr={'me_'+k:{'x':x,'y':y,'w':w,'h':h,'cat':'deco','nom':'Décor '+k.upper(),'a':'atlas2','sol':sol(k,w,h)} for k,(x,y,w,h) in D['pos'].items()}
l=open('logic.js',encoding='utf-8').read()
l=re.sub(r'// ME-SPR-BEGIN\n.*?// ME-SPR-END\n','',l,flags=re.S)
i=l.index('const SPR=');e=l.index('\n',i)+1
l=l[:e]+'// ME-SPR-BEGIN\nObject.assign(SPR,'+json.dumps(spr,ensure_ascii=False,separators=(',',':'))+');\n// ME-SPR-END\n'+l[e:]
open('logic.js','w',encoding='utf-8').write(l);print('injecté',len(spr),'types')
