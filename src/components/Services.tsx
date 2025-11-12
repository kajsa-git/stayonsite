
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
        <div className="mb-14 max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#ff6300]/30 bg-[#ff6300]/5 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-[#ff6300]">
            {t('services.tagline')}
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-nordic-900">
            {t('services.title')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-nordic-700 font-light leading-relaxed">
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

          <div className="mt-16 p-8 md:p-10 mx-auto max-w-5xl bg-gradient-to-r from-nordic-50 to-white rounded-3xl border border-nordic-100">
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
              <div className="space-y-3 text-nordic-800">
                <p className="text-sm uppercase tracking-[0.35em] text-nordic-500">
                  {t('services.tagline')}
                </p>
                <h3 className="text-2xl font-semibold text-nordic-900">
                  {t('services.security.title')}
                </h3>
                <p className="text-nordic-700 leading-relaxed font-light">
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
