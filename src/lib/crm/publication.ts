// Publicering på hemsidan och objektets tillgänglighetsstatus är samma publika
// beslut: /boenden visar bara objekt som både är publicerade och tillgängliga.
// Alla publiceringsytor använder därför samma patch så att en delad länk aldrig
// pekar på en avsiktligt dold 404-sida.
export function publicListingPatch(published: boolean) {
  return published
    ? ({ published: true, status: "available" } as const)
    : ({ published: false } as const);
}
