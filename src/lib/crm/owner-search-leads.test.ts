import { describe, expect, it } from "vitest";
import { filterOwnerSearchLeads, isOwnerSearchCity, ownerSearchCities, type OwnerSearchLead } from "./owner-search-leads";

const daniel: OwnerSearchLead = {
  id: "daniel", name: "GM Invest AB", contactPerson: "Daniel", phone: "+46766108808", email: null,
  cities: ownerSearchCities("Fastighetsägare att kontakta.\nSökorter: Örebro, Knivsta, Uppsala.\nTillgänglighet behöver bekräftas."),
};

describe("uthyrare i bostadssökning", () => {
  it("läser bara uttryckligen angivna sökorter", () => {
    expect(daniel.cities).toEqual(["Örebro", "Knivsta", "Uppsala"]);
    expect(ownerSearchCities("Frågade om Stockholm, men hade inga bostäder där.")).toEqual([]);
    expect(ownerSearchCities("Sökorter:\nHar inga bostäder i Stockholm.")).toEqual([]);
    expect(ownerSearchCities("Sökorter: Gävle/Sandviken och Boden; GÄVLE.")).toEqual(["GÄVLE", "Sandviken", "Boden"]);
  });

  it.each(["Örebro", "orebro", "Knivsta", "Uppsala"])("hittar Daniel i %s utan ett bostadsobjekt", (city) => {
    expect(filterOwnerSearchLeads([daniel], { city })).toEqual([daniel]);
    expect(filterOwnerSearchLeads([daniel], { query: city })).toEqual([daniel]);
    expect(isOwnerSearchCity([daniel], city)).toBe(true);
  });

  it("visar inte kontakten vid en annan ort eller en tom sökning", () => {
    expect(filterOwnerSearchLeads([daniel], { city: "Boden" })).toEqual([]);
    expect(filterOwnerSearchLeads([daniel], {})).toEqual([]);
    expect(filterOwnerSearchLeads([daniel], { city: "Örebro", ownerId: "annan" })).toEqual([]);
  });
});
