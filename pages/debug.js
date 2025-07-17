import { useState, useEffect } from 'react';
import Head from 'next/head';
import { keys, get, del } from 'idb-keyval';
import { clearAllCachesDeep } from '../utils/assetCache';

export default function DebugPage() {
  const [cacheKeys, setCacheKeys] = useState(null); // null = not loaded yet
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    keys().then(allKeys => {
      const assetKeys = allKeys.filter(key => typeof key === 'string' && key.startsWith('assetcache_'));
      setCacheKeys(assetKeys);
    });
  }, []);

  const handleClearCache = async () => {
    await clearAllCachesDeep();
    setCacheKeys([]);
    setCleared(true);
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <Head>
        <title>Debug Tools</title>
      </Head>
      <h1>Debug Tools</h1>
      <button onClick={handleClearCache} style={{ padding: '12px 24px', fontSize: 18, borderRadius: 8, background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>
        Alle Caches löschen
      </button>
      {cleared && <div style={{ color: 'green', marginTop: 16 }}>Asset cache cleared!</div>}
      <h2 style={{ marginTop: 32 }}>Cached Asset Keys</h2>
      <div style={{ marginBottom: 8, color: '#555' }}>
        {cacheKeys === null ? '' : `Total cached assets: ${cacheKeys.length}`}
      </div>
      <ul style={{ maxHeight: 300, overflowY: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
        {cacheKeys === null
          ? <li>Loading...</li>
          : cacheKeys.length === 0
            ? <li>No cached assets.</li>
            : cacheKeys.map(key => <li key={key}>{key}</li>)}
      </ul>
    </div>
  );
} 