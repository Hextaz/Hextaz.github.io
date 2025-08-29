# lowdiv – Générateur statique d'affiches de classement

Application 100% front (HTML/CSS/JS) destinée à être hébergée via GitHub Pages. Elle permet de saisir un classement par division et de générer une image PNG haute résolution sur un template graphique.

## Structure

```
lowdiv/
  index.html        # Page principale
  style.css         # Styles
  script.js         # Logique dynamique + export PNG (html2canvas)
  teams.json        # Source des équipes & divisions
  assets/
    template.png    # (À ajouter) Image de fond (ex: l'image fournie dans la demande)
    logos/          # Dossier des logos (fichiers .png)
  logos/fallback.png # (À ajouter) Logo de secours si un logo d'équipe est introuvable
```

## Utilisation
1. Ajouter votre image de fond sous `assets/template.png` (utiliser l'image fournie). Dimensions recommandées ≥ 1920x1080.
2. Déposer les logos d'équipe dans `assets/logos/` (nom de fichier = champ `logo` dans `teams.json`).
3. Modifier `teams.json` selon vos divisions / équipes.
4. Ouvrir `index.html` dans un navigateur (ou via GitHub Pages).
5. Renseigner Titre / Sous-titre puis remplir les tableaux (ordre par glisser-déposer).
6. Cliquer sur "Générer l'affiche" pour chaque division afin de télécharger un PNG.

## Format `teams.json`
Chaque objet: `name`, `division`, `logo` (fichier dans `assets/logos/`). Exemple fourni.

## Personnalisation
Vous pouvez ajuster:
* Couleurs / polices dans `style.css`.
* Résolution d'export (propriété `scale` dans `html2canvas` dans `script.js`).
* Colonnes supplémentaires (ajouter th/td, inputs et adapter la fonction d'export si nécessaire).

## Limitations / Idées futures
* Sauvegarde locale (localStorage) des classements.
* Détection collisions logos manquants (un fallback est déjà géré via `fallback.png`).
* Export de tous les posters en ZIP (JSZip).
* Saisie auto des statistiques à partir d'un CSV.

---
Projet généré automatiquement par assistant IA.
