import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

const OmOss = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StayOnSite',
      description: t(
        'StayOnSite erbjuder personalboende och företagsbostäder i hela Sverige för byggbolag och industriföretag.',
        'StayOnSite provides worker accommodation and corporate housing across Sweden for construction and industrial companies.',
        'StayOnSite oferuje zakwaterowanie pracownicze i mieszkania firmowe w całej Szwecji dla firm budowlanych i przemysłowych.'
      ),
      url: 'https://stayonsite.se',
      telephone: '+46762498486',
      email: 'info@stayonsite.se',
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
      },
    },
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
        canonical="https://stayonsite.se/om-oss"
        structuredData={structuredData}
      />
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-primary text-white pt-32 pb-20">
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
                  'StayOnSite ordnar möblerade boenden åt byggbolag, industriföretag och montörsteam. Vi har över 10 års erfarenhet och täcker 19+ städer.',
                  'StayOnSite arranges furnished housing for construction companies, industrial firms and installation crews. Over 10 years of experience covering 19+ cities.',
                  'StayOnSite organizuje umeblowane noclegi dla firm budowlanych, przemysłowych i ekip montażowych. Ponad 10 lat doświadczenia, 19+ miast.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* NAP – Name, Address, Phone */}
        <section className="py-16 bg-white border-b">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-10 text-center">
              {t('Kontakta StayOnSite', 'Contact StayOnSite', 'Skontaktuj się ze StayOnSite')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <a href="tel:+46762498486" className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">{t('Telefon', 'Phone', 'Telefon')}</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">+46 76-249 84 86</p>
                </div>
              </a>
              <a href="mailto:info@stayonsite.se" className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">E-post</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">info@stayonsite.se</p>
                </div>
              </a>
              <a href="https://wa.me/46762498486" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">WhatsApp</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">+46 76-249 84 86</p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50">
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

        {/* Services */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Våra tjänster', 'Our services', 'Nasze usługi')}
            </h2>
            <p className="text-nordic-600 text-center mb-12 max-w-2xl mx-auto">
              {t(
                'Allt ingår i ett fast månadspris. Inga dolda avgifter.',
                'Everything included in one fixed monthly price. No hidden fees.',
                'Wszystko w jednej stałej cenie miesięcznej. Bez ukrytych opłat.'
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

        {/* City coverage */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4 text-center">
              {t('Städer vi täcker', 'Cities we cover', 'Miasta, które obsługujemy')}
            </h2>
            <p className="text-nordic-600 text-center mb-10">
              {t(
                'Personalboende i 19 städer – och vi ordnar boende även utanför dessa.',
                'Worker accommodation in 19 cities – and we arrange housing beyond these too.',
                'Noclegi pracownicze w 19 miastach – organizujemy też zakwaterowanie poza nimi.'
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
                    to={href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-nordic-200 hover:border-accent hover:bg-accent/5 transition-colors text-sm text-nordic-900 hover:text-accent"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {city.name}
                  </Link>
                );
              })}
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
