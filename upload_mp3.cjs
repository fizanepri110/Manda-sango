require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const rawUrl = process.env.VITE_SUPABASE_URL || '';
const rawKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const SUPABASE_URL = rawUrl.trim().replace(/[\u00a0\s]+$/g, '');
let SUPABASE_SERVICE_KEY = rawKey.trim().replace(/[\u00a0\s]+$/g, '');

if (SUPABASE_SERVICE_KEY.endsWith('.')) {
    SUPABASE_SERVICE_KEY = SUPABASE_SERVICE_KEY.slice(0, -1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const BUCKET_NAME = 'Manda-sango-audio';
const AUDIO_DIR = path.join(__dirname, 'public', 'audio');

// 🪄 Le super-pouvoir : fonction pour enlever les accents
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function uploadFiles() {
    console.log(`🚀 Reprise de l'upload vers Supabase (Bucket: ${BUCKET_NAME})`);
    
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.toLowerCase().endsWith('.mp3') && f.startsWith('SAG-'));
    
    console.log(`Trouvé ${files.length} fichiers MP3. Upload avec nettoyage des accents...`);
    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
        const filePath = path.join(AUDIO_DIR, file);
        const fileBuffer = fs.readFileSync(filePath);

        // On crée un nom de fichier "sûr" sans accents pour Supabase
        const safeFileName = removeAccents(file);

        try {
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(safeFileName, fileBuffer, {
                    contentType: 'audio/mpeg',
                    upsert: true // Cela écrasera les 196 anciens pour tout mettre au même format propre
                });

            if (error) {
                console.error(`❌ Erreur sur ${safeFileName}:`, error.message || error);
                errorCount++;
            } else {
                console.log(`✅ Uploadé: ${safeFileName}`);
                successCount++;
            }
        } catch (err) {
            console.error(`❌ Exception sur ${file}:`, err.message || err);
            errorCount++;
        }
    }

    console.log("\n================ BILAN UPLOAD ================");
    console.log(`Succès : ${successCount}`);
    console.log(`Erreurs : ${errorCount}`);
    if (errorCount === 0 && files.length > 0) {
        console.log("✨ MAGNIFIQUE ! Tous les fichiers sont en ligne sans exception !");
    }
}

uploadFiles();