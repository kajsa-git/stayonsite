'use client'

import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCityBySlug } from '@/data/cities';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { notFound } from 'next/navigation';

interface HomeownerCityPageProps {
  citySlug: string;
  locale: 'sv' | 'en' | 'pl';
}

const HomeownerCityPage = ({ citySlug, locale }: HomeownerCityPageProps) => {
  const { language } = useLanguage();
  const city = getCityBySlug(citySlug);

  if (!city) return notFound();

  const tr = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  // Build city-specific subtitle from industries
  const topIndustries = city.industries.slice(0, 3).join(', ');
  const subtitle = {
    sv: `I ${city.name} finns stor efterfrågan på boende för ${topIndustries}. Vi hyr din bostad till ett fast belopp varje månad - utan avdrag.`,
    en: `In ${city.name} there is high demand for accommodation for ${topIndustries}. We rent your property at a fixed amount every month - no deductions.`,
    pl: `W ${city.name} jest duże zapotrzebowanie na zakwaterowanie dla ${topIndustries}. Wynajmujemy Twoją nieruchomość za stałą kwotę - bez potrąceń.`,
  };

  // Build city-specific extra FAQ from city data
  const projectNames = city.projects.slice(0, 2).map(p => p.name.sv).join(', ');
  const neighborhoodNames = city.neighborhoods.slice(0, 3).map(n => n.name.sv).join(', ');

  const extraFaqItems = [
    {
      q: tr(
        `Finns det efterfrågan i ${city.name}?`,
        `Is there demand in ${city.name}?`,
        `Czy jest popyt w ${city.name}?`
      ),
      a: tr(
        `Ja. ${city.name} har aktiva projekt inom ${topIndustries}. Pågående projekt inkluderar ${projectNames}. Efterfrågan på företagsboende är hög.`,
        `Yes. ${city.name} has active projects in ${topIndustries}. Ongoing projects include ${projectNames}. Demand for corporate housing is high.`,
        `Tak. ${city.name} ma aktywne projekty w ${topIndustries}. Zapotrzebowanie na zakwaterowanie firmowe jest wysokie.`
      ),
    },
    {
      q: tr(
        `Vilka områden i ${city.name} är populära?`,
        `Which areas in ${city.name} are popular?`,
        `Które dzielnice w ${city.name} są popularne?`
      ),
      a: tr(
        `De mest efterfrågade områdena är ${neighborhoodNames}. Vi har boenden i hela ${city.name} och anpassar efter ert behov.`,
        `The most popular areas are ${neighborhoodNames}. We have accommodation across ${city.name} and adapt to your needs.`,
        `Najpopularniejsze dzielnice to ${neighborhoodNames}. Mamy zakwaterowanie w całym ${city.name}.`
      ),
    },
  ];

  // Hero image: city-specific if available, fallback to generic
  const heroImage = `/images/homeowner-cities/${city.slug}.webp`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `StayOnSite - ${tr('Hyr ut bostad i', 'Rent out property in', 'Wynajem nieruchomości w')} ${city.name}`,
      description: subtitle[language] || subtitle.sv,
      provider: {
        '@type': 'Organization',
        name: 'StayOnSite',
        telephone: '+46 76-249 84 86',
        url: 'https://www.stayonsite.se',
      },
      areaServed: {
        '@type': 'City',
        name: city.name,
        containedInPlace: { '@type': 'Country', name: 'Sweden' },
      },
      serviceType: 'Property Rental Service',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: RATING_VALUE,
        reviewCount: REVIEW_COUNT,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: extraFaqItems.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={tr(
          `Hyr ut din bostad i ${city.name} till företag | StayOnSite`,
          `Rent out your property in ${city.name} | StayOnSite`,
          `Wynajmij nieruchomość w ${city.name} | StayOnSite`
        )}
        description={subtitle[language] || subtitle.sv}
        canonical={`https://www.stayonsite.se/for-husagare/${city.slug}`}
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: `https://www.stayonsite.se/for-husagare/${city.slug}` },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <HomeownerHero
          cityName={city.name}
          heroImage={heroImage}
          subtitle={subtitle}
          extraFaqItems={extraFaqItems}
        />
      </main>
    </div>
  );
};

export default HomeownerCityPage;
