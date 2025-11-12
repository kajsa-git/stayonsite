
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, MessageSquare, CheckCircle, Home } from 'lucide-react';

const Services = () => {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('services.process.step1.title'),
      description: t('services.process.step1.description'),
      icon: ClipboardList,
      color: 'text-[#ff6300]'
    },
    {
      title: t('services.process.step2.title'),
      description: t('services.process.step2.description'),
      icon: MessageSquare,
      color: 'text-[#ff6300]'
    },
    {
      title: t('services.process.step3.title'),
      description: t('services.process.step3.description'),
      icon: CheckCircle,
      color: 'text-[#ff6300]'
    },
    {
      title: t('services.process.step4.title'),
      description: t('services.process.step4.description'),
      icon: Home,
      color: 'text-[#ff6300]'
    }
  ];

  return (
    <section id="services" className="section-spacing bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ff6300] mb-2 text-sm uppercase tracking-wider font-heading">
            {t('services.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 font-display">{t('services.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('services.subtitle')}
          </p>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-12 text-center text-nordic-900 font-display">{t('services.process.title')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative group"
                >
                  {/* Connector line for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-nordic-200" />
                  )}

                  <div className="relative bg-white border border-nordic-100 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-nordic-200">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-[#ff6300]/10 flex items-center justify-center">
                          <Icon size={28} className={step.color} />
                        </div>
                        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#ff6300] text-white text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-nordic-900">{step.title}</h4>
                      <p className="text-sm text-nordic-700 font-light leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 p-8 md:p-10 mx-auto max-w-5xl bg-gradient-to-br from-nordic-50 to-white rounded-3xl border border-nordic-100">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img
                    alt="Padlock security"
                    className="w-full h-full object-cover"
                    src="/lovable-uploads/6247830f-d640-4319-9d3a-dfb0b0160839.jpg"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-nordic-900 font-display">
                  {t('services.security.title')}
                </h3>
                <p className="text-nordic-800 leading-relaxed font-light">
                  {t('services.security.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
