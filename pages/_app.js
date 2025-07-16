import '../styles/globals.css';
import FaviconManager from '../components/FaviconManager';
import { useEffect } from 'react';
import { clearAllAssetCache } from '../utils/assetCache';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    async function checkAndClearCacheOnVersionChange() {
      try {
        const res = await fetch('/asset-version.json');
        if (!res.ok) return;
        const { version } = await res.json();
        const localVersion = localStorage.getItem('assetCacheVersion');
        if (localVersion !== String(version)) {
          await clearAllAssetCache();
          localStorage.setItem('assetCacheVersion', String(version));
        }
      } catch (e) {
        // Fehler ignorieren, App läuft trotzdem weiter
      }
    }
    checkAndClearCacheOnVersionChange();
  }, []);
  return (
    <>
      <FaviconManager />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 