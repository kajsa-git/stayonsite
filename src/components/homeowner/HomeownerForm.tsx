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
import HomeownerFormFields from './HomeownerFormFields';
import FormSuccess from '../inquiry/FormSuccess';
import { ShieldCheck } from 'lucide-react';

const HomeownerForm = () => {
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
        source: 'homeowner-form',
        fields: {
          phone: phone.trim(),
          city: String(formData.get('city') ?? '').trim(),
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({
        title: t('homeowner.form.success'),
        description: new Date().toLocaleTimeString()
      });
      
      setTimeout(() => {
        setFormSuccess(false);
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 8000);
    } catch (error) {
      toast({
        title: t('homeowner.form.error') || 'Error',
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          language
        ),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="homeowner-form" className="section-spacing bg-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -z-0" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-0" />
      <div className="absolute top-1/4 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0" />
      
      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm mb-6">
                <span className="h-px w-8 bg-accent" />
                {t('homeowner.form.sectionLabel')}
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-primary mb-5 md:mb-8 leading-tight">
                {t('homeowner.form.title')}
              </h2>
              <p className="text-lg md:text-xl text-primary/70 font-light leading-relaxed mb-8 md:mb-12">
                {t('homeowner.form.subtitle')}
              </p>
              
              {/* Contact promise / Trust card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="hidden md:block glass-card p-10 rounded-[2.5rem] border-primary/5 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700" />
                
                <div className="flex gap-8 items-start relative z-10">
                  <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/20 shrink-0 group-hover:rotate-6 transition-transform">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-4">
                      {t('homeowner.form.promise')}
                    </h3>
                    <p className="text-primary/70 font-medium leading-relaxed">
                      {t('homeowner.form.promiseDescription')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Form side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative order-1 lg:order-2"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-accent to-accent/20 rounded-[3rem] blur-2xl opacity-10" />
              <div className="relative bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-primary/5 p-5 sm:p-6 md:p-14">
                <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-primary/80 md:hidden">
                  {language === 'sv'
                    ? 'Fyll i formuläret. Vi återkommer inom 24 timmar.'
                    : language === 'en'
                    ? 'Fill in the form. We reply within 24 hours.'
                    : 'Wypelnij formularz. Odpowiadamy w ciagu 24 godzin.'}
                </div>
                {formSuccess ? (
                  <FormSuccess />
                ) : (
                  <form 
                    ref={formRef} 
                    onSubmit={handleSubmit} 
                    className="space-y-6 md:space-y-8"
                  >
                    <HomeownerFormFields
                      isSubmitting={isSubmitting}
                      phoneError={phoneError}
                      onPhoneChange={() => {
                        if (phoneError) {
                          setPhoneError('');
                        }
                      }}
                    />
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeownerForm;
