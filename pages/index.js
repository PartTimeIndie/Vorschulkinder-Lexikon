import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Character from '../components/Character';
import CategoryTile from '../components/CategoryTile';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [animals, setAnimals] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [characterContext, setCharacterContext] = useState('idle');
  const [currentView, setCurrentView] = useState('main'); // 'main', 'category', 'animals', 'transitioning'
  const [clickedItemId, setClickedItemId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recentItems, setRecentItems] = useState([]);
  const [playedAnimals, setPlayedAnimals] = useState([]); 
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null); 
  const scrollContainerRef = useRef(null);

  // Vereinfachtes Anti-Flickering System
  const [isContentStaged, setIsContentStaged] = useState(false);
  const [globalAnimationDirection, setGlobalAnimationDirection] = useState('down');

  // Local Storage Utility-Funktionen
  const savePlayedAnimalsToStorage = (playedList) => {
    try {
      localStorage.setItem('kinderlexikon_played_animals', JSON.stringify(playedList));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadPlayedAnimalsFromStorage = () => {
    try {
      const saved = localStorage.getItem('kinderlexikon_played_animals');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return [];
    }
  };

  // HIERARCHISCHES Recent Items Local Storage System
  const getStorageKey = (level, categorySlug = null, subcategorySlug = null) => {
    if (level === 'main') return 'kinderlexikon_recent_main';
    if (level === 'category' && categorySlug) return `kinderlexikon_recent_cat_${categorySlug}`;
    if (level === 'animals' && categorySlug && subcategorySlug) return `kinderlexikon_recent_animals_${categorySlug}_${subcategorySlug}`;
    return 'kinderlexikon_recent_fallback'; // Fallback
  };

  const saveRecentItemsToStorage = (recentList, level, categorySlug = null, subcategorySlug = null) => {
    try {
      const key = getStorageKey(level, categorySlug, subcategorySlug);
      localStorage.setItem(key, JSON.stringify(recentList));
      console.log(`💾 Saved recent items for ${level}:`, recentList);
    } catch (error) {
      console.error('Error saving recent items to localStorage:', error);
    }
  };

  const loadRecentItemsFromStorage = (level, categorySlug = null, subcategorySlug = null) => {
    try {
      const key = getStorageKey(level, categorySlug, subcategorySlug);
      const saved = localStorage.getItem(key);
      const result = saved ? JSON.parse(saved) : [];
      console.log(`📂 Loaded recent items for ${level}:`, result);
      return result;
    } catch (error) {
      console.error('Error loading recent items from localStorage:', error);
      return [];
    }
  };

  // Utility-Funktionen für zufällige Anordnung
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const arrangeItemsWithRecent = (items, recentIds = []) => {
    // Recent Items in der richtigen Reihenfolge (zuletzt geklickt zuerst)
    const recentItems = [];
    recentIds.forEach(recentId => {
      const item = items.find(item => item.id === recentId);
      if (item) recentItems.push(item);
    });
    
    // Andere Items zufällig anordnen
    const otherItems = items.filter(item => !recentIds.includes(item.id));
    const shuffledOthers = shuffleArray(otherItems);
    
    return [...recentItems, ...shuffledOthers];
  };

  // Hierarchisches Add-to-Recent System
  const addToRecent = (itemId, level, categorySlug = null, subcategorySlug = null) => {
    setRecentItems(prev => {
      const newRecent = [itemId, ...prev.filter(id => id !== itemId)];
      const limitedRecent = newRecent.slice(0, 4); // Nur letzte 4 behalten
      saveRecentItemsToStorage(limitedRecent, level, categorySlug, subcategorySlug); // Hierarchisch speichern
      return limitedRecent;
    });
  };

  // Context-abhängiges Recent Items laden
  const getCurrentRecentItems = () => {
    if (currentView === 'main') {
      return loadRecentItemsFromStorage('main');
    } else if (currentView === 'category' && selectedCategory) {
      return loadRecentItemsFromStorage('category', selectedCategory.slug);
    } else if (currentView === 'animals' && selectedCategory) {
      // Für Animals: Category + aktuell geladene Subcategory identifizieren
      return loadRecentItemsFromStorage('animals', selectedCategory.slug, 'current_subcat');
    }
    return [];
  };

  // Kategorien vom Backend laden (Anti-Flickering mit Staging)
  const loadCategories = async () => {
    try {
      setLoading(true);
      setIsContentStaged(false); // Content verstecken während Load
      
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.categories) {
        // HIERARCHISCH: Kategorien mit Main-Recent-Logic anordnen
        const mainRecentItems = loadRecentItemsFromStorage('main');
        const arrangedCategories = arrangeItemsWithRecent(data.categories, mainRecentItems);
        setRecentItems(mainRecentItems); // State aktualisieren
        
        // In Staging-Area setzen
        // setStagedCategories(arrangedCategories); // Removed as per edit hint
        
        // Kurze Verzögerung für smoother Übergang
        setTimeout(() => {
          setCategories(arrangedCategories);
          setIsContentStaged(true); // Content anzeigen
          setError(null);
        }, 50);
      } else {
        throw new Error('No categories found');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Fehler beim Laden der Kategorien. Bitte versuche es nochmal!');
      setIsContentStaged(true);
    } finally {
      setLoading(false);
    }
  };

  // Spezifische Kategorie mit Subkategorien laden (Anti-Flickering)
  const loadCategoryDetails = async (slug) => {
    try {
      setIsContentStaged(false); // Content verstecken
      
      const response = await fetch(`/api/categories/${slug}`);
      const data = await response.json();
      
      if (data.category) {
        setSelectedCategory(data.category);
        
        // HIERARCHISCH: Subkategorien mit Category-spezifischen Recent Items anordnen
        const subcats = data.category.subcategories || [];
        const categoryRecentItems = loadRecentItemsFromStorage('category', slug);
        const arrangedSubcats = arrangeItemsWithRecent(subcats, categoryRecentItems);
        setRecentItems(categoryRecentItems); // State aktualisieren
        
        // Staging
        // setStagedSubcategories(arrangedSubcats); // Removed as per edit hint
        
        setTimeout(() => {
          setSubcategories(arrangedSubcats);
          setCharacterContext(slug); // Character-Context auf Kategorie setzen
          setIsContentStaged(true); // Content anzeigen
          setError(null);
        }, 50);
      } else {
        throw new Error('Category not found');
      }
    } catch (err) {
      console.error('Error loading category details:', err);
      setError('Fehler beim Laden der Kategorie-Details!');
      setIsContentStaged(true);
    }
  };

  // Audio-Wiedergabe Funktion mit Stop-Management
  const playAudio = (audioPath) => {
    if (audioPath) {
      try {
        // Alle vorherigen Audios stoppen
        if (window.currentAudio) {
          window.currentAudio.pause();
          window.currentAudio.currentTime = 0;
        }
        
        // Neues Audio erstellen und abspielen
        const audio = new Audio(audioPath);
        window.currentAudio = audio; // Global speichern für Stop-Management
        
        audio.play().catch(err => {
          console.log('Audio autoplay verhindert:', err);
        });
        
        // Audio aus globalem Storage entfernen wenn beendet
        audio.addEventListener('ended', () => {
          if (window.currentAudio === audio) {
            window.currentAudio = null;
          }
        });
        
      } catch (error) {
        console.error('Audio-Fehler:', error);
      }
    }
  };

  // Hauptkategorie angeklickt - VEREINFACHT
  const handleCategoryClick = (category) => {
    if (currentView === 'transitioning') return; // Keine Klicks während Transition

    // Neue zufällige Richtung für alle Tiles
    setGlobalAnimationDirection(getRandomDirection());
    
    setCurrentView('transitioning');
    setClickedItemId(category.id);
    setCharacterContext(category.slug); // Character-Emotion sofort wechseln
    addToRecent(category.id, 'main'); // HIERARCHISCH: Zu Main Recent Items hinzufügen
    
    // Audio abspielen wenn vorhanden
    if (category.audio && category.audio.path) {
      playAudio(`/${category.audio.path}`);
    }
    
    // Nach Animation die Subkategorien laden - warten bis selected animation fertig
    setTimeout(() => {
      loadCategoryDetails(category.slug);
      setCurrentView('category');
      setClickedItemId(null);
    }, 1800); // Warten bis selected tile animation fertig ist (1.8s)
  };

  // Subkategorie angeklickt - VEREINFACHT  
  const handleSubcategoryClick = (subcategory) => {
    if (currentView === 'transitioning') return; // Keine Klicks während Transition

    // Neue zufällige Richtung für alle Tiles
    setGlobalAnimationDirection(getRandomDirection());
    
    setCurrentView('transitioning');
    setClickedItemId(subcategory.id);
    setCharacterContext(subcategory.slug);
    addToRecent(subcategory.id, 'category', selectedCategory?.slug); // HIERARCHISCH: Zu Category Recent Items
    
    // Audio abspielen wenn vorhanden
    if (subcategory.audio && subcategory.audio.path) {
      playAudio(`/${subcategory.audio.path}`);
    }
    
    // Lade Tier-Einträge für diese Subkategorie
    setTimeout(() => {
      loadAnimalsForCategory(subcategory.slug);
      setCurrentView('animals'); // Wechsel zu animals view
      setClickedItemId(null);
    }, 1800);
  };

  // Tiere für spezifische Subkategorie laden - FIXED API CALL
  const loadAnimalsForCategory = async (subcategorySlug) => {
    try {
      setLoading(true);
      setIsContentStaged(false); // Content verstecken während Load
      
      // FIXED: Verwende die richtige API-Route mit der Hauptkategorie
      const response = await fetch(`/api/animals/category/${selectedCategory.slug}`);
      const data = await response.json();
      
      if (data.animals && data.animals.length > 0) {
        // Filtere Tiere die zur Subkategorie gehören
        // Für jetzt nehmen wir alle Tiere der Hauptkategorie
        // TODO: Implementiere Subkategorie-Filtering wenn nötig
        const filteredAnimals = data.animals;
        
        // HIERARCHISCH: Animals mit Subcategory-spezifischen Recent Items anordnen
        const animalsRecentItems = loadRecentItemsFromStorage('animals', selectedCategory?.slug, subcategorySlug);
        const arrangedAnimals = arrangeItemsWithRecent(filteredAnimals, animalsRecentItems);
        setRecentItems(animalsRecentItems); // State aktualisieren
        
        // Animals setzen
        setAnimals(arrangedAnimals);
        
        // Character-Context auf Subkategorie setzen
        setCharacterContext(subcategorySlug);
        
        // Content nach kurzer Verzögerung anzeigen
        setTimeout(() => {
          setIsContentStaged(true);
          setError(null);
        }, 100);
      } else {
        // Keine Tiere gefunden - leeres Array setzen
        setAnimals([]);
        setIsContentStaged(true);
        setError('Keine Tiere in dieser Kategorie gefunden.');
      }
    } catch (err) {
      console.error('Error loading animals:', err);
      setError('Fehler beim Laden der Tier-Einträge!');
      setAnimals([]);
      setIsContentStaged(true);
    } finally {
      setLoading(false);
    }
  };

  // Tier-Klick Handler mit Voice-Over und Abzeichen
  const handleAnimalClick = (animal) => {
    if (currentView === 'transitioning') return;
    
    // Stoppe vorheriges Audio
    if (window.currentAudio) {
      window.currentAudio.pause();
      window.currentAudio.currentTime = 0;
    }
    
    // Setze aktuell spielendes Tier
    setCurrentlyPlaying(animal.id);
    // HIERARCHISCH: Animal zu Animals Recent Items hinzufügen (bestimme Subcategory dynamisch)
    const currentSubcategory = animals.find(a => a.id === animal.id)?.category || 'unknown';
    addToRecent(animal.id, 'animals', selectedCategory?.slug, currentSubcategory);
    
    // Markiere als gehört (für Abzeichen) - mit Local Storage
    if (!playedAnimals.includes(animal.id)) {
      const newPlayedAnimals = [...playedAnimals, animal.id];
      setPlayedAnimals(newPlayedAnimals);
      savePlayedAnimalsToStorage(newPlayedAnimals);
    }
    
    // Audio abspielen
    if (animal.audio && animal.audio.path) {
      playAudio(`/${animal.audio.path}`);
    }
    
    // Reset currently playing nach Audio Ende
    setTimeout(() => {
      setCurrentlyPlaying(null);
    }, 5000); // Grober Schätzwert für Audio-Länge
  };

  // Zurück zu Hauptkategorien - VEREINFACHT
  const handleBackToCategories = () => {
    // States zurücksetzen
    setSelectedCategory(null);
    setSubcategories([]);
    setAnimals([]);
    setCharacterContext('idle');
    setClickedItemId(null);
    setCurrentView('main');
    
    // Kategorien neu laden mit aktuellen Recent Items
    loadCategories();
  };

  // Zurück zu Subkategorien von Animal-Ansicht - VEREINFACHT
  const handleBackToSubcategories = () => {
    setAnimals([]);
    setCurrentView('category');
    setCharacterContext(selectedCategory ? selectedCategory.slug : 'idle');
    
    // Subkategorien neu laden mit aktuellen Recent Items
    if (selectedCategory) {
      loadCategoryDetails(selectedCategory.slug);
    }
  };

  // Character Emotion-Change Handler
  const handleCharacterEmotionChange = (emotion) => {
    console.log(`Character emotion changed to: ${emotion}`);
    // Hier können später Sounds oder andere Effekte getriggert werden
  };

  // Scroll Handler für Scroll-Indikator
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  // Zufällige Richtung für ALLE Tiles gemeinsam
  const getRandomDirection = () => {
    const directions = ['down', 'up', 'left', 'right', 'up-left', 'up-right', 'down-left', 'down-right'];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  // Bestimme Animation-Mode für ein Tile
  const getAnimationMode = (itemId) => {
    if (currentView === 'transitioning') {
      if (clickedItemId === itemId) {
        return 'clicked';
      } else {
        // Alle anderen Tiles fliegen in die GLEICHE Richtung (CSS: fall-out-*)
        return `fall-out-${globalAnimationDirection}`;
      }
    } else if (currentView === 'category' && subcategories.length > 0 && selectedCategory) {
      // KORRIGIERT: Subkategorien fliegen alle aus der GLEICHEN Richtung rein
      return `fly-in-from-${globalAnimationDirection}`;
    } else if (currentView === 'animals' && animals.length > 0) {
      // KORRIGIERT: Tier-Einträge fliegen auch alle aus der GLEICHEN Richtung rein
      return `fly-in-from-${globalAnimationDirection}`;
    }
    // Normale Position für Hauptkategorien beim ersten Load
    return 'loaded';
  };

  // Initial Kategorien laden
  useEffect(() => {
    setIsContentStaged(false); // Start versteckt
    loadCategories();
    // Initial Animation nach kurzer Verzögerung
    setTimeout(() => {
      setCurrentView('main');
    }, 500);
  }, []);

  // Lade gespeicherte gehörte Tiere beim Start
  useEffect(() => {
    const savedPlayedAnimals = loadPlayedAnimalsFromStorage();
    setPlayedAnimals(savedPlayedAnimals);
    
    // HIERARCHISCH: Lade Initial Recent Items für Main-View
    const savedRecentItems = loadRecentItemsFromStorage('main');
    setRecentItems(savedRecentItems);
  }, []);

  // Kategorien, Subkategorien und Animals werden automatisch mit Recent Items angeordnet
  // beim Laden durch arrangeItemsWithRecent() - kein separates useEffect nötig

  // Loading State
  if (loading) {
    return (
      <div className="container">
        <Head>
          <title>Kinderlexikon - Lade Kategorien...</title>
          <meta name="description" content="Kinderlexikon für Vorschulkinder wird geladen" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        
        <Character 
          currentContext="idle"
          onEmotionChange={handleCharacterEmotionChange}
        />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container">
        <Head>
          <title>Kinderlexikon - Fehler</title>
          <meta name="description" content="Fehler beim Laden des Kinderlexikons" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="error-message">
          <h2>Oops! 😅</h2>
          <p>{error}</p>
          <button 
            onClick={loadCategories}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Nochmal versuchen
          </button>
        </div>
        
        <Character 
          currentContext="idle"
          onEmotionChange={handleCharacterEmotionChange}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>Kinderlexikon - Entdecke die Welt!</title>
        <meta name="description" content="Interaktives Kinderlexikon für Vorschulkinder (3-7 Jahre)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Character Section */}
      <div className="character-section">
        {/* Back Button im Character Panel */}
        {(selectedCategory || currentView === 'animals') && (
          <button 
            className="back-button"
            onClick={currentView === 'animals' ? handleBackToSubcategories : handleBackToCategories}
            title={currentView === 'animals' ? 'Zurück zu den Unterkategorien' : 'Zurück zu den Hauptkategorien'}
          >
          </button>
        )}
        
        <Character 
          currentContext={characterContext}
          onEmotionChange={handleCharacterEmotionChange}
        />
      </div>

      {/* Categories Section mit Scroll */}
      <div 
        className="categories-section"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Hauptkategorien-Ansicht */}
        {!selectedCategory && (
          <div className="tile-grid" style={{ opacity: isContentStaged ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            {categories.map((category, index) => (
              <CategoryTile
                key={category.id}
                category={category}
                onClick={handleCategoryClick}
                delay={index * 50}
                animationMode={getAnimationMode(category.id)}
              />
            ))}
          </div>
        )}

        {/* Subkategorien-Ansicht */}
        {selectedCategory && subcategories.length > 0 && currentView === 'category' && (
          <div className="tile-grid" style={{ opacity: isContentStaged ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            {subcategories.map((subcategory, index) => (
              <CategoryTile
                key={subcategory.id}
                category={subcategory}
                onClick={handleSubcategoryClick}
                delay={index * 50}
                animationMode={getAnimationMode(subcategory.id)}
              />
            ))}
          </div>
        )}

        {/* Tier-Einträge-Ansicht */}
        {currentView === 'animals' && animals.length > 0 && (
          <div className="tile-grid" style={{ opacity: isContentStaged ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            {animals.map((animal, index) => (
              <CategoryTile
                key={animal.id}
                category={{
                  id: animal.id,
                  name: animal.name,
                  slug: animal.slug,
                  image: animal.image,
                  audio: animal.audio
                }}
                onClick={handleAnimalClick}
                delay={index * 50}
                animationMode={getAnimationMode(animal.id)}
                isAnimal={true}
                isPlayed={playedAnimals.includes(animal.id)}
                isCurrentlyPlaying={currentlyPlaying === animal.id}
              />
            ))}
          </div>
        )}

        {/* Placeholder für leere Subkategorien */}
        {selectedCategory && subcategories.length === 0 && currentView === 'category' && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>
              Hier entstehen bald spannende Unterkategorien! 🚧
            </p>
          </div>
        )}
      </div>

      {/* Scroll Indikator */}
      <div className="scroll-indicator">
        <div 
          className="scroll-thumb" 
          style={{ 
            height: `${Math.max(15, scrollProgress)}%`,
            transform: `translateY(${scrollProgress * 0.8}%)`
          }}
        />
      </div>
    </div>
  );
} 