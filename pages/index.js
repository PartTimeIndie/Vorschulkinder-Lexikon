import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Character from '../components/Character';
import CategoryTile from '../components/CategoryTile';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';

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

  // Image Preloading State
  const [preloadedData, setPreloadedData] = useState(null);
  const [isPreloading, setIsPreloading] = useState(false);

  // Tile Pool System - 100 feste Tiles
  const TILE_POOL_SIZE = 100;
  const [tilePool, setTilePool] = useState(() => {
    // Initialisiere 100 leere Tiles
    return Array.from({ length: TILE_POOL_SIZE }, (_, index) => ({
      id: `tile-${index}`,
      isVisible: false,
      content: null,
      animationMode: null,
      isAnimal: false,
      isPlayed: false,
      isCurrentlyPlaying: false,
      onClick: null
    }));
  });

  // Zentraler Animation State
  const [currentGridAnimation, setCurrentGridAnimation] = useState('slideFromLeft');
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

  // Kategorien vom Backend laden mit zufälliger Animation
  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading categories...');
      
      // Zufällige Animation für neues Grid wählen
      const randomAnimation = animationManager.getRandomGridAnimation();
      setCurrentGridAnimation(randomAnimation);
      
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.categories) {
        console.log(`✅ Loaded ${data.categories.length} categories`);
        // HIERARCHISCH: Kategorien mit Main-Recent-Logic anordnen
        const mainRecentItems = loadRecentItemsFromStorage('main');
        const arrangedCategories = arrangeItemsWithRecent(data.categories, mainRecentItems);
        setRecentItems(mainRecentItems); // State aktualisieren
        
        setCategories(arrangedCategories);
        setError(null);
      } else {
        throw new Error('No categories found');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Fehler beim Laden der Kategorien. Bitte versuche es nochmal!');
      setCategories([]); // Explizit leeres Array setzen
    } finally {
      setLoading(false);
    }
  };

  // Spezifische Kategorie mit Subkategorien laden mit Animation
  const loadCategoryDetails = async (slug) => {
    try {
      // Nur neue Animation wählen wenn nicht schon von Navigation gesetzt
      if (!currentGridAnimation || currentGridAnimation === 'slideFromLeft') {
        const randomAnimation = animationManager.getRandomGridAnimation();
        setCurrentGridAnimation(randomAnimation);
      }
      
      const response = await fetch(`/api/categories/${slug}`);
      const data = await response.json();
      
      if (data.category) {
        setSelectedCategory(data.category);
        
        // HIERARCHISCH: Subkategorien mit Category-spezifischen Recent Items anordnen
        const subcats = data.category.subcategories || [];
        const categoryRecentItems = loadRecentItemsFromStorage('category', slug);
        const arrangedSubcats = arrangeItemsWithRecent(subcats, categoryRecentItems);
        setRecentItems(categoryRecentItems); // State aktualisieren
        
        setSubcategories(arrangedSubcats);
        setError(null);
      } else {
        throw new Error('Category not found');
      }
    } catch (err) {
      console.error('Error loading category details:', err);
      setError('Fehler beim Laden der Kategorie-Details!');
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

  // Image Preloading Funktion
  const preloadNextContent = async (slug, type = 'category') => {
    try {
      setIsPreloading(true);
      console.log(`🔄 Preloading ${type}: ${slug}`);
      
             let response;
       if (type === 'category') {
         response = await fetch(`/api/categories/${slug}`);
       } else if (type === 'animals') {
         response = await fetch(`/api/animals/category/${slug}`);
       }
      
      const data = await response.json();
      
      if (data) {
        setPreloadedData({ type, slug, data });
        console.log(`✅ Preloaded ${type} data:`, data);
        
        // Dynamische Host-Erkennung für mobile IP-Zugriffe
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const port = '5000';
        const tileSize = 180; // Tile-optimierte Größe
        const quality = 75; // Performance-optimierte Qualität
        const baseImageUrl = `${protocol}//${hostname}:${port}/images/`;
        
        // Preload Images mit Resize-Parametern
        const imagesToPreload = [];
        if (type === 'category' && data.category?.subcategories) {
          imagesToPreload.push(...data.category.subcategories.map(sub => 
            `${baseImageUrl}${sub.image.filename}?w=${tileSize}&h=${tileSize}&q=${quality}`
          ));
        } else if (type === 'animals' && data.animals) {
          imagesToPreload.push(...data.animals.map(animal => 
            `${baseImageUrl}${animal.image.filename}?w=${tileSize}&h=${tileSize}&q=${quality}`
          ));
        }
        
        // Promise.all für alle Bilder
        await Promise.all(imagesToPreload.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Auch bei Fehlern weitermachen
            img.src = src;
          });
        }));
        
        console.log(`🖼️ Preloaded ${imagesToPreload.length} images`);
      }
    } catch (error) {
      console.error('Preloading error:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  // Hauptkategorie angeklickt - MIT Image Preloading
  const handleCategoryClick = (category) => {
    if (currentView === 'transitioning') return; // Keine Klicks während Transition

    const direction = getRandomDirection();
    
    // SOFORT Image Preloading starten
    preloadNextContent(category.slug, 'category');
    
    // ===== BATCH ALLE STATE UPDATES IN EINEM CALL =====
    React.startTransition(() => {
      setClickedItemId(category.id);
      setGlobalAnimationDirection(direction);
      setCurrentView('transitioning');
    });
    
    // Neue zufällige Animation für das nächste Grid wählen
    const randomAnimation = animationManager.getRandomGridAnimation();
    setCurrentGridAnimation(randomAnimation);
    
    setCharacterContext(category.slug); // Character-Emotion sofort wechseln
    addToRecent(category.id, 'main'); // HIERARCHISCH: Zu Main Recent Items hinzufügen
    
    // Audio abspielen wenn vorhanden
    if (category.audio && category.audio.path) {
      playAudio(`/${category.audio.path}`);
    }
    
    // Nach Animation die vorgeladenen Daten verwenden
    setTimeout(() => {
      if (preloadedData && preloadedData.slug === category.slug && preloadedData.type === 'category') {
        // Verwende vorgeladene Daten
        const data = preloadedData.data;
        if (data.category) {
          setSelectedCategory(data.category);
          const subcats = data.category.subcategories || [];
          const categoryRecentItems = loadRecentItemsFromStorage('category', category.slug);
          const arrangedSubcats = arrangeItemsWithRecent(subcats, categoryRecentItems);
          setRecentItems(categoryRecentItems);
          setSubcategories(arrangedSubcats);
          setError(null);
        }
        setPreloadedData(null); // Reset nach Verwendung
      } else {
        // Fallback: Normale Ladung
        loadCategoryDetails(category.slug);
      }
      setCurrentView('category');
      setClickedItemId(null);
    }, 1800); // Warten bis Animationen fertig sind (1.8s)
  };

  // Subkategorie angeklickt - MIT Image Preloading
  const handleSubcategoryClick = (subcategory) => {
    if (currentView === 'transitioning') return; // Keine Klicks während Transition

    console.log(`🔥 SUBCATEGORY CLICKED: ${subcategory.name} (ID: ${subcategory.id})`);

    const direction = getRandomDirection();
    console.log(`🎯 Generated direction: ${direction}`);

    // SOFORT Image Preloading für Tiere starten
    preloadNextContent(subcategory.slug, 'animals');

    // ===== BATCH ALLE STATE UPDATES IN EINEM CALL =====
    React.startTransition(() => {
      setClickedItemId(subcategory.id);
      setGlobalAnimationDirection(direction);
      setCurrentView('transitioning');
    });
    
    console.log(`🔄 Batched state update completed`);

    // Neue zufällige Animation für das nächste Grid wählen
    const randomAnimation = animationManager.getRandomGridAnimation();
    setCurrentGridAnimation(randomAnimation);
    
    setCharacterContext(subcategory.slug);
    addToRecent(subcategory.id, 'category', selectedCategory?.slug); // HIERARCHISCH: Zu Category Recent Items
    
    // Audio abspielen wenn vorhanden
    if (subcategory.audio && subcategory.audio.path) {
      playAudio(`/${subcategory.audio.path}`);
    }
    
    // Nach Animation die vorgeladenen Tier-Daten verwenden
    setTimeout(() => {
      if (preloadedData && preloadedData.slug === subcategory.slug && preloadedData.type === 'animals') {
        // Verwende vorgeladene Tier-Daten
        const data = preloadedData.data;
        if (data.animals) {
          const animalRecentItems = loadRecentItemsFromStorage('animals', selectedCategory?.slug, subcategory.slug);
          const arrangedAnimals = arrangeItemsWithRecent(data.animals, animalRecentItems);
          setRecentItems(animalRecentItems);
          setAnimals(arrangedAnimals);
          setError(null);
        }
        setPreloadedData(null); // Reset nach Verwendung
      } else {
        // Fallback: Normale Ladung
        loadAnimalsForCategory(subcategory.slug);
      }
      setCurrentView('animals'); // Wechsel zu animals view
      setClickedItemId(null);
    }, 1800);
  };

  // Tiere für spezifische Subkategorie laden - FIXED API CALL
  const loadAnimalsForCategory = async (subcategorySlug) => {
    try {
      setLoading(true);
      
      // FIXED: Verwende die Subkategorie-Slug direkt für das Filtering
      const response = await fetch(`/api/animals/category/${subcategorySlug}`);
      const data = await response.json();
      
      if (data.animals && data.animals.length > 0) {
        // HIERARCHISCH: Animals mit Subcategory-spezifischen Recent Items anordnen
        const animalsRecentItems = loadRecentItemsFromStorage('animals', selectedCategory?.slug, subcategorySlug);
        const arrangedAnimals = arrangeItemsWithRecent(data.animals, animalsRecentItems);
        setRecentItems(animalsRecentItems); // State aktualisieren
        
        // Animals setzen
        setAnimals(arrangedAnimals);
        
        setError(null);
      } else {
        // Keine Tiere gefunden - leeres Array setzen
        setAnimals([]);
        setError('Keine Tiere in dieser Kategorie gefunden.');
        
        console.log(`ℹ️ Keine Tiere für Subkategorie '${subcategorySlug}' gefunden`);
      }
    } catch (err) {
      console.error('Error loading animals:', err);
      setError('Fehler beim Laden der Tier-Einträge!');
      setAnimals([]);
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
    
    // Setze aktuell spielendes Tier (ohne Verzögerung für sofortige grüne Outline)
    console.log(`🎵 OLD currentlyPlaying: ${currentlyPlaying}, NEW: ${animal.id}`);
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
      
      // Reset currently playing wenn Audio beendet ist
      if (window.currentAudio) {
        window.currentAudio.addEventListener('ended', () => {
          setCurrentlyPlaying(null);
        }, { once: true }); // Event nur einmal verwenden
      }
    } else {
      // Kein Audio vorhanden - nach kurzer Zeit reset
      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, 2000);
    }
  };

  // Zurück zu Hauptkategorien mit Animation
  const handleBackToCategories = () => {
    console.log('🔙 Back to categories clicked');
    
    if (currentView === 'transitioning') return; // Keine doppelten Klicks
    
    // 1. PHASE: Nur Animation triggern - KEINE Daten ändern!
    const direction = getRandomDirection();
    
    React.startTransition(() => {
      setClickedItemId(null); // Kein spezifisches geklicktes Tile
      setGlobalAnimationDirection(direction);
      setCurrentView('transitioning');
    });
    
    // Neue zufällige Animation für das nächste Grid wählen
    const randomAnimation = animationManager.getRandomGridAnimation();
    setCurrentGridAnimation(randomAnimation);
    
    // 2. PHASE: Nach Fly-Out Animation ERST DANN Daten wechseln
    setTimeout(() => {
      console.log('🔄 Starting data transition after fly-out');
      
      React.startTransition(() => {
        // ERST Daten clearen 
        setSelectedCategory(null);
        setSubcategories([]);
        setAnimals([]);
        setCharacterContext('idle');
        setCurrentlyPlaying(null); // Reset grüne Outline
        
        // DANN View wechseln
        setCurrentView('main');
      });
      
      // Neue Kategorien laden NACH dem View-Wechsel
      setTimeout(() => {
        console.log('📝 Loading categories for main view');
        loadCategories();
      }, 50); // Sehr kurze Verzögerung für View-Update
    }, 1800); // Warten bis Fly-Out komplett fertig ist
  };

  // Zurück zu Subkategorien von Animal-Ansicht mit Animation
  const handleBackToSubcategories = () => {
    console.log('🔙 Back to subcategories clicked');
    
    if (currentView === 'transitioning') return; // Keine doppelten Klicks
    
    // 1. PHASE: Nur Animation triggern - KEINE Daten ändern!
    const direction = getRandomDirection();
    
    React.startTransition(() => {
      setClickedItemId(null); // Kein spezifisches geklicktes Tile
      setGlobalAnimationDirection(direction);
      setCurrentView('transitioning');
    });
    
    // Neue zufällige Animation für das nächste Grid wählen
    const randomAnimation = animationManager.getRandomGridAnimation();
    setCurrentGridAnimation(randomAnimation);
    
    // 2. PHASE: Nach Fly-Out Animation ERST DANN Daten wechseln
    setTimeout(() => {
      console.log('🔄 Starting data transition after fly-out (to subcategories)');
      
      React.startTransition(() => {
        // ERST Daten clearen
        setAnimals([]);
        setCurrentlyPlaying(null); // Reset grüne Outline beim Zurück zu Subcategories
        setCharacterContext(selectedCategory ? selectedCategory.slug : 'idle');
        
        // DANN View wechseln
        setCurrentView('category');
      });
      
      // Subkategorien neu laden NACH dem View-Wechsel
      setTimeout(() => {
        if (selectedCategory) {
          console.log('📝 Loading subcategories for:', selectedCategory.slug);
          loadCategoryDetails(selectedCategory.slug);
        }
      }, 50); // Sehr kurze Verzögerung für View-Update
    }, 1800); // Warten bis Fly-Out komplett fertig ist
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
        console.log(`🎯 CLICKED TILE: ${itemId} (matches clickedItemId: ${clickedItemId})`);
        return 'clicked';
      } else {
        console.log(`🚀 FLY OUT TILE: ${itemId} (clickedItemId: ${clickedItemId}, direction: ${globalAnimationDirection})`);
        return `fall-out-${globalAnimationDirection}`;
      }
    }
    // Normale Position - keine individuelle Animation
    return null;
  };

  // Tile Pool Management - Aktualisiere nur Inhalte
  const updateTilePool = (items) => {
    // SPEZIAL: Während Transition nur Animation-Modi updaten, KEINE Content-Changes!
    if (currentView === 'transitioning') {
      console.log('🎭 Updating ONLY animation modes during transition');
      setTilePool(prev => {
        const updated = [...prev];
        
        // Nur Animation-Modi updaten, Content und onClick NICHT ändern!
        updated.forEach(tile => {
          if (tile.isVisible && tile.content) {
            const newAnimationMode = getAnimationMode(tile.content.id);
            if (tile.animationMode !== newAnimationMode) {
              tile.animationMode = newAnimationMode;
              console.log(`🎯 Updated animation for ${tile.content.name}: ${newAnimationMode}`);
            }
          }
        });
        
        return updated;
      });
      return;
    }
    
    setTilePool(prev => {
      const updated = [...prev];
      
      // RESET: Alle Tiles komplett zurücksetzen
      updated.forEach(tile => {
        tile.isVisible = false;
        tile.content = null;
        tile.animationMode = null;
        tile.onClick = null;
        tile.isAnimal = false;
        tile.isPlayed = false;
        tile.isCurrentlyPlaying = false;
      });
      
      // Nur die benötigten Tiles aktivieren und mit Inhalt füllen
      items.forEach((item, index) => {
        if (index < TILE_POOL_SIZE) {
          const tile = updated[index];
          tile.isVisible = true;
          tile.content = item;
          tile.animationMode = getAnimationMode(item.id);
          
          // Click Handler je nach currentView setzen
          if (currentView === 'main') {
            tile.onClick = handleCategoryClick;
            tile.isAnimal = false;
            tile.isPlayed = false;
            tile.isCurrentlyPlaying = false;
          } else if (currentView === 'category') {
            tile.onClick = handleSubcategoryClick;
            tile.isAnimal = false;
            tile.isPlayed = false;
            tile.isCurrentlyPlaying = false;
          } else if (currentView === 'animals') {
            tile.onClick = handleAnimalClick;
            tile.isAnimal = true;
            tile.isPlayed = playedAnimals.includes(item.id);
            tile.isCurrentlyPlaying = currentlyPlaying === item.id;
            
            // Debug für grüne Outline
            if (tile.isCurrentlyPlaying) {
              console.log(`🟢 TILE: '${item.name}' ist currentlyPlaying (currentlyPlaying=${currentlyPlaying}, item.id=${item.id})`);
            }
          }
        }
      });
      
      console.log(`🎯 Tile pool updated: ${items.length} visible tiles, view: ${currentView}`);
      return updated;
    });
  };

  // Zentrale Funktion: Welche Items sollen aktuell gerendert werden?
  const getCurrentItems = () => {
    if (currentView === 'main' || (!selectedCategory && currentView !== 'animals')) {
      return categories;
    } else if (currentView === 'category' || (selectedCategory && subcategories.length > 0 && currentView === 'transitioning')) {
      return subcategories;
    } else if (currentView === 'animals') {
      // Animals in CategoryTile-Format konvertieren
      return animals.map(animal => ({
        id: animal.id,
        name: animal.name,
        slug: animal.slug,
        image: animal.image,
        audio: animal.audio
      }));
    }
    return [];
  };

  // Zentrale Funktion: Soll Grid-Animation laufen?
  const shouldUseGridAnimation = () => {
    return currentView !== 'transitioning';
  };

  // Tile Pool aktualisieren wenn sich Inhalte ändern
  useEffect(() => {
    const currentItems = getCurrentItems();
    console.log(`🔄 Updating tile pool for ${currentView}:`, currentItems.length, 'items', currentItems);
    
    // Nur updaten wenn wir tatsächlich Items haben oder explizit leeren wollen
    if (currentItems.length > 0 || (currentView === 'main' && categories.length === 0)) {
      updateTilePool(currentItems);
    }
  }, [categories, subcategories, animals, currentView, playedAnimals, currentlyPlaying, clickedItemId, globalAnimationDirection]);

  // Debug useEffect für Back Navigation
  useEffect(() => {
    console.log(`📊 State Update - View: ${currentView}, Categories: ${categories.length}, Subcategories: ${subcategories.length}, Animals: ${animals.length}`);
    console.log(`🎯 Visible tiles: ${tilePool.filter(t => t.isVisible).length}`);
    tilePool.filter(t => t.isVisible).forEach((tile, index) => {
      console.log(`  Tile ${index}: ${tile.content?.name || 'No name'}`);
    });
  }, [currentView, categories, subcategories, animals, tilePool]);

  // Initial Kategorien laden
  useEffect(() => {
    loadCategories();
    setCurrentView('main');
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

  return (
    <div className="container">
      <Head>
        <title>Kinderlexikon - Entdecke die Welt!</title>
        <meta name="description" content="Interaktives Kinderlexikon für Vorschulkinder (3-7 Jahre)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Character Section - IMMER gerendert */}
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
          key="main-character" // Fester Key - wird nur EINMAL gemountet
          currentContext={loading || error ? 'idle' : characterContext}
          onEmotionChange={handleCharacterEmotionChange}
        />
      </div>

      {/* Categories Section mit Scroll */}
      <div 
        className="categories-section"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Loading State */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
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
        )}

        {/* Normal Content - nur wenn nicht loading/error */}
        {!loading && !error && (
          <>
            {/* TILE POOL GRID - 100 feste DOM-Elemente, nur Inhalte wechseln */}
            {shouldUseGridAnimation() ? (
              <motion.div 
                className="tile-grid"
                variants={animationManager.getGridVariants(currentGridAnimation)}
                initial="hidden"
                animate="visible"
                style={{ 
                  opacity: tilePool.some(tile => tile.isVisible) ? 1 : 0,
                  transition: 'opacity 0.1s ease' 
                }}
              >
                {tilePool.map((poolTile, index) => (
                  <CategoryTile
                    key={poolTile.id} // Feste IDs - niemals ändern!
                    poolTile={poolTile}
                    delay={poolTile.isVisible ? animationManager.getTileDelay(
                      tilePool.filter((t, i) => t.isVisible && i <= index).length - 1, 
                      tilePool.filter(t => t.isVisible).length, 
                      currentGridAnimation
                    ) : 0}
                  />
                ))}
              </motion.div>
            ) : (
              <div 
                className="tile-grid"
                style={{ 
                  opacity: tilePool.some(tile => tile.isVisible) ? 1 : 0,
                  transition: 'opacity 0.1s ease' 
                }}
              >
                {tilePool.map((poolTile) => (
                  <CategoryTile
                    key={poolTile.id} // Feste IDs - niemals ändern!
                    poolTile={poolTile}
                    delay={0}
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
          </>
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