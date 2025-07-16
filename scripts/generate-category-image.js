const fs = require('fs');
const path = require('path');

/**
 * Universeller Kategorie-Bild Generator für Kinderlexikon
 * Usage: node scripts/generate-category-image.js "haustiere-nutztiere"
 * Die Prompts stehen in prompts/category-prompts.json
 */

const categoryKey = process.argv[2]; // z.B. "haustiere-nutztiere"
if (!categoryKey) {
  console.log('❌ Usage: node scripts/generate-category-image.js "category-key"');
  process.exit(1);
}

// Stil-Block für alle Kategorie-Bilder
const styleBlock = "Hand-drawn children's book illustration. Watercolor and colored pencil style with visible brush strokes and paper texture. Content extends to all edges of the square. Soft organic lines, warm natural colors, gentle watercolor washes. Style reminiscent of classic children's picture books like Eric Carle or Beatrix Potter. No text, no words, no letters anywhere in the image. Perfect 1024x1024 square composition with subjects distributed across the entire frame. No digital perfection, charming hand-drawn imperfections. Soft, blended background that flows naturally with the subjects. Content should touch or nearly touch all four edges of the square for optimal tile appearance.";

// Prompts aus JSON laden
const promptsFile = path.join(__dirname, '../prompts/category-prompts.json');
if (!fs.existsSync(promptsFile)) {
  console.error('❌ prompts/category-prompts.json nicht gefunden!');
  process.exit(1);
}
const prompts = JSON.parse(fs.readFileSync(promptsFile, 'utf8'));

if (!prompts[categoryKey]) {
  console.error(`❌ Kein Prompt für Kategorie "${categoryKey}" in category-prompts.json gefunden!`);
  process.exit(1);
}

const promptFragment = prompts[categoryKey];
const fullPrompt = `${promptFragment} ${styleBlock}`;

async function generateCategoryImage() {
  try {
    // API Key aus api-key.txt laden
    const apiKeyFile = './api-key.txt';
    if (!fs.existsSync(apiKeyFile)) {
      console.error('❌ api-key.txt nicht gefunden!');
      return;
    }
    const apiKey = fs.readFileSync(apiKeyFile, 'utf8').trim();
    console.log('✅ API Key geladen');

    // OpenAI API Call
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: fullPrompt,
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
    const b64 = data.data[0].b64_json;
    if (!b64) {
      console.error('❌ Keine Bilddaten (b64_json) von OpenAI erhalten!');
      return;
    }

    // Bild aus Base64 speichern
    const imageBuffer = Buffer.from(b64, 'base64');

    // Verzeichnis erstellen falls nicht vorhanden
    const imagesDir = './public/kategorien/images';
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('📁 public/kategorien/images Verzeichnis erstellt');
    }

    // Slug für Dateinamen
    const slug = categoryKey.toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]/g, '-');

    // Bild speichern
    const imagePath = path.join(imagesDir, `category-${slug}.png`);
    fs.writeFileSync(imagePath, imageBuffer);

    console.log('✅ Kategorie-Bild erfolgreich erstellt!');
    console.log('📁 Gespeichert als:', imagePath);
    console.log('🎨 Prompt:', fullPrompt);
    return `category-${slug}.png`;
  } catch (error) {
    console.error('❌ Fehler bei Bild-Generierung:', error.message);
  }
}

generateCategoryImage(); 