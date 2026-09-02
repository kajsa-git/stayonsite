'use client'

import LpCorporateForm from '@/components/lp/LpCorporateForm';
import { useUtmCapture } from '@/hooks/use-utm-capture';
import { trackPhoneClick } from '@/lib/gtag';
import { Button } from '@/components/ui/button';
import { Sofa, FileText, CalendarClock, MapPin, ArrowUp, Phone } from 'lucide-react';

const BADGES = [
  { icon: Sofa, title: 'Furnished & equipped', text: 'Beds, kitchen, WiFi, laundry — move-in ready from day one.' },
  { icon: FileText, title: 'One contact, one invoice', text: 'We handle everything. No middlemen, no hidden fees.' },
  { icon: CalendarClock, title: 'Flexible terms', text: 'From two weeks to several years — scaled to your project.' },
  { icon: MapPin, title: 'Nationwide', text: 'Housing for your workforce anywhere in Sweden.' },
];

const LpCorporateHousing = () => {
  const utmParams = useUtmCapture();

  const scrollToForm = () => {
    document.getElementById('lp-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Simple logo bar — NOT clickable */}
      <div className="flex items-center justify-center h-14 border-b border-primary/5 bg-white">
        <span className="text-xl font-heading font-bold text-primary tracking-tight">
          Stay<span className="text-accent">On</span>Site
        </span>
      </div>

      <main>
        <LpCorporateForm utmParams={utmParams} />

        {/* Trust / benefits */}
        <section className="bg-nordic-50 border-y border-primary/5 py-12 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BADGES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center sm:text-left">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-bold text-primary mb-1">{title}</h3>
                <p className="text-sm text-primary/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-primary py-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-6">
              Housing for your team — sorted.
            </h2>
            <Button
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-gradient-to-r from-[#ff6300] to-[#ff8533] text-white font-bold h-14 px-10 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mx-auto"
            >
              <span className="text-base">Get a quote</span>
              <ArrowUp size={18} />
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Phone size={14} className="text-white/50" />
              <a
                href="tel:+46762498486"
                onClick={trackPhoneClick}
                className="text-sm text-white/60 hover:text-white transition-colors font-medium"
              >
                +46 76-249 84 86
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LpCorporateHousing;
