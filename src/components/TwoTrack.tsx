'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Building2, Home } from 'lucide-react';
import Link from 'next/link';

const TwoTrack = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {/* Företag - larger card */}
          <Link
            href="/for-foretag"
            className="md:col-span-3 group bg-primary rounded-3xl p-10 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-[#ff6300]" />
              <span className="text-sm uppercase tracking-[0.25em] text-white/60 font-heading">
                {t('twotrack.company.tagline')}
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t('twotrack.company.title')}
            </h2>
            <p className="text-white/70 text-lg font-light mb-8 max-w-lg">
              {t('twotrack.company.description')}
            </p>
            <span className="inline-flex items-center gap-2 text-[#ff6300] font-semibold group-hover:gap-3 transition-all">
              {t('twotrack.company.cta')}
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>

          {/* Husägare - smaller card */}
          <Link
            href="/for-husagare"
            className="md:col-span-2 group bg-nordic-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-nordic-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[#ff6300]" />
              <span className="text-sm uppercase tracking-[0.25em] text-nordic-500 font-heading">
                {t('twotrack.homeowner.tagline')}
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-nordic-900 mb-4">
              {t('twotrack.homeowner.title')}
            </h2>
            <p className="text-nordic-600 text-lg font-light mb-8">
              {t('twotrack.homeowner.description')}
            </p>
            <span className="inline-flex items-center gap-2 text-[#ff6300] font-semibold group-hover:gap-3 transition-all">
              {t('twotrack.homeowner.cta')}
              <ArrowRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TwoTrack;
