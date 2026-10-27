import type { Locale } from '@/types/localized';

// Keep the header's language navigation independent of the full article catalogue.
export const BLOG_TRANSLATIONS: Record<string, string> = {
  'personalboende-vanliga-fragor-byggforetag': 'worker-accommodation-sweden-faq',
  'personalboende-vs-hotell-kostnad-jamforelse': 'worker-accommodation-vs-hotel-cost-comparison',
  'boende-utlandska-arbetare-bygg-praktisk-guide-2026': 'housing-foreign-construction-workers-sweden-2026',
  'foretagsbostader-nya-regler-juli-2026-guide': 'corporate-housing-sweden-new-rules-july-2026',
};

/** An untranslated article leads to the target-language index, never mixed-language copy. */
export function getLocalizedBlogPath(pathname: string, locale: Locale): string | undefined {
  const path = pathname.replace(/\/$/, '');
  if (!/^\/(blogg|en\/blog)(\/|$)/.test(path)) return undefined;
  if (locale === 'pl') return '/pl/zakwaterowanie-firmowe';
  const svSlug = path.startsWith('/blogg/')
    ? path.slice('/blogg/'.length)
    : Object.keys(BLOG_TRANSLATIONS).find((slug) => `/en/blog/${BLOG_TRANSLATIONS[slug]}` === path);
  if (locale === 'sv') return svSlug ? `/blogg/${svSlug}` : '/blogg';
  const enSlug = svSlug && BLOG_TRANSLATIONS[svSlug];
  return enSlug ? `/en/blog/${enSlug}` : '/en/blog';
}
