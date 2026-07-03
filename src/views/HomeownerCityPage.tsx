'use client'

import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackPhoneClick } from '@/lib/gtag';
import { getCityBySlug } from '@/data/cities';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { notFound } from 'next/navigation';
import { Star, Phone } from 'lucide-react';

const HOMEOWNER_TESTIMONIALS: Record<string, { quote: string; author: string; location: string; income: string }[]> = {
  oskarshamn: [
    {
      quote: 'Vi hyrde ut vår villa till ett underhållsteam på OKG. Seriösa, välskötta och aldrig några konstigheter. StayOnSite skötte kontrakt och besiktning på ett par dagar – jag behövde inte lyfta ett finger. Hyran trillar in varje månad.',
      author: 'Erik S.',
      location: 'Oskarshamn centrum',
      income: '+9 500 kr/mån · 10 månader',
    },
    {
      quote: 'Var tveksam i början – vad händer med mitt hus? Men montörerna som jobbar på hamnutbyggnaden är lugna och ordentliga. Nu är det tredje kontraktet och vi har inte haft en enda incident.',
      author: 'Karin M.',
      location: 'Figeholm, Oskarshamn',
      income: '+8 000 kr/mån · 12 månader',
    },
  ],
  gavle: [
    {
      quote: 'Hyresgästerna jobbar på ett datacenterprojekt utanför Gävle. Kajsa ordnade allt på tre dagar – kontrakt, nyckelöverlämning och registrering. Nu har vi haft hyresgäster i 14 månader och allt går på autopilot. Hyran är in den 25:e, utan avdrag.',
      author: 'Petra L.',
      location: 'Gävle',
      income: '+12 500 kr/mån · 14 månader',
    },
    {
      quote: 'Huset stod tomt halva åren när vi jobbade utomlands. Nu hyr StayOnSite ut det till ett ingenjörsteam på hamnutbyggnaden. Stabilt, tryggt och inga problem. Bästa beslutet vi tog.',
      author: 'Jonas W.',
      location: 'Brynäs, Gävle',
      income: '+11 000 kr/mån · 9 månader',
    },
  ],
  boden: [
    {
      quote: 'Tredje kontraktet nu med StayOnSite i Boden. Montörer som jobbar på försvarsutbyggnaden – alltid ordentliga och utan drama. Det är inte den uthyrning jag förväntade mig, men den bästa jag har haft.',
      author: 'Magnus H.',
      location: 'Boden',
      income: '+8 500 kr/mån · 9 månader',
    },
    {
      quote: 'Ville inte ha privata hyresgäster men förstod inte skillnaden. Företagshyresgäster är helt annorlunda – de jobbar 10-timmarsskift och vill bara ha lugn och ro. StayOnSite sköter allt, vi sitter still och får hyran.',
      author: 'Anna-Karin B.',
      location: 'Centrala Boden',
      income: '+7 500 kr/mån · 11 månader',
    },
  ],
};

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

  const cityTestimonials = HOMEOWNER_TESTIMONIALS[city.slug] ?? null;

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

        {cityTestimonials && (
          <section className="py-20 bg-nordic-50 border-t border-nordic-100">
            <div className="container mx-auto px-6 md:px-8 max-w-5xl">
              <div className="mb-10">
                <span className="text-[#ff6300] text-xs uppercase tracking-[0.2em] font-semibold">Recensioner</span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-nordic-900 mt-2">
                  Husägare i {city.name} berättar
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {cityTestimonials.map(({ quote, author, location, income }) => (
                  <div key={author} className="bg-white rounded-2xl p-7 border border-nordic-200 flex flex-col">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
                      ))}
                    </div>
                    <p className="text-nordic-800 text-sm leading-relaxed flex-grow mb-6">"{quote}"</p>
                    <div className="border-t border-nordic-100 pt-4">
                      <p className="font-heading font-semibold text-nordic-900 text-sm">{author}</p>
                      <p className="text-nordic-500 text-xs mb-2">{location}</p>
                      <span className="inline-block bg-[#ff6300]/10 text-[#ff6300] text-xs font-semibold px-2.5 py-1 rounded-full">{income}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 bg-primary">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl text-center">
            <span className="text-[#ff6300] text-xs uppercase tracking-[0.2em] font-semibold">Kom igång idag</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Hyr ut i {city.name}
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Ring oss för ett kostnadsfritt samtal. Vi berättar vad din bostad är värd och hur snabbt vi kan matcha dig mot aktiva förfrågningar i {city.name}.
            </p>
            <a
              href="tel:+46762498486"
              onClick={trackPhoneClick}
              className="inline-flex items-center justify-center gap-3 rounded-full h-14 px-8 bg-accent text-white text-base font-bold shadow-2xl shadow-accent/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Phone className="h-5 w-5" />
              Ring oss: 076-249 84 86
            </a>
            <div className="flex items-center justify-center gap-6 mt-10 text-white/40 text-sm">
              <span>0% avgift</span>
              <span>·</span>
              <span>Svar inom 24h</span>
              <span>·</span>
              <span>Ingen bindning</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomeownerCityPage;
