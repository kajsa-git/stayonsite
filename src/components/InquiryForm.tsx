
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
      const formDataObj = Object.fromEntries(formData.entries());
      
      // Handle "until further notice" case
      if (isUntilFurtherNotice) {
        formDataObj.endDate = t('inquiry.form.untilFurtherNotice');
      }
      
      // Use EmailJS service instead of FormSubmit
      const emailContent = `
        <h2>Ny förfrågan från StayOnSite</h2>
        <table>
          <tr>
            <td><strong>Företagsnamn:</strong></td>
            <td>${formDataObj.companyName}</td>
          </tr>
          <tr>
            <td><strong>Kontaktperson:</strong></td>
            <td>${formDataObj.contactName}</td>
          </tr>
          <tr>
            <td><strong>E-post:</strong></td>
            <td>${formDataObj.email}</td>
          </tr>
          <tr>
            <td><strong>Telefon:</strong></td>
            <td>${formDataObj.phone}</td>
          </tr>
          <tr>
            <td><strong>Önskad ort:</strong></td>
            <td>${formDataObj.location}</td>
          </tr>
          <tr>
            <td><strong>Antal arbetare:</strong></td>
            <td>${formDataObj.workers}</td>
          </tr>
          <tr>
            <td><strong>Startdatum:</strong></td>
            <td>${formDataObj.startDate}</td>
          </tr>
          <tr>
            <td><strong>Slutdatum:</strong></td>
            <td>${isUntilFurtherNotice ? t('inquiry.form.untilFurtherNotice') : formDataObj.endDate}</td>
          </tr>
          <tr>
            <td><strong>Meddelande:</strong></td>
            <td>${formDataObj.message}</td>
          </tr>
        </table>
      `;
      
      // Use a public API that doesn't require activation
      const response = await fetch("https://formsubmit.co/ajax/kajsa@stayonsite.se", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formDataObj.contactName,
          email: formDataObj.email,
          _subject: "Ny förfrågan från StayOnSite",
          message: emailContent,
          _template: "table"
        })
      });
      
      const result = await response.json();
      console.log('Form submission result:', result);
      
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
