# Manda Sango

Une application web trilingue pour l'apprentissage du Sango.
Elle permet de réviser le vocabulaire depuis le Français, le Russe et l'Anglais de manière interactive avec des flashcards et quizz.

## Stack technique

- Vite 6 + React 19
- TypeScript
- Tailwind CSS
- Supabase

## Lancer le projet en local

1. Installer les dépendances :
   ```bash
   npm install
   ```

2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Documentation

Consultez le dossier \`docs/\` pour plus d'informations :
- [Supabase Configuration](docs/README-SUPABASE.md)
- [Installation détaillée](docs/INSTALLATION.md)
- [Modifications apportées](docs/MODIFICATIONS.md)

## Langues supportées

- Sango ↔ Français
- Sango ↔ Russe
- Sango ↔ Anglais

## Audio

L'application inclut le support audio :
- Voix humaine pour le Sango (enregistrée par un locuteur natif, Starking).
- Voix robot (TTS) pour le Français (FR) et l'Anglais (EN).
- Pas d'audio pour le Russe pour l'instant.

Les fichiers MP3 seront stockés dans \`public/audio/\` et leurs URLs lues depuis les colonnes \`audio_sango\`, \`audio_fr\` et \`audio_en\` de la table \`mots-sango\` (Supabase).
