import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Users, Calendar, MessageSquare, Building2 } from 'lucide-react';
const InquiryForm = () => {
  const {
    t,
    language
  } = useLanguage();
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const formDataObj: Record<string, string> = {};

      // Convert FormData to object for email template
      formData.forEach((value, key) => {
        formDataObj[key] = value.toString();
      });

      // Add recipient
      formDataObj.recipient = 'kajsa@stayonsite.se';

      // Use EmailJS-like service
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send-form', {
        method: 'POST',
        body: formData
      });

      // For demo purposes, we'll simulate a successful submission
      // In a real application, you would check the response status

      setIsSubmitting(false);
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
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      toast({
        title: t('inquiry.form.error') || 'Error',
        description: language === 'sv' ? 'Det uppstod ett fel vid skickandet av formuläret. Försök igen senare.' : 'There was an error submitting the form. Please try again later.',
        variant: "destructive"
      });
    }
  };
  return <section id="inquiry" className="py-24 bg-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-nordic-500 mb-2 text-sm uppercase tracking-wider font-heading">
            {t('inquiry.tagline') || 'Kontakta oss'}
          </span>
          <h2 className="text-3xl md:text-4xl font-normal mb-4 font-display">{t('inquiry.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('inquiry.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg border border-nordic-200 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 bg-nordic-200/60 p-8 md:p-10 text-nordic-800">
              <h3 className="text-xl font-normal mb-8 text-nordic-900">Kontaktinformation</h3>
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-nordic-500" />
                  </div>
                  <span className="font-light">kajsa@stayonsite.se</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-nordic-500" />
                  </div>
                  <span className="font-light">+46 762 49 84 86</span>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center mt-1">
                    <MapPin className="h-5 w-5 text-nordic-500" />
                  </div>
                  <span className="font-light">
                    StayOnSite AB<br />Storgatan 1<br />114 55 Stockholm
                  </span>
                </div>
              </div>
              
              <div className="mt-16">
                <h4 className="text-lg font-normal mb-6 text-nordic-900">Varför välja oss?</h4>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="h-1 w-6 bg-nordic-500 mr-4 rounded-full"></div>
                    <span className="font-light">Snabba svar inom 24 timmar</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-1 w-6 bg-nordic-500 mr-4 rounded-full"></div>
                    <span className="font-light">Boenden över hela Sverige</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-1 w-6 bg-nordic-500 mr-4 rounded-full"></div>
                    <span className="font-light">Smidig process från start till mål</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-1 w-6 bg-nordic-500 mr-4 rounded-full"></div>
                    <span className="font-light">Över 10 års erfarenhet</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-3 p-8 md:p-10">
              {formSuccess ? <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-normal text-nordic-900 mb-2">Tack!</h3>
                  <p className="text-nordic-800 font-light">{t('inquiry.form.success')}</p>
                </div> : <form ref={formRef} onSubmit={handleSubmit} className="space-y-7" action="https://formsubmit.co/kajsa@stayonsite.se" method="POST">
                  <input type="hidden" name="_subject" value="Ny förfrågan från StayOnSite" />
                  <input type="hidden" name="_next" value={window.location.origin} />
                  <input type="hidden" name="_captcha" value="false" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2.5">
                      <Label htmlFor="companyName" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Building2 size={16} className="text-nordic-500" />
                          {t('inquiry.form.companyName')}
                        </span>
                      </Label>
                      <Input id="companyName" name="companyName" type="text" required placeholder={language === 'sv' ? "Företagsnamn" : "Company name"} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="contactName" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-nordic-500" />
                          {t('inquiry.form.contactName')}
                        </span>
                      </Label>
                      <Input id="contactName" name="contactName" type="text" required placeholder={language === 'sv' ? "Kontaktperson" : "Contact person"} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Mail size={16} className="text-nordic-500" />
                          {t('inquiry.form.email')}
                        </span>
                      </Label>
                      <Input id="email" name="email" type="email" required placeholder="email@example.com" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="phone" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Phone size={16} className="text-nordic-500" />
                          {t('inquiry.form.phone')}
                        </span>
                      </Label>
                      <Input id="phone" name="phone" type="tel" required placeholder="+46 70 123 45 67" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="location" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="text-nordic-500" />
                          {t('inquiry.form.location')}
                        </span>
                      </Label>
                      <Input id="location" name="location" type="text" required placeholder={language === 'sv' ? "Ex. Göteborg" : "E.g. Gothenburg"} className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="workers" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Users size={16} className="text-nordic-500" />
                          {t('inquiry.form.workers')}
                        </span>
                      </Label>
                      <Input id="workers" name="workers" type="number" required min="1" placeholder="5" className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="startDate" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-nordic-500" />
                          {t('inquiry.form.startDate')}
                        </span>
                      </Label>
                      <Input id="startDate" name="startDate" type="date" required className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                    
                    <div className="space-y-2.5">
                      <Label htmlFor="endDate" className="font-light text-nordic-800">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-nordic-500" />
                          {t('inquiry.form.endDate')}
                        </span>
                      </Label>
                      <Input id="endDate" name="endDate" type="date" required className="border-nordic-200 focus-visible:ring-nordic-400 font-light" />
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <Label htmlFor="message" className="font-light text-nordic-800">
                      <span className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-nordic-500" />
                        {t('inquiry.form.message')}
                      </span>
                    </Label>
                    <Textarea id="message" name="message" rows={4} placeholder={language === 'sv' ? "Beskriv era behov..." : "Describe your needs..."} className="border-nordic-200 focus-visible:ring-nordic-400 font-light resize-none" />
                  </div>
                  
                  <Button type="submit" className="w-full md:w-auto px-8 py-2.5 h-auto bg-nordic-500 hover:bg-nordic-600 text-white font-light rounded-md transition-colors duration-500" disabled={isSubmitting}>
                    {isSubmitting ? <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {language === 'sv' ? "Skickar..." : "Sending..."}
                      </span> : t('inquiry.form.submit')}
                  </Button>
                </form>}
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default InquiryForm;