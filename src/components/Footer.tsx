'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  return <footer id="contact" className="bg-nordic-800 text-white nordic-texture border-t border-nordic-700">
      <div className="container mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">StayOnSite</p>
            <p className="text-white/80">
              {t('footer.description')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white h-11 px-5">
                <a href="tel:+46762498486">
                  <Phone size={16} className="mr-2" />
                  {t('nav.inquiryForm')}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 hover:bg-white/20 text-white h-11 px-5"
              >
                <a href="https://wa.me/46762498486" target="_blank" rel="noreferrer">
                  <MessageCircle size={16} className="mr-2" />
                  {t('hero.ctaWhatsapp')}
                </a>
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">{t('footer.contact')}</h3>
            <address className="not-italic space-y-6">
              <div className="flex items-center">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-white/40">
                  <Phone size={18} className="text-[#ff6300]" />
                </div>
                <a href="tel:+46762498486" className="font-medium hover:text-[#ff6300] transition-colors duration-300">
                  +46 76-249 84 86
                </a>
              </div>
              <div className="flex items-center">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-white/40">
                  <Mail size={18} className="text-[#ff6300]" />
                </div>
                <a href="mailto:info@stayonsite.se" className="font-medium hover:text-[#ff6300] transition-colors duration-300">
                  info@stayonsite.se
                </a>
              </div>
              <div className="flex items-center">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-white/40">
                  <MapPin size={18} className="text-[#ff6300]" />
                </div>
                <span className="font-light text-white/80">{t('footer.location')}</span>
              </div>
            </address>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white">{t('footer.quickLinks')}</h3>
            <ul className="grid grid-cols-1 gap-4">
              <li>
                <a href="/#references" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  {t('nav.references')}
                </a>
              </li>
              <li>
                <a href="/#cities" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  {t('nav.services')} – Städer
                </a>
              </li>
              <li>
                <a href="/for-husagare" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  {t('nav.homeowner')}
                </a>
              </li>
              <li>
                <a href="/for-foretag" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  {t('nav.forCompanies')}
                </a>
              </li>
              <li>
                <a href="/om-oss" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  {t('nav.about') || 'Om oss'}
                </a>
              </li>
              <li>
                <a href="/kontakt" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  Kontakt
                </a>
              </li>
              <li>
                <a href="/blogg" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  Blogg
                </a>
              </li>
              <li>
                <a href="/en/corporate-housing-sweden" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  Corporate Housing (EN)
                </a>
              </li>
              <li>
                <a href="/pl/zakwaterowanie-firmowe" className="font-light flex items-center hover:text-white transition-colors duration-300">
                  <div className="h-px w-6 bg-white/40 mr-3"></div>
                  Zakwaterowanie Firmowe (PL)
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 text-center border-t border-white/10">
          <p className="font-light text-white/50">&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
          <p className="font-light text-white/40 mt-2">{t('footer.care')}</p>
        </div>
      </div>
    </footer>;
};
export default Footer;
