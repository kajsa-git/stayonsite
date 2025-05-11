
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
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
        className="flex items-center gap-2"
      >
        <Globe size={16} />
        <span className="uppercase">{language}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={() => toggleLanguage('sv')}
              className={`block px-4 py-2 text-sm w-full text-left ${
                language === 'sv' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Svenska
            </button>
            <button
              onClick={() => toggleLanguage('en')}
              className={`block px-4 py-2 text-sm w-full text-left ${
                language === 'en' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
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
