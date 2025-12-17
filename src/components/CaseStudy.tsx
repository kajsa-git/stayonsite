import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/data/translations';

const CASE_IMAGE =
  'https://images.unsplash.com/photo-1509398830099-9d5fd5893088?auto=format&fit=crop&w=1600&q=80';

const timeline = [
  {
    titleKey: 'case.timeline.proposal.title' as TranslationKey,
    descriptionKey: 'case.timeline.proposal.description' as TranslationKey,
  },
  {
    titleKey: 'case.timeline.moveIn.title' as TranslationKey,
    descriptionKey: 'case.timeline.moveIn.description' as TranslationKey,
  },
  {
    titleKey: 'case.timeline.expand.title' as TranslationKey,
    descriptionKey: 'case.timeline.expand.description' as TranslationKey,
  },
];

const CaseStudy = () => {
  const { t } = useLanguage();

  return (
    <section id="case" className="section-spacing bg-white">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-stretch">
          <div className="relative overflow-hidden rounded-3xl min-h-[420px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${CASE_IMAGE}')` }} />
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/20" />
            <div className="relative z-10 h-full p-8 md:p-10 flex flex-col">
              <span className="inline-flex items-center rounded-full border border-[#ff6300]/40 bg-[#ff6300]/20 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-white w-fit mb-3">
                {t('case.tagline')}
              </span>
              <p className="text-3xl md:text-4xl text-white font-semibold">{t('case.title')}</p>
              <p className="text-base text-white/80 mt-2">{t('case.subtitle')}</p>

              <ol className="mt-10 space-y-8">
                {timeline.map(({ titleKey, descriptionKey }, index) => (
                  <li key={titleKey} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-4 w-4 rounded-full border-2 border-[#ff6300] bg-white" />
                      {index < timeline.length - 1 && <span className="flex-1 w-px bg-white/30 mt-1" />}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{t(titleKey)}</p>
                      <p className="text-sm text-white/80">{t(descriptionKey)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-3xl bg-[#ff6300] text-white p-8 flex flex-col gap-6 justify-center items-center text-center">
            <p className="text-2xl md:text-3xl font-semibold leading-snug">
              {t('case.cta.question')}
            </p>
            <a
              href="sms:+46736287709"
              className="inline-flex items-center justify-center rounded-full bg-white text-[#ff6300] px-6 py-3 text-sm font-semibold hover:bg-white/90 transition-colors"
            >
              {t('case.cta.button')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudy;
