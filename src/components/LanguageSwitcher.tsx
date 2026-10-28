'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { DATACENTER_PATHS } from '@/data/datacenter';
import { getLocalizedBlogPath } from '@/data/blog-routes';

interface LanguageSwitcherProps {
  className?: string;
}

// Explicit URL mappings for non-city pages
const PAGE_MAP: Record<string, Record<string, string>> = {
  [DATACENTER_PATHS.sv]: DATACENTER_PATHS,
  [DATACENTER_PATHS.en]: DATACENTER_PATHS,
  [DATACENTER_PATHS.pl]: DATACENTER_PATHS,
  '/': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/en/corporate-housing-sweden': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/pl/zakwaterowanie-firmowe': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/for-foretag': { sv: '/for-foretag', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/projektboende': { sv: '/projektboende', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/om-oss': { sv: '/om-oss', en: '/en/about', pl: '/pl/zakwaterowanie-firmowe' },
  '/en/about': { sv: '/om-oss', en: '/en/about', pl: '/pl/zakwaterowanie-firmowe' },
  '/for-husagare': { sv: '/for-husagare', en: '/', pl: '/' },
  '/lp/husagare': { sv: '/lp/husagare', en: '/', pl: '/' },
};

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (lang: 'sv' | 'en' | 'pl') => {
    if (lang === language) return;

    const blogPath = getLocalizedBlogPath(pathname, lang);
    if (blogPath) {
      setLanguage(lang);
      router.push(blogPath);
      return;
    }

    // City pages: /stad/:slug, /en/corporate-housing/:slug, /pl/zakwaterowanie/:slug
    const cityMatch = pathname.match(/\/(stad|en\/corporate-housing|pl\/zakwaterowanie)\/([^/]+)/);
    if (cityMatch) {
      const citySlug = cityMatch[2];
      const newPath =
        lang === 'sv' ? `/stad/${citySlug}` :
        lang === 'en' ? `/en/corporate-housing/${citySlug}` :
        `/pl/zakwaterowanie/${citySlug}`;
      setLanguage(lang);
      router.push(newPath);
      return;
    }

    // Non-city pages: use explicit mapping
    const mapped = PAGE_MAP[pathname];
    if (mapped && mapped[lang]) {
      setLanguage(lang);
      router.push(mapped[lang]);
      return;
    }

    // Fallback: change language context only (shouldn't happen with known routes)
    setLanguage(lang);
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
      <button
        type="button"
        aria-label="Svenska"
        aria-pressed={language === 'sv'}
        onClick={() => handleLanguageChange('sv')}
        className={cn(
          "rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          language === 'sv' ? "text-accent" : "text-current"
        )}
      >
        SV
      </button>
      <span className="opacity-40" aria-hidden="true">|</span>
      <button
        type="button"
        aria-label="English"
        aria-pressed={language === 'en'}
        onClick={() => handleLanguageChange('en')}
        className={cn(
          "rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          language === 'en' ? "text-accent" : "text-current"
        )}
      >
        EN
      </button>
      <span className="opacity-40" aria-hidden="true">|</span>
      <button
        type="button"
        aria-label="Polski"
        aria-pressed={language === 'pl'}
        onClick={() => handleLanguageChange('pl')}
        className={cn(
          "rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          language === 'pl' ? "text-accent" : "text-current"
        )}
      >
        PL
      </button>
    </div>
  );
};

export default LanguageSwitcher;
