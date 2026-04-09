'use client'

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { trackFormSubmit } from '@/lib/gtag';
import { isValidPhoneNumber } from '@/lib/contact';
import {
  getContactFormErrorMessage,
  submitContactForm,
} from '@/lib/contact-form';
import InquiryLayout from './inquiry/InquiryLayout';
import InquiryFormFields from './inquiry/InquiryFormFields';
import FormSuccess from './inquiry/FormSuccess';

const InquiryForm = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPhoneError('');

    const formData = new FormData(e.currentTarget);
    const phone = String(formData.get('phone') ?? '').trim();

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
        formType: 'inquiry',
        locale: language,
        page: window.location.pathname,
        source: 'inquiry-form',
        fields: {
          email: String(formData.get('email') ?? '').trim(),
          phone,
          message: String(formData.get('message') ?? '').trim(),
        },
      });
      setFormSuccess(true);
      trackFormSubmit();
      toast({
        title: t('inquiry.form.success'),
        description: new Date().toLocaleTimeString()
      });
      
      setTimeout(() => {
        setFormSuccess(false);
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: t('inquiry.form.error') || 'Error',
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
    <InquiryLayout>
      {formSuccess ? (
        <FormSuccess />
      ) : (
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="space-y-7"
        >
          <InquiryFormFields
            isSubmitting={isSubmitting}
            phoneError={phoneError}
            onPhoneChange={() => setPhoneError('')}
          />
        </form>
      )}
    </InquiryLayout>
  );
};

export default InquiryForm;
