const fs = require('fs');
const path = require('path');

/**
 * Universeller Eintrag-Bild Generator für Kinderlexikon
 * Usage: node scripts/generate-entry-image.js "Hund" "friendly dog"
 */

// Kommandozeilen-Argumente
const entryName = process.argv[2]; // z.B. "Hund"
const englishName = process.argv[3]; // z.B. "friendly dog"

if (!entryName || !englishName) {
  console.log('❌ Usage: node scripts/generate-entry-image.js "EntryName" "english name"');
  console.log('💡 Beispiel: node scripts/generate-entry-image.js "Hund" "friendly dog"');
  console.log('💡 Beispiel: node scripts/generate-entry-image.js "Katze" "cute cat"');
  console.log('💡 Beispiel: node scripts/generate-entry-image.js "Elefant" "baby elephant"');
  process.exit(1);
}

async function generateEntryImage() {
  try {
    console.log(`🎨 Generiere Bild für Eintrag: ${entryName}...`);
    
    // API Key aus api-key.txt laden
    const apiKeyFile = './api-key.txt';
    if (!fs.existsSync(apiKeyFile)) {
      console.error('❌ api-key.txt nicht gefunden!');
      console.log('💡 Bitte erstelle api-key.txt mit deinem OpenAI API Key');
      return;
    }
    
    const apiKey = fs.readFileSync(apiKeyFile, 'utf8').trim();
    console.log('✅ API Key aus api-key.txt geladen');
    
    // EXAKTER PROMPT aus image-prompts.txt
    const entryPrompt = `Hand-drawn children's book illustration showing an ${englishName}. Watercolor and colored pencil style with visible brush strokes and paper texture. Soft organic lines, warm natural colors, gentle watercolor washes. Style reminiscent of classic children's picture books like Eric Carle or Beatrix Potter. No text, no words, no letters anywhere in the image. Square composition perfectly centered for 1024x1024 format. No digital perfection, charming hand-drawn imperfections. Textured paper background, artistic and cozy feeling. Perfect square tile design.`;
    
    console.log('📝 Verwende EXAKTEN EINZELEINTRAG-PROMPT');
    console.log('📝 Eintrag:', entryName, '→', englishName);
    
    // OpenAI API Call
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: entryPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'high'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API Fehler:', errorData);
      return;
    }
    
    const data = await response.json();
    const imageBase64 = data.data[0].b64_json;
    
    console.log('📊 Base64-Bild erhalten, verarbeite...');
    
    // Base64 zu Buffer konvertieren
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    
    // Verzeichnis erstellen falls nicht vorhanden
    const imagesDir = './public/images';
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('📁 public/images Verzeichnis erstellt');
    }
    
    // Slug für Dateinamen erstellen
    const slug = entryName.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-');
    
    // Bild speichern
    const imagePath = path.join(imagesDir, `tier-${slug}.png`);
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    
    console.log('✅ Eintrag-Bild erfolgreich erstellt!');
    console.log('📁 Gespeichert als:', `public/images/tier-${slug}.png`);
    console.log('🎨 Verwendet: EXAKTER EINZELEINTRAG-PROMPT');
    console.log('📐 Format: 1024x1024 Tile, Kinderbuch-Stil (Eric Carle/Beatrix Potter)');
    console.log('🖼️ Stil: Aquarell + Buntstift, handgezeichnete Unperfektion');
    
    return `tier-${slug}.png`;
    
  } catch (error) {
    console.error('❌ Fehler bei Eintrag-Bild-Generierung:', error.message);
  }
}

generateEntryImage(); 