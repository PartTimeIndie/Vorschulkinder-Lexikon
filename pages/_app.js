import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Viewport-Setup für mobile Geräte
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    // Touch-Events für bessere mobile Interaktion
    document.body.style.touchAction = 'manipulation';
    
    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp; 