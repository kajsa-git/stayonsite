
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

        <div>
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
