import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getCachedImage } from '../utils/imageCache';

// Statische Variable um sicherzustellen dass Character nur EINMAL initialisiert wird
let characterInitialized = false;

// Entferne die Hilfsfunktion getCharacterImageUrl

const Character = ({ currentContext = 'idle', onEmotionChange }) => {
  const [currentEmotion, setCurrentEmotion] = useState('idle');
  const [isRotating, setIsRotating] = useState(false);
  const [rotationPhase, setRotationPhase] = useState('idle'); // 'idle', 'out', 'in'
  const [availableEmotions, setAvailableEmotions] = useState(['idle', 'curious']);
  const [hasLoaded, setHasLoaded] = useState(characterInitialized); // Für initiale Fly-In Animation - einmal für immer
  const [lastProcessedContext, setLastProcessedContext] = useState(null); // Verhindert mehrfache Emotion-Wechsel
  const [lastEmotionChangeTime, setLastEmotionChangeTime] = useState(0); // Cooldown für Emotion-Changes
  
  const autoResetTimer = useRef(null);
  const emotionChangeTimer = useRef(null);

  // Character-Bilder-Varianten definieren
  const characterVariants = {
    idle: [
      '/Characters/Character-idle.png',
      '/Characters/Character-idle-2.png',
      '/Characters/Character-idle-3.png'
    ],
    excited: [
      '/Characters/Character-excited.png',
      '/Characters/Character-excited-2.png',
      '/Characters/Character-excited-3.png'
    ],
    curious: [
      '/Characters/Character-curious.png',
      '/Characters/Character-curious-2.png',
      '/Characters/Character-curious-3.png'
    ],
    surprised: [
      '/Characters/Character-surprised.png',
      '/Characters/Character-surprised-2.png',
      '/Characters/Character-surprised-3.png'
    ],
    thinking: [
      '/Characters/Character-thinking.png',
      '/Characters/Character-thinking-2.png',
      '/Characters/Character-thinking-3.png'
    ],
    laughing: [
      '/Characters/Character-laughing.png',
      '/Characters/Character-laughing-2.png'
    ],
    exploring: [
      '/Characters/Character-excited.png',
      '/Characters/Character-excited-2.png',
      '/Characters/Character-excited-3.png'
    ],
    scared: [
      '/Characters/Character-surprised.png',
      '/Characters/Character-surprised-2.png',
      '/Characters/Character-surprised-3.png'
    ],
  };

  // State für gewählte Variante pro Emotion
  const [selectedVariant, setSelectedVariant] = useState('/Characters/Character-idle.png');
  const [imgLoaded, setImgLoaded] = useState(false);

  // Zufällige Variante für Emotion wählen und speichern (NIEMALS die gleiche)
  const selectVariantForEmotion = (emotion) => {
    const variants = characterVariants[emotion] || characterVariants.idle;
    
    // Wenn nur eine Variante vorhanden, diese nehmen
    if (variants.length === 1) {
      const variant = variants[0];
      setSelectedVariant(variant);
      return variant;
    }
    
    // Aktuelle Variante rausfiltern um Wiederholung zu vermeiden
    const otherVariants = variants.filter(variant => variant !== selectedVariant);
    
    // Falls alle Varianten die gleiche sind (sollte nicht passieren), erste nehmen
    if (otherVariants.length === 0) {
      const variant = variants[0];
      setSelectedVariant(variant);
      return variant;
    }
    
    // Zufällige andere Variante wählen
    const randomVariant = otherVariants[Math.floor(Math.random() * otherVariants.length)];
    setSelectedVariant(randomVariant);
    return randomVariant;
  };

  // Zufällige Emotion aus verfügbaren Emotionen wählen
  const getRandomEmotion = (emotions = availableEmotions) => {
    const filtered = emotions.filter(e => e !== currentEmotion);
    if (filtered.length === 0) return emotions[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  // Emotion-Wechsel mit ursprünglicher Flip-Animation
  const changeEmotion = (newEmotion, immediate = false) => {
    console.log(`🎭 Emotion change: ${currentEmotion} → ${newEmotion} (immediate: ${immediate})`);
    
    if (newEmotion === currentEmotion) {
      console.log(`🎭 Same emotion, skipping`);
      return;
    }
    
    if (immediate) {
      // Direkter Wechsel ohne Animation
      console.log(`🎭 Immediate change to ${newEmotion}`);
      setCurrentEmotion(newEmotion);
      selectVariantForEmotion(newEmotion);
      return;
    }
    
    // Flip-Animation: Raus -> Bild wechseln -> Rein
    console.log(`🎭 Starting flip animation: out → change → in`);
    setIsRotating(true);
    setRotationPhase('out');
    
    // Nach Raus-Animation (200ms): Bild wechseln
    setTimeout(() => {
      console.log(`🎭 Flip animation: Changing image to ${newEmotion}`);
      setCurrentEmotion(newEmotion);
      selectVariantForEmotion(newEmotion);
      setRotationPhase('in');
      
      // Nach Rein-Animation (200ms): Animation beenden
      setTimeout(() => {
        console.log(`🎭 Flip animation: Complete!`);
        setRotationPhase('idle');
        setIsRotating(false);
      }, 200);
    }, 200);
  };

  // Auto-Reset entfernt - Character wechselt nur bei Interaktionen

  // Context-abhängige Emotionen laden
  const loadContextEmotions = async (context) => {
    console.log(`🎭 loadContextEmotions called with context: '${context}' (lastProcessed: '${lastProcessedContext}')`);
    try {
      // Statt API: Definiere die Emotions-Logik clientseitig oder lade aus statischer Datei
      // Beispiel: Mapping von Context zu Emotions
      const contextEmotionMap = {
        idle: ['idle', 'curious'],
        main: ['excited', 'curious', 'idle'],
        category: ['curious', 'thinking', 'excited'],
        animals: ['excited', 'surprised', 'laughing'],
        default: ['idle', 'curious', 'excited', 'surprised', 'thinking', 'laughing']
      };
      const emotions = contextEmotionMap[context] || contextEmotionMap.default;
      setAvailableEmotions(emotions);
      // Der Rest bleibt gleich wie vorher
      const now = Date.now();
      const timeSinceLastChange = now - lastEmotionChangeTime;
      const EMOTION_COOLDOWN = 2000; // 2 Sekunden Cooldown
      console.log(`🎭 Context check: context=${context}, lastProcessed=${lastProcessedContext}, cooldown=${timeSinceLastChange}ms`);
      if (context !== 'idle' && context !== lastProcessedContext && timeSinceLastChange >= EMOTION_COOLDOWN) {
        console.log(`🎭 TRIGGERING emotion change for context '${context}'`);
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        changeEmotion(randomEmotion, false); // Mit Flip-Animation
        setLastProcessedContext(context); // Merke dass wir diesen Context schon verarbeitet haben
        setLastEmotionChangeTime(now); // Setze Cooldown-Timer
      } else if (context === lastProcessedContext) {
        console.log(`🎭 BLOCKED: Context '${context}' already processed`);
      } else if (timeSinceLastChange < EMOTION_COOLDOWN) {
        console.log(`🎭 BLOCKED: Cooldown active (${timeSinceLastChange}ms < ${EMOTION_COOLDOWN}ms)`);
      } else if (context === 'idle') {
        // Bei idle-Context: Reset lastProcessedContext für nächste Interaktion (aber kein Cooldown Reset)
        console.log(`🎭 RESET: Idle context, clearing lastProcessedContext`);
        setLastProcessedContext(null);
        // Character wird NICHT neu instanziert, nur hasLoaded bleibt true
      }
    } catch (error) {
      console.error('Error loading context emotions:', error);
      setAvailableEmotions(['idle', 'curious']);
    }
  };

  // Zufälliges Lachen abspielen (ohne Voice-Overs zu unterbrechen)
  const playRandomLaughter = () => {
    const laughterFiles = [
      '/audio/LaughingKid/laughing-1.wav',
      '/audio/LaughingKid/laughing-2.wav',
      '/audio/LaughingKid/laughing-3.wav',
      '/audio/LaughingKid/laughing-4.wav',
      '/audio/LaughingKid/laughing-5.wav',
      '/audio/LaughingKid/laughing-6.wav',
      '/audio/LaughingKid/laughing-7.wav'
    ];
    
    // Zufällige Lacher-Datei auswählen
    const randomLaughter = laughterFiles[Math.floor(Math.random() * laughterFiles.length)];
    
    try {
      // SEPARATES Audio-Element für Lacher (nicht global!)
      const laughterAudio = new Audio(randomLaughter);
      laughterAudio.volume = 0.7; // Etwas leiser als Voice-Overs
      
      laughterAudio.play().catch(err => {
        console.log('Lacher-Audio autoplay verhindert:', err);
      });
      
      console.log('🤣 Lacher abgespielt:', randomLaughter);
      
    } catch (error) {
      console.error('Lacher-Audio-Fehler:', error);
    }
  };

  // Character antippen - Rotation, Emotion-Wechsel UND Lachen
  const handleCharacterClick = () => {
    // Zu laughing oder excited wechseln, aber NIEMALS die aktuelle Emotion
    const happyEmotions = ['laughing', 'excited'];
    let randomHappyEmotion;
    
    // Andere Emotion wählen als die aktuelle
    if (currentEmotion === 'laughing') {
      randomHappyEmotion = 'excited';
    } else if (currentEmotion === 'excited') {
      randomHappyEmotion = 'laughing';  
    } else {
      // Wenn weder laughing noch excited, zufällig wählen
      randomHappyEmotion = happyEmotions[Math.floor(Math.random() * happyEmotions.length)];
    }
    
    changeEmotion(randomHappyEmotion, false); // Mit Flip-Animation
    setLastEmotionChangeTime(Date.now()); // Cooldown-Timer auch bei direktem Character-Klick setzen
    
    // Zufälliges Lachen abspielen (parallel zu Voice-Overs)
    playRandomLaughter();
    
    // Callback für Emotion-Änderung
    if (onEmotionChange) {
      onEmotionChange(randomHappyEmotion);
    }
  };

  // Initial Fly-In Animation starten - NUR EINMAL in der gesamten App-Laufzeit
  useEffect(() => {
    if (!characterInitialized) {
      console.log(`🎭 Character FIRST TIME INITIALIZATION`);
      characterInitialized = true; // Setze statische Variable
      
      // Nach kurzer Verzögerung Character reinfliegen lassen
      const loadTimer = setTimeout(() => {
        console.log(`🎭 Setting hasLoaded to true`);
        setHasLoaded(true);
      }, 300);
      
      return () => clearTimeout(loadTimer);
    } else {
      console.log(`🎭 Character ALREADY INITIALIZED - setting hasLoaded immediately`);
      setHasLoaded(true); // Bei Re-Render sofort auf loaded setzen
    }
  }, []);

  // Context-Änderungen überwachen - mit Ref um doppelte Aufrufe zu verhindern
  const lastContextRef = useRef(null);
  
  useEffect(() => {
    if (currentContext && currentContext !== lastContextRef.current) {
      console.log(`🎭 Processing NEW context: '${currentContext}'`);
      lastContextRef.current = currentContext;
      loadContextEmotions(currentContext);
    }
  }, [currentContext]);

  // Cleanup Timer
  useEffect(() => {
    return () => {
      if (autoResetTimer.current) clearTimeout(autoResetTimer.current);
      if (emotionChangeTimer.current) clearTimeout(emotionChangeTimer.current);
    };
  }, []);

  // Preload image via Base64 cache, but do not use it for rendering
  useEffect(() => {
    if (!selectedVariant) return;
    getCachedImage(selectedVariant).catch(() => {});
  }, [selectedVariant]);

  // Track loading state for the real image
  useEffect(() => {
    let didCancel = false;
    let fallbackTimer;
    setImgLoaded(false);
    if (selectedVariant) {
      fallbackTimer = setTimeout(() => {
        if (!didCancel) setImgLoaded(true);
      }, 500);
    }
    return () => {
      didCancel = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [selectedVariant]);

  // Animation-Klassen bestimmen
  const getAnimationClasses = () => {
    let classes = 'character-image';
    
    // Initial Fly-In Animation beim ersten Laden
    if (!hasLoaded) {
      classes += ' character-fly-in';
      console.log(`🎨 CSS Classes: ${classes} (fly-in)`);
      return classes;
    }
    
    // Rotation-Animation hat Priorität
    if (rotationPhase === 'out') {
      classes += ' character-rotate-out';
      console.log(`🎨 CSS Classes: ${classes} (rotating OUT)`);
    } else if (rotationPhase === 'in') {
      classes += ' character-rotate-in';
      console.log(`🎨 CSS Classes: ${classes} (rotating IN)`);
    } else if (rotationPhase === 'idle' && !isRotating) {
      // Subtile Loop-Animation nur wenn wirklich idle
      classes += ' character-subtle-animation';
      console.log(`🎨 CSS Classes: ${classes} (subtle idle)`);
    } else {
      console.log(`🎨 CSS Classes: ${classes} (no extra animation)`);
    }
    
    return classes;
  };

  return (
    <div 
      className="character-container"
      onClick={handleCharacterClick}
      title="Character antippen für Emotionen!"
    >
      <img
        src={selectedVariant}
        alt={`Character ${currentEmotion}`}
        width={120}
        height={150}
        className={getAnimationClasses()}
        style={{ objectFit: 'contain', position: 'relative', zIndex: 1, opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgLoaded(true)}
      />
    </div>
  );
};

export default Character; 
// Cache-Refresh: Updated Character Animation and removed isBouncing 