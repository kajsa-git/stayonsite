import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, KeyRound, RefreshCcw } from 'lucide-react';

const WhyStayOnSite = () => {
  const { t } = useLanguage();

  const serviceCards = [
    {
      id: 'planering',
      icon: ClipboardList,
      number: '01',
      title: t('services.card1.title'),
      highlight: t('services.card1.highlight'),
      description: t('services.card1.description'),
      bullets: [
        t('services.card1.bullet1'),
        t('services.card1.bullet2'),
        t('services.card1.bullet3'),
      ],
      cta: { label: t('services.card1.cta'), href: '#inquiry' },
    },
    {
      id: 'kontrakt',
      icon: KeyRound,
      number: '02',
      title: t('services.card2.title'),
      highlight: t('services.card2.highlight'),
      description: t('services.card2.description'),
      bullets: [
        t('services.card2.bullet1'),
        t('services.card2.bullet2'),
        t('services.card2.bullet3'),
      ],
      cta: { label: t('services.card2.cta'), href: 'tel:+46736287709' },
    },
    {
      id: 'drift',
      icon: RefreshCcw,
      number: '03',
      title: t('services.card3.title'),
      highlight: t('services.card3.highlight'),
      description: t('services.card3.description'),
      bullets: [
        t('services.card3.bullet1'),
        t('services.card3.bullet2'),
        t('services.card3.bullet3'),
      ],
      cta: { label: t('services.card3.cta'), href: 'https://wa.me/46736287709' },
    },
  ];

  return (
    <section id="why" className="bg-nordic-100 py-16 md:py-20 border-b border-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-sm uppercase tracking-widest text-nordic-500 font-heading mb-3">{t('why.title')}</p>
          <p className="text-3xl md:text-4xl text-nordic-900 font-semibold leading-snug">{t('why.subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map(({ id, icon: Icon, number, title, highlight, description, bullets, cta }) => (
            <article
              key={id}
              className="relative h-full rounded-3xl border border-nordic-100 bg-white p-6 shadow-sm transition hover:shadow-xl"
            >
              <div className="flex items-center gap-3 text-nordic-500 text-sm tracking-[0.35em] font-heading">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff6300]/10 text-[#ff6300] text-lg font-semibold">
                  {number}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-nordic-900">{title}</h3>
              <p className="text-sm uppercase tracking-wide text-[#ff6300] mt-2">{highlight}</p>
              <p className="mt-4 text-sm text-nordic-700 leading-relaxed">{description}</p>
              <ul className="mt-5 space-y-2 text-sm text-nordic-800">
                {bullets.filter(bullet => bullet).map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff6300]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <a
                href={cta.href}
                className="mt-6 inline-flex items-center text-sm font-semibold text-[#ff6300] hover:text-[#e25200]"
              >
                {cta.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyStayOnSite;
