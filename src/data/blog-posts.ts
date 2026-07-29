export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: { sv: string; en: string; pl: string };
  description: { sv: string; en: string; pl: string };
  author: string;
  publishedDate: string;
  /** Sätts när artikeln uppdaterats materiellt. Faller annars tillbaka på publishedDate. */
  updatedDate?: string;
  category: string;
  tags: string[];
  readingTime: number;
  /** Målgrupp — styr vilken CTA som visas i BlogLayout. */
  audience?: 'husagare' | 'foretag' | 'bada';
  /** Citerbara fakta ur artikeln. Visas som "Snabba svar" överst och som abstract i Article-schemat. */
  keyTakeaways?: string[];
  /** Q&A som redan finns synligt i artikeln — genererar FAQPage-schema. */
  faq?: BlogFaqItem[];
  /** Engelsk version — finns bara för översatta artiklar (route: /en/blog/<slug>). */
  en?: {
    slug: string;
    keyTakeaways?: string[];
    faq?: BlogFaqItem[];
  };
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-07',
    category: 'Guide',
    tags: ['personalboende', 'byggbolag', 'företagsboende'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      'Personalboende kostar ca 200–550 kr per person och natt (från 5 900 kr per person och månad) mot hotellets 900–1 800 kr — ett team på 10 sparar 60–75 procent.',
      'Boverket: Sverige behöver bygga ca 67 000 bostäder per år till 2030, men 2025 påbörjades bara ca 30 000 — ett gap på 35 000 bostäder per år.',
      'Arbetsmiljöverkets föreskrifter AFS 2020:1 kräver att arbetsgivarens tillfälliga boende har enskilda sovplatser, kök, hygienutrymmen och brandskydd.',
      'Privatuthyrningslagen (2012:978) gäller när uthyraren är privatperson; hyr ett företag ut gäller hyreslagen, och blockhyra regleras i 1 § tredje stycket.',
      'Snittpriset på svenska hotellrum steg 8,3 procent under 2025 (SCB), och byggbranschen behöver rekrytera 50 000 nya medarbetare till 2030 (Byggföretagen).',
    ],
  },
  {
    slug: 'privatuthyrningslagen-reform-2026',
    title: {
      sv: 'Privatuthyrningslagen 2026: Nya regler från 1 juli – vad du tjänar på det',
      en: 'Swedish Private Rental Act 2026: New Rules from 1 July – What You Gain',
      pl: 'Ustawa o wynajmie 2026: Nowe zasady od 1 lipca – co zyskujesz'
    },
    description: {
      sv: 'Riksdagen röstade igenom reformen: schablonavdraget höjs till 50 000 kr och blockhyra förenklas. Så maximerar du din hyresintäkt från 1 juli 2026.',
      en: 'Parliament passed the biggest reform since 2012. The standard deduction rises to SEK 50,000 and block rentals get simpler. How to maximise your rental income from 1 July.',
      pl: 'Sejm uchwalił największą reformę od 2012 r. Odliczenie rośnie do 50 000 SEK. Jak zmaksymalizować dochód z najmu od 1 lipca.'
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-07',
    category: 'Lagstiftning',
    tags: ['privatuthyrningslagen', 'blockhyra', 'husägare', 'skatt'],
    readingTime: 10,
    audience: 'husagare',
    keyTakeaways: [
      'Schablonavdraget vid privatuthyrning höjs från 40 000 till 50 000 kr per bostad och år den 1 juli 2026; överskottet beskattas med 30 procent kapitalskatt.',
      'Gränsen för näringsverksamhet höjs från en till två bostäder — schablonavdraget gäller per bostad, max 100 000 kr per år för den som hyr ut två.',
      'Reformen bygger på SOU 2025:65 och Prop. 2025/26:143, röstades igenom av riksdagen i juni 2026 och träder i kraft den 1 juli 2026.',
      'Höjningen ger 3 000 kr lägre skatt per bostad och år (10 000 kr × 30 %) — upp till 6 000 kr per år för den som hyr ut två bostäder.',
      'Vid blockhyra tar det hyrande företaget ansvaret för andrahandsuthyrningen — husägaren behöver inte hantera besittningsskydd mot de enskilda boende.',
    ],
    faq: [
      {
        q: 'När träder de nya reglerna i kraft?',
        a: 'Den 1 juli 2026. För beskattningsåret 2026 gäller det gamla schablonavdraget (40 000 kr) för januari–juni och det nya (50 000 kr, proportionerat) för juli–december.',
      },
      {
        q: 'Behöver jag skriva nytt hyresavtal?',
        a: 'Nej, befintliga hyresavtal fortsätter att gälla. De nya reglerna påverkar främst skatteberäkningen och möjligheten att hyra ut fler bostäder.',
      },
      {
        q: 'Kan jag hyra ut min bostadsrätt?',
        a: 'Ja, privatuthyrningslagen gäller även bostadsrätter. Du behöver dock fortfarande godkännande från din bostadsrättsförening för andrahandsuthyrning.',
      },
      {
        q: 'Vad händer om jag hyr ut mer än 2 bostäder?',
        a: 'Från och med den tredje bostaden klassas uthyrningen som näringsverksamhet. Då behöver du betala egenavgifter (cirka 28 %) och eventuellt registrera ett företag.',
      },
      {
        q: 'Hur påverkas jag om jag hyr ut i andra hand?',
        a: 'Privatuthyrningslagen gäller bara om du äger bostaden (äganderätt eller bostadsrätt). Vid andrahandsuthyrning gäller hyreslagen och du behöver hyresvärdens godkännande.',
      },
      {
        q: 'Måste jag deklarera hyresintäkter under 50 000 kr?',
        a: 'Ja, alla hyresintäkter ska deklareras. Med schablonavdraget och 20-procentsavdraget blir den faktiska skatten dock noll om intäkterna understiger tröskeln.',
      },
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-07',
    category: 'Marknad',
    tags: ['norrbotten', 'grön omställning', 'batteriindustri', 'datacenter', 'luleå', 'boden'],
    readingTime: 7,
    audience: 'bada',
    keyTakeaways: [
      'Norra Sverige har över 1 100 miljarder kr i planerade investeringar till 2040 och behöver 100 000+ nya invånare samt 40 000–50 000 nya industrijobb.',
      'H2 Green Steel i Boden beräknas vara i full drift 2026–2027 med ca 1 500 permanenta jobb; upp till 3 000 byggarbetare har varit aktiva samtidigt under byggfasen.',
      'LKAB:s omställning till fossilfri produktion kräver ca 700 miljarder kr i investeringar till 2045 och 10 000 nya medarbetare i Malmfälten 2025–2040.',
      'Skellefteås bostadskö överstiger 10 000 personer och bostadsrättspriserna har stigit över 40 procent sedan 2020.',
      'Microsoft investerar över 30 miljarder kr i ny datacenterkapacitet i Norrbotten; Stordalens Aurora Village i Luleå planerar upp till 2 000 rum för personalboende.',
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-10',
    category: 'Analys',
    tags: ['infrastruktur', 'personalboende', 'ostlänken', 'norrbotniabanan', 'byggprojekt'],
    readingTime: 8,
    audience: 'bada',
    keyTakeaways: [
      'Trafikverkets nationella plan 2022–2033 omfattar över 900 miljarder kr i vägar och järnvägar; anläggningsinvesteringarna ökade 12 procent under 2025.',
      'Ostlänken (Järna–Linköping) sysselsätter 2 000–3 000 byggnadsarbetare 2024–2035 och pressar bostadsmarknaden i Norrköping, Linköping och Nyköping.',
      'Norrbotniabanan kräver 1 000–1 500 arbetare 2024–2030+ och klassas tillsammans med H2 Green Steel och LKAB som projekt med mycket högt boendebehov.',
      'Boden har ca 28 000 invånare — H2 Green Steels etablering med 1 500+ arbetare fram till 2028 innebär en massiv ökning av boendebehovet.',
      'Västlänken i Göteborg sysselsätter 1 500–2 000 arbetare till 2029 och E4 Förbifart Stockholm 1 000–1 500 till 2030.',
    ],
  },
  {
    slug: 'forsakring-ansvar-personalboende-guide-2026',
    title: {
      sv: 'Försäkring och ansvar vid personalboende – vad gäller?',
      en: 'Insurance and liability for worker accommodation – what applies?',
      pl: 'Ubezpieczenie i odpowiedzialność za zakwaterowanie pracowników – co obowiązuje?',
    },
    description: {
      sv: 'Guide om försäkringar, ansvarsförsäkring och skydd vid uthyrning av personalboende till byggföretag och montörer i Sverige.',
      en: 'Guide on insurance, liability coverage and protection when renting accommodation to construction companies and contractors.',
      pl: 'Przewodnik po ubezpieczeniach, odpowiedzialności i ochronie przy wynajmie zakwaterowania dla firm budowlanych.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-11',
    category: 'Guide',
    tags: ['försäkring', 'ansvar', 'uthyrning', 'husägare', 'riskhantering'],
    readingTime: 8,
    audience: 'bada',
    keyTakeaways: [
      'Husägarens hemförsäkring ersätter inte skador eller stölder orsakade av hyresgästen — en uthyrningsförsäkring behövs och kostar oftast 500–1 000 kr per år.',
      'Ansvarsförsäkring för byggföretag kostar 10 000–30 000 kr per år; ett medelstort bolag med ca 10 miljoner i omsättning betalar runt 20 000 kr per år.',
      'Hyresgästen har vårdplikt enligt hyreslagen och ersätter skador genom vårdslöshet; hyresvärden har underhållsplikt och står för normalt slitage.',
      'Hyresvärden måste bevisa att hyresgästen orsakat en skada — besiktningsprotokoll vid in- och utflyttning är det avgörande underlaget.',
      '90 procent av Sveriges arbetstagare omfattas av kollektivavtalade försäkringar; hemförsäkring för hyresrätt ersätter upp till 1,5 miljoner kr vid inbrott och brand.',
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-18',
    category: 'Guide',
    tags: ['kollektivavtal', 'arbetsmiljö', 'montörboende', 'avtalskrav', 'byggföretag'],
    readingTime: 7,
    audience: 'foretag',
    keyTakeaways: [
      'Byggavtalet omfattar cirka 100 000 yrkesarbetare och gäller från 1 maj 2025 till 30 april 2027.',
      'Från 1 januari 2026 höjdes det skattefria traktamentsbeloppet från 435 till 450 kronor per dag.',
      'Minimistandard 2026: max 2–4 personer per rum, minst 7 m² per person, dusch/toalett för max 6–8 personer och minst +18 °C inomhus.',
      'Brandskyddskraven innebär brandvarnare i alla sovrum, minst två oberoende utrymningsvägar och handbrandsläckare på varje våningsplan.',
      'Skattefri logi 2026: faktisk kostnad eller schablon 150 kr/natt; traktamente inom Sverige är 300 kr hel dag och 150 kr halv dag.',
    ],
    faq: [
      {
        q: 'Vad säger kollektivavtalen om personalboende?',
        a: 'Byggavtalet och Installationsavtalet kräver att arbetsgivaren tillhandahåller eller bekostar logi av "tillfredsställande beskaffenhet" vid arbete på resande fot. Avtalen saknar detaljerade standardkrav men förutsätter att boendet är hygieniskt och säkert.',
      },
      {
        q: 'Vad innebär "tillfredsställande beskaffenhet" i praktiken?',
        a: 'Domstolspraxis och arbetsmiljöinspektioner har lagt fast miniminivåer: max 2–4 personer per rum med minst 7 m² per person, dusch och toalett för max 6–8 personer, fullt utrustat kök eller pentry, brandskydd, ventilation enligt AFS 2020:1 och minst +18 °C inomhus.',
      },
      {
        q: 'Vad är skattefritt för företag och anställda 2026?',
        a: 'Logi vid tjänsteresa med övernattning är skattefri upp till faktisk kostnad eller schablon 150 kr/natt, och traktamentet är 300 kr för hel dag och 150 kr för halv dag inom Sverige. Vid arbete på samma plats längre än 3 månader kan skattereglerna ändras.',
      },
      {
        q: 'Vad ska man fråga efter vid bokning av personalboende?',
        a: 'Fråga om brandskydd (brandvarnare, släckare, utrymningsplan), antal personer per sovrum och badrum, kök, tvättmaskin och WiFi, skriftligt hyresavtal med uppsägningstid, besiktningsdokumentation samt avstånd till arbetsplats och kollektivtrafik.',
      },
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-02-25',
    category: 'Lagstiftning',
    tags: ['arbetskraftsinvandring', 'arbetstillstånd', 'byggbranschen', 'montörboende', 'lönekrav'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      '1 juni 2026 höjs lönekravet för arbetstillstånd från 80 % till 90 % av medianlönen — från 29 680 kr till 33 390 kr per månad.',
      'Sanktionsavgiften vid anställning utan giltigt arbetstillstånd dubbleras: 118 400 kr per person, 236 800 kr vid överträdelser över tre månader.',
      'Arbetstillstånd för vistelser upp till ett år kräver heltäckande sjukförsäkring som gäller i Sverige och täcker vård och hemtransport.',
      'Förlängningsansökningar som lämnas in senast 1 december 2026 prövas enligt de gamla reglerna.',
      'Avgiften gäller även uppdragsgivare i entreprenadkedjan — byggherrar och huvudentreprenörer kan hållas ansvariga för underentreprenörers regelbrott.',
    ],
    faq: [
      {
        q: 'Vad händer 1 juni 2026?',
        a: 'En samlad reform för arbetskraftsinvandring träder i kraft med skärpta grundvillkor för arbetstillstånd: höjt lönekrav till 90 % av medianlönen, obligatorisk sjukförsäkring för vistelser upp till ett år, nya brott mot exploatering och kraftigt höjda sanktionsavgifter.',
      },
      {
        q: 'Vad betyder det höjda lönekravet för byggföretag?',
        a: 'Minimilönen för arbetstillstånd går från 29 680 kr till 33 390 kr per månad, vilket får betydande konsekvenser för arbetsgivare med utländsk arbetskraft nära gränsen. Om kollektivavtalslönen är högre än 90 % av medianlönen måste den högre nivån tillämpas.',
      },
      {
        q: 'Sjukförsäkringskrav för vistelser upp till 1 år — vad gäller?',
        a: 'Den som ansöker om arbetstillstånd och ska vistas i Sverige i högst ett år ska ha, eller ha ansökt om, en heltäckande sjukförsäkring som gäller i Sverige och täcker vård och hemtransport. Liknande krav finns redan för bland annat EU-blåkort, ICT-tillstånd och säsongsarbete.',
      },
      {
        q: 'Vad behöver arbetsgivare göra?',
        a: 'Säkerställa att arbetstagaren tecknat eller ansökt om heltäckande sjukförsäkring före arbetstillståndsansökan, verifiera att den täcker vård och hemtransport, dokumentera försäkringsskyddet och informera utländska arbetstagare om kravet i god tid.',
      },
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-03-04',
    category: 'Marknad',
    tags: ['datacenter', 'montörboende', 'byggprojekt', 'infrastruktur', 'norrland'],
    readingTime: 8,
    audience: 'bada',
    keyTakeaways: [
      'EdgeConneX planerar ett AI-datacenter på upp till 1 gigawatt och cirka 100 miljarder kronor i Skellefteå, på det tidigare Northvolt-området.',
      'Microsoft satsar 33,7 miljarder kronor på datacenter i Gävle, Sandviken och Staffanstorp — bygget i Sandviken pausades våren 2025 på grund av elbrist.',
      'Datacenterprojektet i Kvarnsveden, Borlänge kan behöva upp till 1 000 byggarbetare; första serverhallen ska stå färdig 2027.',
      'Byggfaktas databas listar 29 datacenterprojekt med byggstart från januari 2024, med en uppskattad byggkostnad på 21 miljarder kronor.',
      'Ett storskaligt datacenter (250 MW–1 GW) kräver 600–1 000+ byggarbetare under en byggperiod på 24–36 månader.',
    ],
  },
  {
    slug: 'regional-bostadsanalys-2026-var-finns-boende-montorer',
    title: {
      sv: 'Regional bostadsanalys 2026: Var finns boende till dina montörer?',
      en: 'Regional Housing Analysis 2026: Where to Find Worker Accommodation',
      pl: 'Regionalna analiza mieszkaniowa 2026: Gdzie znaleźć zakwaterowanie dla pracowników',
    },
    description: {
      sv: 'Boverkets nya statistik visar var det finns överskott och brist på bostäder – och vad det innebär för ditt byggprojekt 2026.',
      en: 'New housing statistics reveal where accommodation is available – and what it means for your construction project.',
      pl: 'Nowe statystyki pokazują, gdzie są mieszkania dostępne – i co to znaczy dla Twojego projektu budowlanego.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-03-11',
    category: 'Analys',
    tags: ['bostadsmarknad', 'regional-analys', 'infrastruktur', 'boverket'],
    readingTime: 7,
    audience: 'foretag',
    keyTakeaways: [
      'Enligt Boverkets bostadsmarknadsenkät 2025 uppger 127 kommuner bostadsbrist medan 48 har överskott — 27 fler överskottskommuner än året innan.',
      'Behovet är 52 300 nya bostäder per år enligt Boverket, men prognosen för 2026 är att endast 35 000 bostäder påbörjas.',
      '41 av överskottskommunerna har färre än 25 000 invånare, med vakansgrader upp till 8 % — bäst möjligheter för korttidsboende åt montörer.',
      '46 av 51 kommuner i Storstockholm, Storgöteborg och Stormalmö bedömer att det råder underskott på bostadsmarknaden.',
      '2026 förväntas 46 % av påbörjade bostäder vara hyresrätter, 34 % bostadsrätter och 19 % småhus.',
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-03-18',
    category: 'Guide',
    tags: ['infrastruktur', 'personalboende', 'anbudskalkyl', 'trafikverket', 'ostlänken'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Norrbotniabanan bygger 27 mil ny järnväg Umeå–Luleå, med större byggstarter Dåva–Skellefteå under 2026 och planerad trafikstart 2032.',
      'I februari 2026 tilldelades Ostlänken-kontrakten för Vagnhärad och Skavsta — totalentreprenader för cirka sex mil järnväg.',
      'Akut bokat boende kostar 30–50 % mer än förbokat: hotell 1 200–1 800 kr/natt jämfört med 600–900 kr/natt för modulboende.',
      'Kostnad per arbetare och månad i Norrland: hotell 39 000–48 000 kr, modulboende 22 000–28 000 kr, privatuthyrning 16 000–24 000 kr.',
      'Exempel Norrköping: 20 arbetare i 6 månader kostar 4,86 mkr på hotell mot 2,22 mkr via privatuthyrning — en besparing på upp till 2,6 mkr.',
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-03-18',
    category: 'Guide',
    tags: ['rekrytering', 'kompetensförsörjning', 'arbetskraftsbrist', 'byggarbetsmarknad', 'personalplanering'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      'Vart fjärde rekryteringsförsök i byggsektorn misslyckas och 76 % av Byggföretagens medlemsföretag har svårt att rekrytera (Svenskt Näringslivs enkät 2025/2026).',
      'Arbetslösheten i byggarbetarnas a-kassa var 4,6 % Q4 2025; endast 431 varslades i byggindustrin i februari 2026, en minskning med 68 % på ett år.',
      'Arbetslösheten varierar från 3,8 % i Norrbotten och 3,7 % i Västerbotten till 8,9 % i Skåne — arbetskraften finns i söder, projekten i norr.',
      'Över 3 500 lediga byggjobb fanns hos Arbetsförmedlingen i mars 2026, men byggföretag rekryterar hellre via nätverk och sociala medier.',
      'Byggindustrin sysselsätter cirka 387 000 personer (mars 2026); från 2028 väntas omkring 8 000 pensionsavgångar per år.',
    ],
  },
  {
    slug: 'nya-bolaneregler-april-2026-personalboende-guide',
    title: {
      sv: 'Nya bolånereglerna april 2026: Så påverkar de dig som hyr ut personalboende',
      en: 'New mortgage rules April 2026: How they affect temporary accommodation landlords',
      pl: 'Nowe zasady kredytów hipotecznych kwiecień 2026: Jak wpływają na wynajmujących zakwaterowanie',
    },
    description: {
      sv: 'Från 1 april 2026 gäller nya bolåneregler i Sverige. Här är vad fastighetsägare som hyr ut till byggföretag behöver veta.',
      en: 'New mortgage rules from April 1, 2026. What property owners renting to construction companies need to know.',
      pl: 'Nowe zasady kredytów od 1 kwietnia 2026. Co właściciele wynajmujący firmom budowlanym muszą wiedzieć.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-01',
    category: 'Guide',
    tags: ['bolåneregler', 'fastighetsägare', 'investering', 'personalboende'],
    readingTime: 7,
    audience: 'husagare',
    keyTakeaways: [
      'Från 1 april 2026 höjs bolånetaket från 85 till 90 % — kontantinsatsen sänks från 15 till 10 % (riksdagsbeslut 4 mars 2026).',
      'Det skärpta amorteringskravet från 2018 (extra 1 % vid lån över 4,5 gånger årsinkomsten) slopas; grundkravet på 1–2 % per år kvarstår.',
      'Tilläggslån skärps: maximal belåningsgrad sänks från 85 till 80 %, och en ny tröghetsregel tillåter omvärdering för högre bolån bara vart femte år.',
      'För en bostad värd 3 miljoner kronor sjunker kontantinsatsen från 450 000 kr till 300 000 kr — en skillnad på 150 000 kr.',
      'Schablonavdraget för privatuthyrning är 40 000 kr per år (skattefri hyra upp till 3 333 kr/mån); ny privatuthyrningslag träder i kraft 1 juli 2026.',
    ],
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
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['husägare', 'uthyrning', 'process', 'onboarding', 'garanterad hyra'],
    readingTime: 6,
    audience: 'husagare',
    keyTakeaways: [
      'StayOnSite hyr bostaden av husägaren till fast månadshyra och hyr ut vidare till företag; hyran betalas ut den 25:e varje månad oavsett beläggning.',
      'StayOnSite tar 0 % i avgift av husägaren, jämfört med Samtrygg (15 %) och Qasa (4,95 %).',
      'Från intresseanmälan till första hyran tar det normalt 3–6 veckor; från signerat avtal till inflyttning 1–3 veckor.',
      'Typiska avtalstider är 6–24 månader, och bostaden besiktigas och dokumenteras med foto eller video före inflyttning.',
      'Exempel: möblerad villa med 3 sovrum i mindre stad ger 25 000 kr/mån (300 000 kr/år); större hus med 5+ sovrum nära industriprojekt ger 40 000 kr/mån.',
    ],
    faq: [
      {
        q: 'Måste jag vara tillgänglig under uthyrningsperioden?',
        a: 'Ja, om inte annat avtalas. Felanmälningar, nyckelbyten och löpande frågor sköter StayOnSite, men du behöver kunna nås om något i bostaden behöver åtgärdas.',
      },
      {
        q: 'Vad händer om bostaden skadas?',
        a: 'Bostaden besiktigas och fotograferas före inflyttning som tydligt utgångsläge. Skador under hyrestiden hanteras inom ramen för avtalet med det hyrande företaget.',
      },
      {
        q: 'Behöver jag informera min bank?',
        a: 'Nej, du behöver inte informera banken om att bostaden hyrs ut. Ditt bolån påverkas inte av uthyrningen.',
      },
      {
        q: 'Vad gäller angående försäkring?',
        a: 'Informera ditt försäkringsbolag om att bostaden hyrs ut till företag. De flesta hemförsäkringar täcker uthyrning, men det kan krävas ett tillägg — kontrollera innan avtalet tecknas.',
      },
      {
        q: 'Måste bostaden vara möblerad?',
        a: 'Inte alltid. Möblerat är vanligast för korttidsuthyrning under 6 månader, medan omöblerat kan fungera för längre avtal. Upplägget anpassas efter vad företagskunderna efterfrågar.',
      },
      {
        q: 'Vad händer när avtalet löper ut?',
        a: 'Förlängning diskuteras normalt 1–2 månader innan avtalet löper ut, och många väljer att förlänga. Vill du avsluta återlämnas bostaden i dokumenterat skick efter avflyttningsbesiktning.',
      },
    ],
  },
  {
    slug: 'hyra-ut-jamforelse-stayonsite-vs-andra-2026',
    title: {
      sv: 'Hyra ut hus till företag: StayOnSite vs egen uthyrning vs andra plattformar',
      en: 'Renting Out Your Property: StayOnSite vs DIY vs Other Platforms',
      pl: 'Wynajem nieruchomości: StayOnSite vs samodzielny wynajem vs inne platformy',
    },
    description: {
      sv: 'Jämförelse för husägare: Avgifter, garantier och trygghet – så skiljer sig StayOnSite från Samtrygg, Qasa och egen uthyrning.',
      en: 'Comparison of options for homeowners renting to companies. Fees, guarantees and security - how StayOnSite differs from other platforms.',
      pl: 'Porównanie opcji dla właścicieli wynajmujących firmom. Opłaty, gwarancje i bezpieczeństwo.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['husägare', 'uthyrning', 'jämförelse', 'samtrygg', 'qasa', 'företagsboende'],
    readingTime: 7,
    audience: 'husagare',
    keyTakeaways: [
      'Samtrygg tar 15 % av månadshyran och Qasa 4,95 %; StayOnSite tar 0 % — hela avtalade hyran betalas ut utan avdrag.',
      'Vid 12 000 kr/mån kostar Samtrygg 21 600 kr/år och Qasa 7 128 kr/år i avgifter; över tre år förlorar husägaren 64 800 kr via Samtrygg.',
      'StayOnSite hyr bostaden på fast månadskontrakt och betalar hyran den 25:e varje månad, oavsett om bostaden är belagd eller inte.',
      'Hos StayOnSite är alla hyresgäster verifierade företag — inga privatpersoner; besiktning och fotodokumentation ingår.',
      'Egen uthyrning ger 0 % avgift och full kontroll, men ingen garanterad hyra och all administration och hyresgästgranskning faller på husägaren.',
    ],
    faq: [
      {
        q: 'Kan jag hyra ut via StayOnSite i vilken stad som helst?',
        a: 'StayOnSite arbetar i orter med aktiv efterfrågan från byggbolag, industri och offentlig sektor. Kontakta oss för att höra om din ort ingår eller är på väg in i nätverket.',
      },
      {
        q: 'Hur lång är bindningstiden med StayOnSite?',
        a: 'Det varierar beroende på avtalet, men StayOnSite strävar efter stabila kontrakt, normalt minst 6 månader.',
      },
      {
        q: 'Vad händer om ett företag som hyr av StayOnSite inte betalar?',
        a: 'Det är StayOnSites risk, inte din. Du har avtal med StayOnSite och din hyra betalas oavsett vad som händer mellan StayOnSite och deras företagskunder.',
      },
      {
        q: 'Kan jag byta från Samtrygg eller Qasa till StayOnSite?',
        a: 'Ja, när befintliga avtal löper ut kan du byta. StayOnSite hjälper till med övergången och kan ta över förvaltningen vid kontraktets slut.',
      },
    ],
  },
  {
    slug: 'personalboende-vanliga-fragor-byggforetag',
    title: {
      sv: 'Personalboende: 8 vanliga frågor från byggföretag',
      en: 'Worker Accommodation: 8 Common Questions from Construction Companies',
      pl: 'Zakwaterowanie pracownicze: 8 najczęstszych pytań firm budowlanych',
    },
    description: {
      sv: 'Svar på de vanligaste frågorna om personalboende – pris, leveranstid, fakturering, ramavtal och vad som ingår. För byggföretag i Sverige.',
      en: 'Answers to the most common questions about worker accommodation - pricing, delivery time, invoicing, framework agreements.',
      pl: 'Odpowiedzi na najczęstsze pytania o zakwaterowanie pracownicze - ceny, czas realizacji, fakturowanie.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['personalboende', 'byggföretag', 'FAQ', 'fakturering', 'ramavtal'],
    readingTime: 6,
    audience: 'foretag',
    keyTakeaways: [
      'StayOnSite presenterar en boendeplan inom 24 timmar; vid akuta behov kan inflyttning ofta ordnas samma vecka.',
      'Personalboende kostar från 5 900 kr per person och månad — hotell kostar 27 000–45 000 kr per person och månad (900–1 500 kr/natt).',
      'StayOnSite täcker 40+ städer i Sverige, med extra kapacitet i Luleå, Boden, Oskarshamn och Gävle.',
      'Fakturering sker som samlad företagsfaktura per adress och månad, med 10 dagars betalningsvillkor och möjlighet till projektmärkning.',
      'Minsta avtalstid är tre månader; övre gräns saknas — kunder har haft samma adresser i 18–24 månader.',
    ],
    faq: [
      {
        q: 'Hur snabbt kan ni ordna boende?',
        a: 'I normalfallet presenteras en boendeplan inom 24 timmar med tillgängliga adresser, antal sovplatser och pris per person. Vid akuta behov kan inflyttning ofta ordnas under samma vecka.',
      },
      {
        q: 'Vad kostar personalboende?',
        a: 'Från 5 900 kr per person och månad för fullt möblerat boende. En hotellnatt kostar 900–1 500 kr, alltså 27 000–45 000 kr per person och månad — personalboende kostar en bråkdel av det.',
      },
      {
        q: 'Vilka städer täcker ni?',
        a: 'StayOnSite finns i 40+ städer från Malmö till Luleå, med hög efterfrågan i bland annat Luleå, Boden, Oskarshamn, Gävle, Falun och Säffle.',
      },
      {
        q: 'Är boendet möblerat?',
        a: 'Ja, allt boende är fullt möblerat: sängar med sängkläder, fullt utrustat kök, tvättmaskin, torktumlare och bredband ingår som standard. Personalen flyttar in med enbart personligt bagage.',
      },
      {
        q: 'Hur fungerar faktureringen?',
        a: 'Ni får en samlad företagsfaktura per adress och månad med 10 dagars betalningsvillkor som standard. Projektmärkning på fakturan är möjlig för er internredovisning.',
      },
      {
        q: 'Vad är minsta avtalstid?',
        a: 'Tre månader — den kortaste period som fungerar ekonomiskt för fastighetsägarna. Kortare projekt kan ibland lösas ändå, och någon övre gräns för avtalstid finns inte.',
      },
    ],
    en: {
      slug: 'worker-accommodation-sweden-faq',
      keyTakeaways: [
        'StayOnSite presents a housing plan within 24 hours; for urgent needs, move-in can often be arranged within the same week.',
        'Worker accommodation costs from SEK 5,900 per person per month — hotels cost SEK 27,000–45,000 per person per month (SEK 900–1,500 per night).',
        'StayOnSite covers 40+ cities in Sweden, with extra capacity in Luleå, Boden, Oskarshamn and Gävle.',
        'Invoicing is done as one consolidated company invoice per address and month, with 10-day payment terms and the option to add project references.',
        'The minimum contract length is three months; there is no upper limit — clients have kept the same addresses for 18–24 months.',
      ],
      faq: [
        {
          q: 'How quickly can you arrange accommodation?',
          a: 'In a typical case, a housing plan is presented within 24 hours with available addresses, number of beds and price per person. For urgent needs, move-in can often be arranged within the same week.',
        },
        {
          q: 'What does worker accommodation cost?',
          a: 'From SEK 5,900 per person per month for fully furnished accommodation. A hotel night costs SEK 900–1,500, which is SEK 27,000–45,000 per person per month — worker accommodation costs a fraction of that.',
        },
        {
          q: 'Which cities do you cover?',
          a: 'StayOnSite operates in 40+ cities from Malmö to Luleå, with high demand in Luleå, Boden, Oskarshamn, Gävle, Falun and Säffle, among others.',
        },
        {
          q: 'Is the accommodation furnished?',
          a: 'Yes, all accommodation is fully furnished: beds with bed linen, a fully equipped kitchen, washing machine, tumble dryer and broadband are included as standard. Staff move in with only their personal luggage.',
        },
        {
          q: 'How does invoicing work?',
          a: 'You receive one consolidated company invoice per address and month with 10-day payment terms as standard. Project references on the invoice are available for your internal accounting.',
        },
        {
          q: 'What is the minimum contract length?',
          a: 'Three months — the shortest period that works economically for the property owners. Shorter projects can sometimes be solved anyway, and there is no upper limit on contract length.',
        },
      ],
    },
  },
  {
    slug: 'personalboende-vs-hotell-kostnad-jamforelse',
    title: {
      sv: 'Personalboende vs hotell: Vad kostar det egentligen?',
      en: 'Worker Accommodation vs Hotel: What Does It Actually Cost?',
      pl: 'Zakwaterowanie pracownicze vs hotel: Ile to naprawdę kosztuje?',
    },
    description: {
      sv: 'Jämförelse av kostnader för personalboende, hotell, Airbnb och egen hantering. Konkreta siffror och räkneexempel för byggföretag.',
      en: 'Cost comparison of worker accommodation, hotels, Airbnb and self-managed housing. Concrete figures for construction companies.',
      pl: 'Porównanie kosztów zakwaterowania pracowniczego, hoteli, Airbnb i samodzielnego zarządzania.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-06',
    category: 'Guide',
    tags: ['personalboende', 'hotell', 'kostnadsjämförelse', 'byggföretag', 'budget'],
    readingTime: 7,
    audience: 'foretag',
    keyTakeaways: [
      'Personalboende via StayOnSite kostar från 5 900 kr per person och månad; hotell 15 000–30 000 kr och Airbnb 8 000–15 000 kr per person och månad.',
      'Räkneexempel 10 personer i 3 månader: personalboende ca 177 000 kr mot hotell ca 540 000 kr — en skillnad på över 330 000 kr per projekt.',
      'En hotellnatt utanför storstäderna kostar 700–1 000 kr, vilket ger 21 000–30 000 kr per person och månad vid 30 nätter.',
      'Egen hantering kostar 15 000–25 000 kr i internkostnad när en projektledare lägger 20–30 timmar på att ordna boende.',
      'Hotell utan kök ger matkostnader på 100–200 kr per person och dag — 30 000–60 000 kr extra per månad för ett team på 10 personer.',
    ],
    faq: [
      {
        q: 'Kan vi boka StayOnSite med kort varsel?',
        a: 'StayOnSite rekommenderar 2–4 veckors framförhållning för bästa tillgänglighet. I vissa städer kan kortare varsel fungera — kontakta oss direkt för att kolla tillgänglighet i den aktuella orten.',
      },
      {
        q: 'Hur fungerar fakturering för Airbnb i praktiken?',
        a: 'Airbnb skickar ett kvitto men inte en faktura med momsspecifikation i juridisk mening. Det försvårar momsavdrag och kan skapa problem vid redovisning och revision.',
      },
      {
        q: 'Kan StayOnSite hantera blandat team med svenska och utländska montörer?',
        a: 'Ja. StayOnSite erbjuder service och kommunikation på svenska, engelska och polska — en konkret fördel när teamet är internationellt.',
      },
      {
        q: 'Vad händer om projektet förlängs?',
        a: 'Med StayOnSite justeras avtalet vid förlängning utan att ni behöver boka om från noll. Med hotell eller Airbnb riskerar ni att boendena är bokade av andra och teamet behöver flytta mitt i projektet.',
      },
    ],
    en: {
      slug: 'worker-accommodation-vs-hotel-cost-comparison',
      keyTakeaways: [
        'Worker accommodation via StayOnSite costs from SEK 5,900 per person per month; hotels SEK 15,000–30,000 and Airbnb SEK 8,000–15,000 per person per month.',
        'Example calculation for 10 people over 3 months: worker accommodation approx. SEK 177,000 versus approx. SEK 540,000 for hotels — a difference of more than SEK 330,000 per project.',
        'A hotel night outside the major cities costs SEK 700–1,000, which adds up to SEK 21,000–30,000 per person per month over 30 nights.',
        'Self-management carries an internal cost of SEK 15,000–25,000 when a project manager spends 20–30 hours arranging housing for a team.',
        'Hotels without kitchens add food costs of SEK 100–200 per person per day — an extra SEK 30,000–60,000 per month for a team of 10.',
      ],
      faq: [
        {
          q: 'Can we book StayOnSite at short notice?',
          a: 'StayOnSite recommends 2–4 weeks of lead time for the best availability. In some cities, shorter notice can work — contact us directly to check availability in the city in question.',
        },
        {
          q: 'How does invoicing work for Airbnb in practice?',
          a: 'Airbnb issues a receipt but not an invoice with a VAT specification in the legal sense. This makes VAT deductions harder and can create problems in accounting and audits.',
        },
        {
          q: 'Can StayOnSite handle a mixed team of Swedish and foreign workers?',
          a: 'Yes. StayOnSite provides service and communication in Swedish, English and Polish — a concrete advantage when the team is international.',
        },
        {
          q: 'What happens if the project is extended?',
          a: 'With StayOnSite, the contract is adjusted for the extension without you having to rebook from scratch. With hotels or Airbnb, you risk the accommodation being booked by others, forcing the team to move in the middle of the project.',
        },
      ],
    },
  },
  {
    slug: 'blockhyra-nya-regler-juli-2026-guide-foretag',
    title: {
      sv: 'Blockhyra 2026: Nya regler från 1 juli – så påverkas ditt företags personalboende',
      en: 'Block rental 2026: New rules from July 1st – how your company accommodation is affected',
      pl: 'Wynajem blokowy 2026: Nowe zasady od 1 lipca – jak wpływa na zakwaterowanie pracowników',
    },
    description: {
      sv: 'Nya blockhyreregler 1 juli 2026 gör det enklare att hyra personalboende. Guide för företag som behöver tillfälliga bostäder till anställda.',
      en: 'New block rental rules July 1, 2026 make employee housing easier. Guide for companies needing temporary accommodation.',
      pl: 'Nowe zasady wynajmu blokowego od 1 lipca 2026 ułatwiają zakwaterowanie pracowników. Przewodnik dla firm.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-08',
    category: 'Lagstiftning',
    tags: ['blockhyra', 'lagstiftning', 'företagsbostäder', '2026'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      'Nya blockhyresregler träder i kraft 1 juli 2026 genom prop. 2025/26:187 \'En mer flexibel hyresmarknad\', som bygger på utredningen SOU 2025:65.',
      'Blockhyra innebär att minst tre bostadslägenheter hyrs ut som ett block till en hyresgäst; kravet på hyresnämndens godkännande förenklas.',
      'Mellanhandsföretag utan eget bostadsbehov, underkända av Svea hovrätt sedan 2022, tillåts som blockhyresgäster under vissa förutsättningar.',
      'Blockhyresgäst och andrahandshyresgäst kan avtala \'anpassad hyra\' som avviker från bruksvärdeshyran, och bulvanregeln undantas för blockhyra.',
      'Schablonavdraget för privatuthyrning höjs 1 juli 2026 från 40 000 kr till 50 000 kr per bostad och år.',
    ],
  },
  {
    slug: 'blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026',
    title: {
      sv: 'Så fungerar blockhyra för Ostlänken och Norrbotniabanan 2026',
      en: 'How block rental works for Ostlänken and Norrbotniabanan 2026',
      pl: 'Jak działa wynajem zbiorczy dla projektów Ostlänken i Norrbotniabanan 2026',
    },
    description: {
      sv: 'Stora infrastrukturkontrakt kräver personalboende i hela Sverige. Så utnyttjar byggföretag de nya blockhyresreglerna från juli 2026.',
      en: 'Major infrastructure contracts require staff accommodation. How construction firms use the new block rental rules from July 2026.',
      pl: 'Duże kontrakty infrastrukturalne wymagają zakwaterowania personelu. Jak firmy budowlane używają nowych zasad wynajmu od lipca 2026.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-08',
    category: 'Guide',
    tags: ['blockhyra', 'infrastruktur', 'ostlänken', 'byggsektorn'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      'Den 1 juli 2026 moderniseras blockhyresreglerna: anpassad hyra tillåts, takregeln gäller inte och besittningsskyddet kan avtalas bort i upp till ett år.',
      'Blockhyra kräver minst tre lägenheter — byggföretaget blir kontraktspart mot fastighetsägaren och ansvarar för fördelningen till anställda.',
      'Räkneexempel: 4 lägenheter à 8 500 kr/mån i 8 månader kostar 272 000 kr, mot ca 2,6 miljoner kr för hotell för 12 montörer — över 2,3 miljoner kr sparat.',
      'Regeringen gav byggstartsbeslut för Norrbotniabanan den 11 februari 2025; sträckan Umeå–Dåva ska öppna för godstrafik under 2026.',
      'Hochtief och Bouygues har tilldelats Ostlänkens tiomiljarderskontrakt Vagnhärad respektive Skavsta; börja söka boende 3–6 månader före byggstart.',
    ],
    faq: [
      {
        q: 'Kan vi ingå blockhyresavtal redan innan 1 juli 2026?',
        a: 'Ja, blockhyra finns redan idag, men de nya reglerna gör det enklare och mer förutsägbart. Vid avtal före 1 juli kan det vara värt att inkludera en klausul om att avtalet justeras enligt de nya reglerna när de träder i kraft.',
      },
      {
        q: 'Vad händer om vi behöver fler eller färre lägenheter under projektet?',
        a: 'Det beror på vad ni avtalat med fastighetsägaren. Många fastighetsägare är flexibla om ni kommunicerar i god tid, och StayOnSite kan hjälpa till att hitta kompletterande boende vid behov.',
      },
      {
        q: 'Kan vi hyra möblerade lägenheter via blockhyra?',
        a: 'Ja, många fastighetsägare erbjuder möblerade alternativ, vilket passar montörer som kommer från annan ort. Diskutera detta vid avtalsförhandlingen.',
      },
    ],
  },
  {
    slug: 'sommaruthyrning-montorer-guide-2026',
    title: {
      sv: 'Sommaruthyrning till montörer 2026 – Komplett guide för husägare',
      en: 'Summer rental to contractors 2026 – Complete guide for homeowners',
      pl: 'Wynajem letni dla monterów 2026 – Kompleksowy przewodnik dla właścicieli domów',
    },
    description: {
      sv: 'Praktisk guide för dig som vill hyra ut din bostad till montörer sommaren 2026. Sätt rätt pris, förbered bostaden och hitta hyresgäster.',
      en: 'Practical guide for renting out your property to contractors in summer 2026. Set the right price, prepare your home and find tenants.',
      pl: 'Praktyczny przewodnik dla wynajmujących mieszkanie monterom latem 2026. Ustal odpowiednią cenę i przygotuj nieruchomość.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-15',
    category: 'Guide',
    tags: ['uthyrning', 'montörboende', 'sommaruthyrning', 'privatuthyrning', 'ROT-avdrag'],
    readingTime: 9,
    audience: 'husagare',
    keyTakeaways: [
      'ROT-avdraget är 30 % av arbetskostnaden från 1 januari 2026, max 50 000 kr per person och år; taket för ROT+RUT tillsammans är 75 000 kr per person.',
      'Schablonavdraget är 40 000 kr per år plus 20 % av hyresintäkten; den som tjänat under 40 000 kr på privatuthyrning slipper deklarera inkomsten.',
      'Räkneexempel: 80 000 kr i hyresintäkt ger 24 000 kr i skattepliktig inkomst och 7 200 kr i skatt (30 % kapitalbeskattning).',
      'Riktpriser för montörboende: Stockholm 450–700 kr per person/natt, Boden/Luleå/Skellefteå 400–550 kr, mindre orter 300–450 kr.',
      'Vid uthyrning kortare än 9 månader får hyresgästen inget besittningsskydd, förutsatt att avtalet är tydligt tidsbegränsat.',
    ],
  },
  {
    slug: 'schablonavdrag-skatt-blockhyra-husagare-2026',
    title: {
      sv: 'Schablonavdrag och skatt vid blockhyra: Guide för husägare 2026',
      en: 'Tax deductions and block rental: Landlord guide 2026',
      pl: 'Odliczenia podatkowe i wynajem blokowy: Przewodnik dla właścicieli 2026',
    },
    description: {
      sv: 'Hur beskattas blockhyra till företag 2026? Guide till schablonavdrag, ROT/RUT-avdrag och vad den nya lagen betyder för dig som husägare.',
      en: 'How is block rental taxed in 2026? Guide to deductions, ROT/RUT and what the new law means for property owners.',
      pl: 'Jak opodatkowany jest wynajem blokowy w 2026 roku? Przewodnik po odliczeniach i nowej ustawie dla właścicieli nieruchomości.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-22',
    category: 'Guide',
    tags: ['skatt', 'blockhyra', 'schablonavdrag', 'husägare', 'privatuthyrningslagen'],
    readingTime: 9,
    audience: 'husagare',
    keyTakeaways: [
      'Den 1 juli 2026 höjs schablonavdraget från 40 000 kr till 50 000 kr per bostad och år; 2026 blir ett övergångsår med proportionerade belopp per halvår.',
      'Gränsen för näringsverksamhet höjs från en till två bostäder — den som hyr ut två bostäder kan göra schablonavdrag på max 100 000 kr per år.',
      'Höjningen ger en direkt skattebesparing på 3 000 kr per bostad och år (10 000 kr × 30 %) — upp till 6 000 kr för två bostäder.',
      'Vid uthyrning av 3+ bostäder klassas verksamheten som näringsverksamhet med egenavgifter på cirka 28 % istället för 30 % kapitalskatt.',
      'ROT- och RUT-avdrag ges inte för arbeten under uthyrningstiden, och Skatteverket kan begära underlag upp till 6 år efter deklarationsåret.',
    ],
  },
  {
    slug: 'var-aterhamtar-bostadsbyggandet-montorboende-prognos-2026',
    title: {
      sv: 'Var återhämtar sig bostadsbyggandet? Prognos för montörboende 2026-2027',
      en: 'Where is housing construction recovering? Forecast for worker accommodation 2026-2027',
      pl: 'Gdzie budownictwo mieszkaniowe się odradza? Prognoza dla zakwaterowania pracowników 2026-2027',
    },
    description: {
      sv: 'Bostadsbyggandet vänder uppåt 2026. Se vilka regioner som får mest aktivitet och var byggföretag behöver montörboende och personalboende.',
      en: 'Housing construction rebounds in 2026. See which regions will see most activity and where companies need worker accommodation.',
      pl: 'Budownictwo mieszkaniowe rośnie w 2026 r. Zobacz, które regiony będą najbardziej aktywne i gdzie potrzebne będzie zakwaterowanie.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-04-29',
    category: 'Analys',
    tags: ['bostadsbyggande', 'byggprognos', 'regional-analys', 'montörboende-2026'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Boverkets byggprognos (mars 2026): ca 35 000 bostäder påbörjas 2026 och nästan 38 000 under 2027, upp från 22 400 påbörjade 2024.',
      'Byggföretagen: bygginvesteringarna ökar ca 8 % under 2026–2027 — Stockholm +11 %, Malmö +6 %, Göteborg +5 %.',
      'Boverkets beräknade bostadsbehov är 52 300 nya bostäder per år, långt över de prognostiserade byggnivåerna 2026–2027.',
      'Hemnets prognos: bostadsrättspriserna stiger 2026 med 8,4 % i Stockholm, 7,6 % i Uppsala och 7,5 % i Malmö.',
      '80 % av kommunerna i storstadsregionerna anger höga produktionskostnader som hinder för bostadsbyggandet — i Göteborg 92 %.',
    ],
  },
  {
    slug: 'hyra-ut-blockhyra-privatuthyrningslagen-juli-2026-husagare',
    title: {
      sv: 'Nya blockhyra-reglerna från 1 juli 2026: Guide för husägare som vill hyra ut',
      en: 'New Block Rental Rules from July 1, 2026: Guide for Property Owners',
      pl: 'Nowe zasady wynajmu blokowego od 1 lipca 2026: Przewodnik dla właścicieli',
    },
    description: {
      sv: 'Från 1 juli 2026 ändras reglerna för blockhyra och privatuthyrning. Vad innebär det för dig som vill hyra ut till företag?',
      en: 'From July 1, 2026, rules for block rental and private leasing change. What does it mean for property owners?',
      pl: 'Od 1 lipca 2026 r. zmieniają się zasady wynajmu grupowego. Co to oznacza dla właścicieli nieruchomości?',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-05-06',
    category: 'Lagstiftning',
    tags: ['privatuthyrningslagen', 'blockhyra', 'lagändring 2026', 'skattefrågor uthyrning', 'hyra ut till företag'],
    readingTime: 8,
    audience: 'husagare',
    keyTakeaways: [
      'Från 1 juli 2026 höjs gränsen i privatuthyrningslagen från en till två bostäder — båda kan hyras ut utan att klassas som näringsverksamhet.',
      'Hyressättningen blir friare från 1 juli 2026: hyran behöver inte följa bruksvärdet men får inte vara oskälig utifrån storlek, läge och standard.',
      'Schablonavdraget gäller per bostad — med två uthyrda bostäder dubbleras totalavdraget. Överskottet beskattas med 30 %.',
      'För småhus medges utöver schablonavdraget även avdrag med 20 % av hyresintäkten — 144 000 kr i årshyra ger 68 800 kr i totala avdrag.',
      'Blockhyra innebär att minst tre lägenheter hyrs ut som ett block till ett företag som i sin tur hyr ut till anställda — ett avtal, mindre administration.',
    ],
    faq: [
      {
        q: 'När träder de nya reglerna i kraft?',
        a: 'De nya reglerna träder i kraft den 1 juli 2026. Regeringens proposition har antagits och lagändringarna väntas börja gälla från detta datum.',
      },
      {
        q: 'Kan jag hyra ut fler än två bostäder?',
        a: 'Ja, men då klassas uthyrningen troligen som näringsverksamhet. Det innebär NE-bilaga i deklarationen och eventuellt egenavgifter och moms.',
      },
      {
        q: 'Måste jag deklarera hyresintäkter under 40 000 kr?',
        a: 'Ja, hyresintäkter ska alltid deklareras även om de understiger schablonavdraget. Är avdragen större än intäkterna blir det inget beskattningsbart överskott.',
      },
      {
        q: 'Vad händer om jag tar ut för hög hyra?',
        a: 'Vid andrahandsuthyrning av hyresrätt kan du bli återbetalningsskyldig för överhyran upp till två år retroaktivt. Hyr du ut hus eller bostadsrätt kan du bara tvingas sänka hyran, aldrig återbetala retroaktivt.',
      },
      {
        q: 'Vad är skillnaden mellan blockhyra och vanlig uthyrning?',
        a: 'Vid blockhyra hyr ett företag minst tre bostäder i ett sammanhang och ansvarar för vidareuthyrningen till sina anställda — du får ett enda avtal. Vid vanlig uthyrning tecknar du individuella avtal med varje hyresgäst.',
      },
      {
        q: 'Kan jag hyra ut min sommarstuga som personalboende?',
        a: 'Ja, med den nya tvåbostadsgränsen kan du hyra ut både din permanentbostad och din fritidsbostad enligt privatuthyrningslagen.',
      },
    ],
  },
  {
    slug: 'infrastrukturplan-2026-2037-personalboende-guide',
    title: {
      sv: 'Regeringens nya infrastrukturplan 2026-2037: Vad betyder den för personalboende?',
      en: 'Sweden\'s National Infrastructure Plan 2026-2037: What It Means for Worker Accommodation',
      pl: 'Krajowy plan infrastruktury Szwecji 2026-2037: Co oznacza dla zakwaterowania pracowników?',
    },
    description: {
      sv: 'Ny infrastrukturplan 2026-2037 med byggstartsbeslut för Ostlänken, Norrbotniabanan och fler projekt. Guide för byggföretag och montörboende.',
      en: 'New infrastructure plan with construction decisions. Guide for contractors on accommodation needs 2026-2037.',
      pl: 'Nowy plan infrastruktury ze startem budowy. Przewodnik dla firm budowlanych o potrzebach zakwaterowania.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-05-13',
    category: 'Analys',
    tags: ['infrastruktur', 'ostlänken', 'norrbotniabanan', 'personalboende', 'trafikverket'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Regeringen beslutade 28 april 2026 om en nationell plan för transportinfrastrukturen 2026–2037 omfattande totalt 1 171 miljarder kronor.',
      'Ramen fördelas: 607 mdkr till utveckling av transportsystemet, 354 mdkr till vägunderhåll och 210 mdkr till järnvägsunderhåll — 200 mdkr mer än förra planen.',
      'Ostlänken kostnadsbedöms till 91,4 miljarder kr (2021 års prisnivå), byggs 2024–2034 och öppnar för trafik 2035.',
      'Byggstartsbeslutet ger klartecken för objekt år 1–3 (2026–2028), bl.a. Laxå bangård och mötesspår Kil–Charlottenberg på Värmlandsbanan.',
      'Prognoscentret: anläggningsinvesteringarna ökar 5 % 2025 till 261 mdkr (2023 års prisnivå), därefter 5 % under 2026 och 4 % under 2027.',
    ],
  },
  {
    slug: 'kompetensbristen-byggsektorn-2026-praktisk-rekryteringsguide',
    title: {
      sv: 'Kompetensbristen i byggsektorn 2026: Praktisk guide för företag som rekryterar',
      en: 'Construction Labor Shortage 2026: Practical Recruitment Guide',
      pl: 'Niedobór pracowników w budownictwie 2026: Praktyczny przewodnik rekrutacyjny',
    },
    description: {
      sv: '76% av byggföretagen har problem att rekrytera. Lös kompetensbristen genom flexibel rekrytering och boende. Guide med 5 strategier.',
      en: '76% of construction companies struggle to recruit. Solve talent shortage with flexible hiring and accommodation. Guide with 5 strategies.',
      pl: '76% firm budowlanych ma problemy z rekrutacją. Rozwiąż brak talentów dzięki elastycznej rekrutacji. Przewodnik z 5 strategiami.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-05-20',
    category: 'Guide',
    tags: ['kompetensförsörjning', 'rekrytering', 'arbetskraftsbrist', 'byggsektorn', 'personalstrategi'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      '76 % av Byggföretagens medlemsföretag har svårt att rekrytera och vart fjärde rekryteringsförsök misslyckas helt (Svenskt Näringsliv 2025/2026).',
      'Över 3 500 lediga jobb inom bygg och anläggning finns på Arbetsförmedlingens platsbank; 37 % av företagen har tackat nej till uppdrag pga kompetensbrist.',
      '93 % av företagen påverkas negativt av rekryteringssvårigheter och 69 % anger brist på rätt yrkeserfarenhet som huvudproblem.',
      'Sökande till gymnasiets bygg- och anläggningsprogram ökade med 10 % enligt Skolverket; 730 av 5 500 sökande (13 %) är tjejer.',
      '47 % av de tillfrågade i byggbranschen kan tänka sig att byta bransch om möjligheten gavs — bland byggnadsarbetare är siffran 55 %.',
    ],
  },
  {
    slug: 'nya-hyreslagen-juli-2026-foretag-personalboende-guide',
    title: {
      sv: 'Nya hyreslagen juli 2026: Vad gäller för företag som hyr ut personalboende?',
      en: 'New Rental Law July 2026: What Applies to Companies Providing Staff Accommodation?',
      pl: 'Nowa ustawa czynszowa lipiec 2026: Co obowiązuje firmy wynajmujące zakwaterowanie dla pracowników?',
    },
    description: {
      sv: '1 juli 2026 träder nya hyresregler i kraft. Här är vad byggföretag och boendebolag behöver veta om privatuthyrningslagen och blockhyra.',
      en: 'New rental rules take effect July 1, 2026. Here\'s what construction companies and accommodation providers need to know about the reform.',
      pl: '1 lipca 2026 wchodzą nowe zasady wynajmu. Oto co firmy budowlane i dostawcy zakwaterowania muszą wiedzieć o reformie.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-06-03',
    category: 'Lagstiftning',
    tags: ['privatuthyrningslagen', 'hyreslagstiftning', 'blockhyra', 'företagsuthyrning', 'nya-regler-2026'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Riksdagen antog 20 maj 2026 propositionen \'En mer flexibel hyresmarknad\'; reformen träder i kraft den 1 juli 2026.',
      'Reformen har tre delar: ny privatuthyrningslag (ersätter lagen 2012:978), utökad andrahandsuthyrning av bostadsrätter och moderniserad blockhyra.',
      'Nya privatuthyrningslagen tillåter uthyrning av upp till två bostäder med avtalsfrihet om hyran; hyresgästen kan begära prövning av väsentligt hög hyra.',
      'Blockhyra (minst tre lägenheter) förenklas: hyresnämnden prövar inte längre varje avtalsvillkor, \'anpassad hyra\' tillåts och besittningsskyddet kan lättare avtalas bort.',
      'Schablonavdraget för husägare som hyr ut höjs från 40 000 kr till 50 000 kr per år från juli 2026.',
    ],
  },
  {
    slug: 'forbered-fastighet-blockhyra-infrastruktursatsning-2026',
    title: {
      sv: 'Så förbereder du din fastighet för blockhyra när infrastrukturbyggena tar fart',
      en: 'How to Prepare Your Property for Block Rental During Infrastructure Boom',
      pl: 'Jak przygotować nieruchomość do wynajmu grupowego podczas boomu infrastrukturalnego',
    },
    description: {
      sv: 'Regeringens 1171 miljarder i infrastruktur skapar enorm efterfrågan. Gör din fastighet redo för personalboende med denna praktiska checklista.',
      en: 'Government\'s 1171 billion infrastructure plan creates huge demand. Prepare your property for worker accommodation with this practical checklist.',
      pl: 'Rządowy plan infrastrukturalny za 1171 miliardów tworzy ogromny popyt. Przygotuj swoją nieruchomość na zakwaterowanie pracowników.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-06-03',
    category: 'Guide',
    tags: ['blockhyra', 'infrastruktur', 'husägare', 'fastighetsförberedelse', 'renovering', 'personalboende'],
    readingTime: 9,
    audience: 'husagare',
    keyTakeaways: [
      'Den 28 april 2026 beslutade regeringen om nationella transportinfrastrukturplanen 2026–2037 med en total ram på 1 171 miljarder kronor.',
      'E4 Förbifart Stockholm delöppnar Häggvik–Hjulsta hösten 2026; hela vägen klar omkring 2030 med trolig slutkostnad 51,5 miljarder kronor.',
      'ROI-exempel Skellefteå: 550 000 kr i uppgraderingar, blockhyra 8 rum à 5 500 kr/mån ger 528 000 kr/år – 31 % mer än privat uthyrning, payback 4,4 år.',
      'Byggnads kollektivavtal kräver boende av godtagbar standard: eget rum per person, goda dusch- och toalettmöjligheter, gemensamt kök och tvättmöjligheter.',
      'Hyresintäkter från blockhyra beskattas som kapitalinkomst (30 %); schablonavdrag på 40 000 kr per år gäller vid möblerad uthyrning.',
    ],
  },
  {
    slug: 'blockhyra-personalbostader-nya-regler-implementering-2026',
    title: {
      sv: 'Nya hyreslagen är nu aktiv: Vad händer med dina personalboenden?',
      en: 'New Rental Law Now Active: Impact on Staff Accommodation',
      pl: 'Nowe prawo najmu już obowiązuje: Wpływ na zakwaterowanie pracowników',
    },
    description: {
      sv: 'Från 1 juli 2026 gäller nya regler för blockhyra. Så påverkas företagsbostäder och personalboende – praktisk guide för företag.',
      en: 'New block rental rules took effect July 1, 2026. How corporate housing and staff accommodation are affected – practical guide.',
      pl: 'Od 1 lipca 2026 obowiązują nowe zasady najmu blokowego. Wpływ na mieszkania służbowe – praktyczny przewodnik.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-06-10',
    category: 'Lagstiftning',
    tags: ['blockhyra', 'hyreslagen-2026', 'företagsbostäder', 'personalboende', 'lagändringar'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Den 1 juli 2026 trädde propositionen \'En mer flexibel hyresmarknad\' i kraft: ny privatuthyrningslag, utökad andrahandsuthyrning och moderniserad blockhyra.',
      'Blockhyra kräver minst tre bostadslägenheter; hyresnämnden prövar nu ändamålet med upplåtelsen i stället för varje enskilt avtalsvillkor.',
      'Vid blockhyra kan det direkta besittningsskyddet avtalas bort och lokalhyresreglerna tillämpas fullt ut om parterna vill det.',
      'Hyresvärd och blockhyresgäst får avtala hyra över bruksvärdeshyran; i andrahandsledet kan \'anpassad hyra\' avtalas med skydd mot väsentligt för hög hyra.',
      'Avtal enligt nya regelverket kan ingås tidigast 1 juli 2026; befintliga blockhyresavtal godkända enligt tidigare regler fortsätter att gälla.',
    ],
    faq: [
      {
        q: 'Måste vi söka nytt tillstånd för befintliga blockhyresavtal?',
        a: 'Nej, befintliga blockhyresavtal som godkänts enligt tidigare regelverk fortsätter att gälla. Det kan dock vara fördelaktigt att se över avtalen och ansöka om nya tillstånd enligt det enklare systemet om ni vill göra förändringar.',
      },
      {
        q: 'Hur lång tid tar det att få tillstånd från hyresnämnden nu?',
        a: 'Prövningen görs enklare och snabbare genom att hyresnämnden endast prövar om blockuthyrning som sådan ska tillåtas. Exakt tid varierar mellan hyresnämnder, men prognosen är betydligt kortare handläggningstid än tidigare.',
      },
      {
        q: 'Kan vi använda blockhyra för korttidsprojekt?',
        a: 'Ja, blockhyra kan användas för tillfälliga projekt. Villkor kan dessutom ändras under pågående hyresförhållande utan att nytt tillstånd behöver sökas.',
      },
      {
        q: 'Vad händer om vi inte följer regelverket?',
        a: 'Hyresnämnden kan avslå ansökningar där det finns särskilda skäl mot tillstånd, för att motverka oseriösa aktörer. Vid bristande regelefterlevnad riskerar företag att förlora sina tillstånd och kan bli skyldiga att återbetala hyra.',
      },
      {
        q: 'Behöver vi anlita jurist för att upprätta avtal?',
        a: 'Det är inte obligatoriskt men rekommenderas starkt för större avtal. Alternativt kan standardmallar från Hyresbostadsägarna Stockholm och Företagsbostadsbolagen användas.',
      },
      {
        q: 'Gäller nya regler även för delningsbostäder (coliving)?',
        a: 'Ja. I delningsbostäder hyr hyresgästerna varsitt rum och delar på gemensamma ytor, och de nya reglerna underlättar specifikt för denna typ av boende.',
      },
    ],
  },
  {
    slug: 'boende-utlandska-arbetare-bygg-praktisk-guide-2026',
    title: {
      sv: 'Boende för utländska arbetare inom bygg: Praktisk guide 2026',
      en: 'Housing for foreign construction workers: Practical guide 2026',
      pl: 'Zakwaterowanie dla zagranicznych pracowników budowlanych: Praktyczny przewodnik 2026',
    },
    description: {
      sv: 'Praktisk guide för byggföretag: Så planerar du boende, avtal och logistik för utländska arbetsteam från EU. Checklista och tips.',
      en: 'Practical guide for construction companies: Plan housing, contracts & logistics for foreign EU workers. Checklist & tips included.',
      pl: 'Praktyczny przewodnik dla firm budowlanych: Jak zaplanować zakwaterowanie, umowy i logistykę dla zagranicznych zespołów z UE.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-06-24',
    category: 'Guide',
    tags: ['utländsk arbetskraft', 'utstationering', 'arbetskraftsbrist', 'infrastrukturprojekt', 'EU-regler'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      '76 % av Byggföretagens medlemsföretag har svårt att rekrytera och vart fjärde rekryteringsförsök misslyckas helt, enligt Svenskt Näringslivs enkät 2025/2026.',
      'Under 2025 fanns nära 75 000 utstationerade arbetstagare i Sverige enligt Arbetsmiljöverket; störst ökning i Norrbotten och Gävleborg.',
      'Från 28 januari 2026 kräver ID06-kort identifiering med giltigt pass eller nationellt ID-kort som godkänns som resehandling inom EU/EES.',
      'Personalboende kostar typiskt 8 000–15 000 kr per person och månad, jämfört med 18 000–35 000 kr för hotell.',
      'Planera boende minst 3–6 månader före projektstart – i Luleå, Kiruna, Boden och Skellefteå är personalboenden ofta fullbokade månader i förväg.',
    ],
    en: {
      slug: 'housing-foreign-construction-workers-sweden-2026',
      keyTakeaways: [
        '76 percent of the member companies of Byggföretagen (the Swedish Construction Federation) report difficulties recruiting, and one in four recruitment attempts fails completely, according to the 2025/2026 survey by Svenskt Näringsliv (the Confederation of Swedish Enterprise).',
        'In 2025 there were nearly 75,000 posted workers in Sweden according to Arbetsmiljöverket (the Swedish Work Environment Authority), with the largest increases in Norrbotten and Gävleborg.',
        'From 28 January 2026, ID06 cards require identification with a valid passport or a national ID card accepted as a travel document within the EU/EEA.',
        'Worker accommodation typically costs SEK 8,000–15,000 per person per month on the open market, compared with SEK 18,000–35,000 for hotels; via StayOnSite from SEK 5,900 per person per month.',
        'Plan housing at least 3–6 months before project start – in Luleå, Kiruna, Boden and Skellefteå, worker accommodation is often fully booked months in advance.',
      ],
    },
  },
  {
    slug: 'forbered-infrastrukturkontrakt-2026-boende-entreprenorer-guide',
    title: {
      sv: 'Förbered er innan infrastrukturkontrakten tecknas hösten 2026 – boendeguide för entreprenörer',
      en: 'Prepare Before Infrastructure Contracts Are Signed Fall 2026 – Housing Guide for Contractors',
      pl: 'Przygotuj się przed podpisaniem kontraktów infrastrukturalnych jesienią 2026 – przewodnik po zakwaterowaniu dla wykonawców',
    },
    description: {
      sv: 'Stora kontrakt inom Ostlänken och Norrbotniabanan tecknas hösten 2026. Så säkrar du boende för din personal i tid.',
      en: 'Major contracts in Ostlänken and Norrbotniabanan signed fall 2026. How to secure worker housing in time.',
      pl: 'Duże kontrakty w Ostlänken i Norrbotniabanan podpisywane jesienią 2026. Jak zabezpieczyć zakwaterowanie dla pracowników.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-01',
    category: 'Guide',
    tags: ['infrastruktur', 'ostlänken', 'norrbotniabanan', 'upphandling', 'personalboende', 'entreprenörer'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      '13 februari 2026 tilldelade Trafikverket Ostlänken-kontrakt: Vagnhärad 9,5 miljarder kr till Hochtief och Skavsta 12,0 miljarder kr till Bouygues Travaux Publics.',
      'Norrbotniabanan är en ca 270 km ny kustjärnväg Umeå–Luleå; i mars 2026 fick GRK ett uppdrag värt 595 miljoner kr som ska vara färdigställt 2029.',
      '24 april 2026 fattade regeringen byggstartsbeslut för flera projekt i nationella infrastrukturplanen 2026–2037, totalt omkring 1 200 miljarder kronor.',
      'Från kontraktstilldelning till fungerande boende tar det ofta 3–8 månader: 10 dagars avtalsspärr, 2–6 månaders mobilisering och 1–3 månaders etablering.',
      'Av 668 myndighetsgemensamma kontroller på byggarbetsplatser 2025 gav 92 inspektionsmeddelanden, 88 förbud och 91 faktaunderlag för sanktionsavgifter.',
    ],
  },
  {
    slug: 'foretagsbostader-nya-regler-juli-2026-guide',
    title: {
      sv: 'Företagsbostäder enligt nya reglerna från 1 juli 2026 – guide för arbetsgivare',
      en: 'Corporate Housing Under New Rules from July 1, 2026 – Employer Guide',
      pl: 'Mieszkania służbowe według nowych przepisów od 1 lipca 2026 – przewodnik dla pracodawców',
    },
    description: {
      sv: 'Nya regler för företagsbostäder från 1 juli. Förenklad blockhyra, delningsbostäder och flexiblare avtal. Praktisk guide för byggföretag.',
      en: 'New rules for corporate housing from July 1. Simplified block rentals, co-living spaces, and flexible contracts. Practical guide for construction companies.',
      pl: 'Nowe przepisy dotyczące mieszkań służbowych od 1 lipca. Uproszczone wynajem zbiorowy, wspólne mieszkania i elastyczne umowy.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-08',
    category: 'Guide',
    tags: ['företagsbostäder', 'blockhyra', 'nya-regler-2026', 'lagstiftning', 'personalboende'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Riksdagen antog i maj 2026 propositionen \'En mer flexibel hyresmarknad\'; lagändringarna för företagsbostäder träder i kraft den 1 juli 2026.',
      'Blockhyra kräver minst tre lägenheter; hyresnämnden prövar numera ändamålet med blockhyran, inte de enskilda avtalsvillkoren.',
      'Andrahandshyresgäst kan inte kräva förstahandskontrakt om uthyrningen understiger ett år; efter ett år kan besittningsskydd börja gälla.',
      'Privatuthyrningslagen omfattar nu uthyrning av upp till två bostäder samtidigt utan att det klassas som näringsverksamhet.',
      'Bostadsbyggandet väntas öka från cirka 30 900 påbörjade bostäder 2025 till 37 000 under 2026, enligt Byggfakta.',
    ],
    faq: [
      {
        q: 'Är de nya reglerna tvingande från 1 juli 2026?',
        a: 'Ja, lagändringarna träder i kraft den 1 juli 2026. Befintliga avtal fortsätter att gälla, men nya avtal måste följa det nya regelverket.',
      },
      {
        q: 'Kan vi hyra färre än tre lägenheter som företagsbostäder?',
        a: 'Färre än tre lägenheter klassas inte som blockhyra. Företag kan i stället hyra en eller två lägenheter från en privatperson enligt privatuthyrningslagen, eller från en professionell fastighetsägare enligt vanliga hyresregler.',
      },
      {
        q: 'Måste vi som företag ha tillstånd från hyresnämnden?',
        a: 'Vid blockhyra är det fastighetsägaren som ansöker om tillstånd, och hyresnämnden prövar ändamålet med blockhyran. Som företag behöver ni samarbeta med fastighetsägaren för att säkerställa att tillstånd söks och beviljas.',
      },
      {
        q: 'Vad händer om en anställd vill bo kvar efter projektets slut?',
        a: 'Andrahandshyresgäst kan inte kräva förstahandskontrakt om uthyrningen understiger ett år, men efter ett år kan besittningsskydd börja gälla. Ha därför tydliga tidsbegränsade avtal och kommunicera detta till de anställda.',
      },
      {
        q: 'Hur beskattas företagsbostäder?',
        a: 'Förmånsvärdet av fri bostad kan bli skattepliktigt för den anställde, medan hyreskostnaden är avdragsgill för arbetsgivaren. För fastighetsägaren beskattas hyresintäkten, men schablonavdrag på 50 000 kr per år kan gälla vid privatuthyrning.',
      },
    ],
    en: {
      slug: 'corporate-housing-sweden-new-rules-july-2026',
      keyTakeaways: [
        'In May 2026, the Riksdag (the Swedish Parliament) passed the government bill \'En mer flexibel hyresmarknad\' (A More Flexible Rental Market); the legislative changes for corporate housing take effect on July 1, 2026.',
        'Blockhyra (block rental) requires at least three apartments; hyresnämnden (the Rent Tribunal) now reviews the purpose of the block rental, not the individual contract terms.',
        'A subtenant cannot claim a first-hand lease if the rental period is shorter than one year; after one year, besittningsskydd (security of tenure) may start to apply.',
        'Privatuthyrningslagen (the Private Rental Act) now covers renting out up to two homes at the same time without it being classified as business activity.',
        'Housing construction is expected to increase from around 30,900 housing starts in 2025 to 37,000 in 2026, according to Byggfakta.',
      ],
      faq: [
        {
          q: 'Are the new rules mandatory from July 1, 2026?',
          a: 'Yes, the legislative changes take effect on July 1, 2026. Existing agreements remain valid, but new agreements must comply with the new rules.',
        },
        {
          q: 'Can we rent fewer than three apartments as corporate housing?',
          a: 'Fewer than three apartments does not count as blockhyra (block rental). Companies can instead rent one or two homes from a private individual under privatuthyrningslagen (the Private Rental Act), or from a professional property owner under regular tenancy rules.',
        },
        {
          q: 'Do we as a company need a permit from the Rent Tribunal?',
          a: 'With block rental, it is the property owner who applies for the permit, and hyresnämnden (the Rent Tribunal) reviews the purpose of the block rental. As a company, you need to work with the property owner to ensure the permit is applied for and granted.',
        },
        {
          q: 'What happens if an employee wants to stay on after the project ends?',
          a: 'A subtenant cannot claim a first-hand lease if the rental period is shorter than one year, but after one year security of tenure may start to apply. Use clearly time-limited agreements and communicate this to your employees.',
        },
        {
          q: 'How is corporate housing taxed?',
          a: 'The benefit value of free housing may be taxable for the employee, while the rental cost is deductible for the employer. For the property owner, rental income is taxed, but a standard deduction (schablonavdrag) of SEK 50,000 per year may apply for private rentals.',
        },
      ],
    },
  },
  {
    slug: 'elnatsutbyggnad-nordsyd-personalboende-guide-2026',
    title: {
      sv: 'Elnätsutbyggnaden NordSyd 2026–2035: var behövs personalboende för kraftledningsprojekten?',
      en: 'Sweden\'s NordSyd Grid Expansion 2026–2035: Where Worker Accommodation Will Be Needed',
      pl: 'Rozbudowa sieci NordSyd 2026–2035: gdzie będzie potrzebne zakwaterowanie dla monterów?',
    },
    description: {
      sv: 'Svenska kraftnät investerar 180 miljarder kr i stamnätet till 2035. Se vilka regioner som behöver personalboende för elmontörer.',
      en: 'Svenska kraftnät invests SEK 180bn in the grid by 2035. See which regions will need worker accommodation for grid crews.',
      pl: 'Svenska kraftnät zainwestuje 180 mld SEK w sieć do 2035 r. Sprawdź, gdzie będzie potrzebne zakwaterowanie dla monterów.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-15',
    category: 'Analys',
    tags: ['elnät', 'kraftledningar', 'personalboende', 'Svenska kraftnät', 'NordSyd'],
    readingTime: 9,
    audience: 'foretag',
    keyTakeaways: [
      'Satsningen omfattar cirka 180 miljarder kronor under perioden 2026–2035 för stamnätet.',
      'NordSyd kostar över 100 miljarder kronor och berör åtta län: Västernorrland, Jämtland, Gävleborg, Dalarna, Värmland, Västmanland, Uppsala och Stockholm.',
      'Investeringstakten ökar från 9 miljarder kronor 2025 till 20 miljarder kronor per år 2026 och 2027.',
      'Överföringskapaciteten mellan elområde 2 och 3 ska öka från 7 300 MW till cirka 10 500 MW när NordSyd är klart i slutet av 2030-talet.',
      'Branschen bedöms behöva 100 000 nya tekniker och ingenjörer de kommande tio åren för energiomställningen.',
    ],
    faq: [
      {
        q: 'Vilka regioner påverkas mest av elnätsutbyggnaden 2026–2035?',
        a: 'Störst byggvolym väntas i NordSyd-länen (Västernorrland, Jämtland, Gävleborg, Dalarna, Värmland, Västmanland, Uppsala och Stockholm), men även Norrbotten, Västerbotten, Skåne och Gotland har egna stora investeringsprogram.',
      },
      {
        q: 'När behöver entreprenörer säkra personalboende inför ett kraftledningsprojekt?',
        a: 'Boende bör bokas redan i anbudsskedet, innan upphandling avgörs, eftersom lokalt boendeutbud i glesbygd ofta är begränsat och konkurrensen kan vara hög under intensiva byggperioder.',
      },
      {
        q: 'Vilka yrkesgrupper behöver boende längs kraftledningskorridorerna?',
        a: 'Linjemontörer, ställverkstekniker, byggledare, projektledare samt konsulter inom miljö, geoteknik och arkeologi rör sig längs korridorerna under olika projektfaser.',
      },
      {
        q: 'Hur snabbt kan StayOnSite ta fram en boendeplan för ett kraftledningsprojekt?',
        a: 'Man återkommer alltid inom en arbetsdag, ofta inom några timmar, och kan i regel presentera en konkret boendeplan inom 24 timmar från första kontakt.',
      },
    ],
  },
  {
    slug: 'kriminalvarden-anstaltsbygge-personalboende-2026',
    title: {
      sv: 'Kriminalvårdens fängelseutbyggnad: så påverkas behovet av personalboende',
      en: 'Sweden\'s Prison Expansion: Growing Demand for Worker Accommodation',
      pl: 'Rozbudowa więzień w Szwecji: rosnące zapotrzebowanie na zakwaterowanie pracowników',
    },
    description: {
      sv: 'Kriminalvården bygger ut med tusentals nya platser på ~50 orter. Så säkrar byggföretag personalboende till projekten.',
      en: 'Sweden\'s prison system is expanding at ~50 sites nationwide. Here\'s how construction firms secure worker housing.',
      pl: 'System więzienny w Szwecji rozbudowuje się w ~50 lokalizacjach. Jak firmy budowlane zapewniają zakwaterowanie pracownikom.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-22',
    category: 'Analys',
    tags: ['kriminalvården', 'anstaltsbygge', 'personalboende', 'byggprojekt', 'infrastruktur'],
    readingTime: 8,
    audience: 'foretag',
    keyTakeaways: [
      'Kriminalvården planerar cirka 11 000 nya fasta platser på tio år, till totalt cirka 19 500 platser – mer än en fördubbling.',
      'I april 2026 beslutade regeringen om nya hyresavtal för Södertälje, Karlskoga, Hisingen, Värnamo, Trelleborg och Västervik.',
      'Anstalt Trelleborg blir cirka 110 000 kvadratmeter, med byggstart 2026 och drift från cirka 2030–2031, och sysselsätter uppemot 1 000 medarbetare vid spadtaget.',
      'Kristianstad Vä:s andra etapp ger cirka 400 nya platser, vilket totalt för båda etapperna ger cirka 600 platser.',
      'Flera hyresavtal löper på 25 år, medan Västerviks avtal gäller i 18 år och 7 månader med tillträde 2026.',
    ],
    faq: [
      {
        q: 'Hur många nya anstaltsplatser planeras totalt i Sverige?',
        a: 'Kriminalvården planerar omkring 11 000 nya fasta platser under en tioårsperiod, vilket mer än fördubblar dagens kapacitet, med utbyggnad etappvis fram mot mitten av 2030-talet.',
      },
      {
        q: 'Vilka orter är mest aktuella just nu?',
        a: 'Trelleborg, Värnamo, Södertälje, Karlskoga, Hisingen och Västervik ingår i ett samlat regeringsbeslut om nya hyresavtal, medan Kristianstad/Vä byggs ut i separata etapper.',
      },
      {
        q: 'Varför räcker inte lokal arbetskraft till dessa projekt?',
        a: 'Anstalter i högre säkerhetsklass kräver specialistkompetens som sällan finns på mindre orter, och byggtiderna är ofta fyra till sex år, vilket kräver en stabil, inflyttad arbetsstyrka.',
      },
      {
        q: 'Hur bör byggföretag planera personalboende för säkerhetsklassade projekt?',
        a: 'Planeringen bör ske redan i anbudsskedet, med hänsyn till hela byggtiden, bostadsmarknadens begränsningar och eventuella krav på bakgrundskontroller för boendeplatser nära byggarbetsplatsen.',
      },
    ],
  },
  {
    slug: 'vad-kostar-personalboende-sverige-2026-verkliga-priser',
    title: {
      sv: 'Vad kostar personalboende i Sverige 2026? Verkliga priser stad för stad',
      en: 'What Does Worker Accommodation in Sweden Cost in 2026? Real Prices City by City',
      pl: 'Ile kosztuje zakwaterowanie pracownicze w Szwecji 2026? Prawdziwe ceny miasto po mieście',
    },
    description: {
      sv: 'Faktiska priser ur vår portfölj: 38 objekt i juli 2026. Snittpris per bäddplats, hela hus stad för stad och vad som driver priset.',
      en: 'Actual prices from our portfolio: 38 properties in July 2026. Average price per bed, whole houses city by city and what drives the price.',
      pl: 'Rzeczywiste ceny z naszego portfela: 38 obiektów w lipcu 2026. Średnia cena za łóżko i całe domy miasto po mieście.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-28',
    category: 'Analys',
    tags: ['personalboende', 'priser', 'företagsbostäder', 'kostnadsjämförelse', 'budget'],
    readingTime: 6,
    audience: 'foretag',
    keyTakeaways: [
      'Snittpriset per bäddplats i StayOnSites bestånd är cirka 7 000 kr per månad (38 objekt, juli 2026); instegspriset är 5 900 kr per person och månad.',
      'Ett helt möblerat hus för ett arbetslag på 5–7 personer kostar typiskt 28 000–42 000 kr per månad i svenska industristäder.',
      'Kiruna är dyrast per bäddplats (ca 8 000 kr/mån) drivet av gruvnäringen och stadsomvandlingen; Luleå och Mönsterås ligger runt 6 100 kr.',
      'Motsvarande hotellboende utanför storstäderna kostar 21 000–30 000 kr per person och månad — tre till fyra gånger priset för en bäddplats i personalboende.',
      'Räkneexempel: 6 montörer i Kiruna i 5 månader kostar ca 185 000 kr i ett helt hus mot ca 810 000 kr på hotell.',
    ],
    faq: [
      {
        q: 'Vad kostar personalboende per person och månad?',
        a: 'Från 5 900 kr per person och månad. Snittet i StayOnSites bestånd är cirka 7 000 kr per bäddplats (38 objekt, juli 2026), och priset per person sjunker med antalet bäddar i boendet.',
      },
      {
        q: 'Varför är Kiruna dyrast per bäddplats?',
        a: 'Efterfrågan från gruvnäringen och stadsomvandlingen är hög samtidigt som utbudet av större bostäder är begränsat. Snittet i Kiruna ligger runt 8 000 kr per bäddplats mot cirka 6 100 kr i Luleå och Mönsterås.',
      },
      {
        q: 'Vad ingår i hyran?',
        a: 'Typiskt möblering, el, värme, vatten och wifi. Sängkläder, löpande städning och annan service avtalas separat utifrån projektets förutsättningar.',
      },
      {
        q: 'Är det billigare att hyra ett helt hus än enskilda bäddplatser?',
        a: 'Ja, nästan alltid. Ett hus med sex till åtta bäddar ger lägst kostnad per person och håller ihop teamet på ett ställe, vilket underlättar vid skiftgång och samåkning.',
      },
    ],
  },
  {
    slug: 'lagenhetshotell-eller-foretagsbostad-2026',
    title: {
      sv: 'Lägenhetshotell eller företagsbostad? Så väljer ni rätt 2026',
      en: 'Aparthotel or Corporate Housing? How to Choose in 2026',
      pl: 'Aparthotel czy mieszkanie firmowe? Jak wybrać w 2026',
    },
    description: {
      sv: 'Skillnaden mellan lägenhetshotell och företagsbostad: priser, avtal, kök och parkering. Med räkneexempel för ett montörsteam på 6 personer.',
      en: 'The difference between aparthotels and corporate housing: prices, contracts, kitchens and parking. With a worked example for a crew of 6.',
      pl: 'Różnica między aparthotelem a mieszkaniem firmowym: ceny, umowy, kuchnie i parking. Z przykładem dla ekipy 6 osób.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-28',
    category: 'Guide',
    tags: ['lägenhetshotell', 'företagsbostäder', 'korttidsboende', 'longstay', 'kostnadsjämförelse'],
    readingTime: 6,
    audience: 'foretag',
    keyTakeaways: [
      'Lägenhetshotell kostar typiskt 12 000–25 000 kr per person och månad på longstay-avtal; en företagsbostad kostar från 5 900 kr per person och månad.',
      'Lägenhetshotell finns nästan bara i storstäder och större regionstäder — på industriorter som Boden, Oskarshamn och Mönsterås är alternativet hotell, pendling eller företagsbostad.',
      'Räkneexempel: 6 montörer i Luleå i 4 månader kostar ca 168 000 kr i ett helt hus mot ca 336 000 kr på lägenhetshotell — halva kostnaden.',
      'Tumregel: under en månad eller enstaka resenärer — lägenhetshotell; en månad eller mer, team eller mindre ort — företagsbostad.',
      'En företagsbostad ger fullt kök, tvättmaskin och plats för servicebilar; lägenhetshotellet ger reception och löpande städning.',
    ],
    faq: [
      {
        q: 'Är lägenhetshotell och företagslägenhet samma sak?',
        a: 'Nej. Ett lägenhetshotell är ett hotellkoncept med reception och nattpriser. En företagslägenhet är en vanlig bostad som hyrs möblerad på månadsavtal med företaget som avtalspart — utan hotellservice och till betydligt lägre månadskostnad.',
      },
      {
        q: 'Finns lägenhetshotell i mindre städer?',
        a: 'Sällan. Kedjorna finns i storstäderna och de större regionstäderna. På industriorter som Boden, Mönsterås eller Oskarshamn står valet i praktiken mellan vanligt hotell, pendling eller en företagsbostad.',
      },
      {
        q: 'Vad är billigast för ett team på sex personer eller fler?',
        a: 'Ett helt hus som företagsbostad. Per bäddplats landar det på cirka 6 000–8 000 kr per månad, mot typiskt 12 000–25 000 kr per person på lägenhetshotell och 21 000–30 000 kr på vanligt hotell.',
      },
      {
        q: 'Ingår städning i en företagsbostad?',
        a: 'Slutstädning ingår. Löpande städning under vistelsen avtalas separat utifrån projektets förutsättningar — många team föredrar att sköta den själva och hålla nere kostnaden.',
      },
    ],
  },
  {
    slug: 'nya-byggregler-juli-2026-ombyggnad-personalboende',
    title: {
      sv: 'Nya byggregler från juli 2026: Så påverkas ombyggnad till personalboende',
      en: 'New Building Regulations July 2026: Impact on Converting Property to Worker Housing',
      pl: 'Nowe przepisy budowlane od lipca 2026: Wpływ na przebudowę na zakwaterowanie pracownicze',
    },
    description: {
      sv: 'Boverkets nya byggregler ersatte BBR fullt ut 1 juli 2026. Så påverkar det dig som vill bygga om till blockhyra.',
      en: 'Boverket\'s new building rules fully replaced BBR on July 1, 2026. How this affects converting property for block rental.',
      pl: 'Nowe przepisy Boverket zastąpiły BBR od 1 lipca 2026. Jak to wpływa na przebudowę na najem blokowy.',
    },
    author: 'Kajsa Sihlén',
    publishedDate: '2026-07-29',
    category: 'Lagstiftning',
    tags: ['byggregler', 'BBR', 'brandskydd', 'ombyggnad', 'blockhyra'],
    readingTime: 7,
    audience: 'husagare',
    keyTakeaways: [
      'Från 1 juli 2026 gäller Boverkets nya byggregler fullt ut - övergångsperioden med BBR/EKS avslutades 30 juni 2026',
      'Energikraven ligger kvar i gamla BBR (BBR 31) fram till 1 oktober 2026, som enda undantag',
      'Ändrad användning, t.ex. förråd till sovrum, utlöser nya krav på utrymning och tätning av brandcellsgränser',
      'Byggnader utan avstånd på minst åtta meter kräver brandteknisk konstruktion som brandcellsgräns eller brandvägg',
      'Beslut om lov meddelat före 1 juli 2026 med val av äldre regler gäller även vid startbesked efter detta datum',
    ],
    faq: [
      {
        q: 'Måste jag följa de nya byggreglerna om jag redan har bygglov?',
        a: 'Nej, inte nödvändigtvis. Om beslutet om lov meddelades före 1 juli 2026 och äldre regler valdes då gäller de även vid startbeskedet. För nya ansökningar gäller enbart det nya regelverket.',
      },
      {
        q: 'Räcker det att åtgärden är bygglovsbefriad för att slippa brandkrav?',
        a: 'Nej. En bygglovsbefriad åtgärd är inte detsamma som regelbefriad. Brandskydd, ventilation och VA-installationer är i regel fortsatt anmälningspliktiga.',
      },
      {
        q: 'Vad händer med energikraven efter 1 oktober 2026?',
        a: 'Fram till dess ligger energikraven kvar i gamla BBR. Efter 1 oktober 2026 väntas en ny grundförfattning för energihushållning träda i kraft, samordnad med EU:s direktiv om byggnaders energiprestanda.',
      },
      {
        q: 'Kan jag bygga om ett garage till boenderum för uthyrning till byggpersonal?',
        a: 'Ja, men det räknas som ändrad användning och utlöser krav på bland annat utrymningsvägar, brandcellsgränser, ventilation och ofta våtrumslösningar.',
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(p => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map(p => p.slug);
}

export function getBlogPostByEnSlug(enSlug: string): BlogPost | undefined {
  return blogPosts.find(p => p.en?.slug === enSlug);
}

/** Relaterade artiklar via delade taggar (2 p) och kategori (1 p), nyast först vid lika poäng. */
export function getRelatedPosts(slug: string, count = 3): BlogPost[] {
  const current = getBlogPost(slug);
  if (!current) return [];
  return blogPosts
    .filter(p => p.slug !== slug)
    .map(post => ({
      post,
      score:
        post.tags.filter(tag => current.tags.includes(tag)).length * 2 +
        (post.category === current.category ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || b.post.publishedDate.localeCompare(a.post.publishedDate)
    )
    .slice(0, count)
    .map(r => r.post);
}
