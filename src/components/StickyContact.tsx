import { useState, useEffect } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

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
    <div className="hidden lg:block fixed bottom-8 left-8 z-40">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-primary/5 p-7 max-w-[320px] relative overflow-hidden"
      >
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-4 right-4 text-primary/30 hover:text-primary/60 transition-colors z-20"
          aria-label="Stäng"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex">
              <div className="w-12 h-12 rounded-2xl overflow-hidden">
                <img src="/images/kajsa.webp" alt="Kajsa" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-tight">{t('stickyContact.title')}</p>
              <p className="text-[11px] text-primary/50 font-medium mt-1">Vi svarar oftast direkt!</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full rounded-xl bg-gradient-to-r from-[#ff6300] to-[#ff8533] hover:shadow-[#ff6300]/40 text-white font-bold h-12 shadow-lg transition-all hover:scale-[1.02]"
              size="sm"
            >
              <a href="tel:+46762498486">
                <Phone size={16} className="mr-2" />
                {t('stickyContact.call')}
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl border-primary/10 text-primary/70 hover:bg-primary/5 hover:text-primary/70 font-bold h-12 transition-all"
              size="sm"
            >
              <a href="https://wa.me/46762498486" target="_blank" rel="noreferrer">
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StickyContact;

