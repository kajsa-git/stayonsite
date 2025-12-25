import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Home, UserCheck, CreditCard } from 'lucide-react';

const HomeownerProcess = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Home size={32} className="text-accent" />,
      title: t('homeowner.process.step1.title'),
      description: t('homeowner.process.step1.description')
    },
    {
      icon: <UserCheck size={32} className="text-accent" />,
      title: t('homeowner.process.step3.title'),
      description: "Baserat på din bostad och tillgänglighet hittar vi en perfekt matchning bland våra företagskunder."
    },
    {
      icon: <CreditCard size={32} className="text-accent" />,
      title: t('homeowner.process.step4.title'),
      description: t('homeowner.process.step4.description')
    }
  ];

  return (
    <section className="section-spacing bg-primary text-white overflow-hidden relative">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold mb-6"
          >
            {t('homeowner.process.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed"
          >
            {t('homeowner.process.subtitle')}
          </motion.p>
        </div>

        {/* Process steps */}
        <div className="grid lg:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-[60px] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group z-10"
            >
              <div className="w-24 h-24 mb-8 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-accent/20 group-hover:border-accent/40">
                <div className="relative">
                  {step.icon}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-display font-bold mb-4 tracking-tight">
                {step.title}
              </h3>
              <p className="text-white/60 font-medium leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeownerProcess;
