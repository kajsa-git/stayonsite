'use client'

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { isValidPhoneNumber } from '@/lib/contact';
import { trackFormSubmit } from '@/lib/gtag';
import {
  getContactFormErrorMessage,
  submitContactForm,
} from '@/lib/contact-form';
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
import { cities } from '@/data/cities';

type Lang = 'sv' | 'en' | 'pl';

const ForForetagHero = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phone = String(formData.get('phone') ?? '');

    setPhoneError('');

    if (!isValidPhoneNumber(phone)) {
      setPhoneError(
        t(
          'Ange ett giltigt telefonnummer',
          'Enter a valid phone number',
          'Podaj prawidłowy numer telefonu'
        )
      );
      const phoneInput = e.currentTarget.elements.namedItem('phone');
      if (phoneInput instanceof HTMLInputElement) phoneInput.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm({
        formType: 'hero-intent',
        locale: language as Lang,
        page: window.location.pathname,
        source: 'foretag-conversion',
        fields: {
          city: String(formData.get('city') ?? '').trim(),
          people: String(formData.get('people') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: phone.trim(),
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({
        title: t('Tack!', 'Thank you!', 'Dziękujemy!'),
        description: t(
          'Vi återkommer inom 24 timmar med en offert.',
          "We'll get back to you within 24 hours with a quote.",
          'Skontaktujemy się w ciągu 24 godzin z ofertą.'
        ),
      });

      setTimeout(() => {
        setFormSuccess(false);
        if (formRef.current) formRef.current.reset();
      }, 8000);
    } catch (error) {
      toast({
        title: t('Fel', 'Error', 'Błąd'),
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          language as Lang
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
    'text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1';

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
          src="/images/hero-foretag.webp"
          alt={t('Möblerat personalboende för företag i Sverige - StayOnSite', 'Furnished worker accommodation for companies in Sweden - StayOnSite', 'Umeblowane zakwaterowanie pracownicze dla firm w Szwecji - StayOnSite')}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" />

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14 max-w-6xl mx-auto">
          {/* Left: copy + trust bar (desktop) */}
          <div className="flex-1 mb-3 lg:mb-0">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-white drop-shadow-2xl mb-2 md:mb-6">
              {t('Boka personalboende', 'Book worker accommodation', 'Zarezerwuj zakwaterowanie')}
            </h1>

            <p className="max-w-xl text-sm md:text-xl text-white/70 font-light leading-relaxed mb-2 md:mb-10">
              {t(
                'Möblerat och inflyttningsklart. En kontakt, en faktura. Vi ordnar boende i hela Sverige.',
                'Furnished and move-in ready. One contact, one invoice. We arrange accommodation across Sweden.',
                'Umeblowane i gotowe. Jeden kontakt, jedna faktura. Organizujemy zakwaterowanie w całej Szwecji.'
              )}
            </p>

            {/* Trust bar — desktop only */}
            <div className="hidden lg:flex items-center gap-8">
              <TrustStat value="500+" label={t('Boenden sedan 2016', 'Accommodations since 2016', 'Zakwaterowań od 2016')} accent />
              <div className="w-px h-10 bg-white/15" />
              <TrustStat value="5.0" label="Google Reviews" star />
              <div className="w-px h-10 bg-white/15" />
              <TrustStat value="24h" label={t('Svarstid', 'Response time', 'Czas odpowiedzi')} />
            </div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[440px] lg:flex-shrink-0"
          >
            <div className="bg-white/[0.15] backdrop-blur-xl border border-white/25 rounded-[20px] p-5 md:p-8 shadow-2xl">
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {t('Tack!', 'Thank you!', 'Dziękujemy!')}
                  </h3>
                  <p className="text-white/70">
                    {t(
                      'Vi återkommer inom 24 timmar med en offert.',
                      "We'll get back to you within 24 hours with a quote.",
                      'Skontaktujemy się w ciągu 24 godzin z ofertą.'
                    )}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    {t('Få en offert', 'Get a quote', 'Otrzymaj ofertę')}
                  </h2>
                  <p className="text-sm text-white/50 mb-4">
                    {t('Vi återkommer inom 24 timmar', "We'll get back to you within 24 hours", 'Skontaktujemy się w ciągu 24 godzin')}
                  </p>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    {/* City + People side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="ff-city" className={labelClass}>
                          {t('Ort', 'City', 'Miejscowość')}
                        </Label>
                        <Input
                          id="ff-city"
                          name="city"
                          type="text"
                          required
                          className={inputClass}
                          placeholder={t('t.ex. Luleå', 'e.g. Luleå', 'np. Luleå')}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ff-people" className={labelClass}>
                          {t('Antal personer', 'People', 'Osoby')}
                        </Label>
                        <Input
                          id="ff-people"
                          name="people"
                          type="number"
                          required
                          min={1}
                          inputMode="numeric"
                          className={inputClass}
                          placeholder={t('t.ex. 10', 'e.g. 10', 'np. 10')}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="ff-email" className={labelClass}>
                        {t('E-post', 'Email', 'E-mail')}
                      </Label>
                      <Input
                        id="ff-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        className={inputClass}
                        placeholder={t('namn@foretag.se', 'name@company.com', 'nazwa@firma.pl')}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="ff-phone" className={labelClass}>
                        {t('Telefon', 'Phone', 'Telefon')}
                      </Label>
                      <Input
                        id="ff-phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        aria-invalid={Boolean(phoneError)}
                        aria-describedby={phoneError ? 'ff-phone-error' : undefined}
                        onChange={() => phoneError && setPhoneError('')}
                        className={`${inputClass} ${phoneError ? 'ring-2 ring-red-400' : ''}`}
                        placeholder="070-123 45 67"
                      />
                      {phoneError && (
                        <p id="ff-phone-error" className="text-xs text-red-400">
                          {phoneError}
                        </p>
                      )}
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
                          <span>{t('Skickar...', 'Sending...', 'Wysyłanie...')}</span>
                        </div>
                      ) : (
                        <>
                          <span>{t('Få offert', 'Get quote', 'Otrzymaj ofertę')}</span>
                          <Send size={18} />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>

          {/* Trust bar — mobile only */}
          <div className="flex lg:hidden items-center justify-center gap-6 mt-6">
            <TrustStat value="500+" label={t('Boenden', 'Stays', 'Noclegów')} accent />
            <div className="w-px h-8 bg-white/15" />
            <TrustStat value="5.0" label="Google" star />
            <div className="w-px h-8 bg-white/15" />
            <TrustStat value="24h" label={t('Svar', 'Reply', 'Odp.')} />
          </div>
        </div>

        {/* FAQ — below fold */}
        {(() => {
          const faqItems = [
            {
              q: t('Vad kostar personalboende?', 'What does worker accommodation cost?', 'Ile kosztuje zakwaterowanie?'),
              a: t(
                'Från 6 900 kr per person och månad. Priset beror på stad, antal personer och standard - men alltid betydligt billigare än hotell. Ni får en detaljerad offert anpassad efter era behov.',
                'From SEK 6,900 per person per month. Price depends on city, number of people and standard - but always significantly cheaper than hotels. You receive a detailed quote tailored to your needs.',
                'Od 6 900 SEK za osobę miesięcznie. Cena zależy od miasta, liczby osób i standardu - ale zawsze znacznie taniej niż hotel.'
              ),
            },
            {
              q: t('Hur snabbt kan ni ordna boende?', 'How quickly can you arrange accommodation?', 'Jak szybko mogą Państwo zorganizować zakwaterowanie?'),
              a: t(
                'Vi skickar en boendeplan inom 24 timmar. Vid akuta behov kan vi ofta ordna inflyttning samma vecka.',
                'We send a housing plan within 24 hours. For urgent needs, we can often arrange move-in the same week.',
                'Wysyłamy plan zakwaterowania w ciągu 24 godzin. W nagłych przypadkach - wprowadzenie w tym samym tygodniu.'
              ),
            },
            {
              q: t('Är boendet möblerat?', 'Is the accommodation furnished?', 'Czy zakwaterowanie jest umeblowane?'),
              a: t(
                'Ja, alla boenden är fullt möblerade med sängar, kök, tvättutrustning och internet. Era medarbetare kan flytta in direkt.',
                'Yes, all accommodations are fully furnished with beds, kitchen, laundry facilities and internet. Your employees can move in directly.',
                'Tak, wszystkie zakwaterowania są w pełni umeblowane. Pracownicy mogą się wprowadzić od razu.'
              ),
            },
          ];

          return (
            <div className="mt-12 md:mt-16 max-w-2xl mx-auto lg:mx-0">
              <h2 className="text-lg font-bold text-white/80 mb-4">
                {t('Vanliga frågor', 'Common questions', 'Najczęstsze pytania')}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 overflow-hidden"
                  >
                    <AccordionTrigger className="text-sm font-medium text-white/90 hover:text-white py-3 no-underline hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-white/60 pb-3">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })()}

        {/* City links — SEO internal linking */}
        <div className="mt-10 md:mt-14 max-w-4xl mx-auto lg:mx-0">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">
            {t('Personalboende i hela Sverige', 'Worker accommodation across Sweden', 'Zakwaterowanie w całej Szwecji')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cities.slice(0, 16).map((city) => (
              <Link
                key={city.slug}
                href={`/stad/${city.slug}`}
                className="text-xs text-white/40 hover:text-accent transition-colors"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function TrustStat({
  value,
  label,
  accent,
  star,
}: {
  value: string;
  label: string;
  accent?: boolean;
  star?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`font-display text-xl md:text-2xl lg:text-3xl font-bold ${accent ? 'text-accent' : 'text-white'} flex items-center justify-center gap-1`}>
        {star && <Star size={16} className="text-yellow-400 fill-yellow-400" />}
        {value}
      </div>
      <div className="text-[10px] md:text-xs text-white/40 font-medium">{label}</div>
    </div>
  );
}

export default ForForetagHero;
