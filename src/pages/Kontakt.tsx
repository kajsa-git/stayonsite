import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import InquiryForm from '@/components/InquiryForm';
import CityLinks from '@/components/CityLinks';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MessageCircle, MapPin, Clock } from 'lucide-react';

const Kontakt = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'StayOnSite',
      legalName: 'StayOnSite AB',
      telephone: '+46762498486',
      email: 'info@stayonsite.se',
      url: 'https://stayonsite.se',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'SE',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '17:00',
        },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+46762498486',
        contactType: 'customer service',
        availableLanguage: ['Swedish', 'English', 'Polish'],
      },
      sameAs: [
        'https://www.facebook.com/stayonsite',
        'https://www.linkedin.com/company/stayonsite',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://stayonsite.se/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('Kontakt', 'Contact', 'Kontakt'),
          item: 'https://stayonsite.se/kontakt',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t(
          'Kontakta StayOnSite — Personalboende & Företagsbostäder | Svar inom 3h',
          'Contact StayOnSite — Worker Accommodation & Corporate Housing | Reply within 3h',
          'Skontaktuj się ze StayOnSite — Noclegi Pracownicze | Odpowiedź w 3h'
        )}
        description={t(
          'Kontakta StayOnSite för personalboende och företagsbostäder i hela Sverige. Ring, mejla eller fyll i formuläret — vi svarar inom 3 timmar på vardagar.',
          'Contact StayOnSite for worker accommodation and corporate housing across Sweden. Call, email or fill in the form — we reply within 3 hours on weekdays.',
          'Skontaktuj się ze StayOnSite w sprawie noclegów pracowniczych i mieszkań firmowych w całej Szwecji. Zadzwoń, napisz lub wypełnij formularz — odpowiadamy w ciągu 3 godzin w dni robocze.'
        )}
        canonical="https://stayonsite.se/kontakt"
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
                  'Kontakta StayOnSite',
                  'Contact StayOnSite',
                  'Skontaktuj się ze StayOnSite'
                )}
              </h1>
              <p className="text-xl text-white/80 font-light leading-relaxed max-w-2xl">
                {t(
                  'Vi svarar inom 3 timmar på vardagar. Ring, mejla eller fyll i formuläret.',
                  'We reply within 3 hours on weekdays. Call, email or fill in the form.',
                  'Odpowiadamy w ciągu 3 godzin w dni robocze. Zadzwoń, napisz lub wypełnij formularz.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* NAP – Name, Address, Phone */}
        <section className="py-16 bg-white border-b">
          <div className="container mx-auto px-6 md:px-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-10 text-center">
              {t('Nå oss direkt', 'Reach us directly', 'Skontaktuj się bezpośrednio')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <a
                href="tel:+46762498486"
                className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">{t('Telefon', 'Phone', 'Telefon')}</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">
                    +46 76-249 84 86
                  </p>
                </div>
              </a>
              <a
                href="mailto:info@stayonsite.se"
                className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">E-post</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">
                    info@stayonsite.se
                  </p>
                </div>
              </a>
              <a
                href="https://wa.me/46762498486"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50 hover:bg-accent/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">WhatsApp</p>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent transition-colors">
                    +46 76-249 84 86
                  </p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-nordic-50">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-nordic-500">{t('Verksam i', 'Operating in', 'Działamy w')}</p>
                  <p className="font-semibold text-nordic-900">
                    {t('Hela Sverige', 'All of Sweden', 'Cała Szwecja')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="py-16 bg-nordic-50">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-8">
                {t('Öppettider', 'Opening hours', 'Godziny otwarcia')}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center max-w-sm mx-auto">
                  <span className="text-nordic-700 font-medium">
                    {t('Måndag – Fredag', 'Monday – Friday', 'Poniedziałek – Piątek')}
                  </span>
                  <span className="font-semibold text-nordic-900">08:00 – 17:00</span>
                </div>
                <div className="pt-4 border-t border-nordic-200">
                  <p className="text-nordic-600">
                    {t(
                      'Akuta ärenden: Dygnet runt via telefon',
                      'Urgent matters: Available 24/7 by phone',
                      'Pilne sprawy: Dostępni 24/7 telefonicznie'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <InquiryForm />

        {/* City Coverage */}
        <CityLinks />
      </main>

      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default Kontakt;
