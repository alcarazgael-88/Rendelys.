# Rendelys

1. Crée un dépôt GitHub et envoie-y ces fichiers.
2. Sur vercel.com : Add New > Project > importe le dépôt. Aucun réglage de build.
3. Ouvre l'URL, onglet Villes > « Charger depuis DVF ».

- `api/dvf.js` : lit les fichiers DVF géolocalisés (files.data.gouv.fr) et filtre les ventes simples.
- `api/communes.js` : codes INSEE et population via geo.api.gouv.fr (départements 13 et 83).
- `insee.json` : indicateurs INSEE (propriétaires, vacance, niveau de vie), à compléter commune par commune.
- Marseille : l'app charge les 16 arrondissements (13201 à 13216).
