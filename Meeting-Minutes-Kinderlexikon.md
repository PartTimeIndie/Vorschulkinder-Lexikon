# Meeting Minutes - PRD Kinderlexikon für Vorschulkinder

**Datum:** [Aktuelles Datum]  
**Meeting-Typ:** PRD Expertenrunde  
**Dauer:** Laufend  

---

## Teilnehmer
- **Product Owner:** Du (Projektleitung)
- **Dr. Sarah Klein:** Kinderentwicklungsexpertin
- **Alex Weber:** Tech Lead/Backend
- **Maya Chen:** UX/UI Designer  
- **Prof. Martin Schneider:** Kinderwissen-Experte
- **Lisa Hartmann:** Kinderbuch-Illustratorin & Digital Artist
- **Dr. James Morrison:** AI Image Prompt Engineering Expert
- **Emma Rodriguez:** UX Designer speziell für Kindermedien

---

## 🎯 SEGMENT 1: Zielgruppe & Grundlagen
### Entscheidungen:
- **Altersgruppe:** 3-7 Jahre (präzisiert von ursprünglich 0-7)
- **Nutzung:** Selbstständige Nutzung als Fokus
- **Plattform:** Nur Webbrowser (keine native Apps)
- **Geschäftsmodell:** Kostenlos (initial)
- **Barrierefreiheit:** Erstmal nicht geplant
- **Offline-Funktionalität:** Nein

### Content-Sicherheit:
- LLM-basierte Sicherheitsprüfung bei Datenerfassung
- Kategorien-System als Filter
- Safety Score 1-10 für jeden Eintrag
- Manuelle Review-Möglichkeit für Kategorien

---

## 🗂️ SEGMENT 2: Kategorie-Struktur (erweitert)
### Hauptkategorien mit je 16+ Unterkategorien:

**TIERE:**
- Haustiere, Wildtiere Deutschland, Wildtiere Afrika, Wildtiere Asien
- Meerestiere, Fische, Vögel, Insekten, Reptilien, Amphibien  
- Fleischfresser, Pflanzenfresser, Allesfresser
- Große Tiere, Kleine Tiere, Gefährliche Tiere

**ORTE & NATUR:**
- Zuhause, Stadt, Dorf, Spielplatz, Schule, Kindergarten
- Wald, Wiese, See, Meer, Strand, Wüste
- Berge, Vulkane, Höhlen, Wasserfälle
- Länder, Kontinente

**NATURPHÄNOMENE:**
- Wetter (Regen, Schnee, Gewitter, Regenbogen, Wind, Nebel)
- Jahreszeiten, Tag & Nacht, Sonne, Mond, Sterne
- Naturereignisse, Naturkreisläufe

### UI-Elemente:
- Großer Play-Button für Audio
- 'Nochmal hören' Button
- 'Mehr erfahren' Button → detaillierterer Inhalt
- Unterbereiche-Navigation
- Verwandte Einträge-Slider

---

## 💻 SEGMENT 3: Tech-Stack
### Bestätigt:
- **Frontend:** React/Next.js
- **Backend:** Node.js + Express  
- **Database:** PostgreSQL
- **LLM:** Ausschließlich OpenAI (GPT-4 für Content, GPT Image für Bilder)
- **Audio:** Eleven Labs + lokale Speicherung
- **Caching:** Redis für Performance

### Content-Pipeline (REVIDIERT):
1. ~~Wikipedia Scraping~~ → **Komplett gestrichen**
2. **Doppelte LLM Content Generation** → GPT-4 erstellt Text zweimal
3. **Quality Check** → o3 vergleicht und optimiert
4. **Image Generation** → GPT Image API (einheitlicher Stil)
5. **Audio Generation** → Eleven Labs → lokale Speicherung

---

## 🎨 SEGMENT 4-5: Design & Image-Strategie
### Stil-Entscheidung:
- **Handgezeichneter Kinderbuch-Stil** (nicht Pixar/3D)
- Inspiration: Eric Carle, Beatrix Potter, Maurice Sendak
- Aquarell und Buntstift-Technik
- Sichtbare Pinselstriche und Papier-Textur
- Warme, natürliche Farben

