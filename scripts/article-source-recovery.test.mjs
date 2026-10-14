import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completePausedServerToolTurn, extractStaticExternalSources, fetchSourceWithRetry, validateArticleSourcesWithRepair } from './article-source-recovery.mjs';

test('valid JSX href expressions and external Next links count as source links', () => {
  const sources = extractStaticExternalSources(`
    <a href="https://scb.se/report"><strong>SCB</strong></a>
    <a href = {'https://boverket.se/report'}>Boverket</a>
    <Link href={"https://gavle.se/report"}>Gävle kommun</Link>
    <a href="https://www.stayonsite.se/blogg/example">Internal</a>
  `);
  assert.deepEqual(sources.map(source => source.url), [
    'https://scb.se/report', 'https://boverket.se/report', 'https://gavle.se/report',
  ]);
  assert.equal(sources[0].title, 'SCB');
});

test('HTML entity encoding does not break or duplicate a source URL', () => {
  assert.deepEqual(extractStaticExternalSources(`
    <a href="https://scb.se/report?a=1&amp;b=2">SCB &ndash; report</a>
    <a href={"https://scb.se/report?a=1&b=2"}>Same report</a>
  `), [{ url: 'https://scb.se/report?a=1&b=2', title: 'SCB – report' }]);
});

test('a transient source connection failure gets another read attempt', async () => {
  let attempts = 0;
  const response = await fetchSourceWithRetry('https://scb.se/report', {
    fetchImpl: async () => {
      if (++attempts === 1) throw new Error('fetch failed', { cause: { code: 'ECONNRESET' } });
      return new Response('source', { status: 200 });
    },
    delay: async () => {},
  });
  assert.equal(attempts, 2);
  assert.equal(response.status, 200);
});

test('missing pages and invalid certificates are not accepted by retrying', async () => {
  let missingReads = 0;
  const response = await fetchSourceWithRetry('https://scb.se/missing', {
    fetchImpl: async () => { missingReads++; return new Response('', { status: 404 }); },
    delay: async () => {},
  });
  assert.equal(response.status, 404);
  assert.equal(missingReads, 1);
  let certificateReads = 0;
  await assert.rejects(() => fetchSourceWithRetry('https://scb.se/report', {
    fetchImpl: async () => {
      certificateReads++;
      throw new Error('fetch failed', { cause: { code: 'CERT_HAS_EXPIRED' } });
    },
    delay: async () => {},
  }), /fetch failed/);
  assert.equal(certificateReads, 1);
});

test('a paused web search is continued with its exact assistant tool state', async () => {
  const messages = [{ role: 'user', content: 'Write a sourced article' }];
  const paused = [{ type: 'server_tool_use', id: 'srvtoolu-test', name: 'web_search', input: { query: 'original sources' } }];
  const requests = [];
  const result = await completePausedServerToolTurn(messages, async conversation => {
    requests.push(structuredClone(conversation));
    return requests.length === 1
      ? { stop_reason: 'pause_turn', content: paused }
      : { stop_reason: 'end_turn', content: [{ type: 'text', text: 'Finished TSX' }] };
  });
  assert.deepEqual(requests[1], [...messages, { role: 'assistant', content: paused }]);
  assert.deepEqual(messages, [{ role: 'user', content: 'Write a sourced article' }]);
  assert.equal(result.stop_reason, 'end_turn');
  assert.deepEqual(result.content, [...paused, { type: 'text', text: 'Finished TSX' }]);
});

test('repeated pauses stop at the continuation limit', async () => {
  let requests = 0;
  await assert.rejects(() => completePausedServerToolTurn([], async () => {
    requests++;
    return { stop_reason: 'pause_turn', content: [] };
  }, { maxContinuations: 2 }), /bounded continuations/);
  assert.equal(requests, 3);
});

test('a completed response does not trigger another API request', async () => {
  let requests = 0;
  await completePausedServerToolTurn([], async () => {
    requests++;
    return { stop_reason: 'end_turn', content: [] };
  });
  assert.equal(requests, 1);
});

const sources = [{ url: 'https://scb.se/report' }, { url: 'https://boverket.se/report' }, { url: 'https://gavle.se/report' }];

test('an article that passes its gates is returned without an AI repair', async () => {
  const result = await validateArticleSourcesWithRepair('valid article', {
    validateArticle: () => {},
    validateSources: async () => sources,
    repairSources: () => assert.fail('A valid article should not be rewritten'),
  });
  assert.deepEqual(result, { tsx: 'valid article', sources });
});

test('a one-source article is repaired using the actual rejection and checked again', async () => {
  const attempts = [];
  const checked = [];
  const result = await validateArticleSourcesWithRepair('one source', {
    validateArticle: (tsx) => checked.push(tsx),
    validateSources: async (tsx) => {
      if (tsx === 'one source') throw new Error('Artikeln har 1 externa källänkar; minst 3 krävs');
      return sources;
    },
    repairSources: async (tsx, reason) => {
      assert.equal(tsx, 'one source');
      assert.match(reason, /minst 3 krävs/);
      return 'three sources';
    },
    onRepair: ({ attempt }) => attempts.push(attempt),
  });
  assert.deepEqual(checked, ['one source', 'three sources']);
  assert.deepEqual(attempts, [1]);
  assert.deepEqual(result, { tsx: 'three sources', sources });
});

test('a repair with invalid JSX must be repaired again before any sources are accepted', async () => {
  const sourceChecks = [];
  const reasons = [];
  const result = await validateArticleSourcesWithRepair('missing sources', {
    validateArticle: (tsx) => {
      if (tsx === 'invalid JSX') throw new Error('JSX validation failed');
    },
    validateSources: async (tsx) => {
      sourceChecks.push(tsx);
      if (tsx === 'missing sources') throw new Error('Missing sources');
      return sources;
    },
    repairSources: async (_tsx, reason) => {
      reasons.push(reason);
      return reasons.length === 1 ? 'invalid JSX' : 'valid repaired article';
    },
  });
  assert.deepEqual(sourceChecks, ['missing sources', 'valid repaired article']);
  assert.deepEqual(reasons, ['Missing sources', 'JSX validation failed']);
  assert.equal(result.tsx, 'valid repaired article');
});

test('unresolved source errors stop publication after the bounded repair attempts', async () => {
  let repairs = 0;
  let validations = 0;
  await assert.rejects(() => validateArticleSourcesWithRepair('unverified article', {
    validateArticle: () => {},
    validateSources: async () => {
      validations++;
      throw new Error('Source returned 404');
    },
    repairSources: async () => {
      repairs++;
      return 'still unverified';
    },
  }), /Source returned 404/);
  assert.equal(repairs, 2);
  assert.equal(validations, 3);
});

test('an API failure during repair is propagated without accepting the original article', async () => {
  await assert.rejects(() => validateArticleSourcesWithRepair('missing sources', {
    validateArticle: () => {},
    validateSources: async () => { throw new Error('Missing sources'); },
    repairSources: async () => { throw new Error('Claude API 401'); },
  }), /Claude API 401/);
});
