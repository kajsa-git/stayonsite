import Image from 'next/image';
import { PropertyIntakeForm } from '@/components/homeowner/PropertyIntakeForm';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Home,
  House,
  KeyRound,
  Phone,
  Quote,
  ShieldCheck,
} from 'lucide-react';

const proofPoints = [
  { value: 'Företag som hyresgäster', label: 'inte privatpersoner', icon: Building2 },
  { value: 'Aktiv matchning', label: 'mot aktuella bostadsbehov', icon: KeyRound },
  { value: 'Personlig kontakt', label: 'från registrering till uthyrning', icon: ShieldCheck },
  { value: 'Du bestämmer', label: 'hyra, period och tillgänglighet', icon: BadgeCheck },
];

const propertyTypes = [
  {
    title: 'Villa',
    description: 'Möblerade hus med plats för en eller flera företagsmedarbetare.',
    icon: House,
  },
  {
    title: 'Radhus',
    description: 'Praktiska boenden med kök, sovrum och gärna parkering.',
    icon: Home,
  },
  {
    title: 'Ägarlägenhet',
    description: 'Lägenheter där du själv bestämmer över uthyrningen.',
    icon: Building2,
  },
  {
    title: 'Uthyrningsdel',
    description: 'En separat, möblerad del med egen ingång och egna funktioner.',
    icon: KeyRound,
  },
];

const testimonials = [
  {
    quote: 'Vi hyrde ut vårt radhus till en ingenjör som jobbar på tunnelbaneutbyggnaden i Stockholm. Professionell, städad och aldrig några problem.',
    author: 'Anna E.',
    location: 'Älvsjö, Stockholm',
    result: 'Radhus · företagsuthyrning',
  },
  {
    quote: 'Kajsa skötte allt från besiktning till kontrakt på mindre än en vecka. Vi har inte behövt tänka på någonting.',
    author: 'Lars A.',
    location: 'Eriksberg, Göteborg',
    result: 'Boende för energiprojekt',
  },
  {
    quote: 'Företagshyresgäster är helt annorlunda. Personer som arbetar långa skift och vill ha lugn och ro när de kommer hem.',
    author: 'Maria J.',
    location: 'Limhamn, Malmö',
    result: 'Lägenhet · företagsuthyrning',
  },
];

const steps = [
  {
    number: '01',
    title: 'Registrera bostaden',
    description: 'Fyll i uppgifter om boendet, önskad hyra och tillgänglighet. Bilder är bra men kan kompletteras senare.',
  },
  {
    number: '02',
    title: 'Vi går igenom uppgifterna',
    description: 'Du får en personlig kontakt som bedömer bostaden och stämmer av villkoren med dig.',
  },
  {
    number: '03',
    title: 'Vi matchar mot företag',
    description: 'Bostaden presenteras när den passar ett konkret behov hos en företagskund.',
  },
  {
    number: '04',
    title: 'Avtal och betalning',
    description: 'Du godkänner alltid upplägget först. Hyra, period och betalningsvillkor framgår av avtalet.',
  },
];

