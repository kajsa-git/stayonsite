import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';
const Footer = () => {
  const {
    t
  } = useLanguage();
  const currentYear = new Date().getFullYear();
  return <footer id="contact" className="bg-nordic-100 text-nordic-800 nordic-texture">
      <div className="container mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div>
            <h3 className="text-2xl font-display mb-8 text-slate-700">Stay<span className="text-nordic-500">On</span>Site</h3>
            <p className="\xA7">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-normal mb-8 font-display">{t('footer.contact')}</h3>
            <ul className="space-y-6">
              <li className="flex items-center">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-nordic-300">
                  <Phone size={18} className="text-nordic-500" />
                </div>
                <a href="tel:+46762498486" className="font-light hover:text-nordic-500 transition-colors duration-300">+46 762 49 84 86</a>
              </li>
              <li className="flex items-center">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-nordic-300">
                  <Mail size={18} className="text-nordic-500" />
                </div>
                <a href="mailto:info@stayonsite.se" className="font-light hover:text-nordic-500 transition-colors duration-300">info@stayonsite.se</a>
              </li>
              <li className="flex items-start">
                <div className="mr-4 w-10 h-10 rounded-full flex items-center justify-center border border-nordic-300 mt-1">
                  <MapPin size={18} className="text-nordic-500" />
                </div>
                <span className="font-light">Stockholm, Sverige</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-normal mb-8 font-display">{t('footer.quickLinks')}</h3>
            <ul className="grid grid-cols-1 gap-5">
              <li>
                <a href="#references" className="font-light flex items-center hover:text-nordic-500 transition-colors duration-300">
                  <div className="h-px w-6 bg-nordic-400 mr-3"></div>
                  {t('nav.references')}
                </a>
              </li>
              <li>
                <a href="#inquiry" className="font-light flex items-center hover:text-nordic-500 transition-colors duration-300">
                  <div className="h-px w-6 bg-nordic-400 mr-3"></div>
                  {t('nav.inquiryForm')}
                </a>
              </li>
              <li>
                <a href="/for-husagare" className="font-light flex items-center hover:text-nordic-500 transition-colors duration-300">
                  <div className="h-px w-6 bg-nordic-400 mr-3"></div>
                  För husägare
                </a>
              </li>
              <li>
                <a href="#services" className="font-light flex items-center hover:text-nordic-500 transition-colors duration-300">
                  <div className="h-px w-6 bg-nordic-400 mr-3"></div>
                  För byggbolag
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 text-center text-nordic-600 border-t border-nordic-200">
          <p className="font-light">&copy; {currentYear} StayOnSite. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;