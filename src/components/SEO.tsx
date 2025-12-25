import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
  canonical,
  type = 'website',
  structuredData,
  hreflangs
}: SEOProps & {
  hreflangs?: Array<{ lang: string; href: string }>;
}) => {
  const { language } = useLanguage();

  // Default content based on language
  const defaultContent = {
    sv: {
      title: 'StayOnSite - Boende för byggarbetare | Företagsbostäder Sverige',
      description: 'StayOnSite hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare. Över 10 års erfarenhet. Boenden i hela Sverige. Kontakta oss idag!',
      keywords: 'boende byggarbetare, företagsbostäder, personalboende, byggboende, montörboende, arbetarboende, longstay, shortstay, boende stockholm, boende göteborg, boende malmö, stayonsite'
    },
    en: {
      title: 'StayOnSite - Accommodation for Construction Workers | Corporate Housing Sweden',
      description: 'StayOnSite helps construction companies quickly find accommodation in other locations for their workers. Over 10 years of experience. Housing throughout Sweden. Contact us today!',
      keywords: 'construction worker accommodation, corporate housing, staff accommodation, construction housing, worker housing, longstay, shortstay, accommodation stockholm, accommodation gothenburg, accommodation malmö, stayonsite'
    },
    pl: {
      title: 'StayOnSite - Zakwaterowanie dla pracowników budowlanych | Mieszkania służbowe Szwecja',
      description: 'StayOnSite pomaga firmom budowlanym szybko znaleźć zakwaterowanie w innych lokalizacjach dla ich pracowników. Ponad 10 lat doświadczenia. Mieszkania w całej Szwecji. Skontaktuj się z nami już dziś!',
      keywords: 'zakwaterowanie pracowników budowlanych, mieszkania służbowe, zakwaterowanie personelu, zakwaterowanie budowlane, zakwaterowanie pracowników, długoterminowe, krótkoterminowe, zakwaterowanie sztokholm, zakwaterowanie göteborg, zakwaterowanie malmö, stayonsite'
    }
  };

  const finalTitle = title || defaultContent[language].title;
  const finalDescription = description || defaultContent[language].description;
  const finalKeywords = keywords || defaultContent[language].keywords;
  const finalCanonical = canonical || `https://stayonsite.se${window.location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);

    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', finalCanonical, true);
    updateMetaTag('og:locale', language === 'sv' ? 'sv_SE' : language === 'en' ? 'en_US' : 'pl_PL', true);

    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', ogImage);

    // Update canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = finalCanonical;

    // Update hreflang tags if provided
    if (hreflangs) {
      // Remove existing hreflang tags to avoid duplicates
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

      hreflangs.forEach(({ lang, href }) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = href;
        document.head.appendChild(link);
      });
      
      // Add x-default if not present in hreflangs (usually sv or en)
      if (!hreflangs.find(h => h.lang === 'x-default')) {
         const defaultLink = document.createElement('link');
         defaultLink.rel = 'alternate';
         defaultLink.hreflang = 'x-default';
         defaultLink.href = hreflangs.find(h => h.lang === 'sv')?.href || finalCanonical;
         document.head.appendChild(defaultLink);
      }
    }

    // Update language attribute on html tag
    document.documentElement.lang = language === 'sv' ? 'sv' : language === 'en' ? 'en' : 'pl';

    // Update structured data if provided
    if (structuredData) {
      let scriptElement = document.querySelector('script[data-type="structured-data"]') as HTMLScriptElement;

      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.type = 'application/ld+json';
        scriptElement.setAttribute('data-type', 'structured-data');
        document.head.appendChild(scriptElement);
      }

      scriptElement.textContent = JSON.stringify(structuredData);
    }
  }, [finalTitle, finalDescription, finalKeywords, finalCanonical, ogImage, type, language, structuredData, hreflangs]);

  return null;
};

export default SEO;
