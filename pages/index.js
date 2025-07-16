import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Character from '../components/Character';
import CategoryTile from '../components/CategoryTile';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';
// REMOVE: import { AnimatePresence } from 'framer-motion';
import { getCachedAsset, getOfflineAssetFileList, getCachedJson, getCachedAssetAsBlob, getCachedAudioAsBlob } from '../utils/assetCache';

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
  const [playedAnimals, setPlayedAnimals] = useState([]); 
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null); 
  const scrollContainerRef = useRef(null);
  const [showGrid, setShowGrid] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [allImagesLoaded, setAllImagesLoaded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [buttonsVisible, setButtonsVisible] = useState(true);

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

  // Hilfsfunktion: Setzt alle animationModes im tilePool auf null
  function resetAllTileAnimations() {
    setTilePool(prev => prev.map(tile => ({
      ...tile,
      animationMode: null
    })));
  }

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

  // Utility-Funktionen für zufällige Anordnung
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Entferne die Funktion addToRecent und alle Aufrufe von setRecentItems, die nicht mehr benötigt werden

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
      
      // Statt API: Lade alle Kategorien aus public/kategorien/tiere.json (oder weitere, falls vorhanden)
      const data = await getCachedJson('/kategorien/tiere.json');
      // Passe die Struktur an, falls nötig (z.B. data.categories -> [data] falls Einzeldatei)
      if (data) {
        const categories = Array.isArray(data) ? data : [data];
        setCategories(categories);
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
      
      // Statt API: Lade Kategorie-Details aus public/kategorien/[slug].json
      const data = await getCachedJson(`/kategorien/${slug}.json`);
      if (data) {
        setSelectedCategory(data);
        // HIERARCHISCH: Subkategorien mit Category-spezifischen Recent Items anordnen
        const subcats = data.subcategories || [];
        setSubcategories(subcats);
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
  const playAudio = async (audioPath) => {
    if (!audioPath || audioPath === 'null' || audioPath === '/null') {
      console.warn('[AUDIO] Überspringe ungültigen Audio-Pfad:', audioPath);
      return;
    }
    try {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio.currentTime = 0;
        if (window.currentAudio._blobUrl) {
          URL.revokeObjectURL(window.currentAudio._blobUrl);
        }
      }
      let audio;
      let blobUrl = null;
      try {
        const blob = await getCachedAudioAsBlob(audioPath);
        if (blob) {
          blobUrl = URL.createObjectURL(blob);
          audio = new Audio(blobUrl);
          audio._blobUrl = blobUrl;
        } else {
          audio = new Audio(audioPath);
        }
      } catch (e) {
        audio = new Audio(audioPath);
      }
      window.currentAudio = audio;
      audio.play().catch(err => {
        console.log('Audio autoplay verhindert:', err);
      });
      audio.addEventListener('ended', () => {
        if (window.currentAudio === audio) {
          if (audio._blobUrl) URL.revokeObjectURL(audio._blobUrl);
          window.currentAudio = null;
        }
      });
    } catch (error) {
      console.error('Audio-Fehler:', error);
    }
  };

  // Image Preloading Funktion
  const preloadNextContent = async (slug, type = 'category') => {
    try {
      setIsPreloading(true);
      console.log(`🔄 Preloading ${type}: ${slug}`);
      
      let data;
      // Statt API: Lade Kategorie-Details für Preloading
      if (type === 'category') {
        data = await getCachedJson(`/kategorien/${slug}.json`);
      } else if (type === 'animals') {
        // Lade alle Tiere und filtere nach Kategorie
        data = await getCachedJson('/eintraege/tierEintraege.json');
      }
      if (type === 'animals') {
        // Filtere Tiere nach Kategorie
        data.animals = data.tiere.filter(tier => tier.categories.includes(slug));
      }
      
      if (data) {
        setPreloadedData({ type, slug, data });
        console.log(`✅ Preloaded ${type} data:`, data);
        
        // Dynamische Host-Erkennung für mobile IP-Zugriffe
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const port = '5000';
        const tileSize = 300; // Tile-optimierte Größe - höhere Qualität
        const quality = 75; // Performance-optimierte Qualität
        const baseImageUrl = `${protocol}//${hostname}:${port}/images/`;
        
        // Preload Images mit LowRes und Fallback
        const imagesToPreload = [];
        if (type === 'category' && data.subcategories) {
          imagesToPreload.push(...data.subcategories.map(sub => `/kategorien/images/lowres/${sub.image.filename}`));
        } else if (type === 'animal' && data.image) {
          imagesToPreload.push(`/images/lowres/${data.image.filename}`);
        }
        // Promise.all für alle Bilder mit Fallback auf Original
        await Promise.all(imagesToPreload.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => {
              // Fallback to original image if low-res not found
              const fallbackSrc = src.replace('/lowres/', '/');
              if (fallbackSrc !== src) {
                const fallbackImg = new Image();
                fallbackImg.onload = () => resolve();
                fallbackImg.onerror = () => resolve();
                fallbackImg.src = fallbackSrc;
              } else {
                resolve();
              }
            };
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

  // Hilfsfunktion: Preload mehrere Bilder, gibt Promise zurück
  async function preloadImages(urls) {
    await Promise.all(urls.map(url => {
      if (!url || url === 'null' || url === '/null') {
        console.warn('[PRELOAD] Überspringe ungültige Bild-URL:', url);
        return Promise.resolve();
      }
      // Prüfe, ob schon im Cache
      const cacheKey = `imgcache_${url}_`;
      if (localStorage.getItem(cacheKey)) return Promise.resolve();
      // Sonst Bild laden
      return fetch(url)
        .then(r => r.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            try {
              localStorage.setItem(cacheKey, reader.result);
            } catch {}
            resolve();
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
    }));
  }

  // Hilfsfunktion: Sammle alle Bild-URLs für Kategorie/Subkategorie/Tiere
  function getAllImageUrlsForCategory(category, lowRes = true) {
    if (!category?.subcategories) return [];
    return category.subcategories.map(sub => {
      const url = lowRes ? `/kategorien/images/lowres/${sub.image.filename}` : `/kategorien/images/${sub.image.filename}`;
      if (!sub.image || !sub.image.filename) {
        console.warn('[IMGURL] Subkategorie ohne Bild:', sub);
        return null;
      }
      return url;
    }).filter(Boolean);
  }
  // Für Tiere/Einträge IMMER /images/ verwenden
  function getAllImageUrlsForAnimals(animals, lowRes = true) {
    return animals.map(animal => {
      const url = lowRes ? `/images/lowres/${animal.image.filename}` : `/images/${animal.image.filename}`;
      if (!animal.image || !animal.image.filename) {
        console.warn('[IMGURL] Tier ohne Bild:', animal);
        return null;
      }
      return url;
    }).filter(Boolean);
  }

  // Hilfsfunktion: Warte, bis alle Base64-Bilder wirklich im <img> geladen sind
  function waitForAllImagesToLoad(imageSrcs) {
    return Promise.all(
      imageSrcs.map(src => new Promise(resolve => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = src;
      }))
    );
  }

  // Hauptkategorie angeklickt - MIT Image Preloading
  const handleCategoryClick = async (category) => {
    if (currentView === 'transitioning') return;
    setCurrentView('transitioning');
    setClickedItemId(category.id);
    setGlobalAnimationDirection(getRandomDirection());
    setCurrentGridAnimation(animationManager.getRandomGridAnimation());
    setCharacterContext(category.slug);
    if (category.audio && category.audio.path) playAudio(`/${category.audio.path}`);

    // 1. Lade Daten und starte Preloading SOFORT
    const data = await getCachedJson(`/kategorien/${category.slug}.json`);
    const imageUrls = getAllImageUrlsForCategory(data.category);
    const preloadPromise = preloadImages(imageUrls);

    // 2. Animation abwarten
    await new Promise(resolve => setTimeout(resolve, 1800));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    resetAllTileAnimations();

    // 3. Warte auf Preloading (falls noch nicht fertig)
    await preloadPromise;

    // 4. Pool-Update etc.
    setSelectedCategory(data);
    const subcats = data.subcategories || [];
    setSubcategories(subcats);
    setError(null);
    setCurrentView('category');
    setClickedItemId(null);
    setAnimationKey(k => k + 1);

    // Warte, bis alle Bilder wirklich geladen sind
    const base64s = subcats
      .map(sub => {
        const url = getAllImageUrlsForCategory({ subcategories: [sub] })[0];
        if (!url || url === 'null' || url === '/null' || url === undefined) return null;
        const cacheKey = `imgcache_${url}_`;
        return localStorage.getItem(cacheKey);
      })
      .filter(Boolean); // entfernt null/undefined
    setAllImagesLoaded(false);
    waitForAllImagesToLoad(base64s).then(() => setAllImagesLoaded(true));
  };

  // Subkategorie angeklickt - MIT Image Preloading
  const handleSubcategoryClick = async (subcategory) => {
    if (currentView === 'transitioning') return;
    setCurrentView('transitioning');
    setClickedItemId(subcategory.id);
    setGlobalAnimationDirection(getRandomDirection());
    setCurrentGridAnimation(animationManager.getRandomGridAnimation());
    setCharacterContext(subcategory.slug);
    if (subcategory.audio && subcategory.audio.path) playAudio(`/${subcategory.audio.path}`);

    // 1. Lade Daten und starte Preloading SOFORT
    const data = await getCachedJson('/eintraege/tierEintraege.json');
    data.animals = data.tiere.filter(tier => tier.categories.includes(subcategory.slug));
    const imageUrls = getAllImageUrlsForAnimals(data.animals || []);
    const preloadPromise = preloadImages(imageUrls);

    // 2. Animation abwarten
    await new Promise(resolve => setTimeout(resolve, 1800));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    resetAllTileAnimations();

    // 3. Warte auf Preloading (falls noch nicht fertig)
    await preloadPromise;

    // 4. Pool-Update etc.
    setAnimals(data.animals || []);
    setError(null);
    setCurrentView('animals');
    setClickedItemId(null);
    setAnimationKey(k => k + 1);
  };

  // Tiere für spezifische Subkategorie laden - FIXED API CALL
  const loadAnimalsForCategory = async (subcategorySlug) => {
    try {
      setLoading(true);
      
      // Statt API: Lade Tiere für spezifische Subkategorie
      const data = await getCachedJson('/eintraege/tierEintraege.json');
      data.animals = data.tiere.filter(tier => tier.categories.includes(subcategorySlug));
      
      if (data.animals && data.animals.length > 0) {
        // Animals setzen (in JSON-Reihenfolge)
        setAnimals(data.animals);
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
  const handleBackToCategories = async () => {
    if (currentView === 'transitioning') return;
    setCurrentView('transitioning');
    setClickedItemId(null);
    setGlobalAnimationDirection(getRandomDirection());
    setCurrentGridAnimation(animationManager.getRandomGridAnimation());

    await new Promise(resolve => setTimeout(resolve, 1800));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    resetAllTileAnimations();

    setSelectedCategory(null);
    setSubcategories([]);
    setAnimals([]);
    setCharacterContext('idle');
    setCurrentlyPlaying(null);
    setCurrentView('main');
    await loadCategories();
    setAnimationKey(k => k + 1); // AnimationKey nach Pool-Update erhöhen
  };

  // Zurück zu Subkategorien von Animal-Ansicht mit Animation
  const handleBackToSubcategories = async () => {
    if (currentView === 'transitioning') return;
    setCurrentView('transitioning');
    setClickedItemId(null);
    setGlobalAnimationDirection(getRandomDirection());
    setCurrentGridAnimation(animationManager.getRandomGridAnimation());

    await new Promise(resolve => setTimeout(resolve, 1800));
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    resetAllTileAnimations();

    setIsGridVisible(false); // Grid sofort unsichtbar machen

    setAnimals([]);
    setCurrentlyPlaying(null);
    setCharacterContext(selectedCategory ? selectedCategory.slug : 'idle');
    setCurrentView('category');
    let preloadPromise = Promise.resolve();
    if (selectedCategory) {
      // Statt API: Lade Kategorie-Details für Back-Navigation
      const data = await getCachedJson(`/kategorien/${selectedCategory.slug}.json`);
      const imageUrls = getAllImageUrlsForCategory(data);
      preloadPromise = preloadImages(imageUrls);
      await loadCategoryDetails(selectedCategory.slug);
    }
    setTimeout(async () => {
      await preloadPromise;
      setAnimationKey(k => k + 1);
      setIsGridVisible(true);
    }, 0);
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
      // 1. Mark all tiles as not updated
      updated.forEach(tile => { tile._updated = false; });
      // 2. Update or reuse tiles for new items
      items.forEach((item, index) => {
        if (index < TILE_POOL_SIZE) {
          const tile = updated[index];
          const prevContentId = tile.content?.id;
          if (tile.isVisible && prevContentId === item.id) {
            // Only update animationMode and other dynamic fields
            // Debug: Reusing tile
            if (index < 5) console.log(`[POOL] REUSE tile-${index}: contentId=${item.id}`);
            tile.animationMode = getAnimationMode(item.id);
            tile.onClick =
              currentView === 'main' ? handleCategoryClick :
              currentView === 'category' ? handleSubcategoryClick :
              currentView === 'animals' ? handleAnimalClick : null;
            tile.isAnimal = currentView === 'animals';
            tile.isPlayed = currentView === 'animals' ? playedAnimals.includes(item.id) : false;
            tile.isCurrentlyPlaying = currentView === 'animals' ? currentlyPlaying === item.id : false;
            tile._updated = true;
          } else {
            // Debug: Assigning new content to tile
            if (index < 5) console.log(`[POOL] ASSIGN tile-${index}: contentId=${item.id} (was ${prevContentId})`);
            tile.isVisible = true;
            tile.content = item;
            tile.animationMode = getAnimationMode(item.id);
            tile.onClick =
              currentView === 'main' ? handleCategoryClick :
              currentView === 'category' ? handleSubcategoryClick :
              currentView === 'animals' ? handleAnimalClick : null;
            tile.isAnimal = currentView === 'animals';
            tile.isPlayed = currentView === 'animals' ? playedAnimals.includes(item.id) : false;
            tile.isCurrentlyPlaying = currentView === 'animals' ? currentlyPlaying === item.id : false;
            tile._updated = true;
          }
        }
      });
      // 3. Hide tiles that are not used
      updated.forEach((tile, index) => {
        if (!tile._updated) {
          if (index < 5) console.log(`[POOL] RESET tile-${index}: was contentId=${tile.content?.id}`);
          tile.isVisible = false;
          tile.content = null;
          tile.animationMode = null;
          tile.onClick = null;
          tile.isAnimal = false;
          tile.isPlayed = false;
          tile.isCurrentlyPlaying = false;
        }
        delete tile._updated;
      });
      // Only keep this summary log for pool
      console.log(`🎯 Tile pool updated: ${items.length} visible tiles, view: ${currentView}`);
      return updated;
    });
  };

  // Zentrale Funktion: Welche Items sollen aktuell gerendert werden?
  const getCurrentItems = () => {
    if (currentView === 'main' || (!selectedCategory && currentView !== 'animals')) {
      // Always use the full main category data for the main tile
      if (categories.length > 0) {
        // Find the main category (e.g., by slug or id)
        const mainCat = categories.find(cat => cat.slug === 'tiere' || cat.id === 'cat_001');
        if (mainCat) {
          // Just return the mainCat; do not fetch synchronously
          return [mainCat];
        }
      }
      return categories;
    } else if (currentView === 'category' || (selectedCategory && subcategories.length > 0 && currentView === 'transitioning')) {
      return subcategories;
    } else if (currentView === 'animals') {
      // Animals in CategoryTile-Format konvertieren
      const mapped = animals.map(animal => {
        console.log('[DEBUG] Animal for tile:', animal);
        if (!animal.image || !animal.image.filename) {
          console.warn('[DEBUG] Animal missing image or filename:', animal);
        }
        return {
          id: animal.id,
          name: animal.name,
          slug: animal.slug,
          image: animal.image,
          audio: animal.audio
        };
      });
      return mapped;
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
  }, []);

  // Kategorien, Subkategorien und Animals werden automatisch mit Recent Items angeordnet
  // beim Laden durch arrangeItemsWithRecent() - kein separates useEffect nötig

  // Fullscreen logic
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const fullscreenChangeHandler = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', fullscreenChangeHandler);
    return () => {
      document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('webkitfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('mozfullscreenchange', fullscreenChangeHandler);
      document.removeEventListener('MSFullscreenChange', fullscreenChangeHandler);
    };
  }, []);

  useEffect(() => {
    const shouldShow = selectedCategory || currentView === 'animals';
    if (shouldShow !== showBackButton) {
      setButtonsVisible(false); // fade out all
      setTimeout(() => {
        setShowBackButton(shouldShow); // update layout
        setButtonsVisible(true); // fade in all
      }, 450); // match CSS transition (was 250)
    }
    // eslint-disable-next-line
  }, [selectedCategory, currentView]);

  const [downloadProgress, setDownloadProgress] = useState({ total: 0, done: 0, status: 'idle' });
  const [downloadNotification, setDownloadNotification] = useState(null);

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('klex_download_progress');
      if (saved) setDownloadProgress(JSON.parse(saved));
    }
  }, []);

  // Persist progress to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('klex_download_progress', JSON.stringify(downloadProgress));
    }
  }, [downloadProgress]);

  // Download all offline asset files for offline use
  const handleDownloadAllAssets = async () => {
    setDownloadNotification('Download gestartet ...');
    setDownloadProgress({ total: 0, done: 0, status: 'preparing' });
    try {
      // Fetch the offline asset file list
      const assetUrls = await getOfflineAssetFileList();
      setDownloadProgress({ total: assetUrls.length, done: 0, status: 'downloading' });
      let done = 0;
      for (const url of assetUrls) {
        try {
          await getCachedAsset(url);
        } catch (e) {
          // Ignore individual errors, continue
        }
        done++;
        setDownloadProgress(prev => ({ ...prev, done, status: 'downloading' }));
      }
      setDownloadProgress(prev => ({ ...prev, done: prev.total, status: 'done' }));
      setDownloadNotification('Alle Bilder und Audios sind jetzt offline verfügbar!');
      setTimeout(() => setDownloadNotification(null), 3500);
    } catch (e) {
      setDownloadProgress({ total: 0, done: 0, status: 'error' });
      setDownloadNotification('Fehler beim Download. Bitte versuche es erneut.');
      setTimeout(() => setDownloadNotification(null), 3500);
    }
  };

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
        <div className={`character-buttons-row${!buttonsVisible ? ' buttons-fade-out' : ''}`}>
          {showBackButton && (
            <button
              className="back-button"
              onClick={currentView === 'animals' ? handleBackToSubcategories : handleBackToCategories}
              title={currentView === 'animals' ? 'Zurück zu den Unterkategorien' : 'Zurück zu den Hauptkategorien'}
            >
              <img src="/websiteBaseImages/back button.png" alt="Zurück" />
            </button>
          )}
          <button
            className="fullscreen-button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Vollbildmodus verlassen' : 'Vollbildmodus aktivieren'}
          >
            <img src={isFullscreen ? "/websiteBaseImages/closeButton.png" : "/websiteBaseImages/Fullscreen.png"} alt={isFullscreen ? "Schließen" : "Fullscreen"} />
          </button>
          <button
            className="info-button"
            onClick={() => setShowInfo(true)}
            title="Info über das Lexikon"
          >
            <img src="/websiteBaseImages/info.png" alt="Info" />
          </button>
        </div>
        <Character 
          key="main-character" // Fester Key - wird nur EINMAL gemountet
          currentContext={loading || error ? 'idle' : characterContext}
          onEmotionChange={handleCharacterEmotionChange}
        />
        {/* Info Overlay Modal */}
        {showInfo && (
          <div className="info-overlay-modal">
            <div className="info-overlay-content">
              <button className="info-overlay-close" onClick={() => setShowInfo(false)} title="Schließen">×</button>
              <h2>Warum ich dieses Kinderlexikon gemacht habe</h2>
              <p>
                Ich habe dieses Kinderlexikon für meine eigenen Kinder erstellt, weil sie ein großes Interesse an Tieren und Wissen im Allgemeinen haben. Leider haben wir bisher kein Lexikon gefunden, das auch für Kinder geeignet ist, die noch nicht lesen können. Deshalb habe ich angefangen, ein interaktives, gesprochenes Lexikon zu entwickeln – mit Bildern, einfacher Sprache und Audiounterstützung.<br/><br/>
                Derzeit gibt es nur die Kategorie „Tiere“, aber wenn meine Kinder oder auch andere Kinder Interesse an weiteren Kategorien haben, würde ich das Lexikon gerne erweitern. Ihr könnt mir gerne mitteilen, welche Themen ihr euch wünscht – ich freue mich über Vorschläge!<br/><br/>
                Jede neue Hauptkategorie kostet mich jedoch rund 50 €, da ich die Bilder, Texte und Voiceovers mithilfe von KI generieren lasse. Diese Kosten kann ich aktuell nicht selbst tragen. Falls ihr das Projekt unterstützen möchtet, schreibt mir gerne eine E-Mail an <b>niki@parttimeindie.com</b>. Ich freue mich über jede Nachricht und wir können dann gerne besprechen, wie ihr das Projekt unterstützen könnt.<br/><br/>
                Mein Ziel ist es, ein richtiges Lexikon für Kinder zu schaffen – zugänglich, unterhaltsam und kindgerecht, auch für die Jüngsten.<br/><br/>
                Auch eine Übersetzung in andere Sprachen ist geplant. Dafür müsste ich jedoch noch zusätzliche Entwicklungszeit investieren, um den Support dafür technisch besser umzusetzen. Falls daran Interesse besteht, könnten wir gerne darüber sprechen.<br/><br/>
                Wenn ihr mich zusätzlich unterstützen möchtet, schaut gerne bei meinen Spielen vorbei oder setzt sie auf eure Wunschliste:<br/>
                👉 Meine Entwicklerseite auf Steam <a href="https://store.steampowered.com/curator/33183467" target="_blank" rel="noopener noreferrer">@https://store.steampowered.com/curator/33183467</a><br/><br/>
                <b>Technischer Hinweis & Attribution:</b><br/>
                Dieses Lexikon wurde mit Hilfe von Künstlicher Intelligenz erstellt:<br/>
                <b>Bilder:</b> generiert mit OpenAI<br/>
                <b>Voiceover:</b> erstellt mit ElevenLabs<br/>
                <b>Code & Umsetzung:</b> mit Hilfe von Cursor und verschiedenen Language Models (LLMs)<br/>
                <b>Soundeffekt:</b><br/>
                „Boy Laughing (5 y.o.)“ von Nakhas – freesound.org/s/506937/ – Lizenz: Creative Commons 0<br/><br/>
                <b>Bekannte Probleme:</b><br/>
                ⚠️ Bei der Nutzung mit dem Firefox-Browser kann es aktuell zu Bildflackern kommen. Bitte nutzt in diesem Fall vorübergehend einen anderen Browser (z. B. Chrome, Edge oder Safari), bis das Problem behoben ist.
              </p>
              <div style={{ marginTop: 32, marginBottom: 16 }}>
                <button
                  onClick={handleDownloadAllAssets}
                  style={{
                    padding: '12px 24px',
                    fontSize: 18,
                    borderRadius: 8,
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: 12
                  }}
                  disabled={downloadProgress.status === 'downloading' || downloadProgress.status === 'preparing'}
                >
                  {downloadProgress.status === 'done' ? 'Alle Assets offline verfügbar!' :
                   downloadProgress.status === 'downloading' ? 'Download läuft ...' :
                   downloadProgress.status === 'preparing' ? 'Vorbereitung ...' :
                   'Für Offline-Nutzung herunterladen'}
                </button>
                {(downloadProgress.status === 'downloading' || downloadProgress.status === 'preparing' || downloadProgress.status === 'done') && (
                  <div style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginTop: 8 }}>
                    <div style={{ height: 18, background: '#eee', borderRadius: 8, overflow: 'hidden', border: '1px solid #ccc' }}>
                      <div style={{
                        width: downloadProgress.total > 0 ? `${Math.round(100 * downloadProgress.done / downloadProgress.total)}%` : '0%',
                        height: '100%',
                        background: downloadProgress.status === 'done' ? '#4caf50' : '#1976d2',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: 14, marginTop: 4 }}>
                      {downloadProgress.status === 'done'
                        ? 'Alle Bilder und Audios sind jetzt offline verfügbar!'
                        : downloadProgress.status === 'preparing'
                          ? 'Vorbereitung ...'
                          : `${downloadProgress.done} / ${downloadProgress.total} Dateien gespeichert`}
                    </div>
                  </div>
                )}
                {downloadNotification && (
                  <div style={{ marginTop: 10, color: '#388e3c', fontWeight: 600, textAlign: 'center' }}>{downloadNotification}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Separator between character and categories */}
      <div className="character-categories-separator" aria-hidden="true"></div>
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
        {!loading && !error && allImagesLoaded && isGridVisible && (
          // Only render the grid if the main category (first visible tile) has image and image.filename
          tilePool.some(tile => tile.isVisible && tile.content && tile.content.image && tile.content.image.filename)
            ? (
              <motion.div
                key={animationKey}
                className={`tile-grid`}
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
                    key={poolTile.id}
                    tileKey={poolTile.id}
                    poolTile={poolTile}
                    delay={poolTile.isVisible ? animationManager.getTileDelay(
                      tilePool.filter((t, i) => t.isVisible && i <= index).length - 1, 
                      tilePool.filter(t => t.isVisible).length, 
                      currentGridAnimation
                    ) : 0}
                  />
                ))}
              </motion.div>
            )
            : null
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