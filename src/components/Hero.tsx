import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/data/translations';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react';

const heroHighlights: TranslationKey[] = ['hero.bullet1', 'hero.bullet2', 'hero.bullet3'];
const phoneHref = 'tel:+46736287709';
const whatsappHref = 'https://wa.me/46736287709';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative bg-cover bg-center text-nordic-900 pt-36 pb-24 md:pb-36 overflow-hidden nordic-texture"
      style={{
        backgroundImage: "url('/images/hero-kitchen-livingroom.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/10" />

      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="max-w-2xl nordic-card p-8 md:p-10 border border-nordic-200">
          <span className="inline-block text-nordic-500 mb-3 text-sm uppercase tracking-wider font-heading">
            {t('hero.tagline')}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight text-nordic-900">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg text-nordic-800 mb-8 leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>

          <ul className="space-y-3 mb-8">
            {heroHighlights.map((key) => (
              <li key={key} className="flex items-start gap-3 text-base md:text-lg text-nordic-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-nordic-500" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-nordic-500 hover:bg-nordic-600 text-white rounded-md px-6 py-2.5 h-auto font-light transition-colors duration-500"
              asChild
            >
              <a href={phoneHref}>
                <Phone size={16} className="mr-2" />
                {t('hero.ctaPhone')}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-md px-6 py-2.5 h-auto font-light border-nordic-300 text-nordic-900 hover:bg-white/60"
              asChild
            >
              <a href={whatsappHref} target="_blank" rel="noreferrer">
                <MessageCircle size={16} className="mr-2" />
                {t('hero.ctaWhatsapp')}
              </a>
            </Button>
          </div>

          <p className="mt-5 text-sm text-nordic-700">{t('hero.ctaSubtext')}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
