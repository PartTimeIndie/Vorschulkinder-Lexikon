import { useEffect } from 'react';
import { getCachedImage } from '../utils/imageCache';

export default function FaviconManager() {
  useEffect(() => {
    (async () => {
      try {
        const base64 = await getCachedImage('/websiteBaseImages/lexiconFavIcon.png');
        document.getElementById('dynamic-favicon')?.setAttribute('href', base64);
        document.getElementById('dynamic-appleicon')?.setAttribute('href', base64);
        document.getElementById('dynamic-shortcuticon')?.setAttribute('href', base64);
      } catch (e) {
        // fallback: do nothing
      }
    })();
  }, []);
  return null;
} 