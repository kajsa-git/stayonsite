
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, KeyRound, RefreshCcw } from 'lucide-react';

const serviceCards = [
  {
    id: 'planering',
    icon: ClipboardList,
    number: '01',
    title: 'Planering & förslag',
    highlight: 'Besked inom 15 minuter',
    description:
      'Skicka förfrågan via formulär, mail eller WhatsApp. Vi kartlägger lokala värdar och återkommer med 2–3 passande alternativ – oftast inom 15 minuter, alltid inom ett dygn.',
    bullets: [
      'Sverigeomfattande nätverk av värdar',
      'Alternativ med egna eller delade sovrum',
      'Möblerade hem med gemensamma ytor',
    ],
    cta: { label: 'Skicka förfrågan →', href: '#inquiry' },
  },
  {
    id: 'kontrakt',
    icon: KeyRound,
    number: '02',
    title: 'Kontrakt & inflytt',
    highlight: 'Smidiga 3–36 mån villkor',
    description:
      'Ni väljer det boende som passar teamet. Vi hanterar hyresavtal, nycklar och inventeringar och ser till att varje arbetare får praktisk info innan inflytt, på svenska eller engelska.',
    bullets: [
      'Hyresavtal redo för signering',
      'Möbler, sänglinne och köksutrustning ingår',
      'Support via telefon eller WhatsApp',
    ],
    cta: { label: 'Ring oss nu →', href: 'tel:+46736287709' },
  },
  {
    id: 'drift',
    icon: RefreshCcw,
    number: '03',
    title: 'Drift & rapportering',
    highlight: 'Ni bygger – vi driver hemmet',
    description:
      'Vi följer projektet tills sista personen flyttar ut och underhåller boendet när det behövs. Ni får statusrapporter direkt och slipper mellanhänder.',
    bullets: [
      'Underhåll vid behov',
      'Direktkontakt vid frågor eller byten',
      'Slutstäd och överlämning',
    ],
    cta: { label: 'Fråga om drift →', href: 'https://wa.me/46736287709' },
  },
];

const Services = () => {
  const { t } = useLanguage();

  return (
    <section id="services" className="section-spacing bg-nordic-100">
      <div className="container mx-auto px-6 md:px-8">
        <div className="mb-12 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900">
            {t('services.title')}
          </h2>
          <p className="mt-4 text-base md:text-lg text-nordic-700 font-light leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {serviceCards.map(({ id, icon: Icon, number, title, highlight, description, bullets, cta }) => (
            <article
              key={id}
              className="relative h-full rounded-3xl border border-nordic-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-3 text-nordic-500 text-sm tracking-[0.35em] font-heading">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff6300]/10 text-[#ff6300]">
                  <Icon className="h-5 w-5" />
                </span>
                {number}
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-nordic-900">{title}</h3>
              <p className="text-sm uppercase tracking-wide text-[#ff6300] mt-2">{highlight}</p>
              <p className="mt-4 text-sm text-nordic-700 leading-relaxed">{description}</p>
              <ul className="mt-5 space-y-2 text-sm text-nordic-800">
                {bullets.map((bullet) => (
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

export default Services;
