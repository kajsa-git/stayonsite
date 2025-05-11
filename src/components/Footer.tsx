
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-2xl font-bold mb-6">Stay<span className="text-secondary-500">On</span><span className="text-primary-600">Site</span></h3>
            <p className="mb-6 text-gray-600 leading-relaxed">
              Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">{t('footer.contact')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <Phone size={18} className="text-primary-600" />
                </div>
                <a href="tel:+46701234567" className="hover:text-primary-600 transition-colors">+46 70 123 45 67</a>
              </li>
              <li className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <Mail size={18} className="text-primary-600" />
                </div>
                <a href="mailto:info@stayonsite.se" className="hover:text-primary-600 transition-colors">info@stayonsite.se</a>
              </li>
              <li className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <MapPin size={18} className="text-primary-600" />
                </div>
                <span>Stockholm, Sverige</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6">Snabblänkar</h3>
            <ul className="grid grid-cols-2 gap-3">
              <li>
                <a href="#home" className="hover:text-primary-600 transition-colors flex items-center">
                  <span className="bg-gray-200 w-2 h-2 rounded-full mr-2"></span>
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-primary-600 transition-colors flex items-center">
                  <span className="bg-gray-200 w-2 h-2 rounded-full mr-2"></span>
                  {t('nav.services')}
                </a>
              </li>
              <li>
                <a href="#references" className="hover:text-primary-600 transition-colors flex items-center">
                  <span className="bg-gray-200 w-2 h-2 rounded-full mr-2"></span>
                  {t('nav.references')}
                </a>
              </li>
              <li>
                <a href="#inquiry" className="hover:text-primary-600 transition-colors flex items-center">
                  <span className="bg-gray-200 w-2 h-2 rounded-full mr-2"></span>
                  {t('nav.inquiryForm')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 text-center text-gray-500 border-t border-gray-200">
          <p>&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
