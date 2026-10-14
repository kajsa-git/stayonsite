export function appendBlogPostMetadata(source, entry) {
  const marker = /export\s+const\s+blogPosts\s*:\s*BlogPost\[\]\s*=\s*\[/;
  const match = marker.exec(source);
  if (!match) throw new Error('Could not find the blogPosts array');
  const start = match.index + match[0].length;
  const end = source.indexOf('\n];', start);
  if (end < 0) throw new Error('Could not find the end of the blogPosts array');
  return `${source.slice(0, end)}\n${entry},${source.slice(end)}`;
}

/** Read literal metadata only; never evaluate code from an artifact. */
export function readLiteral(ts, node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(element => readLiteral(ts, element));
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(node.properties.map(property => {
      if (!ts.isPropertyAssignment(property) || property.name.kind === ts.SyntaxKind.ComputedPropertyName) {
        throw new Error('Artifact metadata must contain static property assignments');
      }
      return [property.name.text, readLiteral(ts, property.initializer)];
    }));
  }
  throw new Error('Artifact metadata must contain only literal values');
}

export function findRecoverablePost(ts, source, existingSlugs) {
  const file = ts.createSourceFile('blog-posts.ts', source, ts.ScriptTarget.Latest, true);
  const candidates = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const property = node.properties.find(property => ts.isPropertyAssignment(property) && property.name.text === 'slug');
      if (property && !existingSlugs.includes(readLiteral(ts, property.initializer))) {
        candidates.push(readLiteral(ts, node));
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (candidates.length !== 1) throw new Error(`Expected one unpublished article in artifact, found ${candidates.length}`);
  return candidates[0];
}
