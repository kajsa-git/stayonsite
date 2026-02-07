import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart3 } from 'lucide-react';

const MarketContext = () => {
  const { language } = useLanguage();

  const t = (sv: string, en: string, pl: string) => {
    if (language === 'en') return en;
    if (language === 'pl') return pl;
    return sv;
  };

  const quotes = [
    {
      text: t(
        '"Bostadsbristen i Sverige uppgår till 52 300 bostäder per år, medan bara 35 000 beräknas påbörjas under 2026."',
        '"The housing deficit in Sweden amounts to 52,300 units per year, while only 35,000 are estimated to start in 2026."',
        '"Deficyt mieszkaniowy w Szwecji wynosi 52 300 jednostek rocznie, podczas gdy w 2026 roku szacuje się rozpoczęcie budowy zaledwie 35 000."'
      ),
      source: t(
        'Boverket, Indikatorer för bostadsbyggande, december 2025',
        'Boverket (National Board of Housing), Housing Construction Indicators, December 2025',
        'Boverket (Krajowa Rada Mieszkalnictwa), Wskaźniki budownictwa mieszkaniowego, grudzień 2025'
      ),
    },
    {
      text: t(
        '"Energirelaterade investeringar ökar med 18 procent under perioden 2024–2026, vilket driver en kraftigt ökad efterfrågan på personalboende i hela Sverige."',
        '"Energy-related investments are increasing by 18 percent during 2024–2026, driving a sharply rising demand for worker accommodation across Sweden."',
        '"Inwestycje związane z energią rosną o 18 procent w okresie 2024–2026, co powoduje gwałtownie rosnące zapotrzebowanie na zakwaterowanie pracownicze w całej Szwecji."'
      ),
      source: t(
        'Byggföretagen, Konjunkturrapport 2025',
        'Byggföretagen (Swedish Construction Federation), Economic Report 2025',
        'Byggföretagen (Szwedzka Federacja Budownictwa), Raport koniunkturalny 2025'
      ),
    },
    {
      text: t(
        '"Sysselsättningen i byggbranschen beräknas öka till 369 500 personer under 2025–2026 – en ökning som kräver flexibla boendelösningar nära projektplatserna."',
        '"Employment in the construction industry is expected to rise to 369,500 people during 2025–2026 – an increase that demands flexible housing solutions near project sites."',
        '"Zatrudnienie w branży budowlanej ma wzrosnąć do 369 500 osób w latach 2025–2026 – wzrost wymagający elastycznych rozwiązań mieszkaniowych blisko miejsc projektów."'
      ),
      source: t(
        'Byggföretagen, Byggindikatorn Q4 2025',
        'Byggföretagen (Swedish Construction Federation), Construction Indicator Q4 2025',
        'Byggföretagen (Szwedzka Federacja Budownictwa), Wskaźnik budownictwa Q4 2025'
      ),
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-nordic-100">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-[#ff6300] mb-3 text-sm uppercase tracking-[0.3em] font-heading">
            <BarChart3 size={16} />
            {t('Marknadsdata', 'Market data', 'Dane rynkowe')}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
            {t(
              'Varför behovet av personalboende växer',
              'Why the need for worker accommodation is growing',
              'Dlaczego rośnie zapotrzebowanie na zakwaterowanie pracownicze'
            )}
          </h2>
          <p className="text-nordic-600 max-w-2xl mx-auto font-light">
            {t(
              'Officiella källor bekräftar en kraftigt ökad efterfrågan på tillfälliga bostäder för byggsektorn och industrin.',
              'Official sources confirm a sharply rising demand for temporary housing for the construction sector and industry.',
              'Oficjalne źródła potwierdzają gwałtownie rosnące zapotrzebowanie na tymczasowe zakwaterowanie dla sektora budowlanego i przemysłu.'
            )}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="bg-nordic-50 rounded-2xl p-8 border border-nordic-100 flex flex-col justify-between"
            >
              <p className="text-nordic-800 font-medium leading-relaxed mb-6 text-[15px]">
                {quote.text}
              </p>
              <cite className="text-sm text-nordic-500 not-italic block border-t border-nordic-200 pt-4">
                {quote.source}
              </cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketContext;
