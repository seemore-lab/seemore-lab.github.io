# SeemoreLab — portfolio

Site vitrine d'une page (HTML/CSS/JS, sans framework), hébergé sur GitHub Pages.

## Où modifier quoi

| Je veux changer…                     | Fichier / endroit                                         |
|--------------------------------------|-----------------------------------------------------------|
| Textes, projets, contact             | `index.html` (chaque projet = un bloc `<article>`)        |
| Couleurs, typo, espacements          | `css/style.css`, tout en haut (`:root`)                   |
| Bande démo du hero                   | `media/hero/reel-landscape.mp4` (ordi) et `reel-portrait.mp4` (téléphone) |
| Passer un film sur Vimeo / YouTube   | dans `index.html`, coller le lien dans `data-embed=""` du projet |

Exemple Vimeo : `data-embed="https://vimeo.com/123456789"` — le site affiche alors le lecteur Vimeo au lieu du fichier local.

## Médias

Générés par `../_work/build-media.sh` à partir de `../Vidéos` :

- `media/previews/` — aperçus en boucle, muets, H.264, < 2,1 Mo
- `media/posters/` — images de couverture
- `media/full/` — films complets avec le son (tous < 32 Mo, limite GitHub : 100 Mo par fichier)
- `media/hero/` — bandes démo horizontale et verticale

## Voir en local

```
python -m http.server 8080 --directory site
```
puis ouvrir http://localhost:8080
