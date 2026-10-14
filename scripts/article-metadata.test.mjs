import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { appendBlogPostMetadata, findRecoverablePost } from './article-metadata.mjs';

test('a new article is inserted into blogPosts and leaves earlier source arrays intact', () => {
  const sources = "const SOURCES: BlogSource[] = [\n  { title: 'Existing source' },\n];";
  const original = `${sources}\n\nexport const blogPosts: BlogPost[] = [\n  { slug: 'existing' },\n];\n`;
  const updated = appendBlogPostMetadata(original, "  { slug: 'new' }");
  assert.ok(updated.startsWith(sources));
  const file = ts.createSourceFile('blog-posts.ts', updated, ts.ScriptTarget.Latest, true);
  const arrays = file.statements.filter(ts.isVariableStatement).flatMap(statement => [...statement.declarationList.declarations]);
  assert.equal(arrays.find(node => node.name.text === 'SOURCES').initializer.elements.length, 1);
  assert.equal(arrays.find(node => node.name.text === 'blogPosts').initializer.elements.length, 2);
});

test('missing article arrays are rejected instead of changing an unrelated list', () => {
  assert.throws(() => appendBlogPostMetadata('const sources = [\n];', '{}'), /blogPosts array/);
});

test('recovery finds the unpublished entry even when a failed generator put it in a source array', () => {
  const source = `const sources = [{ slug: 'new', title: { sv: 'Ny artikel', en: 'New article', pl: 'Nowy artykuł' }, tags: ['Boden'] }];
    export const blogPosts = [{ slug: 'existing', title: { sv: 'Befintlig' }, sources: SHARED_SOURCES }];`;
  const post = findRecoverablePost(ts, source, ['existing']);
  assert.equal(post.slug, 'new');
  assert.equal(post.title.sv, 'Ny artikel');
});

test('recovery rejects executable or ambiguous metadata', () => {
  assert.throws(() => findRecoverablePost(ts, "const posts = [{ slug: 'new', title: runCode() }];", []), /literal values/);
  assert.throws(() => findRecoverablePost(ts, "const posts = [{ slug: 'a' }, { slug: 'b' }];", []), /found 2/);
});
