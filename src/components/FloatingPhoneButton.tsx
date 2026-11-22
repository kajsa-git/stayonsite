'use client'

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackWhatsAppClick } from '@/lib/gtag';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const FloatingPhoneButton = ({ className }: { className?: string }) => {
  const { t } = useLanguage();
  const [hideButton, setHideButton] = useState(false);

  useEffect(() => {
    // Dölj knappen när ett formulär syns, så att den inte täcker fält. Registreringen
    // på /for-husagare dyker upp först efter kortformuläret, därför bevakas DOM:en.
    const ids = ['inquiry', 'homeowner-form', 'property-intake'];
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
        setHideButton([...visible.values()].some(Boolean));
      },
      { threshold: 0.2 }
    );
    const observed = new Set<Element>();
    const scan = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && !observed.has(el)) {
          observed.add(el);
          observer.observe(el);
        }
      });
      observed.forEach((el) => {
        if (!el.isConnected) {
          observer.unobserve(el);
          observed.delete(el);
          visible.delete(el);
        }
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  if (hideButton) return null;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 xl:hidden', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href="https://wa.me/46762498486"
              onClick={trackWhatsAppClick}
              target="_blank"
              rel="noreferrer"
              className="group flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#1EBE59] transition-all duration-300 hover:scale-110"
              aria-label={t('floatingPhone.whatsapp')}
            >
              <MessageCircle
                size={28}
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
