import { MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const FloatingPhoneButton = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 lg:hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="tel:+46736287709"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110"
              aria-label={t('floatingPhone.call')}
            >
              <Phone
                size={24}
                className="text-primary-foreground group-hover:scale-110 transition-transform duration-300"
              />
            </a>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-foreground text-background border-foreground/20">
            <p className="text-sm font-medium">{t('floatingPhone.tooltip')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://wa.me/46736287709"
              target="_blank"
              rel="noreferrer"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#1EBE59] transition-all duration-300 hover:scale-110"
              aria-label={t('floatingPhone.whatsapp')}
            >
              <MessageCircle
                size={24}
                className="text-white group-hover:scale-110 transition-transform duration-300"
              />
            </a>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-foreground text-background border-foreground/20">
            <p className="text-sm font-medium">{t('floatingPhone.whatsappTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FloatingPhoneButton;
