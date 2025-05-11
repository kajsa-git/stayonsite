
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
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled 
          ? "bg-white/95 backdrop-blur-sm border-b border-nordic-100 py-3" 
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="flex items-center">
            <span className={cn(
              "text-2xl font-display transition-colors duration-500",
              scrolled ? "text-nordic-800" : "text-nordic-900"
            )}>
              Stay<span className="text-nordic-500">On</span>Site
            </span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-12">
          <ul className="flex space-x-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a 
                  href={link.href}
                  className={cn(
                    "font-light tracking-wide transition-colors duration-500 hover:text-nordic-500 relative after:absolute after:w-full after:h-px after:bg-nordic-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300",
                    scrolled ? "text-nordic-800" : "text-nordic-900"
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher className={scrolled ? "text-nordic-800" : "text-nordic-900"} />
            <Button 
              variant={scrolled ? "default" : "outline"}
              className={cn(
                "rounded-md border-nordic-200 px-5 py-2 h-auto font-light transition-all duration-500",
                scrolled 
                  ? "bg-nordic-500 hover:bg-nordic-600 text-white"
                  : "bg-white/80 hover:bg-white text-nordic-800 hover:text-nordic-900"
              )}
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
          <LanguageSwitcher className={scrolled ? "text-nordic-800" : "text-nordic-900"} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className={cn(
              "ml-2",
              scrolled ? "text-nordic-800" : "text-nordic-900"
            )}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-nordic-100 shadow-sm absolute top-full left-0 right-0 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-6 py-6">
            <ul className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    className="block py-2 text-nordic-800 hover:text-nordic-500 transition-colors duration-300 font-light tracking-wide"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <Button 
                  className="w-full rounded-md bg-nordic-500 hover:bg-nordic-600 text-white font-light"
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
