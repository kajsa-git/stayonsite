import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

const HomeownerAbout = () => {
  const { t } = useLanguage();

  return (
    <section className="section-spacing bg-primary text-white overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Photos side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-6"
            >
              {/* Kajsa portrait */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                  <img src="/images/kajsa.webp" alt="Kajsa - grundare StayOnSite" loading="lazy" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-white/80">{t('homeowner.about.kajsa')}</p>
              </div>

              {/* Team photo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-sm"
              >
                <div className="rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                  <img src="/images/team.webp" alt="StayOnSite Team" loading="lazy" className="w-full h-auto object-cover" />
                </div>
                <p className="text-center text-sm font-bold text-white/60 mt-3">{t('homeowner.about.team')}</p>
              </motion.div>
            </motion.div>

            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm mb-6">
                <span className="h-px w-8 bg-accent" />
                {t('homeowner.about.subtitle')}
              </div>

              <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                {t('homeowner.about.title')}
              </h2>

              <p className="text-xl text-white/70 font-light leading-relaxed mb-10">
                {t('homeowner.about.message')}
              </p>

              {/* CTA */}
              <a
                href="tel:+46762498486"
                className="group inline-flex items-center gap-4 bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-5 rounded-full transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-display font-bold text-lg">{t('homeowner.about.cta')}</p>
                  <p className="text-white/60 text-sm font-medium">076-249 84 86</p>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeownerAbout;
