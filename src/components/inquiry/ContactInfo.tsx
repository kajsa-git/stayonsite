import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const ContactInfo = () => {
  const {
    t
  } = useLanguage();
  return <div>
      <h3 className="text-xl font-normal mb-8 text-nordic-900">{t('inquiry.contactInfo.title')}</h3>
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-nordic-500" />
          </div>
          <a href="mailto:kajsa@stayonsite.se" className="mb-6 leading-relaxed font-light text-amber-900">kajsa@stayonsite.se</a>
        </div>
        <div className="flex items-center">
          <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-amber-900" />
          </div>
          <a href="tel:+46736287709" className="mb-6 leading-relaxed font-light text-amber-900">+46 736 28 77 09</a>
        </div>
        <div className="flex items-start">
          <div className="mr-4 bg-white w-10 h-10 rounded-full flex items-center justify-center mt-1">
            <MapPin className="h-5 w-5 text-nordic-500" />
          </div>
          <span className="mb-6 leading-relaxed font-light text-amber-900">
            StayOnSite AB<br />11646 Stockholm
          </span>
        </div>
      </div>
    </div>;
};
export default ContactInfo;