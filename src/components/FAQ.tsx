import { useLanguage } from '@/contexts/LanguageContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const { t } = useLanguage();

  const faqData = [
    {
      question: t('faq.question1'),
      answer: t('faq.answer1')
    },
    {
      question: t('faq.question2'),
      answer: t('faq.answer2')
    },
    {
      question: t('faq.question3'),
      answer: t('faq.answer3')
    },
    {
      question: t('faq.question4'),
      answer: t('faq.answer4')
    },
    {
      question: t('faq.question5'),
      answer: t('faq.answer5')
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <section id="faq" className="section-spacing bg-gradient-to-b from-white to-nordic-100 border-t border-nordic-100">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ff6300] mb-2 text-sm uppercase tracking-[0.35em] font-heading">
            {t('faq.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-nordic-100 rounded-xl px-6 bg-white shadow-sm hover:border-[#ff6300]/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold text-nordic-900 hover:text-[#ff6300] py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-nordic-700 font-light leading-relaxed pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
