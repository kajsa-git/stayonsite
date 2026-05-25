'use client'

import Link from 'next/link';
import Header from '@/components/Header';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { cities } from '@/data/cities';
import { MapPin, Phone, Star } from 'lucide-react';

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
        <section className="py-20 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12">
                <span className="text-[#ff6300] text-xs uppercase tracking-[0.2em] font-semibold">Fördelar</span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-nordic-900 mt-2 mb-3">
                  Varför husägare väljer StayOnSite
                </h2>
                <p className="text-nordic-800 text-base max-w-xl">
                  Vi gör uthyrning till företag enkelt – så du kan fokusera på det som verkligen spelar roll.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-px bg-nordic-200 rounded-2xl overflow-hidden border border-nordic-200">
                {[
                  {
                    n: '01',
                    title: 'Svenska företag med aktiva behov',
                    body: 'Vi arbetar direkt med bygg-, energi- och infrastrukturbolag i hela Sverige – inga plattformar, ingen mellanhand. Fler förfrågningar än vi kan fylla.',
                  },
                  {
                    n: '02',
                    title: 'Längre kontrakt – färre vakanser',
                    body: 'Företagshyresgäster stannar veckor eller månader, inte helger. Förutsägbar inkomst, färre byten och minimal administration mellan kontrakten.',
                  },
                  {
                    n: '03',
                    title: 'Aktiv matchning i din stad',
                    body: 'Du anmäler dig och vi matchar dig mot pågående förfrågningar i ditt område. De flesta husägare får ett konkret förslag inom 1–2 veckor.',
                  },
                  {
                    n: '04',
                    title: 'Vi sköter allt praktiskt',
                    body: 'Avtal, in- och utflyttbesiktning, betalningar och löpande kontakt med hyresgästen. En dedikerad kontaktperson – du behöver inte lyfta ett finger.',
                  },
                  {
                    n: '05',
                    title: 'Lägre slitage än du tror',
                    body: 'Veckopendlare är på jobbet 10 timmar om dagen. Inga barn, husdjur eller storhelger hemma – i regel mindre slitage än permanent boende.',
                  },
                  {
                    n: '06',
                    title: 'Ingen avgift – du får full hyra',
                    body: 'Du får 100% av den avtalade hyran varje månad, utan avdrag. Vi tjänar på prisskillnaden mot företagskunden. Du betalar ingenting till oss.',
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} className="bg-white p-7 flex gap-5 min-h-40">
                    <span className="text-[#ff6300] font-bold text-sm font-heading shrink-0 pt-0.5">{n}</span>
                    <div className="border-l-2 border-nordic-200 pl-5">
                      <h3 className="font-heading font-semibold text-nordic-900 text-base mb-1.5">{title}</h3>
                      <p className="text-nordic-800 text-sm leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="mb-10">
                <span className="text-[#ff6300] text-xs uppercase tracking-[0.2em] font-semibold">Recensioner</span>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-nordic-900 mt-2">
                  Vad våra husägare säger
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote: t('homeowner.testimonials.testimonial1.quote'),
                    author: t('homeowner.testimonials.testimonial1.author'),
                    location: t('homeowner.testimonials.testimonial1.location'),
                    income: t('homeowner.testimonials.testimonial1.income'),
                  },
                  {
                    quote: t('homeowner.testimonials.testimonial2.quote'),
                    author: t('homeowner.testimonials.testimonial2.author'),
                    location: t('homeowner.testimonials.testimonial2.location'),
                    income: t('homeowner.testimonials.testimonial2.income'),
                  },
                  {
                    quote: t('homeowner.testimonials.testimonial3.quote'),
                    author: t('homeowner.testimonials.testimonial3.author'),
                    location: t('homeowner.testimonials.testimonial3.location'),
                    income: t('homeowner.testimonials.testimonial3.income'),
                  },
                ].map(({ quote, author, location, income }) => (
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
          </div>
        </section>

        <section className="py-14 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
              <div>
                <h2 className="text-xl font-heading font-bold text-nordic-900">
                  Aktiv efterfrågan i din stad
                </h2>
                <p className="text-sm text-nordic-600 mt-1 max-w-md">
                  Just nu har vi fler förfrågningar från företag än vi hinner fylla. Välj din stad nedan.
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-[#ff6300] bg-[#ff6300]/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
                40+ städer · aktiva uppdrag
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/for-husagare/${city.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-nordic-50 border border-nordic-200 hover:border-[#ff6300] hover:bg-[#ff6300]/5 transition-colors text-sm text-nordic-900 hover:text-[#ff6300]"
                >
                  <MapPin className="h-3 w-3" />
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary border-t border-primary">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl text-center">
            <span className="text-[#ff6300] text-xs uppercase tracking-[0.2em] font-semibold">Kom igång idag</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Redo att hyra ut din bostad?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Ring oss för ett kostnadsfritt samtal om din bostad och din stad. De flesta husägare får ett konkret förslag inom 1–2 veckor.
            </p>
            <a
              href="tel:+46762498486"
              className="inline-flex items-center justify-center gap-3 rounded-full h-14 px-8 bg-accent hover:bg-accent text-white text-base font-bold shadow-2xl shadow-accent/40 transition-all duration-300 hover:scale-105 active:scale-95"
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

export default ForHusagare;
