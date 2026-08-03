'use client'

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import References from '@/components/References';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { cities } from '@/data/cities';
import ForForetagHero from '@/components/foretag/ForForetagHero';

const ForForetag = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'StayOnSite Corporate Worker Accommodation',
      description: t(
        'StayOnSite erbjuder personalboende och företagsbostäder i hela Sverige för bygg, energi, skog, infrastruktur och montörsteam.',
        'StayOnSite provides corporate worker accommodation across Sweden for construction, energy, forestry, infrastructure and installation teams.',
        'StayOnSite oferuje zakwaterowanie pracownicze w całej Szwecji dla budownictwa, energetyki, leśnictwa, infrastruktury i montażu.'
      ),
      provider: {
        '@type': 'LodgingBusiness',
        name: 'StayOnSite',
        telephone: '+46 76-249 84 86',
        url: 'https://www.stayonsite.se',
      },
      areaServed: {
        '@type': 'Country',
        name: 'Sweden',
      },
      serviceType: 'Corporate Worker Accommodation',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: t('Vad kostar personalboende?', 'What does worker accommodation cost?', 'Ile kosztuje zakwaterowanie?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Från 5 900 kr per månad. Priset beror på stad, antal personer och standard - men alltid betydligt billigare än hotell. Ni får en detaljerad offert anpassad efter era behov.',
              'From SEK 5,900 per month. Price depends on city, number of people and standard - but always significantly cheaper than hotels. You receive a detailed quote tailored to your needs.',
              'Od 5 900 SEK miesięcznie. Cena zależy od miasta, liczby osób i standardu - ale zawsze znacznie taniej niż hotel.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Hur snabbt kan ni ordna boende?', 'How quickly can you arrange accommodation?', 'Jak szybko mogą Państwo zorganizować zakwaterowanie?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Vi skickar en boendeplan inom 24 timmar. Vid akuta behov kan vi ofta ordna inflyttning samma vecka.',
              'We send a housing plan within 24 hours. For urgent needs, we can often arrange move-in the same week.',
              'Wysyłamy plan zakwaterowania w ciągu 24 godzin. W nagłych przypadkach - wprowadzenie w tym samym tygodniu.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Är boendet möblerat?', 'Is the accommodation furnished?', 'Czy zakwaterowanie jest umeblowane?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Ja, alla boenden är fullt möblerade med sängar, kök, tvättutrustning och internet. Era medarbetare kan flytta in direkt.',
              'Yes, all accommodations are fully furnished with beds, kitchen, laundry facilities and internet. Your employees can move in directly.',
              'Tak, wszystkie zakwaterowania są w pełni umeblowane. Pracownicy mogą się wprowadzić od razu.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Vad ingår i priset?', 'What is included in the price?', 'Co jest wliczone w cenę?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Vanligtvis hyra, el, vatten, internet, städning och sängkläder – till ett fast månadspris per person. Exakt vad som ingår avtalas separat utifrån projektets förutsättningar. En kontaktperson genom hela projektet, inga dolda avgifter.',
              'Typically rent, utilities, internet, cleaning and bed linen – at a fixed monthly price per person. Exactly what is included is agreed separately based on the circumstances of each project. One contact person throughout the project, no hidden fees.',
              'Zazwyczaj czynsz, media, internet, sprzątanie i pościel – w stałej cenie miesięcznej za osobę. Dokładny zakres ustalany jest osobno w zależności od warunków projektu. Jedna osoba kontaktowa przez cały projekt, bez ukrytych opłat.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Hur fungerar faktureringen?', 'How does invoicing work?', 'Jak działa fakturowanie?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Ni får en samlad företagsfaktura per adress och månad, med 10 dagars betalningsvillkor som standard. Projektmärkning på fakturan är möjlig för er internredovisning.',
              'You receive one consolidated corporate invoice per address and month, with 10-day payment terms as standard. Project labelling on the invoice is available for your internal accounting.',
              'Otrzymują Państwo jedną zbiorczą fakturę firmową na adres i miesiąc, standardowo z 10-dniowym terminem płatności. Możliwe jest oznaczenie projektu na fakturze.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Vad är minsta avtalstid?', 'What is the minimum contract length?', 'Jaki jest minimalny okres umowy?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Tre månader. Någon övre gräns finns inte – många kunder behåller samma adresser i 18–24 månader, och vid förlängning justeras avtalet utan att ni behöver boka om.',
              'Three months. There is no upper limit – many clients keep the same addresses for 18–24 months, and on extension the contract is adjusted without rebooking.',
              'Trzy miesiące. Nie ma górnej granicy – wielu klientów zatrzymuje te same adresy na 18–24 miesiące, a przy przedłużeniu umowa jest dostosowywana bez ponownej rezerwacji.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Ordnar ni entreprenörsbostäder för underentreprenörer?', 'Do you arrange contractor accommodation for subcontractors?', 'Czy organizują Państwo zakwaterowanie dla podwykonawców?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Ja. Vi ordnar entreprenörsbostäder åt både huvudentreprenörer och underentreprenörer – ofta flera bolag på samma projekt, med separata avtal och fakturor per bolag.',
              'Yes. We arrange contractor accommodation for both main contractors and subcontractors – often several companies on the same project, with separate agreements and invoices per company.',
              'Tak. Organizujemy zakwaterowanie zarówno dla głównych wykonawców, jak i podwykonawców – często kilka firm na tym samym projekcie, z osobnymi umowami i fakturami.'
            ),
          },
        },
        {
          '@type': 'Question',
          name: t('Ordnar ni boende för både arbetslag och familjer?', 'Do you arrange housing for both crews and families?', 'Czy organizują Państwo zakwaterowanie dla ekip i rodzin?'),
          acceptedAnswer: {
            '@type': 'Answer',
            text: t(
              'Ja. Vi ordnar boenden för montörsteam, ingenjörer och medföljande familjer – ofta på långa kontrakt. Växer teamet under projektet löser vi fler platser inom samma avtal.',
              'Yes. We arrange housing for installation crews, engineers and accompanying families – often on long contracts. If the team grows during the project, we add capacity within the same agreement.',
              'Tak. Organizujemy zakwaterowanie dla ekip montażowych, inżynierów i towarzyszących rodzin – często na długie umowy. Gdy zespół rośnie, dodajemy miejsca w ramach tej samej umowy.'
            ),
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t(
          'Personalboende för företag - Boka offert | StayOnSite',
          'Worker Accommodation for Companies - Get a Quote | StayOnSite',
          'Zakwaterowanie pracownicze dla firm - Otrzymaj ofertę | StayOnSite'
        )}
        description={t(
          'Hitta personalboende för ert team. Möblerat, inflyttningsklart, en faktura. Vi ordnar boende i hela Sverige. Offert inom 24 timmar.',
          'Find worker accommodation for your team. Furnished, move-in ready, one invoice. We arrange accommodation across Sweden. Quote within 24 hours.',
          'Znajdź zakwaterowanie dla swojego zespołu. Umeblowane, gotowe, jedna faktura. Oferta w ciągu 24 godzin.'
        )}
        canonical="https://www.stayonsite.se/for-foretag"
        structuredData={structuredData}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/for-foretag' },
          { lang: 'en', href: 'https://www.stayonsite.se/en/corporate-housing-sweden' },
          { lang: 'pl', href: 'https://www.stayonsite.se/pl/zakwaterowanie-firmowe' },
          { lang: 'x-default', href: 'https://www.stayonsite.se/for-foretag' },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <ForForetagHero />

        {/* Social proof: 14 Google-omdömen + track record — samma sektion som startsidan */}
        <References />

        {/* Entreprenörsbostäder/projektboende: egna sökord med volym men utan sida tidigare */}
        <section className="py-16 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12 max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-nordic-900 mb-4">
              {t('Entreprenörsbostäder och projektboende', 'Contractor accommodation and project housing', 'Zakwaterowanie dla wykonawców i ekip projektowych')}
            </h2>
            <div className="text-nordic-600 max-w-3xl space-y-4">
              <p>
                {t(
                  'Bygg-, installations- och industriföretag som tar projekt på annan ort behöver ofta bostäder till hela arbetslag med kort varsel. Vi ordnar entreprenörsbostäder – möblerade hus och lägenheter nära arbetsplatsen – åt entreprenörer, underentreprenörer och montörsteam i hela Sverige.',
                  'Construction, installation and industrial companies taking on projects away from home often need housing for entire crews at short notice. We arrange contractor accommodation – furnished houses and apartments close to the site – for contractors, subcontractors and installation teams across Sweden.',
                  'Firmy budowlane, instalacyjne i przemysłowe realizujące projekty poza siedzibą często potrzebują zakwaterowania dla całych ekip w krótkim czasie. Organizujemy umeblowane domy i mieszkania blisko placu budowy – dla wykonawców, podwykonawców i ekip montażowych w całej Szwecji.'
                )}
              </p>
              <p>
                {language === 'en' ? (
                  <>
                    Project housing is scaled to your staffing: from two fitters in one apartment to rotating crews of 20+ across several addresses. You receive a housing plan within 24 hours and one consolidated invoice per address and month – whether the project is in{' '}
                    <Link href="/stad/boden" className="text-accent hover:underline">Boden</Link>,{' '}
                    <Link href="/stad/gavle" className="text-accent hover:underline">Gävle</Link>,{' '}
                    <Link href="/stad/oskarshamn" className="text-accent hover:underline">Oskarshamn</Link>{' '}
                    or in a smaller town with no hotel capacity.
                  </>
                ) : language === 'pl' ? (
                  <>
                    Zakwaterowanie dopasowujemy do obsady: od dwóch monterów w jednym mieszkaniu po rotacyjne ekipy 20+ osób w kilku lokalizacjach. Plan zakwaterowania otrzymują Państwo w ciągu 24 godzin, a rozliczenie to jedna zbiorcza faktura na adres i miesiąc – niezależnie od tego, czy projekt jest w{' '}
                    <Link href="/stad/boden" className="text-accent hover:underline">Boden</Link>,{' '}
                    <Link href="/stad/gavle" className="text-accent hover:underline">Gävle</Link>{' '}
                    czy <Link href="/stad/oskarshamn" className="text-accent hover:underline">Oskarshamn</Link>.
                  </>
                ) : (
                  <>
                    Projektboendet anpassas efter bemanningen: från två montörer i en lägenhet till rotationslag på 20+ personer fördelade på flera adresser. Ni får en boendeplan inom 24 timmar och en samlad faktura per adress och månad – oavsett om projektet ligger i{' '}
                    <Link href="/stad/boden" className="text-accent hover:underline">Boden</Link>,{' '}
                    <Link href="/stad/gavle" className="text-accent hover:underline">Gävle</Link>,{' '}
                    <Link href="/stad/oskarshamn" className="text-accent hover:underline">Oskarshamn</Link>{' '}
                    eller på en mindre ort utan hotellkapacitet.
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Stads-hubb: funnlar köpare till rätt ort + intern länkkraft till stadssidorna */}
        <section className="py-16 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12 max-w-5xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-nordic-900 mb-4">
              {t('Företagsbostäder i hela Sverige', 'Corporate housing across Sweden', 'Zakwaterowanie firmowe w całej Szwecji')}
            </h2>
            <p className="text-nordic-600 mb-8 max-w-2xl">
              {t(
                'Vi ordnar personalboende och företagsbostäder stad för stad – med extra fokus på orter utanför storstäderna där bygg-, energi- och industriprojekten är som störst. Hitta er ort:',
                'We arrange worker accommodation and corporate housing city by city – with extra focus on locations outside the big cities where construction, energy and industrial projects are largest. Find your location:',
                'Organizujemy zakwaterowanie pracownicze i mieszkania firmowe miasto po mieście – ze szczególnym naciskiem na miejscowości poza dużymi miastami. Znajdź swoją lokalizację:'
              )}
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {[...cities]
                .sort((a, b) => a.name.localeCompare(b.name, 'sv'))
                .map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/stad/${city.slug}`}
                      className="text-nordic-700 hover:text-accent transition-colors"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ForForetag;
