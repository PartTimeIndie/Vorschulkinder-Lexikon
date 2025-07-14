import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';
import { getCachedImage } from '../utils/imageCache';
import questionmark from '../public/websiteBaseImages/questionmark.png';

const CategoryTile = ({ 
  poolTile,  // Jetzt nehmen wir das komplette Tile aus dem Pool
  delay = 0,
  base64Image, // Füge base64Image als optionales Prop hinzu (für spätere Optimierung)
  tileKey // <-- Add this prop to receive the key
}) => {
  const isDebugTile = poolTile?.id === 'tile-0';

  useEffect(() => {
    if (isDebugTile) console.log(`[TILE] MOUNT id=${poolTile?.id}, contentId=${poolTile?.content?.id}, animationMode=${poolTile?.animationMode}, key=${tileKey}`);
    return () => {
      if (isDebugTile) console.log(`[TILE] UNMOUNT id=${poolTile?.id}, contentId=${poolTile?.content?.id}, animationMode=${poolTile?.animationMode}, key=${tileKey}`);
    };
  }, [tileKey]);

  const [imgLoaded, setImgLoaded] = useState(false);
  const lastImageUrlRef = useRef(null);

  // Bild-URL ermitteln (muss immer definiert sein, auch wenn das Tile nicht sichtbar ist)
  const getImageUrl = () => {
    const category = poolTile?.content;
    if (!category?.image?.filename) {
      return null; // No real image, use placeholder
    }
    // Wenn es ein Tier/Entry ist, immer /images/ verwenden
    if (poolTile?.isAnimal) {
      return `/images/${category.image.filename}`;
    }
    // Sonst Kategorie/Subkategorie
    return `/kategorien/images/${category.image.filename}`;
  };

  const imageUrl = getImageUrl(); // immer berechnen

  // State for the actual image source (Base64 or URL)
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [prevImgSrc, setPrevImgSrc] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (imageUrl) {
      // Save previous image before loading new one
      setPrevImgSrc(imgSrc);
      getCachedImage(imageUrl)
        .then(base64 => {
          if (isMounted && base64) setImgSrc(base64);
        })
        .catch(() => {
          if (isMounted) setImgSrc(imageUrl);
        });
    } else {
      setPrevImgSrc(null);
      setImgSrc(null);
    }
    return () => { isMounted = false; };
  }, [imageUrl]);

  // Only reset imgLoaded if the imageUrl actually changes
  useEffect(() => {
    if (lastImageUrlRef.current !== imageUrl) {
      setImgLoaded(false);
      if (isDebugTile) console.log(`[TILE] imgLoaded set to FALSE for id=${poolTile?.id}, imageUrl=${imageUrl}, key=${tileKey}`);
      lastImageUrlRef.current = imageUrl;
    }
  }, [imageUrl, tileKey]);

  useEffect(() => {
    if (isDebugTile) console.log(`[IMG] MOUNT for tileId=${poolTile?.id}, imageUrl=${imageUrl}, key=${tileKey}`);
    return () => {
      if (isDebugTile) console.log(`[IMG] UNMOUNT for tileId=${poolTile?.id}, imageUrl=${imageUrl}, key=${tileKey}`);
    };
  }, [imageUrl, tileKey]);

  if (isDebugTile) console.log(`[TILE] RENDER id=${poolTile?.id}, contentId=${poolTile?.content?.id}, animationMode=${poolTile?.animationMode}, imageUrl=${imageUrl}, imgLoaded=${imgLoaded}, key=${tileKey}`);

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

  const handleClick = () => {
    if (animationMode) return;
    if (onClick) {
      onClick(category);
    }
  };

  const isClicked = animationMode === 'clicked';
  const isFlyingOut = animationMode && animationMode.startsWith('fall-out-');

  let tileVariants;
  let animateState;

  if (isClicked) {
    tileVariants = animationManager.getClickedTileVariants();
    animateState = 'clicked';
  } else if (isFlyingOut) {
    const direction = animationMode.replace('fall-out-', '');
    tileVariants = animationManager.getFlyOutTileVariants(direction);
    animateState = 'flyOut';
  } else {
    tileVariants = {
      normal: { 
        opacity: 1, 
        scale: 1, 
        x: 0, 
        y: 0
      }
    };
    animateState = 'normal';
  }

  const getTileClasses = () => {
    let classes = "category-tile";
    if (isAnimal && isCurrentlyPlaying) {
      classes += " currently-playing";
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
        zIndex: isClicked ? 1000 : 'auto',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: animationMode ? 'transform, opacity' : 'auto',
        background: imgLoaded ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' : 'transparent',
      }}
    >
      {isAnimal && isPlayed && (
        <div className="completion-badge">
          <img
            src="/websiteBaseImages/abzeichen.png"
            alt="Bereits gehört"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}
      {/* Crossfade: show previous image until new one is loaded */}
      <div style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        {prevImgSrc && !imgLoaded && (
          <img
            src={prevImgSrc}
            alt=""
            width={300}
            height={180}
            className="category-image"
            style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, opacity: 1, transition: 'opacity 0.2s' }}
            draggable={false}
          />
        )}
        {imgSrc && (
          <img
            key={imageUrl}
            src={imgSrc}
            alt={category.image?.alt || category.name}
            width={300}
            height={180}
            className="category-image"
            style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            onLoad={() => {
              setImgLoaded(true);
              setPrevImgSrc(null);
              if (isDebugTile) console.log(`[IMG] onLoad for tileId=${poolTile?.id}, imageUrl=${imageUrl}`);
            }}
            onError={() => {
              setImgLoaded(true);
              setPrevImgSrc(null);
              if (isDebugTile) console.log(`[IMG] onError for tileId=${poolTile?.id}, imageUrl=${imageUrl}`);
            }}
            draggable={false}
          />
        )}
        {!imgSrc && (
          <img
            src={questionmark.src}
            alt="?"
            width={300}
            height={180}
            className="category-image"
            style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: 1, transition: 'opacity 0.2s' }}
            draggable={false}
          />
        )}
      </div>
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