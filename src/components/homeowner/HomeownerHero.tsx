'use client'

import { useState, useRef } from 'react';
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
import { Send, Star } from 'lucide-react';
import { RATING_VALUE } from '@/data/constants';
import type { TranslationKey } from '@/data/translations';

const HomeownerHero = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
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
      await submitContactForm({
        formType: 'homeowner',
        locale: language,
        page: window.location.pathname,
        source: 'homeowner-conversion',
        fields: {
          name: String(formData.get('name') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: phone.trim(),
          bedrooms: String(formData.get('bedrooms') ?? '').trim(),
          postalCode: String(formData.get('postalCode') ?? '').trim(),
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({
        title: t('homeowner.conversion.successTitle' as TranslationKey),
        description: t('homeowner.conversion.successText' as TranslationKey),
      });

      setTimeout(() => {
        setFormSuccess(false);
        if (formRef.current) formRef.current.reset();
      }, 8000);
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
    'text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1';

  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16 bg-primary">
      {/* Background image */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/hero-main.webp')` }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" />

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14 max-w-6xl mx-auto">
          {/* Left: copy + trust bar (desktop) */}
          <div className="flex-1 mb-8 lg:mb-0">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block rounded-full border border-accent/20 bg-accent/10 px-5 py-2 text-sm font-semibold text-accent mb-6"
            >
              {t('homeowner.conversion.badge' as TranslationKey)}
            </motion.span>

            {/* H1 — plain element, no motion wrapper (SSG/SEO) */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-[64px] lg:text-[72px] font-bold leading-[1.08] tracking-tight text-white drop-shadow-2xl mb-6">
              {t('homeowner.conversion.title' as TranslationKey)}
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-white/70 font-light leading-relaxed mb-10">
              {t('homeowner.conversion.subtitle' as TranslationKey)}
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
                star
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
            className="w-full lg:w-[440px] lg:flex-shrink-0"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[20px] p-6 md:p-8 shadow-2xl">
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    {t('homeowner.conversion.successTitle' as TranslationKey)}
                  </h3>
                  <p className="text-white/70">
                    {t('homeowner.conversion.successText' as TranslationKey)}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                    {t('homeowner.conversion.formTitle' as TranslationKey)}
                  </h2>
                  <p className="text-sm text-white/50 mb-6">
                    {t('homeowner.conversion.formSubtitle' as TranslationKey)}
                  </p>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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

export default HomeownerHero;
