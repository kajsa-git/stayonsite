import Link from "next/link";

// Arbetsbeskrivningar — hur CRM:et är tänkt att användas, flöde för flöde.
// Länkas från BottomBar (#-ankare per sektion). Ren serverkomponent, statiskt
// innehåll: uppdatera texten här när ett flöde ändras, i samma PR som flödet.

const SECTIONS = [
  {
    id: "forfragan",
    title: "Ny förfrågan",
    steps: [
      "Förfrågningar landar som Inkommen — antingen från hemsidans formulär (företaget och kontakten skapas automatiskt) eller manuellt via Nytt företag → Ny förfrågan.",
      "Kontrollera stad, antal personer, period och budget. Sätt uppföljningsdatum om kunden ska jagas.",
      "Öppna Matcha förfrågan och sök i objektsbanken — filtrera på ort, bäddar, hyra, betyg och max km till arbetsadressen (kör-avstånd), eller sortera närmast först. Förslag läggs alltid till manuellt.",
    ],
  },
  {
    id: "matchning",
    title: "Matchning & erbjudande",
    steps: [
      "Lägg till objekt som förslag från listan till höger. Kalkylen på varje förslag räknar marginal per scenario — Bas-scenariot förifyller allt senare.",
      "Skapa kundlänken i panelen Kundens länk. Första gången kunden öppnar den signeras uppdragsbekräftelsen (ingen direktkontakt med uthyrare, inga prisdiskussioner utanför StayOnSite) — före dess visas inget erbjudande.",
      "Skicka erbjudande stämplar pris, period och notis på affären. Villkoren ligger fast även om objektets listpriser ändras efteråt — kundens sida visar alltid det stämplade priset, aldrig adress, uthyrare eller inpris.",
      "Dela länken via SMS-knappen (färdig text med www-länk — https-länkar fastnar i operatörsfiltren). Panelen visar när kunden öppnat sidan.",
      "Villkor uthyrare stämplar vad uthyraren lovats (hyra, period, villkor) och markerar en öppen jaga-runda som bekräftad.",
      "Avtal uthyrare skapar uthyrarens signeringslänk och kopierar SMS-texten. Uthyraren signerar uthyrningsuppdraget (ingen direktkontakt med hyresgästen, villkor via StayOnSite) innan visning — kortet visar 'signerat av …' när det är klart. Boka aldrig visning förrän båda avtalen är signerade.",
    ],
  },
  {
    id: "uthyrare",
    title: "Uthyrare & objekt",
    steps: [
      "Nya uthyrare kommer in via husägarformuläret eller läggs in manuellt; objekt kan även importeras från Qasa/Airbnb-länk eller registreras av uthyraren själv via /registrera-bostad.",
      "Jaga-rundor (ej kontaktad → kontaktad → i dialog → bekräftad/nej) håller ordning på var dialogen står — de dyker upp i Min dag under Följ upp uthyrare.",
      "SMS skrivs som utkast och skickas aldrig utan ditt godkännande i utkastpanelen. Svar läses in automatiskt från Messages och hamnar under Svar i Min dag.",
      "Ett JA på publiceringsfrågan → publiceringsflödet: AI-beskrivning, publicera på /boenden och länk-SMS som utkast. Publikt visas aldrig exakt adress eller ägarkontakt — bara postnummer.",
    ],
  },
  {
    id: "vinna-fakturera",
    title: "Vinna & fakturera",
    steps: [
      "Acceptera på ett förslag när kunden sagt ja: affären blir Vunnen, objektet reserveras och andra kunders öppna förslag på samma objekt stängs automatiskt (deras länkar visar \"inte längre tillgängligt\").",
      "Månadsvärdet förifylls från det stämplade erbjudandepriset — det är det som faktureras.",
      "Fakturerad kräver inflyttningsdatum + utflyttningsdatum (eller löpande). In- och avflytt bockas av i checklistorna; klarmarkerad avflytt gör objektet tillgängligt igen.",
      "Tackar kunden nej: sätt Nej tack med anledning — kundlänken dör automatiskt.",
      "Förlängningsradarn flaggar vunna affärer som närmar sig slutdatum — förläng eller avfärda.",
    ],
  },
  {
    id: "min-dag",
    title: "Min dag & köerna",
    steps: [
      "Min dag är startpunkten varje morgon: Svar (inkomna SMS), Att kontakta (uppföljningar som förfallit), Öppna uppdrag, Ska faktureras och Följ upp uthyrare.",
      "Arbetsläget (öppna en kö) går igenom ärendena ett i taget så inget hoppas över.",
      "Footern längst ner visar dagens köer var du än är — siffrorna är klickbara.",
    ],
  },
];

export function GuideView() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold">Så arbetar vi</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-8">
        Flödena i CRM:et, steg för steg. Uppdatera beskrivningarna när flödena ändras — i samma ändring.
      </p>

      <nav className="mb-8 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-input bg-white px-3 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            {s.title}
          </Link>
        ))}
      </nav>

      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="bg-white rounded-xl border p-5 scroll-mt-20">
            <h2 className="text-sm font-semibold mb-3">{s.title}</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-nordic-800">
              {s.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
