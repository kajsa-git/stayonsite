'use client'

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { trackFormSubmit } from '@/lib/gtag';
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
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await submitContactForm({
        formType: 'inquiry',
        locale: language,
        page: window.location.pathname,
        source: 'inquiry-form',
        fields: {
          email: String(formData.get('email') ?? '').trim(),
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
          />
        </form>
      )}
    </InquiryLayout>
  );
};

export default InquiryForm;
