import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HomeownerFAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('homeowner.faq.question1'),
      answer: t('homeowner.faq.answer1')
    },
    {
      question: t('homeowner.faq.question2'),
      answer: t('homeowner.faq.answer2')
    },
    {
      question: t('homeowner.faq.question4'),
      answer: t('homeowner.faq.answer4')
    },
    {
      question: t('homeowner.faq.question5'),
      answer: t('homeowner.faq.answer5')
    },
    {
      question: t('homeowner.faq.question6'),
      answer: t('homeowner.faq.answer6')
    }
  ];

  return (
    <section className="section-spacing bg-gradient-to-br from-gray-50 to-gray-100 border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-light text-nordic-900 mb-6">
            {t('homeowner.faq.title')}
          </h2>
          <p className="text-xl text-nordic-800 font-light max-w-3xl mx-auto leading-relaxed">
            {t('homeowner.faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left text-lg font-display text-nordic-900 hover:text-amber-600 transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-nordic-700 font-light leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <p className="text-nordic-700 font-light mb-4">
            {t('homeowner.faq.contactPrompt')}
          </p>
          <a 
            href="tel:+46736287709" 
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            073-628 77 09
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomeownerFAQ;
