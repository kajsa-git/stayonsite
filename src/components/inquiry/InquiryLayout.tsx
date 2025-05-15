
import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactInfo from './ContactInfo';
import WhyUs from './WhyUs';

interface InquiryLayoutProps {
  children: ReactNode;
}

const InquiryLayout = ({ children }: InquiryLayoutProps) => {
  const { t } = useLanguage();
  
  return (
    <section id="inquiry" className="py-24 bg-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-nordic-500 mb-2 text-sm uppercase tracking-wider font-heading">
            {t('inquiry.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-normal mb-4 font-display">{t('inquiry.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('inquiry.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg border border-nordic-200 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 bg-nordic-200/60 p-8 md:p-10 text-nordic-800">
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
