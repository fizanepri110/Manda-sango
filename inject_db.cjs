require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Nettoyage des credentials pour éliminer les espaces insécables et la ponctuation parasite du .env.local
const rawUrl = process.env.VITE_SUPABASE_URL || '';
const rawKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const SUPABASE_URL = rawUrl.trim().replace(/[\u00a0\s]+$/g, '');
let SUPABASE_KEY = rawKey.trim().replace(/[\u00a0\s]+$/g, '');

// Nettoyage spécifique du point final accidentel de la clé
if (SUPABASE_KEY.endsWith('.')) {
    SUPABASE_KEY = SUPABASE_KEY.slice(0, -1);
}

console.log("🔌 Initialisation de la connexion Supabase...");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JSON_FILE = path.join(__dirname, 'db_translated.json');

// Mappage entre les clés du JSON et les colonnes de la base de données
function mapRow(row) {
    return {
        id: row["ID"],
        sango: row["Sango"],
        français: row["Français"],
        anglais: row["Anglais"],
        russe: row["Russe"],
        categorie: row["Catégorie"],
        audio_sango: row["Fichier Audio"]
    };
}

async function run() {
    try {
        // 0. Vérifier l'existence du JSON
        if (!fs.existsSync(JSON_FILE)) {
            console.error(`❌ Fichier introuvable : ${JSON_FILE}`);
            return;
        }

        const rawData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
        console.log(`📖 Fichier db_translated.json lu avec succès (${rawData.length} entrées trouvées).`);

        // 1. TEST : Insertion des 3 premières entrées
        console.log("\n🧪 ÉTAPE 1 : Test d'injection avec les 3 premiers mots...");
        const testRows = rawData.slice(0, 3).map(mapRow);
        
        console.log("Mots de test :", testRows.map(r => `${r.id} (${r.sango})`).join(', '));

        const { data: testData, error: testError } = await supabase
            .from('mots-sango')
            .upsert(testRows, { onConflict: 'id' })
            .select();

        if (testError) {
            console.error("❌ Échec du test d'injection :");
            console.error("Détails :", testError.message || testError);
            return;
        }

        console.log(`✅ Test réussi ! ${testData.length} lignes injectées/mises à jour dans Supabase.`);

        // 2. RUN : Injection complète
        console.log("\n🚀 ÉTAPE 2 : Lancement de l'injection complète des 445 mots...");
        const allRows = rawData.map(mapRow);

        const { data: finalData, error: finalError } = await supabase
            .from('mots-sango')
            .upsert(allRows, { onConflict: 'id' })
            .select();

        if (finalError) {
            console.error("❌ Échec de l'injection complète :");
            console.error("Détails :", finalError.message || finalError);
            return;
        }

        // 3. Bilan Final
        console.log("\n=============================================");
        console.log("🎉 INJECTION TERMINEE AVEC SUCCES !");
        console.log(`📊 Bilan : ${finalData.length} mots sur ${rawData.length} synchronisés (upsert).`);
        console.log("=============================================");

    } catch (err) {
        console.error("❌ Une erreur inattendue est survenue :", err.message || err);
    }
}

run();