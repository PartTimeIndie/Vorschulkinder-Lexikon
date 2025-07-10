// Zentraler Animation Manager für choreographierte Tile-Animationen

export class AnimationManager {
  constructor() {
    this.animationTypes = [
      'slideFromLeft',
      'slideFromRight', 
      'slideFromTop',
      'slideFromBottom',
      'slideFromTopLeft',
      'slideFromTopRight',
      'slideFromBottomLeft',
      'slideFromBottomRight',
      'spiralInward',
      'spiralOutward',
      'scatterIn',
      'waveIn'
    ];
  }

  // Zufällige Animation für das gesamte Grid wählen
  getRandomGridAnimation() {
    const randomIndex = Math.floor(Math.random() * this.animationTypes.length);
    return this.animationTypes[randomIndex];
  }

  // Animation-Varianten für Framer Motion definieren
  getGridVariants(animationType) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const variants = {
      // Einfache Richtungen
      slideFromLeft: {
        hidden: { x: -viewportWidth, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
        exit: { x: -viewportWidth, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }
      },
      slideFromRight: {
        hidden: { x: viewportWidth, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
        exit: { x: viewportWidth, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }
      },
      slideFromTop: {
        hidden: { y: -viewportHeight, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
        exit: { y: -viewportHeight, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }
      },
      slideFromBottom: {
        hidden: { y: viewportHeight, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
        exit: { y: viewportHeight, opacity: 0, transition: { duration: 0.6, ease: "easeIn" } }
      },

      // Diagonale Animationen
      slideFromTopLeft: {
        hidden: { x: -viewportWidth, y: -viewportHeight, opacity: 0 },
        visible: { x: 0, y: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
        exit: { x: -viewportWidth, y: -viewportHeight, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }
      },
      slideFromTopRight: {
        hidden: { x: viewportWidth, y: -viewportHeight, opacity: 0 },
        visible: { x: 0, y: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
        exit: { x: viewportWidth, y: -viewportHeight, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }
      },
      slideFromBottomLeft: {
        hidden: { x: -viewportWidth, y: viewportHeight, opacity: 0 },
        visible: { x: 0, y: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
        exit: { x: -viewportWidth, y: viewportHeight, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }
      },
      slideFromBottomRight: {
        hidden: { x: viewportWidth, y: viewportHeight, opacity: 0 },
        visible: { x: 0, y: 0, opacity: 1, transition: { duration: 0.9, ease: "easeOut" } },
        exit: { x: viewportWidth, y: viewportHeight, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }
      },

      // Spezial-Animationen ohne Rotation
      spiralInward: {
        hidden: { scale: 0, opacity: 0 },
        visible: { 
          scale: 1, 
          opacity: 1, 
          transition: { 
            duration: 1.0, 
            ease: "easeOut",
            scale: { type: "spring", stiffness: 80, damping: 15 }
          } 
        },
        exit: { 
          scale: 0, 
          opacity: 0, 
          transition: { 
            duration: 0.8, 
            ease: "easeIn" 
          } 
        }
      },
      spiralOutward: {
        hidden: { scale: 2, opacity: 0 },
        visible: { 
          scale: 1, 
          opacity: 1, 
          transition: { 
            duration: 1.0, 
            ease: "easeOut",
            scale: { type: "spring", stiffness: 100, damping: 20 }
          } 
        },
        exit: { 
          scale: 2, 
          opacity: 0, 
          transition: { 
            duration: 0.8, 
            ease: "easeIn" 
          } 
        }
      },
      scatterIn: {
        hidden: { scale: 0.3, x: Math.random() * 400 - 200, y: Math.random() * 400 - 200, opacity: 0 },
        visible: { 
          scale: 1, 
          x: 0, 
          y: 0, 
          opacity: 1, 
          transition: { 
            duration: 1.0, 
            ease: "easeOut" 
          } 
        },
        exit: { 
          scale: 0.3, 
          x: Math.random() * 400 - 200, 
          y: Math.random() * 400 - 200, 
          opacity: 0, 
          transition: { 
            duration: 0.7, 
            ease: "easeIn" 
          } 
        }
      },
      waveIn: {
        hidden: { y: viewportHeight, opacity: 0, skewY: 10 },
        visible: { 
          y: 0, 
          opacity: 1, 
          skewY: 0,
          transition: { 
            duration: 1.0, 
            ease: "easeOut",
            y: { type: "spring", stiffness: 100, damping: 15 }
          } 
        },
        exit: { 
          y: -viewportHeight, 
          opacity: 0, 
          skewY: -10,
          transition: { 
            duration: 0.8, 
            ease: "easeIn" 
          } 
        }
      }
    };

    return variants[animationType] || variants.slideFromLeft;
  }

  // Clicked Tile Animation - Tile wächst und verblasst
  getClickedTileVariants() {
    return {
      normal: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.2 }
      },
      clicked: {
        scale: 1.2,
        opacity: 0,
        transition: { 
          duration: 1.8,
          ease: "easeInOut",
          scale: { duration: 0.6 },
          opacity: { delay: 1.2, duration: 0.6 }
        }
      }
    };
  }

  // Fly-Out Animationen für einzelne Tiles (nicht geklickte)
  getFlyOutTileVariants(direction) {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const directions = {
      'down': { x: 0, y: viewportHeight, opacity: 0 },
      'up': { x: 0, y: -viewportHeight, opacity: 0 },
      'left': { x: -viewportWidth, y: 0, opacity: 0 },
      'right': { x: viewportWidth, y: 0, opacity: 0 },
      'up-left': { x: -viewportWidth, y: -viewportHeight, opacity: 0 },
      'up-right': { x: viewportWidth, y: -viewportHeight, opacity: 0 },
      'down-left': { x: -viewportWidth, y: viewportHeight, opacity: 0 },
      'down-right': { x: viewportWidth, y: viewportHeight, opacity: 0 }
    };

    return {
      normal: {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        transition: { duration: 0.2 }
      },
      flyOut: {
        ...directions[direction] || directions['down'],
        scale: 0.8,
        transition: { 
          duration: 1.8,
          ease: "easeIn"
        }
      }
    };
  }

  // Choreographierte Tile-Delays für gestaffelte Animationen
  getTileDelay(index, totalTiles, animationType) {
    switch (animationType) {
      case 'waveIn':
        return index * 100; // Welleneffekt
      case 'spiralInward':
      case 'spiralOutward':
        return index * 150; // Spiral-Staffelung
      case 'scatterIn':
        return Math.random() * 500; // Zufällige Streuung
      default:
        return index * 80; // Standard-Staffelung
    }
  }
}

// Singleton Export
export const animationManager = new AnimationManager(); 