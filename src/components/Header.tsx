'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "./LanguageSwitcher";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check if we're on the homepage
  const isHomePage = pathname === "/";

  // On subpages, always use the "scrolled" look (solid white bg + dark text)
  // because subpages have a light background behind the header
  const useScrolledStyle = scrolled || !isHomePage;

  const navLinks = [
    { label: t("nav.services"), href: isHomePage ? "#why" : "/#why" },
    {
      label: t("nav.references"),
      href: isHomePage ? "#references" : "/#references",
    },
    { label: t("nav.contact"), href: isHomePage ? "#inquiry" : "/#inquiry" },
  ];

  // Handle smooth scroll to section
  const handleSectionClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add scroll effect for the header with RAF for smooth performance
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 ease-out will-change-[background-color,padding,backdrop-filter]",
        useScrolledStyle
          ? "py-3 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-lg shadow-black/5"
          : "py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center group relative"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span
              className={cn(
                "text-2xl md:text-3xl font-display tracking-tight transition-colors duration-300 ease-out",
                useScrolledStyle
                  ? "text-primary"
                  : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
              )}
            >
              Stay<span className="text-[#ff6300] font-semibold">On</span>Site
            </span>
            <div className={cn(
              "absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff6300] transition-all duration-300 group-hover:w-full",
              useScrolledStyle ? "bg-[#ff6300]" : "bg-white"
            )} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) =>
                    isHomePage
                      ? handleSectionClick(e, link.href.replace("#", ""))
                      : null
                  }
                  className={cn(
                    "text-[15px] font-medium transition-all duration-300 relative group",
                    useScrolledStyle
                      ? "text-primary/70 hover:text-primary"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff6300] transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div
            className={cn("h-6 w-px mx-2", useScrolledStyle ? "bg-primary/10" : "bg-white/20")}
          />

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-8">
              <Link
                href="/for-foretag"
                className={cn(
                  "text-[15px] font-medium transition-all duration-300 relative group",
                  useScrolledStyle
                    ? "text-primary/70 hover:text-primary"
                    : "text-white/80 hover:text-white"
                )}
              >
                {t("nav.forCompanies")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff6300] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/for-husagare"
                className={cn(
                  "text-[15px] font-medium transition-all duration-300 relative group",
                  useScrolledStyle
                    ? "text-primary/70 hover:text-primary"
                    : "text-white/80 hover:text-white"
                )}
              >
                {t("nav.homeowner")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff6300] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link
                href="/blogg"
                className={cn(
                  "text-[15px] font-medium transition-all duration-300 relative group",
                  useScrolledStyle
                    ? "text-primary/70 hover:text-primary"
                    : "text-white/80 hover:text-white"
                )}
              >
                Blogg
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ff6300] transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <LanguageSwitcher
                className={cn(
                  "transition-colors duration-300",
                  useScrolledStyle ? "text-primary" : "text-white"
                )}
              />
              <Button
                asChild
                className={cn(
                  "rounded-full px-8 h-12 font-semibold text-white transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-xl",
                  "bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40"
                )}
              >
                <a href="tel:+46762498486" className="flex items-center gap-2">
                  <span className="relative z-10">{t("nav.inquiryForm")}</span>
                </a>
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <LanguageSwitcher
            className={useScrolledStyle ? "text-primary" : "text-white"}
          />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "p-2 rounded-xl transition-all duration-300",
              useScrolledStyle ? "text-primary hover:bg-primary/5" : "text-white hover:bg-white/10"
            )}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border absolute top-full left-0 right-0 animate-in slide-in-from-top duration-300 shadow-lg">
          <div className="container mx-auto px-6 py-8">
            <ul className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (isHomePage) {
                        handleSectionClick(e, link.href.replace("#", ""));
                      }
                      setIsMenuOpen(false);
                    }}
                    className="block rounded-lg px-4 py-3 text-base text-foreground hover:bg-muted font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <div className="h-px bg-border my-2" />
              <li>
                <Link
                  href="/for-foretag"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-primary font-medium"
                >
                  {t("nav.forCompanies")}
                </Link>
              </li>
              <li>
                <Link
                  href="/for-husagare"
                  className="block px-4 py-2 text-primary font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("nav.homeowner")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blogg"
                  className="block px-4 py-2 text-primary font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blogg
                </Link>
              </li>
              <li className="pt-4">
                <Button
                  asChild
                  className="w-full rounded-full bg-[#ff6300] hover:bg-[#ff6300]/90 text-white font-medium h-12 shadow-sm"
                >
                  <a
                    href="tel:+46762498486"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.inquiryForm")}
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
