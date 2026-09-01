import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSET_ROOT = path.join(ROOT, "ad-assets", "meta");
const LOGO_PATH = path.join(ROOT, "public", "stayonsite-logo.png");

const COLORS = {
  blue: "#053C5E",
  orange: "#FF6300",
  white: "#FFFFFF",
};

const cities = [
  ["jonkoping", "JÖNKÖPING"],
  ["kiruna", "KIRUNA"],
  ["gavle", "GÄVLE"],
  ["linkoping", "LINKÖPING"],
  ["goteborg", "GÖTEBORG"],
  ["stockholm", "STOCKHOLM"],
];

const esc = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function svg(width, height, body) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="feedFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${COLORS.blue}" stop-opacity="0" />
          <stop offset="0.28" stop-color="${COLORS.blue}" stop-opacity="0.72" />
          <stop offset="1" stop-color="${COLORS.blue}" stop-opacity="0.98" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#001A2A" flood-opacity="0.28" />
        </filter>
      </defs>
      <style>
        .font { font-family: 'Avenir Next', 'Helvetica Neue', Arial, sans-serif; }
        .bold { font-weight: 700; }
        .medium { font-weight: 600; }
      </style>
      ${body}
    </svg>
  `);
}

function logoCard(width, height, x, y, cardWidth) {
  const cardHeight = Math.round(cardWidth * 0.265);
  return svg(width, height, `
    <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="${Math.round(cardHeight / 2)}" fill="#FFFFFF" fill-opacity="0.94" filter="url(#shadow)" />
  `);
}

function feedOverlay(kind, city) {
  const common = `
    <rect x="0" y="690" width="1080" height="660" fill="url(#feedFade)" />
    <rect x="72" y="778" width="58" height="6" rx="3" fill="${COLORS.orange}" />
  `;

  if (kind === "local") {
    return svg(1080, 1350, `${common}
      <text class="font bold" x="72" y="842" font-size="31" letter-spacing="1.5" fill="${COLORS.orange}">ÄR DU PRIVAT BOSTADSÄGARE I</text>
      <text class="font bold" x="72" y="925" font-size="76" fill="${COLORS.white}">${esc(city)}</text>
      <text class="font medium" x="72" y="982" font-size="30" fill="${COLORS.white}">Ägarlägenhet, villa, radhus</text>
      <text class="font medium" x="72" y="1022" font-size="30" fill="${COLORS.white}">eller separat uthyrningsdel?</text>
      <text class="font medium" x="72" y="1090" font-size="28" fill="${COLORS.white}">För företagspersonal · 0 % avgift</text>
      ${button(72, 1130, 438, 78, "REGISTRERA DIN BOSTAD", 25)}
    `);
  }

  if (kind === "zero") {
    return svg(1080, 1350, `${common}
      <text class="font bold" x="72" y="842" font-size="29" letter-spacing="1.5" fill="${COLORS.orange}">PRIVAT BOSTADSÄGARE?</text>
      <text class="font bold" x="72" y="920" font-size="56" fill="${COLORS.white}">HYR UT TILL FÖRETAG</text>
      <rect x="72" y="964" width="312" height="76" rx="38" fill="${COLORS.orange}" />
      <text class="font bold" x="228" y="1015" text-anchor="middle" font-size="34" fill="${COLORS.white}">0 % AVGIFT</text>
      <text class="font medium" x="72" y="1095" font-size="27" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
      ${button(72, 1135, 438, 78, "REGISTRERA DIN BOSTAD", 25)}
    `);
  }

  return svg(1080, 1350, `${common}
    <text class="font bold" x="72" y="852" font-size="51" fill="${COLORS.white}">VI SÖKER PRIVATPERSONER</text>
    <text class="font bold" x="72" y="918" font-size="51" fill="${COLORS.white}">SOM VILL HYRA UT</text>
    <text class="font medium" x="72" y="988" font-size="29" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
    <text class="font medium" x="72" y="1038" font-size="27" fill="${COLORS.white}">0 % avgift till StayOnSite.</text>
    ${button(72, 1130, 438, 78, "REGISTRERA DIN BOSTAD", 25)}
  `);
}

function verticalOverlay(kind, city) {
  const panel = `
    <rect x="54" y="285" width="972" height="570" rx="36" fill="${COLORS.blue}" fill-opacity="0.91" filter="url(#shadow)" />
    <rect x="112" y="345" width="64" height="7" rx="3.5" fill="${COLORS.orange}" />
  `;

  if (kind === "local") {
    return svg(1080, 1920, `${panel}
      <text class="font bold" x="112" y="415" font-size="33" letter-spacing="1.5" fill="${COLORS.orange}">ÄR DU PRIVAT BOSTADSÄGARE I</text>
      <text class="font bold" x="112" y="515" font-size="78" fill="${COLORS.white}">${esc(city)}</text>
      <text class="font medium" x="112" y="584" font-size="34" fill="${COLORS.white}">Ägarlägenhet, villa, radhus</text>
      <text class="font medium" x="112" y="631" font-size="34" fill="${COLORS.white}">eller separat uthyrningsdel?</text>
      <text class="font medium" x="112" y="700" font-size="31" fill="${COLORS.white}">För företagspersonal · 0 % avgift</text>
      ${button(112, 744, 520, 86, "REGISTRERA DIN BOSTAD", 28)}
    `);
  }

  if (kind === "zero") {
    return svg(1080, 1920, `${panel}
      <text class="font bold" x="112" y="420" font-size="30" letter-spacing="1.5" fill="${COLORS.orange}">PRIVAT BOSTADSÄGARE?</text>
      <text class="font bold" x="112" y="505" font-size="58" fill="${COLORS.white}">HYR UT TILL FÖRETAG</text>
      <rect x="112" y="552" width="330" height="82" rx="41" fill="${COLORS.orange}" />
      <text class="font bold" x="277" y="607" text-anchor="middle" font-size="37" fill="${COLORS.white}">0 % AVGIFT</text>
      <text class="font medium" x="112" y="690" font-size="30" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
      ${button(112, 742, 520, 86, "REGISTRERA DIN BOSTAD", 28)}
    `);
  }

  return svg(1080, 1920, `${panel}
    <text class="font bold" x="112" y="430" font-size="52" fill="${COLORS.white}">VI SÖKER PRIVATPERSONER</text>
    <text class="font bold" x="112" y="500" font-size="52" fill="${COLORS.white}">SOM VILL HYRA UT</text>
    <text class="font medium" x="112" y="580" font-size="32" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
    <text class="font medium" x="112" y="632" font-size="30" fill="${COLORS.white}">0 % avgift till StayOnSite.</text>
    ${button(112, 712, 520, 86, "REGISTRERA DIN BOSTAD", 28)}
  `);
}

function button(x, y, width, height, label, fontSize) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.round(height / 2)}" fill="${COLORS.orange}" filter="url(#shadow)" />
    <text class="font bold" x="${x + width / 2}" y="${y + height / 2 + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" fill="${COLORS.white}">${esc(label)}</text>
  `;
}

