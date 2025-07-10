# PRD - Kinderlexikon für Vorschulkinder

## Status: IN BEARBEITUNG
*Wird nach dem Meeting finalisiert*

---

## 1. Projektvision

**Mission:** Ein interaktives, kindgerechtes Lexikon für Vorschulkinder (3-7 Jahre), das spielerisch Wissen über Tiere, Orte und Naturphänomene vermittelt.

**Kernprinzipien:**
- Audio-first Erfahrung (Kinder können noch nicht lesen)
- Selbstständige Nutzung ohne Erwachsene
- Spielerische, animierte Benutzeroberflächeoka
- Handgezeichneter, warmer visueller Stil
- **Persönlicher Guide-Character** als Begleiter durch das Lexikon

---

## 2. Zielgruppe & Nutzungsverhalten

**Primäre Zielgruppe:** Kinder 3-7 Jahre
- **3-4 Jahre:** Bildererkennung, kurze Aufmerksamkeitsspanne (2-3 Min)
- **5-6 Jahre:** Verstehen Zusammenhänge, 5-10 Min Fokus möglich
- **7 Jahre:** Erste Leseversuche, wollen mehr Details

**Nutzungskontext:**
- **Primäres Gerät:** Tablets (alle Orientierungen)
- **Sekundäres Gerät:** Smartphones  
- **Nutzungsmodus:** Selbstständig, ohne Erwachsenen-Hilfe
- **Plattform:** Webbrowser (keine native Apps)

**Nutzungsverhalten:**
- Kurze Sessions (5-15 Minuten)
- Wiederholte Inhalte (Kinder lieben Bekanntes)
- Touch-basierte, intuitive Navigation

---

## 3. Funktionale Anforderungen

### 3.1 Navigation & Interface
- **Nur Single-Tap Interaktion** (keine komplexen Gesten)
- **Pinch-to-Zoom** nur bei Bildern erlaubt
- **"Flying Categories" Animation-System** mit 12 zufälligen Rausfliege-Animationen
- **Audio-first Ansatz:** Alle Voice-overs werden vorher generiert und lokal gespeichert
- **"Nochmal hören" Funktion** bei jedem Inhalt

### 3.2 Content-Struktur
**Hauptkategorien:**

### **🐾 TIERE (30 Subkategorien):**
**Vertraute Tiere:**
- Haustiere, Bauernhoftiere

**Nach Lebensraum:**
- Waldtiere, Meerestiere, Wüstentiere, Dschungeltiere, Poltiere, Gartentiere

**Nach Ernährung:**
- Fleischfresser, Pflanzenfresser, Allesfresser

**Nach Größe:**
- Große Tiere, Mittelgroße Tiere, Kleine Tiere

**Spezielle Tiergruppen:**
- Insekten, Vögel, Reptilien, Fische, Giftige Tiere, Nachtaktive Tiere

**Besondere Kategorien:**
- Exotische Tiere, Raubtiere, Dinosaurier, Wassertiere, Flugtiere

**Weitere Kategorien:**
- Säugetiere, Babytiere, Schnelle Tiere, Langsame Tiere, Tiere mit besonderen Fähigkeiten

### **🏠 ORTE & NATUR:**
- Zuhause, Städte, Naturlandschaften, geografische Formationen

### **🌦️ NATURPHÄNOMENE:**
- Wetter, Jahreszeiten, Naturereignisse, Naturkreisläufe

**Einzeleinträge:**
- **Short Text:** Kurze Fakten (max 30 Sek Audio)
- **Detailed Text:** Erweiterte Informationen für "Mehr erfahren"
- **Verwandte Einträge:** Automatische Verlinkung ähnlicher Inhalte

### 3.3 Content-Sicherheit
- **Safety Score 1-10** für jeden Eintrag (LLM-generiert)
- **Doppelte Content-Generierung** mit o3-Qualitätskontrolle
- **Kategorie-basierte Filterung** für altersgerechte Inhalte

### 3.4 Guide-Character Integration
- **Forscher-Character** als persönlicher Begleiter
- **Narrative Voice:** Character spricht direkt mit den Kindern
- **Visuelle Präsenz:** Immer sichtbar auf der Seite mit sanften Animationen
- **Konsistente Persönlichkeit:** Neugierig, freundlich, ermutigend
- **Exploration-Fokus:** Motiviert Kinder weitere Kategorien zu entdecken

---

## 4. Technische Spezifikationen

### 4.1 Tech-Stack
- **Frontend:** React/Next.js (Mobile-First, PWA-ready)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL mit lokaler Datei-Speicherung
- **Caching:** Redis für Performance-Optimierung

