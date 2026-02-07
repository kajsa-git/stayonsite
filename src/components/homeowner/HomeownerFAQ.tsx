import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Phone, HelpCircle } from 'lucide-react';

const HomeownerFAQ = () => {
  const { t } = useLanguage();

  const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({
    question: t(`homeowner.faq.question${i}`),
    answer: t(`homeowner.faq.answer${i}`),
  }));

  return (
    <section className="section-spacing bg-secondary/30 relative">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/5 text-primary/60 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <HelpCircle size={14} />
            {t('homeowner.faq.sectionLabel')}
          </motion.div>
          <h2
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
          >
            {t('homeowner.faq.title')}
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary/60 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {t('homeowner.faq.subtitle')}
          </motion.p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="bg-white rounded-3xl shadow-sm border border-primary/5 px-8 transition-all duration-300 hover:shadow-md overflow-hidden"
                >
                  <AccordionTrigger className="text-left text-lg md:text-xl font-display font-bold text-primary hover:text-accent transition-colors py-7 no-underline hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-primary/70 font-medium text-[16px] md:text-[17px] leading-relaxed pb-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <p className="text-primary/60 font-medium mb-6">
            {t('homeowner.faq.contactPrompt')}
          </p>
          <a 
                          href="tel:+46762498486"            className="group inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg border border-primary/5 text-primary font-bold transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
              <Phone size={18} />
            </div>
            <span className="text-lg">076-249 84 86</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerFAQ;
