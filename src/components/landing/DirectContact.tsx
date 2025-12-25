import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface DirectContactProps {
  language: 'en' | 'pl';
  className?: string;
}

const phoneNumber = '+46762498486';
const phoneHref = `tel:${phoneNumber}`;

const whatsappMessages = {
  en: "Hi, I'm looking for corporate housing in Sweden for my team.",
  pl: "Cześć, szukam zakwaterowania firmowego w Szwecji dla mojego zespołu."
};

const labels = {
  en: {
    call: 'Call Us Now',
    whatsapp: 'WhatsApp Us'
  },
  pl: {
    call: 'Zadzwoń Teraz',
    whatsapp: 'Napisz na WhatsApp'
  }
};

const DirectContact = ({ language, className = '' }: DirectContactProps) => {
  const whatsappHref = `https://wa.me/46762498486?text=${encodeURIComponent(whatsappMessages[language])}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`flex flex-col sm:flex-row gap-4 ${className}`}
    >
      <Button
        className="group rounded-full h-14 sm:h-16 px-8 sm:px-10 bg-accent hover:bg-accent/90 text-white text-base sm:text-lg font-bold shadow-2xl shadow-accent/40 transition-all duration-300 hover:scale-105 active:scale-95"
        asChild
      >
        <a href={phoneHref} className="flex items-center gap-3">
          <Phone size={22} className="group-hover:rotate-12 transition-transform" />
          {labels[language].call}
        </a>
      </Button>

      <Button
        className="group rounded-full h-14 sm:h-16 px-8 sm:px-10 bg-[#25D366] hover:bg-[#20BD5A] text-white text-base sm:text-lg font-bold shadow-2xl shadow-[#25D366]/30 transition-all duration-300 hover:scale-105 active:scale-95"
        asChild
      >
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex items-center gap-3">
          <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
          {labels[language].whatsapp}
        </a>
      </Button>
    </motion.div>
  );
};

export default DirectContact;