const LpHusagare = () => {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-nordic-900">
      <header className="border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Image
            src="/stayonsite-logo.png"
            alt="StayOnSite"
            width={156}
            height={41}
            className="h-auto w-[132px] sm:w-[156px]"
            priority
          />
          <a
            href="tel:+46762498486"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-nordic-200 bg-white px-4 text-sm font-semibold text-nordic-900 transition-colors hover:border-[#ff6300] hover:text-[#d95400]"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">076-249 84 86</span>
            <span className="sm:hidden">Ring oss</span>
          </a>
        </div>
      </header>

      <main>
        <section className="overflow-hidden bg-[#f7f5f0] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#0f766e]/[0.07] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#0f766e]">
                <Building2 className="h-4 w-4" />
                Vi hittar företagshyresgäster
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-nordic-900 sm:text-5xl lg:text-6xl">
                Vi hjälper dig hitta företag som vill hyra din bostad
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-nordic-700 sm:text-xl">
                Registrera din bostad så matchar vi den mot företag som söker möblerade boenden för sina medarbetare.
              </p>

              <ul className="mt-7 grid gap-3 text-sm font-semibold text-nordic-900 sm:grid-cols-2">
                {[
                  'Vi söker och kvalificerar företaget',
                  'Du avgör om hyresgästen passar',
                  'Vi hjälper till med dialog och avtal',
                  'Du bestämmer hyra och tillgänglighet',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0f766e] text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#registrera-bostad"
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#ff6300] px-7 text-base font-bold text-white shadow-[0_14px_30px_-14px_rgba(255,99,0,0.9)] transition-all hover:bg-[#e85a00] hover:shadow-[0_18px_34px_-14px_rgba(255,99,0,0.95)]"
                >
                  Registrera din bostad
                  <ArrowRight className="h-5 w-5" />
                </a>
                <p className="text-sm leading-5 text-nordic-800">
                  Kostnadsfritt att registrera<br />och inte bindande
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-[#ff6300]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white p-2 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.35)]">
                <Image
                  src="/images/lp-husagare-villa-radhus.webp"
                  alt="Svensk villa och radhus som passar för uthyrning till företag"
                  width={1600}
                  height={900}
                  className="aspect-[4/3] w-full rounded-[1.6rem] object-cover lg:aspect-[1.15/1]"
                  priority
                />
                <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/40 bg-nordic-900/90 p-4 text-white shadow-xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:max-w-[285px]">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <BadgeCheck className="h-5 w-5 text-[#ff8a3d]" />
                    Företag söker boenden
                  </div>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    Bland annat i Värmland, Stockholm, Jönköping, Kiruna, Gävle, Linköping och Göteborg.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Resultat" className="border-y border-black/5 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
            {proofPoints.map((point) => (
              <div key={point.label} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f766e]/10 text-[#0f766e]">
                  <point.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-nordic-900 sm:text-xl">{point.value}</p>
                  <p className="text-xs leading-5 text-nordic-800 sm:text-sm">{point.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e]">Vilka boenden söker vi?</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-nordic-900 sm:text-4xl">
                Bostäder där människor kan bo bra under ett längre projekt
              </h2>
              <p className="mt-4 text-base leading-7 text-nordic-700 sm:text-lg">
                Vi söker framför allt hela, möblerade boenden med kök, sovplatser och en fungerande vardag för företagens medarbetare.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {propertyTypes.map((property) => (
                <article key={property.title} className="rounded-2xl border border-nordic-200 bg-[#fbfaf7] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#ff6300] shadow-sm">
                    <property.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-nordic-900">{property.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-nordic-700">{property.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <strong>Bostadsrätt?</strong> Registrera den gärna om du redan har föreningens godkännande eller annars har rätt att hyra ut bostaden.
              </p>
            </div>
          </div>
        </section>

        <section id="registrera-bostad" className="scroll-mt-4 border-y border-black/5 bg-[#efece5] px-0 py-14 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e]">Nästa steg</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-nordic-900 sm:text-4xl">
              Registrera bostaden
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-nordic-700">
              Fyll i det du vet nu. Du kan hoppa över osäkra uppgifter och skicka in utan bilder. Vi går igenom allt innan bostaden presenteras för ett företag.
            </p>
          </div>
          <PropertyIntakeForm headingLevel="h2" />
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e]">Tidigare uthyrningar</p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-nordic-900 sm:text-4xl">
                  Husägare som fått hjälp att hitta företagshyresgäster
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-2 text-sm font-bold text-[#0f766e]">
                <BadgeCheck className="h-5 w-5" />
                Tidigare uthyrningar
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.author} className="flex h-full flex-col rounded-2xl border border-nordic-200 bg-[#fbfaf7] p-6">
                  <Quote className="h-8 w-8 text-[#ff6300]/35" />
                  <blockquote className="mt-4 flex-1 text-base leading-7 text-nordic-800">
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-6 border-t border-nordic-200 pt-5">
                    <p className="font-bold text-nordic-900">{testimonial.author}</p>
                    <p className="mt-0.5 text-sm text-nordic-800">{testimonial.location}</p>
                    <p className="mt-3 inline-flex rounded-full bg-[#0f766e]/10 px-3 py-1.5 text-sm font-bold text-[#0f766e]">
                      {testimonial.result}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm leading-6 text-nordic-800">
              Omdömena kommer från tidigare uthyrningar. Vilka företag som kan matchas beror på bostadens ort, storlek, standard, tillgänglighet och aktuell efterfrågan.
            </p>
          </div>
        </section>

        <section className="bg-nordic-900 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#ff8a3d]">Så fungerar det</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Från registrerad bostad till företagsuthyrning
              </h2>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="border-t border-white/20 pt-5">
                  <span className="text-sm font-bold text-[#ff8a3d]">{step.number}</span>
                  <h3 className="mt-3 text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/65">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f7f5f0] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.16em] text-[#0f766e]">Vanliga frågor</p>
            <h2 className="mt-3 text-center font-display text-3xl font-bold tracking-tight text-nordic-900 sm:text-4xl">
              Innan du registrerar bostaden
            </h2>
            <div className="mt-9 divide-y divide-nordic-200 rounded-2xl border border-nordic-200 bg-white px-5 sm:px-7">
              {[
                ['Vem kommer att bo i bostaden?', 'StayOnSite arbetar med företag som behöver boende för sina medarbetare. Bostaden hyrs alltså inte ut till privatpersoner via vår tjänst.'],
                ['Kostar det något att registrera bostaden?', 'Nej. Registreringen är kostnadsfri och innebär inte att du måste tacka ja till en uthyrning.'],
                ['Hur bestäms hyran?', 'Du anger din önskade hyra. Därefter bedömer vi den tillsammans utifrån bostaden, orten, perioden och företagets aktuella behov.'],
                ['När får jag betalt?', 'Betalningsvillkoren står alltid i avtalet för den aktuella uthyrningen. Vid våra tidigare upplägg har månadshyran betalats i förskott enligt avtal.'],
              ].map(([question, answer]) => (
                <div key={question} className="py-5">
                  <h3 className="font-bold text-nordic-900">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-nordic-700">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#ff6300] px-4 py-12 text-white sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Har du en bostad som kan passa?</h2>
              <p className="mt-2 text-sm text-white/80 sm:text-base">Registrera den nu, så återkommer vi när den matchar ett företags behov.</p>
            </div>
            <a
              href="#registrera-bostad"
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-bold text-[#d95400] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Registrera bostaden
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <FloatingPhoneButton />
    </div>
  );
};

export default LpHusagare;
