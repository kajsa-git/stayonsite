import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Send, Loader2 } from 'lucide-react';

interface HeroIntentFormProps {
  defaultCity?: string;
}

function isValidContact(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return true;
  }
  const digits = trimmed.replace(/[\s\-()+ ]/g, '');
  return /^\d{6,15}$/.test(digits);
}

const HeroIntentForm = ({ defaultCity = '' }: HeroIntentFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [city, setCity] = useState(defaultCity);
  const [people, setPeople] = useState('');
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactError('');

    if (!isValidContact(contact)) {
      setContactError(t('heroForm.contactError'));
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('ort', city);
      formData.append('antal_personer', people);
      formData.append('kontakt', contact);
      formData.append('_subject', `Snabbförfrågan: ${city} – ${people} pers`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_next', window.location.origin);
      formData.append('_source', 'hero-intent-form');
      formData.append('_page', window.location.pathname);

      const response = await fetch('https://formsubmit.co/ajax/kajsa@stayonsite.se', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success === 'true' || result.success === true) {
        setFormSuccess(true);
        toast({ title: t('heroForm.success') });
        setTimeout(() => {
          setFormSuccess(false);
          setCity(defaultCity);
          setPeople('');
          setContact('');
        }, 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      toast({
        title: t('heroForm.contactError'),
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
        ref={formRef}
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
            type="text"
            required
            value={contact}
            onChange={(e) => {
              setContact(e.target.value);
              if (contactError) setContactError('');
            }}
            placeholder={t('heroForm.contactPlaceholder')}
            className={`h-12 bg-white/90 text-primary border-0 rounded-xl placeholder:text-primary/40 font-medium ${contactError ? 'ring-2 ring-red-400' : ''}`}
          />
          {contactError && (
            <p className="text-red-300 text-xs mt-1 ml-1">{contactError}</p>
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
