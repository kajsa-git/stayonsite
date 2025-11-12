
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
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.case'), href: '#case' },
    { label: t('nav.references'), href: '#references' },
    { label: t('nav.contact'), href: '#inquiry' },
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
        <nav className="hidden md:flex items-center space-x-8 ml-6">
          <ul className="flex items-center space-x-3 rounded-full bg-white/50 px-3 py-1 border border-nordic-100">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-nordic-700 hover:text-[#ff6300] hover:bg-[#ff6300]/10 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {/* För byggbolag link */}
            <li>
              <Link
                to="/#inquiry"
                className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 transition-colors"
              >
                {t('nav.forCompanies')}
              </Link>
            </li>
            {/* För husägare link */}
            <li>
              <Link
                to="/for-husagare"
                className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50/80 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                {t('nav.homeowner')}
              </Link>
            </li>
            
            {/* Quick city links */}
            <li className="border-l border-gray-300 pl-6 ml-6">
              <div className="flex items-center space-x-4 text-sm text-nordic-600">
                <Link to="/stad/stockholm" className="hover:text-[#ff6300] transition-colors">Stockholm</Link>
                <Link to="/stad/goteborg" className="hover:text-[#ff6300] transition-colors">Göteborg</Link>
                <Link to="/stad/malmo" className="hover:text-[#ff6300] transition-colors">Malmö</Link>
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
                <a
                  href={link.href}
                  className="block rounded-full border border-nordic-200 px-4 py-2 text-nordic-800 hover:text-[#ff6300] hover:border-[#ff6300]/40 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </a>
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
