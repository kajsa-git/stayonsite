import Footer from '@/components/Footer';
import Header from '@/components/Header';
import SEO from '@/components/SEO';
import { COMPANY_FACTS } from '@/data/constants';
import { BookOpenCheck, Bot, BriefcaseBusiness, Mail, RefreshCw, Scale, SearchCheck } from 'lucide-react';
import Link from 'next/link';

const principles = [
  {
    icon: BriefcaseBusiness,
    title: 'Erfarenhet från riktiga projekt',
    text: 'Våra praktiska råd utgår från StayOnSites arbete med personalboende och företagsbostäder sedan 2016. Vi skiljer på egna erfarenheter, allmänna råd och uppgifter från externa källor.',
  },
  {
    icon: SearchCheck,
    title: 'Primärkällor först',
    text: 'Lagar, skatter, myndighetskrav och offentliga projekt kontrolleras i första hand mot lagtext, riksdagsbeslut, myndigheter, kommuner och projektägare. Centrala källor ska vara klickbara.',
  },
  {
    icon: Scale,
    title: 'Tydliga gränser för rådgivning',
    text: 'Våra artiklar ger allmän information. Juridiska, skattemässiga och arbetsrättsliga frågor kan kräva individuell rådgivning från behörig expert.',
  },
  {
    icon: RefreshCw,
    title: 'Datum och rättelser',
    text: 'Publiceringsdatum visas på alla artiklar. Vid en materiell ändring visar vi även uppdateringsdatum. Upptäckta sakfel rättas öppet när de påverkar artikelns slutsats.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Redaktionella riktlinjer för StayOnSites blogg',
  description: 'Så arbetar StayOnSite med erfarenhet, källor, AI-stöd, uppdateringar och rättelser i bloggen.',
  url: 'https://www.stayonsite.se/blogg/redaktionella-riktlinjer',
  datePublished: '2026-09-06',
  dateModified: '2026-09-06',
  about: {
    '@type': 'Organization',
    '@id': `${COMPANY_FACTS.url}/#organization`,
    name: COMPANY_FACTS.name,
    legalName: COMPANY_FACTS.legalName,
    url: COMPANY_FACTS.url,
  },
};

export default function EditorialGuidelines() {
  return (
    <div className="min-h-screen bg-white">
      <SEO structuredData={structuredData} />
      <Header />

      <main>
        <section className="bg-primary pb-16 pt-32 text-white md:pb-20">
          <div className="container mx-auto max-w-4xl px-6 md:px-12">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-white/65">
              Trovärdighet och transparens
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Så arbetar vi med innehåll
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-white/80 md:text-xl">
              StayOnSites blogg ska hjälpa företag och husägare att fatta bättre beslut om
              personalboende och uthyrning. Här beskriver vi vem som ansvarar för innehållet,
              hur fakta kontrolleras och hur vi rättar fel.
            </p>
            <p className="mt-5 text-sm text-white/55">Riktlinjerna gäller från 6 september 2026.</p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-5xl px-6 md:px-12">
            <div className="grid gap-6 md:grid-cols-2">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <article key={principle.title} className="rounded-2xl border border-nordic-200 bg-nordic-50 p-7">
                    <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                    <h2 className="mt-5 font-display text-2xl font-semibold text-nordic-900">
                      {principle.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-nordic-700">{principle.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-nordic-200 bg-nordic-50 py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-6 md:px-12">
            <div className="prose prose-lg prose-nordic max-w-none prose-headings:font-display prose-headings:text-nordic-900 prose-a:text-accent">
              <h2>Vem står bakom artiklarna?</h2>
              <p>
                Innehållsansvarig är Kajsa Sihlén, grundare och VD för StayOnSite. Kajsa
                grundade bolaget 2016 och arbetar med boendeplanering för bygg-, industri-,
                energi- och infrastrukturprojekt i Sverige. Författarlänken på varje artikel
                leder till vår <Link href="/om-oss">företags- och författarpresentation</Link>.
              </p>

              <h2>Hur väljer vi ämnen?</h2>
              <p>
                Frågor från kunder, husägare och pågående boendeprojekt är utgångspunkten.
                Sökdata från sökmotorer används för att förstå vilka ord människor använder
                och vilka frågor som saknar tydliga svar. Sökvolym är ett prioriteringsunderlag,
                inte ett skäl att publicera tunna eller upprepade artiklar.
              </p>
              <p>
                Lokala guider ska besvara ett verkligt lokalt behov, exempelvis boende nära ett
                namngivet projekt, pendlingsavstånd, parkering för servicefordon eller uthyrning
                till företag på orten. En stadssida och en lokal guide ska inte konkurrera om
                samma sökintention.
              </p>

              <h2>Hur använder vi källor?</h2>
              <p>
                När en artikel innehåller uppgifter om lagar, skatter, kollektivavtal,
                offentlig statistik eller projektbeslut ska den centrala uppgiften kunna
                spåras till en ansvarig primärkälla. Vi prioriterar bland annat Svensk
                författningssamling, Sveriges riksdag, Skatteverket, Boverket, SCB,
                Arbetsmiljöverket, Trafikverket, kommuner och projektägare.
              </p>
              <p>
                Källistan visar när källan senast kontrollerades. En länk innebär inte att
                källorganisationen rekommenderar StayOnSite. Marknadsuppgifter och priser kan
                förändras och dateras därför så långt det är praktiskt möjligt.
              </p>

              <h2>AI och digitala verktyg</h2>
              <div className="not-prose my-6 flex gap-4 rounded-2xl border border-nordic-200 bg-white p-6">
                <Bot className="mt-1 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-nordic-700">
                  Digitala verktyg, inklusive AI, kan användas för researchstöd, struktur och
                  första utkast. Ett verktyg anges inte som författare och är aldrig källa för
                  ett sakpåstående. Det namngivna innehållsansvaret ligger hos StayOnSite.
                </p>
              </div>

              <h2>Uppdateringar och äldre artiklar</h2>
              <p>
                Denna källstandard infördes den 6 september 2026. Nya och materiellt
                uppdaterade artiklar ska följa den. Äldre artiklar granskas successivt, med
                förtur för innehåll om lag, skatt och säkerhet samt sidor som får mest trafik.
                En artikel får bara nytt uppdateringsdatum när innehållet faktiskt har ändrats.
              </p>

              <h2>Kommersiella intressen</h2>
              <p>
                StayOnSite säljer personalboende och hjälper husägare att hyra ut till företag.
                Bloggen kan därför länka till våra tjänster. Källor, lagtolkningar och
                jämförelser ska ändå hållas isär från säljbudskap. Eventuella samarbeten eller
                sponsrade placeringar ska märkas tydligt.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-6 text-center md:px-12">
            <BookOpenCheck className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl font-semibold text-nordic-900">
              Har du hittat ett fel?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-nordic-700">
              Skicka artikelns adress, den uppgift du reagerar på och gärna en primärkälla.
              Vi granskar rättelsen och uppdaterar artikeln när det behövs.
            </p>
            <a
              href="mailto:info@stayonsite.se?subject=Rattelse%20i%20bloggen"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 font-semibold text-white transition hover:bg-accent/90"
            >
              <Mail className="h-5 w-5" aria-hidden="true" />
              Mejla en rättelse
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