### 4.2 KI-Integration
- **Content-Generation:** OpenAI GPT-4 (alle Texte)
- **Quality Control:** OpenAI o3 (Vergleich und Optimierung)
- **Image-Generation:** OpenAI GPT Image API
- **Audio-Generation:** Eleven Labs API mit lokaler Speicherung
- **Character Voice:** Eleven Labs mit konsistenter Character-Stimme

### 4.3 Content-Pipeline (100% LLM-basiert)
1. **Doppelte Text-Generation:** GPT-4 erstellt 2 Versionen pro Inhalt
2. **o3-Qualitätskontrolle:** Vergleich, Bewertung, Optimierung
3. **Image-Generation:** Einheitlicher handgezeichneter Stil
4. **Character Image:** Guide-Character in gleichem Stil
5. **Audio-Generation:** Kindgerechte Sprache und Tempo
6. **Database-Insert:** Strukturierte Speicherung mit Metadaten

### 4.4 Datei-Struktur
```
/kategorien/
  tiere.json              -> Hauptkategorie mit Subkategorien
  orte.json               -> Hauptkategorie mit Subkategorien  
  naturphaenomene.json    -> Hauptkategorie mit Subkategorien
  /images/
    category-Tiere.png         -> 1024x1024 Kategorie-Tiles
    category-Haustiere.png     -> 1024x1024 Subkategorie-Tiles
    category-Waldtiere.png     -> etc.

/public/
  /audio/
    /de/
      /categories/  -> category-tiere.mp3, category-haustiere.mp3
      /entries/     -> entry_001_golden_retriever.mp3
  /images/
    /entries/     -> entry_001_golden_retriever.jpg (1024x1024)
    /character/   -> guide_idle.jpg, guide_excited.jpg, etc.
```

**JSON Schema:** Alle Kategorie-Dateien folgen dem definierten Schema in `kategorien-schema.json`

---

## 5. Guide-Character Design

### 5.1 Character-Konzept
- **Rolle:** Freundlicher, etwas nerdiger Forscher/Entdecker
- **Zielgruppe:** Gender-neutral ansprechend für 3-7 Jahre
- **Persönlichkeit:** Neugierig, enthusiastisch, ermutigend, geduldig, etwas nerdy
- **Funktion:** Führt Kinder durch Kategorien, macht neugierig auf Exploration

### 5.2 Visuelle Charakteristika
- **Stil:** Handgezeichnet (konsistent mit Lexikon-Bildstil)
- **Design:** Kindgerecht, nicht zu detailliert, leicht nerdy (Brille, Forscherausrüstung)
- **Gender:** Bewusst gender-neutral gestaltet
- **Größe:** Klein genug um nicht störend zu wirken, groß genug um sichtbar zu sein

### 5.3 Character-Zustände & Animationen
**Technischer Ansatz:**
- **Keine Sprite-Animationen:** Nur Stretch/Scale/Movement des Bildes
- **Statische Zustände:** Verschiedene Character-Bilder die hart getauscht werden
- **Performance-optimiert:** Einfache CSS-Transforms für Bewegung

**Character-Emotions-Bibliothek:**
- **idle:** Grundzustand, ruhig, freundlich
- **excited:** Begeistert, große Augen, evtl. Arme hoch
- **curious:** Neugierig, Kopf geneigt, fragender Blick
- **surprised:** Überrascht, große Augen, offener Mund
- **scared:** Leicht erschrocken (für Dinge wie Gewitter)
- **exploring:** Aktiv forschend, mit Lupe oder zeigend
- **thinking:** Nachdenklich, Hand am Kinn
- **laughing:** Verschiedene Lach-Varianten (durch Antippen aktivierbar)

### 5.4 Interaktive Character-Features
**Character-Rotation-Animation:**
- **Vertikale Achsen-Rotation:** Character dreht sich um 90 Grad wenn Emotion wechselt
- **Image-Swap bei 90°:** Wenn Character nicht mehr sichtbar, wird neues Bild eingesetzt
- **Smooth Continue:** Character rotiert weiter und neues Bild erscheint
- **Animation-Dauer:** 600ms total (300ms raus, 300ms rein)

**Tap-Interaktionen:**
- **Character antippen:** Wechselt zu laughing/excited Emotionen
- **Kitzel-Sound-Feedback:** Zufällige Kitzel-/Lach-Sounds bei jedem Click
- **Sound-Bibliothek:** 5-7 verschiedene kindgerechte Kitzel-Geräusche
- **Visual-Feedback:** Character "springt" leicht beim Antippen

