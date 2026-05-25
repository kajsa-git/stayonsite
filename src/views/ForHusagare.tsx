'use client'

import Link from 'next/link';
import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { cities } from '@/data/cities';
import { MapPin } from 'lucide-react';

const ForHusagare = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': 'StayOnSite Homeowner Service',
      'description': t('seo.homeowner.description'),
      'provider': {
        '@type': 'Organization',
        'name': 'StayOnSite',
        'telephone': '+46 76-249 84 86',
        'url': 'https://www.stayonsite.se'
      },
      'areaServed': {
        '@type': 'Country',
        'name': 'Sweden'
      },
      'serviceType': 'Property Rental Service',
      'offers': {
        '@type': 'AggregateOffer',
        'lowPrice': 10000,
        'highPrice': 30000,
        'priceCurrency': 'SEK',
        'unitText': 'per month'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'StayOnSite',
      'url': 'https://www.stayonsite.se',
      'telephone': '+46 76-249 84 86',
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': RATING_VALUE,
        'reviewCount': REVIEW_COUNT
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': language === 'en' ? 'Does it cost anything?' : language === 'pl' ? 'Czy to coś kosztuje?' : 'Kostar det något?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? 'No. You pay nothing to us. We rent your property at a fixed amount every month - no deductions. We earn from the price difference with the corporate client.'
              : language === 'pl'
              ? 'Nie. Nie płacisz nam nic. Wynajmujemy Twoją nieruchomość za stałą kwotę co miesiąc - bez potrąceń.'
              : 'Nej. Du betalar ingenting till oss. Vi hyr din bostad till ett fast belopp varje månad - utan avdrag. Vi tjänar på prisskillnaden gentemot företagskunden.',
          },
        },
        {
          '@type': 'Question',
          'name': language === 'en' ? 'Who lives in my house?' : language === 'pl' ? 'Kto mieszka w moim domu?' : 'Vilka bor i mitt hus?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? 'Professional corporate tenants - installers, engineers and project teams working temporarily in the area. Never private individuals.'
              : language === 'pl'
              ? 'Profesjonalni najemcy firmowi - monterzy, inżynierowie i zespoły projektowe.'
              : 'Professionella företagshyresgäster - montörer, ingenjörer och projektteam som arbetar tillfälligt i området. Aldrig privatpersoner.',
          },
        },
        {
          '@type': 'Question',
          'name': language === 'en' ? 'How long is the contract?' : language === 'pl' ? 'Jak długi jest kontrakt?' : 'Hur lång är avtalstiden?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': language === 'en'
              ? "We decide that together. Contract length is tailored to the tenant's project and your preferences as a property owner – always in open dialogue until everyone is satisfied."
              : language === 'pl'
              ? 'Ustalamy to wspólnie. Czas trwania umowy dostosowujemy do projektu najemcy i Twoich oczekiwań – zawsze w otwartym dialogu.'
              : 'Det bestämmer vi tillsammans. Avtalstiden anpassas efter hyresgästens projekt och dina önskemål som hyresvärd – alltid i öppen dialog tills alla parter är nöjda.',
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t('seo.homeowner.title')}
        description={t('seo.homeowner.description')}
        canonical="https://www.stayonsite.se/for-husagare"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/for-husagare' },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <HomeownerHero />
        <section className="py-16 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4">
              Hyra ut till företag – hur funkar det?
            </h2>
            <p className="text-nordic-700 mb-8 text-base leading-relaxed max-w-2xl">
              Att hyra ut sin bostad till ett byggföretag, energibolag eller infrastrukturprojekt kallas ofta <strong>blockhyra</strong> eller <strong>personalboende</strong>. Istället för privatpersoner är det ett seriöst företag som betalar hyran – varje månad, i förskott, utan avdrag.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-nordic-50 rounded-2xl p-6 border border-nordic-100">
                <div className="text-2xl font-bold text-[#ff6300] mb-2">1.</div>
                <h3 className="font-semibold text-nordic-900 mb-2">Du skickar en intresseanmälan</h3>
                <p className="text-sm text-nordic-600">Vi kontaktar dig och går igenom din bostad – läge, storlek och vad du kan förvänta dig i hyra. Ingen bindning.</p>
              </div>
              <div className="bg-nordic-50 rounded-2xl p-6 border border-nordic-100">
                <div className="text-2xl font-bold text-[#ff6300] mb-2">2.</div>
                <h3 className="font-semibold text-nordic-900 mb-2">Vi matchar dig med ett företag</h3>
                <p className="text-sm text-nordic-600">Vi letar i vårt nätverk av byggbolag och projektledare efter en hyresgäst som passar din bostad och ditt område.</p>
              </div>
              <div className="bg-nordic-50 rounded-2xl p-6 border border-nordic-100">
                <div className="text-2xl font-bold text-[#ff6300] mb-2">3.</div>
                <h3 className="font-semibold text-nordic-900 mb-2">Fast hyra varje månad</h3>
                <p className="text-sm text-nordic-600">Kontraktet skrivs direkt med företaget. Du får fast månadshyra utan avdrag – vi tjänar på mellanskillnaden mot vad företaget betalar.</p>
              </div>
            </div>

            <div className="bg-nordic-900 text-white rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-semibold mb-4">Varför hyra ut till företag istället för privatperson?</h3>
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-3 text-sm text-white/80">
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>Vi betalar alltid i tid – StayOnSite är din motpart och garanterar hyran varje månad</span></div>
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>Inget besittningsskydd – du får tillbaka huset när projektet är klart</span></div>
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>Lägre slitage – veckopendlare är på jobbet 10 timmar om dagen</span></div>
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>Längre kontrakt – typiskt 3–18 månader, förutsägbar inkomst</span></div>
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>0% avgift till oss – du får full hyra, vi fakturerar företaget separat</span></div>
                <div className="flex gap-2"><span className="text-[#ff6300] font-bold mt-0.5">✓</span><span>Ny lag från 1 juli 2026 gör blockhyra enklare och tryggare</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8 max-w-5xl">
            <h2 className="text-xl font-semibold text-nordic-900 mb-2 text-center">
              Hyr ut i din stad
            </h2>
            <p className="text-sm text-gray-600 text-center mb-8">
              Vi har aktiv efterfrågan från företag i hela Sverige
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/for-husagare/${city.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
                >
                  <MapPin className="h-3 w-3" />
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForHusagare;
