import { useState, useEffect } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const StickyContact = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    const handleScroll = () => {
      // Show after scrolling past hero (approx 600px)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white rounded-2xl shadow-lg border border-nordic-200 p-6 max-w-sm">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 text-nordic-400 hover:text-nordic-600 transition-colors"
          aria-label="Stäng"
        >
          <X size={18} />
        </button>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-nordic-900 mb-1">{t('stickyContact.title')}</p>
            <p className="text-xs text-nordic-600 font-light">{t('stickyContact.subtitle')}</p>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white"
              size="sm"
            >
              <a href="tel:+46736287709">
                <Phone size={16} className="mr-2" />
                {t('stickyContact.call')}
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex-1 rounded-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
              size="sm"
            >
              <a href="https://wa.me/46736287709" target="_blank" rel="noreferrer">
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyContact;
