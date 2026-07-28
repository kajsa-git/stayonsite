/**
 * Senaste materiella innehållsuppdatering för statiska sidor + stadssidor.
 * Används som lastmod i sitemap och dateModified i JSON-LD istället för byggdatum
 * (byggdatum vid varje deploy är ett missvisande färskhetssignal). Bumpa detta
 * datum när stads-/sidinnehåll uppdateras på riktigt. Blogg och boenden har egna
 * datum och påverkas inte.
 */
export const CONTENT_UPDATED = '2026-07-28'

/**
 * Truncate a description to fit within meta description limits (155 chars).
 * Cuts at the last sentence boundary before the limit, or at the last word boundary.
 */
export function truncateDescription(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text

  // Try to cut at sentence boundary (. or !)
  const truncated = text.slice(0, maxLength)
  const lastSentence = truncated.lastIndexOf('. ')
  if (lastSentence > 80) {
    return text.slice(0, lastSentence + 1)
  }

  // Fall back to word boundary
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 80) {
    return text.slice(0, lastSpace) + '...'
  }

  return truncated + '...'
}
