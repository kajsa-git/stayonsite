'use client'

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  FileText,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import MobileStickyFormCTA from '@/components/MobileStickyFormCTA';
import ProjectBriefForm from '@/components/ProjectBriefForm';
import SEO from '@/components/SEO';
import { COMPANY_FACTS } from '@/data/constants';

const fitRows = [
  {
    need: '10-50 personer, 3-12 månader',
    stayonsite: 'Primärt användningsfall',
    hotel: 'Flexibelt men ofta dyrt över tid',
    aparthotel: 'Möjligt där utbud finns',
    landlord: 'Hög administration',
    module: 'Ofta större etablering än behovet kräver',
  },
  {
    need: 'Mindre projektort',
    stayonsite: 'Starkt användningsfall',
    hotel: 'Utbud och parkering varierar',
    aparthotel: 'Begränsat utbud',
    landlord: 'Tidskrävande att samordna',
    module: 'Möjligt vid längre tid och rätt mark',
  },
  {
    need: 'Varierande bemanning',
    stayonsite: 'Planeras i avtal och boendemix',
    hotel: 'Flexibelt men kostnadsdrivande',
    aparthotel: 'Varierar per ort',
    landlord: 'Ofta svårt utan mellanhand',
    module: 'Kräver framförhållning',
  },
  {
    need: '500+ personer på en site',
    stayonsite: 'Komplement eller overflow',
    hotel: 'Sällan lämpligt som huvudlösning',
    aparthotel: 'Sällan tillräcklig kapacitet',
    landlord: 'Sällan praktiskt som huvudlösning',
    module: 'Primär lösning vid rätt förutsättningar',
  },
];

const processSteps = [
  {
    title: 'Projektbrief',
    text: 'Ni skickar ort, arbetsplats, bemanning, datum, pendlingstid, parkering, rumsmodell och budgetram.',
    icon: FileText,
  },
  {
    title: 'Boendeplan',
    text: 'StayOnSite söker lämpliga bostäder, bedömer restid och tar fram en plan som visar boendemix, kapacitet och villkor.',
    icon: MapPin,
  },
  {
    title: 'Avtal och inflyttning',
    text: 'Avtal, fakturareferens, nycklar, inventarier, städning och kontaktvägar sätts innan arbetslaget flyttar in.',
    icon: CalendarDays,
  },
  {
    title: 'Drift under projektet',
    text: 'Rotation, extra bäddar, felanmälan, ersättningsboende och avslut hanteras mot samma kontakt.',
    icon: RotateCcw,
  },
];

