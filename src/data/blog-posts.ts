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
    author: 'Kajsa Lindwall',
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
    author: 'Kajsa Lindwall',
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
      sv: 'Northvolt, H2 Green Steel, LKAB och datacenter driver enorm efterfrågan på personalboende i Norrbotten och Västerbotten.',
      en: 'Northvolt, H2 Green Steel, LKAB and data centers drive enormous demand for worker accommodation in northern Sweden.',
      pl: 'Northvolt, H2 Green Steel i centra danych napędzają popyt na zakwaterowanie w północnej Szwecji.'
    },
    author: 'Kajsa Lindwall',
    publishedDate: '2026-02-07',
    category: 'Marknad',
    tags: ['norrbotten', 'grön omställning', 'northvolt', 'datacenter', 'luleå', 'boden'],
    readingTime: 7
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map(p => p.slug);
}
