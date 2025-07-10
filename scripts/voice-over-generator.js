const fs = require('fs');
const path = require('path');

/**
 * Voice-Over Generator Script
 * Calls webhook to generate MP3 files from text using TTS
 */

const WEBHOOK_URL = 'http://localhost:5678/webhook/CreateVoiceOverLexicon';
const OUTPUT_DIR = './public/audio';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate voice-over MP3 file
 * @param {string} text - Text to convert to speech
 * @param {string} fileName - Name for the output MP3 file (without extension)
 * @returns {Promise<boolean>} - Success status
 */
async function generateVoiceOver(text, fileName) {
  try {
    console.log(`🎤 Generiere Voice-Over für: ${fileName}`);
    
    // Create absolute file path for the webhook
    const absolutePath = path.resolve(OUTPUT_DIR, `${fileName}.mp3`);
    console.log(`📁 Absoluter Pfad: ${absolutePath}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        fileName: absolutePath
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Voice-Over erfolgreich generiert: ${fileName}.mp3`);
    console.log(`📁 Gespeichert in: ${result.filePath || OUTPUT_DIR}`);
    return true;

  } catch (error) {
    console.error(`❌ Fehler beim Generieren von ${fileName}:`, error.message);
    return false;
  }
}

/**
 * Generate voice-overs for all main categories
 */
async function generateCategoryVoiceOvers() {
  const categories = [
    {
      id: 'tiere',
      text: 'Willkommen in der Tierwelt! Hier findest du viele verschiedene Arten von Tieren. Von kleinen Insekten bis zu großen Säugetieren - entdecke die faszinierende Welt der Tiere!',
      fileName: 'category-tiere'
    },
    {
      id: 'fahrzeuge',
      text: 'Hier findest du alle Arten von Fahrzeugen! Autos, Flugzeuge, Schiffe und viele mehr. Entdecke wie Menschen sich fortbewegen!',
      fileName: 'category-fahrzeuge'
    },
    {
      id: 'essen',
      text: 'Lecker! Hier gibt es alles über Essen und Trinken. Von Obst und Gemüse bis zu leckerem Gebäck - lerne die Welt der Nahrung kennen!',
      fileName: 'category-essen'
    },
    {
      id: 'koerper',
      text: 'Lerne deinen Körper kennen! Hier erfährst du alles über die verschiedenen Körperteile und wie sie funktionieren.',
      fileName: 'category-koerper'
    },
    {
      id: 'natur',
      text: 'Die wunderbare Natur! Entdecke Pflanzen, Blumen, Bäume und alles was in der Natur wächst und lebt.',
      fileName: 'category-natur'
    },
    {
      id: 'gegenstände',
      text: 'Alltägliche Gegenstände die du kennst! Von Spielzeug bis zu Haushaltsgegenständen - erkunde die Dinge um dich herum.',
      fileName: 'category-gegenstaende'
    }
  ];

  console.log(`🎯 Starte Voice-Over Generation für ${categories.length} Kategorien...\n`);

  let successCount = 0;
  for (const category of categories) {
    const success = await generateVoiceOver(category.text, category.fileName);
    if (success) successCount++;
    
    // Kurze Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Voice-Over Generation abgeschlossen!`);
  console.log(`✅ Erfolgreich: ${successCount}/${categories.length}`);
  console.log(`❌ Fehlgeschlagen: ${categories.length - successCount}/${categories.length}`);
}

/**
 * Generate voice-over for specific animal subcategories
 */
async function generateAnimalSubcategoryVoiceOvers() {
  const animalSubcategories = [
    {
      id: 'haustiere',
      text: 'Hier sind deine liebsten Haustiere! Hunde, Katzen, Hamster und viele mehr. Diese Tiere leben mit uns Menschen zusammen.',
      fileName: 'subcategory-haustiere'
    },
    {
      id: 'bauernhoftiere',
      text: 'Willkommen auf dem Bauernhof! Hier leben Kühe, Schweine, Hühner und andere Tiere die uns Milch, Eier und andere Lebensmittel geben.',
      fileName: 'subcategory-bauernhoftiere'
    },
    {
      id: 'waldtiere',
      text: 'Im Wald leben viele spannende Tiere! Rehe, Füchse, Bären und Eichhörnchen haben hier ihr Zuhause.',
      fileName: 'subcategory-waldtiere'
    },
    {
      id: 'meerestiere',
      text: 'Tauche ab in die Unterwasserwelt! Fische, Wale, Delfine und viele andere Meerestiere leben im Ozean.',
      fileName: 'subcategory-meerestiere'
    },
    {
      id: 'dschungeltiere',
      text: 'Im tropischen Dschungel ist viel los! Affen, Papageien, Schlangen und viele bunte Tiere leben hier.',
      fileName: 'subcategory-dschungeltiere'
    }
  ];

  console.log(`🐾 Starte Voice-Over Generation für ${animalSubcategories.length} Tier-Unterkategorien...\n`);

  let successCount = 0;
  for (const subcategory of animalSubcategories) {
    const success = await generateVoiceOver(subcategory.text, subcategory.fileName);
    if (success) successCount++;
    
    // Kurze Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 Tier-Unterkategorien Voice-Over Generation abgeschlossen!`);
  console.log(`✅ Erfolgreich: ${successCount}/${animalSubcategories.length}`);
  console.log(`❌ Fehlgeschlagen: ${animalSubcategories.length - successCount}/${animalSubcategories.length}`);
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch(command) {
    case 'categories':
      await generateCategoryVoiceOvers();
      break;
    case 'animals':
      await generateAnimalSubcategoryVoiceOvers();
      break;
    case 'test':
      console.log('🧪 Teste Voice-Over mit Tiere-Kategorie...');
      await generateVoiceOver(
        'Willkommen in der Tierwelt! Hier findest du viele verschiedene Arten von Tieren. Von kleinen Insekten bis zu großen Säugetieren - entdecke die faszinierende Welt der Tiere!',
        'test-tiere-kategorie'
      );
      break;
    default:
      console.log(`
🎤 Voice-Over Generator für Kinderlexikon

Verwendung:
  node scripts/voice-over-generator.js <command>

Kommandos:
  test        - Teste Voice-Over mit Tiere-Kategorie
  categories  - Generiere Voice-Overs für alle Hauptkategorien
  animals     - Generiere Voice-Overs für Tier-Unterkategorien

Beispiele:
  node scripts/voice-over-generator.js test
  node scripts/voice-over-generator.js categories
  node scripts/voice-over-generator.js animals
      `);
  }
}

// Export für andere Module
module.exports = {
  generateVoiceOver,
  generateCategoryVoiceOvers,
  generateAnimalSubcategoryVoiceOvers
};

// CLI Ausführung
if (require.main === module) {
  main().catch(console.error);
} 