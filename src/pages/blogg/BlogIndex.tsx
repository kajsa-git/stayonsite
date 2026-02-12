import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts } from '@/data/blog-posts';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const BlogIndex = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': t('Blogg \u2014 StayOnSite', 'Blog \u2014 StayOnSite', 'Blog \u2014 StayOnSite'),
    'description': t('Artiklar om personalboende, f\u00f6retagsbost\u00e4der, nya lagar och marknadstrender i Sverige.', 'Articles about worker accommodation, corporate housing, new regulations and market trends in Sweden.', 'Artyku\u0142y o zakwaterowaniu pracowniczym i trendach rynkowych w Szwecji.'),
    'url': 'https://stayonsite.se/blogg',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [...blogPosts]
        .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
        .map((post, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'url': `https://stayonsite.se/blogg/${post.slug}`,
          'name': post.title[language] || post.title.sv,
        })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t('Blogg \u2014 Personalboende & F\u00f6retagsbost\u00e4der | StayOnSite', 'Blog \u2014 Worker Accommodation & Corporate Housing | StayOnSite', 'Blog \u2014 Zakwaterowanie pracownicze | StayOnSite')}
        description={t('Artiklar om personalboende, f\u00f6retagsbost\u00e4der, nya lagar och marknadstrender i Sverige.', 'Articles about worker accommodation, corporate housing, new regulations and market trends in Sweden.', 'Artyku\u0142y o zakwaterowaniu pracowniczym i trendach rynkowych w Szwecji.')}
        canonical="https://stayonsite.se/blogg"
        structuredData={collectionSchema}
      />
      <Header />
      <main className="flex-grow">
        <section className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t('Blogg', 'Blog', 'Blog')}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              {t(
                'Artiklar om personalboende, uthyrning, nya lagar och marknadstrender.',
                'Articles about worker accommodation, rentals, new regulations and market trends.',
                'Artyku\u0142y o zakwaterowaniu, wynajmie i trendach rynkowych.'
              )}
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...blogPosts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).map((post) => {
                const title = post.title[language] || post.title.sv;
                const desc = post.description[language] || post.description.sv;
                return (
                  <Link
                    key={post.slug}
                    to={`/blogg/${post.slug}`}
                    className="group bg-white rounded-2xl border border-nordic-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-accent/30 flex flex-col"
                  >
                    <div className="p-8 flex-grow">
                      <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        {post.category}
                      </span>
                      <h2 className="font-display text-xl font-bold text-nordic-900 mb-3 group-hover:text-accent transition-colors">
                        {title}
                      </h2>
                      <p className="text-nordic-600 text-sm leading-relaxed mb-6">
                        {desc}
                      </p>
                    </div>
                    <div className="px-8 pb-6 flex items-center justify-between text-sm text-nordic-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Calendar size={13} />{post.publishedDate}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} />{post.readingTime} min</span>
                      </div>
                      <ArrowRight size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default BlogIndex;
