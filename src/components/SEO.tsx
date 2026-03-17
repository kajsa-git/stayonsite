/**
 * SEO compatibility wrapper for Next.js migration.
 * Meta tags (title, description, OG, etc.) are now handled by Next.js metadata exports in page.tsx files.
 * This component only renders JSON-LD structured data.
 * All other props are accepted but ignored for backwards compatibility.
 */

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  hreflangs?: Array<{ lang: string; href: string }>;
  noindex?: boolean;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
}

const SEO = ({ structuredData }: SEOProps) => {
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default SEO;
