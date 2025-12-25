
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Calendar } from 'lucide-react';
import ContactInfo from './ContactInfo';
import WhyUs from './WhyUs';

interface InquiryLayoutProps {
  children: ReactNode;
}

const InquiryLayout = ({ children }: InquiryLayoutProps) => {
  const { t } = useLanguage();
  
  return (
    <section id="inquiry" className="section-spacing bg-nordic-50 border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center justify-center text-[#ff6300] mb-3 text-[11px] uppercase tracking-[0.4em] font-heading">
            {t('inquiry.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">{t('inquiry.title')}</h2>
          <p className="text-base md:text-lg text-nordic-700 font-light">
            {t('inquiry.subtitle')}
          </p>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-center gap-3">
          <Button asChild className="rounded-full bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white h-12 px-6">
            <a href="tel:+46762498486">
              <Phone size={16} className="mr-2" />
              {t('hero.ctaPhone')}
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-nordic-200 bg-white text-nordic-900 hover:bg-nordic-50 h-12 px-6"
          >
            <a href="https://wa.me/46762498486" target="_blank" rel="noreferrer">
              <MessageCircle size={16} className="mr-2" />
              {t('hero.ctaWhatsapp')}
            </a>
          </Button>
        </div>

        <div className="mt-12 max-w-5xl mx-auto bg-white rounded-3xl border border-nordic-100 shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 bg-nordic-50 p-8 md:p-10 text-nordic-800 border-b md:border-b-0 md:border-r border-nordic-100">
              <ContactInfo />
              <WhyUs />
            </div>
            
            <div className="md:col-span-3 p-8 md:p-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryLayout;
