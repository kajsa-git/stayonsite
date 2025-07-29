import { useLanguage } from '@/contexts/LanguageContext';
import { User } from 'lucide-react';

const HomeownerProcess = () => {
  const { t } = useLanguage();

  const steps = [
    {
      number: "01",
      icon: (
        <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      title: t('homeowner.process.step1.title'),
      description: t('homeowner.process.step1.description')
    },
    {
      number: "03",
      icon: (
        <User className="w-10 h-10 text-amber-600" />
      ),
      title: t('homeowner.process.step3.title'),
      description: t('homeowner.process.step3.description')
    },
    {
      number: "04",
      icon: (
        <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: t('homeowner.process.step4.title'),
      description: t('homeowner.process.step4.description')
    }
  ];

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-light text-nordic-900 mb-6">
            {t('homeowner.process.title')}
          </h2>
          <p className="text-xl text-nordic-800 font-light max-w-3xl mx-auto leading-relaxed">
            {t('homeowner.process.subtitle')}
          </p>
        </div>

        {/* Process steps */}
        <div className="relative">
          {/* Connection line - hidden on mobile */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number removed */}
                
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-display text-nordic-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-nordic-700 font-light leading-relaxed">
                  {index === 1 ? "Baserat på din bostad och tillgänglighet hittar vi en bra matchning." : step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeownerProcess;