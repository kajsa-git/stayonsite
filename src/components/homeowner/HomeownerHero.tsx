import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const HomeownerHero = () => {
  const { t } = useLanguage();
  
  const scrollToForm = () => {
    const formElement = document.getElementById('homeowner-form');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      id="hero"
      className="relative isolate flex items-center min-h-[80vh] md:min-h-[700px] overflow-hidden pt-24 md:pt-32 bg-primary"
    >
      {/* Background Image with subtle movement */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/hero-main.webp')`
        }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/95 via-primary/60 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[1px]" />

      <div className="container mx-auto px-6 md:px-12 relative z-20">
        <div className="max-w-4xl">
          {/* Tagline Pill */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-xl shadow-2xl mb-10"
          >
            <Sparkles size={16} className="text-accent animate-pulse" />
            <span className="tracking-[0.1em] uppercase">FÖR DIG SOM ÄGER BOENDE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-[72px] lg:text-[84px] font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl mb-8"
          >
            {t('homeowner.hero.title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-12"
          >
            {t('homeowner.hero.subtitle')}
          </motion.p>

          {/* Income Calculator / CTA Box */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative group max-w-2xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent/50 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative rounded-3xl bg-white/95 text-primary shadow-2xl border border-white/20 p-8 md:p-10 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-accent uppercase tracking-widest">Beräknad intäkt</p>
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
                    8 000 – 25 000 kr <span className="text-xl font-medium text-primary/60">/ mån</span>
                  </p>
                  <p className="text-primary/70 font-medium italic">Garanterad hyra varje månad</p>
                </div>
                <Button 
                  onClick={scrollToForm} 
                  className="rounded-full bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white px-10 h-16 text-lg font-bold transition-all duration-500 hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  {t('homeowner.hero.cta')}
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeownerHero;
