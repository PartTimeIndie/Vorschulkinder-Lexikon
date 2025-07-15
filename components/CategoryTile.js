import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { animationManager } from '../utils/animationManager';
import { getCachedAsset, getCachedAssetAsBlob } from '../utils/assetCache';
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
  const getImageUrl = (lowRes = true) => {
    const category = poolTile?.content;
    if (!category || !category.image || !category.image.filename) {
      return null; // No real image, use placeholder
    }
    // Wenn es ein Tier/Entry ist, immer /images/ verwenden
    if (poolTile?.isAnimal) {
      return lowRes ? `/images/lowres/${category.image.filename}` : `/images/${category.image.filename}`;
    }
    // Sonst Kategorie/Subkategorie
    return lowRes ? `/kategorien/images/lowres/${category.image.filename}` : `/kategorien/images/${category.image.filename}`;
  };

  const imageUrl = getImageUrl(); // immer berechnen

  // State for the actual image source (Base64 or URL)
  const [imgSrc, setImgSrc] = useState(getImageUrl(true));
  const [prevImgSrc, setPrevImgSrc] = useState(null);

  useEffect(() => {
    let objectUrl;
    let isMounted = true;
    if (!poolTile) return;
    const url = getImageUrl(true);
    if (!url) return;
    getCachedAssetAsBlob(url)
      .then(blob => {
        if (blob && isMounted) {
          objectUrl = URL.createObjectURL(blob);
          console.log(`[BLOB] Created blob URL for tileId=${poolTile?.id}:`, objectUrl, 'from', url);
          setImgSrc(objectUrl);
        } else if (isMounted) {
          console.log(`[BLOB] No blob, fallback to url for tileId=${poolTile?.id}:`, url);
          setImgSrc(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          console.log(`[BLOB] Error fetching blob, fallback to url for tileId=${poolTile?.id}:`, url);
          setImgSrc(url);
        }
      });
    return () => {
      isMounted = false;
      if (objectUrl) {
        console.log(`[BLOB] Revoking blob URL for tileId=${poolTile?.id}:`, objectUrl);
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [poolTile?.content?.image?.filename, poolTile?.isAnimal]);

  // Trigger explizit auf Tier-ID und Bilddatei
  useEffect(() => {
    const filename = poolTile?.content?.image?.filename;
    if (filename) {
      console.log(`[IMG] setImgSrc (reset) for tileId=${poolTile?.id}, filename=${filename}, url=${getImageUrl(true)}`);
      setImgSrc(getImageUrl(true));
      setImgLoaded(false);
      setPrevImgSrc(null);
      if (isDebugTile) console.log(`[IMG] Reset imgSrc and imgLoaded for tileId=${poolTile?.id}, filename=${filename}`);
    }
  }, [poolTile?.content?.id, poolTile?.content?.image?.filename]);

  // Reset Bild-State bei Wechsel von Kategorie/Subkategorie zu Tier (oder umgekehrt), nach Fly-Out und vor Fly-In
  const prevIsAnimal = useRef(poolTile?.isAnimal);
  const prevAnimationMode = useRef(poolTile?.animationMode);
  useEffect(() => {
    const wasAnimal = prevIsAnimal.current;
    const wasFlyOut = prevAnimationMode.current && prevAnimationMode.current.startsWith('fall-out-');
    const isNowAnimal = poolTile?.isAnimal;
    const isNowNormal = !poolTile?.animationMode || poolTile?.animationMode === 'normal';
    // Reset, wenn von Kategorie zu Tier (oder umgekehrt) gewechselt wird und Fly-Out vorbei ist
    if ((wasAnimal !== isNowAnimal && isNowNormal) || (wasFlyOut && isNowNormal)) {
      console.log(`[IMG] setImgSrc (full reset) for tileId=${poolTile?.id}, url=${getImageUrl(true)}`);
      setImgSrc(getImageUrl(true));
      setImgLoaded(false);
      setPrevImgSrc(null);
      if (isDebugTile) console.log('[IMG] FULL RESET imgSrc/imgLoaded/prevImgSrc für tileId=' + poolTile?.id);
    }
    prevIsAnimal.current = isNowAnimal;
    prevAnimationMode.current = poolTile?.animationMode;
  }, [poolTile?.isAnimal, poolTile?.animationMode]);

  useEffect(() => {
    if (isDebugTile) console.log(`[IMG] MOUNT for tileId=${poolTile?.id}, imageUrl=${imageUrl}, key=${tileKey}`);
    return () => {
      if (isDebugTile) console.log(`[IMG] UNMOUNT for tileId=${poolTile?.id}, imageUrl=${imageUrl}, key=${tileKey}`);
    };
  }, [imageUrl, tileKey]);

  // Debug-Log für Tiere: Name, Bild-URL, imgSrc, imgLoaded
  useEffect(() => {
    if (poolTile?.isAnimal && poolTile?.content) {
      console.log('[DEBUG] Animal-Tile:', poolTile.content.name, getImageUrl(true), imgSrc, 'imgLoaded:', imgLoaded);
    }
  }, [poolTile?.content?.id, imgSrc, imgLoaded]);

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
        {imgSrc && imgSrc !== 'null' && imgSrc !== '/null' ? (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={category.image?.alt || category.name}
            width={300}
            height={180}
            className="category-image"
            style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.2s' }}
            onLoad={() => {
              console.log(`[IMG] onLoad for tileId=${poolTile?.id}, imgSrc=${imgSrc}`);
              setImgLoaded(true);
              setPrevImgSrc(null);
              if (isDebugTile) console.log(`[IMG] onLoad for tileId=${poolTile?.id}, imageUrl=${imgSrc}`);
            }}
            onError={() => {
              console.log(`[IMG] onError for tileId=${poolTile?.id}, imgSrc=${imgSrc}`);
              // Fallback to original image if low-res not found
              if (imgSrc !== getImageUrl(false) && getImageUrl(false)) {
                console.log(`[IMG] onError fallback to high-res for tileId=${poolTile?.id}, url=${getImageUrl(false)}`);
                setImgSrc(getImageUrl(false));
              } else {
                setImgLoaded(true);
              }
              setPrevImgSrc(null);
              if (isDebugTile) console.log(`[IMG] onError for tileId=${poolTile?.id}, imageUrl=${imgSrc}`);
            }}
            draggable={false}
          />
        ) : (
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