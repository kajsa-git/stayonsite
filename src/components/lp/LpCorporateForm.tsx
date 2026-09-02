'use client'

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { trackFbEvent } from '@/hooks/use-facebook-pixel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isValidPhoneNumber } from '@/lib/contact';
import { trackPhoneClick, trackFormSubmit } from '@/lib/gtag';
import { getContactFormErrorMessage, submitContactForm } from '@/lib/contact-form';
import { Send, Phone, CheckCircle2 } from 'lucide-react';

interface LpCorporateFormProps {
  utmParams: Record<string, string>;
}

const LpCorporateForm = ({ utmParams }: LpCorporateFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const phone = String(formData.get('phone') ?? '');
    setPhoneError('');

    if (!isValidPhoneNumber(phone)) {
      setPhoneError('Please enter a valid phone number.');
      const phoneInput = e.currentTarget.elements.namedItem('phone');
      if (phoneInput instanceof HTMLInputElement) phoneInput.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitContactForm({
        formType: 'lp-corporate',
        locale: 'en',
        page: window.location.pathname,
        source: 'google-ads',
        fields: {
          company: String(formData.get('company') ?? '').trim(),
          email: String(formData.get('email') ?? '').trim(),
          phone: phone.trim(),
          city: String(formData.get('city') ?? '').trim(),
          people: String(formData.get('people') ?? '').trim(),
        },
        utmParams,
      });
      setFormSuccess(true);
      trackFormSubmit({ email: String(formData.get('email') ?? ''), phone });
      trackFbEvent('Lead', { content_name: 'lp-corporate' }, result.metaEventId);
      toast({ title: 'Thank you! We’ll be in touch within 24 hours.' });
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          'en'
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
              Corporate Housing · Sweden
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary leading-tight mb-4">
              Furnished corporate housing across Sweden
            </h1>
            <p className="text-base md:text-lg text-primary/70 font-light leading-relaxed mb-6">
              Move-in ready homes for your staff and site workers. One point of contact,
              one invoice, nationwide coverage — we handle the housing so your team can
              focus on the job.
            </p>
            <p className="text-sm text-primary/50 font-medium">
              10+ years · 500+ workers placed · Reply within 24 hours
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
                  <h3 className="text-xl font-display font-bold text-primary mb-2">Thank you!</h3>
                  <p className="text-primary/70">
                    We’ve received your request and will get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-display font-bold text-primary mb-1">
                    Get a housing quote
                  </h2>
                  <p className="text-sm text-primary/60 mb-6">
                    Tell us what you need — we’ll come back with options within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="company" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                          Company
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          required
                          autoComplete="organization"
                          className="h-12 px-4 rounded-xl bg-white border-primary/10 focus:border-accent shadow-sm text-primary text-base font-medium placeholder:text-primary/30"
                          placeholder="Your company"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          inputMode="email"
                          className="h-12 px-4 rounded-xl bg-white border-primary/10 focus:border-accent shadow-sm text-primary text-base font-medium placeholder:text-primary/30"
                          placeholder="you@company.com"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                          Phone
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
                          onChange={() => { if (phoneError) setPhoneError(''); }}
                          className={`h-12 px-4 rounded-xl bg-white shadow-sm text-primary text-base font-medium placeholder:text-primary/30 ${phoneError ? 'border-red-400 focus-visible:ring-red-400' : 'border-primary/10 focus:border-accent'}`}
                          placeholder="+46 …"
                        />
                        {phoneError && (
                          <p id="lp-phone-error" className="mt-1 text-sm text-red-500">{phoneError}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="city" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                            City / area
                          </Label>
                          <Input
                            id="city"
                            name="city"
                            type="text"
                            required
                            className="h-12 px-4 rounded-xl bg-white border-primary/10 focus:border-accent shadow-sm text-primary text-base font-medium placeholder:text-primary/30"
                            placeholder="e.g. Luleå"
                          />
                        </div>
                        <div>
                          <Label htmlFor="people" className="text-primary/60 font-bold uppercase tracking-widest text-[10px] ml-1">
                            Workers
                          </Label>
                          <Input
                            id="people"
                            name="people"
                            type="number"
                            min="1"
                            required
                            inputMode="numeric"
                            className="h-12 px-4 rounded-xl bg-white border-primary/10 focus:border-accent shadow-sm text-primary text-base font-medium placeholder:text-primary/30"
                            placeholder="e.g. 8"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
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
                            <span>Sending…</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-base">Get a quote</span>
                            <Send size={18} />
                          </>
                        )}
                      </Button>
                      <p className="text-center text-xs leading-relaxed text-primary/60">
                        Flexible rental terms – from 3 months to several years.
                      </p>
                    </div>
                  </form>

                  {/* Phone fallback */}
                  <div className="text-center mt-4">
                    <div className="flex items-center gap-3 my-3">
                      <div className="flex-1 h-px bg-primary/10" />
                      <span className="text-xs text-primary/40 font-bold uppercase tracking-widest">
                        or call us
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
                      <span className="text-base">+46 76-249 84 86</span>
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

export default LpCorporateForm;
