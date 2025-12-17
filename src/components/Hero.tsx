import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/data/translations';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';

const phoneHref = 'tel:+46736287709';
const whatsappHref = 'https://wa.me/46736287709';

const bulletPoints: Array<TranslationKey> = [
  'hero.bullet1',
  'hero.bullet2',
  'hero.bullet3',
];

const Hero = () => {
  const { t } = useLanguage();

  return (
    <>
      <section
        id="home"
        className="relative isolate flex items-end md:items-center bg-cover bg-center text-white min-h-[65vh] md:min-h-[480px] lg:min-h-[520px] overflow-hidden pt-20 md:pt-24"
        style={{
          backgroundImage: "url('/images/hero-kitchen-livingroom.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

        <div className="container mx-auto px-6 md:px-8 relative py-16 md:py-10">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl md:text-[44px] font-semibold leading-tight">{t('hero.title')}</h1>
            <p className="max-w-2xl text-base md:text-lg text-white/75">{t('hero.subtitle')}</p>

            <div className="flex flex-wrap gap-3">
              {bulletPoints.map((key) => (
                <div
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm md:text-base font-light text-white/90 backdrop-blur"
                >
                  <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#ff6300]" />
                  {t(key)}
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/95 text-nordic-900 shadow-lg border border-white/30 p-4 md:p-6 space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-2xl font-light text-nordic-900">+46 73-628 77 09</p>
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
