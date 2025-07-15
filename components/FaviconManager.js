import { useEffect } from 'react';
import { getCachedAsset } from '../utils/assetCache';

export default function FaviconManager() {
  useEffect(() => {
    (async () => {
      try {
        const base64 = await getCachedAsset('/websiteBaseImages/lexiconFavIcon.png');
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