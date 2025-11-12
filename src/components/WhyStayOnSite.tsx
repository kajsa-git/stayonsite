import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ClipboardList, FileSignature, Headphones } from 'lucide-react';

const stepsConfig = [
  {
    icon: ClipboardList,
    titleKey: 'why.steps.plan.title',
    descriptionKey: 'why.steps.plan.description',
    ctaKey: 'why.steps.plan.cta',
  },
  {
    icon: FileSignature,
    titleKey: 'why.steps.contracts.title',
    descriptionKey: 'why.steps.contracts.description',
    ctaKey: 'why.steps.contracts.cta',
  },
  {
    icon: Headphones,
    titleKey: 'why.steps.operations.title',
    descriptionKey: 'why.steps.operations.description',
    ctaKey: 'why.steps.operations.cta',
  },
] as const;

const WhyStayOnSite = () => {
  const { t } = useLanguage();

  return (
    <section id="why" className="bg-nordic-50 py-16 md:py-20 border-b border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-nordic-500 font-heading mb-3">{t('why.title')}</p>
          <p className="text-3xl md:text-4xl text-nordic-900 font-light leading-snug">{t('why.subtitle')}</p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          {stepsConfig.map(({ icon: Icon, titleKey, descriptionKey, ctaKey }, index) => (
            <div
              key={titleKey}
              className="relative rounded-2xl bg-white shadow-sm border border-nordic-100 p-6 flex flex-col gap-4"
            >
              {index < stepsConfig.length - 1 && (
                <span
                  className="hidden md:block absolute top-1/2 right-[-20px] h-px w-10 bg-nordic-200"
                  aria-hidden="true"
                />
              )}
              {index > 0 && (
                <span
                  className="md:hidden absolute top-0 left-8 -mt-6 h-6 w-px bg-nordic-200"
                  aria-hidden="true"
                />
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6300]/10 text-[#ff6300]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm uppercase tracking-wide text-nordic-500 font-heading">
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl text-nordic-900 font-medium">{t(titleKey)}</h3>
                <p className="text-sm text-nordic-700 leading-relaxed">{t(descriptionKey)}</p>
              </div>
              <Button
                variant="ghost"
                className="justify-start px-0 text-[#ff6300] hover:text-[#e25200]"
                asChild
              >
                <a href="#contact">{t(ctaKey)}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyStayOnSite;
