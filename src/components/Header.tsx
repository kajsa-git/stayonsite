
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    { label: t('nav.references'), href: '#references', isRoute: false },
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
        "fixed top-0 w-full z-50 transition-all duration-500 bg-white/95 backdrop-blur-sm border-b border-nordic-100",
        scrolled
          ? "py-3 shadow-sm"
          : "py-5"
      )}
    >
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="text-2xl font-display text-nordic-900">
              Stay<span className="text-[#ff6300]">On</span>Site
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-12 ml-8">
          <ul className="flex space-x-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                {link.isRoute ? (
                  <Link 
                    to={link.href}
                    className={cn(
                      "font-light tracking-wide transition-colors duration-500 hover:text-nordic-500 relative after:absolute after:w-full after:h-px after:bg-nordic-500 after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300",
                      scrolled ? "text-nordic-800" : "text-nordic-900"
                    )}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="font-light tracking-wide transition-colors duration-300 hover:text-[#ff6300] relative after:absolute after:w-full after:h-px after:bg-[#ff6300] after:bottom-[-4px] after:left-0 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300 text-nordic-800"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
            {/* För byggbolag link */}
            <li>
              <Link
                to="/#inquiry"
                className="font-light tracking-wide transition-colors duration-300 hover:text-blue-700 text-sm md:text-base px-2 md:px-3 py-1 md:py-2 rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 whitespace-nowrap text-blue-800"
              >
                {t('nav.forCompanies')}
              </Link>
            </li>
            {/* För husägare link */}
            <li>
              <Link
                to="/for-husagare"
                className="font-light tracking-wide transition-colors duration-300 hover:text-amber-700 text-sm md:text-base px-2 md:px-3 py-1 md:py-2 rounded-md bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 whitespace-nowrap text-amber-700"
              >
                {t('nav.homeowner')}
              </Link>
            </li>
            
            {/* Quick city links */}
            <li className="border-l border-gray-300 pl-6 ml-6">
              <div className="flex items-center space-x-4 text-sm">
                <Link to="/stad/stockholm" className="hover:text-[#ff6300] transition-colors text-nordic-700">Stockholm</Link>
                <Link to="/stad/goteborg" className="hover:text-[#ff6300] transition-colors text-nordic-700">Göteborg</Link>
                <Link to="/stad/malmo" className="hover:text-[#ff6300] transition-colors text-nordic-700">Malmö</Link>
              </div>
            </li>
          </ul>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher className="text-nordic-800" />
            <Button
              asChild
              variant="default"
              className="rounded-full px-6 py-2 h-auto font-light bg-[#ff6300] hover:bg-[#e25200] text-white shadow-sm"
            >
              <a href="tel:+46736287709">
                {t('nav.inquiryForm')}
              </a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-3">
          <LanguageSwitcher className="text-nordic-800" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-2 text-nordic-800"
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
                  {link.isRoute ? (
                    <Link 
                      to={link.href}
                      className="block py-2 text-nordic-800 hover:text-nordic-500 transition-colors duration-300 font-light tracking-wide"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="block py-2 text-nordic-800 hover:text-[#ff6300] transition-colors duration-300 font-light tracking-wide"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
              <li>
                <Link 
                  to="/#inquiry"
                  className="block py-2 text-blue-700 hover:text-blue-800 transition-colors duration-300 font-medium tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.forCompanies')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/for-husagare"
                  className="block py-2 text-amber-600 hover:text-amber-700 transition-colors duration-300 font-medium tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.homeowner')}
                </Link>
              </li>
              <li className="pt-4">
                <Button
                  asChild
                  className="w-full rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white font-light shadow-sm"
                >
                  <a
                    href="tel:+46736287709"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.inquiryForm')}
                  </a>
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
