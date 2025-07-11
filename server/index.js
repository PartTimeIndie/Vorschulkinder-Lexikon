const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Image Resizing Route für bessere Performance
app.get('/images/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { w, h, q } = req.query; // width, height, quality
    
    // Standard-Pfade für verschiedene Image-Ordner
    let imagePath;
    const kategorienPath = path.join(__dirname, '../kategorien/images', filename);
    const publicPath = path.join(__dirname, '../public/images', filename);
    const charactersPath = path.join(__dirname, '../public/Characters', filename); // <--- NEU
    
    // Prüfe welcher Pfad existiert
    try {
      await fs.access(kategorienPath);
      imagePath = kategorienPath;
    } catch {
      try {
        await fs.access(publicPath);
        imagePath = publicPath;
      } catch {
        try {
          await fs.access(charactersPath);
          imagePath = charactersPath;
        } catch {
          return res.status(404).json({ error: 'Image not found' });
        }
      }
    }
    
    // Wenn keine Resize-Parameter angegeben sind, sende Original
    if (!w && !h) {
      return res.sendFile(imagePath);
    }
    
    // Parse Dimensionen
    const width = w ? parseInt(w) : null;
    const height = h ? parseInt(h) : null;
    const quality = q ? parseInt(q) : 80;
    
    // Limitiere Dimensionen für Sicherheit
    const maxSize = 1024;
    const safeWidth = width && width <= maxSize ? width : null;
    const safeHeight = height && height <= maxSize ? height : null;
    
    // Erstelle resized Image mit Sharp
    let pipeline = sharp(imagePath);
    
    if (safeWidth || safeHeight) {
      pipeline = pipeline.resize(safeWidth, safeHeight, {
        fit: 'cover',
        position: 'center'
      });
    }
    
    // Output-Format basierend auf Extension
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality });
    } else if (ext === '.png') {
      pipeline = pipeline.png({ quality });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality });
    }
    
    // Cache-Headers für bessere Performance
    res.set({
      'Cache-Control': 'public, max-age=31536000', // 1 Jahr
      'Content-Type': `image/${ext.slice(1)}`
    });
    
    // Stream das resized Image
    pipeline.pipe(res);
    
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Statische Dateien für andere Assets
app.use('/character', express.static(path.join(__dirname, '../Characters')));
app.use('/audio', express.static(path.join(__dirname, '../public/audio')));

// API Routes

// Alle Hauptkategorien abrufen
app.get('/api/categories', async (req, res) => {
  try {
    const categoriesDir = path.join(__dirname, '../kategorien');
    const files = await fs.readdir(categoriesDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const categories = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(categoriesDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const category = JSON.parse(data);
      
      // Nur Hauptkategorie-Info, keine Subkategorien für Performance
      categories.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        audio: category.audio,
        character_emotions: category.character_emotions,
        safety_score: category.safety_score,
        subcategory_count: category.subcategories ? category.subcategories.length : 0
      });
    }
    
    res.json({ categories });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// Spezifische Kategorie mit Subkategorien abrufen
app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const filePath = path.join(__dirname, `../kategorien/${slug}.json`);
    
    const data = await fs.readFile(filePath, 'utf8');
    const category = JSON.parse(data);
    
    res.json({ category });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      console.error('Error loading category:', error);
      res.status(500).json({ error: 'Failed to load category' });
    }
  }
});

// Tier-Einträge nach Kategorie abrufen
app.get('/api/animals/category/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    
    // Lade Tier-Einträge
    const tierEintraegeFile = path.join(__dirname, '../eintraege/tierEintraege.json');
    const data = await fs.readFile(tierEintraegeFile, 'utf8');
    const tierData = JSON.parse(data);
    
    // Filtere Tiere nach Kategorie
    const animalsInCategory = tierData.tiere.filter(tier => 
      tier.categories.includes(categorySlug)
    );
    
    res.json({ 
      category: categorySlug,
      animals: animalsInCategory,
      count: animalsInCategory.length
    });
  } catch (error) {
    console.error('Error loading animals for category:', error);
    res.status(500).json({ error: 'Failed to load animals' });
  }
});

// Einzelnen Tier-Eintrag abrufen
app.get('/api/animals/:animalId', async (req, res) => {
  try {
    const { animalId } = req.params;
    
    // Lade Tier-Einträge
    const tierEintraegeFile = path.join(__dirname, '../eintraege/tierEintraege.json');
    const data = await fs.readFile(tierEintraegeFile, 'utf8');
    const tierData = JSON.parse(data);
    
    // Finde spezifisches Tier
    const animal = tierData.tiere.find(tier => tier.id === animalId);
    
    if (!animal) {
      return res.status(404).json({ error: 'Animal not found' });
    }
    
    res.json({ animal });
  } catch (error) {
    console.error('Error loading animal:', error);
    res.status(500).json({ error: 'Failed to load animal' });
  }
});

// Character-Emotionen API
app.get('/api/character/emotions', (req, res) => {
  const emotions = [
    'idle',
    'excited', 
    'curious',
    'surprised',
    'scared',
    'exploring',
    'thinking',
    'laughing'
  ];
  
  res.json({ emotions });
});

// Random Character Emotion für Auto-Reset
app.get('/api/character/random-emotion/:context', async (req, res) => {
  try {
    const { context } = req.params; // category slug
    
    // Wenn context eine Kategorie ist, lade passende Emotionen
    if (context !== 'idle') {
      try {
        const filePath = path.join(__dirname, `../kategorien/${context}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        const category = JSON.parse(data);
        
        const availableEmotions = category.character_emotions || ['curious'];
        const randomEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
        
        res.json({ emotion: randomEmotion, emotions: availableEmotions });
        return;
      } catch (error) {
        // Fallback to default
      }
    }
    
    // Default fallback
    const defaultEmotions = ['idle', 'curious', 'thinking'];
    const randomEmotion = defaultEmotions[Math.floor(Math.random() * defaultEmotions.length)];
    
    res.json({ emotion: randomEmotion, emotions: defaultEmotions });
  } catch (error) {
    console.error('Error getting random emotion:', error);
    res.status(500).json({ error: 'Failed to get random emotion' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kinderlexikon API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Check if we should bind to all interfaces for network access
const HOST = process.argv.includes('--host') && process.argv[process.argv.indexOf('--host') + 1] === '0.0.0.0' 
  ? '0.0.0.0' 
  : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Kinderlexikon Server running on ${HOST}:${PORT}`);
  if (HOST === '0.0.0.0') {
    console.log(`🌐 Network access enabled - accessible from other devices`);
    console.log(`📱 Local network: http://192.168.178.151:${PORT}/api/health`);
    console.log(`🏠 Custom domain: http://www.klex.home:${PORT}/api/health`);
  }
  console.log(`📊 Health check: http://${HOST === '0.0.0.0' ? '192.168.178.151' : 'localhost'}:${PORT}/api/health`);
  console.log(`📁 Categories API: http://${HOST === '0.0.0.0' ? '192.168.178.151' : 'localhost'}:${PORT}/api/categories`);
}); 