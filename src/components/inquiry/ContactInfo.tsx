import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
const ContactInfo = () => {
  const {
    t
  } = useLanguage();
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-nordic-900">{t('inquiry.contactInfo.title')}</h3>
      <div className="space-y-4">
        <a
          href="mailto:kajsa@stayonsite.se"
          className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6300]/10 text-[#ff6300]">
            <Mail className="h-5 w-5" />
          </span>
          <span className="font-medium text-nordic-900">kajsa@stayonsite.se</span>
        </a>
        <a
          href="tel:+46736287709"
          className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6300]/10 text-[#ff6300]">
            <Phone className="h-5 w-5" />
          </span>
          <span className="font-medium text-nordic-900">+46 736 28 77 09</span>
        </a>
        <div className="flex items-start gap-4 rounded-2xl border border-white bg-white/70 px-4 py-3 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6300]/10 text-[#ff6300] mt-1">
            <MapPin className="h-5 w-5" />
          </span>
          <span className="text-nordic-800 font-light">
            StayOnSite AB
            <br />
            11646 Stockholm
          </span>
        </div>
      </div>
    </div>
  );
};
export default ContactInfo;
