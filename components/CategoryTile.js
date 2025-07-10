import { useState, useEffect } from 'react';
import Image from 'next/image';

const CategoryTile = ({ 
  category, 
  onClick, 
  delay = 0, 
  animationMode = 'loaded',
  isAnimal = false,
  isPlayed = false,
  isCurrentlyPlaying = false 
}) => {
  const [currentAnimation, setCurrentAnimation] = useState('loaded');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Image-URL für Backend
  const getImageUrl = () => {
    return `http://localhost:5000/images/${category.image.filename}`;
  };

  // Animation-Management basierend auf animationMode prop
  useEffect(() => {
    if (animationMode === 'clicked') {
      setCurrentAnimation('selected');
    } else if (animationMode && animationMode.startsWith('fall-out-')) {
      setCurrentAnimation(animationMode);
    } else if (animationMode && animationMode.startsWith('fly-in-from-')) {
      setCurrentAnimation(animationMode);
      
      // Nach Animation zurück zur normalen Position
      setTimeout(() => {
        setCurrentAnimation('loaded');
      }, 800);
    } else {
      setCurrentAnimation('loaded');
    }
  }, [animationMode]);

  // Tile-Klick Handler
  const handleClick = () => {
    // Nur klicken wenn in normaler Position
    if (currentAnimation !== 'loaded') return;
    
    if (onClick) {
      onClick(category);
    }
  };

  // CSS-Klassen zusammenstellen
  const getTileClasses = () => {
    let classes = `category-tile ${currentAnimation}`;
    
    // Grüne Outline für aktuell spielendes Tier
    if (isAnimal && isCurrentlyPlaying) {
      classes += ' currently-playing';
    }
    
    return classes;
  };

  return (
    <div 
      className={getTileClasses()}
      onClick={handleClick}
      style={{ 
        animationDelay: `${delay}ms`,
        pointerEvents: currentAnimation === 'loaded' ? 'auto' : 'none'
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
    </div>
  );
};

export default CategoryTile; 