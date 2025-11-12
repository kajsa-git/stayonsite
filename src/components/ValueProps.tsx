import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3, KeyRound, MapPin } from 'lucide-react';

const ValueProps = () => {
  const { t } = useLanguage();

  const highlights = [
    {
      icon: MapPin,
      title: t('valueProps.items.network.title'),
      description: t('valueProps.items.network.description'),
    },
    {
      icon: KeyRound,
      title: t('valueProps.items.coordination.title'),
      description: t('valueProps.items.coordination.description'),
    },
    {
      icon: BarChart3,
      title: t('valueProps.items.reporting.title'),
      description: t('valueProps.items.reporting.description'),
    },
  ];

  return (
    <section className="bg-nordic-50 py-16 md:py-20">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm uppercase tracking-wider text-nordic-500 font-heading mb-3">
            {t('valueProps.title')}
          </p>
          <p className="text-2xl md:text-3xl text-nordic-900 font-normal leading-snug">
            {t('valueProps.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 grid gap-6 md:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="nordic-card p-6 border border-nordic-200 h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nordic-100 text-nordic-600 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl text-nordic-900 mb-3">{title}</h3>
                <p className="text-sm text-nordic-700 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="nordic-card p-6 border border-nordic-200 bg-white flex flex-col justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-nordic-500 mb-2">{t('valueProps.case.title')}</p>
              <p className="text-base text-nordic-800 leading-relaxed">{t('valueProps.case.description')}</p>
            </div>
            <p className="mt-6 text-sm font-medium text-nordic-600">{t('valueProps.case.metrics')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
