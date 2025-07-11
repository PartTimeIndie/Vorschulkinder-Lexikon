import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';

const CategoryTile = ({ 
  poolTile,  // Jetzt nehmen wir das komplette Tile aus dem Pool
  delay = 0
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Wenn Tile nicht sichtbar oder kein Content, dann verstecken
  if (!poolTile?.isVisible || !poolTile?.content) {
    return (
      <div 
        className="category-tile" 
        style={{ 
          opacity: 0, 
          pointerEvents: 'none',
          visibility: 'hidden',
          width: '100%',
          height: '100%'
        }}
      />
    );
  }
  
  const { content: category, animationMode, isAnimal, isPlayed, isCurrentlyPlaying, onClick } = poolTile;

  // Image-URL für Backend mit dynamischer Host-Erkennung und Resize-Optimierung
  const getImageUrl = () => {
    if (!category.image?.filename) {
      console.warn('❌ No image filename for category:', category.name);
      return '/websiteBaseImages/placeholder.png'; // Fallback
    }
    
    // Dynamische Host-Erkennung: funktioniert mit localhost und IP-Adressen
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const port = '5000';
    
    // Tile-optimierte Größe: 300x300px für bessere Qualität (einheitlich für alle Geräte)
    const tileSize = 300;
    const quality = 75; // Gute Qualität, kleinere Dateigröße
    
    return `${protocol}//${hostname}:${port}/images/${category.image.filename}?w=${tileSize}&h=${tileSize}&q=${quality}`;
  };

  // Tile-Klick Handler
  const handleClick = () => {
    // Nur klicken wenn keine Animation läuft
    if (animationMode) return;
    
    if (onClick) {
      onClick(category);
    }
  };

  // ===== NUR ANIMATION MANAGER - KEINE CSS-ANIMATIONEN =====
  const isClicked = animationMode === 'clicked';
  const isFlyingOut = animationMode && animationMode.startsWith('fall-out-');
  
  // Mobile-Detection für optimierte Animationen
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 767;
  const isFirefoxMobile = typeof window !== 'undefined' && 
    /Android.*Firefox|Mobile.*Firefox/.test(window.navigator.userAgent);

  let tileVariants;
  let animateState;
  
  if (isClicked) {
    // Geklicktes Tile: Wächst und verblasst SOFORT
    tileVariants = animationManager.getClickedTileVariants();
    animateState = 'clicked';
  } else if (isFlyingOut) {
    // Nicht-geklicktes Tile: Fliegt weg SOFORT
    const direction = animationMode.replace('fall-out-', '');
    tileVariants = animationManager.getFlyOutTileVariants(direction);
    animateState = 'flyOut';
  } else {
    // Normales Tile - statisch sichtbar mit mobilen Optimierungen
    tileVariants = {
      normal: { 
        opacity: 1, 
        scale: 1, 
        x: 0, 
        y: 0,
        // Mobile-spezifische Stabilisierung
        ...(isMobile && {
          transform: 'translate3d(0, 0, 0) scale(1)',
          transformOrigin: 'center center'
        })
      }
    };
    animateState = 'normal';
  }

  // CSS-Klassen für Tile
  const getTileClasses = () => {
    let classes = "category-tile";
    if (isAnimal && isCurrentlyPlaying) {
      classes += " currently-playing";
      console.log(`🟢 CSS: Adding 'currently-playing' class to ${category.name}`);
    }
    return classes;
  };

  return (
    <motion.div 
      className={getTileClasses()}
      onClick={handleClick}
      variants={tileVariants}
      initial="normal"
      animate={animateState}
      transition={{ 
        duration: 1.8, 
        ease: "easeInOut",
        // Firefox Mobile spezifische Fixes - keine Spring-Animationen
        ...(isFirefoxMobile && {
          type: "tween", // Explizit Tween statt Spring
          ease: [0.25, 0.1, 0.25, 1], // Cubic Bezier für smoothness
        })
      }}
      style={{ 
        pointerEvents: animationMode ? 'none' : 'auto',
        zIndex: isClicked ? 1000 : 'auto',
        // Anti-Flicker: GPU-Beschleunigung und stabile Rendering-Eigenschaften
        transform: 'translateZ(0)', // Force GPU layer
        backfaceVisibility: 'hidden', // Prevent flickering
        WebkitBackfaceVisibility: 'hidden', // Safari support
        willChange: animationMode ? 'transform, opacity' : 'auto', // Optimize only when animating
        // Mobile-spezifische Stabilisierung
        ...(isMobile && {
          WebkitTransform: 'translate3d(0, 0, 0)',
          isolation: 'isolate',
          contain: 'layout style paint'
        }),
        // Firefox Mobile spezifische Anti-Flicker-Fixes
        ...(isFirefoxMobile && {
          MozTransform: 'translate3d(0, 0, 0)',
          MozBackfaceVisibility: 'hidden',
          MozUserSelect: 'none',
        })
      }}
    >
      {/* Abzeichen für gehörte Tiere (nur bei Animals) */}
      {isAnimal && isPlayed && (
        <div className="completion-badge">
          <Image
            src="/websiteBaseImages/abzeichen.png"
            alt="Bereits gehört"
            width={40}
            height={40}
          />
        </div>
      )}

      <Image
        src={getImageUrl()}
        alt={category.image.alt}
        width={300}
        height={180}
        className="category-image"
        unoptimized
        priority
        onLoad={() => setImageLoaded(true)}
        style={{
          // Anti-Flicker für Images
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />
      
      <div className="category-content">
        <h3 className="category-title">{category.name}</h3>
        <p className="category-description">
          {category.description || ''}
        </p>
      </div>


    </motion.div>
  );
};

export default CategoryTile; 