import React, { useState, useEffect } from 'react';
import Head from 'next/head';

function getAllImageCacheKeys() {
  return Object.keys(localStorage).filter(key => key.startsWith('imgcache_') && !key.startsWith('imgcache_expiry_'));
}

export default function DebugPage() {
  const [cacheKeys, setCacheKeys] = useState(null); // null = not loaded yet
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCacheKeys(getAllImageCacheKeys());
    }
  }, []);

  const handleClearCache = () => {
    const keys = getAllImageCacheKeys();
    keys.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(key.replace('imgcache_', 'imgcache_expiry_'));
    });
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
        Clear Image Cache
      </button>
      {cleared && <div style={{ color: 'green', marginTop: 16 }}>Image cache cleared!</div>}
      <h2 style={{ marginTop: 32 }}>Cached Image Keys</h2>
      <ul style={{ maxHeight: 300, overflowY: 'auto', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
        {cacheKeys === null
          ? <li>Loading...</li>
          : cacheKeys.length === 0
            ? <li>No cached images.</li>
            : cacheKeys.map(key => <li key={key}>{key}</li>)}
      </ul>
    </div>
  );
} 