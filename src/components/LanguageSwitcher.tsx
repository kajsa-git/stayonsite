
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
      <button
        onClick={() => setLanguage('sv')}
        className={cn(
          "transition-colors hover:text-[#ff6300]",
          language === 'sv' ? "text-[#ff6300]" : "text-nordic-600"
        )}
      >
        SV
      </button>
      <span className="text-nordic-300">|</span>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "transition-colors hover:text-[#ff6300]",
          language === 'en' ? "text-[#ff6300]" : "text-nordic-600"
        )}
      >
        EN
      </button>
      <span className="text-nordic-300">|</span>
      <button
        onClick={() => setLanguage('pl')}
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
