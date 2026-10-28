import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { cities, getNearbyCities } from '@/data/cities';
import type { AvailableLanguages } from '@/data/translations';
import CityPage from './CityPage';

const routing = vi.hoisted(() => ({ pathname: '/stad/boden' }));
vi.mock('next/navigation', () => ({
  usePathname: () => routing.pathname,
  notFound: () => { throw new Error('not found'); },
}));
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/Breadcrumbs', () => ({ default: () => null }));
vi.mock('@/components/HeroIntentForm', () => ({ default: () => null }));
vi.mock('@/components/InquiryForm', () => ({ default: () => <section id="inquiry" /> }));
vi.mock('@/components/StickyContact', () => ({ default: () => null }));
vi.mock('@/components/MobileStickyFormCTA', () => ({ default: () => null }));
vi.mock('@/components/FloatingPhoneButton', () => ({ default: () => null }));

const slugs = ['boden', 'oskarshamn', 'lulea', 'gavle', 'monsteras'];
const prefixes = { sv: '/stad/', en: '/en/corporate-housing/', pl: '/pl/zakwaterowanie/' };
const cases = slugs.flatMap((slug) => (['sv', 'en', 'pl'] as const).map((locale) => ({ slug, locale })));

beforeEach(() => {
  const originalError = console.error;
  vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
    // jsdom provides window while this test deliberately uses React's server renderer.
    if (typeof message === 'string' && message.includes('useLayoutEffect does nothing on the server')) return;
    originalError(message, ...args);
  });
});

function page(slug: string, locale: AvailableLanguages, withListings = false) {
  routing.pathname = prefixes[locale] + slug;
  const city = cities.find((entry) => entry.slug === slug)!;
  return (
    <LanguageProvider>
      <CityPage
        citySlug={slug}
        locale={locale}
        city={city}
        nearbyCities={getNearbyCities(slug)}
        listings={withListings ? [{
          slug: 'test-public-property', name: 'Publicerat boende', postalCode: null,
          bedrooms: 4, beds: 4, imageUrl: null,
        }] : []}
      />
    </LanguageProvider>
  );
}

afterEach(() => {
  routing.pathname = '/stad/boden';
  vi.restoreAllMocks();
});

describe('stadsguider som går att läsa och hitta från sök', () => {
  it.each(cases)('serverrenderar rätt språk, FAQ-svar och metadata för $slug/$locale', ({ slug, locale }) => {
    const city = cities.find((entry) => entry.slug === slug)!;
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(page(slug, locale));
    const schemas = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => JSON.parse(script.textContent!),
    );
    const faq = schemas.find((schema) => schema['@type'] === 'FAQPage');
    const webpage = schemas.find((schema) => schema['@type'] === 'WebPage');
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')?.textContent).toBe(city.heroHook[locale]);
    expect(webpage).toMatchObject({
      inLanguage: locale,
      url: 'https://www.stayonsite.se' + prefixes[locale] + slug,
      dateModified: '2026-10-28',
    });
    const faqSection = container.querySelector('#faq')!;
    expect(faq.inLanguage).toBe(locale);
    for (const question of faq.mainEntity) {
      expect(faqSection.textContent).toContain(question.name);
      expect(faqSection.textContent).toContain(question.acceptedAnswer.text);
    }
    for (const link of container.querySelectorAll('nav a[href^="#"]')) {
      const target = link.getAttribute('href')!.slice(1);
      expect(container.querySelectorAll('[id="' + target + '"]')).toHaveLength(1);
    }
    expect(container.textContent).not.toContain('cityGuide.');
    for (const nearby of city.nearby) {
      expect(cities.some((entry) => entry.slug === nearby)).toBe(true);
    }
  });

  it('visar publicerade objekt utan att kalla dem bokningsbara för alla datum', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToStaticMarkup(page('monsteras', 'sv', true));
    expect(container.querySelectorAll('#homes')).toHaveLength(1);
    expect(container.querySelector('#homes a[href="/boenden/test-public-property"]')).not.toBeNull();
    expect(container.querySelector('#homes')?.textContent).toContain('tillgänglighet för era datum');
    expect(container.querySelector('#homes')?.textContent).not.toContain('redo för inflytt');
  });
});
