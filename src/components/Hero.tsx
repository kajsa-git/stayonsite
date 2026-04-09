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
      className="relative isolate flex items-center min-h-screen overflow-hidden pt-20 bg-primary"
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

      {/* Decorative glow */}
      <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-20 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-14 max-w-6xl mx-auto">

          {/* Left: copy */}
          <div className="flex-1">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl mb-4 lg:mb-6">
              {t('hero.title')}
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed mb-4 lg:mb-6">
              {t('hero.subtitle')}
            </p>

            <div className="flex items-center gap-2 mb-4 lg:mb-10">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#ff6300] text-[#ff6300]" />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">{RATING_VALUE}</span>
              <span className="text-sm text-white/50">Google</span>
            </div>

            {/* CTA-knappar: endast desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="hidden lg:flex flex-row gap-4"
            >
              <Button
                className="group rounded-full h-14 px-8 bg-accent hover:bg-accent text-white text-base font-bold shadow-2xl shadow-accent/40 transition-all duration-500 hover:scale-105 active:scale-95"
                asChild
              >
                <a href={phoneHref} className="flex items-center gap-3">
                  <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                  {t('hero.ctaPhone')}
                </a>
              </Button>
              <Button
                variant="outline"
                className="group rounded-full h-14 px-8 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/60 text-base font-semibold backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl"
                asChild
              >
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                  <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                  {t('hero.ctaWhatsapp')}
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[500px] lg:flex-shrink-0"
          >
            <HeroIntentForm />
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
