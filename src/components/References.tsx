import { useLanguage } from '@/contexts/LanguageContext';
import { Quote } from 'lucide-react';

const References = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: '1',
      quote: t('references.testimonial1.quote'),
      author: t('references.testimonial1.author'),
      company: t('references.testimonial1.company'),
      img: '/images/mats-testimonial.jpg'
    },
    {
      id: '2',
      quote: t('references.testimonial2.quote'),
      author: t('references.testimonial2.author'),
      company: t('references.testimonial2.company'),
      img: '/images/sara-testimonial.jpg'
    },
    {
      id: '3',
      quote: t('references.testimonial3.quote'),
      author: t('references.testimonial3.author'),
      company: t('references.testimonial3.company'),
      img: '/images/erik-testimonial.jpg'
    }
  ];

  // Schema.org structured data for reviews
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StayOnSite",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": testimonials.length.toString(),
      "bestRating": "5"
    },
    "review": testimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.author
      },
      "reviewBody": testimonial.quote,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }))
  };

  return (
    <section id="references" className="section-spacing bg-gradient-to-b from-white to-nordic-100 border-t border-nordic-100">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ff6300] mb-2 text-sm uppercase tracking-[0.35em] font-heading">
            {t('references.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">{t('references.title')}</h2>
          <p className="text-base md:text-lg text-nordic-700 max-w-2xl mx-auto font-light">
            {t('references.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id || index}
                className="bg-white rounded-2xl p-8 border border-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <Quote size={24} className="text-[#ff6300] mb-6" />
                <p className="text-nordic-800 mb-8 leading-relaxed font-light italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-nordic-200 rounded-full overflow-hidden ring-2 ring-white">
                    <img
                      src={testimonial.img}
                      alt={testimonial.author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-nordic-900">{testimonial.author}</p>
                    <p className="text-sm text-nordic-600 font-light">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-2">VÅRT TRACK RECORD</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#ff6300] mb-2">70+</div>
              <p className="text-sm text-nordic-900 font-light uppercase tracking-wide">{t('references.stats.happyClients')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#ff6300] mb-2">500+</div>
              <p className="text-sm text-nordic-900 font-light uppercase tracking-wide">{t('references.stats.accommodations')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#ff6300] mb-2">3h</div>
              <p className="text-sm text-nordic-900 font-light uppercase tracking-wide">{t('references.stats.responseTime')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#ff6300] mb-2">40+</div>
              <p className="text-sm text-nordic-900 font-light uppercase tracking-wide">{t('references.stats.cities')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default References;
