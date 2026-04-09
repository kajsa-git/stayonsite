'use client'

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidEmail, isValidPhoneNumber } from '@/lib/contact';
import { trackFormSubmit } from '@/lib/gtag';
import {
  getContactFormErrorMessage,
  submitContactForm,
} from '@/lib/contact-form';
import { CheckCircle2, Send, Loader2 } from 'lucide-react';

interface HeroIntentFormProps {
  defaultCity?: string;
}

const HeroIntentForm = ({ defaultCity = '' }: HeroIntentFormProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [city, setCity] = useState(defaultCity);
  const [people, setPeople] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError('');
    setPhoneError('');

    const formData = new FormData(e.currentTarget);
    const cityValue = String(formData.get('ort') ?? city).trim();
    const peopleValue = String(formData.get('antal_personer') ?? people).trim();
    const emailValue = String(formData.get('email') ?? email).trim();
    const phoneValue = String(formData.get('phone') ?? phone).trim();

    let hasError = false;
    if (!isValidEmail(emailValue)) {
      setEmailError(t('heroForm.emailError'));
      hasError = true;
    }
    if (!isValidPhoneNumber(phoneValue)) {
      setPhoneError(t('homeowner.form.phoneError'));
      hasError = true;
    }
    if (hasError) {
      const focusName = !isValidEmail(emailValue) ? 'email' : 'phone';
      const focusInput = e.currentTarget.elements.namedItem(focusName);
      if (focusInput instanceof HTMLInputElement) {
        focusInput.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm({
        formType: 'hero-intent',
        locale: language,
        page: window.location.pathname,
        source: 'hero-intent-form',
        fields: {
          ort: cityValue,
          antal_personer: peopleValue,
          email: emailValue,
          phone: phoneValue,
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({ title: t('heroForm.success') });
      setTimeout(() => {
        setFormSuccess(false);
        setCity(defaultCity);
        setPeople('');
        setEmail('');
        setPhone('');
      }, 5000);
    } catch (error) {
      toast({
        title:
          language === 'sv'
            ? 'Kunde inte skicka formuläret'
            : language === 'pl'
            ? 'Nie udało się wysłać formularza'
            : 'Could not send the form',
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

  if (formSuccess) {
    return (
      <div className="mt-6 lg:mt-0 w-full max-w-xl lg:max-w-none bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-green-400" />
        </div>
        <p className="text-white font-semibold text-lg">{t('heroForm.success')}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 lg:mt-0 w-full max-w-xl lg:max-w-none bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 md:gap-4">
          {/* Ort */}
          <div className="sm:col-span-8">
            <label htmlFor="hero-city" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
              {t('heroForm.city')}
            </label>
            <Input
              id="hero-city"
              name="ort"
              type="text"
              required
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t('heroForm.cityPlaceholder')}
              className="h-12 w-full bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium"
            />
          </div>

          {/* Antal */}
          <div className="sm:col-span-4">
            <label htmlFor="hero-people" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
              {t('heroForm.people')}
            </label>
            <Input
              id="hero-people"
              name="antal_personer"
              type="number"
              required
              min={1}
              inputMode="numeric"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              placeholder={t('heroForm.peoplePlaceholder')}
              className="h-12 w-full bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium"
            />
          </div>

          {/* E-post */}
          <div className="sm:col-span-8">
            <label htmlFor="hero-email" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
              {t('heroForm.email')}
            </label>
            <Input
              id="hero-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'hero-email-error' : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              placeholder={t('heroForm.emailPlaceholder')}
              className={`h-12 w-full bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium ${emailError ? 'ring-2 ring-red-400' : ''}`}
            />
            {emailError && (
              <p id="hero-email-error" className="text-red-300 text-xs mt-1 ml-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Telefon */}
          <div className="sm:col-span-4">
            <label htmlFor="hero-phone" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
              {t('heroForm.phone')}
            </label>
            <Input
              id="hero-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? 'hero-phone-error' : undefined}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (phoneError) setPhoneError('');
              }}
              placeholder={t('heroForm.phonePlaceholder')}
              className={`h-12 w-full bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium ${phoneError ? 'ring-2 ring-red-400' : ''}`}
            />
            {phoneError && (
              <p id="hero-phone-error" className="text-red-300 text-xs mt-1 ml-1">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/30 transition-all hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              {t('heroForm.submit')}
              <Send size={16} />
            </span>
          )}
        </Button>
      </form>
    </div>
  );
};

export default HeroIntentForm;
