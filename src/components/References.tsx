import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const References = () => {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      id: '1',
      quote: t('references.testimonial1.quote'),
      author: t('references.testimonial1.author'),
      company: t('references.testimonial1.company'),
      img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      quote: t('references.testimonial2.quote'),
      author: t('references.testimonial2.author'),
      company: t('references.testimonial2.company'),
      img: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      quote: t('references.testimonial3.quote'),
      author: t('references.testimonial3.author'),
      company: t('references.testimonial3.company'),
      img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
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

  return <section id="references" className="py-24 bg-white nordic-texture">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-[#ff6300] mb-2 text-sm uppercase tracking-wider font-heading">
            {t('references.tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-normal mb-4 font-display">{t('references.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('references.subtitle')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={testimonial.id || index} className="overflow-hidden border border-nordic-200 shadow-none">
                <CardContent className="p-8">
                  <Quote size={24} className="text-[#ff6300] mb-6" />
                  <p className="text-nordic-800 mb-8 leading-relaxed font-light italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="mr-4">
                      <div className="w-12 h-12 bg-nordic-200 rounded-full overflow-hidden">
                        <img src={testimonial.img} alt={testimonial.author} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div>
                      <p className="font-heading">{testimonial.author}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
        
        <div className="mt-20 flex flex-wrap justify-center gap-x-14 gap-y-8">
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">70+</div>
            <p className="text-nordic-600 font-light">{t('references.stats.happyClients')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">100+</div>
            <p className="text-nordic-600 font-light">{t('references.stats.accommodations')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">3h</div>
            <p className="text-nordic-600 font-light">{t('references.stats.responseTime')}</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">40+</div>
            <p className="text-nordic-600 font-light">{t('references.stats.cities')}</p>
          </div>
        </div>
      </div>
    </section>;
};
export default References;