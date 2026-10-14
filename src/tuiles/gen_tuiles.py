import re,base64,io,glob,random,statistics,warnings
from PIL import Image,ImageDraw
warnings.filterwarnings('ignore');random.seed(21)
T=32;CW,CH=150,112
P='Modern_Exteriors_32x32/ME_Theme_Sorter_32x32/'
props={int(l.split()[0]):P+('17_Garden_Singles_32x32/' if 'Garden' in l.split()[1] else '3_City_Props_Singles_32x32/')+l.split()[1] for l in open('/tmp/props.txt')}
_c={};KEY={}
def pr(i):
    im=_c.setdefault(i,Image.open(props[i]).convert('RGBA'));KEY[id(im)]='p%d'%i;return im
ld=lambda pat:[Image.open(f).convert('RGBA') for f in sorted(glob.glob(P+pat))]
CRACK=[im for im in ld('20_*/*_Crack_[1-6].png')];HYD=ld('18_*/*Fire_Hydrant.png')[0];CLOV=ld('19_*/*Clover*')
DIRT=ld('1_*/*Props_Dirt_*')
city=Image.open(P+'2_City_Terrains_32x32.png').convert('RGBA')
tile=lambda c,r:city.crop((c*T,r*T,c*T+T,r*T+T))
A=open('/home/claude/calmland/src/assets.js',encoding='utf-8').read()
def asset(k):return Image.open(io.BytesIO(base64.b64decode(re.search('"'+k+'": "data:image/png;base64,([^"]+)"',A).group(1)))).convert('RGBA')
G='1_Terrains_and_Fences_Singles_32x32/ME_Singles_Terrains_and_Fences_32x32_'
base=Image.open(P+G+'Grass_1_22.png').convert('RGBA');deco=[]
for f in glob.glob(P+G+'Grass_1_*.png'):
    im=Image.open(f).convert('RGBA');px=list(im.getdata())
    if im.size==(32,32) and all(p[3]==255 for p in px):
        s=statistics.pstdev([p[1] for p in px]);m=statistics.mean([p[1] for p in px])
        if 3<s<25 and abs(m-151)<12:deco.append(im)
