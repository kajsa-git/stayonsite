'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { blogPosts } from '@/data/blog-posts';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

const BlogTeasers = () => {
  const { language } = useLanguage();

  const latest = [...blogPosts]
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate))
    .slice(0, 3);

  const heading =
    language === 'en' ? 'Latest from the blog' :
    language === 'pl' ? 'Najnowsze z bloga' :
    'Senaste fr\u00e5n bloggen';

  const readMore =
    language === 'en' ? 'All articles' :
    language === 'pl' ? 'Wszystkie artyku\u0142y' :
    'Alla artiklar';

  return (
    <section className="py-16 bg-white border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900">
              {heading}
            </h2>
            <Link
              href="/blogg"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              {readMore} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {latest.map((post) => {
              const title = post.title[language] || post.title.sv;
              const desc = post.description[language] || post.description.sv;
              return (
                <Link
                  key={post.slug}
                  href={`/blogg/${post.slug}`}
                  className="group bg-nordic-50 rounded-2xl border border-nordic-100 p-6 hover:shadow-md hover:border-accent/30 transition-all duration-300 flex flex-col"
                >
                  <span className="inline-block self-start bg-accent/10 text-accent px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-nordic-900 mb-2 group-hover:text-accent transition-colors leading-snug">
                    {title}
                  </h3>
                  <p className="text-nordic-600 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                    {desc}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-nordic-500">
                    <span className="flex items-center gap-1"><Calendar size={12} />{post.publishedDate}</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{post.readingTime} min</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="sm:hidden text-center mt-6">
            <Link
              href="/blogg"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              {readMore} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogTeasers;
