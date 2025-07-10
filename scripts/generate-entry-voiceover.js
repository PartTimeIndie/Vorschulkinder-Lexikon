const fs = require('fs');
const path = require('path');

/**
 * Universeller Eintrag-Voice-Over Generator für Kinderlexikon
 * Usage: node scripts/generate-entry-voiceover.js "tier_001"
 */

const WEBHOOK_URL = 'http://localhost:5678/webhook/CreateVoiceOverLexicon';
const WORKSPACE_PATH = 'D:\\gitrepros\\Vorschulkinder Lexikon';

// Kommandozeilen-Argument
const entryId = process.argv[2]; // z.B. "tier_001"

if (!entryId) {
  console.log('❌ Usage: node scripts/generate-entry-voiceover.js "entry_id"');
  console.log('💡 Beispiel: node scripts/generate-entry-voiceover.js "tier_001"');
  console.log('💡 Beispiel: node scripts/generate-entry-voiceover.js "tier_002"');
  process.exit(1);
}

async function generateEntryVoiceOver() {
  try {
    console.log(`🎤 Generiere Voice-Over für Eintrag: ${entryId}...`);
    
    // Lade Eintrag-Daten
    const tierEintraegeFile = './eintraege/tierEintraege.json';
    if (!fs.existsSync(tierEintraegeFile)) {
      console.error('❌ tierEintraege.json nicht gefunden!');
      return;
    }
    
    const tierData = JSON.parse(fs.readFileSync(tierEintraegeFile, 'utf8'));
    const entry = tierData.tiere.find(tier => tier.id === entryId);
    
    if (!entry) {
      console.error(`❌ Eintrag mit ID "${entryId}" nicht gefunden!`);
      console.log('💡 Verfügbare Einträge:');
      tierData.tiere.slice(0, 5).forEach(tier => {
        console.log(`   - ${tier.id}: ${tier.name}`);
      });
      return;
    }
    
    if (!entry.description || entry.description.trim() === '') {
      console.error(`❌ Eintrag "${entry.name}" hat keine Beschreibung für Voice-Over!`);
      return;
    }
    
    const text = entry.description;
    const fileName = entry.audio.filename.replace('.mp3', ''); // z.B. "tier-hund"
    const fullPath = path.join(WORKSPACE_PATH, 'public', 'audio', fileName + '.mp3');
    
    console.log('📝 Eintrag:', entry.name);
    console.log('📝 Text-Länge:', text.length, 'Zeichen');
    console.log('📁 Ausgabe-Pfad:', fullPath);
    console.log('📝 Text (Vorschau):', text.substring(0, 150) + '...');
    
    // Voice-Over erstellen
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        fileName: fullPath
      })
    });
    
    if (response.ok) {
      console.log('✅ Voice-Over für Eintrag erfolgreich erstellt!');
      console.log('📁 Datei gespeichert als:', fileName + '.mp3');
      console.log('🎙️ Eintrag-Voice-Over bereit für die App!');
    } else {
      const errorText = await response.text();
      console.error('❌ Fehler bei Voice-Over Generation:', response.status, response.statusText);
      console.error('❌ Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Voice-Over Fehler:', error.message);
  }
}

generateEntryVoiceOver(); 