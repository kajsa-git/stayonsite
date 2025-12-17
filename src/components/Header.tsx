
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if we're on the homepage
  const isHomePage = location.pathname === '/';

  const navLinks = [
    { label: t('nav.services'), href: isHomePage ? '#why' : '/#why' },
    { label: t('nav.references'), href: isHomePage ? '#references' : '/#references' },
    { label: t('nav.contact'), href: isHomePage ? '#inquiry' : '/#inquiry' },
  ];

  // Handle smooth scroll to section
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                {isHomePage ? (
                  <a
                    href={link.href}
                    onClick={(e) => handleSectionClick(e, link.href.replace('#', ''))}
                    className="text-sm font-semibold text-nordic-800 hover:text-[#ff6300] transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm font-semibold text-nordic-800 hover:text-[#ff6300] transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="h-5 w-px bg-nordic-200" />

          <div className="flex items-center gap-4">
            {/* För byggbolag link */}
            {isHomePage ? (
              <a
                href="#inquiry"
                onClick={(e) => handleSectionClick(e, 'inquiry')}
                className="text-sm font-semibold text-nordic-800 hover:text-[#ff6300] transition-colors"
              >
                {t('nav.forCompanies')}
              </a>
            ) : (
              <Link
                to="/#inquiry"
                className="text-sm font-semibold text-nordic-800 hover:text-[#ff6300] transition-colors"
              >
                {t('nav.forCompanies')}
              </Link>
            )}
            {/* För husägare link */}
            <Link
              to="/for-husagare"
              className="text-sm font-semibold text-nordic-800 hover:text-[#ff6300] transition-colors"
            >
              {t('nav.homeowner')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher className="text-nordic-600" />
            <Button
              asChild
              variant="default"
              className="rounded-full px-5 h-10 font-medium bg-[#ff6300] hover:bg-[#e25200] text-white shadow-sm"
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
                {isHomePage ? (
                  <a
                    href={link.href}
                    className="block rounded-full border border-nordic-200 px-4 py-2 text-nordic-800 hover:text-[#ff6300] hover:border-[#ff6300]/40 transition-colors font-medium"
                    onClick={(e) => {
                      handleSectionClick(e, link.href.replace('#', ''));
                      setIsMenuOpen(false);
                    }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="block rounded-full border border-nordic-200 px-4 py-2 text-nordic-800 hover:text-[#ff6300] hover:border-[#ff6300]/40 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
              <li>
                {isHomePage ? (
                  <a
                    href="#inquiry"
                    className="block py-2 text-blue-700 hover:text-blue-800 transition-colors duration-300 font-medium tracking-wide"
                    onClick={(e) => {
                      handleSectionClick(e, 'inquiry');
                      setIsMenuOpen(false);
                    }}
                  >
                    {t('nav.forCompanies')}
                  </a>
                ) : (
                  <Link
                    to="/#inquiry"
                    className="block py-2 text-blue-700 hover:text-blue-800 transition-colors duration-300 font-medium tracking-wide"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.forCompanies')}
                  </Link>
                )}
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
