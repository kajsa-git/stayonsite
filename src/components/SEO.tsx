import { Head } from 'vite-react-ssg';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  hreflangs?: Array<{ lang: string; href: string }>;
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords,
  ogImage = 'https://stayonsite.se/images/og-image.jpg',
  canonical,
  type = 'website',
  structuredData,
  hreflangs,
  noindex,
}: SEOProps) => {
  const { language } = useLanguage();
  const location = useLocation();

  const defaultContent = {
    sv: {
      title: 'StayOnSite - Boende för byggarbetare | Företagsbostäder Sverige',
      description: 'StayOnSite hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare. Över 10 års erfarenhet. Boenden i hela Sverige. Kontakta oss idag!',
      keywords: 'boende byggarbetare, företagsbostäder, personalboende, byggboende, montörboende, arbetarboende, longstay, shortstay, boende stockholm, boende göteborg, boende malmö, stayonsite',
    },
    en: {
      title: 'StayOnSite - Accommodation for Construction Workers | Corporate Housing Sweden',
      description: 'StayOnSite helps construction companies quickly find accommodation in other locations for their workers. Over 10 years of experience. Housing throughout Sweden. Contact us today!',
      keywords: 'construction worker accommodation, corporate housing, staff accommodation, construction housing, worker housing, longstay, shortstay, accommodation stockholm, accommodation gothenburg, accommodation malmö, stayonsite',
    },
    pl: {
      title: 'StayOnSite - Zakwaterowanie dla pracowników budowlanych | Mieszkania służbowe Szwecja',
      description: 'StayOnSite pomaga firmom budowlanym szybko znaleźć zakwaterowanie w innych lokalizacjach dla ich pracowników. Ponad 10 lat doświadczenia. Mieszkania w całej Szwecji. Skontaktuj się z nami już dziś!',
      keywords: 'zakwaterowanie pracowników budowlanych, mieszkania służbowe, zakwaterowanie personelu, zakwaterowanie budowlane, zakwaterowanie pracowników, długoterminowe, krótkoterminowe, zakwaterowanie sztokholm, zakwaterowanie göteborg, zakwaterowanie malmö, stayonsite',
    },
  };

  const finalTitle = title || defaultContent[language].title;
  const finalDescription = description || defaultContent[language].description;
  const finalKeywords = keywords || defaultContent[language].keywords;
  const finalCanonical = canonical || `https://stayonsite.se${location.pathname}`;
  const ogLocale = language === 'sv' ? 'sv_SE' : language === 'en' ? 'en_US' : 'pl_PL';

  return (
    <Head>
      <html lang={language} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalCanonical} />

      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />

      {hreflangs?.map(({ lang, href }) => (
        <link key={lang} rel="alternate" hreflang={lang} href={href} />
      ))}
      {hreflangs && !hreflangs.find((h) => h.lang === 'x-default') && (
        <link
          rel="alternate"
          hreflang="x-default"
          href={hreflangs.find((h) => h.lang === 'sv')?.href || finalCanonical}
        />
      )}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Head>
  );
};

export default SEO;
