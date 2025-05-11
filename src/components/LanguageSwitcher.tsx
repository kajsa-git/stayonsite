
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleLanguage = (lang: 'sv' | 'en') => {
    setLanguage(lang);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("flex items-center gap-2 font-light rounded-md", className)}
      >
        <Globe size={16} />
        <span className="uppercase">{language}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 rounded-md shadow-sm bg-white border border-nordic-200 z-50">
          <div className="py-1">
            <button
              onClick={() => toggleLanguage('sv')}
              className={`block px-4 py-2.5 text-sm w-full text-left font-light transition-colors duration-300 ${
                language === 'sv' 
                  ? 'bg-nordic-100 text-nordic-800' 
                  : 'text-nordic-800 hover:bg-nordic-50'
              }`}
            >
              Svenska
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`block px-4 py-2.5 text-sm w-full text-left font-light transition-colors duration-300 ${
                language === 'en' 
                  ? 'bg-nordic-100 text-nordic-800' 
                  : 'text-nordic-800 hover:bg-nordic-50'
              }`}
            >
              English
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
