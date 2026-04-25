# Roolio — Prototype

Plateforme automobile nouvelle génération. Marketplace, IA Sphera, concours.

---

## 🚀 Déploiement sur Vercel (méthode simple, sans coder)

### Étape 1 — Créer un compte GitHub
1. Va sur **https://github.com**
2. Crée un compte gratuit
3. Une fois connecté, clique sur **"+"** en haut à droite → **"New repository"**
4. Nom : `roolio`
5. Coche **"Public"** (ou Private, comme tu veux)
6. **Ne coche aucune case** ("Add README", etc.)
7. Clique **"Create repository"**

### Étape 2 — Uploader les fichiers sur GitHub
1. Sur la page du nouveau repo, clique sur **"uploading an existing file"**
2. Glisse-dépose **TOUS les fichiers** de ce dossier (sauf `node_modules` s'il existe)
3. Important : tu dois aussi uploader les sous-dossiers `src/` et `public/`
4. Tout en bas : **"Commit changes"**

### Étape 3 — Connecter à Vercel
1. Va sur **https://vercel.com**
2. Clique **"Sign Up"** → choisis **"Continue with GitHub"**
3. Une fois sur le dashboard, clique **"Add New..." → "Project"**
4. Tu vois ton repo `roolio` dans la liste → clique **"Import"**
5. Laisse tout par défaut, clique **"Deploy"**
6. Attends 1-2 minutes ⏳

### Étape 4 — Ton site est en ligne ! 🎉
Tu reçois une URL type : `roolio-xxx.vercel.app`

Tu peux la partager à tes testeurs.

---

## 🛠 Pour développer en local (optionnel)

Si tu veux tester sur ton ordinateur avant de déployer :

```bash
npm install
npm run dev
```

Puis ouvre `http://localhost:5173`

---

## 🔑 Codes utiles

### Mode admin (voir les feedbacks et stats)
Ajoute `?admin=roolio2024` à la fin de ton URL Roolio :
```
https://roolio-xxx.vercel.app/?admin=roolio2024
```

### Codes d'activation Pass (à donner aux clients qui ont payé sur Stripe)
- `ROOLIO-PLAYER-2024` → active Pass Player
- `ROOLIO-ELITE-2024` → active Pass Elite
- `ROOLIO-BATTLE-2024` → active Battle Pass Premium

### Configurer Stripe pour rediriger après paiement
Dans chaque Payment Link Stripe :
1. Ouvre le lien dans le dashboard Stripe
2. Section **"Confirmation page"**
3. Active **"Redirect to a custom URL"**
4. Entre : `https://TON-URL-VERCEL.vercel.app/?stripe_success=true`

---

## 📊 Workflow de test

1. Tu déploies sur Vercel → tu obtiens ton URL
2. Tu partages l'URL à 30-50 testeurs
3. Ils s'inscrivent (ou cliquent "Essayer sans inscription")
4. Ils naviguent et donnent leur avis via le bouton flottant
5. Tu accèdes à `?admin=roolio2024` pour voir les retours
6. Tu exportes les données en JSON quand tu veux

---

## ⚠️ Limitations actuelles (prototype)

- Stockage local uniquement (localStorage navigateur)
- Pas de backend, pas de vraie base de données
- Annonces et utilisateurs (Karim, Sophie, etc.) sont fictifs
- Paiements Stripe fonctionnent mais activation manuelle via codes

C'est normal — c'est un **prototype interactif** pour valider le concept.
Pour un vrai MVP avec backend, il faudra une étape technique supplémentaire.

---

## 📞 Contact technique

Si problème de déploiement, tu peux aussi essayer **Netlify** (même principe) ou demander à un dev.

**Made in Lyon, France** 🇫🇷
