'use client'

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isValidContact } from '@/lib/contact';
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
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactError('');

    const formData = new FormData(e.currentTarget);
    const cityValue = String(formData.get('ort') ?? city).trim();
    const peopleValue = String(formData.get('antal_personer') ?? people).trim();
    const contactValue = String(formData.get('kontakt') ?? contact).trim();

    if (!isValidContact(contactValue)) {
      setContactError(t('heroForm.contactError'));
      const contactInput = e.currentTarget.elements.namedItem('kontakt');
      if (contactInput instanceof HTMLInputElement) {
        contactInput.focus();
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
          kontakt: contactValue,
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({ title: t('heroForm.success') });
      setTimeout(() => {
        setFormSuccess(false);
        setCity(defaultCity);
        setPeople('');
        setContact('');
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
      <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-green-400" />
        </div>
        <p className="text-white font-semibold text-lg">{t('heroForm.success')}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-5">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row md:items-end gap-3"
      >
        {/* Ort */}
        <div className="flex-1">
          <label htmlFor="hero-city" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
            {t('heroForm.city')}
          </label>
          <Input
            id="hero-city"
            name="ort"
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('heroForm.cityPlaceholder')}
            className="h-12 bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium"
          />
        </div>

        {/* Antal */}
        <div className="flex-1 md:max-w-[140px]">
          <label htmlFor="hero-people" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
            {t('heroForm.people')}
          </label>
          <Input
            id="hero-people"
            name="antal_personer"
            type="number"
            required
            min={1}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            placeholder={t('heroForm.peoplePlaceholder')}
            className="h-12 bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium"
          />
        </div>

        {/* Kontakt */}
        <div className="flex-1">
          <label htmlFor="hero-contact" className="block text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1.5 ml-1">
            {t('heroForm.contact')}
          </label>
          <Input
            id="hero-contact"
            name="kontakt"
            type="text"
            required
            aria-invalid={Boolean(contactError)}
            aria-describedby={contactError ? 'hero-contact-error' : undefined}
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (contactError) setContactError('');
            }}
            placeholder={t('heroForm.contactPlaceholder')}
            className={`h-12 bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium ${contactError ? 'ring-2 ring-red-400' : ''}`}
          />
          {contactError && (
            <p id="hero-contact-error" className="text-red-300 text-xs mt-1 ml-1">
              {contactError}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
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
