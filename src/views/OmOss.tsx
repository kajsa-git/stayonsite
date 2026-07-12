'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { trackPhoneClick, trackEmailClick, trackWhatsAppClick } from '@/lib/gtag';
import { cities } from '@/data/cities';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Building2,
  HardHat,
  Zap,
  Factory,
  ShieldCheck,
  Clock,
  Users,
  Home,
  Star,
} from 'lucide-react';

const OmOss = () => {
  const { language, t: tr } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: 'StayOnSite',
      legalName: 'StayOnSite AB',
      description: t(
        'StayOnSite erbjuder personalboende och företagsbostäder i hela Sverige för byggbolag och industriföretag.',
        'StayOnSite provides worker accommodation and corporate housing across Sweden for construction and industrial companies.',
        'StayOnSite oferuje zakwaterowanie pracownicze i mieszkania firmowe w całej Szwecji dla firm budowlanych i przemysłowych.'
      ),
      url: 'https://www.stayonsite.se',
      telephone: '+46762498486',
      email: 'info@stayonsite.se',
      founder: {
        '@type': 'Person',
        name: 'Kajsa Sihlén',
        jobTitle: 'Grundare & VD',
        sameAs: ['https://www.linkedin.com/in/kajsa-sihl%C3%A9n-4b16b657/'],
      },
      foundingDate: '2016',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SE',
      },
      areaServed: cities.map((c) => ({
        '@type': 'City',
        name: c.name,
      })),
      serviceType: [
        'Personalboende',
        'Företagsbostäder',
        'Worker Accommodation',
        'Corporate Housing',
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: RATING_VALUE,
        reviewCount: REVIEW_COUNT,
        bestRating: '5',
      },
    },
  ];

  const stats = [
    {
      value: RATING_VALUE,
      label: t(
        `i snittbetyg från ${REVIEW_COUNT} kunder`,
        `average rating from ${REVIEW_COUNT} clients`,
        `średnia ocena od ${REVIEW_COUNT} klientów`
      ),
    },
    {
      value: `${cities.length}`,
      label: t('städer med lokal närvaro', 'cities with local presence', 'miast z lokalną obecnością'),
    },
    {
      value: '24 h',
      label: t('till färdig boendeplan', 'to a complete housing plan', 'do gotowego planu zakwaterowania'),
    },
    {
      value: '2016',
      label: t('grundat – tio år i branschen', 'founded – ten years in the business', 'rok założenia – dziesięć lat w branży'),
    },
  ];

  const testimonials = [
    { quote: tr('references.testimonial1.quote'), author: tr('references.testimonial1.author') },
    { quote: tr('references.testimonial3.quote'), author: tr('references.testimonial3.author') },
    { quote: tr('references.testimonial5.quote'), author: tr('references.testimonial5.author') },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t(
          'Om StayOnSite – Personalboende & Företagsbostäder i Sverige',
          'About StayOnSite – Worker Accommodation & Corporate Housing Sweden',
          'O StayOnSite – Noclegi Pracownicze i Mieszkania Firmowe w Szwecji'
        )}
        description={t(
          'StayOnSite hjälper byggbolag och industriföretag att hitta möblerade boenden i hela Sverige. Kontakta oss för personalboende, montörboende och företagslägenheter.',
          'StayOnSite helps construction and industrial companies find furnished accommodation across Sweden. Contact us for worker housing, crew accommodation and corporate apartments.',
          'StayOnSite pomaga firmom budowlanym i przemysłowym znaleźć umeblowane zakwaterowanie w całej Szwecji. Skontaktuj się z nami w sprawie noclegów pracowniczych i mieszkań firmowych.'
        )}
        canonical="https://www.stayonsite.se/om-oss"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/om-oss' },
        ]}
      />
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-primary text-white pt-32 pb-16 md:pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t(
                  'Personalboende i hela Sverige – en kontaktperson, ett samtal',
                  'Worker accommodation across Sweden – one contact, one call',
                  'Noclegi pracownicze w całej Szwecji – jeden kontakt, jeden telefon'
                )}
              </h1>
              <p className="text-xl text-white/80 font-light leading-relaxed max-w-2xl">
                {t(
                  'StayOnSite ordnar möblerade boenden åt byggbolag, industriföretag och montörsteam – från Kiruna i norr till Malmö i söder.',
                  'StayOnSite arranges furnished housing for construction companies, industrial firms and installation crews – from Kiruna in the north to Malmö in the south.',
                  'StayOnSite organizuje umeblowane noclegi dla firm budowlanych, przemysłowych i ekip montażowych – od Kiruny na północy po Malmö na południu.'
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl">
              {stats.map((stat) => (
                <div key={stat.value} className="rounded-2xl bg-white/10 border border-white/10 p-5 md:p-6">
                  <p className="font-display text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/70 mt-1 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
              <p className="text-sm uppercase tracking-[0.3em] text-accent mb-4">
                {t('Vår historia', 'Our story', 'Nasza historia')}
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-8">
                {t(
                  'Det byggs i hela Sverige. Någon måste ordna boendet.',
                  'Sweden is building everywhere. Someone has to arrange the housing.',
                  'W całej Szwecji trwają budowy. Ktoś musi zorganizować zakwaterowanie.'
                )}
              </h2>
              <div className="space-y-6 text-nordic-700 leading-relaxed text-lg font-light">
                <p>
                  {t(
                    'StayOnSite grundades 2016 av Kajsa Sihlén, ur en enkel iakttagelse: när Sverige bygger sker det allt oftare på orter där det knappt finns något boende att uppbringa. Solparker, vindkraft, järnväg och industriprojekt hamnar sällan i storstan – de hamnar i Säffle, Boden och Oskarshamn. Dit reser team på 10, 20, ibland 45 personer som behöver bo bra i månader eller år. Hotell blir snabbt dyrt och opersonligt, och att ringa runt bland hyresvärdar är inget ett byggbolag hinner med mitt i ett projekt.',
                    'StayOnSite was founded in 2016 by Kajsa Sihlén, based on a simple observation: when Sweden builds, it increasingly happens in places where housing is hard to come by. Solar parks, wind farms, railways and industrial projects rarely land in the big cities – they land in Säffle, Boden and Oskarshamn. Crews of 10, 20, sometimes 45 people travel there and need somewhere good to live for months or years. Hotels quickly get expensive and impersonal, and calling around to landlords is not something a construction company has time for in the middle of a project.',
                    'StayOnSite zostało założone w 2016 roku przez Kajsę Sihlén na podstawie prostego spostrzeżenia: szwedzkie inwestycje coraz częściej powstają w miejscach, gdzie trudno o zakwaterowanie. Farmy solarne, wiatrowe, koleje i projekty przemysłowe rzadko trafiają do wielkich miast – trafiają do Säffle, Boden i Oskarshamn. Przyjeżdżają tam ekipy liczące 10, 20, czasem 45 osób, które potrzebują dobrego lokum na miesiące lub lata. Hotele szybko stają się drogie i bezosobowe, a obdzwanianie wynajmujących to nic, na co firma budowlana ma czas w środku projektu.'
                  )}
                </p>
                <p>
                  {t(
                    'Så vi byggde nätverket i stället – ort för ort, husägare för husägare. Idag täcker vi hela Sverige, från Kiruna i norr till Malmö i söder, med lokal närvaro i över 30 städer och ett nätverk som gör att vi kan ordna boende även där vi inte redan har objekt. När ett polskt montageföretag behövde boende för 45 montörer vid solparken i Säffle fick de ett komplett förslag inom 24 timmar och flyttade in två dygn senare. Idag bor deras team hos oss på tre orter samtidigt.',
                    'So we built the network instead – town by town, homeowner by homeowner. Today we cover all of Sweden, from Kiruna in the north to Malmö in the south, with a local presence in over 30 cities and a network that lets us arrange housing even where we don’t already have properties. When a Polish installation company needed housing for 45 workers at the solar park in Säffle, they had a complete proposal within 24 hours and moved in two days later. Today their teams stay with us in three towns at once.',
                    'Zbudowaliśmy więc sieć – miasto po mieście, właściciel po właścicielu. Dziś obejmujemy całą Szwecję, od Kiruny na północy po Malmö na południu, z lokalną obecnością w ponad 30 miastach i siecią, dzięki której organizujemy zakwaterowanie także tam, gdzie nie mamy jeszcze obiektów. Gdy polska firma montażowa potrzebowała noclegów dla 45 monterów przy farmie solarnej w Säffle, otrzymała kompletną propozycję w ciągu 24 godzin i wprowadziła się dwa dni później. Dziś jej ekipy mieszkają u nas w trzech miejscowościach jednocześnie.'
                  )}
                </p>
                <p>
                  {t(
                    'Tio år senare är idén densamma: en kontaktperson, ett fast månadspris och boenden där teamet faktiskt trivs. Vi tror att människor som bor bra gör ett bättre jobb – och att den som hyr ut sitt hus ska känna sig lika trygg som den som flyttar in.',
                    'Ten years on, the idea is the same: one contact person, one fixed monthly price, and housing where the team actually feels at home. We believe people who live well do better work – and that a homeowner who rents out their house should feel just as secure as the team moving in.',
                    'Dziesięć lat później idea pozostaje ta sama: jedna osoba kontaktowa, jedna stała cena miesięczna i lokum, w którym ekipa naprawdę dobrze się czuje. Wierzymy, że ludzie, którzy dobrze mieszkają, lepiej pracują – a właściciel wynajmujący swój dom powinien czuć się równie bezpiecznie jak ci, którzy się wprowadzają.'
                  )}
                </p>
              </div>
              <figure className="mt-10 border-l-4 border-accent pl-6">
                <blockquote className="text-xl md:text-2xl font-display text-nordic-900 leading-snug">
                  {t(
                    '“Ett boende är mer än en adress. Bor teamet bra, flyter projektet bättre.”',
                    '“Housing is more than an address. When the team lives well, the project runs better.”',
                    '„Zakwaterowanie to więcej niż adres. Gdy ekipa dobrze mieszka, projekt idzie lepiej.”'
                  )}
                </blockquote>
                <figcaption className="mt-3 text-sm text-nordic-600">
                  Kajsa Sihlén, {t('grundare & VD', 'founder & CEO', 'założycielka i CEO')}
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Våra tjänster', 'Our services', 'Nasze usługi')}
            </h2>
            <p className="text-nordic-600 text-center mb-12 max-w-2xl mx-auto">
              {t(
                'Ett fast månadspris utan dolda avgifter – exakt vad som ingår avtalas utifrån projektets behov.',
                'One fixed monthly price with no hidden fees – exactly what is included is agreed based on the needs of each project.',
                'Jedna stała cena miesięczna bez ukrytych opłat – dokładny zakres ustalany jest według potrzeb projektu.'
              )}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Home, label: t('Möblerade lägenheter', 'Furnished apartments', 'Umeblowane mieszkania'), desc: t('Fullt utrustade med kök, sängar och internet', 'Fully equipped with kitchen, beds and internet', 'W pełni wyposażone z kuchnią, łóżkami i internetem') },
                { icon: ShieldCheck, label: t('Kontrakt & fakturering', 'Contracts & invoicing', 'Umowy i fakturowanie'), desc: t('Professionell företagsfaktura varje månad', 'Professional corporate invoice every month', 'Profesjonalna faktura firmowa co miesiąc') },
                { icon: Clock, label: t('Boendeplan inom 24h', 'Housing plan in 24h', 'Plan zakwaterowania w 24h'), desc: t('Adresser, priser och inflyttningsdatum', 'Addresses, prices and move-in dates', 'Adresy, ceny i daty wprowadzenia') },
                { icon: Users, label: t('Dedikerad kontaktperson', 'Dedicated contact person', 'Dedykowana osoba kontaktowa'), desc: t('Samma person under hela projektet', 'Same person throughout the project', 'Ta sama osoba przez cały projekt') },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold text-nordic-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-nordic-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer types */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-12 text-center">
              {t('Vilka vi hjälper', 'Who we help', 'Komu pomagamy')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: HardHat, label: t('Byggbolag', 'Construction companies', 'Firmy budowlane'), desc: t('Boende för byggarbetare och hantverkare på projekt runt om i Sverige', 'Housing for construction workers and craftspeople on projects across Sweden', 'Noclegi dla pracowników budowlanych na projektach w całej Szwecji') },
                { icon: Zap, label: t('Energi & industri', 'Energy & industry', 'Energetyka i przemysł'), desc: t('Kärnkraft, vindkraft, gruvor, datacenter', 'Nuclear, wind power, mining, data centers', 'Energetyka jądrowa, wiatrowa, górnictwo, centra danych') },
                { icon: Building2, label: t('Infrastruktur', 'Infrastructure', 'Infrastruktura'), desc: t('Väg, järnväg, tunnelbyggen och offentliga projekt', 'Roads, railways, tunnel construction and public projects', 'Drogi, koleje, tunele i projekty publiczne') },
                { icon: Factory, label: t('Montörer & installatörer', 'Installers & assembly teams', 'Monterzy i ekipy instalacyjne'), desc: t('El, VVS, ventilation och maskinmontage', 'Electrical, HVAC, ventilation and machinery assembly', 'Elektryka, HVAC, wentylacja i montaż maszyn') },
              ].map((item) => (
                <div key={item.label} className="text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-nordic-900 mb-2">{item.label}</h3>
                  <p className="text-sm text-nordic-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Vad våra kunder säger', 'What our clients say', 'Co mówią nasi klienci')}
            </h2>
            <p className="text-nordic-600 text-center mb-12">
              {t(
                `${RATING_VALUE} i snittbetyg, baserat på ${REVIEW_COUNT} omdömen`,
                `${RATING_VALUE} average rating, based on ${REVIEW_COUNT} reviews`,
                `Średnia ocena ${RATING_VALUE} na podstawie ${REVIEW_COUNT} opinii`
              )}
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((item) => (
                <figure key={item.author} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex gap-1 mb-4" aria-label={`${RATING_VALUE} / 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                    ))}
                  </div>
                  <blockquote className="text-nordic-700 leading-relaxed flex-grow">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-nordic-900">{item.author}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* City coverage */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Vi täcker hela Sverige', 'We cover all of Sweden', 'Obsługujemy całą Szwecję')}
            </h2>
            <p className="text-nordic-600 text-center mb-10 max-w-2xl mx-auto">
              {t(
                `Lokal närvaro i ${cities.length} städer – och vi ordnar boende även utanför dessa.`,
                `Local presence in ${cities.length} cities – and we arrange housing beyond these too.`,
                `Lokalna obecność w ${cities.length} miastach – organizujemy też zakwaterowanie poza nimi.`
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {cities.map((city) => {
                let href = `/stad/${city.slug}`;
                if (language === 'en') href = `/en/corporate-housing/${city.slug}`;
                if (language === 'pl') href = `/pl/zakwaterowanie/${city.slug}`;
                return (
                  <Link
                    key={city.slug}
                    href={href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-nordic-50 border border-nordic-200 hover:border-accent hover:bg-accent/5 transition-colors text-sm text-nordic-900 hover:text-accent"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {city.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* NAP – Name, Address, Phone */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Kontakta StayOnSite', 'Contact StayOnSite', 'Skontaktuj się ze StayOnSite')}
            </h2>
            <p className="text-nordic-600 text-center mb-10">
              {t(
                'Ring, mejla eller skriv på WhatsApp – vi återkommer alltid inom en arbetsdag, ofta inom några timmar.',
                'Call, email or message us on WhatsApp – we always get back to you within one business day, often within hours.',
                'Zadzwoń, napisz e-mail lub na WhatsApp – zawsze odpowiadamy w ciągu jednego dnia roboczego, często w kilka godzin.'
              )}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <a href="tel:+46762498486" onClick={trackPhoneClick} className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">{t('Telefon', 'Phone', 'Telefon')}</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">+46 76-249 84 86</p>
                </div>
              </a>
              <a href="mailto:info@stayonsite.se" onClick={trackEmailClick} className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">E-post</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">info@stayonsite.se</p>
                </div>
              </a>
              <a href="https://wa.me/46762498486" onClick={trackWhatsAppClick} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">WhatsApp</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">+46 76-249 84 86</p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">{t('Verksam i', 'Operating in', 'Działamy w')}</p>
                  <p className="font-semibold text-nordic-900">{t('Hela Sverige', 'All of Sweden', 'Cała Szwecja')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default OmOss;