**Auto-Reset Feature:**
- **Inaktivitäts-Timer:** Nach 5 Sekunden ohne Character-Interaction
- **Automatischer Reset:** Character wechselt zurück zu passender Emotion für aktuellen Content
- **Zufällige Auswahl:** Wählt zufällig aus den passenden Emotionen für Kategorie/Eintrag
- **Smooth Transition:** Verwendet gleiche Rotation-Animation wie bei manuellen Wechseln

**Context-Sensitive Emotions:**
- **LLM-Generierte Zuweisungen:** Jede Kategorie/Eintrag bekommt passende Emotionen
- **Multiple Emotions:** Mehrere passende Emotionen pro Content möglich
- **Zufällige Auswahl:** System wählt zufällig aus passenden Emotionen
- **Emotion-Database:** LLM bestimmt während Content-Generation geeignete Emotionen

### 5.5 Narrative Stimme
- **Tonfall:** Enthusiastisch aber ruhig, leicht nerdy, wie ein geduldiger Wissenschaftler
- **Sprachmuster:** Einfache Worte, kurze Sätze, direkte Ansprache ("Du")
- **Content-Fokus:** Exploration motivieren, Neugier wecken, Kategorien anteasern
- **Interaktion:** Spricht direkt mit dem Kind, nicht über das Kind
- **Nerdy-Elemente:** Gelegentlich "Wow, faszinierend!" oder "Das ist wissenschaftlich interessant!"

### 5.6 Technische Integration
- **Position:** Feste Position (z.B. unten rechts), immer sichtbar
- **Animationen:** 
  - Subtile CSS-Bewegungen (Bounce, Scale, Rotate)
  - Breathing-Effekt im Idle-Zustand
  - Smooth Transitions zwischen Zuständen (300ms)
- **State-Management:** Context-based emotion switching
- **Audio-Synchronisation:** Character-Animation passend zur Sprachausgabe

### 5.7 Database-Integration für Emotion-Matching
```sql
-- Erweiterte Tabellen für Character-Integration
categories (
  -- ... existing fields ...
  character_emotions JSON DEFAULT '["curious"]'  -- Array für multiple Emotionen
);

entries (
  -- ... existing fields ...
  character_emotions JSON DEFAULT '["excited"]'  -- Array für multiple Emotionen
);

character_states (
  id SERIAL PRIMARY KEY,
  emotion_name VARCHAR(20),
  image_filename VARCHAR(255),
  description TEXT,
  audio_files JSON  -- Kitzel-Sounds für diese Emotion
);

character_sounds (
  id SERIAL PRIMARY KEY,
  sound_type VARCHAR(20),  -- 'kitzel', 'laugh', 'giggle'
  filename VARCHAR(255),
  emotion_context VARCHAR(20)
);
```

**LLM-Generierte Emotion-Content-Mappings:**
- **Automatische Zuweisung:** LLM bestimmt während Content-Generierung passende Emotionen
- **Multiple Choice:** Jeder Content kann 2-4 passende Emotionen haben
- **Beispiele:** 
  - Löwen → ["excited", "curious", "surprised"]
  - Schmetterlinge → ["excited", "curious"] 
  - Gewitter → ["surprised", "thinking", "curious"]
  - Katzen → ["excited", "laughing", "curious"]

---

## 6. Content-Strategie

### 6.1 Content-Erstellung
- **Vollständig LLM-generiert** (kein Wikipedia-Scraping)
- **Character-Perspective:** Alle Texte als direkte Ansprache vom Guide
- **Einheitlicher Qualitätsstandard** durch doppelte Generierung
- **Konsistenter Schwierigkeitsgrad** für 3-7 Jahre
- **Automation-Scripts** für schnelle Kategorie-Erstellung

### 6.2 Qualitätssicherung
- **Doppelgenerierung + o3-Vergleich** für alle Texte
- **Character-Konsistenz-Check:** Passt der Tonfall zum Guide?
- **Safety-Bewertung** bei jeder Content-Erstellung
- **Konsistenz-Checks** zwischen verwandten Einträgen

---

## 7. Mehrsprachigkeit (Vorbereitung)

### 7.1 Datenbank-Struktur
- **content_translations Tabelle** bereits vorgesehen
- **Sprach-Codes:** ISO-Format (de-DE, en-US, etc.)
- **Audio-Dateien:** Sprachspezifische Ordner-Struktur

