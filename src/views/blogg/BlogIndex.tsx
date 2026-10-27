'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts, getBlogPost } from '@/data/blog-posts';
import { DATACENTER_PATHS } from '@/data/datacenter';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, ShieldCheck, User } from 'lucide-react';

const BlogIndex = () => {
  const { language } = useLanguage();
  const { t: tr } = useTranslation();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  // På /en/blog listas bara artiklar som finns översatta
  const visiblePosts = language === 'en' ? blogPosts.filter((p) => p.en) : blogPosts;
  const postHref = (post: (typeof blogPosts)[number]) =>
    language === 'en' && post.en ? `/en/blog/${post.en.slug}` : `/blogg/${post.slug}`;
  const indexUrl = language === 'en' ? 'https://www.stayonsite.se/en/blog' : 'https://www.stayonsite.se/blogg';

  const topics = [
    {
      title: tr('blog.datacenter.title'),
      description: tr('blog.datacenter.text'),
      href: DATACENTER_PATHS[language],
      label: tr('blog.datacenter.link'),
      slugs: language === 'en' ? [] : ['datacenter-montorboende-guide-2026', 'personalboende-dalarna-falun-borlange-ludvika'],
    },
    {
      title: tr('blog.planning.title'),
      description: tr('blog.planning.text'),
      href: language === 'en' ? '/en/corporate-housing-sweden' : language === 'pl' ? '/pl/zakwaterowanie-firmowe' : '/projektboende',
      label: tr('blog.planning.link'),
      slugs: language === 'en'
        ? ['personalboende-vs-hotell-kostnad-jamforelse', 'personalboende-vanliga-fragor-byggforetag']
        : ['checklista-personalboende-boendebrief', 'personalboende-vs-hotell-kostnad-jamforelse'],
    },
    ...(language === 'sv' ? [{
      title: tr('blog.owners.title'),
      description: tr('blog.owners.text'),
      href: '/for-husagare',
      label: tr('blog.owners.link'),
      slugs: ['sa-fungerar-det-fran-intresse-till-forsta-hyran', 'forsakring-ansvar-personalboende-guide-2026'],
    }] : []),
  ];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': tr('blog.heading'),
    'description': tr('blog.intro'),
    'url': indexUrl,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': [...visiblePosts]
        .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
        .map((post, i) => ({
          '@type': 'ListItem',
          'position': i + 1,
          'url': `https://www.stayonsite.se${postHref(post)}`,
          'name': post.title[language] || post.title.sv,
        })),
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={t('Blogg \u2014 Personalboende & F\u00f6retagsbost\u00e4der | StayOnSite', 'Blog \u2014 Worker Accommodation & Corporate Housing | StayOnSite', 'Blog \u2014 Zakwaterowanie pracownicze | StayOnSite')}
        description={t('Artiklar om personalboende, f\u00f6retagsbost\u00e4der, nya lagar och marknadstrender i Sverige.', 'Articles about worker accommodation, corporate housing, new regulations and market trends in Sweden.', 'Artyku\u0142y o zakwaterowaniu pracowniczym i trendach rynkowych w Szwecji.')}
        canonical="https://www.stayonsite.se/blogg"
        structuredData={collectionSchema}
        hreflangs={[
          { lang: 'sv', href: 'https://www.stayonsite.se/blogg' },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <section className="bg-primary text-white pt-32 pb-20">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {tr('blog.heading')}
            </h1>
            <p className="text-xl text-white/70 max-w-2xl">
              {tr('blog.intro')}
            </p>
          </div>
        </section>

        <section className="border-b border-nordic-200 bg-nordic-50 py-8">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <div className="grid gap-5 md:grid-cols-2">
              <Link href={language === 'en' ? '/en/about' : '/om-oss'} className="group flex items-start gap-4 rounded-2xl border border-nordic-200 bg-white p-5 transition hover:border-accent">
                <User className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent">
                    {t('Kajsa Sihlén, grundare & VD', 'Kajsa Sihlén, founder & CEO', 'Kajsa Sihlén, założycielka i CEO')}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-nordic-600">
                    {t('Innehållsansvarig med erfarenhet av personalboende sedan StayOnSite grundades 2016.', 'Editorial lead with worker accommodation experience since StayOnSite was founded in 2016.', 'Odpowiedzialna za treści i zakwaterowanie pracownicze od założenia StayOnSite w 2016 roku.')}
                  </p>
                </div>
              </Link>
              <Link href="/blogg/redaktionella-riktlinjer" className="group flex items-start gap-4 rounded-2xl border border-nordic-200 bg-white p-5 transition hover:border-accent">
                <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-nordic-900 group-hover:text-accent">
                    {t('Källor, uppdateringar och rättelser', 'Sources, updates and corrections', 'Źródła, aktualizacje i poprawki')}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-nordic-600">
                    {t('Läs hur vi skiljer praktisk erfarenhet från lag, statistik och externa sakuppgifter.', 'Read how we distinguish operational experience from regulations, statistics and external facts.', 'Przeczytaj, jak odróżniamy praktyczne doświadczenie od przepisów, statystyk i faktów zewnętrznych.')}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-14" aria-labelledby="blog-topics">
          <div className="container mx-auto max-w-6xl px-6 md:px-12">
            <h2 id="blog-topics" className="mb-8 font-display text-2xl font-bold text-nordic-900 md:text-3xl">
              {tr('blog.start')}
            </h2>
            <div className={`grid gap-6 ${topics.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {topics.map((topic) => (
                <div key={topic.href} className="flex flex-col rounded-2xl border border-nordic-200 p-6">
                  <h3 className="font-display text-xl font-bold text-nordic-900">{topic.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-nordic-600">{topic.description}</p>
                  <Link href={topic.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-accent hover:underline">
                    {topic.label}<ArrowRight size={16} className="shrink-0" aria-hidden="true" />
                  </Link>
                  {topic.slugs.length > 0 && (
                    <ul className="mt-5 space-y-3 border-t border-nordic-100 pt-5">
                      {topic.slugs.map((slug) => {
                        const post = getBlogPost(slug);
                        if (!post) return null;
                        return <li key={slug}><Link href={postHref(post)} className="text-sm text-nordic-700 underline decoration-nordic-200 underline-offset-4 hover:text-accent">{post.title[language] || post.title.sv}</Link></li>;
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-nordic-50 py-16" aria-labelledby="blog-archive">
          <div className="container mx-auto px-6 md:px-12">
            <h2 id="blog-archive" className="mx-auto mb-8 max-w-6xl font-display text-2xl font-bold text-nordic-900">{tr('blog.archive')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...visiblePosts].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate)).map((post) => {
                const title = post.title[language] || post.title.sv;
                const desc = post.description[language] || post.description.sv;
                return (
                  <Link
                    key={post.slug}
                    href={postHref(post)}
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
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <time dateTime={post.updatedDate || post.publishedDate} className="flex items-center gap-1.5"><Calendar size={13} aria-hidden="true" />{post.updatedDate && post.updatedDate !== post.publishedDate ? `${tr('blog.updated')} ` : ''}{post.updatedDate || post.publishedDate}</time>
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