### Bild-Spezifikationen:
- **Format:** Immer 1024x1024 (Kachel-optimiert)
- **Kategorien:** Mehrere Beispiele der Kategorie zeigen
- **Einzeleinträge:** Ein spezifisches Objekt/Tier
- **Keine Texte** in Bildern
- **Keine Accessoires** bei Kategorie-Bildern

### Finalisierte Prompts:
- Gespeichert in `image-prompts.txt`
- Template-Syntax: `{CATEGORY}` und `{ITEM_NAME}`
- Getestet und bestätigt funktionsfähig

---

## 🗄️ SEGMENT 6: Datenbank-Struktur
### Lokale Datei-Strategie:
- **Bilder:** `/public/images/categories/` und `/public/images/entries/`
- **Audio:** `/public/audio/de/categories/` und `/public/audio/de/entries/`
- **Dateinamen:** Strukturiert (z.B. `cat_001_haustiere.jpg`)

### Datenbank-Tabellen:
- `categories` (mit image_filename, audio_filename_de)
- `entries` (mit safety_score, lokale Dateien)
- `content_translations` (Mehrsprachigkeit-Vorbereitung)

---

## 📱 SEGMENT 7: Mobile-First UX & Navigation
### **WICHTIGE ERKENNTNIS:** Tablet/Smartphone-fokussiert!
- **Zielgeräte:** Tablets als Hauptgerät, Smartphones sekundär
- **Touch-Regeln:** Nur Single Taps + Pinch-to-Zoom bei Bildern
- **Keine komplexen Gesten:** Keine Double-Taps, Swipes, etc.

### Touch-Optimierte Spezifikationen:
- **Minimum Touch-Target:** 44px (iOS Guidelines)
- **Primary Layout:** Portrait-First (9:16)
- **Grid:** 2-3 Kacheln pro Reihe (Portrait)
- **Fonts:** Mindestens 16px für Touch-Screens

### "Flying Categories" Animation-System:
**Ablauf:**
1. User tappt auf Kategorie → gewählte bewegt sich nach oben-mitte
2. Alle anderen fliegen mit **zufälliger Animation** raus
3. Audio startet automatisch
4. Unterkategorien erscheinen smooth von unten

**12 Rausfliege-Animationen (zufällig gewählt):**
- Richtungsbasiert: `flyOutLeft`, `flyOutRight`, `flyOutUp`, `flyOutDown`
- Hälften: `splitLeftRight`, `splitUpDown`, `splitDiagonal1`, `splitDiagonal2`
- Spielerisch: `randomScatter`, `spiral`, `explosion`, `wave`

---

## 🤖 SEGMENT 8: 100% LLM-basierte Content-Pipeline
### **WICHTIGE ÄNDERUNG:** Wikipedia-Scraping komplett gestrichen!

### Neue Qualitäts-Pipeline:
1. **Doppelte Text-Generation:** GPT-4 erstellt 2 Versionen
2. **o3-Vergleich:** "Vergleiche, optimiere, erstelle beste Version"
3. **Einheitliche Bild-Generation:** Alle Bilder mit GPT Image
4. **Konsistente Audio-Generation:** Eleven Labs

### Automation-Scripts geplant:
- `create_category.bat` → Input: Kategorie-Name
- `generate_category.py` → Vollautomatische Erstellung
- Database-Integration für direkte Speicherung

### Vorteile der LLM-Only Pipeline:
- Einheitlicher visueller Stil
- Konsistente Textqualität
- Keine Urheberrechts-Probleme
- Schnelle Skalierung

---

## 📋 NÄCHSTE SCHRITTE:
1. **Automation-Scripts** entwickeln
2. **Prototyp-Content** definieren (Haustiere → Hunde)
3. **LLM-Prompts** für Texterstellung finalisieren
4. **PRD vervollständigen**

---

## ❓ OFFENE PUNKTE:
- Script-Parameter definieren
- Prototyp-Content-Liste
- Finale LLM-Prompts
- Technische Implementation Details

---

*Meeting läuft weiter...* 