### 7.2 Expansion-Strategie
- **Phase 1:** Deutsch (MVP)
- **Phase 2:** Englisch
- **Phase 3:** Weitere europäische Sprachen
- **LLM-Pipeline** ermöglicht schnelle Übersetzungen

---

## 8. Entwicklungs-Roadmap

### 8.1 MVP (Prototyp)
- **1 Hauptkategorie:** Tiere
- **1 Unterkategorie:** Haustiere → Hunde
- **5 Einträge:** Golden Retriever, Dackel, Husky, Pudel, Schäferhund
- **Vollständiger Tech-Stack** implementiert
- **Animation-System** funktionsfähig

### 8.2 Phase 1 (Launch-ready)
- **3 Hauptkategorien** vollständig
- **50+ Einträge** über alle Kategorien
- **Performance-Optimierung** für Mobile
- **Content-Management-Interface** für manuelle Überprüfung

### 8.3 Phase 2 (Skalierung)
- **Automation-Scripts** für Content-Team
- **Mehrsprachigkeit** (Englisch)
- **Advanced Analytics** für Nutzungsverhalten
- **Content-Erweiterung** basierend auf Daten

---

## 9. Risiken & Backup-Pläne

### 9.1 Technische Risiken
- **OpenAI API Ausfälle:** Lokale Caching-Strategien
- **Eleven Labs Limit:** Alternative TTS-Services vorbereitet
- **Performance auf älteren Geräten:** Progressive Enhancement

### 9.2 Content-Risiken
- **LLM-Halluzinationen:** Doppelgenerierung + o3-Checks
- **Ungeeignete Inhalte:** Safety-Scoring + manuelle Reviews
- **Inkonsistente Qualität:** Standardisierte Prompts + Qualitätskontrolle

---

## 10. Erfolgsmessung

### 10.1 KPIs (zukünftig)
- **Engagement:** Session-Dauer, Wiederholte Besuche
- **Content-Qualität:** Safety-Scores, manuelle Reviews
- **Technical Performance:** Ladezeiten, Animationsqualität
- **User Satisfaction:** Qualitative Feedback von Eltern

### 10.2 MVP-Erfolgskriterien
- **Technisch:** Alle Animationen laufen smooth (60fps)
- **Content:** 5 vollständige Hunde-Einträge mit Audio
- **UX:** Intuitive Navigation ohne Anleitung möglich

---

*PRD wird kontinuierlich während des Meetings aktualisiert* 

---

## 🎯 SEGMENT 11.9: Character-Prompt in HD Portrait Format

**Dr. James Morrison (AI Prompt Engineer):** "Excellent! HD portrait will showcase the character much better:

### 🤖 **Final Character-Prompt in HD Portrait:**

```
Hand-drawn children's book illustration of a friendly, gender-neutral young scientist character for ages 3-7. Character has round friendly glasses, brown explorer vest over light colored shirt, and holds a beautiful glowing crystal knowledge sphere - a magical orb that contains swirling lights and appears to hold information within. Character has a warm, medium-brown skin tone that is ambiguous and could represent various ethnicities. Character has a pencil tucked behind their right ear and a small colorful feather in their hair on the left side. Soft organic lines, warm natural colors (browns, beiges, soft oranges), gentle watercolor washes. Style reminiscent of classic children's picture books like Eric Carle or Beatrix Potter. Character has a curious, slightly nerdy but very approachable expression with big friendly eyes. Medium-length hair that could be any gender, comfortable explorer clothing. Character is in a neutral standing pose looking directly at viewer with a warm, encouraging smile, holding their glowing crystal sphere with wonder and pride. The crystal sphere has a soft, magical glow with subtle swirling patterns inside. Full body visible within frame from head to feet. No text, no words, no letters anywhere in the image. HD portrait composition perfectly centered for 1024x1536 format. No digital perfection, charming hand-drawn imperfections. Transparent background so character can be placed over any content. Perfect portrait format design. Character should look like they belong in the same artistic world as the other illustrated content.
```"

**Maya Chen (UX/UI Designer):** "HD portrait format is perfect for:
- **Mobile optimization:** Fits naturally on portrait screens
- **Character detail:** More space to show full body and accessories
- **UI integration:** Easier to position alongside portrait content
- **Visual hierarchy:** Character gets proper prominence"

**Alex Weber (Tech Lead):** "Portrait format benefits:
- **File size:** Better compression for mobile
- **Responsive design:** Works better on all device orientations
- **Animation space:** More room for character movement animations
- **Layering:** Easier to overlay on portrait-oriented content"

---

**🧪 Perfect! This HD portrait prompt will create your detailed character with optimal mobile-friendly dimensions!** 