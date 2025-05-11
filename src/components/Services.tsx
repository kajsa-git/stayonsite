
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
      color: 'bg-primary-100 text-primary-600'
    },
    {
      title: t('services.process.step2.title'),
      description: t('services.process.step2.description'),
      icon: MessageSquare,
      color: 'bg-secondary-100 text-secondary-600'
    },
    {
      title: t('services.process.step3.title'),
      description: t('services.process.step3.description'),
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: t('services.process.step4.title'),
      description: t('services.process.step4.description'),
      icon: Home,
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-gradient-to-b from-white to-primary-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">{t('services.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-10 text-center text-gray-700">{t('services.process.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-none shadow-md rounded-2xl card-hover overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                      <Icon size={28} />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-16 glass-card p-8 md:p-10 mx-4 md:mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="bg-primary-100 p-5 rounded-full">
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Construction workers" 
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Trygghet genom erfaren partner</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Med över 10 års erfarenhet av att hjälpa byggbolag med boende, 
                  kan ni lita på att StayOnSite levererar boenden som uppfyller era behov, 
                  i tid och enligt överenskommelse. Vi har ett brett nätverk av boendealternativ 
                  över hela Sverige.
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
