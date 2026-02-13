
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Phone } from 'lucide-react';
import ContactInfo from './ContactInfo';
import WhyUs from './WhyUs';

interface InquiryLayoutProps {
  children: ReactNode;
}

const InquiryLayout = ({ children }: InquiryLayoutProps) => {
  const { t, language } = useLanguage();
  
  return (
    <section id="inquiry" className="section-spacing bg-nordic-50 border-t border-nordic-100">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center justify-center text-[#ff6300] mb-3 text-[11px] uppercase tracking-[0.4em] font-heading">
            {t('inquiry.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">{t('inquiry.title')}</h2>
          <p className="text-base md:text-lg text-nordic-700 font-light">
            {t('inquiry.subtitle')}
          </p>
        </div>

        <div className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-sm">
          <a
            href="tel:+46762498486"
            className="inline-flex items-center gap-2 text-nordic-700 hover:text-nordic-900 transition-colors"
          >
            <Phone size={15} />
            {t('hero.ctaPhone')}
          </a>
          <span className="hidden sm:inline text-nordic-300">|</span>
          <a
            href="https://wa.me/46762498486"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-nordic-700 hover:text-nordic-900 transition-colors"
          >
            <MessageCircle size={15} />
            {t('hero.ctaWhatsapp')}
          </a>
        </div>

        <div className="mt-10 md:mt-12 max-w-5xl mx-auto bg-white rounded-2xl md:rounded-3xl border border-nordic-100 shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-3 order-1 md:order-2 p-5 sm:p-6 md:p-10">
              <div className="mb-4 rounded-xl bg-[#ff6300]/5 border border-[#ff6300]/15 px-4 py-3 text-sm text-nordic-800 md:hidden">
                {language === 'sv'
                  ? 'Fyll i formuläret. Vi återkommer vanligtvis inom 24 timmar.'
                  : language === 'en'
                  ? 'Fill in the form. We usually respond within 24 hours.'
                  : 'Wypelnij formularz. Zwykle odpowiadamy w ciagu 24 godzin.'}
              </div>
              {children}
            </div>

            <div className="md:col-span-2 order-2 md:order-1 bg-nordic-50 p-5 sm:p-6 md:p-10 text-nordic-800 border-t md:border-t-0 md:border-r border-nordic-100">
              <ContactInfo />
              <WhyUs />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InquiryLayout;