const faqItems = [
  {
    q: 'Vem passar StayOnSite bäst för?',
    a: 'Bygg-, energi-, industri-, infrastruktur- och montagebolag som behöver ordna boende för arbetslag på projektorter. Det tydligaste användningsfallet är 10-100 personer, flera veckor eller månader, och en projektorganisation som vill slippa samordna varje bostad själv.',
  },
  {
    q: 'Vilka orter kan lösas?',
    a: 'StayOnSite arbetar med svenska projektorter och bedömer varje ny ort utifrån arbetsplats, sökradie, bostadsutbud, parkering och tidsplan. Om det saknas färdigt utbud i en ort söks närliggande boenden i praktisk pendlingsradie.',
  },
  {
    q: 'Hur räknas totalpriset?',
    a: 'Totalpriset påverkas av ort, antal personer, boendetyp, enkelrum eller delat boende, avtalslängd, inkluderade tjänster, parkering och restid. Därför efterfrågar formuläret både budget och praktiska krav innan offert.',
  },
  {
    q: 'Vad ingår och vad ingår inte?',
    a: 'Normalt kravställs möblering, kök, tvätt, internet, städning, linne och parkering per projekt. Exakt omfattning, deposition, skador, uppsägning och fakturering ska framgå av offert och avtal, inte antas generellt.',
  },
  {
    q: 'Hur kontrolleras bostäder och ansvar?',
    a: 'Bostäder ska bedömas mot projektets krav på standard, antal bäddar, säkerhet, brandskydd, försäkring, nyckelhantering, felanmälan och ansvarsfördelning mellan StayOnSite, bostadsägare och företagskund.',
  },
  {
    q: 'Vad händer om bemanningen ändras?',
    a: 'Rotation och volymändringar bör anges redan i briefen. Då kan boendemixen planeras med marginal, sökradie och fallback så att projektet inte låses till fel antal bäddar.',
  },
];

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${COMPANY_FACTS.url}/for-foretag#service`,
    name: 'Företagsbostäder och personalboende för projekt i Sverige',
    description: COMPANY_FACTS.serviceSummary,
    provider: {
      '@type': 'Organization',
      '@id': `${COMPANY_FACTS.url}/#organization`,
      name: COMPANY_FACTS.name,
      legalName: COMPANY_FACTS.legalName,
      url: COMPANY_FACTS.url,
      telephone: COMPANY_FACTS.phoneDisplay,
      email: COMPANY_FACTS.email,
      logo: COMPANY_FACTS.logoUrl,
      foundingDate: COMPANY_FACTS.foundingDate,
      founder: {
        '@type': 'Person',
        name: COMPANY_FACTS.founder,
        sameAs: [COMPANY_FACTS.founderLinkedIn],
      },
      sameAs: [COMPANY_FACTS.googleBusinessProfile, COMPANY_FACTS.linkedIn],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'Bygg, energi, industri, infrastruktur och montage',
    },
    serviceType: [
      'Företagsbostäder',
      'Personalboende',
      'Företagsboende',
      'Projektboende',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Hem',
        item: `${COMPANY_FACTS.url}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'För företag',
        item: `${COMPANY_FACTS.url}/for-foretag`,
      },
    ],
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
];

export default function ForForetag() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO structuredData={structuredData} />
      <Header />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-primary pt-32 pb-16 text-white md:pt-36 md:pb-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/hero-foretag.webp"
              alt="Möblerat personalboende för företag i Sverige"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-6 md:px-12">
            <nav className="mb-10 text-sm text-white/65" aria-label="Brödsmulor">
              <Link href="/" className="hover:text-white">
                Hem
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white">För företag</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-start">
              <div className="max-w-3xl">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-white/60">
                  Företagsbostäder · personalboende · projektboende
                </p>
                <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                  Företagsbostäder och personalboende för bygg, industri och montage
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/78 md:text-xl">
                  StayOnSite samordnar möblerade boenden för arbetslag i svenska projekt där tid,
                  restid, parkering, fakturering och förändrad bemanning behöver fungera tillsammans.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#projektbrief"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff6300] px-6 font-semibold text-white transition hover:bg-[#e25200]"
                  >
                    Skicka projektbrief
                  </a>
                  <Link
                    href="/projektboende"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/15"
                  >
                    Läs om projektboende
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-white/20 bg-white/12 p-5 backdrop-blur-md">
                <h2 className="text-xl font-semibold">Passar särskilt när</h2>
                <ul className="mt-4 space-y-3 text-sm text-white/78">
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                    Ni behöver boende för 10-100 personer, ofta i flera projektfaser.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                    Projektorten har begränsat hotell- eller lägenhetshotellsutbud.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                    Ni vill samla bostäder, kontaktvägar och fakturering i ett flöde.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                    Bemanning, rotation och parkeringsbehov kan ändras under projektet.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-nordic-100 bg-nordic-50 py-12">
          <div className="container mx-auto grid gap-4 px-6 md:grid-cols-4 md:px-12">
            {[
              ['Bäst för', COMPANY_FACTS.bestFit],
              ['Geografi', COMPANY_FACTS.coverage],
              ['Svar bygger på', 'Projektbrief, tillgänglighet, sökradie, boendekrav och avtalsmodell.'],
              ['Fakta uppdaterad', COMPANY_FACTS.factsUpdated],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-nordic-100 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-nordic-500">{label}</p>
                <p className="mt-3 text-sm leading-relaxed text-nordic-800">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                  När rätt lösning väljs
                </p>
                <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                  Boendeformen ska matcha projektets storlek, ort och risk
                </h2>
                <p className="mt-4 text-nordic-700">
                  Tabellen visar var StayOnSite normalt är starkast och var andra lösningar kan
                  vara mer relevanta. Den bygger på användningsfall, inte absoluta
                  konkurrentpåståenden.
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-nordic-100">
                <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
                  <thead className="bg-nordic-900 text-white">
                    <tr>
                      <th className="p-4 font-semibold">Behov</th>
                      <th className="p-4 font-semibold">StayOnSite</th>
                      <th className="p-4 font-semibold">Hotell</th>
                      <th className="p-4 font-semibold">Lägenhetshotell</th>
                      <th className="p-4 font-semibold">Direkt hyresvärd</th>
                      <th className="p-4 font-semibold">Modulboende</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitRows.map((row) => (
                      <tr key={row.need} className="border-t border-nordic-100 align-top">
                        <th className="p-4 font-semibold text-nordic-900">{row.need}</th>
                        <td className="p-4 text-nordic-800">{row.stayonsite}</td>
                        <td className="p-4 text-nordic-700">{row.hotel}</td>
                        <td className="p-4 text-nordic-700">{row.aparthotel}</td>
                        <td className="p-4 text-nordic-700">{row.landlord}</td>
                        <td className="p-4 text-nordic-700">{row.module}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-nordic-100 bg-nordic-50 py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Från behov till inflyttning
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                Ett projektflöde som går att upphandla
              </h2>
              <p className="mt-4 text-nordic-700">
                Sidan beskriver vad som behöver beslutas synligt innan offert: kapacitet,
                kvalitet, ansvar, avtal, fallback och fakturering.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-lg border border-nordic-100 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6300]/10 text-[#ff6300]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-bold text-nordic-500">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-nordic-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-nordic-700">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Bevis och risk
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900">
                Det köparen behöver kontrollera före beslut
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:col-span-2">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Kvalitetskontroll',
                  text: 'Boenden bör kontrolleras mot bäddar, standard, brandskydd, försäkring, inventarier och praktisk restid till arbetsplats.',
                },
                {
                  icon: Building2,
                  title: 'Ansvarsfördelning',
                  text: 'Offert och avtal ska visa ansvar mellan StayOnSite, bostadsägare och kund för skador, felanmälan, nycklar och avslut.',
                },
                {
                  icon: Truck,
                  title: 'Parkering och arbetsfordon',
                  text: 'Servicebilar, släp, laddning, material och skiftgång påverkar vilka bostäder som faktiskt fungerar.',
                },
                {
                  icon: CircleHelp,
                  title: 'Fallback',
                  text: 'Om ett boende faller bort eller bemanningen ändras behövs sökradie, ersättningsboende och prioriteringsordning redan i planen.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-nordic-100 bg-white p-6 shadow-sm">
                    <Icon className="h-6 w-6 text-[#ff6300]" />
                    <h3 className="mt-4 text-xl font-semibold text-nordic-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-nordic-700">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="projektbrief" className="border-y border-nordic-100 bg-nordic-50 py-16 md:py-20">
          <div className="container mx-auto grid gap-10 px-6 md:px-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                Primär CTA
              </p>
              <h2 className="mt-3 text-3xl font-bold text-nordic-900 md:text-4xl">
                Skicka projektbrief
              </h2>
              <p className="mt-4 text-nordic-700">
                Ju tydligare briefen är, desto enklare blir det att jämföra boenden,
                räkna totalpris och se risker innan projektet låser budget eller startdatum.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-nordic-700">
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                  Samlar projektort, personer, datum, pendling, parkering och boendekrav.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                  Gör prisjämförelsen möjlig per person, boende och restid.
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6300]" />
                  Skickas som strukturerad förfrågan till StayOnSites befintliga leadflöde.
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-nordic-100 bg-white p-5 shadow-sm md:p-7">
              <ProjectBriefForm source="for-foretag-project-brief" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#ff6300]">
                  Frågor som ska besvaras i offert
                </p>
                <h2 className="mt-3 text-3xl font-bold text-nordic-900">
                  Pris, avtal och risk utan dolda antaganden
                </h2>
                <p className="mt-4 text-nordic-700">
                  StayOnSite ska vara tydligt när modellen passar och när andra lösningar
                  kan vara bättre. Exakta pris-, avtal- och kapacitetslöften ska alltid
                  kopplas till aktuell offert.
                </p>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <details key={item.q} className="rounded-lg border border-nordic-100 bg-white p-5">
                    <summary className="cursor-pointer text-lg font-semibold text-nordic-900">
                      {item.q}
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-nordic-700">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-nordic-100 bg-nordic-900 py-14 text-white">
          <div className="container mx-auto grid gap-8 px-6 md:px-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold">Nästa steg: gör behovet jämförbart</h2>
              <p className="mt-3 max-w-2xl text-white/70">
                För projektplanering, faser, sökradier och riskplan finns en separat sida
                om projektboende som länkar tillbaka till samma brief.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/projektboende"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-nordic-900 transition hover:bg-white/90"
              >
                Gå till projektboende
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#projektbrief"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#ff6300] px-6 font-semibold text-white transition hover:bg-[#e25200]"
              >
                Skicka projektbrief
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileStickyFormCTA targetId="projektbrief" primaryLabel="Skicka projektbrief" phoneLabel="Ring oss" />
      <FloatingPhoneButton className="bottom-24 md:bottom-6" />
    </div>
  );
}
