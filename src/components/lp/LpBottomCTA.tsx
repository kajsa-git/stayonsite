'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowUp, Phone } from 'lucide-react';

const LpBottomCTA = () => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    document.getElementById('lp-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-primary py-12 px-4">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
          {t('lp.husagare.bottomCta.title')}
        </h2>

        <Button
          onClick={scrollToForm}
          className="w-full sm:w-auto bg-gradient-to-r from-[#ff6300] to-[#ff8533] text-white font-bold h-14 px-10 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
        >
          <span className="text-base">{t('lp.husagare.bottomCta.button')}</span>
          <ArrowUp size={18} />
        </Button>

        <div className="mt-6 flex items-center justify-center gap-2">
          <Phone size={14} className="text-white/50" />
          <a
            href="tel:+46762498486"
            className="text-sm text-white/60 hover:text-white transition-colors font-medium"
          >
            076-249 84 86
          </a>
        </div>
      </div>
    </section>
  );
};

export default LpBottomCTA;
