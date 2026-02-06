import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Headphones, CheckCircle2 } from 'lucide-react';

const HomeownerGuarantee = () => {
  const { t } = useLanguage();

  const guarantees = [
    {
      icon: <CreditCard size={32} className="text-accent" />,
      title: t('homeowner.guarantee.payment.title'),
      description: t('homeowner.guarantee.payment.description')
    },
    {
      icon: <ShieldCheck size={32} className="text-accent" />,
      title: t('homeowner.guarantee.protection.title'),
      description: t('homeowner.guarantee.protection.description')
    },
    {
      icon: <Headphones size={32} className="text-accent" />,
      title: t('homeowner.guarantee.support.title'),
      description: t('homeowner.guarantee.support.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="section-spacing bg-secondary/30 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-accent/5 skew-x-12 transform origin-bottom -translate-x-1/2" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <ShieldCheck size={14} />
            {t('homeowner.guarantee.title')}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
          >
            {t('homeowner.guarantee.subtitle')}
          </motion.h2>
        </div>

        {/* Guarantees grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          {guarantees.map((guarantee, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="glass-card p-10 rounded-3xl text-center"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-inner">
                {guarantee.icon}
              </div>
              <h3 className="text-2xl font-display font-bold text-primary mb-4 leading-tight">
                {guarantee.title}
              </h3>
              <p className="text-primary/70 font-medium leading-relaxed">
                {guarantee.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg border border-primary/5">
            <CheckCircle2 size={24} className="text-accent" />
            <div className="text-left">
              <p className="font-display font-bold text-primary">{t('homeowner.guarantee.badge')}</p>
              <p className="text-sm text-primary/60 font-medium">{t('homeowner.guarantee.badgeDescription')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerGuarantee;
