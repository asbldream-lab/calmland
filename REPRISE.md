# REPRISE Calm Land (à lire en premier)

## Le projet
Jeu d'enquête 2D en boucle temporelle (Aaron cherche sa fille Loulou). Auteur : Abdel (non technicien, travaille sur Mac, débutant en code).
Site : https://asbldream-lab.github.io/calmland/ (jeu public) · /editeur.html (PC, éditeur + test) · /mobile.html (téléphone plein écran).
Dépôt : https://github.com/asbldream-lab/calmland (GitHub Pages, branche main). Le nom de domaine est acheté mais pas encore branché.

## Fichiers
- `src/logic.js` logique du jeu et données · `src/main.js` affichage, éditeur, mobile, sauvegarde GitHub · `src/shell.html` page · `src/assets.js` images + musique en base64 · `src/mobile_extra.*` interface mobile · `src/pwa/` icônes
- `src/build.py` fabrique `index.html` (public, plan figé), `editeur.html`, `mobile.html` à la racine du site depuis `src/` (sortie dans `dist/`, à copier à la racine).
- `plan.json` (racine du dépôt) : le plan fait dans l'éditeur, envoyé tout seul sur GitHub avec la clé.

## Tests à lancer avant de livrer (dans `src/`)
`node test.js` (339 ok attendus) · `node smoke.js` · `POISON=1 MAIN=main_pub.js node smoke.js` · `node smoke_gh.js` · `node smoke_mobile.js` · puis `python3 build.py`.
Un vrai navigateur (Playwright/Chromium) marche pour tester le rendu et le tactile.

## Déjà fait
Musique d'ambiance (touche M / bouton 🔊) · menu déroulant des pièces · sauvegarde auto du plan sur GitHub (clé collée une fois par appareil, lien de connexion) · page mobile (joystick, menu ☰, pincement, barre d'éditeur) · haies d'origine retirées · village et pièces agrandissables (village 64000x48000, pièce 12800x8000, zoom 1 %) · routes et murs étirables (poignées jaunes, pas 1 à 32 px) · chemin brun supprimé · E des portes seulement devant la vraie porte (zones bleues dans l'éditeur).

## Reste à faire / idées
- Le jeu public ne lit pas encore `plan.json` : il faut figer le plan (build.py lit `src/plan_defaut.json`) ou le brancher.
- Brancher le nom de domaine (GitHub Pages > Custom domain + DNS).
- Plusieurs musiques (menu, village, intérieurs, tension) : un seul fichier pour l'instant.

## Façon de travailler avec Abdel
- Réponses courtes, en français, tutoiement. Une seule question à la fin si besoin.
- Chaque clic décrit en entier (bouton, panneau, position). Mettre le lien de la page à chaque livraison.
- Tester avant de livrer (tests + vrai navigateur), dire ce qui n'a pas pu être testé (téléphone réel).
- Livraison : un `calmland-site.zip` à glisser sur https://github.com/asbldream-lab/calmland/upload/main (Cmd+A dans le dossier dézippé, Commit changes).
- Ne pas remettre ce qu'il a enlevé (haies, chemin brun). Économiser les tokens.

## Village en tuiles (14 oct)
- Le village public/éditeur utilise un SOL EN IMAGE (src/tuiles/sol.png, clé `sol` dans assets.js, drapeau `sl:1` dans le plan) + des objets (clé `atlas2`, ids `me_pNN`, avec collisions) posés comme les arbres.
- Le bouton éditeur « Nouveau village » charge ce plan (src/plan_croquis.json). src/plan_defaut.json = même plan, figé dans la version publique.
- Réseau de marche des personnages : `RC.r` (rues + liaisons porte-rue) ; routes et sentiers dessinés par le sol, pas modifiables à la souris.
- Régénérer : `node gen_tuiles.js` (plan) ; `python3 inject_tuiles.py` (assets + objets) ; `python3 build.py`.
- Les images viennent du pack Modern Exteriors 32x32 (fichiers sources non inclus dans le zip).
