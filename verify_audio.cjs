const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
// Modifie ces chemins selon l'arborescence de ton projet
const AUDIO_DIR = path.join(__dirname, 'public', 'audio'); // Le dossier contenant tes fichiers .wav
const DB_FILE = path.join(__dirname, 'db_reference.json'); // La liste de référence exportée

// ------------------------------------------------------------------
// Le script s'attend à ce que db_reference.json contienne
// un simple tableau avec les noms de fichiers attendus. Exemple :
// [
//   "SAG-0001_Bara_mo.wav",
//   "SAG-0002_Bonjour.wav"
// ]
// ------------------------------------------------------------------

function verifyAudioAssets() {
    console.log("🔍 Démarrage de la vérification des assets audio...\n");

    // 0. Vérification de l'existence des chemins
    if (!fs.existsSync(AUDIO_DIR)) {
        console.error(`❌ Erreur: Le dossier audio est introuvable (${AUDIO_DIR})`);
        console.log("👉 Astuce: Modifie la constante AUDIO_DIR dans verify_audio.js si ton dossier est ailleurs.");
        return;
    }
    
    if (!fs.existsSync(DB_FILE)) {
        console.error(`❌ Erreur: Le fichier de référence DB est introuvable (${DB_FILE})`);
        console.log("👉 Astuce: Exporte ta liste excel en JSON et place-la à la racine sous le nom db_reference.json.");
        return;
    }

    // 1. Charger la liste de référence depuis le JSON
    let expectedFiles = [];
    try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        expectedFiles = JSON.parse(fileContent);
        if (!Array.isArray(expectedFiles)) {
             throw new Error("Le format JSON doit être un tableau (Array)");
        }
    } catch (e) {
        console.error("❌ Erreur lors de la lecture du fichier JSON de référence :", e.message);
        return;
    }

    // On crée un dictionnaire (Map) avec les noms en minuscules pour la comparaison insensible à la casse.
    const expectedFilesMap = new Map();
    expectedFiles.forEach(fileName => {
        let cleanName = fileName.trim();
        if (!cleanName.toLowerCase().endsWith('.wav')) {
            cleanName += '.wav';
        }
        expectedFilesMap.set(cleanName.toLowerCase(), cleanName);
    });

    // 2. Charger les fichiers audios locaux
    let localFiles = [];
    try {
        localFiles = fs.readdirSync(AUDIO_DIR).filter(file => file.toLowerCase().endsWith('.wav'));
    } catch (e) {
        console.error("❌ Erreur lors de la lecture du dossier audio :", e.message);
        return;
    }

    // Variables pour le rapport
    const missingFiles = [];
    const orphanFiles = [];
    let validCount = 0;

    // Pour une vérification rapide, on garde les noms locaux en minuscules
    const localFilesLower = new Set();
    
    // 3. Trouver les fichiers orphelins (et compter ceux qui sont valides)
    localFiles.forEach(file => {
        const fileLower = file.toLowerCase();
        localFilesLower.add(fileLower);

        if (expectedFilesMap.has(fileLower)) {
            validCount++;
        } else {
            orphanFiles.push(file);
        }
    });

    // 4. Trouver les fichiers manquants (dans la DB, mais pas dans le dossier)
    expectedFilesMap.forEach((originalName, nameLower) => {
        if (!localFilesLower.has(nameLower)) {
            missingFiles.push(originalName);
        }
    });

    // 5. Afficher le rapport de façon claire
    console.log("================ RAPPORT DE VÉRIFICATION ================\n");
    
    if (missingFiles.length > 0) {
        console.log(`🔴 Fichiers manquants (${missingFiles.length}) :`);
        console.log("   (Présents dans la DB mais introuvables dans le dossier local)");
        missingFiles.forEach(f => console.log(`   - ${f}`));
    } else {
        console.log("🔴 Fichiers manquants : 0");
    }
    console.log();

    if (orphanFiles.length > 0) {
        console.log(`🟡 Fichiers orphelins ou mal orthographiés (${orphanFiles.length}) :`);
        console.log("   (Présents dans le dossier local mais absents de la DB)");
        orphanFiles.forEach(f => console.log(`   - ${f}`));
    } else {
        console.log("🟡 Fichiers orphelins : 0");
    }
    console.log();

    console.log(`🟢 Fichiers parfaitement validés : ${validCount} / ${expectedFilesMap.size}`);
    
    if (validCount === expectedFilesMap.size && missingFiles.length === 0 && orphanFiles.length === 0) {
        console.log("\n✨ Magnifique ! Tous tes fichiers audios sont parfaitement synchronisés avec ta base. ✨");
    }
    
    console.log("\n=========================================================");
}

verifyAudioAssets();
