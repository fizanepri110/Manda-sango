# Guide d'intégration Supabase - Mada-Sango

## 🎯 Vue d'ensemble

Cette application React a été intégrée avec Supabase pour récupérer dynamiquement les mots depuis votre base de données au lieu de les avoir codés en dur.

## ✅ Ce qui a été fait

### 1. **Intégration Supabase**
- ✅ Fonction `fetchWordsFromSupabase()` qui récupère les données depuis votre table
- ✅ Gestion des erreurs et fallback sur les données par défaut
- ✅ Support du chargement asynchrone avec indicateur de progression

### 2. **Configuration des variables d'environnement**
- ✅ Fichier `.env.local` configuré avec vos identifiants Supabase
- ✅ Variables d'environnement Vite pour accéder aux secrets

### 3. **Structure de données**
- ✅ Mapping automatique entre votre table Supabase et la structure interne de l'app
- ✅ Support des colonnes : `id`, `mot_sango`, `traduction_fr`, `traduction_ru`, `categorie`

### 4. **Groupement par catégorie**
- ✅ Les mots sont automatiquement groupés par catégorie depuis Supabase
- ✅ Création dynamique des catégories basée sur vos données

## 🚀 Démarrage rapide

### 1. Vérifiez votre table Supabase

Assurez-vous que votre table `mots-sango` existe avec la structure suivante :

```sql
CREATE TABLE mots-sango (
  id INT8 PRIMARY KEY,
  mot_sango TEXT NOT NULL,
  traduction_fr TEXT NOT NULL,
  traduction_ru TEXT,
  categorie TEXT
);
```

### 2. Installez les dépendances

```bash
npm install
```

### 3. Lancez l'application en développement

```bash
npm run dev
```

L'application devrait :
- ✅ Afficher "Chargement des données..." pendant quelques secondes
- ✅ Récupérer les mots depuis Supabase
- ✅ Afficher les catégories et les mots

## 📊 Vérification de la connexion

### Dans le navigateur

1. Ouvrez la console du navigateur (F12)
2. Allez dans l'onglet "Network"
3. Cherchez les requêtes vers `supabase.co`
4. Vérifiez que le statut est 200 (succès)

### Exemple de réponse attendue

```json
[
  {
    "id": 585,
    "mot_sango": "Bara mo",
    "traduction_fr": "Bonjour",
    "traduction_ru": "Привет",
    "categorie": "Salutations et Politesse"
  }
]
```

## 🔧 Configuration avancée

### Modifier la fonction de récupération

Ouvrez `App.tsx` et trouvez la fonction `fetchWordsFromSupabase()` :

```typescript
async function fetchWordsFromSupabase(): Promise<Word[]> {
  // Votre code ici
}
```

Vous pouvez :
- Ajouter des filtres
- Modifier le tri
- Ajouter des colonnes supplémentaires

### Exemple : Récupérer uniquement une catégorie

```typescript
const response = await fetch(
  `${SUPABASE_URL}/rest/v1/mots-sango?categorie=eq.Salutations`,
  { ... }
);
```

## 🌐 Déploiement

### Build pour la production

```bash
npm run build
```

### Options de déploiement

#### 1. **Vercel** (Recommandé)
```bash
npm install -g vercel
vercel
```

#### 2. **Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### 3. **GitHub Pages**
```bash
npm run build
# Puis pushez le dossier `dist/` vers votre repo
```

## 🔐 Sécurité

### Variables d'environnement

**⚠️ IMPORTANT** : Ne commitez jamais votre `.env.local` !

1. Ajoutez `.env.local` à votre `.gitignore` ✅
2. Sur votre plateforme de déploiement, configurez les variables :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`

### Permissions Supabase

Assurez-vous que votre table `mots-sango` a les permissions correctes :

```sql
-- Permettre la lecture publique
ALTER TABLE mots-sango ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read"
  ON mots-sango
  FOR SELECT
  USING (true);
```

## 🐛 Dépannage

### Problème : "Could not find the table"

**Solution** : Vérifiez que :
- ✅ La table s'appelle bien `mots-sango` (avec tiret)
- ✅ Vous utilisez la clé publique (anon) de Supabase
- ✅ Les permissions RLS sont correctes

### Problème : Les données ne se chargent pas

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Cherchez les erreurs en rouge
3. Vérifiez que votre URL Supabase est correcte
4. Testez la connexion avec curl :

```bash
curl -H "apikey: YOUR_KEY" \
  "https://YOUR_PROJECT.supabase.co/rest/v1/mots-sango?select=*"
```

### Problème : CORS error

**Solution** : Supabase gère automatiquement CORS. Si vous avez toujours une erreur :
1. Vérifiez que vous utilisez HTTPS
2. Assurez-vous que votre domaine est autorisé dans Supabase

## 📈 Prochaines étapes

### 1. **Ajouter plus de mots**

```sql
INSERT INTO mots-sango (mot_sango, traduction_fr, traduction_ru, categorie) 
VALUES ('Nzoni', 'Bon', 'Хороший', 'Adjectifs');
```

### 2. **Ajouter l'authentification utilisateur**

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});
```

### 3. **Sauvegarder les progrès utilisateur**

```typescript
await supabase.from('user_progress').insert({
  user_id: userId,
  category_id: categoryId,
  score: score
});
```

### 4. **Ajouter la prononciation audio**

Stockez les URLs audio dans Supabase et utilisez l'élément `<audio>` pour les jouer.

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase REST API](https://supabase.com/docs/guides/api)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## 💡 Conseils

1. **Testez localement d'abord** : Utilisez `npm run dev`
2. **Utilisez les DevTools** : Inspectez les requêtes réseau
3. **Gardez les données à jour** : Mettez à jour régulièrement votre table Supabase
4. **Optimisez les performances** : Utilisez la pagination pour les grandes tables

## 🎉 Félicitations !

Votre application Mada-Sango est maintenant intégrée avec Supabase !

Vous pouvez maintenant :
- ✅ Ajouter des mots directement dans Supabase
- ✅ Modifier les traductions sans redéployer l'app
- ✅ Gérer les catégories dynamiquement
- ✅ Suivre les progrès des utilisateurs

Bon apprentissage du Sango ! 🎓
