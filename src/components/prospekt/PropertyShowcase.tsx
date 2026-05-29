import { Check, DoorClosed, MapPin, Sofa } from "lucide-react";
import type { PublicProperty } from "@/lib/crm/public-property";
import { ProspektGallery } from "@/components/prospekt/ProspektGallery";
import { ProspektMap } from "@/components/prospekt/ProspektMap";
import { T, type Lang } from "@/components/prospekt/prospekt-i18n";

const editorial = { fontFamily: "var(--font-playfair), Georgia, serif" } as const;

// Delat innehållsblock för publika objekt-sidor (prospekt + /boenden/[slug]).
// Renderar sektionerna som direkta barn (ingen yttre container) så att förälderns
// `space-y-*` styr mellanrummen och varje sida kan lägga till egen CTA i samma flöde.
// Endast tenant-säker data renderas — aldrig adress, ägare eller pris.
export function PropertyShowcase({
  data,
  lang,
  title,
}: {
  data: PublicProperty;
  lang: Lang;
  title: string;
}) {
  const { row: p, images, mapCoords, mapArea } = data;
  const tr = T[lang];

  const description =
    (lang === "en" ? p.publicDescriptionEn : lang === "pl" ? p.publicDescriptionPl : null) || p.publicDescription;
  const skick = (lang === "en" ? p.skickEn : lang === "pl" ? p.skickPl : null) || p.skick;
  const localInclusions = lang === "en" ? p.inclusionsEn : lang === "pl" ? p.inclusionsPl : null;
  const inclusions = (localInclusions && localInclusions.length ? localInclusions : p.inclusions) ?? [];
  const distances = (p.distances ?? []).filter((d) => d.label?.trim());

  const highlights = [
    p.furnished && { label: tr.hl.furnished, Icon: Sofa },
    p.egetBoende && { label: tr.hl.eget, Icon: DoorClosed },
  ].filter(Boolean) as { label: string; Icon: typeof Sofa }[];

  const facts: { label: string; value: string }[] = [
    p.squareMeters != null && { label: tr.f.area, value: `${p.squareMeters} m²` },
    p.bedrooms != null && { label: tr.f.bedrooms, value: String(p.bedrooms) },
    p.beds != null && { label: tr.f.beds, value: String(p.beds) },
    p.bathrooms != null && { label: tr.f.bathrooms, value: String(p.bathrooms) },
    p.washingMachines != null && { label: tr.f.washer, value: String(p.washingMachines) },
    p.dryers != null && { label: tr.f.dryer, value: String(p.dryers) },
    p.dishwasher && { label: tr.f.dishwasher, value: lang === "en" ? "Yes" : lang === "pl" ? "Tak" : "Ja" },
    p.parkingSpaces != null && { label: tr.f.parking, value: `${p.parkingSpaces} ${tr.parkingUnit}` },
    p.moveInFrom && { label: tr.f.from, value: p.moveInFrom },
    p.availableTo && { label: tr.f.to, value: p.availableTo },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {/* Title */}
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-nordic-100 px-3 py-1 text-xs font-medium text-nordic-700">
          <MapPin className="h-3.5 w-3.5 text-[#ff6300]" />
          {[p.postalCode, p.city].filter(Boolean).join(" ") || "Sverige"}
        </div>
        <h1 className="text-[2.1rem] leading-[1.1] tracking-tight text-nordic-900" style={editorial}>
          {title}
        </h1>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {highlights.map(({ label, Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ff6300]">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-medium text-nordic-900">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Gallery */}
      <ProspektGallery images={images} imagesLabel={tr.photos(images.length)} />

      {/* Description */}
      {description && (
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-nordic-800">{description}</p>
      )}

      {/* Facts */}
      {facts.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.details}</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl border bg-white px-4 py-3">
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-nordic-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Vad ingår */}
      {inclusions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.included}</h2>
          <ul className="divide-y rounded-xl border bg-white">
            {inclusions.map((item, i) => (
              <li key={i} className="flex items-center gap-3 px-4 py-3 text-[15px] text-nordic-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ff6300]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skick */}
      {skick && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.condition}</h2>
          <p className="whitespace-pre-wrap text-[15px] text-nordic-800">{skick}</p>
        </div>
      )}

      {/* Avstånd */}
      {distances.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.distancesTitle}</h2>
          <ul className="divide-y rounded-xl border bg-white">
            {distances.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[15px] text-nordic-900">
                <span>{d.label}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  {d.km > 0 && <span className="text-sm text-muted-foreground">{d.km} km</span>}
                  {d.minutes > 0 && <span className="font-semibold text-[#ff6300]">{d.minutes} min</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Karta — områdesnivå (cirkel runt området, aldrig exakt adress) */}
      {mapCoords && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{tr.mapTitle}</h2>
          <div className="overflow-hidden rounded-xl border bg-white">
            <ProspektMap lat={mapCoords.lat} lng={mapCoords.lng} />
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-nordic-800">
              <MapPin className="h-4 w-4 shrink-0 text-[#ff6300]" />
              {mapArea}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
