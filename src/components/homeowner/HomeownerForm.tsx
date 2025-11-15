import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import HomeownerFormFields from './HomeownerFormFields';
import FormSuccess from '../inquiry/FormSuccess';

const HomeownerForm = () => {
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
      formData.append('_subject', 'Ny husägare-registrering från StayOnSite');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_next', window.location.origin);
      
      // Submit the form manually using fetch to FormSubmit endpoint
      const response = await fetch('https://formsubmit.co/ajax/kajsa@stayonsite.se', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Homeowner form submission result:', result);
      
      if (result.success === "true" || result.success === true) {
        setFormSuccess(true);
        toast({
          title: t('homeowner.form.success'),
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
      console.error('Homeowner form submission error:', error);
      toast({
        title: t('homeowner.form.error') || 'Error',
        description: language === 'sv' ? 'Det uppstod ett fel vid skickandet av formuläret. Försök igen senare.' : 'There was an error submitting the form. Please try again later.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="homeowner-form" className="section-spacing bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-6">
              {t('homeowner.form.title')}
            </h2>
            <p className="text-xl text-nordic-800 font-light leading-relaxed mb-8">
              {t('homeowner.form.subtitle')}
            </p>
            
            {/* Contact promise */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-12 border border-amber-200 shadow-lg max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-lg font-semibold text-nordic-900">
                  {t('homeowner.form.promise')}
                </span>
              </div>
              <p className="text-nordic-700 font-light">
                {t('homeowner.form.promiseDescription')}
              </p>
            </div>
          </div>

          {/* Form container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              {formSuccess ? (
                <FormSuccess />
              ) : needsActivation ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
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
                  <HomeownerFormFields isSubmitting={isSubmitting} />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeownerForm;
