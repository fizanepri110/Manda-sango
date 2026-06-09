const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

const OUT_FILE = 'db_translated.json';

async function run() {
    console.log("🔄 Reprise de la traduction en Russe (contournement de la limite de requêtes)...");
    
    // Lire le fichier déjà partiellement traduit
    let dbData = [];
    if (fs.existsSync(OUT_FILE)) {
        dbData = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
    } else {
        console.error("Fichier db_translated.json introuvable. On ne peut pas reprendre.");
        return;
    }

    const delay = ms => new Promise(res => setTimeout(res, ms));
    let successCount = 0;
    
    for (let i = 0; i < dbData.length; i++) {
        const row = dbData[i];
        
        // Si la traduction a planté ou est vide, on la refait
        if (row['Français'] && (!row['Russe'] || row['Russe'] === '[ERREUR TRADUCTION]')) {
            try {
                const res = await translate(row['Français'], { to: 'ru' });
                row['Russe'] = res.text;
                successCount++;
                
                // Un délai plus long (1.5s) pour éviter d'être bloqué par Google
                await delay(1500); 
                
                if (successCount % 10 === 0) {
                    console.log(`... ${successCount} nouveaux mots traduits`);
                    // Sauvegarde intermédiaire
                    fs.writeFileSync(OUT_FILE, JSON.stringify(dbData, null, 2));
                }
            } catch (e) {
                console.error(`⚠️ Bloqué par Google à nouveau sur "${row['Français']}". On met en pause 10 secondes...`);
                row['Russe'] = '[ERREUR TRADUCTION]'; // On le remet en erreur pour le prochain passage
                await delay(10000); // Pause punitive
            }
        }
    }

    // Sauvegarde finale
    fs.writeFileSync(OUT_FILE, JSON.stringify(dbData, null, 2));
    console.log(`\n✅ Traduction finale terminée ! Fichier mis à jour.`);
}

run();
