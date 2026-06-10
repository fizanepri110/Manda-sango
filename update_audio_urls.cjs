require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Nettoyage des credentials de .env.local
const rawUrl = process.env.VITE_SUPABASE_URL || '';
const rawKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const SUPABASE_URL = rawUrl.trim().replace(/[\u00a0\s]+$/g, '');
let SUPABASE_KEY = rawKey.trim().replace(/[\u00a0\s]+$/g, '');

if (SUPABASE_KEY.endsWith('.')) {
    SUPABASE_KEY = SUPABASE_KEY.slice(0, -1);
}

console.log("🔌 Initialisation de la connexion Supabase...");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AUDIO_DIR = path.join(__dirname, 'public', 'audio');
const BUCKET_NAME = 'manda-sango-audio';

// URL de base construite dynamiquement à partir de votre projet actif dans .env.local
// Cela garantit que les fichiers pointent vers la bonne instance Supabase (bwfylxpifxxvnmmcwegy)
const BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;

async function run() {
    try {
        console.log(`📂 Lecture du dossier audio : ${AUDIO_DIR}`);
        if (!fs.existsSync(AUDIO_DIR)) {
            console.error("❌ Dossier audio introuvable.");
            return;
        }

        // 1. Lister et filtrer tous les fichiers MP3 conformes (SAG-XXXX...)
        const files = fs.readdirSync(AUDIO_DIR).filter(file => {
            return file.toLowerCase().endsWith('.mp3') && /^sag-\d{4}/i.test(file);
        });

        console.log(`🎵 Trouvé ${files.length} fichiers MP3 conformes.`);
        if (files.length === 0) {
            console.warn("⚠️ Aucun fichier MP3 commençant par SAG- trouvé.");
            return;
        }

        // Préparer les données de mise à jour
        const updates = files.map(file => {
            // Extraire l'ID (ex: SAG-0001) du nom de fichier (ex: SAG-0001_Bara_mo.mp3)
            const match = file.match(/^(sag-\d{4})/i);
            const id = match ? match[1].toUpperCase() : null;
            const publicUrl = `${BASE_URL}${file}`;
            return { id, file, publicUrl };
        }).filter(item => item.id !== null);

        // 2. TEST : Mise à jour des 3 premiers fichiers
        console.log("\n🧪 ÉTAPE 1 : Test de mise à jour avec 3 fichiers...");
        const testItems = updates.slice(0, 3);
        
        console.log("Mise à jour des tests :");
        testItems.forEach(item => console.log(`   - ID: ${item.id} ➡️ URL: ${item.publicUrl}`));

        let testSuccessCount = 0;
        for (const item of testItems) {
            const { data, error } = await supabase
                .from('mots-sango')
                .update({ audio_sango: item.publicUrl })
                .eq('id', item.id)
                .select();

            if (error) {
                console.error(`❌ Échec de la mise à jour pour le test ${item.id}:`, error.message || error);
            } else if (data && data.length > 0) {
                console.log(`✅ Mis à jour dans la table : ${item.id}`);
                testSuccessCount++;
            } else {
                console.warn(`⚠️ Avertissement : L'ID ${item.id} n'a pas été trouvé dans la table mots-sango.`);
            }
        }

        if (testSuccessCount === 0) {
            console.error("❌ Échec du test. Aucune ligne n'a pu être mise à jour.");
            return;
        }

        console.log(`\n✅ Test d'étape réussi ! ${testSuccessCount} lignes de test mises à jour avec succès.`);

        // 3. RUN : Mise à jour complète de tous les fichiers
        console.log(`\n🚀 ÉTAPE 2 : Lancement de la mise à jour complète pour les ${updates.length} fichiers...`);
        let successCount = 0;
        let notFoundCount = 0;
        let errorCount = 0;

        // Mise à jour séquentielle (ou par petits groupes) pour assurer un parfait contrôle des erreurs
        for (const item of updates) {
            const { data, error } = await supabase
                .from('mots-sango')
                .update({ audio_sango: item.publicUrl })
                .eq('id', item.id)
                .select();

            if (error) {
                console.error(`❌ Erreur sur ${item.id} :`, error.message || error);
                errorCount++;
            } else if (data && data.length > 0) {
                successCount++;
                if (successCount % 50 === 0) {
                    console.log(`... ${successCount}/${updates.length} URLs de fichiers mises à jour.`);
                }
            } else {
                notFoundCount++;
            }
        }

        // 4. Bilan Final
        console.log("\n=============================================");
        console.log("🎉 PROCESSUS TERMINE AVEC SUCCES !");
        console.log(`📊 Bilan final des mises à jour :`);
        console.log(`   - Succès : ${successCount}`);
        console.log(`   - Non trouvés en DB (IDs absents) : ${notFoundCount}`);
        console.log(`   - Erreurs de requêtes : ${errorCount}`);
        console.log(`   - Fichiers scannés au total : ${updates.length}`);
        console.log("=============================================");

    } catch (err) {
        console.error("❌ Une erreur critique est survenue :", err.message || err);
    }
}

run();
