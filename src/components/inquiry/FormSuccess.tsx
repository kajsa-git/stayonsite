'use client'

import { useLanguage } from '@/contexts/LanguageContext';

const FormSuccess = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-normal text-nordic-900 mb-2">
        {language === 'sv' ? 'Tack!' : 'Thank you!'}
      </h3>
      <p className="text-nordic-800 font-light">{t('inquiry.form.success')}</p>
    </div>
  );
};

export default FormSuccess;
