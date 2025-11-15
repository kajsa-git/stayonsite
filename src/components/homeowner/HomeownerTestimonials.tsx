import { useLanguage } from '@/contexts/LanguageContext';

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
      income: t('homeowner.testimonials.testimonial2.income')
    },
    {
      quote: t('homeowner.testimonials.testimonial3.quote'),
      author: t('homeowner.testimonials.testimonial3.author'),
      location: t('homeowner.testimonials.testimonial3.location'),
      income: t('homeowner.testimonials.testimonial3.income')
    }
  ];

  return (
    <section className="section-spacing bg-white border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-6">
            {t('homeowner.testimonials.title')}
          </h2>
          <p className="text-base md:text-lg text-nordic-700 font-light max-w-2xl mx-auto leading-relaxed">
            {t('homeowner.testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-nordic-100">
              {/* Quote icon */}
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#ff6300]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>
              
              {/* Quote */}
              <p className="text-nordic-800 font-light leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>
              
              {/* Author info */}
              <div className="border-t border-nordic-200 pt-6">
                <p className="font-semibold text-nordic-900 mb-1">
                  {testimonial.author}
                </p>
                <p className="text-nordic-700 font-light text-sm mb-2">
                  {testimonial.location}
                </p>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                  {testimonial.income}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicator */}
        <div className="text-center mt-16 p-8 bg-nordic-100 rounded-2xl">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#ff6300] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-2xl font-semibold text-nordic-900">
              {t('homeowner.testimonials.trustIndicator')}
            </span>
          </div>
          <p className="text-nordic-700 font-light">
            {t('homeowner.testimonials.trustDescription')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HomeownerTestimonials;
