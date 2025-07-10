# Kinderlexikon Image Processor

Dieses Tool verarbeitet Bilder für das Kinderlexikon-Projekt mit OpenAI's Vision und Image Generation APIs.

## Datei-Organisation

```
Vorschulkinder Lexikon/
├── Characters/
│   ├── BaseCharacter.png          # Original-Referenz-Charakter
│   ├── Character-excited.png      # Generierte Character-Emotionen
│   ├── Character-curious.png      # (HD Portrait Format 1024x1536)
│   └── ...
├── ProcessedImages/               # Allgemeine Bildverarbeitung-Ergebnisse
│   ├── bild1-kinderlexikon.png    # (Quadratisches Format 1024x1024)
│   ├── bild1-description.txt
│   └── ...
├── Character-Generator-Simple.ps1          # Character-Emotion-Generator
├── Kinderlexikon-ImageProcessor-Fixed.ps1  # Allgemeine Bildverarbeitung
└── api-key.txt                            # OpenAI API Key (in .gitignore)
```

## Verfügbare Scripts

### 1. Character-Generator-Simple.ps1 (Character-Emotionen)
Speziell für die Generierung von Character-Emotion-Varianten optimiert.

**Features:**
- Verwendet finalen Character-Prompt aus PRD
- HD Portrait Format (1024x1536) für mobile Geräte
- 8 verschiedene Emotionen: excited, curious, surprised, thinking, laughing, idle, scared, exploring
- Direkte Speicherung im Characters/ Ordner
- Konsistenter Kinderlexikon-Stil

**Verwendung:**
```powershell
# Character mit spezifischer Emotion generieren
powershell -ExecutionPolicy Bypass -File .\Character-Generator-Simple.ps1 -Emotion "excited"
powershell -ExecutionPolicy Bypass -File .\Character-Generator-Simple.ps1 -Emotion "curious"
powershell -ExecutionPolicy Bypass -File .\Character-Generator-Simple.ps1 -Emotion "thinking"
```

### 2. Kinderlexikon-ImageProcessor-Fixed.ps1 (Allgemeine Bildverarbeitung)
Für die Verarbeitung beliebiger Bilder zu kinderfreundlichen Illustrationen.

**Features:**
- Kinderfreundliche Bildgenerierung (Alter 3-7)
- Warme, einladende Farben und weiche Kanten
- Bilderbuch-Stil mit pädagogischem Wert
- Quadratisches Format (1024x1024) für Enzyklopädie-Kacheln
- Automatische BaseCharacter-Referenz falls verfügbar

**Verwendung:**
```powershell
# Alle Bilder im Characters-Ordner verarbeiten
powershell -ExecutionPolicy Bypass -File .\Kinderlexikon-ImageProcessor-Fixed.ps1

# Einzelnes Bild verarbeiten
powershell -ExecutionPolicy Bypass -File .\Kinderlexikon-ImageProcessor-Fixed.ps1 -InputImage ".\Characters\meinbild.png"
```

## Vorbereitung

1. **BaseCharacter.png erstellen:**
   - Lege eine `BaseCharacter.png` in den `Characters/` Ordner
   - Dies sollte der Referenz-Charakter für das Kinderlexikon sein
   - Freundlich, kinderfreundlich, im gewünschten Stil

2. **Charakterbilder hinzufügen:**
   - Füge alle zu verarbeitenden Bilder in den `Characters/` Ordner hinzu
   - Unterstützte Formate: JPG, JPEG, PNG, GIF, BMP, WebP

3. **OpenAI API Key (Neue Methode - Empfohlen):**
   - **Einfachste Methode:** Erstelle eine Datei `api-key.txt` im Projektordner mit deinem API Key
   - Die Datei wird automatisch gelesen und ist bereits in `.gitignore` enthalten
   - Alternative: Setze die Umgebungsvariable: `$env:OPENAI_API_KEY = "sk-..."`
   - Alternative: Gib den Key direkt als Parameter an
   - Fallback: Lass ihn vom Script abfragen

## Kinderlexikon-Spezifische Optimierungen

### Stil-Eigenschaften:
- **Altersgruppe:** 3-7 Jahre
- **Farben:** Helle, fröhliche Farben mit weichen Kanten
- **Formen:** Klare, einfache Formen
- **Charaktere:** Freundlich, einladend, nie beängstigend
- **Stil:** Handgezeichnet, Bilderbuch-Qualität
- **Format:** Quadratisch (1024x1024) für Enzyklopädie-Kacheln

### Pädagogischer Fokus:
- Bildungsinhalt steht im Vordergrund
- Visuell ansprechend für Vorschulkinder
- Klarheit und Lernerfolg priorisiert
- Konsistente Charaktergestaltung

## Beispiel-Workflows

### Character-Emotionen generieren:
```powershell
# Verschiedene Character-Emotionen für das Kinderlexikon erstellen
.\Character-Generator-Simple.ps1 -Emotion "excited"
.\Character-Generator-Simple.ps1 -Emotion "curious"
.\Character-Generator-Simple.ps1 -Emotion "thinking"
.\Character-Generator-Simple.ps1 -Emotion "laughing"
```
**Ergebnis:** HD Portrait-Character (1024x1536) in `Characters/Character-[emotion].png`

### Allgemeine Bilder verarbeiten:
```powershell
# Beliebige Bilder zu kinderfreundlichen Illustrationen verarbeiten
.\Kinderlexikon-ImageProcessor-Fixed.ps1

# Oder einzelnes Bild
.\Kinderlexikon-ImageProcessor-Fixed.ps1 -InputImage "meinbild.jpg"
```
**Ergebnis:** Quadratische Kinderlexikon-Bilder (1024x1024) in `ProcessedImages/`

## Fehlerbehebung

### Häufige Probleme:
1. **"BaseCharacter.png not found"**
   - Erstelle den Characters-Ordner
   - Füge BaseCharacter.png hinzu

2. **"API Key required"**
   - Setze Umgebungsvariable oder übergib als Parameter

3. **"No image files found"**
   - Prüfe, ob Bilder im Characters-Ordner sind
   - Unterstützte Formate verwenden

### Rate Limiting:
- Das Script enthält automatische Verzögerungen (1 Sekunde)
- Bei vielen Bildern: in kleineren Batches verarbeiten

## Erweiterungen

Das Script kann erweitert werden für:
- Verschiedene Kategorien (Tiere, Pflanzen, Fahrzeuge)
- Mehrsprachige Beschreibungen
- Unterschiedliche Ausgabeformate
- Automatische Qualitätskontrolle

## Sicherheitshinweise

- ✅ **API-Key sicher verwalten:** Nutze die `api-key.txt` Datei (ist bereits in `.gitignore`)
- ❌ API-Keys niemals in Code oder Git committen
- ✅ Originale Bilder vor Verarbeitung sichern
- ✅ Generierte Inhalte auf Kindertauglichkeit prüfen
- ✅ Regelmäßig API-Usage monitoring bei OpenAI 