import { describe, expect, it } from 'vitest';
import { blogPosts, getRelatedPosts } from './blog-posts';
import { BLOG_TRANSLATIONS, getLocalizedBlogPath } from './blog-routes';

describe('blog language navigation', () => {
  it('links every translated article to its actual route in both directions', () => {
    const translated = blogPosts.filter((post) => post.en);
    expect(Object.keys(BLOG_TRANSLATIONS)).toHaveLength(translated.length);
    for (const post of translated) {
      const sv = `/blogg/${post.slug}`;
      const en = `/en/blog/${post.en!.slug}`;
      expect(getLocalizedBlogPath(sv, 'en')).toBe(en);
      expect(getLocalizedBlogPath(en, 'sv')).toBe(sv);
    }
  });

  it('uses the English index when the article has no English body', () => {
    expect(getLocalizedBlogPath('/blogg/datacenter-montorboende-guide-2026', 'en')).toBe('/en/blog');
    expect(getLocalizedBlogPath('/blogg/redaktionella-riktlinjer', 'en')).toBe('/en/blog');
  });

  it('handles indexes, trailing slashes and the Polish destination', () => {
    expect(getLocalizedBlogPath('/blogg/', 'en')).toBe('/en/blog');
    expect(getLocalizedBlogPath('/en/blog', 'sv')).toBe('/blogg');
    expect(getLocalizedBlogPath('/en/blog', 'pl')).toBe('/pl/zakwaterowanie-firmowe');
  });

  it('does not intercept city or service pages', () => {
    expect(getLocalizedBlogPath('/stad/gavle', 'en')).toBeUndefined();
    expect(getLocalizedBlogPath('/datacenter-boende', 'en')).toBeUndefined();
  });
});

describe('related article recommendations', () => {
  it('never recommends an untranslated article from an English article', () => {
    for (const post of blogPosts.filter((candidate) => candidate.en)) {
      const related = getRelatedPosts(post.slug, 3, 'en');
      expect(related.length).toBeGreaterThan(0);
      expect(related.every((candidate) => candidate.en && candidate.slug !== post.slug)).toBe(true);
      expect(new Set(related.map((candidate) => candidate.slug)).size).toBe(related.length);
    }
  });

  it('does not fill slots with unrelated articles', () => {
    const current = blogPosts[0];
    const previousTags = current.tags;
    const previousCategory = current.category;
    try {
      current.tags = ['unique-test-topic'];
      current.category = 'unique-test-category';
      expect(getRelatedPosts(current.slug)).toEqual([]);
    } finally {
      current.tags = previousTags;
      current.category = previousCategory;
    }
  });
});
