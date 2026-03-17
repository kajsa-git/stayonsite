'use client'

import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import InquiryLayout from './inquiry/InquiryLayout';
import InquiryFormFields from './inquiry/InquiryFormFields';
import FormSuccess from './inquiry/FormSuccess';

const InquiryForm = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      
      // Add hidden fields required by FormSubmit
      formData.append('_subject', 'Ny förfrågan från StayOnSite');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_next', window.location.origin);
      
      
      // Submit the form manually using fetch to FormSubmit endpoint
      const response = await fetch('https://formsubmit.co/ajax/kajsa@stayonsite.se', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();

      if (result.success === "true" || result.success === true) {
        setFormSuccess(true);
        toast({
          title: t('inquiry.form.success'),
          description: new Date().toLocaleTimeString()
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormSuccess(false);
          if (formRef.current) {
            formRef.current.reset();
          }
        }, 3000);
      } else if (result.message && result.message.includes("Activation")) {
        // Handle activation needed case
        setNeedsActivation(true);
        toast({
          title: language === 'sv' ? 'Aktivering krävs' : 'Activation required',
          description: language === 'sv' 
            ? 'Ett aktiveringsmail har skickats till kajsa@stayonsite.se. Klicka på aktiveringsknappen i mailet för att aktivera formuläret.' 
            : 'An activation email has been sent to kajsa@stayonsite.se. Click the activation button in the email to activate the form.',
          duration: 10000
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: t('inquiry.form.error') || 'Error',
        description: language === 'sv' ? 'Det uppstod ett fel vid skickandet av formuläret. Försök igen senare.' : 'There was an error submitting the form. Please try again later.',
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
      ) : needsActivation ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-normal text-nordic-900 mb-2">
            {language === 'sv' ? 'Aktivering krävs' : 'Activation Required'}
          </h3>
          <p className="text-nordic-800 font-light mb-4">
            {language === 'sv' 
              ? 'Ett aktiveringsmail har skickats till kajsa@stayonsite.se.' 
              : 'An activation email has been sent to kajsa@stayonsite.se.'}
          </p>
          <p className="text-nordic-800 font-light">
            {language === 'sv' 
              ? 'Klicka på aktiveringsknappen i mailet och försök sedan igen.' 
              : 'Click the activation button in the email and then try again.'}
          </p>
        </div>
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
