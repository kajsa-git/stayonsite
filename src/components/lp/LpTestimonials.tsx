import { useLanguage } from '@/contexts/LanguageContext';
import { Quote } from 'lucide-react';
import type { TranslationKey } from '@/data/translations';

const LpTestimonials = () => {
  const { t } = useLanguage();

  const testimonials = [1, 2, 3].map((i) => ({
    quote: t(`homeowner.testimonials.testimonial${i}.quote` as TranslationKey),
    author: t(`homeowner.testimonials.testimonial${i}.author` as TranslationKey),
    location: t(`homeowner.testimonials.testimonial${i}.location` as TranslationKey),
    income: t(`homeowner.testimonials.testimonial${i}.income` as TranslationKey),
  }));

  return (
    <section className="bg-white py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-display font-bold text-primary text-center mb-6">
          {t('homeowner.testimonials.title')}
        </h2>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="min-w-[280px] md:min-w-0 snap-center bg-slate-50 rounded-2xl p-5 border border-primary/5 relative flex flex-col"
            >
              <Quote size={24} className="text-accent/15 absolute top-4 right-4" />
              <p className="text-sm text-primary/80 leading-relaxed mb-4 line-clamp-4">
                "{item.quote}"
              </p>
              <div className="mt-auto pt-3 border-t border-primary/5">
                <div className="font-bold text-sm text-primary">{item.author}</div>
                <div className="text-xs text-primary/50">{item.location}</div>
                <div className="inline-block mt-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                  {item.income}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LpTestimonials;