function propertyFeedOverlay(property) {
  const possessive = property === "VILLA" ? "DIN VILLA" : "DITT RADHUS";
  return svg(1080, 1350, `
    <rect x="0" y="690" width="1080" height="660" fill="url(#feedFade)" />
    <rect x="72" y="778" width="58" height="6" rx="3" fill="${COLORS.orange}" />
    <text class="font bold" x="72" y="842" font-size="29" letter-spacing="1.5" fill="${COLORS.orange}">PRIVAT BOSTADSÄGARE?</text>
    <text class="font bold" x="72" y="920" font-size="58" fill="${COLORS.white}">HYR UT ${possessive}</text>
    <text class="font medium" x="72" y="988" font-size="29" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
    <text class="font medium" x="72" y="1038" font-size="27" fill="${COLORS.white}">0 % avgift till StayOnSite.</text>
    ${button(72, 1130, 438, 78, "REGISTRERA DIN BOSTAD", 25)}
  `);
}

function propertyVerticalOverlay(property) {
  const possessive = property === "VILLA" ? "DIN VILLA" : "DITT RADHUS";
  return svg(1080, 1920, `
    <rect x="0" y="1420" width="1080" height="500" fill="url(#feedFade)" />
    <rect x="0" y="1790" width="1080" height="130" fill="${COLORS.blue}" fill-opacity="0.98" />
    <rect x="54" y="285" width="972" height="570" rx="36" fill="${COLORS.blue}" fill-opacity="0.91" filter="url(#shadow)" />
    <rect x="112" y="345" width="64" height="7" rx="3.5" fill="${COLORS.orange}" />
    <text class="font bold" x="112" y="420" font-size="30" letter-spacing="1.5" fill="${COLORS.orange}">PRIVAT BOSTADSÄGARE?</text>
    <text class="font bold" x="112" y="510" font-size="60" fill="${COLORS.white}">HYR UT ${possessive}</text>
    <text class="font medium" x="112" y="590" font-size="32" fill="${COLORS.white}">Boendet används av företagspersonal.</text>
    <text class="font medium" x="112" y="642" font-size="30" fill="${COLORS.white}">0 % avgift till StayOnSite.</text>
    ${button(112, 712, 520, 86, "REGISTRERA DIN BOSTAD", 28)}
  `);
}

