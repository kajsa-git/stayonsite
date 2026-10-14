/** Keep the publication gates in force while repairing a rejected article. */
export function extractStaticExternalSources(tsx) {
  const sources = [];
  const pattern = /<(a|Link)\b[^>]*\bhref\s*=\s*(?:"(https:\/\/[^"<>]+)"|'(https:\/\/[^'<>]+)'|\{\s*"(https:\/\/[^"<>]+)"\s*\}|\{\s*'(https:\/\/[^'<>]+)'\s*\})[^>]*>([\s\S]*?)<\/\1\s*>/g;
  for (const match of tsx.matchAll(pattern)) {
    const url = (match[2] || match[3] || match[4] || match[5]).replace(/&amp;/g, '&');
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'stayonsite.se' || host.endsWith('.stayonsite.se')) continue;
    const title = match[6]
      .replace(/<[^>]+>/g, '')
      .replace(/\{['"]\s*['"]\}/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&ndash;/g, '–')
      .replace(/&mdash;/g, '—')
      .trim();
    if (!sources.some(source => source.url === url)) sources.push({ url, title: title || url });
  }
  return sources;
}

export async function fetchSourceWithRetry(url, {
  fetchImpl = fetch,
  maxAttempts = 3,
  delay = ms => new Promise(resolve => setTimeout(resolve, ms)),
} = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchImpl(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
        headers: { 'user-agent': 'StayOnSite editorial source checker/1.0' },
      });
      if (![500, 502, 503, 504].includes(response.status) || attempt === maxAttempts) return response;
      await response.body?.cancel();
    } catch (error) {
      const cause = error.cause?.code || error.code || '';
      if (attempt === maxAttempts || /CERT|TLS|SSL|SELF_SIGNED|UNABLE_TO_VERIFY|INVALID_URL/i.test(cause)) throw error;
    }
    await delay(attempt * 500);
  }
}

export async function completePausedServerToolTurn(messages, request, {
  maxContinuations = 3,
  onContinuation = () => {},
} = {}) {
  const conversation = [...messages];
  const content = [];

  for (let attempt = 0; attempt <= maxContinuations; attempt++) {
    const response = await request(conversation);
    content.push(...response.content);
    if (response.stop_reason !== 'pause_turn') return { ...response, content };
    if (attempt === maxContinuations) throw new Error('Claude server tool turn did not finish after bounded continuations');
    onContinuation(attempt + 1);
    conversation.push({ role: 'assistant', content: response.content });
  }
}

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
