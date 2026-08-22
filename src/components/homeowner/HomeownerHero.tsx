'use client'

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useUtmCapture } from '@/hooks/use-utm-capture';
import { motion } from 'framer-motion';
import { isValidPhoneNumber } from '@/lib/contact';
import { trackFormSubmit } from '@/lib/gtag';
import {
  getContactFormErrorMessage,
  submitContactForm,
} from '@/lib/contact-form';
import { AgreementGate } from '@/components/erbjudande/AgreementGate';
import { agreementFor } from '@/lib/crm/avtal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Send, Star } from 'lucide-react';

// Läs-/verifiera-länk för spekulanter. Skriv-länken (g.page/r/.../review) hör hemma i uppföljning efter uthyrning.
const GOOGLE_REVIEW_URL = 'https://www.google.com/search?q=Stayonsite+AB';

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
import { cities } from '@/data/cities';
import { RATING_VALUE } from '@/data/constants';
import type { TranslationKey } from '@/data/translations';

interface HomeownerHeroProps {
  cityName?: string;
  heroImage?: string;
  subtitle?: { sv: string; en: string; pl: string };
  extraFaqItems?: Array<{ q: string; a: string }>;
  hideFaq?: boolean;
}

const HomeownerHero = ({ cityName, heroImage, subtitle, extraFaqItems, hideFaq }: HomeownerHeroProps = {}) => {
  const { t, language } = useLanguage();

  const tr = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const baseFaqItems = [
    {
      q: tr('Kostar det något?', 'Does it cost anything?', 'Czy to coś kosztuje?'),
      a: tr(
        'Nej. Du betalar ingenting till oss. Vi hyr din bostad till ett fast belopp varje månad - utan avdrag. Vi tjänar på prisskillnaden gentemot företagskunden.',
        'No. You pay nothing to us. We rent your property at a fixed amount every month - no deductions. We earn from the price difference with the corporate client.',
        'Nie. Nie płacisz nam nic. Wynajmujemy Twoją nieruchomość za stałą kwotę co miesiąc - bez potrąceń.'
      ),
    },
    {
      q: tr('Vilka bor i mitt hus?', 'Who lives in my house?', 'Kto mieszka w moim domu?'),
      a: tr(
        'Professionella företagshyresgäster - montörer, ingenjörer och projektteam som arbetar tillfälligt i området. Aldrig privatpersoner.',
        'Professional corporate tenants - installers, engineers and project teams working temporarily in the area. Never private individuals.',
        'Profesjonalni najemcy firmowi - monterzy, inżynierowie i zespoły projektowe.'
      ),
    },
    {
      q: tr('Hur lång är avtalstiden?', 'How long is the contract?', 'Jak długi jest kontrakt?'),
      a: tr(
        'Det bestämmer vi tillsammans. Avtalstiden anpassas efter hyresgästens projekt och dina önskemål som hyresvärd – alltid i öppen dialog tills alla parter är nöjda.',
        'We decide that together. Contract length is tailored to the tenant\'s project and your preferences as a property owner – always in open dialogue until everyone is satisfied.',
        'Ustalamy to wspólnie. Czas trwania umowy dostosowujemy do projektu najemcy i Twoich oczekiwań jako właściciela – zawsze w otwartym dialogu.'
      ),
    },
    {
      q: tr(
        'Kan hyresgästen sitta kvar mot min vilja?',
        'Can the tenant stay against my wishes?',
        'Czy najemca może zostać bez mojej zgody?'
      ),
      a: tr(
        'Nej. Vid uthyrning av ett hus har hyresgästen inget besittningsskydd. Du kan säga upp avtalet med 3 månaders varsel utan att ange skäl – och utan domstolsförfarande. Vi använder alltid tidsbegränsade avtal kopplade till projektets längd, så avslutsdatumet är tydligt från dag ett.',
        'No. When renting out a house, the tenant has no security of tenure. You can terminate the contract with 3 months notice without giving reasons – no court proceedings needed. We always use fixed-term contracts tied to the project duration.',
        'Nie. Przy wynajmie domu najemca nie ma prawa do ochrony posiadania. Zawsze używamy umów terminowych powiązanych z czasem trwania projektu.'
      ),
    },
    {
      q: tr(
        'Vad händer med min villaförsäkring?',
        'What happens to my home insurance?',
        'Co z moim ubezpieczeniem domu?'
      ),
      a: tr(
        'Standardförsäkringen täcker normalt inte skador orsakade av hyresgäster. Du bör teckna ett uthyringstillägg hos ditt försäkringsbolag – kostar typiskt 500–1 000 kr/år och täcker skadegörelse upp till 200 000 kr. Vi kräver dessutom att det företag som hyr tecknar ansvarsförsäkring för sina anställda.',
        'Standard home insurance typically does not cover damage caused by tenants. You should add a rental supplement with your insurer – typically SEK 500–1,000/year. We also require the renting company to have liability insurance for their employees.',
        'Standardowe ubezpieczenie zazwyczaj nie pokrywa szkód wyrządzonych przez najemców. Zalecamy wykupienie rozszerzenia najmu. Wymagamy również od wynajmującej firmy posiadania ubezpieczenia OC.'
      ),
    },
    {
      q: tr(
        'Vad betalar jag i skatt på hyresintäkten?',
        'How much tax do I pay on rental income?',
        'Ile podatku płacę od dochodu z wynajmu?'
      ),
      a: tr(
        'Du betalar 30% kapitalskatt på överskottet. Avdragen är generösa: schablonavdrag 50 000 kr/år (från 1 juli 2026) plus 20% av hyresintäkten. Exempel: 15 000 kr/mån i hyra (180 000 kr/år) → avdrag 86 000 kr → skatt ca 28 200 kr → netto i fickan ca 152 000 kr/år. Vi kan hjälpa dig räkna på just din bostad.',
        'You pay 30% capital gains tax on the surplus. Deductions are generous: standard deduction SEK 50,000/year (from 1 July 2026) plus 20% of rental income. Example: SEK 15,000/month → approx. SEK 28,200 in tax → approx. SEK 152,000 net per year.',
        'Płacisz 30% podatku od zysku. Odliczenia są hojne: ryczałtowe 50 000 SEK/rok plus 20% dochodu z najmu. Możemy pomóc Ci obliczyć konkretną kwotę dla Twojej nieruchomości.'
      ),
    },
    {
      q: tr(
        'Sliter inte montörer mer på huset?',
        'Do workers cause more wear and tear?',
        'Czy pracownicy bardziej niszczą dom?'
      ),
      a: tr(
        'Tvärtom – veckopendlare sliter i regel mindre på en bostad än permanent boende. De är på jobbet 10 timmar om dagen och hemma bara på nätterna, utan barn, husdjur eller storhelger hemma. Vi tar alltid in- och utflyttbesiktning med foton som skydd för dig.',
        'Quite the opposite – weekly commuters generally cause less wear than permanent residents. They are at work 10 hours a day and only home at night, without children, pets or parties. We always conduct move-in and move-out inspections with photos.',
        'Wręcz przeciwnie – pracownicy tygodniowi zwykle mniej niszczą mieszkanie niż stali lokatorzy. Są w pracy 10 godzin dziennie. Zawsze przeprowadzamy protokoły zdawczo-odbiorcze ze zdjęciami.'
      ),
    },
    {
      q: tr(
        'Behöver jag tillstånd för att hyra ut?',
        'Do I need a permit to rent out?',
        'Czy potrzebuję zezwolenia na wynajem?'
      ),
      a: tr(
        'Nej. Inget kommunalt, statligt eller annat tillstånd krävs för att hyra ut ett hus (villa/enfamiljshus) till ett företag. Har du en bostadsrätt krävs styrelsens godkännande – vi hjälper dig med den processen.',
        'No. No municipal, government or other permit is required to rent out a house to a company. If you have a tenant-owned apartment (bostadsrätt), board approval is required.',
        'Nie. Nie jest wymagane żadne zezwolenie na wynajem domu firmie. W przypadku spółdzielczego mieszkania własnościowego wymagana jest zgoda zarządu.'
      ),
    },
    {
      q: tr(
        'Hur sätts hyran?',
        'How is the rent set?',
        'Jak ustalana jest czynsz?'
      ),
      a: tr(
        'Hyran ska vara skälig. En bra tumregel: 4% av fastighetens marknadsvärde per år, delat på 12, plus löpande driftkostnader. Möblerat ger vanligtvis 10–30% påslag. Från 1 juli 2026 gäller fri hyressättning som utgångspunkt. Vi hjälper dig sätta rätt nivå baserat på faktisk efterfrågan i ditt område – utan att du behöver gissa.',
        'The rent should be reasonable. A good rule of thumb: 4% of the property market value per year, divided by 12, plus running costs. Furnished adds 10–30%. From 1 July 2026, free rent-setting applies as the starting point. We help you set the right level based on actual demand in your area.',
        'Czynsz powinien być rozsądny. Dobra zasada: 4% wartości rynkowej nieruchomości rocznie, podzielone przez 12, plus koszty eksploatacji. Pomagamy ustalić właściwą stawkę na podstawie rzeczywistego popytu w Twoim regionie.'
      ),
    },
  ];

  const faqItems = extraFaqItems ? [...baseFaqItems, ...extraFaqItems] : baseFaqItems;

  const utmParams = useUtmCapture();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  // Del 2 (uthyrningsuppdraget) — visas inline i panelen efter inskicket för
  // privatpersoner. null-outcome = gaten visas just nu.
  const [agreement, setAgreement] = useState<{ token: string; alreadySigned: boolean } | null>(null);
  const [agreementOutcome, setAgreementOutcome] = useState<'signed' | 'skipped' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = String(formData.get('phone') ?? '');

    setPhoneError('');

    if (!isValidPhoneNumber(phone)) {
      setPhoneError(t('homeowner.form.phoneError'));
      const phoneInput = e.currentTarget.elements.namedItem('phone');
      if (phoneInput instanceof HTMLInputElement) {
        phoneInput.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm({
        formType: 'homeowner',
        locale: language,
        page: window.location.pathname,
        source: cityName ? `homeowner-city-${cityName}` : 'homeowner-conversion',
        utmParams,
        fields: {
          name: String(formData.get('name') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: phone.trim(),
          bedrooms: String(formData.get('bedrooms') ?? '').trim(),
          postalCode: String(formData.get('postalCode') ?? '').trim(),
          ...(cityName ? { city: cityName } : {}),
        },
      });
      setFormSuccess(true);
      trackFormSubmit({ email: String(formData.get('email') ?? ''), phone });

      if (result.agreement && !result.agreement.alreadySigned) {
        // Del 2: uthyrningsuppdraget tar över panelen — ingen auto-reset som
        // rycker undan avtalet medan det läses.
        setAgreement(result.agreement);
      } else {
        toast({
          title: t('homeowner.conversion.successTitle' as TranslationKey),
          description: t('homeowner.conversion.successText' as TranslationKey),
        });
        setTimeout(() => {
          setFormSuccess(false);
          if (formRef.current) formRef.current.reset();
        }, 8000);
      }
    } catch (error) {
      toast({
        title: t('homeowner.form.error') || 'Error',
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          language
        ),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'h-12 px-4 rounded-xl bg-white/90 border-0 text-primary text-sm font-medium placeholder:text-primary/40 focus-visible:ring-accent';

  const labelClass =
    'text-[10px] font-bold uppercase tracking-widest text-white/75 ml-1';

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden pt-16 pb-8 md:pt-28 md:pb-16 bg-primary">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={heroImage || '/images/hero-husagare.webp'}
          alt={cityName
            ? tr(`Hyr ut bostad i ${cityName} till företag via StayOnSite`, `Rent out property in ${cityName} to companies via StayOnSite`, `Wynajmij nieruchomość w ${cityName} firmom przez StayOnSite`)
            : tr('Hyr ut din bostad till företagshyresgäster via StayOnSite', 'Rent out your property to corporate tenants via StayOnSite', 'Wynajmij nieruchomość najemcom firmowym przez StayOnSite')}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" />

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14 max-w-6xl mx-auto">
          {/* Left: copy + trust bar (desktop) / below form on mobile */}
          <div className="flex-1 order-2 lg:order-1 mt-6 lg:mt-0">
            {/* H1 — plain element, no motion wrapper (SSG/SEO) */}
            <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-2xl mb-2 md:mb-6">
              {cityName
                ? tr(
                    `Lista din bostad i ${cityName}`,
                    `List your property in ${cityName}`,
                    `Wystaw nieruchomość w ${cityName}`
                  )
                : (
                  <>
                    {tr('Lista din', 'List your', 'Wystaw swoją')}{' '}
                    <span className="text-[#ff6300]">
                      {tr('bostad.', 'property.', 'nieruchomość.')}
                    </span>
                  </>
                )}
            </h1>

            <p className="max-w-xl text-sm md:text-xl text-white/70 font-light leading-relaxed mb-2 md:mb-10">
              {subtitle
                ? tr(subtitle.sv, subtitle.en, subtitle.pl)
                : t('homeowner.conversion.subtitle' as TranslationKey)}
            </p>

            {/* Trust bar — desktop only (mobile version is below form) */}
            <div className="hidden lg:flex items-center gap-8">
              <TrustStat
                value={t('homeowner.conversion.trustFee' as TranslationKey)}
                label={t('homeowner.conversion.trustFeeLabel' as TranslationKey)}
                accent
              />
              <div className="w-px h-10 bg-white/15" />
              <TrustStat
                value={t('homeowner.conversion.trustGoogle' as TranslationKey)}
                label={t('homeowner.conversion.trustGoogleLabel' as TranslationKey)}
                google
              />
              <div className="w-px h-10 bg-white/15" />
              <TrustStat
                value={t('homeowner.conversion.trustResponse' as TranslationKey)}
                label={t('homeowner.conversion.trustResponseLabel' as TranslationKey)}
              />
            </div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[440px] lg:flex-shrink-0 order-1 lg:order-2"
          >
            <div className="bg-black/35 backdrop-blur-xl border border-white/20 rounded-[20px] p-5 md:p-8 shadow-2xl">
              {formSuccess && agreement && !agreement.alreadySigned && agreementOutcome === null ? (
                (() => {
                  // Del 2: samma avtalstext och signeringsendpoint som /uthyrare/<token>.
                  // Avtal finns bara på sv/en — pl får engelska (Kajsas beslut 2026-07-13).
                  const { text: agreementText, language: agreementLang } = agreementFor('uthyrningsuppdrag', language);
                  return (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 rounded-xl border border-green-400/30 bg-green-500/15 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm leading-relaxed text-white/90">
                          {tr(
                            'Tack! Din bostad är registrerad. Ett steg kvar: godkänn uthyrningsuppdraget nedan — kostnadsfritt, inte exklusivt och du förbinder dig inte att hyra ut något.',
                            'Thanks! Your property is registered. One step left: approve the letting assignment below — free of charge, non-exclusive and no obligation to let anything.',
                            'Dziękujemy! Twoja nieruchomość jest zarejestrowana. Został jeden krok: zatwierdź poniżej zlecenie wynajmu — bezpłatne i niewyłączne.'
                          )}
                        </p>
                      </div>
                      <AgreementGate
                        token={agreement.token}
                        title={agreementText.title}
                        intro={agreementText.intro}
                        points={agreementText.points}
                        version={agreementText.version}
                        submitLabel={agreementLang === 'sv' ? 'Godkänn uthyrningsuppdraget' : 'Approve the letting assignment'}
                        lang={agreementLang}
                        onAccepted={() => setAgreementOutcome('signed')}
                      />
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setAgreementOutcome('skipped')}
                          className="text-xs text-white/70 underline underline-offset-2 transition-colors hover:text-white"
                        >
                          {tr(
                            'Hoppa över just nu — jag godkänner senare',
                            'Skip for now — I will approve later',
                            'Pomiń na razie — zatwierdzę później'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : formSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {t('homeowner.conversion.successTitle' as TranslationKey)}
                  </h3>
                  <p className="text-white/70">
                    {t('homeowner.conversion.successText' as TranslationKey)}
                  </p>
                  {agreementOutcome === 'signed' && (
                    <p className="mt-4 rounded-xl border border-green-400/30 bg-green-500/15 px-4 py-3 text-sm text-green-200">
                      {tr(
                        'Uthyrningsuppdraget är godkänt — allt är klart från din sida.',
                        'The letting assignment is approved — all done on your side.',
                        'Zlecenie wynajmu zatwierdzone — wszystko gotowe.'
                      )}
                    </p>
                  )}
                  {agreementOutcome === 'skipped' && agreement && (
                    <p className="mt-4 text-sm text-white/75">
                      {tr(
                        'Du kan godkänna uthyrningsuppdraget när som helst via ',
                        'You can approve the letting assignment any time via ',
                        'Możesz zatwierdzić zlecenie wynajmu w dowolnym momencie przez '
                      )}
                      <a href={`/uthyrare/${agreement.token}`} className="font-semibold underline underline-offset-2">
                        {tr('din personliga länk', 'your personal link', 'swój osobisty link')}
                      </a>
                      {tr(
                        ' — vi skickar också en påminnelse via mejl.',
                        " — we'll also send a reminder by email.",
                        ' — wyślemy też przypomnienie e-mailem.'
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    {t('homeowner.conversion.formTitle' as TranslationKey)}
                  </h2>
                  <p className="text-sm text-white/75 mb-4">
                    {t('homeowner.conversion.formSubtitle' as TranslationKey)}
                  </p>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="ho-name" className={labelClass}>
                        {t('homeowner.conversion.name' as TranslationKey)}
                      </Label>
                      <Input
                        id="ho-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        className={inputClass}
                        placeholder={t('homeowner.conversion.namePlaceholder' as TranslationKey)}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="ho-email" className={labelClass}>
                        {t('homeowner.conversion.email' as TranslationKey)}
                      </Label>
                      <Input
                        id="ho-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        className={inputClass}
                        placeholder={t('homeowner.conversion.emailPlaceholder' as TranslationKey)}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="ho-phone" className={labelClass}>
                        {t('homeowner.form.phone')}
                      </Label>
                      <Input
                        id="ho-phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? 'ho-phone-error' : undefined}
                        onChange={() => phoneError && setPhoneError('')}
                        className={`${inputClass} ${phoneError ? 'ring-2 ring-red-400' : ''}`}
                        placeholder={t('homeowner.form.phonePlaceholder')}
                      />
                      {phoneError && (
                        <p id="ho-phone-error" className="text-xs text-red-400">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    {/* Bedrooms + Postal code side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="ho-bedrooms" className={labelClass}>
                          {t('homeowner.conversion.bedrooms' as TranslationKey)}
                        </Label>
                        <Input
                          id="ho-bedrooms"
                          name="bedrooms"
                          type="number"
                          required
                          min={1}
                          max={20}
                          inputMode="numeric"
                          className={inputClass}
                          placeholder={t('homeowner.conversion.bedroomsPlaceholder' as TranslationKey)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ho-postal" className={labelClass}>
                          {t('homeowner.conversion.postalCode' as TranslationKey)}
                        </Label>
                        <Input
                          id="ho-postal"
                          name="postalCode"
                          type="text"
                          required
                          autoComplete="postal-code"
                          className={inputClass}
                          placeholder={t('homeowner.conversion.postalCodePlaceholder' as TranslationKey)}
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-lg hover:shadow-accent/30 text-white font-bold h-13 md:h-14 text-base transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mt-2"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>{t('homeowner.form.submitting')}</span>
                        </div>
                      ) : (
                        <>
                          <span>{t('homeowner.conversion.cta' as TranslationKey)}</span>
                          <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 mt-3 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    <GoogleIcon />
                    <span>5.0 på Google</span>
                    <span className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </span>
                  </a>
                </form>
                </>
              )}
            </div>
          </motion.div>

          {/* Trust bar — mobile only (below form) */}
          <div className="flex lg:hidden items-center justify-center gap-6 mt-6">
            <TrustStat
              value={t('homeowner.conversion.trustFee' as TranslationKey)}
              label={t('homeowner.conversion.trustFeeLabel' as TranslationKey)}
              accent
            />
            <div className="w-px h-8 bg-white/15" />
            <TrustStat
              value={t('homeowner.conversion.trustGoogle' as TranslationKey)}
              label={t('homeowner.conversion.trustGoogleLabel' as TranslationKey)}
              star
            />
            <div className="w-px h-8 bg-white/15" />
            <TrustStat
              value={t('homeowner.conversion.trustResponse' as TranslationKey)}
              label={t('homeowner.conversion.trustResponseLabel' as TranslationKey)}
            />
          </div>
        </div>

        {/* FAQ — below fold */}
        {!hideFaq && <div className="mt-12 md:mt-16 max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-lg font-bold text-white/80 mb-4">
            {tr('Vanliga frågor', 'Common questions', 'Najczęstsze pytania')}
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-black/40 border border-white/15 rounded-xl px-4 overflow-hidden"
              >
                <AccordionTrigger className="text-sm font-medium text-white/90 hover:text-white py-3 no-underline hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/90 pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>}

        {/* City links — SEO internal linking (only on main page) */}
        {!cityName && (
          <div className="mt-10 md:mt-14 max-w-4xl mx-auto lg:mx-0">
            <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">
              {tr('Hyr ut i din stad', 'Rent out in your city', 'Wynajmij w swoim mieście')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 16).map((city) => (
                <Link
                  key={city.slug}
                  href={`/for-husagare/${city.slug}`}
                  className="text-xs text-white/40 hover:text-accent transition-colors"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

function TrustStat({
  value,
  label,
  accent,
  star,
  google,
}: {
  value: string;
  label: string;
  accent?: boolean;
  star?: boolean;
  google?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`font-heading text-xl md:text-2xl lg:text-3xl font-bold ${accent ? 'text-accent' : 'text-white'} flex items-center justify-center gap-1.5`}>
        {star && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
        {value}
      </div>
      {google ? (
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <GoogleIcon />
          <span className="text-[10px] md:text-xs text-white/40 font-medium">{label}</span>
        </div>
      ) : (
        <div className="text-[10px] md:text-xs text-white/40 font-medium">{label}</div>
      )}
    </div>
  );
}

export default HomeownerHero;
