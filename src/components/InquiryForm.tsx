
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Globe, Mail, Phone, MapPin, Users, Calendar, MessageSquare } from 'lucide-react';

const InquiryForm = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSuccess(true);
      
      toast({
        title: t('inquiry.form.success'),
        description: new Date().toLocaleTimeString(),
      });
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormSuccess(false);
        e.currentTarget.reset();
      }, 3000);
    }, 1500);
  };

  return (
    <section id="inquiry" className="py-16 bg-teal-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('inquiry.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('inquiry.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 bg-teal-100 p-8 text-teal-900">
              <h3 className="text-xl font-semibold mb-6">Kontaktinformation</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5 text-teal-600" />
                  <span>info@stayonsite.se</span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-teal-600" />
                  <span>+46 70 123 45 67</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="mr-3 h-5 w-5 text-teal-600 mt-1" />
                  <span>StayOnSite AB<br />Storgatan 1<br />114 55 Stockholm</span>
                </div>
              </div>
              
              <div className="mt-12">
                <h4 className="text-lg font-medium mb-4">Varför välja oss?</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-amber-300 rounded-full mr-2"></div>
                    <span>Snabba svar inom 24 timmar</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-amber-300 rounded-full mr-2"></div>
                    <span>Boenden över hela Sverige</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-amber-300 rounded-full mr-2"></div>
                    <span>Smidig process från start till mål</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-2 w-2 bg-amber-300 rounded-full mr-2"></div>
                    <span>Över 10 års erfarenhet</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-3 p-8">
              {formSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Tack!</h3>
                  <p className="text-gray-600">{t('inquiry.form.success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        <span className="flex items-center gap-2">
                          <Globe size={16} />
                          {t('inquiry.form.companyName')}
                        </span>
                      </Label>
                      <Input 
                        id="companyName" 
                        type="text" 
                        required 
                        placeholder={language === 'sv' ? "Företagsnamn" : "Company name"} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactName">
                        <span className="flex items-center gap-2">
                          <Users size={16} />
                          {t('inquiry.form.contactName')}
                        </span>
                      </Label>
                      <Input 
                        id="contactName" 
                        type="text" 
                        required 
                        placeholder={language === 'sv' ? "Kontaktperson" : "Contact person"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <span className="flex items-center gap-2">
                          <Mail size={16} />
                          {t('inquiry.form.email')}
                        </span>
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        required 
                        placeholder="email@example.com" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <span className="flex items-center gap-2">
                          <Phone size={16} />
                          {t('inquiry.form.phone')}
                        </span>
                      </Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        required 
                        placeholder="+46 70 123 45 67" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <span className="flex items-center gap-2">
                          <MapPin size={16} />
                          {t('inquiry.form.location')}
                        </span>
                      </Label>
                      <Input 
                        id="location" 
                        type="text" 
                        required 
                        placeholder={language === 'sv' ? "Ex. Göteborg" : "E.g. Gothenburg"}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="workers">
                        <span className="flex items-center gap-2">
                          <Users size={16} />
                          {t('inquiry.form.workers')}
                        </span>
                      </Label>
                      <Input 
                        id="workers" 
                        type="number" 
                        required 
                        min="1" 
                        placeholder="5" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          {t('inquiry.form.startDate')}
                        </span>
                      </Label>
                      <Input id="startDate" type="date" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} />
                          {t('inquiry.form.endDate')}
                        </span>
                      </Label>
                      <Input id="endDate" type="date" required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      <span className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        {t('inquiry.form.message')}
                      </span>
                    </Label>
                    <Textarea 
                      id="message" 
                      rows={4}
                      placeholder={language === 'sv' ? "Beskriv era behov..." : "Describe your needs..."}
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {language === 'sv' ? "Skickar..." : "Sending..."}
                      </span>
                    ) : (
                      t('inquiry.form.submit')
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryForm;
