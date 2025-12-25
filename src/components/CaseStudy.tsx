import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/data/translations';
import { motion } from 'framer-motion';
import { MessageCircle, Phone } from 'lucide-react';
import { Button } from './ui/button';

const CASE_IMAGE = '/images/solar-park-saffle.webp';

const timeline = [
  {
    titleKey: 'case.timeline.proposal.title' as TranslationKey,
    descriptionKey: 'case.timeline.proposal.description' as TranslationKey,
  },
  {
    titleKey: 'case.timeline.moveIn.title' as TranslationKey,
    descriptionKey: 'case.timeline.moveIn.description' as TranslationKey,
  },
  {
    titleKey: 'case.timeline.expand.title' as TranslationKey,
    descriptionKey: 'case.timeline.expand.description' as TranslationKey,
  },
];

const CaseStudy = () => {
  const { t } = useLanguage();

  return (
    <section id="case" className="section-spacing bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr,400px] items-stretch">
          {/* Case Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] min-h-[600px] md:min-h-[500px] flex flex-col"
          >
            {/* Background image - positioned to show solar panels, not sky */}
            <img
              src={CASE_IMAGE}
              alt=""
              className="absolute inset-0 w-full h-full"
              style={{
                objectFit: 'cover',
                objectPosition: 'center bottom'
              }}
            />
            {/* Stronger gradient overlay on mobile for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 md:bg-black/40" />
            
            <div className="relative z-10 h-full p-8 md:p-14 flex flex-col">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white w-fit mb-6">
                {t('case.tagline')}
              </span>
              <h2 className="text-3xl md:text-5xl text-white font-display font-bold leading-tight max-w-2xl">{t('case.title')}</h2>
              <p className="text-lg md:text-xl text-white/80 mt-4 font-light">{t('case.subtitle')}</p>

              <ol className="mt-12 space-y-10">
                {timeline.map(({ titleKey, descriptionKey }, index) => (
                  <motion.li 
                    key={titleKey} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 border-accent bg-white flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                      </div>
                      {index < timeline.length - 1 && <div className="flex-1 w-px bg-white/20 mt-2" />}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white mb-1">{t(titleKey)}</p>
                      <p className="text-base text-white/70 font-medium leading-relaxed">{t(descriptionKey)}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.div>

          {/* Personality Contact Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-full"
          >
            <div className="absolute -inset-1 bg-accent/20 rounded-[2.5rem] blur-2xl opacity-10" />
            
            <div className="relative h-full rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-primary/5 p-8 md:p-10 flex flex-col items-center text-center overflow-hidden">
              {/* Decorative top shape */}
              <div className="absolute top-0 left-0 w-full h-32 bg-accent/5 -z-0" />
              
              {/* Profile Images */}
              <div className="relative z-10 flex items-center justify-center mb-10 -space-x-4">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden rotate-[-4deg]">
                  <img src="/images/nathalie.jpg" alt="Nathalie" className="w-full h-full object-cover" />
                </div>
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden rotate-[4deg]">
                  <img src="/images/kajsa.jpg" alt="Kajsa" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="relative z-10 flex-grow flex flex-col">
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4 leading-snug">
                  {t('case.cta.question')}
                </h3>
                <p className="text-primary/60 font-medium mb-10 text-lg">
                  Vi hjälper dig hela vägen. Hör av dig till oss direkt för ett personligt svar!
                </p>

                <div className="mt-auto space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      className="rounded-2xl h-14 border-primary/10 hover:bg-primary/5 hover:text-primary/80 text-primary/80 font-bold text-base transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                      asChild
                    >
                      <a href="https://wa.me/46762498486" target="_blank" rel="noreferrer">
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="rounded-2xl h-14 border-primary/10 hover:bg-primary/5 hover:text-primary/80 text-primary/80 font-bold text-base transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                      asChild
                    >
                      <a href="sms:+46762498486">
                        <MessageCircle size={18} />
                        SMS
                      </a>
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full rounded-2xl h-14 bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white font-bold text-base transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    asChild
                  >
                    <a href="tel:+46762498486">
                      <Phone size={18} />
                      Ring direkt: 076-249 84 86
                    </a>
                  </Button>
                  
                  <p className="text-[11px] font-bold text-primary/30 uppercase tracking-[0.2em] mt-6">
                    Svar inom 15 minuter
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudy;

