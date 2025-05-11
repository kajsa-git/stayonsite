
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-construction-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">StayOn<span className="text-secondary-500">Site</span></h3>
            <p className="mb-4 text-gray-300">
              Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-secondary-500" />
                <a href="tel:+46701234567" className="hover:text-secondary-500 transition-colors">+46 70 123 45 67</a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-secondary-500" />
                <a href="mailto:info@stayonsite.se" className="hover:text-secondary-500 transition-colors">info@stayonsite.se</a>
              </li>
              <li className="flex items-center">
                <MapPin size={18} className="mr-2 text-secondary-500" />
                <span>Stockholm, Sverige</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Snabblänkar</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-secondary-500 transition-colors">{t('nav.home')}</a>
              </li>
              <li>
                <a href="#services" className="hover:text-secondary-500 transition-colors">{t('nav.services')}</a>
              </li>
              <li>
                <a href="#references" className="hover:text-secondary-500 transition-colors">{t('nav.references')}</a>
              </li>
              <li>
                <a href="#inquiry" className="hover:text-secondary-500 transition-colors">{t('nav.inquiryForm')}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
