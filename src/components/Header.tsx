
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.references'), href: '#references' },
    { label: t('nav.contact'), href: '#contact' },
  ];

  // Add scroll effect for the header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-sm shadow-md py-3" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="flex items-center">
            <span className={cn(
              "text-2xl font-bold transition-colors duration-300",
              scrolled ? "text-primary-600" : "text-white"
            )}>
              Stay<span className="text-secondary-500">On</span>Site
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a 
                  href={link.href}
                  className={cn(
                    "font-medium transition-colors hover:text-secondary-500",
                    scrolled ? "text-gray-700" : "text-white"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher className={scrolled ? "" : "text-white"} />
            <Button 
              variant={scrolled ? "default" : "secondary"}
              className="rounded-full"
              onClick={() => {
                document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.inquiryForm')}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <LanguageSwitcher className={scrolled ? "" : "text-white"} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={cn(
              "ml-2",
              scrolled ? "text-gray-700" : "text-white"
            )}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg absolute top-full left-0 right-0 animate-in slide-in-from-top">
          <div className="container mx-auto px-4 py-6">
            <ul className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="block py-2 text-gray-700 hover:text-primary-600 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <Button 
                  className="w-full rounded-full"
                  onClick={() => {
                    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                >
                  {t('nav.inquiryForm')}
                </Button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
