import { defineAgent } from "eve";
import { anthropic } from "eve/models/anthropic";

// Opus 5.5 direkt mot Anthropic med Kajsas egen nyckel (ANTHROPIC_API_KEY, samma konto
// som hyresvärdsdialogen i CRM:et). Vercels AI Gateway används inte: Kajsas team har
// gratisnivån, där Opus är spärrad.
//
// Direkt mot Anthropic rapporteras ingen kostnad till eve, så taket räknas på tokens
// med Opus 5.5-priserna per miljon tokens: input 4, output 20, cacheläsning 0,20,
// cacheskrivning högst 8 USD. eve räknar sparad prompt inom inputTokens.
const PRIS = { input: 4, output: 20, cacheLas: 0.2, cacheSkriv: 8 };

export default defineAgent({
  model: anthropic("claude-opus-5-5"),
  reasoning: "medium",
  limits: {
    // Kajsas chatt är ett enda långt samtal. Vid ca 3 USD sedan förra godkännandet frågar
    // agenten om den ska fortsätta, så att en loop aldrig kan dra iväg kostnaden.
    sessionUsage: ({ window }) => {
      const nytt = window.inputTokens - window.cacheReadTokens - window.cacheWriteTokens;
      const usd =
        (nytt * PRIS.input +
          window.cacheWriteTokens * PRIS.cacheSkriv +
          window.cacheReadTokens * PRIS.cacheLas +
          window.outputTokens * PRIS.output) /
        1e6;
      return usd >= 3;
    },
  },
});
