'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DATACENTER_PATHS } from '@/data/datacenter';
import LanguageSwitcher from './LanguageSwitcher';
import { cn } from '@/lib/utils';
import { trackPhoneClick } from '@/lib/gtag';

const HOME_PATHS = {
  sv: '/',
  en: '/en/corporate-housing-sweden',
  pl: '/pl/zakwaterowanie-firmowe',
} as const;

const Header = () => {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const homeHref = HOME_PATHS[language];
  const isHomePage = pathname === '/';
  const isHomeownerPage = pathname === '/for-husagare' || pathname.startsWith('/for-husagare/');
  const hasHeroInquiry = pathname === '/' || pathname === '/for-foretag' ||
    pathname === '/projektboende' || pathname === '/boenden' ||
    Object.values(HOME_PATHS).some((path) => pathname === path) ||
    Object.values(DATACENTER_PATHS).some((path) => pathname === path) ||
    /^\/(stad|en\/corporate-housing|pl\/zakwaterowanie)\/[^/]+\/?$/.test(pathname);
  const inquiryHref = isHomeownerPage
    ? '#homeowner-inquiry'
    : hasHeroInquiry ? '#hero-inquiry' : pathname === '/kontakt' ? '#inquiry' : `${homeHref}#hero-inquiry`;
  const inquiryLabel = isHomeownerPage ? t('nav.rentOutProperty') : t('nav.inquiryForm');
  const useScrolledStyle = scrolled || !isHomePage;
  const aboutHref = language === 'en' ? '/en/about' : '/om-oss';
  const companyHref = language === 'sv' ? '/for-foretag' : homeHref;
  const contactHref = language === 'sv' ? '/kontakt' : `${homeHref}#inquiry`;

  const navLinks = [
    { label: t('nav.forCompanies'), href: companyHref },
    { label: t('nav.locations'), href: `${homeHref}#cities` },
    { label: t('nav.availableHousing'), href: '/boenden' },
    { label: t('nav.homeowner'), href: '/for-husagare' },
    { label: t('nav.about'), href: aboutHref },
  ];
  const additionalLinks = [
    ...(language === 'sv' ? [{ label: t('nav.projectHousing'), href: '/projektboende' }] : []),
    { label: t('nav.dataCentreHousing'), href: DATACENTER_PATHS[language] },
    { label: t('nav.contact'), href: contactHref },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-colors duration-300',
        useScrolledStyle
          ? 'border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur-lg'
          : 'bg-transparent text-white'
      )}
    >
      <div className="container mx-auto flex min-h-20 items-center justify-between gap-6 px-4 sm:px-6 xl:px-8">
        <Link href={homeHref} className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="relative block h-8 md:h-9">
            <img
              src="/stayonsite-logo.png"
              alt="StayOnSite"
              className={cn('h-full w-auto', !useScrolledStyle && 'invisible')}
            />
            <img
              src="/stayonsite-logo-white.png"
              alt=""
              aria-hidden="true"
              className={cn('absolute inset-0 h-full w-auto', useScrolledStyle && 'invisible')}
            />
          </span>
        </Link>

        <nav aria-label={t('nav.primaryNavigation')} className="hidden items-center gap-4 xl:flex">
          <ul className="flex items-center gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className="whitespace-nowrap rounded-sm text-sm font-medium underline-offset-8 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="shrink-0 px-2">
                {t('nav.more')}
                <ChevronDown data-icon="inline-end" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                {additionalLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <LanguageSwitcher className="shrink-0" />
          <Button asChild className="shrink-0 rounded-full">
            <Link href={inquiryHref}>{inquiryLabel}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-3 xl:hidden">
          <LanguageSwitcher />
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-[min(90vw,24rem)] flex-col gap-6 overflow-y-auto" aria-describedby={undefined}>
              <SheetHeader>
                <SheetTitle>{t('nav.menu')}</SheetTitle>
              </SheetHeader>
              <nav aria-label={t('nav.primaryNavigation')} className="flex flex-col gap-6">
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        aria-current={pathname === link.href ? 'page' : undefined}
                        className="block rounded-lg px-3 py-3 font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Separator />
                <ul className="flex flex-col gap-1">
                  {additionalLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3">
                  <Button asChild className="w-full rounded-full">
                    <Link href={inquiryHref} onClick={() => setIsMenuOpen(false)}>{inquiryLabel}</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <a href="tel:+46762498486" onClick={() => { trackPhoneClick(); setIsMenuOpen(false); }}>
                      <Phone data-icon="inline-start" aria-hidden="true" />
                      {t('nav.call')}
                    </a>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
