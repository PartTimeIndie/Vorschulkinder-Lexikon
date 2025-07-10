import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const Character = ({ currentContext = 'idle', onEmotionChange }) => {
  const [currentEmotion, setCurrentEmotion] = useState('idle');
  const [isRotating, setIsRotating] = useState(false);
  const [rotationPhase, setRotationPhase] = useState('idle'); // 'idle', 'out', 'in'
  const [availableEmotions, setAvailableEmotions] = useState(['idle', 'curious']);
  const [hasLoaded, setHasLoaded] = useState(false); // Für initiale Fly-In Animation
  
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

  // Rotation Animation mit Emotion-Wechsel
  const changeEmotion = (newEmotion, immediate = false) => {
    if (newEmotion === currentEmotion && !immediate) return;
    
    if (immediate) {
      setCurrentEmotion(newEmotion);
      selectVariantForEmotion(newEmotion);
      return;
    }

    // Start rotate-out
    setIsRotating(true);
    setRotationPhase('out');
    
    // Nach 150ms (halbe Rotation) Emotion wechseln und rotate-in starten - doppelt so schnell
    emotionChangeTimer.current = setTimeout(() => {
      setCurrentEmotion(newEmotion);
      selectVariantForEmotion(newEmotion); // Neue Variante wählen
      setRotationPhase('in');
      
      // Nach weiteren 150ms Rotation vollständig beenden - doppelt so schnell
      setTimeout(() => {
        setIsRotating(false);
        setRotationPhase('idle');
      }, 150);
    }, 150);
  };

  // Auto-Reset entfernt - Character wechselt nur bei Interaktionen

  // Context-abhängige Emotionen laden
  const loadContextEmotions = async (context) => {
    try {
      const response = await fetch(`/api/character/random-emotion/${context}`);
      const data = await response.json();
      
      if (data.emotions) {
        setAvailableEmotions(data.emotions);
        
        // Wenn sich der Context ändert, zufällige Emotion aus verfügbaren wählen
        if (context !== 'idle') {
          const randomEmotion = data.emotions[Math.floor(Math.random() * data.emotions.length)];
          changeEmotion(randomEmotion, false);
        }
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
    
    changeEmotion(randomHappyEmotion);
    
    // Zufälliges Lachen abspielen (parallel zu Voice-Overs)
    playRandomLaughter();
    
    // Callback für Emotion-Änderung
    if (onEmotionChange) {
      onEmotionChange(randomHappyEmotion);
    }
  };

  // Initial Fly-In Animation starten
  useEffect(() => {
    // Nach kurzer Verzögerung Character reinfliegen lassen
    const loadTimer = setTimeout(() => {
      setHasLoaded(true);
    }, 300);
    
    return () => clearTimeout(loadTimer);
  }, []);

  // Context-Änderungen überwachen
  useEffect(() => {
    if (currentContext) {
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

  // Animation-Klassen bestimmen
  const getAnimationClasses = () => {
    let classes = 'character-image';
    
    // Initial Fly-In Animation beim ersten Laden
    if (!hasLoaded) {
      classes += ' character-fly-in';
      return classes;
    }
    
    if (rotationPhase === 'out') {
      classes += ' character-rotate-out';
    } else if (rotationPhase === 'in') {
      classes += ' character-rotate-in';
    }
    
    // Subtile Loop-Animation wenn keine Rotation läuft
    if (rotationPhase === 'idle') {
      classes += ' character-subtle-animation';
    }
    
    return classes;
  };

  return (
    <div 
      className="character-container"
      onClick={handleCharacterClick}
      title="Character antippen für Emotionen!"
    >
      <Image
        src={selectedVariant}
        alt={`Character ${currentEmotion}`}
        width={120}
        height={150}
        className={getAnimationClasses()}
        priority
        unoptimized // Für lokale Entwicklung
      />
    </div>
  );
};

export default Character; 
// Cache-Refresh: Updated Character Animation and removed isBouncing 