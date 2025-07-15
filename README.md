# 🔍 Kinderlexikon - Interaktives Lexikon für Vorschulkinder

Ein modernes, interaktives Kinderlexikon für Kinder im Alter von 3-7 Jahren mit Character-Guide, Animationen und kindgerechter Benutzeroberfläche.

## ✨ Features

### 🎭 Character-System
- **Interaktiver Guide-Character** mit 8 verschiedenen Emotionen
- **Rotations-Animationen** beim Emotionswechsel (90°-Drehung)
- **Auto-Reset-Funktion** nach 5 Sekunden Inaktivität
- **Tap-Interaktionen** mit Bounce-Animation und Kitzel-Effekt
- **Context-abhängige Emotionen** basierend auf aktueller Kategorie

### 🎯 Animationen
- **12 verschiedene Flying-Categories-Animationen** bei Kategorien-Klick
- **Mobile-first responsive Design** für Tablets und Smartphones
- **Smooth Transitions** und kindgerechte UI-Elemente
- **Gestaffelte Animations-Delays** für bessere UX

### 📁 Content-Management
- **JSON-basierte Kategorien-Verwaltung** ohne Datenbank
- **Automatische API-Endpunkte** für Kategorien und Subkategorien
- **Performance-optimierte Bildauslieferung** (nur benötigte Inhalte)
- **Safety-Score-System** für altersgerechte Inhalte

## 🚀 Quick Start

### 1. Installation

```bash
# Repository klonen
git clone <repository-url>
cd kinderlexikon

# Dependencies installieren
npm install
```

### 2. Development Server starten

```bash
# Backend und Frontend parallel starten
npm run dev

# Oder einzeln:
npm run server:dev  # Backend auf Port 5000
npm run client:dev  # Frontend auf Port 3000
```

### 3. Browser öffnen

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health

## 📋 Tech Stack

### Frontend
- **Next.js 14** - React Framework
- **Framer Motion** - Animationen (planned)
- **Mobile-First CSS** - Responsive Design
- **Custom Animations** - Character & Tile-Animationen

### Backend
- **Node.js + Express** - API Server
- **JSON File Storage** - Kategorien-Daten
- **Static File Serving** - Bilder und Character-Assets
- **CORS enabled** - Cross-Origin Requests

## 📁 Projekt-Struktur

```
kinderlexikon/
├── server/
│   └── index.js              # Express Backend
├── pages/
│   ├── _app.js               # Next.js App Component
│   └── index.js              # Homepage
├── components/
│   ├── Character.js          # Character-Komponente mit Animationen
│   └── CategoryTile.js       # Kategorie-Tiles mit Flying-Animationen
├── styles/
│   └── globals.css           # Global Styles & Animationen
├── kategorien/
│   ├── tiere.json            # Kategorie-Daten
│   └── images/               # Kategorie-Bilder (1024x1024)
├── Characters/               # Character-Emotionen-Bilder
└── public/                   # Statische Assets
```

## 🎮 Character-Emotionen

| Emotion | Beschreibung | Verwendung |
|---------|-------------|------------|
| `idle` | Grundzustand, ruhig | Default-Zustand |
| `excited` | Begeistert, große Augen | Spannende Kategorien |
| `curious` | Neugierig, Kopf geneigt | Explorative Momente |
| `surprised` | Überrascht, offener Mund | Besondere Inhalte |
| `thinking` | Nachdenklich, Hand am Kinn | Komplexere Themen |
| `laughing` | Verschiedene Lach-Varianten | Tap-Interaktionen |

## 🎨 Flying-Animationen

Das System verfügt über 12 verschiedene zufällige Flug-Animationen:
- **Diagonal:** Nach oben/unten links/rechts (4 Varianten)
- **Vertikal:** Nach oben/unten (2 Varianten)  
- **Horizontal:** Nach links/rechts (2 Varianten)
- **Spiral:** Rotations-Kombinationen (4 Varianten)

## 📡 API Endpunkte

### Kategorien
- `GET /api/categories` - Alle Hauptkategorien
- `GET /api/categories/:slug` - Spezifische Kategorie mit Subkategorien

### Character
- `GET /api/character/emotions` - Alle verfügbaren Emotionen
- `GET /api/character/random-emotion/:context` - Zufällige contextuelle Emotion

### Assets
- `GET /images/:filename` - Kategorie-Bilder
- `GET /character/:filename` - Character-Emotionen-Bilder

## ⚙️ Konfiguration

### Mobile-First Design
- **Primary:** Tablets (Portrait-Modus)
- **Secondary:** Smartphones
- **Fallback:** Desktop (responsive)

### Performance-Optimierung
- **Lazy Loading** für Bilder
- **Minimale API-Payloads** (nur benötigte Daten)
- **CSS-Animationen** statt JavaScript für Performance

## 📊 Kategorien-Schema

Alle Kategorien folgen dem JSON-Schema in `kategorien-schema.json`:

```json
{
  "id": "cat_001",
  "name": "Tiere",
  "slug": "tiere", 
  "description": "Character-generierte Beschreibung...",
  "image": { "filename": "...", "path": "...", "alt": "..." },
  "audio": null,
  "character_emotions": ["excited", "curious"],
  "safety_score": 8,
  "subcategories": [...]
}
```

## 🔧 Development

### Neue Kategorien hinzufügen

1. **JSON-Datei** in `kategorien/` erstellen
2. **Bilder** in `kategorien/images/` ablegen
3. **Schema-Validierung** mit `kategorien-schema.json`
4. **Server-Restart** für neue Dateien

### Character-Emotionen erweitern

1. **Neue Bilder** in `Characters/` ablegen
2. **Emotion-Mapping** in `Character.js` erweitern
3. **CSS-Animationen** in `globals.css` hinzufügen

## 🎯 Roadmap

### MVP (Aktuell)
- [x] Character-System mit Animationen
- [x] Flying-Categories-Animationen
- [x] JSON-basierte Kategorien-API
- [x] Mobile-first responsive Design
- [x] Tiere-Kategorie mit 2 Subkategorien

### Phase 2
- [ ] Audio-Integration (Eleven Labs)
- [ ] Weitere Hauptkategorien (Orte, Naturphänomene)
- [ ] Einzeleinträge-System
- [ ] Sound-Effekte für Character-Interaktionen

### Phase 3
- [ ] PWA-Funktionalität
- [ ] Offline-Modus
- [ ] Performance-Monitoring
- [ ] Multi-Language Support

## 🐛 Bekannte Issues

- Character-Bilder müssen lokal vorhanden sein (`Characters/` Ordner)
- API läuft derzeit nur auf localhost:5000
- `unoptimized` Image-Flag für Development aktiv

## 📝 License

MIT License - Siehe `LICENSE` Datei für Details.

---

**🎨 Erstellt für die nächste Generation kleiner Entdecker! 🔍** 

## Offline Asset Management

**Important:**
Whenever you add new images, audio files, entries, or categories, always re-run the offline file list generator script:

```bash
node scripts/generate-offline-filelist.js
```

This ensures that all new assets are included in offline support for the app. 