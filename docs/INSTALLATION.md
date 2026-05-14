# Installation et Démarrage Rapide

## 1. Prérequis

- Node.js 16+ (téléchargez depuis https://nodejs.org)
- npm ou pnpm

## 2. Installation

```bash
# Allez dans le dossier du projet
cd mada-sango

# Installez les dépendances
npm install
```

## 3. Configuration

Le fichier `.env.local` est déjà configuré avec vos identifiants Supabase.

Si vous devez le modifier, ouvrez `.env.local` et mettez à jour :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_KEY=votre_clé_publique
```

## 4. Lancer l'application

```bash
npm run dev
```

L'application s'ouvrira à `http://localhost:5173`

## 5. Utiliser l'application

1. Sélectionnez une catégorie
2. Choisissez entre **Flashcards** ou **Quiz**
3. Apprenez les mots du Sango !

## Déploiement

### Vercel (Recommandé)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Besoin d'aide ?

Consultez `README-SUPABASE.md` pour plus de détails sur l'intégration Supabase.
