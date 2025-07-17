import { Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const FloatingPhoneButton = () => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50 lg:hidden">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="tel:+46762498486"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110"
              aria-label={t('floatingPhone.call')}
            >
              <Phone 
                size={24} 
                className="text-primary-foreground group-hover:scale-110 transition-transform duration-300" 
              />
            </a>
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            className="bg-foreground text-background border-foreground/20"
          >
            <p className="text-sm font-medium">{t('floatingPhone.tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FloatingPhoneButton;