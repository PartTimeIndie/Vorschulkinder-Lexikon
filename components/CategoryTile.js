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

  // Image-URL für Backend mit Fallback
  const getImageUrl = () => {
    if (!category.image?.filename) {
      console.warn('❌ No image filename for category:', category.name);
      return '/websiteBaseImages/placeholder.png'; // Fallback
    }
    return `http://localhost:5000/images/${category.image.filename}`;
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
    // Normales Tile - statisch sichtbar
    tileVariants = {
      normal: { opacity: 1, scale: 1, x: 0, y: 0 }
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
        ease: "easeInOut" 
      }}
      style={{ 
        pointerEvents: animationMode ? 'none' : 'auto',
        zIndex: isClicked ? 1000 : 'auto'
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