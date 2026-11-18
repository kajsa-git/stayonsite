import { defineAgent } from "eve";

// Opus 5.5 via Vercel AI Gateway: på Vercel autentiseras den med projektets OIDC-token,
// och kostnaden debiteras Kajsas Vercel-konto. Gatewayn rapporterar kostnad per steg,
// så taket nedan räknas i US-dollar utan egen prislista.
export default defineAgent({
  model: "anthropic/claude-opus-5.5",
  reasoning: "medium",
  limits: {
    // Kajsas chatt är ett enda långt samtal. Vid ca 3 USD sedan förra godkännandet frågar
    // agenten om den ska fortsätta, så att en loop aldrig kan dra iväg kostnaden.
    sessionUsage: ({ window }) => (window.costUsd ?? 0) >= 3,
  },
});
