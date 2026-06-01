import { describe, expect, it } from "vitest";
import { detectListing } from "./url";

describe("detectListing", () => {
  it("känner igen en Qasa-länk med locale-prefix", () => {
    const d = detectListing("https://qasa.com/se/sv/home/1383062");
    expect(d).toEqual({ source: "qasa", id: "1383062", canonicalUrl: "https://qasa.com/se/sv/home/1383062" });
  });

  it("känner igen Qasa utan protokoll och med query", () => {
    const d = detectListing("qasa.com/se/en/home/999?utm_source=x");
    expect(d?.source).toBe("qasa");
    expect(d?.id).toBe("999");
    expect(d?.canonicalUrl).toBe("https://qasa.com/se/en/home/999"); // query bortstädad
  });

  it("känner igen en Airbnb-rums-länk och städar bort spårnings-query", () => {
    const d = detectListing(
      "https://www.airbnb.se/rooms/828291001516135667?check_in=2026-06-20&source_impression_id=p3_x",
    );
    expect(d).toEqual({
      source: "airbnb",
      id: "828291001516135667",
      canonicalUrl: "https://www.airbnb.se/rooms/828291001516135667",
    });
  });

  it("hanterar airbnb.com och /rooms/plus/", () => {
    expect(detectListing("https://airbnb.com/rooms/plus/123")?.id).toBe("123");
    expect(detectListing("https://www.airbnb.com/rooms/456")?.source).toBe("airbnb");
  });

  it("avvisar okända/ogiltiga länkar", () => {
    expect(detectListing("https://booking.com/hotel/se/x.html")).toBeNull();
    expect(detectListing("https://qasa.com/se/sv/find-home")).toBeNull();
    expect(detectListing("inte en url")).toBeNull();
    expect(detectListing("")).toBeNull();
  });
});
