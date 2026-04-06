export interface BlogPost {
  slug: string;
  title: { sv: string; en: string; pl: string };
  description: { sv: string; en: string; pl: string };
  author: string;
  publishedDate: string;
  category: string;
  tags: string[];
  readingTime: number;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'personalboende-guide-2026',
    title: {
      sv: 'Personalboende 2026: Komplett guide för byggföretag',
      en: 'Worker Accommodation 2026: Complete Guide for Construction Companies',
      pl: 'Zakwaterowanie pracownicze 2026: Kompletny przewodnik'
    },
    description: {
      sv: 'Allt du behöver veta om personalboende i Sverige 2026. Kostnader, lagar, städer och hur du hittar rätt boendelösning för ditt byggteam.',
      en: 'Everything you need to know about worker accommodation in Sweden 2026. Costs, regulations, cities and how to find the right housing solution.',
      pl: 'Wszystko o zakwaterowaniu pracowniczym w Szwecji 2026. Koszty, przepisy i rozwiązania.'
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-07',
    category: 'Guide',
    tags: ['personalboende', 'byggbolag', 'företagsboende'],
    readingTime: 8
  },
  {
    slug: 'privatuthyrningslagen-reform-2026',
    title: {
      sv: 'Privatuthyrningslagen 2026: Höjt avdrag & nya regler från juli',
      en: 'Swedish Private Rental Act 2026: Higher Deductions & New Rules from July',
      pl: 'Ustawa o wynajmie 2026: Wyższe odliczenia i nowe zasady od lipca'
    },
    description: {
      sv: 'Schablonavdraget höjs till 50 000 kr och blockhyra blir enklare. Så påverkas du som hyr ut din bostad från 1 juli 2026.',
      en: 'The standard deduction rises to SEK 50,000 and block rentals get simpler. How the changes affect you as a landlord from 1 July 2026.',
      pl: 'Odliczenie ryczałtowe rośnie do 50 000 SEK, a wynajem blokowy staje się prostszy. Co zmienia się od 1 lipca 2026.'
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-07',
    category: 'Lagstiftning',
    tags: ['privatuthyrningslagen', 'blockhyra', 'husägare', 'skatt'],
    readingTime: 10
  },
  {
    slug: 'gron-omstallning-norr-boende',
    title: {
      sv: 'Grön omställning i norra Sverige: Boendebehov 2026\u20132030',
      en: 'Green Transition in Northern Sweden: Housing Needs 2026\u20132030',
      pl: 'Zielona transformacja w p\u00f3\u0142nocnej Szwecji: Potrzeby mieszkaniowe 2026\u20132030'
    },
    description: {
      sv: 'H2 Green Steel, LKAB, datacenter och batteriindustrin driver enorm efterfrågan på personalboende i Norrbotten och Västerbotten.',
      en: 'H2 Green Steel, LKAB, data centers and the battery industry drive enormous demand for worker accommodation in northern Sweden.',
      pl: 'H2 Green Steel, LKAB, centra danych i przemysł bateryjny napędzają popyt na zakwaterowanie w północnej Szwecji.'
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-07',
    category: 'Marknad',
    tags: ['norrbotten', 'grön omställning', 'batteriindustri', 'datacenter', 'luleå', 'boden'],
    readingTime: 7
  },
  {
    slug: 'infrastruktur-personalboende-karta-2026',
    title: {
      sv: 'Var behövs personalboende 2026? Infrastrukturkartan',
      en: 'Where Is Worker Housing Needed in 2026? Sweden\'s Biggest Infrastructure Projects',
      pl: 'Gdzie potrzebne zakwaterowanie w 2026? Największe projekty infrastrukturalne Szwecji'
    },
    description: {
      sv: 'Vi kartlägger de största pågående infrastrukturprojekten i Sverige och analyserar var behovet av personalboende är störst under 2026.',
      en: 'We map Sweden\'s largest ongoing infrastructure projects and analyze where the demand for worker accommodation is highest in 2026.',
      pl: 'Mapujemy największe projekty infrastrukturalne w Szwecji i analizujemy zapotrzebowanie na zakwaterowanie pracownicze w 2026.'
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-10',
    category: 'Analys',
    tags: ['infrastruktur', 'personalboende', 'ostlänken', 'norrbotniabanan', 'byggprojekt'],
    readingTime: 8
  },
  {
    slug: 'forsakring-ansvar-personalboende-guide-2026',
    title: {
      sv: 'Försäkring och ansvar vid personalboende – vad gäller?',
      en: 'Insurance and liability for worker accommodation – what applies?',
      pl: 'Ubezpieczenie i odpowiedzialność za zakwaterowanie pracowników – co obowiązuje?',
    },
    description: {
      sv: 'Guide om försäkringar, ansvarsförsäkring och skydd vid uthyrning av personalboende till byggföretag och montörer.',
      en: 'Guide on insurance, liability coverage and protection when renting accommodation to construction companies and contractors.',
      pl: 'Przewodnik po ubezpieczeniach, odpowiedzialności i ochronie przy wynajmie zakwaterowania dla firm budowlanych.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-11',
    category: 'Guide',
    tags: ['försäkring', 'ansvar', 'uthyrning', 'husägare', 'riskhantering'],
    readingTime: 8,
  },
  {
    slug: 'avtalskrav-personalboende-guide-2026',
    title: {
      sv: 'Avtalskrav på personalboende 2026: Guide för företag',
      en: 'Worker Accommodation Contract Requirements 2026: What Applies to Construction Workers?',
      pl: 'Wymagania umowne dotyczące zakwaterowania pracowników 2026: Co obowiązuje?',
    },
    description: {
      sv: 'Kollektivavtal kräver \'tillfredsställande boende\'. Vad betyder det? Guide till avtalskrav, arbetsmiljöregler och vad byggföretag måste erbjuda.',
      en: 'Collective agreements require \'satisfactory accommodation\'. What does that mean? Guide to contract requirements for construction companies.',
      pl: 'Układy zbiorowe wymagają \'odpowiedniego zakwaterowania\'. Co to oznacza? Przewodnik po wymaganiach dla firm budowlanych.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-18',
    category: 'Guide',
    tags: ['kollektivavtal', 'arbetsmiljö', 'montörboende', 'avtalskrav', 'byggföretag'],
    readingTime: 7,
  },
  {
    slug: 'arbetskraftsinvandring-juni-2026-guide-byggforetag',
    title: {
      sv: 'Arbetskraftsinvandring juni 2026: Nya regler för bygg',
      en: 'New Labor Immigration Rules June 2026 – What Construction Companies Need to Know',
      pl: 'Nowe przepisy dotyczące imigracji zarobkowej czerwiec 2026 – co firmy budowlane muszą wiedzieć',
    },
    description: {
      sv: 'Från 1 juni 2026 skärps reglerna för arbetstillstånd. Byggföretag måste anpassa sig – här är din guide till lönekrav, sanktioner och boendekrav.',
      en: 'From June 1, 2026, work permit rules tighten. Construction companies must adapt – here\'s your guide to salary requirements, sanctions and housing.',
      pl: 'Od 1 czerwca 2026 zaostrzają się zasady pozwoleń na pracę. Firmy budowlane muszą dostosować się – przewodnik po wymaganiach płacowych i mieszkaniowych.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-02-25',
    category: 'Lagstiftning',
    tags: ['arbetskraftsinvandring', 'arbetstillstånd', 'byggbranschen', 'montörboende', 'lönekrav'],
    readingTime: 8,
  },
  {
    slug: 'datacenter-montorboende-guide-2026',
    title: {
      sv: 'Datacenterbyggen 2026: Montörboende som flaskhals',
      en: 'Data Center Construction 2026: Why Worker Housing Is the Bottleneck in Swedish Billion-Dollar Investments',
      pl: 'Budowa centrów danych 2026: Dlaczego zakwaterowanie pracowników staje się wąskim gardłem szwedzkich inwestycji',
    },
    description: {
      sv: 'Skellefteå, Borlänge, Gävle – datacenter för 100+ miljarder byggs 2026. Men var ska alla montörer bo? Guide för byggföretag och husägare.',
      en: 'Skellefteå, Borlänge, Gävle – data centers worth 100+ billion SEK under construction in 2026. But where will workers live? Guide for companies & homeowners.',
      pl: 'Skellefteå, Borlänge, Gävle – centra danych o wartości 100+ miliardów SEK budowane w 2026 roku. Ale gdzie będą mieszkać pracownicy?',
    },
    author: 'StayOnSite',
    publishedDate: '2026-03-04',
    category: 'Marknad',
    tags: ['datacenter', 'montörboende', 'byggprojekt', 'infrastruktur', 'norrland'],
    readingTime: 8,
  },
  {
    slug: 'regional-bostadsanalys-2026-var-finns-boende-montorer',
    title: {
      sv: 'Regional bostadsanalys 2026: Var finns boende till dina montörer?',
      en: 'Regional Housing Analysis 2026: Where to Find Worker Accommodation',
      pl: 'Regionalna analiza mieszkaniowa 2026: Gdzie znaleźć zakwaterowanie dla pracowników',
    },
    description: {
      sv: 'Boverkets nya statistik visar var det finns överskott och brist på bostäder – och vad det betyder för ditt byggprojekt.',
      en: 'New housing statistics reveal where accommodation is available – and what it means for your construction project.',
      pl: 'Nowe statystyki pokazują, gdzie są mieszkania dostępne – i co to znaczy dla Twojego projektu budowlanego.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-03-11',
    category: 'Analys',
    tags: ['bostadsmarknad', 'regional-analys', 'infrastruktur', 'boverket'],
    readingTime: 7,
  },
  {
    slug: 'infrastrukturkontrakt-personalboende-checklista-2026',
    title: {
      sv: 'Checklista: Så säkrar du personalboende inför stora infrastrukturkontrakt 2026-2028',
      en: 'Checklist: Securing Worker Accommodation for Major Infrastructure Contracts 2026-2028',
      pl: 'Lista kontrolna: Zapewnienie zakwaterowania dla pracowników przy dużych kontraktach infrastrukturalnych 2026-2028',
    },
    description: {
      sv: 'Ostlänken, Norrbotniabanan och hundratals miljardprojekt startas 2026-2028. Guide för byggföretag som behöver planera personalboende.',
      en: 'Ostlänken, Norrbotniabanan and billions in projects start 2026-2028. Guide for contractors planning worker accommodation.',
      pl: 'Ostlänken, Norrbotniabanan i projekty za miliardy rozpoczynają się 2026-2028. Przewodnik dla firm budowlanych planujących zakwaterowanie.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-03-18',
    category: 'Guide',
    tags: ['infrastruktur', 'personalboende', 'anbudskalkyl', 'trafikverket', 'ostlänken'],
    readingTime: 9,
  },
  {
    slug: 'kompetens-rekrytering-byggsektorn-guide-2026',
    title: {
      sv: 'Kompetensbrist möter arbetslöshet: Så matchar du rätt byggkompetens 2026',
      en: 'Skills shortage meets unemployment: How to match construction talent in 2026',
      pl: 'Niedobór kompetencji spotyka bezrobocie: Jak dopasować talenty budowlane w 2026',
    },
    description: {
      sv: '76% av byggföretagen kämpar med rekrytering. Samtidigt finns tusentals lediga bygg arbetare. Lös matchningsproblemet med vår guide.',
      en: '76% of construction firms struggle to recruit. Yet thousands of construction workers are available. Solve the matching problem.',
      pl: '76% firm budowlanych ma problem z rekrutacją. Jednocześnie tysiące pracowników szuka pracy. Rozwiąż problem dopasowania.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-03-18',
    category: 'Guide',
    tags: ['rekrytering', 'kompetensförsörjning', 'arbetskraftsbrist', 'byggarbetsmarknad', 'personalplanering'],
    readingTime: 8,
  },
  {
    slug: 'blockhyra-foretagsbostader-nya-regler-juli-2026',
    title: {
      sv: 'Blockhyra och företagsbostäder: Nya regler från 1 juli 2026',
      en: 'Block Rentals and Corporate Housing: New Rules from July 1, 2026',
      pl: 'Wynajem blokowy i mieszkania służbowe: Nowe zasady od 1 lipca 2026',
    },
    description: {
      sv: 'Nya regler för företagsbostäder och blockhyra från 1 juli 2026. Guide för byggföretag som hyr personalboende.',
      en: 'New rules for corporate housing and block rentals from July 1, 2026. Guide for construction companies renting worker accommodation.',
      pl: 'Nowe zasady dotyczące mieszkań służbowych i wynajmu blokowego od 1 lipca 2026. Przewodnik dla firm budowlanych.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-03-25',
    category: 'Lagstiftning',
    tags: ['blockhyra', 'företagsbostäder', 'privatuthyrningslagen', 'personalboende', 'lagändring-2026'],
    readingTime: 9,
  },
  {
    slug: 'nya-bolaneregler-april-2026-personalboende-guide',
    title: {
      sv: 'Nya bolånereglerna april 2026: Så påverkar de dig som hyr ut personalboende',
      en: 'New mortgage rules April 2026: How they affect temporary accommodation landlords',
      pl: 'Nowe zasady kredytów hipotecznych kwiecień 2026: Jak wpływają na wynajmujących zakwaterowanie',
    },
    description: {
      sv: 'Från 1 april 2026 gäller nya bolåneregler. Här är vad fastighetsägare som hyr ut till byggföretag behöver veta.',
      en: 'New mortgage rules from April 1, 2026. What property owners renting to construction companies need to know.',
      pl: 'Nowe zasady kredytów od 1 kwietnia 2026. Co właściciele wynajmujący firmom budowlanym muszą wiedzieć.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-04-01',
    category: 'Guide',
    tags: ['bolåneregler', 'fastighetsägare', 'investering', 'personalboende'],
    readingTime: 7,
  },
  {
    slug: 'sa-fungerar-det-fran-intresse-till-forsta-hyran',
    title: {
      sv: 'Så fungerar det: Från intresseanmälan till första hyran',
      en: 'How It Works: From Sign-Up to Your First Rent Payment',
      pl: 'Jak to działa: Od zgłoszenia do pierwszego czynszu',
    },
    description: {
      sv: 'Steg för steg genom processen att hyra ut ditt hus till företag via StayOnSite. Från anmälan till att pengarna landar på kontot.',
      en: 'Step by step through the process of renting out your property to companies via StayOnSite.',
      pl: 'Krok po kroku przez proces wynajmu nieruchomości firmom przez StayOnSite.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['husägare', 'uthyrning', 'process', 'onboarding', 'garanterad hyra'],
    readingTime: 6,
  },
  {
    slug: 'hyra-ut-jamforelse-stayonsite-vs-andra-2026',
    title: {
      sv: 'Hyra ut hus till företag: StayOnSite vs egen uthyrning vs andra plattformar',
      en: 'Renting Out Your Property: StayOnSite vs DIY vs Other Platforms',
      pl: 'Wynajem nieruchomości: StayOnSite vs samodzielny wynajem vs inne platformy',
    },
    description: {
      sv: 'Jämförelse av alternativ för husägare som vill hyra ut till företag. Avgifter, garantier och trygghet - så skiljer sig StayOnSite från Samtrygg, Qasa och egen uthyrning.',
      en: 'Comparison of options for homeowners renting to companies. Fees, guarantees and security - how StayOnSite differs from other platforms.',
      pl: 'Porównanie opcji dla właścicieli wynajmujących firmom. Opłaty, gwarancje i bezpieczeństwo.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['husägare', 'uthyrning', 'jämförelse', 'samtrygg', 'qasa', 'företagsboende'],
    readingTime: 7,
  },
  {
    slug: 'personalboende-vanliga-fragor-byggforetag',
    title: {
      sv: 'Personalboende: 8 vanliga frågor från byggföretag',
      en: 'Worker Accommodation: 8 Common Questions from Construction Companies',
      pl: 'Zakwaterowanie pracownicze: 8 najczęstszych pytań firm budowlanych',
    },
    description: {
      sv: 'Svar på de vanligaste frågorna om personalboende - pris, leveranstid, fakturering, ramavtal och vad som ingår.',
      en: 'Answers to the most common questions about worker accommodation - pricing, delivery time, invoicing, framework agreements.',
      pl: 'Odpowiedzi na najczęstsze pytania o zakwaterowanie pracownicze - ceny, czas realizacji, fakturowanie.',
    },
    author: 'StayOnSite',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['personalboende', 'byggföretag', 'FAQ', 'fakturering', 'ramavtal'],
    readingTime: 6,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map(p => p.slug);
}
