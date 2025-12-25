import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function createOgImage() {
  const heroPath = path.join(rootDir, 'public/images/hero-main.jpg');
  const outputPath = path.join(rootDir, 'public/images/og-image.jpg');

  // Create SVG overlay with logo and dark gradient
  const svgOverlay = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(21,37,45);stop-opacity:0.85" />
          <stop offset="100%" style="stop-color:rgb(21,37,45);stop-opacity:0.6" />
        </linearGradient>
      </defs>

      <!-- Dark overlay -->
      <rect width="100%" height="100%" fill="url(#overlay)"/>

      <!-- Logo text -->
      <text x="600" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white">
        Stay<tspan fill="#ff6300">On</tspan>Site
      </text>

      <!-- Tagline -->
      <text x="600" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)">
        Corporate Housing Sweden
      </text>

      <!-- Sub-tagline -->
      <text x="600" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)">
        Fully furnished apartments for business teams
      </text>
    </svg>
  `;

  try {
    // Process the hero image
    await sharp(heroPath)
      // Resize and crop to OG dimensions (center crop)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      // Composite the SVG overlay
      .composite([
        {
          input: Buffer.from(svgOverlay),
          top: 0,
          left: 0
        }
      ])
      // Output as JPEG with good quality
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log('✅ OG image created successfully at:', outputPath);
  } catch (error) {
    console.error('❌ Error creating OG image:', error);
    process.exit(1);
  }
}

createOgImage();
