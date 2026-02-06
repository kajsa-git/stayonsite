import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import HomeownerFormFields from './HomeownerFormFields';
import FormSuccess from '../inquiry/FormSuccess';
import { ShieldCheck, Mail, AlertTriangle } from 'lucide-react';

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
      
      if (result.success === "true" || result.success === true) {
        setFormSuccess(true);
        toast({
          title: t('homeowner.form.success'),
          description: new Date().toLocaleTimeString()
        });
        
        // Reset form after 8 seconds
        setTimeout(() => {
          setFormSuccess(false);
          if (formRef.current) {
            formRef.current.reset();
          }
        }, 8000);
      } else if (result.message && result.message.includes("Activation")) {
        setNeedsActivation(true);
        toast({
          title: language === 'sv' ? 'Aktivering krävs' : 'Activation required',
          description: language === 'sv' 
            ? 'Ett aktiveringsmail har skickats till kajsa@stayonsite.se.' 
            : 'An activation email has been sent to kajsa@stayonsite.se.',
          duration: 10000
        });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      toast({
        title: t('homeowner.form.error') || 'Error',
        description: language === 'sv' ? 'Det uppstod ett fel. Försök igen senare.' : 'An error occurred. Please try again later.',
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
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm mb-6">
                <span className="h-px w-8 bg-accent" />
                {t('homeowner.form.sectionLabel')}
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-8 leading-tight">
                {t('homeowner.form.title')}
              </h2>
              <p className="text-xl text-primary/70 font-light leading-relaxed mb-12">
                {t('homeowner.form.subtitle')}
              </p>
              
              {/* Contact promise / Trust card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card p-10 rounded-[2.5rem] border-primary/5 shadow-2xl relative overflow-hidden group"
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
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-accent to-accent/20 rounded-[3rem] blur-2xl opacity-10" />
              <div className="relative bg-white rounded-[3.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-primary/5 p-8 md:p-14">
                {formSuccess ? (
                  <FormSuccess />
                ) : needsActivation ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-8 mx-auto text-amber-500">
                      <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-4">
                      {language === 'sv' ? 'Aktivering krävs' : 'Activation Required'}
                    </h3>
                    <p className="text-primary/70 font-medium mb-8">
                      {language === 'sv' 
                        ? 'Ett aktiveringsmail har skickats till kajsa@stayonsite.se. Bekräfta via länken i mailet.' 
                        : 'Please check your email and confirm the activation link.'}
                    </p>
                    <Mail size={40} className="mx-auto text-primary/20" />
                  </div>
                ) : (
                  <form 
                    ref={formRef} 
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                  >
                    <HomeownerFormFields isSubmitting={isSubmitting} />
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
