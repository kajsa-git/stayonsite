
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, MessageSquare, CheckCircle, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Services = () => {
  const { t } = useLanguage();
  
  const steps = [
    {
      title: t('services.process.step1.title'),
      description: t('services.process.step1.description'),
      icon: ClipboardList,
      color: 'text-nordic-500'
    },
    {
      title: t('services.process.step2.title'),
      description: t('services.process.step2.description'),
      icon: MessageSquare,
      color: 'text-nordic-500'
    },
    {
      title: t('services.process.step3.title'),
      description: t('services.process.step3.description'),
      icon: CheckCircle,
      color: 'text-nordic-500'
    },
    {
      title: t('services.process.step4.title'),
      description: t('services.process.step4.description'),
      icon: Home,
      color: 'text-nordic-500'
    }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-nordic-500 mb-2 text-sm uppercase tracking-wider font-heading">
            {t('services.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-normal mb-4 font-display">{t('services.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('services.subtitle')}
          </p>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-normal mb-12 text-center text-nordic-900 font-display">{t('services.process.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border border-nordic-200 shadow-none rounded-lg overflow-hidden transition-all duration-500 hover:border-nordic-300">
                  <CardHeader className="pb-2">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-nordic-300">
                      <Icon size={24} className={step.color} />
                    </div>
                    <CardTitle className="text-lg font-normal text-nordic-900">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-nordic-700 font-light">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-20 p-10 mx-auto max-w-5xl border border-nordic-200 rounded-lg">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="p-3 border border-nordic-200 rounded-full">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img 
                    alt="Padlock security" 
                    className="w-full h-full object-cover" 
                    src="/lovable-uploads/6247830f-d640-4319-9d3a-dfb0b0160839.jpg" 
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-normal mb-4 text-nordic-900 font-display">
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
