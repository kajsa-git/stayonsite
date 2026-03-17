'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/data/blog-posts';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';

interface BlogLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

const BlogLayout = ({ post, children }: BlogLayoutProps) => {
  const { language } = useLanguage();

  const title = post.title[language] || post.title.sv;
  const description = post.description[language] || post.description.sv;

  const articleUrl = `https://www.stayonsite.se/blogg/${post.slug}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: {
        '@type': 'ImageObject',
        url: 'https://www.stayonsite.se/images/og-image.jpg',
        width: 1200,
        height: 630,
      },
      author: { '@type': 'Person', name: post.author },
      publisher: {
        '@type': 'Organization',
        name: 'StayOnSite',
        url: 'https://www.stayonsite.se',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.stayonsite.se/images/og-image.jpg',
        },
      },
      datePublished: post.publishedDate,
      dateModified: post.publishedDate,
      mainEntityOfPage: articleUrl,
      wordCount: post.readingTime * 250,
      articleSection: post.category,
      inLanguage: 'sv',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StayOnSite', item: 'https://www.stayonsite.se' },
        { '@type': 'ListItem', position: 2, name: 'Blogg', item: 'https://www.stayonsite.se/blogg' },
        { '@type': 'ListItem', position: 3, name: title, item: `https://www.stayonsite.se/blogg/${post.slug}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${title} | StayOnSite`}
        description={description}
        canonical={articleUrl}
        type="article"
        structuredData={structuredData}
        articlePublishedTime={`${post.publishedDate}T00:00:00Z`}
        articleModifiedTime={`${post.publishedDate}T00:00:00Z`}
        articleAuthor="https://www.stayonsite.se"
        articleSection={post.category}
        articleTags={post.tags}
        hreflangs={[
          { lang: 'sv', href: articleUrl },
          { lang: 'x-default', href: articleUrl },
        ]}
      />
      <Header />
      <main className="flex-grow">
        {/* Article Header */}
        <section className="bg-primary text-white pt-32 pb-16">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <Link href="/blogg" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors">
              <ArrowLeft size={16} />
              {language === 'sv' ? 'Tillbaka till bloggen' : language === 'en' ? 'Back to blog' : 'Wróć do bloga'}
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {post.category}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-6">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm">
              <span className="flex items-center gap-2"><User size={14} />{post.author}</span>
              <span className="flex items-center gap-2"><Calendar size={14} />{post.publishedDate}</span>
              <span className="flex items-center gap-2"><Clock size={14} />{post.readingTime} min</span>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-3xl">
            <article className="prose prose-lg prose-nordic max-w-none prose-headings:font-display prose-headings:text-nordic-900 prose-a:text-accent prose-blockquote:border-accent prose-blockquote:bg-nordic-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-xl">
              {children}
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4">
              {language === 'sv' ? 'Behöver ni personalboende?' : language === 'en' ? 'Need worker accommodation?' : 'Potrzebujesz zakwaterowania?'}
            </h2>
            <p className="text-nordic-600 mb-8">
              {language === 'sv' ? 'Vi ordnar boende i hela Sverige \u2014 svar inom 24 timmar.' : language === 'en' ? 'We arrange accommodation across Sweden \u2014 response within 24 hours.' : 'Organizujemy zakwaterowanie w ca\u0142ej Szwecji \u2014 odpowied\u017a w 24h.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+46762498486" className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/90 transition-colors">
                {language === 'sv' ? 'Ring oss' : language === 'en' ? 'Call us' : 'Zadzwoń'}
              </a>
              <Link href={language === 'sv' ? '/for-husagare' : '/for-husagare'} className="inline-flex items-center justify-center gap-2 bg-white text-nordic-900 px-8 py-4 rounded-full font-bold border border-nordic-200 hover:border-accent transition-colors">
                {language === 'sv' ? 'Hyr ut ditt boende' : language === 'en' ? 'Rent out your property' : 'Wynajmij swoją nieruchomość'}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default BlogLayout;
