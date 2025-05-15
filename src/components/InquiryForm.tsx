
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
  const [isUntilFurtherNotice, setIsUntilFurtherNotice] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get form data
      const formData = new FormData(e.currentTarget);
      
      // Handle "until further notice" case
      if (isUntilFurtherNotice) {
        formData.set('endDate', t('inquiry.form.untilFurtherNotice'));
      }
      
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
          setIsUntilFurtherNotice(false);
        }, 3000);
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
      ) : (
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className="space-y-7"
          action="https://formsubmit.co/kajsa@stayonsite.se" 
          method="POST"
        >
          <InquiryFormFields
            isSubmitting={isSubmitting}
            isUntilFurtherNotice={isUntilFurtherNotice}
            onUntilFurtherNoticeChange={setIsUntilFurtherNotice}
          />
        </form>
      )}
    </InquiryLayout>
  );
};

export default InquiryForm;