async function render({ base, out, width, height, overlay, logoX, logoY, logoWidth }) {
  await fs.mkdir(path.dirname(out), { recursive: true });

  const logo = await sharp(LOGO_PATH)
    .resize({ width: logoWidth })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logo).metadata();
  const cardPadX = 26;
  const cardPadY = 19;
  const cardWidth = logoMeta.width + cardPadX * 2;
  const cardHeight = logoMeta.height + cardPadY * 2;

  const baseBuffer = await sharp(base)
    .resize(width, height, { fit: "fill" })
    .png()
    .toBuffer();

  await sharp(baseBuffer)
    .composite([
      { input: overlay, left: 0, top: 0 },
      { input: logoCard(width, height, logoX, logoY, cardWidth), left: 0, top: 0 },
      { input: logo, left: logoX + cardPadX, top: logoY + cardPadY },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out);
}

async function main() {
  const localFeed = path.join(ASSET_ROOT, "local-demand", "raw", "feed-base.png");
  const localVertical = path.join(ASSET_ROOT, "local-demand", "raw", "vertical-base.png");

  for (const [slug, name] of cities) {
    await render({
      base: localFeed,
      out: path.join(ASSET_ROOT, "local-demand", `feed-${slug}-1080x1350.png`),
      width: 1080,
      height: 1350,
      overlay: feedOverlay("local", name),
      logoX: 72,
      logoY: 58,
      logoWidth: 230,
    });
    await render({
      base: localVertical,
      out: path.join(ASSET_ROOT, "local-demand", `vertical-${slug}-1080x1920.png`),
      width: 1080,
      height: 1920,
      overlay: verticalOverlay("local", name),
      logoX: 72,
      logoY: 145,
      logoWidth: 250,
    });
  }

  for (const concept of [
    { slug: "zero-fee", kind: "zero" },
    { slug: "company-only", kind: "company" },
  ]) {
    await render({
      base: path.join(ASSET_ROOT, concept.slug, "raw", "feed-base.png"),
      out: path.join(ASSET_ROOT, concept.slug, "feed-1080x1350.png"),
      width: 1080,
      height: 1350,
      overlay: feedOverlay(concept.kind),
      logoX: 72,
      logoY: 58,
      logoWidth: 230,
    });
    await render({
      base: path.join(ASSET_ROOT, concept.slug, "raw", "vertical-base.png"),
      out: path.join(ASSET_ROOT, concept.slug, "vertical-1080x1920.png"),
      width: 1080,
      height: 1920,
      overlay: verticalOverlay(concept.kind),
      logoX: 72,
      logoY: 145,
      logoWidth: 250,
    });
  }

  for (const property of [
    { slug: "villa", label: "VILLA" },
    { slug: "radhus", label: "RADHUS" },
  ]) {
    const propertyRoot = path.join(ASSET_ROOT, "property-types", property.slug);
    await render({
      base: path.join(propertyRoot, "raw", "feed-base.png"),
      out: path.join(propertyRoot, "feed-1080x1350.png"),
      width: 1080,
      height: 1350,
      overlay: propertyFeedOverlay(property.label),
      logoX: 72,
      logoY: 58,
      logoWidth: 230,
    });
    await render({
      base: path.join(propertyRoot, "raw", "vertical-base.png"),
      out: path.join(propertyRoot, "vertical-1080x1920.png"),
      width: 1080,
      height: 1920,
      overlay: propertyVerticalOverlay(property.label),
      logoX: 72,
      logoY: 145,
      logoWidth: 250,
    });
  }
}

await main();
