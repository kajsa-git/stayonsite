import { useLanguage } from '@/contexts/LanguageContext';

const HomeownerBenefits = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: (
        <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: t('homeowner.benefits.income.title'),
      description: t('homeowner.benefits.income.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('homeowner.benefits.security.title'),
      description: t('homeowner.benefits.security.description')
    },
    {
      icon: (
        <svg className="w-12 h-12 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('homeowner.benefits.flexibility.title'),
      description: t('homeowner.benefits.flexibility.description')
    }
  ];

  return (
    <section className="section-spacing bg-white border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-light text-nordic-900 mb-6">
            {t('homeowner.benefits.title')}
          </h2>
          <p className="text-xl text-nordic-800 font-light max-w-3xl mx-auto leading-relaxed">
            Få extra inkomst genom uthyrning – vi tar hand om allt det praktiska
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-display text-nordic-900 mb-4">
                {benefit.title}
              </h3>
              <p className="text-nordic-700 font-light leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeownerBenefits;
