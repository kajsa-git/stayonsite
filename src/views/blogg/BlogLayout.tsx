'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import type { BlogPost } from '@/data/blog-posts';
import { getRelatedPosts } from '@/data/blog-posts';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock, ExternalLink, ShieldCheck, User } from 'lucide-react';

interface BlogLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

const BlogLayout = ({ post, children }: BlogLayoutProps) => {
  const { language } = useLanguage();

  const title = post.title[language] || post.title.sv;
  const description = post.description[language] || post.description.sv;

  // Engelsk variant renderas på /en/blog/<en.slug> — språket styrs av URL:en via LanguageContext
  const enVariant = language === 'en' ? post.en : undefined;
  const articleUrl = enVariant
    ? `https://www.stayonsite.se/en/blog/${enVariant.slug}`
    : `https://www.stayonsite.se/blogg/${post.slug}`;
  const blogIndexPath = enVariant ? '/en/blog' : '/blogg';
  const keyTakeaways = enVariant ? enVariant.keyTakeaways : post.keyTakeaways;
  const faq = enVariant ? enVariant.faq : post.faq;
  const sources = post.sources;
  const modifiedDate = post.updatedDate || post.publishedDate;
  const isUpdated = Boolean(post.updatedDate && post.updatedDate !== post.publishedDate);
  const relatedPosts = getRelatedPosts(post.slug);
  const audience = post.audience ?? 'bada';
  const authorUrl = language === 'en' ? '/en/about' : '/om-oss';
  const editorialUrl = '/blogg/redaktionella-riktlinjer';

  const structuredData: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description: description,
      image: {
        '@type': 'ImageObject',
        url: 'https://www.stayonsite.se/images/og-image.jpg',
        width: 1200,
        height: 630,
      },
      author: {
        '@type': 'Person',
        '@id': 'https://www.stayonsite.se/om-oss#kajsa-sihlen',
        name: post.author,
        jobTitle: 'Grundare & VD',
        url: 'https://www.stayonsite.se/om-oss',
        image: 'https://www.stayonsite.se/images/kajsa.webp',
        sameAs: ['https://www.linkedin.com/in/kajsa-sihl%C3%A9n-4b16b657/'],
        knowsAbout: ['personalboende', 'företagsbostäder', 'projektboende', 'uthyrning till företag'],
        worksFor: {
          '@type': 'Organization',
          '@id': 'https://www.stayonsite.se/#organization',
          name: 'StayOnSite',
          url: 'https://www.stayonsite.se',
        },
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://www.stayonsite.se/#organization',
        name: 'StayOnSite',
        url: 'https://www.stayonsite.se',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.stayonsite.se/images/og-image.jpg',
        },
      },
      datePublished: post.publishedDate,
      dateModified: modifiedDate,
      mainEntityOfPage: articleUrl,
      timeRequired: `PT${post.readingTime}M`,
      articleSection: post.category,
      keywords: post.tags.join(', '),
      inLanguage: enVariant ? 'en' : 'sv',
      isAccessibleForFree: true,
      isPartOf: {
        '@type': 'Blog',
        name: enVariant ? 'StayOnSite Blog' : 'StayOnSite Blogg',
        url: `https://www.stayonsite.se${blogIndexPath}`,
      },
      ...(sources?.length ? { citation: sources.map((source) => source.url) } : {}),
      ...(keyTakeaways?.length ? { abstract: keyTakeaways.join(' ') } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'StayOnSite', item: 'https://www.stayonsite.se' },
        { '@type': 'ListItem', position: 2, name: enVariant ? 'Blog' : 'Blogg', item: `https://www.stayonsite.se${blogIndexPath}` },
        { '@type': 'ListItem', position: 3, name: title, item: articleUrl },
      ],
    },
  ];

  if (faq?.length) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    });
  }

  const cta = {
    foretag: {
      heading: language === 'sv' ? 'Behöver ni personalboende?' : language === 'en' ? 'Need worker accommodation?' : 'Potrzebujesz zakwaterowania dla pracowników?',
      text:
        language === 'sv'
          ? 'Möblerade boenden för arbetslag och familjer i hela Sverige. Fast månadspris, en kontaktperson och färdig boendeplan inom 24 timmar.'
          : language === 'en'
            ? 'Furnished housing for crews and families across Sweden. Fixed monthly price, one contact person and a complete housing plan within 24 hours.'
            : 'Umeblowane lokale dla ekip i rodzin w całej Szwecji. Stała cena miesięczna, jedna osoba kontaktowa i gotowy plan w 24 godziny.',
      primaryLabel: language === 'sv' ? 'Få boendeförslag inom 24 h' : language === 'en' ? 'Get a housing proposal in 24h' : 'Otrzymaj propozycję w 24 h',
      primaryHref: '/kontakt',
      secondaryLabel: language === 'sv' ? 'Ring 076-249 84 86' : language === 'en' ? 'Call +46 76-249 84 86' : 'Zadzwoń +46 76-249 84 86',
      secondaryHref: 'tel:+46762498486',
    },
    husagare: {
      heading: language === 'sv' ? 'Vill du hyra ut din bostad till företag?' : language === 'en' ? 'Want to rent out your home to companies?' : 'Chcesz wynająć swój dom firmom?',
      text:
        language === 'sv'
          ? 'Trygga företagskontrakt med långa hyrestider, hyra utbetald varje månad och 0 % i avgift. Registrera din bostad så återkommer vi alltid inom en arbetsdag – ofta inom några timmar.'
          : language === 'en'
            ? 'Secure corporate contracts with long tenancies, rent paid every month and 0% in fees. Register your property and we always get back to you within one business day – often within hours.'
            : 'Bezpieczne umowy firmowe na długi okres, czynsz wypłacany co miesiąc i 0% prowizji. Zarejestruj swoją nieruchomość, a odezwiemy się w ciągu dnia roboczego – często w kilka godzin.',
      primaryLabel: language === 'sv' ? 'Registrera din bostad' : language === 'en' ? 'Register your property' : 'Zarejestruj nieruchomość',
      primaryHref: '/registrera-bostad',
      secondaryLabel: language === 'sv' ? 'Så fungerar det' : language === 'en' ? 'How it works' : 'Jak to działa',
      secondaryHref: '/for-husagare',
    },
    bada: {
      heading: language === 'sv' ? 'Behöver ni boende – eller vill du hyra ut?' : language === 'en' ? 'Need housing – or want to rent out?' : 'Szukasz zakwaterowania – czy chcesz wynająć?',
      text:
        language === 'sv'
          ? 'Vi ordnar personalboende åt arbetslag och familjer i hela Sverige, och tar löpande emot nya bostäder från husägare. Vi återkommer alltid inom en arbetsdag – ofta inom några timmar.'
          : language === 'en'
            ? 'We arrange worker housing for crews and families across Sweden, and continuously take on new properties from homeowners. We always reply within one business day – often within hours.'
            : 'Organizujemy zakwaterowanie dla ekip i rodzin w całej Szwecji i stale przyjmujemy nowe nieruchomości. Zawsze odpowiadamy w ciągu dnia roboczego – często w kilka godzin.',
      primaryLabel: language === 'sv' ? 'Få boendeförslag' : language === 'en' ? 'Get a housing proposal' : 'Otrzymaj propozycję',
      primaryHref: '/kontakt',
      secondaryLabel: language === 'sv' ? 'Hyr ut din bostad' : language === 'en' ? 'Rent out your property' : 'Wynajmij swoją nieruchomość',
      secondaryHref: '/for-husagare',
    },
  }[audience];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${title} | StayOnSite`}
        description={description}
        canonical={articleUrl}
        type="article"
        structuredData={structuredData}
        articlePublishedTime={`${post.publishedDate}T00:00:00Z`}
        articleModifiedTime={`${modifiedDate}T00:00:00Z`}
        articleAuthor="https://www.stayonsite.se/om-oss#kajsa-sihlen"
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
            <Link href={blogIndexPath} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors">
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
              <Link href={authorUrl} className="flex items-center gap-2 hover:text-white transition-colors">
                <User size={14} />
                {post.author}, {language === 'sv' ? 'grundare & VD' : language === 'en' ? 'founder & CEO' : 'założycielka i CEO'}
              </Link>
              <time dateTime={post.publishedDate} className="flex items-center gap-2">
                <Calendar size={14} />
                {language === 'sv' ? 'Publicerad' : language === 'en' ? 'Published' : 'Opublikowano'} {post.publishedDate}
              </time>
              {isUpdated && (
                <time dateTime={post.updatedDate} className="flex items-center gap-2">
                  {language === 'sv' ? 'Uppdaterad' : language === 'en' ? 'Updated' : 'Zaktualizowano'} {post.updatedDate}
                </time>
              )}
              <span className="flex items-center gap-2"><Clock size={14} />{post.readingTime} min</span>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16">
          <div className="container mx-auto px-6 md:px-12 max-w-3xl">
            {keyTakeaways && keyTakeaways.length > 0 && (
              <div className="mb-12 bg-nordic-50 border border-nordic-100 rounded-2xl p-6 md:p-8">
                <h2 className="font-display text-xl font-semibold text-nordic-900 mb-4">
                  {language === 'sv' ? 'Snabba svar' : language === 'en' ? 'Quick answers' : 'Szybkie odpowiedzi'}
                </h2>
                <ul className="space-y-3">
                  {keyTakeaways.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-nordic-700 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <article className="prose prose-lg prose-nordic max-w-none prose-headings:font-display prose-headings:text-nordic-900 prose-a:text-accent prose-blockquote:border-accent prose-blockquote:bg-nordic-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-xl">
              {children}

              {sources && sources.length > 0 && (
                <section aria-labelledby="article-sources" className="not-prose mt-14 border-t border-nordic-200 pt-10">
                  <div className="mb-5 flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                    <h2 id="article-sources" className="font-display text-2xl font-semibold text-nordic-900">
                      {language === 'sv' ? 'Primärkällor' : language === 'en' ? 'Primary sources' : 'Źródła pierwotne'}
                    </h2>
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-nordic-600">
                    {language === 'sv'
                      ? 'Källorna nedan stöder artikelns centrala sakuppgifter. Länkarna går till ansvarig myndighet eller originaldokument.'
                      : language === 'en'
                        ? 'These sources support the article’s central factual claims and link to the responsible authority or original document.'
                        : 'Poniższe źródła potwierdzają najważniejsze informacje i prowadzą do właściwego urzędu lub dokumentu.'}
                  </p>
                  <ol className="space-y-3">
                    {sources.map((source) => (
                      <li key={source.url} className="border-l-2 border-nordic-200 pl-4 text-sm leading-relaxed">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-start gap-2 font-medium text-nordic-900 hover:text-accent"
                        >
                          <span>
                            {source.publisher}: {source.title}
                            {source.checkedDate && (
                              <span className="ml-2 font-normal text-nordic-500">
                                ({language === 'sv' ? 'kontrollerad' : language === 'en' ? 'checked' : 'sprawdzono'} {source.checkedDate})
                              </span>
                            )}
                          </span>
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <aside className="not-prose mt-14 rounded-2xl border border-nordic-200 bg-nordic-50 p-6 md:p-8" aria-label={language === 'sv' ? 'Om författaren' : 'About the author'}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <Image
                    src="/images/kajsa.webp"
                    alt="Kajsa Sihlén"
                    width={96}
                    height={96}
                    className="h-24 w-24 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      {language === 'sv' ? 'Om författaren' : language === 'en' ? 'About the author' : 'O autorce'}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold text-nordic-900">
                      <Link href={authorUrl} className="hover:text-accent">Kajsa Sihlén</Link>
                    </h2>
                    <p className="mt-1 text-sm font-medium text-nordic-600">
                      {language === 'sv' ? 'Grundare och VD, StayOnSite' : language === 'en' ? 'Founder and CEO, StayOnSite' : 'Założycielka i CEO, StayOnSite'}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-nordic-700">
                      {language === 'sv'
                        ? 'Kajsa grundade StayOnSite 2016 och arbetar med boende för bygg-, industri- och infrastrukturprojekt i svenska projektorter. Artiklarna kombinerar praktiska erfarenheter från verksamheten med externa källor när lagar, statistik eller projektuppgifter behandlas.'
                        : language === 'en'
                          ? 'Kajsa founded StayOnSite in 2016 and works with accommodation for construction, industrial and infrastructure projects across Sweden. Articles combine operational experience with external sources when covering regulations, statistics or project facts.'
                          : 'Kajsa założyła StayOnSite w 2016 roku i pracuje nad zakwaterowaniem dla projektów budowlanych, przemysłowych i infrastrukturalnych w Szwecji.'}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
                      <Link href={authorUrl} className="text-accent hover:underline">
                        {language === 'sv' ? 'Om Kajsa och StayOnSite' : language === 'en' ? 'About Kajsa and StayOnSite' : 'O Kajsa i StayOnSite'}
                      </Link>
                      <Link href={editorialUrl} className="text-accent hover:underline">
                        {language === 'sv' ? 'Så arbetar vi med innehåll' : language === 'en' ? 'Editorial principles (Swedish)' : 'Zasady redakcyjne (po szwedzku)'}
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>
            </article>
          </div>
        </section>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <section className="py-16 border-t border-nordic-100">
            <div className="container mx-auto px-6 md:px-12 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-8 text-center">
                {language === 'sv' ? 'Läs också' : language === 'en' ? 'Read next' : 'Czytaj dalej'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={language === 'en' && related.en ? `/en/blog/${related.en.slug}` : `/blogg/${related.slug}`}
                    className="group flex flex-col bg-white rounded-2xl border border-nordic-200 p-6 hover:border-accent transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-wider text-accent mb-3">
                      {related.category}
                    </span>
                    <h3 className="font-display font-semibold text-nordic-900 leading-snug mb-3 group-hover:text-accent transition-colors">
                      {related.title[language] || related.title.sv}
                    </h3>
                    <p className="text-sm text-nordic-600 leading-relaxed line-clamp-3 flex-grow">
                      {related.description[language] || related.description.sv}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
                      {language === 'sv' ? 'Läs artikeln' : language === 'en' ? 'Read article' : 'Czytaj artykuł'}
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-nordic-50 border-t border-nordic-100">
          <div className="container mx-auto px-6 md:px-12 text-center max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-nordic-900 mb-4">{cta.heading}</h2>
            <p className="text-nordic-600 mb-8">{cta.text}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {cta.primaryHref.startsWith('tel:') ? (
                <a href={cta.primaryHref} className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/90 transition-colors">
                  {cta.primaryLabel}
                </a>
              ) : (
                <Link href={cta.primaryHref} className="inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/90 transition-colors">
                  {cta.primaryLabel}
                </Link>
              )}
              {cta.secondaryHref.startsWith('tel:') ? (
                <a href={cta.secondaryHref} className="inline-flex items-center justify-center gap-2 bg-white text-nordic-900 px-8 py-4 rounded-full font-bold border border-nordic-200 hover:border-accent transition-colors">
                  {cta.secondaryLabel}
                </a>
              ) : (
                <Link href={cta.secondaryHref} className="inline-flex items-center justify-center gap-2 bg-white text-nordic-900 px-8 py-4 rounded-full font-bold border border-nordic-200 hover:border-accent transition-colors">
                  {cta.secondaryLabel}
                </Link>
              )}
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
