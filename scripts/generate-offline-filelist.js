// Node.js script to generate a flat file list for offline asset download
const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/offlineAssetFolders.json');
const publicDir = path.join(__dirname, '../public');
const outputPath = path.join(__dirname, '../public/offlineAssetFileList.json');

function isImageFile(filename) {
  return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(filename);
}

function walkDir(dir, recursive) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        results = results.concat(walkDir(fullPath, recursive));
      }
    } else {
      // Store as web path
      const rel = '/' + path.relative(publicDir, fullPath).replace(/\\/g, '/');
      results.push(rel);
    }
  }
  return results;
}

function getRootImages() {
  const files = fs.readdirSync(publicDir, { withFileTypes: true });
  return files
    .filter(f => f.isFile() && isImageFile(f.name))
    .map(f => '/' + f.name);
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let allFiles = [];
  for (const folder of manifest.folders) {
    const abs = path.join(publicDir, folder.path);
    if (fs.existsSync(abs)) {
      allFiles = allFiles.concat(walkDir(abs, folder.recursive));
    }
  }
  if (manifest.rootImages) {
    allFiles = allFiles.concat(getRootImages());
  }
  // Remove duplicates
  allFiles = Array.from(new Set(allFiles));
  fs.writeFileSync(outputPath, JSON.stringify(allFiles, null, 2));
  console.log(`Wrote ${allFiles.length} files to offlineAssetFileList.json`);
}

main(); 