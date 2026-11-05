import type { Owner } from "./schema";

// The phone-only landing page deliberately creates an unnamed provisional
// contact. Never treat a named landlord sharing its phone as that placeholder.
export function isProvisionalWebOwner(owner: Owner): boolean {
  return !!owner.phone && !owner.email && owner.name === `Husägare · ${owner.phone}` &&
    (owner.notes ?? "").includes("Inkommen från webb (lp-homeowner)");
}
