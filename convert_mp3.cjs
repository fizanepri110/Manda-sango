const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// On configure fluent-ffmpeg pour utiliser le binaire téléchargé via npm
ffmpeg.setFfmpegPath(ffmpegStatic);

const AUDIO_DIR = path.join(__dirname, 'public', 'audio');

function convertFiles() {
    const files = fs.readdirSync(AUDIO_DIR).filter(f => f.toLowerCase().endsWith('.wav') && f.startsWith('SAG-'));
    
    console.log(`🎵 Démarrage de la conversion de ${files.length} fichiers WAV vers MP3...`);
    console.log("⏳ Compression en cours pour optimiser le stockage Supabase (128kbps)...");
    
    let processed = 0;
    let errors = 0;
    
    const convertOne = (index) => {
        if (index >= files.length) {
            console.log(`\n✅ Opération terminée !`);
            console.log(`   - Convertis avec succès: ${processed}`);
            console.log(`   - Erreurs: ${errors}`);
            console.log("💡 Tu pourras ensuite supprimer les fichiers .wav originaux si tu le souhaites.");
            return;
        }
        
        const file = files[index];
        const wavPath = path.join(AUDIO_DIR, file);
        const mp3Path = path.join(AUDIO_DIR, file.replace(/\.wav$/i, '.mp3'));
        
        // Si le MP3 existe déjà, on l'ignore
        if (fs.existsSync(mp3Path)) {
            processed++;
            convertOne(index + 1);
            return;
        }
        
        ffmpeg(wavPath)
            .toFormat('mp3')
            .audioBitrate('128k') // Assez léger mais suffisant pour la voix
            .on('end', () => {
                processed++;
                if (processed % 50 === 0) console.log(`... ${processed}/${files.length} fichiers MP3 générés`);
                convertOne(index + 1);
            })
            .on('error', (err) => {
                console.error(`❌ Erreur sur ${file}: ${err.message}`);
                errors++;
                convertOne(index + 1);
            })
            .save(mp3Path);
    };
    
    convertOne(0);
}

convertFiles();
