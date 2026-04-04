'use client'

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { trackFbEvent } from '@/hooks/use-facebook-pixel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isValidPhoneNumber } from '@/lib/contact';
import { trackPhoneClick, trackFormSubmit } from '@/lib/gtag';
import {
  getContactFormErrorMessage,
  submitContactForm,
} from '@/lib/contact-form';
import { Send, Phone, CheckCircle2 } from 'lucide-react';

interface LpHeroFormProps {
  utmParams: Record<string, string>;
}

const LpHeroForm = ({ utmParams }: LpHeroFormProps) => {
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
        formType: 'lp-homeowner',
        locale: language,
        page: window.location.pathname,
        source: 'facebook-landing',
        fields: {
          phone: phone.trim(),
          city: String(formData.get('city') ?? '').trim(),
        },
        utmParams,
      });
      setFormSuccess(true);
      trackFormSubmit();
      trackFbEvent('Lead');
      toast({
        title: t('homeowner.form.success'),
        description: new Date().toLocaleTimeString(),
      });
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

  return (
    <section id="lp-form" className="bg-white px-4 pt-6 pb-10 md:px-8 md:pt-12 md:pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Copy side */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs mb-4">
              <span className="h-px w-6 bg-accent" />
              {t('homeowner.hero.pill')}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary leading-tight mb-4">
              {t('homeowner.hero.title')}
            </h1>
            <p className="text-base md:text-lg text-primary/70 font-light leading-relaxed mb-6">
              {t('homeowner.hero.subtitle')}
            </p>
            <p className="text-sm text-primary/50 font-medium">
              {t('homeowner.hero.trustBadge')}
            </p>
          </div>

          {/* Form side */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-accent to-accent/20 rounded-3xl blur-xl opacity-10" />
            <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-primary/5 p-6 md:p-8">
              {formSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-primary mb-2">
                    {language === 'sv' ? 'Tack!' : 'Thank you!'}
                  </h3>
                  <p className="text-primary/70">
                    {t('homeowner.form.success')}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-display font-bold text-primary mb-1">
                    {t('lp.husagare.formTitle')}
                  </h2>
                  <p className="text-sm text-primary/60 mb-6">
                    {t('lp.husagare.formSubtitle')}
                  </p>

                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="phone" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                          {t('homeowner.form.phone')}
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          inputMode="tel"
                          aria-invalid={Boolean(phoneError)}
                          aria-describedby={phoneError ? 'lp-phone-error' : undefined}
                          onChange={() => {
                            if (phoneError) {
                              setPhoneError('');
                            }
                          }}
                          className={`h-12 px-4 rounded-xl bg-white shadow-sm text-primary text-base font-medium placeholder:text-primary/30 ${phoneError ? 'border-red-400 focus-visible:ring-red-400' : 'border-primary/10 focus:border-accent'}`}
                          placeholder={t('homeowner.form.phonePlaceholder')}
                        />
                        {phoneError && (
                          <p id="lp-phone-error" className="mt-1 text-sm text-red-500">
                            {phoneError}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                          {t('homeowner.form.city')}
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          type="text"
                          required
                          className="h-12 px-4 rounded-xl bg-white border-primary/10 focus:border-accent shadow-sm text-primary text-base font-medium placeholder:text-primary/30"
                          placeholder={t('homeowner.form.cityPlaceholder')}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white font-bold h-14 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
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
                          <span className="text-base">{t('lp.husagare.submitButton')}</span>
                          <Send size={18} />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Phone fallback */}
                  <div className="text-center mt-4">
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-primary/10" />
                      <span className="text-xs text-primary/40 font-bold uppercase tracking-widest">
                        {t('homeowner.form.disclaimer')}
                      </span>
                      <div className="flex-1 h-px bg-primary/10" />
                    </div>
                    <a
                      href="tel:+46762498486"
                      onClick={trackPhoneClick}
                      className="inline-flex items-center gap-2 text-primary/60 hover:text-accent font-bold transition-colors"
                    >
                      <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                        <Phone size={14} />
                      </div>
                      <span className="text-base">076-249 84 86</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LpHeroForm;
