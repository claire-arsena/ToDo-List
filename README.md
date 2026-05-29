# ToDo List - Claire Arsena

Application web de gestion de tâches développée en React.

---

## Note à l'attention du professeur

> **Pour la notation, merci d'évaluer le projet sur le commit suivant :**
>
> ```
> 53726838e9c7196e93d5c5d4673765d774ba881b
> ```
>
> ```bash
> git checkout 53726838e9c7196e93d5c5d4673765d774ba881b
> ```
>
> Les commits postérieurs à celui-ci correspondent à un développement **personnel**
> (conversion de l'app en React Native / PWA Expo pour un usage quotidien sur téléphone)
> et **ne font pas partie du périmètre de notation**.

---

## Lancer le projet (version notée)

```bash
cd ma-liste
npm install
npm start
```

L'application s'ouvre sur `http://localhost:3000`.

---

## Fonctionnalités

- Création, modification et suppression de tâches
- Statuts : Nouveau · En cours · En attente · Réussi · Abandonné
- Tri par date d'échéance, date de création ou nom
- Filtrage par statut et par dossier
- Agenda mensuel avec les tâches placées sur le calendrier
- Gestion de dossiers pour organiser les tâches
- Tableau de bord avec graphique de répartition (Chart.js)
- Données sauvegardées en mémoire + backup JSON intégré
- Design glassmorphism responsive
