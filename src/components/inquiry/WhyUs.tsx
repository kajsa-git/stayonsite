
import { useLanguage } from '@/contexts/LanguageContext';

const WhyUs = () => {
  const { t } = useLanguage();
  
  return (
    <div className="mt-12">
      <h4 className="text-lg font-semibold mb-6 text-nordic-900">{t('services.whyus.title')}</h4>
      <ul className="space-y-4">
        <li className="flex items-center">
          <div className="h-1 w-6 bg-[#ff6300] mr-4 rounded-full"></div>
          <span className="font-light">{t('services.whyus.point1')}</span>
        </li>
        <li className="flex items-center">
          <div className="h-1 w-6 bg-[#ff6300] mr-4 rounded-full"></div>
          <span className="font-light">{t('services.whyus.point2')}</span>
        </li>
        <li className="flex items-center">
          <div className="h-1 w-6 bg-[#ff6300] mr-4 rounded-full"></div>
          <span className="font-light">{t('services.whyus.point3')}</span>
        </li>
        <li className="flex items-center">
          <div className="h-1 w-6 bg-[#ff6300] mr-4 rounded-full"></div>
          <span className="font-light">{t('services.whyus.point4')}</span>
        </li>
      </ul>
    </div>
  );
};

export default WhyUs;
