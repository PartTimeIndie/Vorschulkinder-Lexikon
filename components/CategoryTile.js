import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';

const CategoryTile = ({ 
  category, 
  onClick, 
  delay = 0, 
  animationMode = null,
  isAnimal = false,
  isPlayed = false,
  isCurrentlyPlaying = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Image-URL für Backend
  const getImageUrl = () => {
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

  return (
    <motion.div 
      className="category-tile"
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

      {/* Grüne Outline für aktuell spielendes Tier */}
      {isAnimal && isCurrentlyPlaying && (
        <div className="currently-playing-outline" />
      )}
    </motion.div>
  );
};

export default CategoryTile; 