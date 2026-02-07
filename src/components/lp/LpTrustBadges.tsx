import { useLanguage } from '@/contexts/LanguageContext';
import { Users, ShieldCheck, Clock, CreditCard } from 'lucide-react';

const LpTrustBadges = () => {
  const { t } = useLanguage();

  const badges = [
    {
      icon: Users,
      value: t('homeowner.hero.stats.homeowners'),
      label: t('homeowner.hero.stats.homeownersLabel'),
    },
    {
      icon: ShieldCheck,
      value: t('homeowner.hero.stats.fee'),
      label: t('homeowner.hero.stats.feeLabel'),
    },
    {
      icon: Clock,
      value: t('homeowner.hero.stats.guarantee'),
      label: t('homeowner.hero.stats.guaranteeLabel'),
    },
    {
      icon: CreditCard,
      value: 'Förskott',
      label: 'betalning varje månad',
    },
  ];

  return (
    <section className="bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent shrink-0">
                <badge.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-primary leading-tight">{badge.value}</div>
                <div className="text-xs text-primary/50">{badge.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LpTrustBadges;
