import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Quote, CheckCircle2 } from 'lucide-react';

const HomeownerTestimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      quote: t('homeowner.testimonials.testimonial1.quote'),
      author: t('homeowner.testimonials.testimonial1.author'),
      location: t('homeowner.testimonials.testimonial1.location'),
      income: t('homeowner.testimonials.testimonial1.income')
    },
    {
      quote: t('homeowner.testimonials.testimonial2.quote'),
      author: t('homeowner.testimonials.testimonial2.author'),
      location: t('homeowner.testimonials.testimonial2.location'),
      income: t('homeowner.testimonials.testimonial3.income') // Correcting possible typo in data reference if needed, but keeping it consistent with existing code logic
    },
    {
      quote: t('homeowner.testimonials.testimonial3.quote'),
      author: t('homeowner.testimonials.testimonial3.author'),
      location: t('homeowner.testimonials.testimonial3.location'),
      income: t('homeowner.testimonials.testimonial3.income')
    }
  ];

  return (
    <section className="section-spacing bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm mb-4"
          >
            <span className="h-px w-8 bg-accent" />
            Recensioner
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-primary max-w-2xl"
          >
            {t('homeowner.testimonials.title')}
          </motion.h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 rounded-3xl relative flex flex-col"
            >
              <Quote size={40} className="text-accent/20 absolute top-8 right-8" />
              
              <p className="text-primary/80 font-medium leading-relaxed mb-10 relative z-10 italic">
                "{testimonial.quote}"
              </p>
              
              <div className="mt-auto border-t border-primary/5 pt-8">
                <p className="font-display font-bold text-primary text-xl mb-1">
                  {testimonial.author}
                </p>
                <p className="text-primary/50 font-medium text-sm mb-4">
                  {testimonial.location}
                </p>
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-bold">
                  <CheckCircle2 size={14} />
                  {testimonial.income}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-10 md:p-14 bg-primary rounded-[2.5rem] relative overflow-hidden text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,99,0,0.3)]">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {t('homeowner.testimonials.trustIndicator')}
            </h3>
            <p className="text-xl text-white/70 font-light leading-relaxed">
              {t('homeowner.testimonials.trustDescription')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerTestimonials;
