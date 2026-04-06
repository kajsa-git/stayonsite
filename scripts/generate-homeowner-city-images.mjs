#!/usr/bin/env node

/**
 * Generate city-specific hero images for homeowner pages via nanobanana.
 * Usage: GEMINI_API_KEY=... node scripts/generate-homeowner-city-images.mjs
 */

import { execSync } from 'child_process';
import { existsSync, renameSync, readdirSync } from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY not set');
  process.exit(1);
}

const OUTPUT_DIR = path.resolve('public/images/homeowner-cities');

// City descriptions for image prompts
const cities = [
  { slug: 'stockholm', prompt: 'Stockholm archipelago, waterfront residential area with traditional Swedish buildings, Gamla Stan visible in distance' },
  { slug: 'goteborg', prompt: 'Gothenburg residential neighborhood, typical Swedish row houses near harbor, west coast atmosphere' },
  { slug: 'malmo', prompt: 'Malmö residential area, Turning Torso visible in background, Öresund bridge, flat Skåne landscape' },
  { slug: 'uppsala', prompt: 'Uppsala residential area, Uppsala cathedral spires visible in background, university town atmosphere' },
  { slug: 'vasteras', prompt: 'Västerås lakeside residential area, Lake Mälaren, traditional Swedish houses' },
  { slug: 'orebro', prompt: 'Örebro residential neighborhood, Örebro castle visible in distance, flat central Sweden landscape' },
  { slug: 'linkoping', prompt: 'Linköping residential area, Östergötland plains, typical Swedish suburban homes' },
  { slug: 'helsingborg', prompt: 'Helsingborg residential area, view towards Öresund strait, coastal Swedish town' },
  { slug: 'jonkoping', prompt: 'Jönköping lakeside residential area, Lake Vättern, Småland forests in background' },
  { slug: 'norrkoping', prompt: 'Norrköping residential neighborhood, industrial heritage buildings, Motala ström river' },
  { slug: 'gavle', prompt: 'Gävle residential area, traditional wooden houses, Norrland coastal town' },
  { slug: 'boden', prompt: 'Boden northern Sweden residential area, pine forests, snow-dusted landscape, military town heritage' },
  { slug: 'saffle', prompt: 'Säffle small Swedish town, Lake Vänern nearby, Värmland countryside, cozy wooden houses' },
  { slug: 'vingaker', prompt: 'Vingåker small Sörmland town, rural Swedish landscape, traditional red wooden houses' },
  { slug: 'vastervik', prompt: 'Västervik coastal residential area, Baltic Sea archipelago, charming seaside town' },
  { slug: 'motala', prompt: 'Motala residential area, Lake Vättern shoreline, Göta kanal heritage' },
  { slug: 'lulea', prompt: 'Luleå northern Sweden residential area, Bothnian Bay, arctic landscape, colorful wooden houses' },
  { slug: 'oskarshamn', prompt: 'Oskarshamn coastal residential area, Småland coast, harbor town atmosphere' },
  { slug: 'monsteras', prompt: 'Mönsterås small coastal town, Småland, industrial harbor, traditional Swedish neighborhood' },
  { slug: 'umea', prompt: 'Umeå residential area, birch trees lining streets, university town in northern Sweden' },
  { slug: 'skelleftea', prompt: 'Skellefteå northern Sweden residential area, Skellefte river, Northvolt battery factory area' },
  { slug: 'karlstad', prompt: 'Karlstad residential area, Klarälven river delta, Värmland, sunny Swedish town' },
  { slug: 'ostersund', prompt: 'Östersund residential area, Lake Storsjön, Jämtland mountains in background, winter atmosphere' },
  { slug: 'eskilstuna', prompt: 'Eskilstuna residential neighborhood, Eskilstunaån river, Sörmland industrial town' },
  { slug: 'lund', prompt: 'Lund residential area, university town, Lund cathedral visible, Skåne brick architecture' },
  { slug: 'kiruna', prompt: 'Kiruna arctic residential area, midnight sun atmosphere, mountain landscape, colorful houses' },
  { slug: 'gallivare', prompt: 'Gällivare northern mining town, Lapland landscape, pine forests, small Swedish community' },
  { slug: 'halmstad', prompt: 'Halmstad coastal residential area, Halland beaches, west coast Swedish town' },
  { slug: 'falun', prompt: 'Falun residential area, Dalarna red-painted wooden houses, copper mine heritage town' },
  { slug: 'ludvika', prompt: 'Ludvika small Dalarna town, lakes and forests, industrial heritage, traditional houses' },
  { slug: 'nykoping', prompt: 'Nyköping residential area, Sörmland coast, Nyköpingshus castle area, charming town' },
  { slug: 'ornskoldsvik', prompt: 'Örnsköldsvik residential area, Ångermanland coast, High Coast landscape, northern town' },
];

const BASE_PROMPT = 'Photorealistic Swedish residential neighborhood scene. Well-maintained homes, warm inviting atmosphere, golden hour light. No people, no text. High quality architectural photography style.';

async function generateImage(city) {
  const outPath = path.join(OUTPUT_DIR, `${city.slug}.webp`);

  if (existsSync(outPath)) {
    console.log(`⏭  ${city.slug} — already exists, skipping`);
    return;
  }

  const prompt = `${BASE_PROMPT} Location: ${city.prompt}.`;
  console.log(`🎨 Generating ${city.slug}...`);

  try {
    execSync(
      `npx @giorgioliapakis/nanobanana generate "${prompt.replace(/"/g, '\\"')}" -o "${OUTPUT_DIR}" --aspect 16:9`,
      {
        env: { ...process.env, GEMINI_API_KEY: API_KEY },
        stdio: 'pipe',
        timeout: 120000,
      }
    );

    // Nanobanana outputs PNG with auto-generated filename, rename to city slug
    const files = readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png') && !cities.some(c => f === `${c.slug}.png` || f === `${c.slug}.webp`))
      .sort((a, b) => {
        const statA = new Date(0); // fallback
        const statB = new Date(0);
        return statB.getTime() - statA.getTime();
      });

    // Find the newest PNG that isn't already named as a city
    const allPngs = readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));
    if (allPngs.length > 0) {
      const newest = allPngs[allPngs.length - 1];
      const pngPath = path.join(OUTPUT_DIR, newest);
      const targetPng = path.join(OUTPUT_DIR, `${city.slug}.png`);
      if (pngPath !== targetPng) {
        renameSync(pngPath, targetPng);
      }
      // Convert to webp using sharp or cwebp
      try {
        execSync(`npx sharp-cli -i "${targetPng}" -o "${outPath}" --quality 80`, { stdio: 'pipe' });
      } catch {
        // Fallback: just rename png
        renameSync(targetPng, outPath);
      }
      // Clean up png if webp exists
      if (existsSync(outPath) && existsSync(targetPng)) {
        try { execSync(`rm "${targetPng}"`, { stdio: 'pipe' }); } catch {}
      }
    }

    console.log(`✅ ${city.slug} done`);
  } catch (err) {
    console.error(`❌ ${city.slug} failed:`, err.message?.slice(0, 200));
  }
}

// Run sequentially to avoid rate limits
async function main() {
  console.log(`Generating ${cities.length} city images...`);
  for (const city of cities) {
    await generateImage(city);
  }
  console.log('Done!');
}

main();
