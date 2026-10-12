# Calm Land

Jeu d'enquête 2D en boucle temporelle. Auteur : Abdel.

- `index.html` : le jeu, pour les joueurs (plan figé, pas d'éditeur).
- `editeur.html` : la version avec l'éditeur, pour travailler sur le plan du jeu.
- `src/` : le code source. `logic.js` (logique du jeu), `main.js` (affichage), `assets.js` (images et musique encodées), `test.js` (236 vérifications), `smoke.js` (test automatique), `build.py` (regénère index.html et editeur.html à partir du code source).

Pour remettre à jour `index.html` et `editeur.html` après une modif dans `src/` :
cd src
node test.js
node smoke.js
python3 build.py
# puis copier dist/calmland_public.html vers ../index.html
# et dist/calmland_demo.html vers ../editeur.html
