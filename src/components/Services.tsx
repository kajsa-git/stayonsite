
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
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('services.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-8 text-center">{t('services.process.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mb-4`}>
                      <Icon size={24} />
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
          
          <div className="mt-12 bg-gray-50 p-6 md:p-8 rounded-lg border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="bg-primary-100 p-4 rounded-full">
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Construction workers" 
                  className="w-20 h-20 object-cover rounded-full"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Trygghet genom erfaren partner</h3>
                <p className="text-gray-600">
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
