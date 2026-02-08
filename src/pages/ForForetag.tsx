import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import InquiryForm from '@/components/InquiryForm';
import CityLinks from '@/components/CityLinks';
import { useLanguage } from '@/contexts/LanguageContext';
import { RATING_VALUE, REVIEW_COUNT } from '@/data/constants';
import { motion } from 'framer-motion';
import {
  HardHat,
  Zap,
  Building2,
  Factory,
  TreePine,
  CheckCircle2,
  X,
  Minus,
  ArrowRight,
  MapPin,
  Clock,
  Home,
  Quote,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const ForForetag = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  // FAQ data
  const faqItems = [
    {
      q: t(
        'Hur snabbt kan ni ordna boende?',
        'How quickly can you arrange accommodation?',
        'Jak szybko mogą Państwo zorganizować zakwaterowanie?'
      ),
      a: t(
        'Vi skickar en boendeplan inom 24 timmar efter er förfrågan. Vid akuta behov kan vi ofta ordna inflyttning samma vecka. Vi har ett stort nätverk av lägenheter i hela Sverige redo att möbleras och anpassas.',
        'We send a housing plan within 24 hours of your inquiry. For urgent needs, we can often arrange move-in the same week. We have a large network of apartments across Sweden ready to be furnished and adapted.',
        'Wysyłamy plan zakwaterowania w ciągu 24 godzin od zapytania. W nagłych przypadkach możemy często zorganizować wprowadzenie w tym samym tygodniu. Mamy dużą sieć mieszkań w całej Szwecji.'
      ),
    },
    {
      q: t(
        'Vad kostar personalboende?',
        'What does worker accommodation cost?',
        'Ile kosztuje zakwaterowanie pracownicze?'
      ),
      a: t(
        'Priset beror på stad, antal personer och boendets standard. Generellt ligger personalboende på 3 000–8 000 kr per person och månad — betydligt billigare än hotell. Ni får en detaljerad offert anpassad efter era behov.',
        'The price depends on the city, number of people, and accommodation standard. Generally, worker housing costs SEK 3,000–8,000 per person per month — significantly cheaper than hotels. You receive a detailed quote tailored to your needs.',
        'Cena zależy od miasta, liczby osób i standardu zakwaterowania. Zazwyczaj noclegi pracownicze kosztują 3 000–8 000 SEK na osobę miesięcznie — znacznie taniej niż hotel. Otrzymają Państwo szczegółową ofertę.'
      ),
    },
    {
      q: t(
        'Vilka städer täcker ni?',
        'Which cities do you cover?',
        'Które miasta obsługujecie?'
      ),
      a: t(
        'Vi har boenden i 40+ städer i hela Sverige, från Malmö i söder till Luleå i norr. Vi täcker alla större industri- och byggknutpunkter. Hittar du inte din stad? Kontakta oss — vi löser boende var som helst.',
        'We have accommodation in 40+ cities across Sweden, from Malmö in the south to Luleå in the north. We cover all major industrial and construction hubs. Cannot find your city? Contact us — we arrange housing anywhere.',
        'Mamy zakwaterowanie w ponad 40 miastach w całej Szwecji, od Malmö na południu po Luleå na północy. Nie możesz znaleźć swojego miasta? Skontaktuj się z nami.'
      ),
    },
    {
      q: t(
        'Är boendet möblerat?',
        'Is the accommodation furnished?',
        'Czy zakwaterowanie jest umeblowane?'
      ),
      a: t(
        'Ja, alla våra boenden är fullt möblerade med sängar, kök, tvättutrustning och internet. Era medarbetare kan flytta in direkt utan att behöva ordna något själva. Vi anpassar även boendet efter teamets storlek.',
        'Yes, all our accommodations are fully furnished with beds, kitchen, laundry facilities, and internet. Your employees can move in directly without needing to arrange anything themselves. We also adapt the housing to your team size.',
        'Tak, wszystkie nasze zakwaterowania są w pełni umeblowane z łóżkami, kuchnią, pralnią i internetem. Pracownicy mogą się wprowadzić od razu bez konieczności organizowania czegokolwiek.'
      ),
    },
    {
      q: t(
        'Hur fungerar faktureringen?',
        'How does invoicing work?',
        'Jak działa fakturowanie?'
      ),
      a: t(
        'Ni får en samlad företagsfaktura varje månad med 10 dagars betalningsvillkor. Varje projekt redovisas separat för enkel bokföring. Allt ingår — hyra, möblering, internet och löpande support.',
        'You receive a consolidated corporate invoice every month with 10-day payment terms. Each project is reported separately for easy accounting. Everything is included — rent, furnishing, internet and ongoing support.',
        'Otrzymują Państwo zbiorczą fakturę firmową co miesiąc z 10-dniowym terminem płatności. Każdy projekt jest rozliczany oddzielnie. Wszystko w cenie — czynsz, meble, internet i bieżące wsparcie.'
      ),
    },
    {
      q: t(
        'Erbjuder ni ramavtal?',
        'Do you offer framework agreements?',
        'Czy oferujecie umowy ramowe?'
      ),
      a: t(
        'Ja, för företag med återkommande boendebehov erbjuder vi ramavtal med förhandlade villkor. Ni får en prislista och avropar boende efter behov — "4 personer i Gävle" så fixar vi resten. Inga separata offertförfrågningar för varje nytt projekt.',
        'Yes, for companies with recurring accommodation needs we offer framework agreements with pre-negotiated terms. You get a price list and order accommodation as needed — "4 people in Gävle" and we handle the rest. No separate quote requests for each new project.',
        'Tak, dla firm z powtarzającymi się potrzebami zakwaterowania oferujemy umowy ramowe z wynegocjowanymi warunkami. Otrzymujecie cennik i zamawiacie zakwaterowanie w miarę potrzeb — żadnych oddzielnych zapytań ofertowych.'
      ),
    },
    {
      q: t(
        'Kan ni kommunicera med våra utländska arbetslag?',
        'Can you communicate with our foreign work crews?',
        'Czy możecie komunikować się z naszymi zagranicznymi ekipami?'
      ),
      a: t(
        'Ja, via WhatsApp hanterar vi kommunikation på alla språk med hjälp av AI-översättning. Era maskinlag och montörteam kan kontakta oss direkt — på sitt eget språk. Vi är er boendevärd, inte bara en bokningsfunktion.',
        'Yes, via WhatsApp we handle communication in all languages using AI translation. Your crews and installation teams can contact us directly — in their own language. We are your accommodation host, not just a booking function.',
        'Tak, przez WhatsApp obsługujemy komunikację we wszystkich językach dzięki tłumaczeniu AI. Wasze ekipy mogą kontaktować się z nami bezpośrednio — w swoim języku.'
      ),
    },
    {
      q: t(
        'Vad är minsta avtalstid?',
        'What is the minimum contract period?',
        'Jaki jest minimalny okres umowy?'
      ),
      a: t(
        'Minsta avtalstid är 3 månader per boende. För ramavtalskunder kan enskilda avrop vara kortare så länge ramavtalet gäller. Vi anpassar oss efter era projektcykler.',
        'The minimum contract period is 3 months per accommodation. For framework agreement clients, individual call-offs can be shorter as long as the framework agreement is active. We adapt to your project cycles.',
        'Minimalny okres umowy to 3 miesiące na zakwaterowanie. Dla klientów z umową ramową pojedyncze zamówienia mogą być krótsze. Dostosowujemy się do cykli Waszych projektów.'
      ),
    },
  ];

  // Comparison data
  const comparisonLabels = {
    pricePerNight: t('Pris per person/mån', 'Price per person/month', 'Cena za osobę/mies.'),
    invoice: t('Företagsfaktura', 'Corporate invoice', 'Faktura firmowa'),
    contact: t('Fast kontaktperson', 'Dedicated contact', 'Stała osoba kontaktowa'),
    flexible: t('Flexibla avtal', 'Flexible contracts', 'Elastyczne umowy'),
    colHotel: t('Hotell', 'Hotel', 'Hotel'),
    colAirbnb: 'Airbnb',
    colSelf: t('Egen hantering', 'Self-managed', 'Samodzielne'),

    multilingual: t('Flerspråkig service', 'Multilingual service', 'Obsługa wielojęzyczna'),
    projectInvoice: t('Projektfakturering', 'Project-based invoicing', 'Fakturowanie projektowe'),
  };

  const comparisonRows = [
    {
      label: comparisonLabels.pricePerNight,
      stayonsite: t('5 000–10 000 kr', 'SEK 5,000–10,000', '5 000–10 000 SEK'),
      hotel: t('15 000–30 000 kr', 'SEK 15,000–30,000', '15 000–30 000 SEK'),
      airbnb: t('8 000–15 000 kr', 'SEK 8,000–15,000', '8 000–15 000 SEK'),
      self: t('Varierar', 'Varies', 'Różnie'),
    },
    { label: comparisonLabels.invoice, stayonsite: true, hotel: true, airbnb: false, self: false },
    { label: comparisonLabels.contact, stayonsite: true, hotel: false, airbnb: false, self: false },
    { label: comparisonLabels.flexible, stayonsite: true, hotel: 'partial' as const, airbnb: false, self: true },

    { label: comparisonLabels.multilingual, stayonsite: true, hotel: false, airbnb: false, self: false },
    { label: comparisonLabels.projectInvoice, stayonsite: true, hotel: false, airbnb: false, self: false },
  ];

  const renderIcon = (value: boolean | string) => {
    if (value === true) return <CheckCircle2 size={22} className="text-green-500" />;
    if (value === 'partial') return <Minus size={22} className="text-primary/30" />;
    if (value === false) return <X size={22} className="text-primary/20" />;
    return <span className="font-bold text-sm text-primary">{value}</span>;
  };

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'StayOnSite Corporate Worker Accommodation',
      description: t(
        'StayOnSite erbjuder personalboende och företagsbostäder i hela Sverige för bygg, energi, skog, infrastruktur och montörsteam. Ramavtal och projektfakturering.',
        'StayOnSite provides corporate worker accommodation across Sweden for construction, energy, forestry, infrastructure and installation teams. Framework agreements and project invoicing.',
        'StayOnSite oferuje zakwaterowanie pracownicze w całej Szwecji dla budownictwa, energetyki, leśnictwa, infrastruktury i montażu. Umowy ramowe i fakturowanie projektowe.'
      ),
      provider: {
        '@type': 'LodgingBusiness',
        name: 'StayOnSite',
        telephone: '+46 76-249 84 86',
        url: 'https://stayonsite.se',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Sweden',
      },
      serviceType: 'Corporate Worker Accommodation',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: RATING_VALUE,
        reviewCount: REVIEW_COUNT,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'StayOnSite',
          item: 'https://stayonsite.se',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('För företag', 'For companies', 'Dla firm'),
          item: 'https://stayonsite.se/for-foretag',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t(
          'Personalboende för företag — Boende för alla era projekt i Sverige | StayOnSite',
          'Worker Accommodation for Companies — Housing for All Your Projects in Sweden | StayOnSite',
          'Zakwaterowanie pracownicze dla firm — Noclegi dla wszystkich projektów w Szwecji | StayOnSite'
        )}
        description={t(
          'StayOnSite ordnar personalboende för byggbolag och industriföretag i 40+ städer. Möblerade lägenheter, företagsfaktura, fast kontaktperson. Boendeplan inom 24h.',
          'StayOnSite arranges worker accommodation for construction and industrial companies in 40+ cities. Furnished apartments, corporate invoicing, dedicated contact. Housing plan within 24h.',
          'StayOnSite organizuje zakwaterowanie pracownicze dla firm budowlanych i przemysłowych w ponad 40 miastach. Umeblowane mieszkania, faktura firmowa, plan zakwaterowania w 24h.'
        )}
        canonical="https://stayonsite.se/for-foretag"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://stayonsite.se/for-foretag' },
          { lang: 'en', href: 'https://stayonsite.se/en/corporate-housing-sweden' },
          { lang: 'pl', href: 'https://stayonsite.se/pl/zakwaterowanie-firmowe' },
          { lang: 'x-default', href: 'https://stayonsite.se/for-foretag' },
        ]}
      />
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-primary text-white pt-32 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-main.webp"
              alt="Personalboende för företag i Sverige – StayOnSite ordnar boende nära arbetsplatsen"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-primary/95 via-primary/70 to-primary/40" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 drop-shadow-2xl">
                {t(
                  'Personalboende för alla era projekt i hela Sverige',
                  'Worker housing for all your projects across Sweden',
                  'Zakwaterowanie dla wszystkich Waszych projektów w całej Szwecji'
                )}
              </h1>
              <p className="text-xl text-white/80 font-light leading-relaxed max-w-2xl mb-10">
                {t(
                  'En kontakt, en faktura. Vi ordnar möblerade boenden i 40+ städer med svarstid under 24 timmar — för bygg, energi, skog, infrastruktur och montörsteam.',
                  'One contact, one invoice. We arrange furnished accommodation in 40+ cities with response time under 24 hours — for construction, energy, forestry, infrastructure and installation teams.',
                  'Jeden kontakt, jedna faktura. Organizujemy umeblowane zakwaterowanie w ponad 40 miastach z czasem odpowiedzi poniżej 24 godzin — dla budownictwa, energetyki, leśnictwa i montażu.'
                )}
              </p>
              <Button
                asChild
                className="rounded-full px-10 h-14 text-lg font-semibold text-white bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
              >
                <a href="#inquiry">
                  {t('Få en boendeplan', 'Get a housing plan', 'Uzyskaj plan zakwaterowania')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>

            {/* Stat badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-4 mt-14"
            >
              {[
                { icon: MapPin, value: '40+', label: t('städer', 'cities', 'miast') },
                { icon: Clock, value: '<24h', label: t('svarstid', 'response time', 'czas odpowiedzi') },
                { icon: Home, value: '500+', label: t('boenden', 'accommodations', 'noclegów') },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10"
                >
                  <stat.icon className="h-5 w-5 text-[#ff6300]" />
                  <div>
                    <span className="font-display font-bold text-xl">{stat.value}</span>
                    <span className="text-white/70 ml-1.5 text-sm">{stat.label}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sectors */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                {t('Vilka vi hjälper', 'Who we help', 'Komu pomagamy')}
              </h2>
              <p className="text-nordic-600 max-w-2xl mx-auto">
                {t(
                  'Vi har erfarenhet av personalboende för alla typer av projekt — från storskalig infrastruktur till mindre montörsteam.',
                  'We have experience with worker housing for all types of projects — from large-scale infrastructure to smaller installation crews.',
                  'Mamy doświadczenie w zakwaterowaniu pracowniczym dla wszystkich typów projektów.'
                )}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: HardHat,
                  label: t('Bygg & Anläggning', 'Construction', 'Budownictwo'),
                  desc: t(
                    'Boende för byggarbetare, hantverkare och projektteam på byggarbetsplatser runt om i Sverige.',
                    'Housing for construction workers, craftspeople and project teams at building sites across Sweden.',
                    'Noclegi dla pracowników budowlanych i ekip projektowych na budowach w całej Szwecji.'
                  ),
                },
                {
                  icon: Zap,
                  label: t('Energi & Kärnkraft', 'Energy & Nuclear', 'Energetyka i jądrowa'),
                  desc: t(
                    'Personal vid kärnkraftverk, vindkraftsparker, solcellsinstallationer och kraftledningsprojekt.',
                    'Staff at nuclear plants, wind farms, solar installations and power line projects.',
                    'Personel w elektrowniach jądrowych, farmach wiatrowych i projektach energetycznych.'
                  ),
                },
                {
                  icon: Building2,
                  label: t('Infrastruktur', 'Infrastructure', 'Infrastruktura'),
                  desc: t(
                    'Väg- och järnvägsbyggen, tunnelprojekt, broar och offentliga anläggningsprojekt.',
                    'Road and railway construction, tunnel projects, bridges and public infrastructure.',
                    'Budowa dróg i kolei, projekty tunelowe, mosty i infrastruktura publiczna.'
                  ),
                },
                {
                  icon: TreePine,
                  label: t('Skog & Maskin', 'Forestry & Machinery', 'Leśnictwo i maszyny'),
                  desc: t(
                    'Maskinlag, timmeravverkning och skogsentreprenad. Vi ordnar boende nära avverkningsplatserna.',
                    'Machine crews, timber harvesting and forestry contracting. We arrange accommodation near logging sites.',
                    'Ekipy maszynowe, pozyskiwanie drewna i usługi leśne. Organizujemy zakwaterowanie blisko miejsc pracy.'
                  ),
                },
                {
                  icon: Factory,
                  label: t('Montörer, Stål & Installation', 'Assembly, Steel & Installation', 'Montaż, stal i instalacje'),
                  desc: t(
                    'El, VVS, stålbyggnad, ventilation, maskinmontage och industriella installationsteam.',
                    'Electrical, HVAC, steel construction, ventilation, machinery assembly and industrial installation teams.',
                    'Elektrycy, HVAC, konstrukcje stalowe, wentylacja, montaż maszyn i ekipy instalacyjne.'
                  ),
                },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-nordic-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <item.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-semibold text-nordic-900 text-lg mb-2">{item.label}</h3>
                  <p className="text-sm text-nordic-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-20 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                {t('Så fungerar det', 'How it works', 'Jak to działa')}
              </h2>
              <p className="text-nordic-600 max-w-2xl mx-auto">
                {t(
                  'Från första samtal till inflyttning — vi gör det enkelt.',
                  'From the first call to move-in — we make it simple.',
                  'Od pierwszego telefonu do wprowadzenia — robimy to prosto.'
                )}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {[
                {
                  step: '1',
                  title: t('Berätta vad ni behöver', 'Tell us your needs', 'Opowiedz o potrzebach'),
                  desc: t(
                    'Antal personer, stad, datum och önskad standard. Ring eller fyll i formuläret.',
                    'Number of people, city, dates and desired standard. Call or fill in the form.',
                    'Liczba osób, miasto, daty i pożądany standard. Zadzwoń lub wypełnij formularz.'
                  ),
                },
                {
                  step: '2',
                  title: t('Boendeplan inom 24h', 'Housing plan in 24h', 'Plan zakwaterowania w 24h'),
                  desc: t(
                    'Vi skickar en skräddarsydd boendeplan med adresser, bilder och priser.',
                    'We send a tailored housing plan with addresses, photos and prices.',
                    'Wysyłamy dopasowany plan zakwaterowania z adresami, zdjęciami i cenami.'
                  ),
                },
                {
                  step: '3',
                  title: t('Kontrakt & inflyttning', 'Contract & move-in', 'Umowa i wprowadzenie'),
                  desc: t(
                    'Enkel företagsfakturering. Era medarbetare flyttar in i ett fullt möblerat boende.',
                    'Simple corporate invoicing. Your employees move into a fully furnished accommodation.',
                    'Proste fakturowanie firmowe. Pracownicy wprowadzają się do w pełni umeblowanego mieszkania.'
                  ),
                },
                {
                  step: '4',
                  title: t('Dedikerad boendevärd', 'Dedicated accommodation host', 'Dedykowany opiekun zakwaterowania'),
                  desc: t(
                    'Er kontaktperson under hela projektet. Allt boenderelaterat går genom oss — ni fokuserar på ert arbete.',
                    'Your contact person throughout the project. All accommodation matters go through us — you focus on your work.',
                    'Wasza osoba kontaktowa przez cały projekt. Wszystkie sprawy zakwaterowania przechodzą przez nas — Wy skupiacie się na pracy.'
                  ),
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-5 font-display text-xl font-bold shadow-lg shadow-accent/30">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-nordic-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-nordic-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vad ingår */}
        <section className="py-20 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                {t('Vad ingår?', 'What\'s included?', 'Co jest w cenie?')}
              </h2>
              <p className="text-nordic-600 max-w-2xl mx-auto">
                {t(
                  'Era medarbetare flyttar in i ett komplett boende — allt är förberett.',
                  'Your employees move into a complete accommodation — everything is prepared.',
                  'Wasi pracownicy wprowadzają się do kompletnego zakwaterowania — wszystko jest przygotowane.'
                )}
              </p>
            </div>
            <div className="max-w-xl mx-auto">
              <div className="bg-nordic-50 rounded-2xl p-8 border border-nordic-100">
                <h3 className="font-display font-bold text-nordic-900 text-lg mb-5">
                  {t('Ingår i boendet', 'Included', 'W cenie')}
                </h3>
                <ul className="space-y-3">
                  {[
                    t('Möblerade lägenheter', 'Furnished apartments', 'Umeblowane mieszkania'),
                    t('Sänglinne & handdukar', 'Bed linen & towels', 'Pościel i ręczniki'),
                    t('Fullt utrustat kök', 'Fully equipped kitchen', 'W pełni wyposażona kuchnia'),
                    t('Internet & WiFi', 'Internet & WiFi', 'Internet i WiFi'),
                    t('Fast kontaktperson', 'Dedicated contact person', 'Stała osoba kontaktowa'),
                    t('Inflyttningsstädning', 'Move-in cleaning', 'Sprzątanie przed wprowadzeniem'),
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-nordic-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="section-spacing bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                {t(
                  'Varför välja StayOnSite?',
                  'Why choose StayOnSite?',
                  'Dlaczego wybrać StayOnSite?'
                )}
              </h2>
              <p className="text-nordic-600 max-w-2xl mx-auto">
                {t(
                  'Se hur vi jämför oss med alternativen — hotell, Airbnb och egen hantering.',
                  'See how we compare to the alternatives — hotels, Airbnb and self-managed.',
                  'Zobacz, jak wypadamy na tle alternatyw — hoteli, Airbnb i samodzielnego zarządzania.'
                )}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="rounded-3xl border border-primary/10 overflow-hidden shadow-lg">
                {/* Table header */}
                <div className="grid grid-cols-5 bg-primary text-white">
                  <div className="p-5 font-display font-bold text-sm md:text-base" />
                  <div className="p-5 text-center font-display font-bold text-sm md:text-base bg-accent/20 border-x border-white/10">
                    StayOnSite
                  </div>
                  <div className="p-5 text-center font-display font-bold text-sm md:text-base text-white/70">
                    {comparisonLabels.colHotel}
                  </div>
                  <div className="p-5 text-center font-display font-bold text-sm md:text-base text-white/70">
                    {comparisonLabels.colAirbnb}
                  </div>
                  <div className="p-5 text-center font-display font-bold text-sm md:text-base text-white/70">
                    {comparisonLabels.colSelf}
                  </div>
                </div>

                {/* Table rows */}
                {comparisonRows.map((row, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-5 ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'} border-t border-primary/5`}
                  >
                    <div className="p-4 md:p-5 font-medium text-primary text-sm md:text-base flex items-center">
                      {row.label}
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center bg-accent/5 border-x border-primary/5">
                      {renderIcon(row.stayonsite)}
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center">
                      {renderIcon(row.hotel)}
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center">
                      {renderIcon(row.airbnb)}
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center">
                      {renderIcon(row.self)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Kundcase */}
        <section className="py-20 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                  {t(
                    'Från mängder av spridda kvitton till en faktura',
                    'From scattered receipts to one invoice',
                    'Od rozproszonych rachunków do jednej faktury'
                  )}
                </h2>
              </div>
              <div className="bg-nordic-50 rounded-2xl p-8 md:p-10 border border-nordic-100">
                <Quote className="h-8 w-8 text-accent/40 mb-4" />
                <p className="text-lg text-nordic-800 leading-relaxed mb-6">
                  {t(
                    'Ett skogsbolag med maskinlag spridda över hela Sverige lade mer tid på att koordinera boende än på sin kärnverksamhet. Separata Airbnb-bokningar, mängder av spridda kvitton och projektledaren blev en ofrivillig mellanhand. Med StayOnSites ramavtalsmodell gör de nu ett samtal — och allt är löst. Boende nära avverkningsplatsen, direktkontakt med maskinlagen och projektmärkta fakturor.',
                    'A forestry company with crews across Sweden spent more time coordinating accommodation than on their core business. Separate Airbnb bookings, scattered receipts, and the project manager became an unwilling middleman. With StayOnSite\'s framework agreement model, they now make one call — and everything is handled. Accommodation near the logging site, direct communication with crews, and project-specific invoicing.',
                    'Firma leśna z ekipami w całej Szwecji poświęcała więcej czasu na koordynację zakwaterowania niż na swoją podstawową działalność. Osobne rezerwacje Airbnb, rozproszone rachunki, a kierownik projektu stał się niechcianym pośrednikiem. Dzięki umowie ramowej StayOnSite wykonują teraz jeden telefon — i wszystko jest załatwione.'
                  )}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {[
                    t('En faktura per månad', 'One invoice per month', 'Jedna faktura miesięcznie'),
                    t('En kontaktperson', 'One contact person', 'Jedna osoba kontaktowa'),
                    t('Inflyttningsklart inom 24h', 'Move-in ready within 24h', 'Gotowe w 24h'),
                  ].map((tag) => (
                    <span key={tag} className="bg-accent/10 text-accent px-4 py-1.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ramavtal */}
        <section className="py-20 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                    {t(
                      'Ramavtal — för företag med återkommande behov',
                      'Framework agreements — for companies with recurring needs',
                      'Umowy ramowe — dla firm z powtarzającymi się potrzebami'
                    )}
                  </h2>
                  <p className="text-nordic-600 mb-8">
                    {t(
                      'Istället för separata offertförfrågningar varje gång ni behöver boende — teckna ett ramavtal och avropas efter behov.',
                      'Instead of separate quote requests every time you need accommodation — sign a framework agreement and order as needed.',
                      'Zamiast oddzielnych zapytań ofertowych za każdym razem — podpisz umowę ramową i zamawiaj w miarę potrzeb.'
                    )}
                  </p>
                  <ul className="space-y-4">
                    {[
                      { icon: FileCheck, text: t('Ett avtal, många projekt', 'One contract, many projects', 'Jedna umowa, wiele projektów') },
                      { icon: ArrowRight, text: t('Avrop istället för offertförfrågningar', 'Call-offs instead of quote requests', 'Zamówienia zamiast zapytań ofertowych') },
                      { icon: FileCheck, text: t('Projektmärkta fakturor', 'Project-specific invoicing', 'Faktury z oznaczeniem projektu') },
                      { icon: ArrowRight, text: t('Direktkontakt mellan StayOnSite och era arbetslag', 'Direct contact between StayOnSite and your work crews', 'Bezpośredni kontakt między StayOnSite a Waszymi ekipami') },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-3">
                        <item.icon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <span className="text-nordic-800">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <Button
                    asChild
                    className="rounded-full px-10 h-14 text-lg font-semibold text-white bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
                  >
                    <a href="#inquiry">
                      {t('Kontakta oss om ramavtal', 'Contact us about framework agreements', 'Skontaktuj się w sprawie umowy ramowej')}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <p className="text-sm text-nordic-500 mt-4">
                    {t(
                      'Vi återkommer inom 24 timmar med ett förslag.',
                      'We get back to you within 24 hours with a proposal.',
                      'Odpowiadamy w ciągu 24 godzin z propozycją.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Context */}
        <section className="py-20 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                  {t(
                    'Bostadsbristen är en realitet',
                    'The housing shortage is a reality',
                    'Niedobór mieszkań jest faktem'
                  )}
                </h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-nordic-100"
              >
                <Quote className="h-8 w-8 text-accent/40 mb-4" />
                <blockquote className="text-lg text-nordic-800 leading-relaxed mb-4 italic">
                  {t(
                    'Boverket bedömer att det behöver byggas 67 300 bostäder per år fram till 2030. Många regioner med stora bygg- och industriprojekt har akut bostadsbrist — särskilt tillfälliga boenden för projektanställd personal.',
                    'Boverket estimates that 67,300 homes need to be built annually until 2030. Many regions with large construction and industrial projects face acute housing shortages — especially temporary accommodation for project-employed staff.',
                    'Boverket szacuje, że rocznie do 2030 roku trzeba budować 67 300 mieszkań. Wiele regionów z dużymi projektami budowlanymi i przemysłowymi boryka się z ostrym niedoborem mieszkań.'
                  )}
                </blockquote>
                <p className="text-sm text-nordic-500 font-medium">
                  — Boverket, {t('Bostadsmarknadsenkäten', 'Housing Market Survey', 'Ankieta rynku mieszkaniowego')} 2025
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-nordic-100"
              >
                <Quote className="h-8 w-8 text-accent/40 mb-4" />
                <blockquote className="text-lg text-nordic-800 leading-relaxed mb-4 italic">
                  {t(
                    'Byggindustrin sysselsätter över 350 000 personer och prognoser visar på ett växande behov av arbetskraft. Samtidigt rapporterar 7 av 10 byggföretag svårigheter att hitta boenden för sin personal på projektort.',
                    'The construction industry employs over 350,000 people and forecasts show a growing need for labour. At the same time, 7 out of 10 construction companies report difficulties finding accommodation for their staff at project locations.',
                    'Branża budowlana zatrudnia ponad 350 000 osób, a prognozy wskazują na rosnące zapotrzebowanie na siłę roboczą. Jednocześnie 7 na 10 firm budowlanych zgłasza trudności ze znalezieniem noclegów.'
                  )}
                </blockquote>
                <p className="text-sm text-nordic-500 font-medium">
                  — Byggföretagen, 2025
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nordic-900 mb-4">
                {t('Vanliga frågor', 'Frequently asked questions', 'Najczesciej zadawane pytania')}
              </h2>
              <p className="text-nordic-600 max-w-2xl mx-auto">
                {t(
                  'Har du fler frågor? Ring oss på +46 76-249 84 86 eller fyll i formuläret nedan.',
                  'Have more questions? Call us at +46 76-249 84 86 or fill in the form below.',
                  'Masz wiecej pytan? Zadzwon pod +46 76-249 84 86 lub wypelnij formularz ponizej.'
                )}
              </p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-nordic-200 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-nordic-50 transition-colors"
                  >
                    <span className="font-semibold text-nordic-900 pr-4">{item.q}</span>
                    <span
                      className={`text-accent text-2xl transition-transform duration-200 shrink-0 ${openFaq === index ? 'rotate-45' : ''}`}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-5 md:px-6 pb-5 md:pb-6">
                      <p className="text-nordic-600 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        <InquiryForm />

        {/* City Links */}
        <CityLinks />
      </main>

      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ForForetag;
