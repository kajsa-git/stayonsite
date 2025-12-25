import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationKey } from '@/data/translations';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const phoneHref = 'tel:+46762498486';
const whatsappHref = 'https://wa.me/46762498486';

const bulletPoints: Array<TranslationKey> = [
  'hero.bullet1',
  'hero.bullet2',
  'hero.bullet3',
];

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative isolate flex items-center min-h-[90vh] md:min-h-[900px] overflow-hidden pt-20 bg-primary"
    >
      {/* Background Image with subtle parallax-like scale effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero-main.jpg')",
        }}
      />
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-90" />

      {/* Animated Decorative Elements for Depth */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]"
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-20 h-full flex items-center">
        <div className="max-w-[840px] pt-12">
          

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-[82px] lg:text-[96px] font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl mb-8"
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl text-xl md:text-[24px] text-white/80 font-light leading-relaxed mb-12"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Premium CTA Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Button 
              className="group rounded-full h-16 px-10 bg-accent hover:bg-accent text-white text-lg font-bold shadow-2xl shadow-accent/40 transition-all duration-500 hover:scale-105 active:scale-95" 
              asChild
            >
              <a href={phoneHref} className="flex items-center gap-3">
                <Phone size={22} className="group-hover:rotate-12 transition-transform" />
                {t('hero.ctaPhone')}
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="group rounded-full h-16 px-10 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/60 text-lg font-semibold backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl" 
              asChild
            >
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
                {t('hero.ctaWhatsapp')}
              </a>
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="pt-16 mt-16"
          >
            <div className="flex flex-wrap gap-x-12 gap-y-6">
                {bulletPoints.map((key, index) => (
                <div key={key} className="flex items-center gap-4 text-white/70 font-medium group cursor-default">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    <ArrowRight size={14} />
                  </div>
                  <span className="text-lg group-hover:text-white transition-colors">{t(key)}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
