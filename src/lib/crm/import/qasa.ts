// Qasa-import via deras publika GraphQL-API (api.qasa.com/graphql). Mycket stabilare än
// att skrapa HTML. fetchQasaListing() gör nätverksanropet; normalizeQasaHome() är ren och testas.
import { safeFetchPublic } from "@/lib/crm/safe-fetch";
import { applyQasaTraits } from "./traits";
import { emptyListing, type ImportedListing } from "./types";

const QASA_GRAPHQL = "https://api.qasa.com/graphql";

// Bara fält vi faktiskt använder (alla verifierade mot live-schemat).
const HOME_QUERY = `query ImportHome($id: ID!) {
  home(id: $id) {
    id
    bedroomCount
    tenantCount
    rent
    currency
    squareMeters
    furnishedFlexible
    shared
    description
    title
    location { route locality streetNumber postalCode countryCode }
    traits { type }
    uploads { url type }
    duration { startOptimal endOptimal }
    landlord { firstName professional companyName }
  }
}`;

export interface QasaHome {
  id?: string | null;
  bedroomCount?: number | null;
  tenantCount?: number | null;
  rent?: number | null;
  currency?: string | null;
  squareMeters?: number | null;
  furnishedFlexible?: boolean | null;
  shared?: boolean | null;
  description?: string | null;
  title?: string | null;
  location?: {
    route?: string | null;
    locality?: string | null;
    streetNumber?: string | null;
    postalCode?: string | null;
    countryCode?: string | null;
  } | null;
  traits?: { type: string }[] | null;
  uploads?: { url: string; type: string }[] | null;
  duration?: { startOptimal?: string | null; endOptimal?: string | null } | null;
  landlord?: { firstName?: string | null; professional?: boolean | null; companyName?: string | null } | null;
}

function countryFromCode(code: string | null | undefined): string | null {
  if (!code) return null;
  return code.toUpperCase() === "SE" ? "Sverige" : code.toUpperCase();
}

// Qasa-datum kan vara "2026-06-01" eller ISO med tid — klipp till YYYY-MM-DD.
function toDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export function normalizeQasaHome(home: QasaHome, sourceUrl: string): ImportedListing {
  const l = emptyListing("qasa", sourceUrl);
  const loc = home.location ?? {};

  const street = [loc.route, loc.streetNumber].filter(Boolean).join(" ").trim();
  l.address = street || null;
  l.postalCode = loc.postalCode ?? null;
  l.city = loc.locality ?? null;
  l.country = countryFromCode(loc.countryCode);

  l.squareMeters = typeof home.squareMeters === "number" ? home.squareMeters : null;
  l.bedrooms = typeof home.bedroomCount === "number" ? home.bedroomCount : null;
  // Bäddar finns inte direkt — max antal hyresgäster är bästa proxy (Kajsa justerar).
  l.beds = typeof home.tenantCount === "number" ? home.tenantCount : null;

  // Hyra: bara om angiven i SEK (annars lämnar vi den åt Kajsa).
  if (typeof home.rent === "number" && (!home.currency || home.currency.toUpperCase() === "SEK")) {
    l.rentIn = home.rent;
  }

  if (home.furnishedFlexible != null) l.furnished = !!home.furnishedFlexible;
  if (home.shared != null) l.egetBoende = !home.shared;

  const desc = (home.description ?? "").trim() || null;
  l.notes = desc;
  l.publicDescription = desc;

  l.moveInFrom = toDate(home.duration?.startOptimal);
  l.availableTo = toDate(home.duration?.endOptimal);

  if (home.landlord) {
    const company = (home.landlord.companyName ?? "").trim();
    const first = (home.landlord.firstName ?? "").trim();
    l.ownerName = company || first || null;
    if (home.landlord.professional != null) {
      l.ownerType = home.landlord.professional ? "foretag" : "privatperson";
    } else if (company) {
      l.ownerType = "foretag";
    }
  }

  applyQasaTraits(l, (home.traits ?? []).map((t) => t.type));

  // Endast riktiga bostadsfoton — explicit allowlist så planritningar (floor_plan_picture)
  // eller framtida otaggade typer inte hamnar i galleriet/som publik huvudbild.
  l.imageUrls = (home.uploads ?? [])
    .filter((u) => u && u.url && u.type === "home_picture")
    .map((u) => u.url)
    .slice(0, 15);

  return l;
}

export async function fetchQasaListing(id: string, sourceUrl: string): Promise<ImportedListing> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    // Fast värd, men går via safeFetchPublic för samma protokoll-/port-/redirect-skydd som övriga anrop.
    res = await safeFetchPublic(QASA_GRAPHQL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
      },
      body: JSON.stringify({ query: HOME_QUERY, variables: { id } }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) throw new Error(`Qasa svarade ${res.status}`);
  const json = (await res.json()) as { data?: { home?: QasaHome | null }; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(`Qasa-fel: ${json.errors[0].message}`);
  const home = json.data?.home;
  if (!home || !home.id) throw new Error("Hittade ingen annons på den länken (Qasa)");

  return normalizeQasaHome(home, sourceUrl);
}
