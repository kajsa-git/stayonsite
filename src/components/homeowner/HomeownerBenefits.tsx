'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { DollarSign, ShieldCheck, Clock, HandCoins } from 'lucide-react';

const HomeownerBenefits = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: <DollarSign size={32} className="text-accent" />,
      title: t('homeowner.benefits.income.title'),
      description: t('homeowner.benefits.income.description')
    },
    {
      icon: <ShieldCheck size={32} className="text-accent" />,
      title: t('homeowner.benefits.security.title'),
      description: t('homeowner.benefits.security.description')
    },
    {
      icon: <Clock size={32} className="text-accent" />,
      title: t('homeowner.benefits.flexibility.title'),
      description: t('homeowner.benefits.flexibility.description')
    },
    {
      icon: <HandCoins size={32} className="text-accent" />,
      title: t('homeowner.benefits.guarantee.title'),
      description: t('homeowner.benefits.guarantee.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
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
    <section className="section-spacing bg-white relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12 transform origin-top translate-x-1/2" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm mb-4"
          >
            <span className="h-px w-8 bg-accent" />
            {t('homeowner.benefits.sectionLabel')}
          </motion.div>
          <h2
            className="text-4xl md:text-5xl font-display font-bold text-primary max-w-2xl"
          >
            {t('homeowner.benefits.title')}
          </h2>
        </div>

        {/* Benefits grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="glass-card p-10 rounded-3xl"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-display font-bold text-primary mb-4 leading-tight">
                {benefit.title}
              </h3>
              <p className="text-primary/70 font-medium leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerBenefits;
