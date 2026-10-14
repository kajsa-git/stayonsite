/** Keep the publication gates in force while repairing a rejected article. */
export async function validateArticleSourcesWithRepair(tsx, {
  validateArticle,
  validateSources,
  repairSources,
  maxRepairs = 2,
  onRepair = () => {},
}) {
  let candidate = tsx;

  for (let attempt = 0; attempt <= maxRepairs; attempt++) {
    try {
      await validateArticle(candidate);
      const sources = await validateSources(candidate);
      return { tsx: candidate, sources };
    } catch (error) {
      if (attempt === maxRepairs) throw error;
      onRepair({ attempt: attempt + 1, maxRepairs, error });
      candidate = await repairSources(candidate, error.message);
    }
  }
}
