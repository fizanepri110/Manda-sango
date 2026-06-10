const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Configuration
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const DB_FILE = path.join(__dirname, '..', 'Manda_Sango_STUDIO_CLEAN.xlsx');

// Fonction pour calculer la distance de Levenshtein (tolérance d'orthographe)
function getLevenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Fonction de normalisation pour la comparaison (minuscule, trim)
function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().trim().replace(/\.wav$|\.mp3$/i, '');
}

// Fonction pour capitaliser la première lettre d'un mot proprement
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function run() {
    console.log("🚀 Lancement du renommage intelligent...\n");

    // 1. Lire la base Excel
    const wb = xlsx.readFile(DB_FILE);
    const sheet = wb.Sheets['📚 Base Complète'];
    if (!sheet) {
        console.error("❌ Onglet '📚 Base Complète' introuvable dans le fichier Excel.");
        return;
    }
    const dbData = xlsx.utils.sheet_to_json(sheet);

    // Préparer les entrées DB
    const dbEntries = [];
    dbData.forEach(row => {
        const id = row['ID'];
        const sangoWord = row['Sango'];
        const expectedFile = row['Fichier Audio'];
        
        if (id && sangoWord) {
            dbEntries.push({
                id: id,
                originalWord: sangoWord,
                normalizedWord: normalizeString(sangoWord),
                expectedFile: expectedFile ? expectedFile.replace(/\.mp3$/i, '.wav') : `${id}_${sangoWord.replace(/\s+/g, '_')}.wav`
            });
        }
    });

    // 2. Lire les fichiers audio locaux
    let localFiles = fs.readdirSync(AUDIO_DIR).filter(f => f.toLowerCase().endsWith('.wav'));
    
    let renamedCount = 0;
    const orphans = [];

    // 3. Traitement
    localFiles.forEach(file => {
        // Ignorer les fichiers déjà bien renommés (commençant par SAG-XXXX)
        if (/^SAG-\d{4}/i.test(file)) {
            // Déjà au bon format, on l'ignore pour ne pas le casser
            return;
        }

        const normalizedLocal = normalizeString(file);
        
        let bestMatch = null;
        let bestDistance = Infinity;
        let ambiguous = false;

        // Chercher le meilleur match dans la DB
        dbEntries.forEach(entry => {
            const distance = getLevenshteinDistance(normalizedLocal, entry.normalizedWord);
            
            if (distance < bestDistance) {
                bestDistance = distance;
                bestMatch = entry;
                ambiguous = false;
            } else if (distance === bestDistance && distance !== Infinity) {
                ambiguous = true; // Plusieurs mots à la même distance (doute !)
            }
        });

        // Tolérance : distance max de 2 lettres d'écart. 
        // Si mot très court (<= 3 lettres), on exige distance 0 ou 1.
        const maxAllowedDistance = normalizedLocal.length <= 3 ? 0 : (normalizedLocal.length <= 6 ? 1 : 2);

        if (bestMatch && !ambiguous && bestDistance <= maxAllowedDistance) {
            // --- C'EST UN MATCH SÉCURISÉ ---
            
            // Format Final Demandé : SAG-XXXX_NomDuMot.wav (Majuscule au début)
            // On s'assure d'utiliser l'orthographe Sango du fichier local (pour respecter le travail de l'expert)
            // tout en appliquant la majuscule au début.
            const localWordOnly = file.replace(/\.wav$/i, '').trim();
            const cleanExpertWord = capitalizeFirstLetter(localWordOnly).replace(/\s+/g, '_');
            
            const newName = `${bestMatch.id}_${cleanExpertWord}.wav`;
            
            const oldPath = path.join(AUDIO_DIR, file);
            const newPath = path.join(AUDIO_DIR, newName);
            
            // Renommer le fichier
            try {
                // Vérifier si le nouveau nom existe déjà pour éviter d'écraser
                if (fs.existsSync(newPath)) {
                    orphans.push(`${file} -> (Non renommé car ${newName} existe déjà)`);
                } else {
                    fs.renameSync(oldPath, newPath);
                    renamedCount++;
                }
            } catch (e) {
                orphans.push(`${file} -> Erreur technique lors du renommage`);
            }

        } else {
            // Aucun match fiable trouvé (ou plusieurs ambiguïtés)
            orphans.push(file);
        }
    });

    // 4. Rapport Final
    console.log("================ RAPPORT DE RENOMMAGE ================\n");
    console.log(`✅ Fichiers renommés avec succès : ${renamedCount}`);
    
    if (orphans.length > 0) {
        console.log(`\n⚠️ Fichiers orphelins (sans correspondance sûre) : ${orphans.length}`);
        console.log("   (À vérifier/renommer manuellement)");
        orphans.forEach(f => console.log(`   - ${f}`));
    } else {
         console.log(`\n⚠️ Fichiers orphelins : 0`);
    }
    console.log("\n======================================================");
}

run();
