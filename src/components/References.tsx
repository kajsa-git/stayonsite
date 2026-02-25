import { useLanguage } from '@/contexts/LanguageContext';
import { RATING_VALUE, REVIEW_COUNT, BEST_RATING } from '@/data/constants';
import { Star } from 'lucide-react';

const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?q=Stayonsite+AB';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const StarRating = () => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const References = () => {
  const { t } = useLanguage();

  const reviews = [
    {
      quote: t('references.testimonial1.quote'),
      author: t('references.testimonial1.author'),
    },
    {
      quote: t('references.testimonial2.quote'),
      author: t('references.testimonial2.author'),
    },
    {
      quote: t('references.testimonial3.quote'),
      author: t('references.testimonial3.author'),
    },
    {
      quote: t('references.testimonial4.quote'),
      author: t('references.testimonial4.author'),
    },
  ];

  // Schema.org structured data for reviews
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StayOnSite",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": RATING_VALUE,
      "reviewCount": REVIEW_COUNT,
      "bestRating": BEST_RATING
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author
      },
      "reviewBody": review.quote,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }))
  };

  return (
    <section id="references" className="section-spacing bg-gradient-to-b from-white to-nordic-100">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <StarRating />
                <p className="text-nordic-800 mt-4 mb-8 leading-relaxed font-light italic flex-1">
                  "{review.quote}"
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-nordic-900">{review.author}</p>
                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Google-recension"
                  >
                    <GoogleIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Google review link */}
          <div className="text-center mt-8">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-nordic-600 hover:text-nordic-900 transition-colors font-light"
            >
              <GoogleIcon />
              <span>5.0 på Google</span>
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                ))}
              </span>
            </a>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-2">VÅRT TRACK RECORD</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-semibold text-[#ff6300] mb-2">100+</div>
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
