import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateArticleSourcesWithRepair } from './article-source-recovery.mjs';

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
