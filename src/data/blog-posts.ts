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
      sv: 'Nya privatuthyrningslagen 2026: Vad reformen innebär för husägare',
      en: 'New Swedish Private Rental Act 2026: What the Reform Means for Homeowners',
      pl: 'Nowa ustawa o wynajmie 2026: Co oznacza reforma'
    },
    description: {
      sv: 'Riksdagen reformerar privatuthyrningslagen från juli 2026. Höjt schablonavdrag, nya blockhyresregler och vad det innebär för dig som hyr ut.',
      en: 'Sweden reforms the Private Rental Act from July 2026. Higher deductions, new block rental rules and what it means for property owners.',
      pl: 'Reforma ustawy o wynajmie od lipca 2026. Wyższe odliczenia i nowe zasady.'
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
      sv: 'Var behövs personalboende 2026? Kartan över Sveriges största infrastrukturprojekt',
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
      sv: 'Avtalskrav på personalboende 2026: Vad gäller för montörer och byggarbetare?',
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
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map(p => p.slug);
}
