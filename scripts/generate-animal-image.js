const fs = require('fs');
const path = require('path');

/**
 * Universeller Tier-Bild Generator mit korrigierten Prompts aus image-prompts.txt
 * Usage: node scripts/generate-animal-image.js "Hund" "friendly dog"
 */

// Kommandozeilen-Argumente
const tierName = process.argv[2]; // z.B. "Hund"
const englishName = process.argv[3]; // z.B. "friendly dog"

if (!tierName || !englishName) {
  console.log('❌ Usage: node scripts/generate-animal-image.js "TierName" "english name"');
  console.log('💡 Beispiel: node scripts/generate-animal-image.js "Hund" "friendly dog"');
  process.exit(1);
}

async function generateAnimalImage() {
  try {
    console.log(`🎨 Generiere Bild für ${tierName} mit korrigiertem EINZELEINTRAG-PROMPT...`);
    
    // API Key aus api-key.txt laden
    const apiKeyFile = './api-key.txt';
    if (!fs.existsSync(apiKeyFile)) {
      console.error('❌ api-key.txt nicht gefunden!');
      console.log('💡 Bitte erstelle api-key.txt mit deinem OpenAI API Key');
      return;
    }
    
    const apiKey = fs.readFileSync(apiKeyFile, 'utf8').trim();
    console.log('✅ API Key aus api-key.txt geladen');
    
    // KORRIGIERTER EINZELEINTRAG-PROMPT (ohne die Kategorie-Teile)
    const singleItemPrompt = `Hand-drawn children's book illustration of a ${englishName}. Watercolor and colored pencil technique with visible brush strokes and paper texture. Gentle, friendly expression with soft organic lines. Simple background painted in loose watercolor washes. Warm natural colors, soft edges, no harsh lines. Style like classic children's picture books - Eric Carle, Beatrix Potter, or Maurice Sendak. No text, no words, no letters anywhere in the image. Square composition perfectly centered for 1024x1024 format. Charming imperfections, textured paper feel, cozy and inviting artwork. Perfect square tile design.`;
    
    console.log('📝 Verwende KORRIGIERTEN EINZELEINTRAG-PROMPT');
    console.log('📝 Tier:', tierName, '→', englishName);
    
    // OpenAI API Call
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: singleItemPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI API Fehler:', errorData);
      return;
    }
    
    const data = await response.json();
    const imageUrl = data.data[0].url;
    
    console.log('🌐 Bild-URL erhalten, lade herunter...');
    
    // Bild herunterladen
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Verzeichnis erstellen falls nicht vorhanden
    const imagesDir = './public/images';
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('📁 public/images Verzeichnis erstellt');
    }
    
    // Slug für Dateinamen erstellen
    const slug = tierName.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-');
    
    // Bild speichern
    const imagePath = path.join(imagesDir, `tier-${slug}.png`);
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    
    console.log('✅ Tier-Bild erfolgreich erstellt!');
    console.log('📁 Gespeichert als:', `public/images/tier-${slug}.png`);
    console.log('🎨 Verwendet: KORRIGIERTER EINZELEINTRAG-PROMPT');
    console.log('📐 Format: 1024x1024 Tile, Kinderbuch-Stil (Eric Carle/Beatrix Potter)');
    
    return `tier-${slug}.png`;
    
  } catch (error) {
    console.error('❌ Fehler bei Bild-Generierung:', error.message);
  }
}

generateAnimalImage(); 