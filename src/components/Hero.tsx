'use client'

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Phone, Star } from 'lucide-react';
import { RATING_VALUE } from '@/data/constants';
import { motion } from 'framer-motion';
import HeroIntentForm from '@/components/HeroIntentForm';
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/gtag';

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
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white drop-shadow-2xl mb-4 lg:mb-6">
              {t('hero.title')}
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-white/80 font-light leading-relaxed mb-4 lg:mb-6">
              {t('hero.subtitle')}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Google">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm text-white/80">{RATING_VALUE} på Google</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#FBBC04] text-[#FBBC04]" />
                ))}
              </div>
            </div>

            {/* Sekundär ingång för husägare — formuläret ovan är B2B-riktat */}
            <Link
              href="/for-husagare"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-accent transition-colors mb-4 lg:mb-10"
            >
              {t('hero.homeownerLink')}
              <ArrowRight size={14} className="text-accent" />
            </Link>

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
                <a href={phoneHref} onClick={trackPhoneClick} className="flex items-center gap-3">
                  <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                  {t('hero.ctaPhone')}
                </a>
              </Button>
              <Button
                variant="outline"
                className="group rounded-full h-14 px-8 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/60 text-base font-semibold backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl"
                asChild
              >
                <a href={whatsappHref} onClick={trackWhatsAppClick} target="_blank" rel="noreferrer" className="flex items-center gap-3">
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
