import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/data/translations';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Phone } from 'lucide-react';

const phoneHref = 'tel:+46736287709';
const whatsappHref = 'https://wa.me/46736287709';

const chipLinks: Array<{ key: TranslationKey; href: string }> = [
  { key: 'hero.bullet1', href: '#why' },
  { key: 'hero.bullet2', href: '#why' },
  { key: 'hero.bullet3', href: '#contact' },
];

const heroMetrics = [
  {
    valueKey: 'hero.metrics.proposal.value' as TranslationKey,
    descriptionKey: 'hero.metrics.proposal.description' as TranslationKey,
    href: '#case',
  },
  {
    valueKey: 'hero.metrics.moveIn.value' as TranslationKey,
    descriptionKey: 'hero.metrics.moveIn.description' as TranslationKey,
    href: '#case',
  },
  {
    valueKey: 'hero.metrics.deployments.value' as TranslationKey,
    descriptionKey: 'hero.metrics.deployments.description' as TranslationKey,
    href: '#why',
  },
];

const Hero = () => {
  const { t } = useLanguage();

  return (
    <>
      <section
        id="home"
        className="relative isolate flex items-end md:items-center bg-cover bg-center text-white min-h-[85vh] md:min-h-[600px] lg:min-h-[650px] overflow-hidden pt-20 md:pt-24"
        style={{
          backgroundImage: "url('/images/hero-kitchen-livingroom.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/10" />

        <div className="container mx-auto px-6 md:px-8 relative py-16 md:py-10">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-heading">{t('hero.tagline')}</p>
            <h1 className="text-4xl md:text-5xl font-light leading-tight">{t('hero.title')}</h1>
            <p className="text-lg md:text-xl text-white/80">{t('hero.subtitle')}</p>

            <div className="flex flex-wrap gap-3">
              {chipLinks.map(({ key, href }) => (
                <a
                  key={key}
                  href={href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm md:text-base font-light text-white/90 backdrop-blur hover:bg-white/15 transition-colors"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-[#ff6300]" />
                  {t(key)}
                </a>
              ))}
            </div>

            <div className="rounded-2xl bg-white/95 text-nordic-900 shadow-lg border border-white/30 p-4 md:p-6 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-2xl font-light text-nordic-900">+46 73-628 77 09</p>
                  <p className="text-sm text-nordic-600 mt-1">{t('hero.responseTime')}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button className="rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white px-6" asChild>
                    <a href={phoneHref}>
                      <Phone size={16} className="mr-2" />
                      {t('hero.ctaPhone')}
                    </a>
                  </Button>
                  <Button variant="outline" className="rounded-full px-6" asChild>
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle size={16} className="mr-2" />
                      {t('hero.ctaWhatsapp')}
                    </a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-nordic-600">
                <ArrowRight className="h-4 w-4 text-[#ff6300]" />
                <span>{t('hero.cta')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-b border-nordic-100" aria-label="Snabbvy">
        <div className="container mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-nordic-100">
            {heroMetrics.map(({ valueKey, descriptionKey, href }) => (
              <a
                key={valueKey}
                href={href}
                className="flex flex-col gap-2 py-6 md:py-8 md:px-8 text-nordic-900 hover:bg-nordic-50 transition-colors"
              >
                <span className="text-3xl font-light text-[#ff6300]">{t(valueKey)}</span>
                <span className="text-sm uppercase tracking-wide text-nordic-500">{t(descriptionKey)}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
