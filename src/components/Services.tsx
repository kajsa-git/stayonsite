
import { useLanguage } from '@/contexts/LanguageContext';

const Services = () => {
  const { t } = useLanguage();

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
      </div>
    </section>
  );
};

export default Services;
