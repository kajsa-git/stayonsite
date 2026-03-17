'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';

interface LanguageSwitcherProps {
  className?: string;
}

// Explicit URL mappings for non-city pages
const PAGE_MAP: Record<string, Record<string, string>> = {
  '/': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/en/corporate-housing-sweden': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/pl/zakwaterowanie-firmowe': { sv: '/', en: '/en/corporate-housing-sweden', pl: '/pl/zakwaterowanie-firmowe' },
  '/om-oss': { sv: '/om-oss', en: '/om-oss', pl: '/om-oss' },
  '/for-husagare': { sv: '/for-husagare', en: '/', pl: '/' },
  '/lp/husagare': { sv: '/lp/husagare', en: '/', pl: '/' },
};

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (lang: 'sv' | 'en' | 'pl') => {
    if (lang === language) return;

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
        onClick={() => handleLanguageChange('sv')}
        className={cn(
          "transition-colors hover:text-[#ff6300]",
          language === 'sv' ? "text-[#ff6300]" : "text-nordic-600"
        )}
      >
        SV
      </button>
      <span className="text-nordic-300">|</span>
      <button
        onClick={() => handleLanguageChange('en')}
        className={cn(
          "transition-colors hover:text-[#ff6300]",
          language === 'en' ? "text-[#ff6300]" : "text-nordic-600"
        )}
      >
        EN
      </button>
      <span className="text-nordic-300">|</span>
      <button
        onClick={() => handleLanguageChange('pl')}
        className={cn(
          "transition-colors hover:text-[#ff6300]",
          language === 'pl' ? "text-[#ff6300]" : "text-nordic-600"
        )}
      >
        PL
      </button>
    </div>
  );
};

export default LanguageSwitcher;
