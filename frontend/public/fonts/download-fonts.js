import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = [
  { weight: 400, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc0_24KjIVe2nIrH2dEz8kSDc0.woff2', file: 'Manrope-400.woff2' },
  { weight: 400, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc0_24KjIVe2nIrH2dEz8kSDc1.woff', file: 'Manrope-400.woff' },
  { weight: 500, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzxU1Pdcbh8k.woff2', file: 'Manrope-500.woff2' },
  { weight: 500, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzxU1Pdcbh8l.woff', file: 'Manrope-500.woff' },
  { weight: 600, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz7k1Pdcbh8k.woff2', file: 'Manrope-600.woff2' },
  { weight: 600, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz7k1Pdcbh8l.woff', file: 'Manrope-600.woff' },
  { weight: 700, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz5k1Pdcbh8k.woff2', file: 'Manrope-700.woff2' },
  { weight: 700, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEz5k1Pdcbh8l.woff', file: 'Manrope-700.woff' },
  { weight: 800, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzyk1Pdcbh8k.woff2', file: 'Manrope-800.woff2' },
  { weight: 800, url: 'https://fonts.gstatic.com/s/manrope/v15/NWc1_24KjIVe2nIrH2dEzyk1Pdcbh8l.woff', file: 'Manrope-800.woff' }
];

const downloadFont = (fontObj) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, fontObj.file);
    const file = fs.createWriteStream(filePath);
    
    https.get(fontObj.url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${fontObj.file}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Failed to download ${fontObj.file}: ${err.message}`);
      reject(err);
    });
  });
};

const downloadAllFonts = async () => {
  console.log('Starting font downloads...\n');
  
  for (const font of fonts) {
    try {
      await downloadFont(font);
    } catch (error) {
      console.error(`Error downloading ${font.file}`);
    }
  }
  
  console.log('\n✓ Font download complete!');
  console.log('\nDownloaded files:');
  const files = fs.readdirSync(__dirname).filter(f => f.startsWith('Manrope-'));
  files.forEach(file => console.log(`  - ${file}`));
};

downloadAllFonts();