def flaque(w,h):   # flaque d'eau en pixel art
    im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
    d.ellipse((0,0,w-1,h-1),fill=(70,96,118,150));d.ellipse((3,2,w-4,h-3),fill=(110,145,170,140));d.line((w*0.3,h*0.35,w*0.6,h*0.35),fill=(210,230,240,170),width=2)
    return im.resize((w//2,h//2),Image.NEAREST).resize((w,h),Image.NEAREST)
PUD=[flaque(56,22),flaque(40,18),flaque(72,26)]
KEY[id(HYD)]='hyd'
DEC=set(id(x) for x in DIRT+CLOV+PUD)|set(id(pr(i)) for i in range(36,41))
DECALS=[];OUT=[]
# ---------- grille ----------
g=[['g']*CW for _ in range(CH)]
def rect(x0,y0,x1,y1,v):
    for y in range(max(0,y0),min(CH,y1+1)):
        for x in range(max(0,x0),min(CW,x1+1)):g[y][x]=v
H=[24,60,98];V=[28,118]                      # asphalte : 4 rangs / 4 colonnes ; trottoirs : 3 de chaque côté
for y in H:rect(0,y-3,CW-1,y+6,'s')
for x in V:rect(x-3,0,x+6,CH-1,'s')
for y in H:rect(0,y,CW-1,y+3,'a')
for x in V:rect(x,0,x+3,CH-1,'a')
rect(60,33,90,56,'p')                         # grande place
rect(127,36,141,56,'p')                       # petit square à l'est
rect(4,70,22,94,'p');rect(3,3,21,17,'p');rect(127,70,145,92,'p')                          # square au sud-ouest (allées)
for y in range(70,95):
    for x in range(4,23):
        if not(11<=x<=14 or 80<=y<=83 or x in(4,22) or y in(70,94)):g[y][x]='g'
for y in range(3,18):
    for x in range(3,22):
        if not(11<=x<=13 or 9<=y<=11 or x in(3,21) or y in(3,17)):g[y][x]='g'
for (ox,oy) in [(128,72),(137,72),(128,82),(137,82)]:rect(ox,oy,ox+8,oy+4,'k')
B={'Maison_Aaron':(40,17),'Maison_Benjamin':(80,17),'Poste_Police':(132,17),'Maison_Mami':(5,53),'Maison_Paul':(44,53),'Pharmacie':(95,53),'Boulangerie':(106,53),'Maison_Zoe':(40,91),'Ecole':(63,91),'Maison_Marc':(95,91)}
DOOR={'Maison_Aaron':[80],'Maison_Benjamin':[259],'Maison_Paul':[191],'Pharmacie':[112],'Boulangerie':[112],'Poste_Police':[110],'Maison_Mami':[270],'Maison_Zoe':[334],'Maison_Marc':[354],'Ecole':[288,480]}
IMS={k:asset('b_'+k) for k in B}
for k,(tx,bot) in B.items():
    w=IMS[k].width
    if k in('Pharmacie','Boulangerie','Ecole','Poste_Police'):rect(tx-1,bot,tx+w//T,bot+3,'p')   # parvis pavé
    else:
        for dx in DOOR[k]:c=(tx*T+dx)//T;rect(c-1,bot,c,bot+3,'s')                             # allée vers la porte
isA=lambda x,y:0<=x<CW and 0<=y<CH and g[y][x]=='a'
img=Image.new('RGBA',(CW*T,CH*T))
for y in range(CH):
    for x in range(CW):
        v=g[y][x]
        if v=='g':t=random.choice(deco) if random.random()<0.08 else base
        elif v=='s':t=tile(9+x%4,y%4)
        elif v=='p':t=tile(39+x%4,y%4)
        elif v=='k':
            ox=128 if x<137 else 137;oy=72 if y<82 else 82;t=tile(x-ox,8+y-oy)
        else:
            u,d,l,r=not isA(x,y-1) and y>0,not isA(x,y+1) and y<CH-1,not isA(x-1,y) and x>0,not isA(x+1,y) and x<CW-1
            t=tile(0,8) if u and l else tile(8,8) if u and r else tile(0,12) if d and l else tile(8,12) if d and r else tile(1,8) if u else tile(1,12) if d else tile(0,9) if l else tile(8,9) if r else tile(random.randrange(5),4+random.randrange(4))
        img.alpha_composite(t,(x*T,y*T))
def zH(x,y):
    for k in range(4):
        for rr in (1,2):img.alpha_composite(tile(7+k%2,6+(rr-1)),((x+k)*T,(y+rr)*T))
def zV(x,y):
    for k in range(4):
        for cc in (1,2):img.alpha_composite(tile(7+(cc-1),4+k%2),((x+cc)*T,(y+k)*T))
for y in H:
    for x in V:zH(x-8,y);zH(x+8,y)
for x in V:
    for y in H:zV(x,y-8);zV(x,y+8)
zH(73,60)
S=[];occ=[]
def sp(im,cx,by):
    x,y=int(cx-im.width/2),int(by-im.height)
    if id(im) in DEC:DECALS.append((x,y,im));return
    S.append((by,im,x,y))
    if id(im) in KEY:OUT.append([x,int(by),KEY[id(im)]])
for k,(tx,bot) in B.items():
    im=IMS[k];S.append((bot*T,im,tx*T,bot*T-im.height));occ.append((tx*T,bot*T-im.height,tx*T+im.width,bot*T))
# jardins de devant : haie en bordure (sauf allée), pots à la porte, boîte aux lettres
for k,(tx,bot) in B.items():
    im=IMS[k];x0,x1=tx*T,tx*T+im.width
    if k in('Pharmacie','Boulangerie','Ecole','Poste_Police'):
        sp(pr(31 if k!='Ecole' else 33),x0+48,bot*T+40);sp(pr(30 if k!='Ecole' else 34),x1-48,bot*T+40)
        if k=='Ecole':
            for cx in (x0-40,x1+40):sp(pr(13),cx,(bot+3)*T)
            sp(pr(16),x0+im.width//2,(bot+2)*T+20)
        continue
    walk=[(tx*T+dx)//T for dx in DOOR[k]]
    for c in range(tx-2,tx+im.width//T+2):
        if any(w-2<=c<=w for w in walk):continue
        if c%2==0:sp(pr(60 if (c//2)%2 else 59),c*T+32,(bot+4)*T-2)
    for w in walk:sp(pr(72),(w-1)*T-14,(bot+1)*T+8);sp(pr(72),(w+1)*T+14,(bot+1)*T+8);sp(pr(45),(w+1)*T+50,(bot+3)*T)
    for cx in (x0+40,x1-40):sp(pr(random.choice([29,30,31])),cx,(bot+2)*T)
    sp(pr(random.choice([10,11])),x0-70,bot*T-30);sp(pr(random.choice([10,11])),x1+70,bot*T-30)
# place : fontaine, bancs, bacs, jardinières, doubles lampadaires
PX,PY=75*T+16,44*T
sp(pr(23),PX,PY+16)
for dx in (-4,4):sp(pr(16),PX+dx*T,PY+12)
for dy in (-4,4):sp(pr(21),PX,PY+dy*T+40)
for (cx,cy) in [(63,37),(88,37),(63,55),(88,55),(63,46),(88,46)]:sp(pr(13),cx*T,cy*T)
for cx in (69,75,81):sp(pr(33),cx*T+16,35*T);sp(pr(34),cx*T+16,53*T)
for (cx,cy) in [(68,40),(83,40),(68,50),(83,50)]:sp(pr(24),cx*T,cy*T)
for (cx,cy) in [(130,40),(138,40),(130,54),(138,54)]:sp(pr(8),cx*T,cy*T)
sp(pr(16),134*T,47*T);sp(pr(23),134*T,44*T)
for (cx,cy) in [(7,74),(19,74),(7,91),(19,91)]:sp(pr(random.choice([10,11,12])),cx*T,cy*T)
sp(pr(16),13*T,77*T);sp(pr(23),12*T+16,10*T+20);sp(pr(16),8*T,10*T+16);sp(pr(16),17*T,10*T+16)
for (cx,cy) in [(6,6),(17,6),(6,16),(17,16)]:sp(pr(random.choice([10,11])),cx*T,cy*T)
sp(pr(16),13*T,88*T);sp(pr(24),9*T,82*T+20);sp(pr(24),17*T,82*T+20)
# trottoirs : alternance lampadaire / arbre en bac, en ligne
def sousPlaque(cx,by):
    for k,(tx,bot) in B.items():
        im=IMS[k];top=bot*T-im.height;mx=tx*T+im.width/2
        if abs(cx-mx)<100 and by-128<top and by>top-34:return True
    return False
def libreS(cx,by):return not any(a-20<cx<c+20 and b<by<d+60 for (a,b,c,d) in occ)
for y in H:
    for side,by in ((-1,(y-3)*T+28),(1,(y+6)*T+28)):
        for i,x in enumerate(range(2,CW-2,7)):
            if any(xv-6<=x<=xv+9 for xv in V):continue
            if any(g[min(CH-1,by//T+dd)][x] in 'p' for dd in (-2,-1,1,2)) and side<0 and 57<=x<=93:continue
            if any((tx*T+dx)//T-2<=x<=(tx*T+dx)//T+1 for k,(tx,bot) in B.items() for dx in DOOR[k] if abs(bot+3-(by//T))<5):continue
            if sousPlaque(x*T+16,by):continue
            sp(pr(28) if i%2==0 else pr(8),x*T+16,by)
for x in V:
    for side,cx in ((-1,(x-2)*T),(1,(x+5)*T+32)):
        for i,y in enumerate(range(3,CH-2,7)):
            if any(yh-6<=y<=yh+9 for yh in H):continue
            sp(pr(28) if i%2==0 else pr(8),cx,y*T+28)
for (cx,cy) in [(27,58),(36,58),(117,96),(125,22)]:sp(HYD,cx*T,cy*T)
# bordure de carte : rangées d'arbres alignées (quinconce), hors routes
def bordure(x,y):return g[min(CH-1,max(0,int(y//T)))][min(CW-1,max(0,int(x//T)))]=='g' and not any(a-30<x<c+30 and b<y<d+40 for (a,b,c,d) in occ)
TRB=[10,11,10,12,11]
for i,x in enumerate(range(48,CW*T,96)):
    for j,by in enumerate((80,180)):
        xx=x+(48 if j%2 else 0)
        if bordure(xx,by-40):sp(pr(TRB[(i+j)%5]),xx,by)
        if bordure(xx,CH*T-by+90):sp(pr(TRB[(i+j+2)%5]),xx,CH*T-by+90)
for i,y in enumerate(range(300,CH*T-200,96)):
    for j,cx in enumerate((50,140)):
        yy=y+(48 if j%2 else 0)
        if bordure(cx,yy-40):sp(pr(TRB[(i+j)%5]),cx,yy)
        if bordure(CW*T-cx,yy-40):sp(pr(TRB[(i+j+1)%5]),CW*T-cx,yy)
# espaces verts intérieurs : jardins ordonnés (arbre + massifs) sans surcharger
for k in range(240):
    cx=random.randint(8,CW-8)*T;cy=random.randint(8,CH-8)*T
    ok=all(g[(cy+dy)//T][(cx+dx)//T]=='g' for dx in (-96,0,96) for dy in (-128,0,64)) and not any(a-90<cx<c+90 and b-60<cy<d+120 for (a,b,c,d) in occ)
    if ok and not any(abs(cx-s[2])<150 and abs(cy-s[0])<150 for s in S if s[1].height>=96):
        sp(pr(random.choice([10,11,12,0,1])),cx,cy);sp(pr(random.choice([63,65,66])),cx-64,cy+20);sp(pr(random.choice([46,48,50])),cx+56,cy+14)
# imperfections : herbe (fleurs, cailloux, trèfles), sol (fissures, feuilles, flaques)
for k in range(3200):
    x=random.randrange(CW*T);y=random.randrange(CH*T);v=g[y//T][x//T]
    if any(a<x<c and b<y<d for (a,b,c,d) in occ):continue
    r=random.random()
    if v=='g':
        if r<0.22:sp(pr(36+random.randrange(5)),x,y)
        elif r<0.27:sp(random.choice(DIRT[:6]+DIRT[15:21]),x,y)
        elif r<0.33:sp(random.choice(CLOV),x,y)
    elif v in 'sp':
        if r<0.03:sp(random.choice(DIRT[6:15]+DIRT[21:]),x,y)
        elif r<0.045:sp(random.choice(PUD),x,y)
    elif v=='a':
        if r<0.02:sp(random.choice(PUD),x,y)
# ---- sortie : sol (image) + objets (liste) + atlas des objets ----
import json,os
os.makedirs('out',exist_ok=True)
ground=img.copy()
for (x,y,im) in DECALS:ground.alpha_composite(im,(x,y))
ground.convert('RGB').quantize(256,method=Image.MEDIANCUT,dither=Image.NONE).save('out/sol.png',optimize=True)
prev=ground.copy()
for (by,im,x,y) in sorted(S,key=lambda s:s[0]):prev.alpha_composite(im,(x,y))
prev.resize((CW*T*2//5,CH*T*2//5),Image.LANCZOS).save('/mnt/user-data/outputs/plan_village_tuiles.png')
rev={v:k for k,v in KEY.items()}
imgs={}
for k in set(o[2] for o in OUT):
    im=[x for x in list(_c.values())+[HYD] if KEY.get(id(x))==k][0];imgs[k]=im
x=y=0;rowh=0;pos={}
for k,im in sorted(imgs.items(),key=lambda kv:-kv[1].height):
    if x+im.width>1024:x=0;y+=rowh;rowh=0
    pos[k]=(x,y,im.width,im.height);x+=im.width;rowh=max(rowh,im.height)
atl=Image.new('RGBA',(1024,y+rowh))
for k,(ax,ay,w,h) in pos.items():atl.alpha_composite(imgs[k],(ax,ay))
atl.save('out/atlas2.png',optimize=True)
json.dump({'out':OUT,'pos':pos,'B':{k:[tx*T,bot*T-IMS[k].height,IMS[k].width,IMS[k].height] for k,(tx,bot) in B.items()},'door':DOOR,'W':CW*T,'H':CH*T,'H_':H,'V_':V},open('out/data.json','w'))
print('sprites',len(OUT),'types',len(pos),'decals',len(DECALS))
