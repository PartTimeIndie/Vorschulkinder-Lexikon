const fs = require('fs');
const path = require('path');

/**
 * Voice-Over Generator für alle Tier-Subkategorien
 */

const WEBHOOK_URL = 'http://localhost:5678/webhook/CreateVoiceOverLexicon';
const OUTPUT_DIR = './public/audio';
const WORKSPACE_PATH = 'D:\\gitrepros\\Vorschulkinder Lexikon';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Lade Tier-Kategorien
const tiereData = JSON.parse(fs.readFileSync('./kategorien/tiere.json', 'utf8'));

/**
 * Generate voice-over MP3 file
 * @param {string} text - Text to convert to speech
 * @param {string} fileName - Name for the output MP3 file (without extension)
 * @returns {Promise<boolean>} - Success status
 */
async function generateVoiceOver(text, fileName) {
  try {
    console.log(`🎤 Generiere Voice-Over für: ${fileName}`);
    
    const fullPath = path.join(WORKSPACE_PATH, 'public', 'audio', `${fileName}.mp3`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        fileName: fullPath // Absoluter Pfad für Webhook
      })
    });

    if (response.ok) {
      console.log(`✅ Voice-Over erstellt: ${fileName}.mp3`);
      return true;
    } else {
      console.error(`❌ Fehler bei ${fileName}:`, response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error(`❌ Voice-Over Fehler für ${fileName}:`, error.message);
    return false;
  }
}

// Hauptfunktion
async function main() {
  console.log('🎙️ Generiere Voice-Overs für alle Tier-Subkategorien...\n');
  
  const subcategories = tiereData.subcategories;
  console.log(`📋 Gefunden: ${subcategories.length} Subkategorien\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < subcategories.length; i++) {
    const subcat = subcategories[i];
    
    console.log(`\n[${i + 1}/${subcategories.length}] ${subcat.name}`);
    
    // Verwende die Beschreibung als Voice-Over Text
    const text = subcat.description;
    const fileName = `subcat-${subcat.slug}`;
    
    const success = await generateVoiceOver(text, fileName);
    
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Kurze Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🎉 Voice-Over Generation abgeschlossen!');
  console.log(`✅ Erfolgreich: ${successCount}`);
  console.log(`❌ Fehler: ${errorCount}`);
  console.log(`📁 Dateien gespeichert in: ${OUTPUT_DIR}`);
}

// Script ausführen
main().catch(console.error); 