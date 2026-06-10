const fs = require('fs');

const OUT_FILE = 'db_translated.json';

async function run() {
    console.log("🚀 Lancement de la traduction via l'API de secours (MyMemory)...");
    let dbData = JSON.parse(fs.readFileSync(OUT_FILE, 'utf-8'));
    const delay = ms => new Promise(res => setTimeout(res, ms));
    let success = 0;

    for (let i = 0; i < dbData.length; i++) {
        const row = dbData[i];
        
        // On traduit si le champ Russe est vide ou en erreur
        if (row['Français'] && (!row['Russe'] || row['Russe'] === '[ERREUR TRADUCTION]')) {
            try {
                // MyMemory est une API gratuite et robuste pour les petits volumes
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(row['Français'])}&langpair=fr|ru`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.responseData && data.responseData.translatedText) {
                    row['Russe'] = data.responseData.translatedText;
                    success++;
                    if (success % 10 === 0) {
                        console.log(`... ${success} mots traduits via MyMemory`);
                        fs.writeFileSync(OUT_FILE, JSON.stringify(dbData, null, 2));
                    }
                }
                
                await delay(1000); // 1 requête par seconde
            } catch(e) {
                console.error(`Erreur sur ${row['Français']}: ${e.message}`);
            }
        }
    }
    
    fs.writeFileSync(OUT_FILE, JSON.stringify(dbData, null, 2));
    console.log(`\n✅ Traduction de secours terminée ! ${success} nouveaux mots traduits.`);
}

run();
