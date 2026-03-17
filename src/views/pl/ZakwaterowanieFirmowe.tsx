'use client'

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import DirectContact from '@/components/landing/DirectContact';
import InquiryForm from '@/components/InquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Building2, FileCheck, Headphones, CheckCircle2, Star } from 'lucide-react';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';

const ZakwaterowanieFirmowe = () => {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('pl');
  }, [setLanguage]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Zakwaterowanie Firmowe Szwecja',
    'provider': {
      '@type': 'Organization',
      'name': 'StayOnSite',
      'telephone': '+46 76-249 84 86',
      'url': 'https://www.stayonsite.se'
    },
    'description': 'W pełni umeblowane mieszkania dla zespołów biznesowych w całej Szwecji. Elastyczne warunki, cena all-inclusive.',
    'areaServed': {
      '@type': 'Country',
      'name': 'Sweden'
    },
    'serviceType': 'Corporate Housing',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': RATING_VALUE,
      'reviewCount': REVIEW_COUNT
    }
  };

  const faqData = [
    {
      question: "Czym jest zakwaterowanie firmowe?",
      answer: "Zakwaterowanie firmowe to w pełni umeblowane mieszkania wynajmowane przez firmy dla pracowników na czasowych kontraktach. W przeciwieństwie do hoteli, zapewniają domową atmosferę z pełną kuchnią i elastycznymi warunkami najmu - zazwyczaj od 30 dni do kilku miesięcy."
    },
    {
      question: "Czym się różnicie od Airbnb?",
      answer: "Podczas gdy Airbnb koncentruje się na krótkoterminowych pobytach turystycznych, zakwaterowanie firmowe jest zaprojektowane dla potrzeb biznesowych: gwarantowana dostępność, profesjonalne fakturowanie, dedykowany opiekun klienta i mieszkania sprawdzone dla profesjonalistów."
    },
    {
      question: "Które miasta w Szwecji obsługujecie?",
      answer: "Specjalizujemy się w lokalizacjach w całej Szwecji, w tym Umeå, Luleå, Boden, Gävle, Västerås, Örebro, Linköping, Norrköping, Säffle i wiele innych. Możemy znaleźć zakwaterowanie wszędzie tam, gdzie realizujesz projekt."
    },
    {
      question: "Co jest wliczone w cenę?",
      answer: "Cena all-inclusive obejmuje: w pełni umeblowane mieszkania, media (prąd, woda, ogrzewanie), szybki internet, sprzątanie, pościel i wyposażenie kuchni. Bez ukrytych opłat."
    },
    {
      question: "Jak szybko możecie zorganizować zakwaterowanie?",
      answer: "Zazwyczaj odpowiadamy tego samego dnia i możemy przygotować zakwaterowanie w ciągu 24-48 godzin na pilne zapytania. Dla planowanych projektów zalecamy rezerwację z 1-2 tygodniowym wyprzedzeniem."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Zakwaterowanie Firmowe Szwecja | Alternatywa Airbnb dla Firm"
        description="Szukasz Airbnb dla zespołu w Szwecji? Oferujemy w pełni umeblowane mieszkania z profesjonalnym fakturowaniem, elastyczne warunki od 30 dni. Lepsza alternatywa dla Airbnb dla firm."
        keywords="airbnb szwecja dla firm, airbnb alternatywa szwecja, zakwaterowanie firmowe szwecja, mieszkania dla firm szwecja, nocleg dla ekipy szwecja, zakwaterowanie umeå, mieszkania luleå, nocleg örebro, zakwaterowanie gävle, mieszkania västerås, noclegi norrland polska ekipa"
        canonical="https://www.stayonsite.se/pl/zakwaterowanie-firmowe"
        structuredData={[structuredData, faqSchema]}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/for-foretag' },
          { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
          { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
          { lang: 'x-default', href: 'https://www.stayonsite.se/for-foretag' }
        ]}
      />

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative isolate flex items-center min-h-[85vh] md:min-h-[800px] overflow-hidden pt-20 bg-primary">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-main.webp')" }}
          />

          <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-90" />

          <div className="container mx-auto px-6 md:px-12 relative z-20">
            <div className="max-w-[800px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  Alternatywa dla Airbnb dla Firm
                </span>
              </motion.div>

              <h1
                className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white mb-6"
              >
                Zakwaterowanie Firmowe Szwecja
              </h1>

              <p
                className="text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-8 max-w-2xl"
              >
                W pełni umeblowane mieszkania dla Twojego zespołu. Elastyczne warunki, cena all-inclusive, dedykowane wsparcie. Dostępne w całej Szwecji.
              </p>

              <DirectContact language="pl" className="mb-10" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-wrap gap-6 text-white/70"
              >
                {['Od 30 dni', 'Cena all-inclusive', 'Odpowiedź tego samego dnia'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-accent" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Personal Touch - Team */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img src="/images/kajsa.webp" alt="Kajsa - założycielka StayOnSite" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-lg font-semibold text-nordic-900">Kajsa i Zespół</p>
                <p className="text-nordic-600">Twój dedykowany zespół wsparcia - mówimy po angielsku!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-16 bg-nordic-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '100+', label: 'Zadowolonych Klientów' },
                { value: '500+', label: 'Mieszkań' },
                { value: 'Ten sam dzień', label: 'Czas Odpowiedzi' },
                { value: '40+', label: 'Miast' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <p className="text-sm text-nordic-600 uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
                Jak Pomagamy Twojej Firmie
              </h2>
              <p className="text-lg text-nordic-600 max-w-2xl mx-auto">
                Od znalezienia idealnego zakwaterowania po zarządzanie wszystkim podczas pobytu
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Building2,
                  title: 'Znajdź i Zarezerwuj',
                  description: 'Przeszukujemy naszą sieć 500+ zweryfikowanych nieruchomości, aby znaleźć idealne dopasowanie dla potrzeb i budżetu Twojego zespołu.'
                },
                {
                  icon: FileCheck,
                  title: 'Obsługa Dokumentów',
                  description: 'Profesjonalne fakturowanie, umowy i dokumentacja. Wszystko, czego potrzebujesz do księgowości firmowej.'
                },
                {
                  icon: Headphones,
                  title: 'Stałe Wsparcie',
                  description: 'Dedykowany opiekun klienta dostępny telefonicznie i przez WhatsApp. Szybko rozwiązujemy problemy, aby Twój zespół mógł skupić się na pracy.'
                }
              ].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-nordic-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-nordic-900 mb-3">{service.title}</h3>
                  <p className="text-nordic-600 leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl text-nordic-800 font-light italic mb-8 leading-relaxed">
                "StayOnSite sprawił, że relokacja naszego zespołu do Szwecji była niezwykle płynna. Profesjonalna obsługa, świetne mieszkania i zajęli się wszystkim."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 bg-nordic-200 rounded-full overflow-hidden">
                  <img src="/images/mats-testimonial.webp" alt="Mats Eriksson - opinia klienta StayOnSite" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-nordic-900">Kierownik Projektu</p>
                  <p className="text-sm text-nordic-600">Międzynarodowa Firma Budowlana</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
                Często Zadawane Pytania
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-nordic-50 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-nordic-900 mb-3">{item.question}</h3>
                  <p className="text-nordic-600 leading-relaxed">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Gotowy Znaleźć Zakwaterowanie dla Twojego Zespołu?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Skontaktuj się teraz - zazwyczaj odpowiadamy tego samego dnia
              </p>
              <DirectContact language="pl" className="justify-center mb-12" />
            </div>
          </div>
        </section>

        <InquiryForm />
      </main>

      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ZakwaterowanieFirmowe;
