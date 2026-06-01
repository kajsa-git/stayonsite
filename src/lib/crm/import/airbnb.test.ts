import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAirbnbHtml } from "./airbnb";

const html = fs.readFileSync(path.join(__dirname, "__fixtures__", "airbnb-room.html"), "utf-8");
const l = parseAirbnbHtml(html, "https://www.airbnb.se/rooms/828291001516135667");

describe("parseAirbnbHtml", () => {
  it("läser namn/beskrivning ur JSON-LD", () => {
    expect(l.notes).toContain("Mysig lägenhet nära centrum");
    expect(l.publicDescription).toContain("Ett lugnt ställe");
  });

  it("dedupar och tar bilder ur JSON-LD", () => {
    expect(l.imageUrls).toContain("https://a0.muscache.com/im/pictures/9bce34b6.jpg");
    expect(l.imageUrls).toHaveLength(2); // tre i källan, en dubblett
  });

  it("parsar rum/bäddar/badrum ur sammanfattningstiteln", () => {
    expect(l.bedrooms).toBe(1);
    expect(l.beds).toBe(1);
    expect(l.bathrooms).toBe(1);
  });

  it("använder områdets/ortens namn (addressLocality), aldrig länsnamnet", () => {
    expect(l.city).toBe("Örnsro"); // områdets namn — INTE länet "Örebro"
    expect(l.country).toBe("Sverige");
  });

  it("REGRESSION: får aldrig bli länsnamnet för affärskritiska orter (Boden → ej 'Norrbottens')", () => {
    const boden = `<!doctype html><html><head>
<script type="application/ld+json">{"@type":"VacationRental","name":"Hus i Boden","image":["https://a0.muscache.com/im/x.jpg"],"address":{"addressLocality":"Boden"}}</script>
</head><body>
<script id="data-deferred-state-0" type="application/json">{"a":{"sharingConfig":{"title":"Hus · Boden · 2 sovrum · 3 sängar · 1 badrum","location":"Boden, Norrbottens län, Sverige","propertyType":"Hela boendet (hus)"}}}</script>
</body></html>`;
    const b = parseAirbnbHtml(boden, "https://www.airbnb.se/rooms/1");
    expect(b.city).toBe("Boden");
    expect(b.city).not.toBe("Norrbottens");
    expect(b.bedrooms).toBe(2);
    expect(b.beds).toBe(3);
    expect(b.bathrooms).toBe(1);
  });

  it("läser inte rumssiffror ur state-blobben när titeln saknas (hellre tomt än fel)", () => {
    const noTitle = `<!doctype html><html><head>
<script type="application/ld+json">{"@type":"VacationRental","name":"X","image":["https://a0.muscache.com/im/y.jpg"]}</script>
</head><body>
<script id="data-deferred-state-0" type="application/json">{"junk":{"reviews":7,"label":"Information om badrum"},"beds":{"sängkläder":3}}</script>
</body></html>`;
    const n = parseAirbnbHtml(noTitle, "https://www.airbnb.se/rooms/2");
    expect(n.bathrooms).toBeNull(); // ska INTE plocka "7 ... badrum" ur bloben
    expect(n.beds).toBeNull(); // ska INTE plocka "3 ... sängkläder"
  });

  it("flaggar eget boende från propertyType", () => {
    expect(l.egetBoende).toBe(true);
  });

  it("mappar tillgängliga bekvämligheter till fält", () => {
    expect(l.kitchen).toBe(true);
    expect(l.dishwasher).toBe(true);
    expect(l.broadband).toBe(true);
    expect(l.washingMachines).toBe(1);
    expect(l.linensIncluded).toBe(true);
    expect(l.heatWaterIncluded).toBe(true);
  });

  it("ignorerar icke-tillgängliga bekvämligheter (torktumlare available:false)", () => {
    expect(l.dryers).toBeNull();
  });

  it("filtrerar bort säkerhets-/övervakningsbrus ur 'vad ingår'", () => {
    expect(l.inclusions).toContain("Kök");
    expect(l.inclusions).toContain("Badkar");
    expect(l.inclusions).not.toContain("Brandvarnare");
    expect(l.inclusions.some((x) => /övervakningskamer/i.test(x))).toBe(false);
  });

  it("exponerar ingen exakt adress (Airbnb döljer den)", () => {
    expect(l.address).toBeNull();
  });
});
