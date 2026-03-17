'use client'

import { Button } from '@/components/ui/button';
import { ArrowRight, Phone } from 'lucide-react';

interface MobileStickyFormCTAProps {
  targetId: string;
  primaryLabel: string;
  phoneLabel: string;
  phoneHref?: string;
}

const MobileStickyFormCTA = ({
  targetId,
  primaryLabel,
  phoneLabel,
  phoneHref = 'tel:+46762498486',
}: MobileStickyFormCTAProps) => {
  const scrollToForm = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:hidden">
      <div className="rounded-2xl border border-nordic-200 bg-white/95 p-2 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={scrollToForm}
            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#ff6300] to-[#ff8533] text-white font-semibold"
          >
            <span className="truncate">{primaryLabel}</span>
            <ArrowRight size={16} className="ml-2 shrink-0" />
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-12 px-4 rounded-xl border-nordic-200"
          >
            <a href={phoneHref}>
              <Phone size={16} className="mr-2 shrink-0" />
              <span className="truncate">{phoneLabel}</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileStickyFormCTA;
