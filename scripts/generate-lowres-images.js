const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const jobs = [
  {
    srcDir: 'public/images',
    outDir: 'public/images/lowres',
  },
  {
    srcDir: 'public/kategorien/images',
    outDir: 'public/kategorien/images/lowres',
  }
];

const resizeImages = async (srcDir, outDir) => {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const outputPath = path.join(outDir, file);
    await sharp(inputPath)
      .resize(300, 300, { fit: 'inside' })
      .png({ quality: 75 })
      .toFile(outputPath);
    console.log(`Resized: ${file}`);
  }
};

(async () => {
  for (const job of jobs) {
    await resizeImages(job.srcDir, job.outDir);
  }
  console.log('All images resized!');
})(); 