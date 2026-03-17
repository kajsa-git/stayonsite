'use client'

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { CheckCircle2, X, Minus } from 'lucide-react';

const rowLabels: Record<string, Record<string, string>> = {
  sv: {
    row1: 'Garanterad fast hyra',
    row2: 'Personlig kontakt med grundare',
    row3: 'Företagshyresgäster (ej privata)',
    row4: 'Inga avdrag från din hyra',
    row5: 'Besiktning & fotodokumentation',
    row6: 'Avgift från din hyra',
    colSelf: 'Egen uthyrning',
    colOthers: 'Andra aktörer',
  },
  en: {
    row1: 'Guaranteed fixed rent',
    row2: 'Personal contact with founder',
    row3: 'Corporate tenants (not private)',
    row4: 'No deductions from your rent',
    row5: 'Inspection & photo documentation',
    row6: 'Fee from your rent',
    colSelf: 'DIY rental',
    colOthers: 'Other platforms',
  },
  pl: {
    row1: 'Gwarantowany stały czynsz',
    row2: 'Osobisty kontakt z założycielką',
    row3: 'Najemcy firmowi (nie prywatni)',
    row4: 'Brak potrąceń z czynszu',
    row5: 'Inspekcja i dokumentacja',
    row6: 'Opłata z Twojego czynszu',
    colSelf: 'Samodzielny wynajem',
    colOthers: 'Inne platformy',
  },
};

const HomeownerComparison = () => {
  const { t, language } = useLanguage();
  const labels = rowLabels[language] || rowLabels.sv;

  const rows = [
    { label: labels.row1, self: false, stayonsite: true, others: 'partial' as const },
    { label: labels.row2, self: false, stayonsite: true, others: false },
    { label: labels.row3, self: false, stayonsite: true, others: 'partial' as const },
    { label: labels.row4, self: true, stayonsite: true, others: false },
    { label: labels.row5, self: false, stayonsite: true, others: 'partial' as const },
    { label: labels.row6, self: '0 %' as const, stayonsite: '0 %' as const, others: '5–15 %' as const },
  ];

  const renderIcon = (value: boolean | string) => {
    if (value === true) return <CheckCircle2 size={22} className="text-green-500" />;
    if (value === 'partial') return <Minus size={22} className="text-primary/30" />;
    if (value === false) return <X size={22} className="text-primary/20" />;
    return <span className="font-bold text-sm text-primary">{value}</span>;
  };

  return (
    <section className="section-spacing bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
          >
            {t('homeowner.comparison.title')}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary/60 font-medium max-w-2xl mx-auto"
          >
            {t('homeowner.comparison.subtitle')}
          </motion.p>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-3xl border border-primary/10 overflow-hidden shadow-lg">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-primary text-white">
              <div className="p-5 font-display font-bold text-sm md:text-base" />
              <div className="p-5 text-center font-display font-bold text-sm md:text-base text-white/70">
                {labels.colSelf}
              </div>
              <div className="p-5 text-center font-display font-bold text-sm md:text-base bg-accent/20 border-x border-white/10">
                <span className="block">StayOnSite</span>
                <span className="block text-xs font-medium text-white/70 mt-0.5">{t('brand.nollavgift.name')}</span>
              </div>
              <div className="p-5 text-center font-display font-bold text-sm md:text-base text-white/70">
                {labels.colOthers}
              </div>
            </div>

            {/* Table rows */}
            {rows.map((row, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 ${index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'} border-t border-primary/5`}
              >
                <div className="p-5 font-medium text-primary text-sm md:text-base flex items-center">
                  {row.label}
                </div>
                <div className="p-5 flex items-center justify-center">
                  {renderIcon(row.self)}
                </div>
                <div className="p-5 flex items-center justify-center bg-accent/5 border-x border-primary/5">
                  {renderIcon(row.stayonsite)}
                </div>
                <div className="p-5 flex items-center justify-center">
                  {renderIcon(row.others)}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center text-primary/50 text-sm font-medium mt-8 max-w-2xl mx-auto"
          >
            {t('homeowner.comparison.note')}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeownerComparison;
