'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Star } from 'lucide-react';
import { RATING_VALUE } from '@/data/constants';
import { motion } from 'framer-motion';
import HeroIntentForm from '@/components/HeroIntentForm';

const phoneHref = 'tel:+46762498486';
const whatsappHref = 'https://wa.me/46762498486';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative isolate flex items-center min-h-[90vh] md:min-h-[900px] overflow-hidden pt-20 bg-primary"
    >
      {/* Background Image - using <img> for SEO (alt text) and better LCP */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/images/hero-home.webp"
          alt="Möblerat personalboende för byggarbetare i Sverige – StayOnSite"
          {...{ fetchpriority: 'high' } as any}
          className="w-full h-full object-cover object-center"
        />
      </motion.div>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-90" />

      {/* Static decorative elements - simplified for better Safari performance */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-20 h-full flex items-center">
        <div className="max-w-[840px] pt-12">
          

          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl mb-8"
          >
            {t('hero.title')}
          </h1>
          
          <p
            className="max-w-2xl text-xl md:text-[24px] text-white/80 font-light leading-relaxed mb-6"
          >
            {t('hero.subtitle')}
          </p>

          <div className="flex items-center gap-2 mb-10">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#ff6300] text-[#ff6300]" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white">{RATING_VALUE}</span>
            <span className="text-sm text-white/50">Google</span>
          </div>

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

          <HeroIntentForm />

        </div>
      </div>
    </section>
  );
};

export default Hero;
