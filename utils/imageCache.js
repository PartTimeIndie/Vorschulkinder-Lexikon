import { set, get, del } from 'idb-keyval';

// Image Cache Utility for Base64-Caching in Local Storage with 7-day expiry
const DEFAULT_EXPIRY_DAYS = 7;

function getCacheKey(url, version = '') {
  return `imgcache_${url}_${version}`;
}

function getExpiryKey(url, version = '') {
  return `imgcache_expiry_${url}_${version}`;
}

export async function getCachedImage(url, version = '', expiryDays = DEFAULT_EXPIRY_DAYS) {
  const cacheKey = getCacheKey(url, version);
  const expiryKey = getExpiryKey(url, version);
  const now = Date.now();

  try {
    const expiry = await get(expiryKey);
    if (expiry && parseInt(expiry, 10) > now) {
      const cached = await get(cacheKey);
      if (cached) return cached;
    } else {
      // Expired: Clean up
      await del(cacheKey);
      await del(expiryKey);
    }
  } catch (e) {
    // IndexedDB may be unavailable
    console.warn('ImageCache: IndexedDB not available', e);
  }

  // Fetch and cache image as Base64
  const response = await fetch(url);
  if (!response.ok) throw new Error('Image download failed: ' + url);
  const blob = await response.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  try {
    await set(cacheKey, base64);
    await set(expiryKey, (now + expiryDays * 24 * 60 * 60 * 1000).toString());
  } catch (e) {
    // IndexedDB full or error
    console.warn('ImageCache: IndexedDB full or error, cannot cache image', e);
  }

  return base64;
}

export async function clearCachedImage(url, version = '') {
  const cacheKey = getCacheKey(url, version);
  const expiryKey = getExpiryKey(url, version);
  await del(cacheKey);
  await del(expiryKey);
} 