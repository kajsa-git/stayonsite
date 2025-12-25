
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLanguageChange = (lang: 'sv' | 'en' | 'pl') => {
    const path = location.pathname;
    
    // Check if we are on a city page
    const cityMatch = path.match(/\/(stad|corporate-housing|zakwaterowanie)\/([^/]+)/);
    
    if (cityMatch) {
      const citySlug = cityMatch[2];
      let newPath = '';
      
      if (lang === 'sv') {
        newPath = `/stad/${citySlug}`;
      } else if (lang === 'en') {
        newPath = `/en/corporate-housing/${citySlug}`;
      } else if (lang === 'pl') {
        newPath = `/pl/zakwaterowanie/${citySlug}`;
      }
      
      if (newPath) {
        setLanguage(lang);
        navigate(newPath);
        return;
      }
    }

    // Default behavior for other pages
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
