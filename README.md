# Portfolio — Kouamé Chris Anaset

Portfolio personnel d'un étudiant en Techniques de l'informatique (Cégep Saint-Jean-sur-Richelieu) : projets web, logiciels et réseau, parcours et CV.

**Site en ligne : [kouameanaset.netlify.app](https://kouameanaset.netlify.app)**

## Contenu

- **Accueil** : présentation et sélection de projets.
- **Projets** : 14 réalisations avec filtres (Web, Logiciel et réseau, Mobile), descriptions détaillées et liens vers le code quand le dépôt est public.
- **À propos** : parcours, compétences, formation et expérience.
- **Contact** : formulaire qui prépare un courriel dans l'application de messagerie.
- **CV** : version PDF téléchargeable (`cv/cv_kouame.pdf`).

## Assistant IA

Un widget « Pose-moi une question » (`js/chat.js`) répond aux questions des visiteurs sur mon parcours, mes compétences et mes projets. Il appelle la fonction Netlify `netlify/functions/chat.mjs` (route `/api/chat`), qui interroge l'API Gemini de Google (palier gratuit). La clé reste côté serveur.

- Base de connaissances et consignes : `netlify/functions/knowledge.mjs` (à garder synchronisée avec `about.html` et `projects.html`).
- Garde-fous : limite de débit par IP, historique et taille des messages plafonnés, réponses limitées aux faits fournis.
- Configuration : définir la variable d'environnement `GEMINI_API_KEY` dans Netlify (Site configuration > Environment variables). Variable facultative `GEMINI_MODEL` pour changer de modèle.
- Test en local : `npx netlify dev` (avec la clé dans un fichier `.env` non versionné).

## Technologies

Site statique en HTML, CSS et JavaScript, sans framework ni étape de build.

- Mise en page responsive (téléphone, tablette, ordinateur)
- Filtrage des projets en JavaScript
- Navigation accessible (lien d'évitement, attributs ARIA)
- Hébergement sur Netlify, déploiement automatique à chaque `git push` sur `main`

## Structure

```
index.html, projects.html, about.html, contact.html
css/style.css        Styles du site
js/main.js           Menu, filtres de projets, formulaire de contact
assets/              Icônes
cv/cv_kouame.pdf     CV en PDF
```

## Lancer le site en local

Aucune installation n'est nécessaire. Ouvrez le dossier avec un serveur statique, par exemple l'extension Live Server de VS Code, ou :

```bash
npx serve .
```

## Déploiement

Netlify publie directement la racine du dépôt : commande de build vide, dossier de publication `.`.
