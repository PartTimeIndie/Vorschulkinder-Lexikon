const fs = require('fs');
const path = require('path');

const WEBHOOK_URL = 'http://localhost:5678/webhook/CreateVoiceOverLexicon';
const WORKSPACE_PATH = 'D:\\gitrepros\\Vorschulkinder Lexikon';

async function generateDogVoiceOver() {
  try {
    console.log('🎤 Generiere Voice-Over für Hund...');
    
    // Lade Tier-Daten
    const tierData = JSON.parse(fs.readFileSync('./eintraege/tierEintraege.json', 'utf8'));
    const hund = tierData.tiere[0]; // Erster Eintrag ist der Hund
    
    const text = hund.description;
    const fileName = 'tier-hund';
    const fullPath = path.join(WORKSPACE_PATH, 'public', 'audio', fileName + '.mp3');
    
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
      console.log('✅ Voice-Over für Hund erfolgreich erstellt!');
      console.log('📁 Datei gespeichert als: tier-hund.mp3');
    } else {
      const errorText = await response.text();
      console.error('❌ Fehler bei Voice-Over Generation:', response.status, response.statusText);
      console.error('❌ Response:', errorText);
    }
  } catch (error) {
    console.error('❌ Voice-Over Fehler:', error.message);
  }
}

generateDogVoiceOver(); 