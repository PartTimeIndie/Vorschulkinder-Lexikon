import { set, get, del } from 'idb-keyval';

function getCacheKey(url, version = '') {
  return `assetcache_${url}_${version}`;
}

/**
 * Fetches an asset (image, audio, etc.) from cache or downloads and stores it as a Base64 string.
 * @param {string} url - The asset URL.
 * @param {string} version - Optional version string for cache busting.
 * @returns {Promise<string>} - Base64 string of the asset.
 */
export async function getCachedAsset(url, version = '') {
  if (!url || url === 'null' || url === '/null') return null;
  const cacheKey = getCacheKey(url, version);
  try {
    const cached = await get(cacheKey);
    if (cached) return cached;
  } catch (e) {
    console.warn('AssetCache: IndexedDB not available', e);
  }

  // Fetch and cache asset as Base64
  const response = await fetch(url);
  if (!response.ok) throw new Error('Asset download failed: ' + url);
  const blob = await response.blob();
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  try {
    await set(cacheKey, base64);
  } catch (e) {
    console.warn('AssetCache: IndexedDB full or error, cannot cache asset', e);
  }

  return base64;
}

/**
 * Removes a cached asset from IndexedDB.
 * @param {string} url - The asset URL.
 * @param {string} version - Optional version string for cache busting.
 */
export async function clearCachedAsset(url, version = '') {
  const cacheKey = getCacheKey(url, version);
  await del(cacheKey);
}

/**
 * Fetches a JSON file from cache or downloads and stores it as a string.
 * @param {string} url - The JSON URL.
 * @param {string} version - Optional version string for cache busting.
 * @returns {Promise<any>} - Parsed JSON object.
 */
export async function getCachedJson(url, version = '') {
  const cacheKey = getCacheKey(url, version) + '_json';
  try {
    const cached = await get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('AssetCache: IndexedDB not available', e);
  }

  // Fetch and cache JSON as text
  const response = await fetch(url);
  if (!response.ok) throw new Error('JSON download failed: ' + url);
  const text = await response.text();

  try {
    await set(cacheKey, text);
  } catch (e) {
    console.warn('AssetCache: IndexedDB full or error, cannot cache JSON', e);
  }

  return JSON.parse(text);
}

/**
 * Extracts all referenced image and audio asset URLs from category and animal data.
 * @param {object} categoryData - The main category JSON (with subcategories).
 * @param {object} animalData - The animal entries JSON (with tiere array).
 * @returns {string[]} Array of asset URLs (relative to public/)
 */
export function extractAllReferencedAssetUrls(categoryData, animalData) {
  const urls = new Set();

  // Main category image/audio
  if (categoryData.image && categoryData.image.path) urls.add(categoryData.image.path);
  if (categoryData.audio && categoryData.audio.path) urls.add(categoryData.audio.path);

  // Subcategories
  if (Array.isArray(categoryData.subcategories)) {
    for (const sub of categoryData.subcategories) {
      if (sub.image && sub.image.path) urls.add(sub.image.path);
      if (sub.audio && sub.audio.path) urls.add(sub.audio.path);
    }
  }

  // Animals
  if (animalData && Array.isArray(animalData.tiere)) {
    for (const animal of animalData.tiere) {
      if (animal.image && animal.image.path) urls.add(animal.image.path);
      if (animal.audio && animal.audio.path) urls.add(animal.audio.path);
    }
  }

  // Return as array, prefix with '/' for fetch
  return Array.from(urls).map(path => path.startsWith('/') ? path : '/' + path);
}

/**
 * Fetches the list of all files to be downloaded for offline use.
 * @returns {Promise<string[]>} Array of asset URLs (relative to public/)
 */
export async function getOfflineAssetFileList() {
  const res = await fetch('/offlineAssetFileList.json');
  if (!res.ok) throw new Error('Failed to fetch offline asset file list');
  return await res.json();
} 