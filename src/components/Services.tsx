
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

  return (
    <section id="services" className="section-spacing bg-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-14 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900">
            {t('services.title')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-nordic-700 font-light leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Services;
