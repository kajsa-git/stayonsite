import { LocalizedKeywords, LocalizedString } from '@/types/localized';

const ls = (sv: string, en: string, pl: string): LocalizedString => ({ sv, en, pl });
const lk = (sv: string[], en: string[], pl: string[]): LocalizedKeywords => ({ sv, en, pl });

export interface CityMetric {
  value: string;
  label: LocalizedString;
  subtext: LocalizedString;
}

export interface CityNeighborhood {
  name: LocalizedString;
  description: LocalizedString;
  distance: LocalizedString;
}

export interface CityProject {
  name: LocalizedString;
  description: LocalizedString;
}

export interface CityTestimonial {
  quote: LocalizedString;
  author: string;
  role: LocalizedString;
  company: string;
}

export interface CityFAQ {
  question: LocalizedString;
  answer: LocalizedString;
}

export interface City {
  slug: string;
  name: string;
  region: string;
  population: string;
  description: string;
  highlights: string[];
  industries: string[];
  coordinates: [number, number];
  heroHook: LocalizedString;
  intro: LocalizedString;
  keywords: LocalizedKeywords;
  metrics: CityMetric[];
  neighborhoods: CityNeighborhood[];
  projects: CityProject[];
  testimonial: CityTestimonial;
  faq: CityFAQ[];
  nearby: string[];
}

export const cities: City[] = [
  {
    slug: 'stockholm',
    name: 'Stockholm',
    region: 'Stockholms län',
    population: '975 000',
    description: 'Sveriges huvudstad och största stad med omfattande byggnation och infrastrukturprojekt.',
    highlights: [
      'Stora infrastrukturprojekt som Nya Slussen',
      'Omfattande bostadsbyggnation',
      'Tunnelbanebyggnation',
      'Kontorsbyggnation i cityområden'
    ],
    industries: ['Bygg & Anläggning', 'Infrastruktur', 'Bostäder', 'Kommersiellt'],
    coordinates: [59.3293, 18.0686],
    heroHook: ls(
      'Lägenhetshotell & Personalboende i Stockholm – nära Slussen och tunnelbanan',
      'Aparthotel & Worker Accommodation in Stockholm – Near Slussen & the Metro',
      'Aparthotel & Noclegi Pracownicze w Sztokholmie – Blisko Slussen i Metra'
    ),
    intro: ls(
      'Slussen, tunnelbaneutbyggnaden och datacenter runt Stockholm kräver bemanning som kan ändras varje vecka. Våra lägenhetshotell och företagslägenheter ligger nära arbetsplatsen — komplett boendeplan inom 24 timmar.',
      'Projects like Slussen, the metro extension and new data centers change staffing needs weekly. Our aparthotels and corporate apartments sit close to the worksite — full housing plan within 24 hours.',
      'Budowy takie jak Slussen, rozbudowa metra czy centra danych wymagają elastycznych ekip. Nasze aparthotele i mieszkania firmowe znajdują się blisko inwestycji — pełny plan zakwaterowania w 24 godziny.'
    ),
    keywords: lk(
      ['personalboende stockholm', 'företagslägenheter stockholm', 'byggboende stockholm', 'boende byggarbetare stockholm', 'montörboende stockholm', 'tillfälligt boende företag stockholm', 'boende stockholm', 'lägenhetshotell stockholm'],
      ['corporate housing stockholm', 'staff apartments stockholm', 'construction housing stockholm', 'worker accommodation stockholm sweden', 'temporary housing stockholm', 'construction crew accommodation stockholm'],
      ['zakwaterowanie pracownicze sztokholm', 'mieszkania firmowe sztokholm', 'noclegi dla ekip sztokholm', 'noclegi dla budowlańców sztokholm szwecja', 'kwatery pracownicze sztokholm', 'tymczasowe zakwaterowanie sztokholm szwecja']
    ),
    metrics: [
      {
        value: '120+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Kungsholmen, Hammarby Sjöstad, Solna', 'Kungsholmen, Hammarby Sjöstad, Solna', 'Kungsholmen, Hammarby Sjöstad, Solna')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '12',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Slussen, tunnelbanan, datacenter', 'Slussen, metro, data centers', 'Slussen, metro, centra danych')
      }
    ],
    neighborhoods: [
      {
        name: ls('Hammarby Sjöstad', 'Hammarby Sjöstad', 'Hammarby Sjöstad'),
        description: ls('Perfekt för lag som bygger Slussen, Sickla och Nacka tunnelbana.', 'Perfect for crews working on Slussen, Sickla and the Nacka metro line.', 'Idealne dla ekip pracujących przy Slussen, Sickli i linii metra do Nacka.'),
        distance: ls('12 min bil till Slussen', '12 min drive to Slussen', '12 min samochodem do Slussen')
      },
      {
        name: ls('Solna & Sundbyberg', 'Solna & Sundbyberg', 'Solna i Sundbyberg'),
        description: ls('Närhet till Arenastaden, kontor och datacenter i norra Stockholm.', 'Close to Arenastaden, offices and data centers in northern Stockholm.', 'Blisko Arenastaden, biur i centrów danych na północy Sztokholmu.'),
        distance: ls('8 min till E4/E18', '8 min to E4/E18', '8 min do E4/E18')
      },
      {
        name: ls('Älvsjö & Årsta', 'Älvsjö & Årsta', 'Älvsjö i Årsta'),
        description: ls('Goda pendlarlägen för södra projekten och Stockholmsmässan.', 'Great commuter spots for southern projects and the exhibition center.', 'Dogodne lokalizacje dla projektów na południu i targów Stockholmsmässan.'),
        distance: ls('10 min till Södermalm', '10 min to Södermalm', '10 min do Södermalm')
      }
    ],
    projects: [
      {
        name: ls('Nya Slussen', 'New Slussen', 'Nowe Slussen'),
        description: ls('Vi roterar montörer i boenden runt Södermalm för nattpass.', 'We rotate crews through apartments around Södermalm for night shifts.', 'Rotujemy zespoły w mieszkaniach na Södermalmie na nocne zmiany.')
      },
      {
        name: ls('Tunnelbaneutbyggnaden', 'Metro extension', 'Rozbudowa metra'),
        description: ls('Boendekluster nära Hagastaden och Nacka för spränglag.', 'Housing clusters near Hagastaden and Nacka for tunnel teams.', 'Klastry mieszkaniowe przy Hagastaden i Nacka dla ekip tunelowych.')
      },
      {
        name: ls('Norra Djurgårdsstaden', 'Norra Djurgårdsstaden', 'Norra Djurgårdsstaden'),
        description: ls('Långtidsuthyrningar till fasad- och installationsbolag.', 'Long-term rentals for façade and installation contractors.', 'Długoterminowe wynajmy dla firm fasadowych i instalacyjnych.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 18 montörer nära Frihamnen och StayOnSite löste tre lägenheter i samma hus på två dygn.',
        'We needed housing for 18 fitters near Frihamnen and StayOnSite secured three apartments in the same building within two days.',
        'Potrzebowaliśmy noclegów dla 18 monterów przy Frihamnen i StayOnSite załatwiło trzy mieszkania w tym samym budynku w dwa dni.'
      ),
      author: 'Mikael J.',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Kan ni ordna parkering för servicebilar?', 'Can you arrange parking for service vans?', 'Czy możecie zorganizować parking dla aut serwisowych?'),
        answer: ls('Ja, flera av våra fastigheter i Solna, Årsta och Barkarby har reserverade platser. Ange behovet i briefen så inkluderar vi det i offerten.', 'Yes, our properties in Solna, Årsta and Barkarby have reserved spots. Mention the need in your brief and we include it in the proposal.', 'Tak, w Solnie, Årście i Barkarby mamy zarezerwowane miejsca. Wpiszcie to w briefie, a dodamy do oferty.')
      },
      {
        question: ls('Hur nära city kan ni placera större lag?', 'How close to downtown can you place larger crews?', 'Jak blisko centrum możecie ulokować większe ekipy?'),
        answer: ls('För team över 10 personer ordnar vi samlat boende i Hammarby Sjöstad, Liljeholmen och Solna – flera lägenheter i samma byggnad så teamet bor nära varandra.', 'For teams above 10 people we arrange clustered housing in Hammarby Sjöstad, Liljeholmen and Solna – multiple apartments in the same building so the team stays close together.', 'Dla ekip powyżej 10 osób organizujemy mieszkania w jednym budynku w Hammarby Sjöstad, Liljeholmen i Solna, tak by zespół mieszkał blisko siebie.')
      },
      {
        question: ls('Tar ni hand om städning mellan passen?', 'Do you handle cleaning between shifts?', 'Czy zajmujecie się sprzątaniem między zmianami?'),
        answer: ls('Ja, slutstädning och regelbunden genomgång ingår i våra Stockholmsboenden.', 'Yes, final cleaning and regular inspections are included in our Stockholm housing.', 'Tak, sprzątanie końcowe i regularne przeglądy są wliczone w nasze noclegi w Sztokholmie.')
      }
    ],
    nearby: ['uppsala', 'vasteras']
  },
  {
    slug: 'goteborg',
    name: 'Göteborg',
    region: 'Västra Götalands län',
    population: '580 000',
    description: 'Sveriges andra största stad med stor hamn och aktiv byggsektor.',
    highlights: ['Stora hamnprojekt', 'Spårvagnsutbyggnad', 'Bostadsområden som Backaplan', 'Industribyggnation'],
    industries: ['Hamn & Logistik', 'Industri', 'Bostäder', 'Transport'],
    coordinates: [57.7089, 11.9746],
    heroHook: ls('Lägenhetshotell & Personalboende i Göteborg – nära hamnen och Hisingen', 'Aparthotel & Worker Accommodation in Gothenburg – Near the Harbour & Hisingen', 'Aparthotel & Noclegi Pracownicze w Göteborgu – Blisko Portu i Hisingen'),
    intro: ls('Från Hisingsbron till varvsrenoveringar behövs korttidsboende med kort restid och enkel parkering. Vi har lägenhetshotell och hus på Hisingen, Majorna och Mölndal där hela lag kan dela kök och jobba skift dygnet runt.', 'From Hisingsbron to yard renovations you need short-term housing with easy access and parking. Our aparthotels and houses on Hisingen, Majorna and Mölndal let whole crews share kitchens and run shifts 24/7.', 'Od mostu Hisingsbron po remonty stoczni potrzeba krótkoterminowych noclegów z dojazdem i parkingiem. Nasze aparthotele i domy na Hisingen, w Majornie i Mölndal pozwalają ekipom dzielić kuchnie i pracować na zmiany.'),
    keywords: lk(
      ['personalboende göteborg', 'företagsboende göteborg', 'byggboende hisingen', 'boende byggarbetare göteborg', 'montörboende göteborg', 'tillfälligt boende företag göteborg', 'lägenhetshotell göteborg', 'korttidsboende göteborg'],
      ['staff housing gothenburg', 'corporate housing gothenburg', 'construction housing hisingen', 'worker accommodation gothenburg sweden', 'temporary housing gothenburg', 'construction crew accommodation gothenburg'],
      ['zakwaterowanie pracownicze göteborg', 'noclegi firmowe göteborg', 'mieszkania hisingen', 'noclegi dla budowlańców göteborg szwecja', 'kwatery pracownicze göteborg', 'tymczasowe zakwaterowanie göteborg szwecja']
    ),
    metrics: [
      {
        value: '85',
        label: ls('platser nära hamnen', 'beds near the harbour', 'miejsc blisko portu'),
        subtext: ls('Frihamnen, Lindholmen, Arendal', 'Frihamnen, Lindholmen, Arendal', 'Frihamnen, Lindholmen, Arendal')
      },
      {
        value: '48 h',
        label: ls('inflyttningsklart', 'move-in ready', 'gotowe do zamieszkania'),
        subtext: ls('Full packning och slutstädning', 'Fully furnished with cleaning included', 'Pełne wyposażenie i sprzątanie')
      },
      {
        value: '6',
        label: ls('aktiva industriprojekt', 'active industrial projects', 'aktywne projekty przemysłowe'),
        subtext: ls('Volvo Cars, Västlänken, Frihamnen', 'Volvo Cars, West Link, Frihamnen', 'Volvo Cars, Västlänken, Frihamnen')
      }
    ],
    neighborhoods: [
      {
        name: ls('Lindholmen & Lundby', 'Lindholmen & Lundby', 'Lindholmen i Lundby'),
        description: ls('För team vid varv, Västlänken och teknikcampus.', 'For crews near the shipyards, West Link and the tech campus.', 'Dla ekip przy stoczni, projekcie Västlänken i kampusie technologicznym.'),
        distance: ls('5 min färja till centralen', '5 min ferry to downtown', '5 min promem do centrum')
      },
      {
        name: ls('Majorna & Kungsladugård', 'Majorna & Kungsladugård', 'Majorna i Kungsladugård'),
        description: ls('Lugnare gator med närhet till hamnarbeten.', 'Calmer streets still close to harbour works.', 'Spokojne ulice blisko robót portowych.'),
        distance: ls('8 min till Stena-terminalen', '8 min to the Stena terminal', '8 min do terminalu Stena')
      },
      {
        name: ls('Mölndal', 'Mölndal', 'Mölndal'),
        description: ls('Bra bas för maskinlag när produktion sker söderut.', 'Great base for machinery crews when production is south of town.', 'Świetna baza dla ekip maszynowych przy projektach na południu miasta.'),
        distance: ls('12 min till Korsvägen', '12 min to Korsvägen', '12 min do Korsvägen')
      }
    ],
    projects: [
      {
        name: ls('Västlänken', 'West Link', 'Västlänken'),
        description: ls('Blockuthyrningar för nattarbete i stationstunnlarna.', 'Block rentals for night work in the new station tunnels.', 'Blokowe wynajmy na nocne prace w tunelach stacji.')
      },
      {
        name: ls('Backaplan', 'Backaplan', 'Backaplan'),
        description: ls('Personalboenden till stom- och installationsentreprenörer.', 'Housing for frame and installation contractors.', 'Zakwaterowanie dla wykonawców konstrukcji i instalacji.')
      },
      {
        name: ls('Volvo & batterifabrik', 'Volvo & battery plant', 'Volvo i fabryka baterii'),
        description: ls('Långtidskontrakt för montörer med behov av parkering.', 'Long-term contracts for installers needing van parking.', 'Długie kontrakty dla monterów z potrzebą parkowania busów.')
      }
    ],
    testimonial: {
      quote: ls('Vi kunde flytta in 14 elektriker på Hisingen två dagar efter beställning – allt var möblerat och klart.', 'We moved 14 electricians onto Hisingen two days after ordering – everything was furnished and ready.', 'Wprowadziliśmy 14 elektryków na Hisingen dwa dni po zamówieniu – wszystko było umeblowane i gotowe.'),
      author: 'Helena S.',
      role: ls('Site Manager', 'Site Manager', 'Kierownik budowy'),
      company: 'Industri & Teknik'
    },
    faq: [
      {
        question: ls('Hur löser ni parkering för skåpbilar?', 'How do you arrange parking for vans?', 'Jak zapewniacie parking dla busów?'),
        answer: ls('Husen på Hisingen och i Sisjön har egna platser. I city löser vi garage via fastighetsägaren.', 'Properties on Hisingen and in Sisjön have dedicated spots. Downtown we arrange garage spaces with landlords.', 'Na Hisingen i w Sisjön mamy własne miejsca. W centrum organizujemy garaże z właścicielami budynków.')
      },
      {
        question: ls('Kan teamen dela rum?', 'Can teams share rooms?', 'Czy ekipy mogą dzielić pokoje?'),
        answer: ls('Ja, vi sätter ihop kombinationer av enkel- och dubbelrum baserat på ert schema.', 'Yes, we mix single and twin rooms according to your roster.', 'Tak, łączymy pokoje jedno- i dwuosobowe zgodnie z Waszym grafikiem.')
      },
      {
        question: ls('Har ni boende nära varvet kvällstid?', 'Do you keep housing near the shipyards for night shifts?', 'Czy macie noclegi blisko stoczni na nocne zmiany?'),
        answer: ls('Ja, vi har fullt utrustade lägenheter i Lundby och Sannegården med gångavstånd till varven.', 'Yes, we run fully equipped apartments in Lundby and Sannegården within walking distance of the yards.', 'Tak, mamy w pełni wyposażone mieszkania w Lundby i Sannegården, kilka minut pieszo od stoczni.')
      }
    ],
    nearby: ['jonkoping', 'helsingborg']
  },
  {
    slug: 'malmo',
    name: 'Malmö',
    region: 'Skåne län',
    population: '350 000',
    description: 'Snabbväxande stad med många byggprojekt och närhet till Köpenhamn.',
    highlights: ['Västra Hamnen-projektet', 'Citytunnel-underhåll', 'Moderna bostadsområden', 'Öresundsbron-relaterade projekt'],
    industries: ['Bostäder', 'Infrastruktur', 'Kommersiellt', 'Transport'],
    coordinates: [55.605, 13.0038],
    heroHook: ls('Lägenhetshotell & Personalboende i Malmö – nära Hyllie och Öresund', 'Aparthotel & Worker Accommodation in Malmö – Near Hyllie & Öresund', 'Aparthotel & Noclegi Pracownicze w Malmö – Blisko Hyllie i Öresund'),
    intro: ls('När projekten rullar i Hyllie, Västra Hamnen eller utefter E6:an behöver ni flexibla korttidsboenden. Våra lägenhetshotell i Limhamn, Fosie och centrala Malmö har komplett köksutrustning, veckostäd och tvättlösningar.', 'When projects run in Hyllie, Västra Hamnen or along the E6 you need flexible short-term housing. Our aparthotels in Limhamn, Fosie and central Malmö come with full kitchens, weekly cleaning and laundry.', 'Gdy projekty toczą się w Hyllie, Västra Hamnen lub wzdłuż E6, potrzebujecie elastycznych noclegów krótkoterminowych. Nasze aparthotele w Limhamn, Fosie i centrum Malmö mają pełne kuchnie, cotygodniowe sprzątanie i pranie.'),
    keywords: lk(
      ['personalboende malmö', 'företagsboende malmö', 'relocation malmö bygg', 'boende byggarbetare malmö', 'montörboende malmö', 'tillfälligt boende företag malmö', 'boende malmö', 'lägenhetshotell malmö', 'korttidsboende malmö'],
      ['staff housing malmo', 'corporate apartments malmo', 'relocation malmo construction', 'worker accommodation malmo sweden', 'temporary housing malmo', 'construction crew accommodation malmo'],
      ['zakwaterowanie pracownicze malmo', 'mieszkania firmowe malmo', 'relokacja budowlana malmo', 'noclegi dla budowlańców malmö szwecja', 'kwatery pracownicze malmö', 'tymczasowe zakwaterowanie malmö szwecja']
    ),
    metrics: [
      {
        value: '60+',
        label: ls('platser i Västra Hamnen', 'spaces in Västra Hamnen', 'miejsc we Västra Hamnen'),
        subtext: ls('Nära E.ON HQ och bostadsbyggen', 'Close to E.ON HQ and high-rise sites', 'Blisko siedziby E.ON i budów mieszkaniowych')
      },
      {
        value: '90 min',
        label: ls('till Köpenhamn', 'to Copenhagen', 'do Kopenhagi'),
        subtext: ls('Nära Öresundsbron', 'Close to the Öresund Bridge', 'Blisko mostu Öresund')
      },
      {
        value: '8',
        label: ls('pågående logistikkunder', 'active logistics clients', 'aktywni klienci logistyczni'),
        subtext: ls('Terminaler i Fosie och Svågertorp', 'Terminals in Fosie and Svågertorp', 'Terminale w Fosie i Svågertorp')
      }
    ],
    neighborhoods: [
      {
        name: ls('Västra Hamnen', 'Västra Hamnen', 'Västra Hamnen'),
        description: ls('Perfekt för höghus- och fasadprojekt med havsnära lägen.', 'Perfect for high-rise and façade work with waterfront apartments.', 'Idealne dla wysokich budów i fasad z mieszkaniami nad wodą.'),
        distance: ls('5 min cykel till Turning Torso', '5 min by bike to Turning Torso', '5 min rowerem do Turning Torso')
      },
      {
        name: ls('Hyllie & Limhamn', 'Hyllie & Limhamn', 'Hyllie i Limhamn'),
        description: ls('Snabb access till E20 och Öresundsbron.', 'Quick access to the E20 and Öresund Bridge.', 'Szybki dostęp do E20 i mostu nad Sundem.'),
        distance: ls('7 min till Hyllie station', '7 min to Hyllie station', '7 min do stacji Hyllie')
      },
      {
        name: ls('Fosie & Jägersro', 'Fosie & Jägersro', 'Fosie i Jägersro'),
        description: ls('Industriområden med plats för servicebilar och verkstad.', 'Industrial areas with space for vans and workshop gear.', 'Strefy przemysłowe z miejscem na auta serwisowe i warsztat.'),
        distance: ls('10 min till city', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Kastrup/CPH expansion', 'Kastrup/CPH expansion', 'Rozbudowa Kastrup/CPH'),
        description: ls('Pendlande team bor i Limhamn med snabba broförbindelser.', 'Commuting crews stay in Limhamn with fast bridge access.', 'Dojeżdżające ekipy mieszkają w Limhamn z szybkim dojazdem przez most.')
      },
      {
        name: ls('E.ON huvudkontor', 'E.ON headquarters', 'Siedziba E.ON'),
        description: ls('Långtidsboenden åt installationslag i Västra Hamnen.', 'Long-term stays for installation teams in Västra Hamnen.', 'Długie pobyty dla ekip instalacyjnych we Västra Hamnen.')
      },
      {
        name: ls('Logistikcentrum Fosie', 'Fosie logistics hub', 'Centrum logistyczne Fosie'),
        description: ls('Hus med stora uppställningsytor för truckservice.', 'Houses with large yards for truck servicing.', 'Domy z dużymi placami na serwis wózków i ciężarówek.')
      }
    ],
    testimonial: {
      quote: ls('StayOnSite lyckades samla vårt danska montagegäng i samma område så att pendlingen över bron blev enkel.', 'StayOnSite gathered our Danish crew in one district so the bridge commute stayed simple.', 'StayOnSite ulokowało naszą duńską ekipę w jednej dzielnicy, więc dojazdy przez most były łatwe.'),
      author: 'Peter M.',
      role: ls('Operations Manager', 'Operations Manager', 'Dyrektor operacyjny'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Kan ni ordna boende på båda sidor av bron?', 'Can you arrange housing on both sides of the bridge?', 'Czy możecie zorganizować noclegi po obu stronach mostu?'),
        answer: ls('Ja, vi mixar Malmö och Köpenhamn vid behov och synkar kontrakt så alla flyttar samtidigt.', 'Yes, we mix Malmö and Copenhagen when needed and sync contracts so teams move simultaneously.', 'Tak, łączymy Malmö i Kopenhagę, synchronizując umowy, aby zespoły przenosiły się w tym samym czasie.')
      },
      {
        question: ls('Ingår städ och tvätt?', 'Is cleaning and laundry included?', 'Czy sprzątanie i pranie są w cenie?'),
        answer: ls('Veckostäd och textilservice ingår eftersom teamen ofta arbetar skift.', 'Weekly cleaning and linen service are included because teams work shifts.', 'Cotygodniowe sprzątanie i serwis pościeli są w pakiecie, bo zespoły pracują zmianowo.')
      },
      {
        question: ls('Hur funkar pendling till Danmark?', 'How do you handle commuting to Denmark?', 'Jak wygląda dojazd do Danii?'),
        answer: ls('Vi placerar boenden nära Hyllie station så teamet snabbt tar sig över Öresundsbron till projekt i Köpenhamn.', 'We place housing near Hyllie station so the team quickly reaches projects in Copenhagen via the Öresund Bridge.', 'Lokujemy noclegi blisko stacji Hyllie, by zespół szybko dotarł do projektów w Kopenhadze przez most Öresund.')
      }
    ],
    nearby: ['helsingborg', 'norrkoping']
  },
  {
    slug: 'uppsala',
    name: 'Uppsala',
    region: 'Uppsala län',
    population: '230 000',
    description: 'Universitetsstad med stark tillväxt och många byggprojekt.',
    highlights: ['Universitetsbyggnader', 'Nya bostadsområden', 'Forskningsanläggningar', 'Infrastrukturprojekt'],
    industries: ['Utbildning', 'Forskning', 'Bostäder', 'Offentlig sektor'],
    coordinates: [59.8586, 17.6389],
    heroHook: ls('Lägenhetshotell & Personalboende i Uppsala – nära sjukhuset och campus', 'Aparthotel & Worker Accommodation in Uppsala – Near the Hospital & Campus', 'Aparthotel & Noclegi Pracownicze w Uppsali – Blisko Szpitala i Kampusu'),
    intro: ls('Akademiska sjukhuset, nya campusytor och bostadsexpansion kräver boenden där installatörer kan dela vardag. Våra lägenhetshotell och kedjehus i Gränby, Rosendal och Bäcklösa ger kort restid till både city och industriområden.', 'The university hospital, new campuses and housing expansion need accommodation where installers can live comfortably. Our aparthotels and townhouses in Gränby, Rosendal and Bäcklösa offer short travel to both city and industrial zones.', 'Szpital uniwersytecki, nowe kampusy i rozbudowa mieszkaniowa wymagają zakwaterowania, w którym monterzy mogą normalnie żyć. Nasze aparthotele i segmenty w Gränby, Rosendalu i Bäcklöse zapewniają krótki dojazd do centrum i stref przemysłowych.'),
    keywords: lk(
      ['personalboende uppsala', 'företagslägenheter uppsala', 'byggboende life science', 'boende byggarbetare uppsala', 'montörboende uppsala', 'tillfälligt boende företag uppsala', 'lägenhetshotell uppsala', 'boende uppsala'],
      ['staff housing uppsala', 'corporate apartments uppsala', 'life science housing uppsala', 'worker accommodation uppsala sweden', 'temporary housing uppsala', 'construction crew accommodation uppsala'],
      ['zakwaterowanie pracownicze uppsala', 'mieszkania firmowe uppsala', 'noclegi life science uppsala', 'noclegi dla budowlańców uppsala szwecja', 'kwatery pracownicze uppsala', 'tymczasowe zakwaterowanie uppsala szwecja']
    ),
    metrics: [
      {
        value: '45',
        label: ls('platser nära Akademiska', 'beds near the university hospital', 'miejsc blisko szpitala uniwersyteckiego'),
        subtext: ls('Rosendal, Flogsta, Kåbo', 'Rosendal, Flogsta, Kåbo', 'Rosendal, Flogsta, Kåbo')
      },
      {
        value: '15 min',
        label: ls('till Arlanda', 'to Arlanda', 'do Arlandy'),
        subtext: ls('Perfekt för veckopendling', 'Great for weekly commuters', 'Idealne dla dojeżdżających co tydzień')
      },
      {
        value: '5',
        label: ls('life science-projekt', 'life science projects', 'projekty life science'),
        subtext: ls('GE, Cytiva, testlabb', 'GE, Cytiva, test labs', 'GE, Cytiva, laboratoria testowe')
      }
    ],
    neighborhoods: [
      {
        name: ls('Rosendal', 'Rosendal', 'Rosendal'),
        description: ls('Nybyggen nära Akademiska och SLU.', 'New developments close to the hospital and SLU.', 'Nowe osiedla blisko szpitala i SLU.'),
        distance: ls('8 min cykel till campus', '8 min by bike to campus', '8 min rowerem na kampus')
      },
      {
        name: ls('Gränby', 'Gränby', 'Gränby'),
        description: ls('Bra för logistiklag med behov av parkering.', 'Good for logistics teams needing parking.', 'Dobre dla ekip logistycznych z potrzebą parkowania.'),
        distance: ls('6 min till E4', '6 min to the E4', '6 min do E4')
      },
      {
        name: ls('Bäcklösa & Gottsunda', 'Bäcklösa & Gottsunda', 'Bäcklösa i Gottsunda'),
        description: ls('Större hus där team kan dela kök och vardagsrum.', 'Larger houses where crews share kitchens and lounges.', 'Większe domy, w których ekipy dzielą kuchnię i salon.'),
        distance: ls('12 min till city', '12 min to downtown', '12 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Cytiva expansion', 'Cytiva expansion', 'Rozbudowa Cytiva'),
        description: ls('Blockhyrningar för renrums- och ventilationsspecialister.', 'Block rentals for cleanroom and ventilation specialists.', 'Blokowe wynajmy dla specjalistów czystych pomieszczeń i wentylacji.')
      },
      {
        name: ls('Rosendalsfältet', 'Rosendalsfältet', 'Rosendalsfältet'),
        description: ls('Boenden åt stom- och markentreprenörer i området.', 'Housing for structural and groundwork contractors in the area.', 'Zakwaterowanie dla wykonawców konstrukcji i robót ziemnych w okolicy.')
      },
      {
        name: ls('Ostkustbanan', 'East Coast Line', 'Linia Ostkustbanan'),
        description: ls('Crew housing för nattarbete vid spårbyte.', 'Crew housing for night rail replacement.', 'Zakwaterowanie ekip na nocne wymiany torów.')
      }
    ],
    testimonial: {
      quote: ls('Vi fick en hel kedja radhus i Rosendal där projektledningen kunde bo vägg i vägg – sparade oss enormt med tid.', 'We received a whole row of townhouses in Rosendal so management could live door to door – it saved huge amounts of time.', 'Dostaliśmy cały szereg segmentów w Rosendalu, więc kierownictwo mieszkało drzwi w drzwi – oszczędziło nam to mnóstwo czasu.'),
      author: 'Anna T.',
      role: ls('Construction Manager', 'Construction Manager', 'Kierownik budowy'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Kan ni hantera arbetstillstånd hos Akademiska?', 'Can you handle site permits at the hospital?', 'Czy możecie zająć się przepustkami do szpitala?'),
        answer: ls('Ja, vi anpassar boendet efter era krav och placerar teamet nära Akademiska sjukhuset.', 'Yes, we adapt the housing to your requirements and place the team near the Academic Hospital.', 'Tak, dostosowujemy noclegi do Waszych wymagań i lokujemy zespół blisko szpitala Akademiska.')
      },
      {
        question: ls('Hur långt i förväg måste vi boka?', 'How far in advance must we book?', 'Z jakim wyprzedzeniem musimy rezerwować?'),
        answer: ls('Med 5–7 dagars framförhållning kan vi ordna boende för större team. Vid akuta behov hjälper vi till så snabbt som möjligt.', 'With 5–7 days notice we can arrange housing for larger teams. For urgent needs we help as quickly as possible.', 'Przy wyprzedzeniu 5–7 dni organizujemy noclegi dla większych zespołów. W nagłych przypadkach pomagamy tak szybko, jak to możliwe.')
      },
      {
        question: ls('Får vi flexibla kontrakt vid schemaändring?', 'Do we get flexible contracts if the schedule shifts?', 'Czy kontrakty są elastyczne przy zmianach harmonogramu?'),
        answer: ls('Ja, kontrakten i Uppsala har 30 dagars flexibilitet så ni kan justera bemanning.', 'Yes, Uppsala agreements carry 30-day flexibility so you can adjust staffing.', 'Tak, umowy w Uppsali mają 30-dniową elastyczność, abyście mogli zmieniać obsadę.')
      }
    ],
    nearby: ['stockholm', 'vasteras']
  },
  {
    slug: 'vasteras',
    name: 'Västerås',
    region: 'Västmanlands län',
    population: '155 000',
    description: 'Industristad med stora energiprojekt och byggverksamhet.',
    highlights: ['Kraftverksbyggnation', 'Industrianläggningar', 'Bostadsprojekt', 'Energiinfrastruktur'],
    industries: ['Energi', 'Industri', 'Bygg & Anläggning', 'Bostäder'],
    coordinates: [59.6162, 16.5528],
    heroHook: ls('Lägenhetshotell & Korttidsboende i Västerås – nära Mälarenergi och E18', 'Aparthotel & Short-Term Housing in Västerås – Near Mälarenergi & E18', 'Aparthotel & Noclegi Krótkoterminowe w Västerås – Blisko Mälarenergi i E18'),
    intro: ls('Västerås projekten drivs av batterifabriker, kraftverk och logistik. Våra lägenhetshotell och korttidsboenden i Tunbytorp, Gideonsberg och Köpingstrakten ger snabb åtkomst till E18 och hamnen. Alltid möblerat, alltid slutstädat.', 'Local projects run on battery plants, power stations and logistics hubs. Our aparthotels and short-term housing in Tunbytorp, Gideonsberg and Köping offer fast access to the E18 and harbour. Always furnished and cleaned.', 'Projekty w Västerås to fabryki baterii, elektrownie i logistyczne huby. Nasze aparthotele i noclegi krótkoterminowe w Tunbytorp, Gideonsbergu i Köping zapewniają szybki dojazd do E18 i portu. Zawsze umeblowane, zawsze wysprzątane.'),
    keywords: lk(
      ['personalboende västerås', 'företagsboende mälarenergi', 'byggboende batterifabrik', 'boende byggarbetare västerås', 'montörboende västerås', 'tillfälligt boende företag västerås', 'korttidsboende västerås', 'lägenhetshotell västerås'],
      ['staff housing vasteras', 'corporate housing malarenergi', 'battery plant housing sweden', 'worker accommodation vasteras sweden', 'temporary housing vasteras', 'construction crew accommodation vasteras'],
      ['zakwaterowanie pracownicze vasteras', 'mieszkania firmowe malarenergi', 'noclegi fabryka baterii', 'noclegi dla budowlańców västerås szwecja', 'kwatery pracownicze västerås', 'tymczasowe zakwaterowanie västerås szwecja']
    ),
    metrics: [
      {
        value: '35',
        label: ls('platser nära Mälarenergi', 'beds near Mälarenergi', 'miejsc blisko Mälarenergi'),
        subtext: ls('Promenadavstånd till verket', 'Walking distance to the plant', 'Spacer do zakładu')
      },
      {
        value: '3',
        label: ls('hamnnära hus', 'harbour-side houses', 'domy przy porcie'),
        subtext: ls('För logistikprojekt mot Mälardalen', 'For logistics projects across Mälaren', 'Dla projektów logistycznych w regionie Mälaren')
      },
      {
        value: '20 min',
        label: ls('till Köping & Surahammar', 'to Köping & Surahammar', 'do Köping i Surahammar'),
        subtext: ls('Lätt att rotera lag', 'Easy to rotate crews', 'Łatwa rotacja ekip')
      }
    ],
    neighborhoods: [
      {
        name: ls('Tunbytorp', 'Tunbytorp', 'Tunbytorp'),
        description: ls('Industriområde med gott om parkering.', 'Industrial area with plenty of parking.', 'Strefa przemysłowa z dużą liczbą miejsc parkingowych.'),
        distance: ls('6 min till Mälarenergi', '6 min to Mälarenergi', '6 min do Mälarenergi')
      },
      {
        name: ls('Gideonsberg', 'Gideonsberg', 'Gideonsberg'),
        description: ls('Centralt men lugnt, bra för långa uppdrag.', 'Central yet calm, ideal for long assignments.', 'Centralnie, ale spokojnie – dobre na dłuższe kontrakty.'),
        distance: ls('10 min till city', '10 min to downtown', '10 min do centrum')
      },
      {
        name: ls('Köping & Hallstahammar', 'Köping & Hallstahammar', 'Köping i Hallstahammar'),
        description: ls('Hus med stora tomter för maskinlag.', 'Houses with large lots for machinery crews.', 'Domy z dużymi działkami dla ekip maszynowych.'),
        distance: ls('20 min till Västerås', '20 min to Västerås', '20 min do Västerås')
      }
    ],
    projects: [
      {
        name: ls('ABB/Hitachi Energy', 'ABB/Hitachi Energy', 'ABB/Hitachi Energy'),
        description: ls('Boendekluster för automationstekniker och montörer.', 'Housing clusters for automation technicians and installers.', 'Klastry mieszkaniowe dla automatyków i monterów.')
      },
      {
        name: ls('Mälarenergi', 'Mälarenergi', 'Mälarenergi'),
        description: ls('Personalbostäder för turbinspecialister i skift.', 'Crew housing for turbine specialists on shifts.', 'Zakwaterowanie dla specjalistów turbin pracujących na zmiany.')
      },
      {
        name: ls('Logistikpark Hacksta', 'Hacksta logistics park', 'Park logistyczny Hacksta'),
        description: ls('Team får bo nära terminalerna för nattpass.', 'Crews stay next to the terminals for night shifts.', 'Ekipy mieszkają przy terminalach na nocne zmiany.')
      }
    ],
    testimonial: {
      quote: ls('När vi stärkte bemanningen för batterilinan fick vi tre villor i Tunbytorp – samma dag som ordern kom.', 'When we ramped the battery line, we got three villas in Tunbytorp the same day we ordered them.', 'Gdy zwiększaliśmy obsadę linii baterii, tego samego dnia otrzymaliśmy trzy wille w Tunbytorp.'),
      author: 'Joakim E.',
      role: ls('Site Lead', 'Site Lead', 'Kierownik obiektu'),
      company: 'Energi & Industri'
    },
    faq: [
      {
        question: ls('Kan ni lösa boende i Köping också?', 'Can you also arrange housing in Köping?', 'Czy możecie zapewnić noclegi także w Köping?'),
        answer: ls('Ja, vi kombinerar Västerås och Köping för projekt som spänner över båda städerna.', 'Yes, we combine Västerås and Köping for projects covering both cities.', 'Tak, łączymy Västerås i Köping dla projektów obejmujących oba miasta.')
      },
      {
        question: ls('Hur funkar städ och besiktning?', 'How do cleaning and inspections work?', 'Jak działa sprzątanie i odbiory?'),
        answer: ls('Vår partner gör veckostäd och rapporterar brister direkt till er kontakt.', 'Our partner performs weekly cleaning and reports issues straight to your contact.', 'Nasz partner wykonuje cotygodniowe sprzątanie i zgłasza usterki bezpośrednio do Was.')
      },
      {
        question: ls('Klarar ni korta stopp mellan skift?', 'Can you handle short breaks between shifts?', 'Czy poradzicie sobie z krótkimi przerwami między zmianami?'),
        answer: ls('Ja, vi har dubbelsängar och egna badrum så team kan vila även under täta rotationsschema.', 'Yes, we provide twin beds and private bathrooms so crews rest even on tight rotations.', 'Tak, zapewniamy łóżka podwójne i prywatne łazienki, aby ekipy mogły odpocząć przy ciasnych rotacjach.')
      }
    ],
    nearby: ['stockholm', 'orebro']
  },
  {
    slug: 'orebro',
    name: 'Örebro',
    region: 'Örebro län',
    population: '155 000',
    description: 'Strategiskt belägen stad med växande byggsektor.',
    highlights: ['Universitetsexpansion', 'Sjukhusbyggnation', 'Centrala bostadsprojekt', 'Logistikanläggningar'],
    industries: ['Utbildning', 'Vård', 'Logistik', 'Bostäder'],
    coordinates: [59.2741, 15.2066],
    heroHook: ls('Lägenhetshotell & Personalboende i Örebro – vid logistiknavet E18/E20', 'Aparthotel & Worker Accommodation in Örebro – At the E18/E20 Logistics Hub', 'Aparthotel & Noclegi Pracownicze w Örebro – Przy Węźle Logistycznym E18/E20'),
    intro: ls('Universitetet, nya logistikparker och sjukhusutbyggnaden kräver flexibla boenden. Våra lägenhetshotell och radhus i Bettorp, Adolfsberg och Marieberg ger lag egna sovrum men delade gemensamma ytor.', 'The university, logistics parks and hospital expansion demand flexible housing. Our aparthotels and townhouses in Bettorp, Adolfsberg and Marieberg give crews private bedrooms with shared common areas.', 'Uniwersytet, parki logistyczne i rozbudowa szpitala wymagają elastycznych noclegów. Nasze aparthotele i segmenty w Bettorp, Adolfsbergu i Mariebergu zapewniają ekipom własne sypialnie i wspólne przestrzenie.'),
    keywords: lk(
      ['personalboende örebro', 'företagsboende logistik', 'byggboende universitet örebro', 'boende byggarbetare örebro', 'montörboende örebro', 'tillfälligt boende företag örebro'],
      ['staff housing orebro', 'logistics corporate housing', 'university construction housing orebro', 'worker accommodation orebro sweden', 'temporary housing orebro', 'construction crew accommodation orebro'],
      ['zakwaterowanie pracownicze orebro', 'mieszkania logistyczne', 'noclegi kampusowe orebro', 'noclegi dla budowlańców örebro szwecja', 'kwatery pracownicze örebro', 'tymczasowe zakwaterowanie örebro szwecja']
    ),
    metrics: [
      {
        value: '28',
        label: ls('platser nära universitetet', 'beds near the university', 'miejsc blisko uniwersytetu'),
        subtext: ls('Perfekt för laboratorieentreprenörer', 'Ideal for lab contractors', 'Idealne dla wykonawców laboratoriów')
      },
      {
        value: '4',
        label: ls('sjukhusprojekt', 'hospital projects', 'projekty szpitalne'),
        subtext: ls('Specialstädning och rutiner', 'Special cleaning and routines', 'Specjalne sprzątanie i procedury')
      },
      {
        value: '18',
        label: ls('min till Kumla', 'min to Kumla', 'min do Kumla'),
        subtext: ls('Lätt att kombinera regionen', 'Easy to cover the region', 'Łatwo obsłużyć region')
      }
    ],
    neighborhoods: [
      {
        name: ls('Bettorp', 'Bettorp', 'Bettorp'),
        description: ls('Snabb access till logistikparker och E4/E18.', 'Fast access to logistics parks and the E4/E18.', 'Szybki dostęp do parków logistycznych i E4/E18.'),
        distance: ls('6 min till terminalerna', '6 min to the terminals', '6 min do terminali')
      },
      {
        name: ls('Adolfsberg', 'Adolfsberg', 'Adolfsberg'),
        description: ls('Lugnt område för längre uppdrag.', 'Quiet district for long deployments.', 'Spokojna dzielnica na dłuższe kontrakty.'),
        distance: ls('8 min till sjukhuset', '8 min to the hospital', '8 min do szpitala')
      },
      {
        name: ls('Marieberg', 'Marieberg', 'Marieberg'),
        description: ls('Bekvämt för projekt mot Kumla och Hallsberg.', 'Convenient for projects toward Kumla and Hallsberg.', 'Dogodne dla projektów w kierunku Kumli i Hallsbergu.'),
        distance: ls('12 min till city', '12 min to downtown', '12 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Örebro Universitet', 'Örebro University', 'Uniwersytet w Örebro'),
        description: ls('Boende åt laboratorielag och installationsgrupper.', 'Housing for lab crews and installation teams.', 'Zakwaterowanie dla ekip laboratoryjnych i instalacyjnych.')
      },
      {
        name: ls('USÖ-sjukhuset', 'Örebro University Hospital', 'Szpital uniwersytecki Örebro'),
        description: ls('Specialstädning och möblering för vårdprojekt.', 'Special cleaning and furnishing for healthcare builds.', 'Specjalne sprzątanie i umeblowanie dla projektów medycznych.')
      },
      {
        name: ls('Logistikpark Marieberg', 'Marieberg logistics park', 'Park logistyczny Marieberg'),
        description: ls('Hus med stora uppställningsytor för lastbilar.', 'Houses with large yards for trucks.', 'Domy z dużymi placami dla ciężarówek.')
      }
    ],
    testimonial: {
      quote: ls('Istället för tre hotell löste vi radhus i Adolfsberg där teamet kunde leva normalt mellan passen.', 'Instead of three hotels we got townhouses in Adolfsberg so the crew lived normally between shifts.', 'Zamiast trzech hoteli dostaliśmy segmenty w Adolfsbergu, więc zespół żył normalnie między zmianami.'),
      author: 'Caroline W.',
      role: ls('Projektledare', 'Project Lead', 'Kierownik projektu'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Måste vi boka på hela månader?', 'Do we need to book full months?', 'Czy musimy rezerwować całe miesiące?'),
        answer: ls('Nej, i Örebro erbjuder vi 14-dagarsperioder för att matcha korta installationsfönster.', 'No, in Örebro we offer 14-day periods to match short installation windows.', 'Nie, w Örebro oferujemy okresy 14-dniowe dopasowane do krótkich okien instalacyjnych.')
      },
      {
        question: ls('Hur funkar kvällsincheckning?', 'How does late check-in work?', 'Jak działa zameldowanie wieczorne?'),
        answer: ls('Era team får kodlås och digitala manualer så incheckning funkar även efter midnatt.', 'Teams receive code locks and digital guides so check-in works after midnight.', 'Zespoły dostają zamki kodowe i instrukcje, więc zameldowanie działa także po północy.')
      },
      {
        question: ls('Kan vi kombinera med Karlskoga/Kumla?', 'Can we combine with Karlskoga/Kumla?', 'Czy możemy połączyć z Karlskogą/Kumlą?'),
        answer: ls('Ja, vi planerar boenden i båda städerna med samma kontaktperson.', 'Yes, we plan housing in both towns with the same contact.', 'Tak, planujemy noclegi w obu miastach z jednym opiekunem.')
      }
    ],
    nearby: ['vasteras', 'linkoping']
  },
  {
    slug: 'linkoping',
    name: 'Linköping',
    region: 'Östergötlands län',
    population: '165 000',
    description: 'Teknologistad med avancerade byggprojekt och forskningsanläggningar.',
    highlights: ['Universitetsbyggnader', 'Teknikpark-utveckling', 'Moderna bostadsområden', 'Forskningscentra'],
    industries: ['Teknologi', 'Forskning', 'Utbildning', 'Industri'],
    coordinates: [58.4108, 15.6214],
    heroHook: ls('Lägenhetshotell & Personalboende i Linköping – nära Saab och Mjärdevi', 'Aparthotel & Worker Accommodation in Linköping – Near Saab & Mjärdevi', 'Aparthotel & Noclegi Pracownicze w Linköping – Blisko Saaba i Mjärdevi'),
    intro: ls('Linköping drivs av högteknologi och avancerade installationer. Våra lägenhetshotell och projektboenden i Lambohov, Vallastaden och Mjärdevi ger under tio minuters resa till labb och hangarer.', 'Linköping runs on high-tech and advanced installs. Our aparthotels and project housing in Lambohov, Vallastaden and Mjärdevi keep trips to labs and hangars under ten minutes.', 'Linköping to wysokie technologie i zaawansowane instalacje. Nasze aparthotele i noclegi projektowe w Lambohov, Vallastaden i Mjärdevi zapewniają dojazd do laboratoriów i hangarów w mniej niż dziesięć minut.'),
    keywords: lk(
      ['personalboende linköping', 'företagslägenheter mjärdevi', 'byggboende saab', 'boende byggarbetare linköping', 'montörboende linköping', 'tillfälligt boende företag linköping', 'lägenhetshotell linköping'],
      ['staff housing linkoping', 'corporate apartments mjar devi', 'saab construction housing', 'worker accommodation linkoping sweden', 'temporary housing linkoping', 'construction crew accommodation linkoping'],
      ['zakwaterowanie pracownicze linkoping', 'mieszkania firmowe mjar devi', 'noclegi saab', 'noclegi dla budowlańców linköping szwecja', 'kwatery pracownicze linköping', 'tymczasowe zakwaterowanie linköping szwecja']
    ),
    metrics: [
      {
        value: '32',
        label: ls('lägenheter nära Mjärdevi', 'apartments near Mjärdevi', 'mieszkania przy Mjärdevi'),
        subtext: ls('Perfekt för teknikmontörer', 'Perfect for technical installers', 'Idealne dla monterów technologicznych')
      },
      {
        value: '10 min',
        label: ls('till Saab & universitet', 'to Saab & the university', 'do Saaba i uniwersytetu'),
        subtext: ls('Snabb resväg även vid skift', 'Fast commute even on shifts', 'Szybki dojazd także przy zmianach')
      },
      {
        value: '5',
        label: ls('pågående flygprojekt', 'ongoing aviation projects', 'trwające projekty lotnicze'),
        subtext: ls('Specialrutiner för säkerhet', 'Special security routines', 'Specjalne procedury bezpieczeństwa')
      }
    ],
    neighborhoods: [
      {
        name: ls('Vallastaden', 'Vallastaden', 'Vallastaden'),
        description: ls('Nybyggt med stora kollektiva ytor.', 'New builds with generous communal areas.', 'Nowa zabudowa z dużymi przestrzeniami wspólnymi.'),
        distance: ls('5 min till universitetet', '5 min to the university', '5 min do uniwersytetu')
      },
      {
        name: ls('Lambohov', 'Lambohov', 'Lambohov'),
        description: ls('Bra för större lag och familjeliknande boenden.', 'Great for larger crews and home-like stays.', 'Dobre dla większych ekip i pobytów jak w domu.'),
        distance: ls('8 min till Mjärdevi', '8 min to Mjärdevi', '8 min do Mjärdevi')
      },
      {
        name: ls('Mjärdevi', 'Mjärdevi', 'Mjärdevi'),
        description: ls('Studios och townhouses mitt i techparken.', 'Studios and townhouses inside the tech park.', 'Studia i segmenty w samym parku technologicznym.'),
        distance: ls('Gångavstånd till labb', 'Walking distance to labs', 'Kilka minut pieszo do laboratoriów')
      }
    ],
    projects: [
      {
        name: ls('Saab expansionsprogram', 'Saab expansion program', 'Program rozbudowy Saaba'),
        description: ls('Säkerhetsklassade bostäder för certifierade montörer.', 'Security-cleared housing for certified installers.', 'Noclegi o podwyższonym bezpieczeństwie dla certyfikowanych monterów.')
      },
      {
        name: ls('Mjärdevi Science Park', 'Mjärdevi Science Park', 'Park naukowy Mjärdevi'),
        description: ls('Flexibla lägenheter för korta sprintar.', 'Flexible apartments for short sprints.', 'Elastyczne mieszkania na krótkie sprinty projektowe.')
      },
      {
        name: ls('US Linköping', 'Linköping University Hospital', 'Szpital uniwersytecki Linköping'),
        description: ls('Boenden åt installatörer nära sjukhuset.', 'Housing for installers near the hospital.', 'Zakwaterowanie dla instalatorów blisko szpitala.')
      }
    ],
    testimonial: {
      quote: ls('Vi slapp hotell helt – StayOnSite ordnade studios i Vallastaden där teknikerna kunde jobba kvällar ostört.', 'We skipped hotels entirely – StayOnSite set up studios in Vallastaden so technicians could work evenings undisturbed.', 'Obeszło się bez hoteli – StayOnSite zorganizowało studia w Vallastaden, więc technicy mogli spokojnie pracować wieczorami.'),
      author: 'Daniel K.',
      role: ls('Program Manager', 'Program Manager', 'Kierownik programu'),
      company: 'Försvarsindustri'
    },
    faq: [
      {
        question: ls('Hur löser ni säkerhetsklassning?', 'How do you handle security clearance?', 'Jak zapewniacie dostęp z certyfikacją bezpieczeństwa?'),
        answer: ls('Vi är vana vid att ordna boende nära projekt med säkerhetskrav och förbereder allt inför inflyttning.', 'We are experienced arranging housing near projects with security requirements and prepare everything before move-in.', 'Mamy doświadczenie w organizacji noclegów blisko projektów z wymaganiami bezpieczeństwa i przygotowujemy wszystko przed zameldowaniem.')
      },
      {
        question: ls('Kan vi ha mix av enkelrum och delade rum?', 'Can we mix single and shared rooms?', 'Czy możemy łączyć pokoje jedno- i wieloosobowe?'),
        answer: ls('Ja, vi kombinerar studios och större lägenheter så att seniora roller får egna rum.', 'Yes, we mix studios and larger flats so senior roles have private rooms.', 'Tak, łączymy kawalerki i większe mieszkania, aby starsze role miały własne pokoje.')
      },
      {
        question: ls('Har ni erfarenhet av laboratorier?', 'Do you have lab experience?', 'Czy macie doświadczenie z laboratoriami?'),
        answer: ls('Ja, vi servar flera renrumsprojekt och hanterar utrustningsförvaring i boendena.', 'Yes, we support multiple cleanroom projects and handle equipment storage in the housing.', 'Tak, obsługujemy wiele projektów cleanroom i zapewniamy magazynowanie sprzętu w lokalach.')
      }
    ],
    nearby: ['norrkoping', 'jonkoping']
  },
  {
    slug: 'helsingborg',
    name: 'Helsingborg',
    region: 'Skåne län',
    population: '150 000',
    description: 'Hamnstad med aktiv byggsektor och närhet till Danmark.',
    highlights: ['Hamnområdesutveckling', 'Logistikcentra', 'Bostadsprojekt', 'Kommersiella anläggningar'],
    industries: ['Hamn & Logistik', 'Kommersiellt', 'Bostäder', 'Transport'],
    coordinates: [56.0465, 12.6945],
    heroHook: ls('Lägenhetshotell & Personalboende i Helsingborg – nära hamnen och E4', 'Aparthotel & Worker Accommodation in Helsingborg – Near the Harbour & E4', 'Aparthotel & Noclegi Pracownicze w Helsingborgu – Blisko Portu i E4'),
    intro: ls('Utvecklingen av Helsingborgs hamn, Oceanhamnen och logistikterminalerna kräver snabb access till färjor och E4. Våra lägenhetshotell och radhus i Oceanhamnen, Eneborg och Ättekulla har stora förråd och parkering.', 'The harbour, Oceanhamnen and logistics terminals need fast access to ferries and the E4. Our aparthotels and townhouses in Oceanhamnen, Eneborg and Ättekulla come with ample storage and parking.', 'Rozwój portu, Oceanhamnen i terminali logistycznych wymaga szybkiego dostępu do promów i E4. Nasze aparthotele i segmenty w Oceanhamnen, Eneborgu i Ättekulli mają duże magazyny i parkingi.'),
    keywords: lk(
      ['personalboende helsingborg', 'hamnboende bygg', 'företagsboende öresund', 'boende byggarbetare helsingborg', 'montörboende helsingborg', 'tillfälligt boende företag helsingborg', 'lägenhetshotell helsingborg'],
      ['staff housing helsingborg', 'harbour construction housing', 'oresund corporate housing', 'worker accommodation helsingborg sweden', 'temporary housing helsingborg', 'construction crew accommodation helsingborg'],
      ['zakwaterowanie pracownicze helsingborg', 'noclegi przy porcie', 'mieszkania firmowe oresund', 'noclegi dla budowlańców helsingborg szwecja', 'kwatery pracownicze helsingborg', 'tymczasowe zakwaterowanie helsingborg szwecja']
    ),
    metrics: [
      {
        value: '40',
        label: ls('platser vid hamnen', 'beds by the harbour', 'miejsc przy porcie'),
        subtext: ls('Oceanhamnen & Norra hamnen', 'Oceanhamnen & North Harbour', 'Oceanhamnen i Norra Hamnen')
      },
      {
        value: '35 min',
        label: ls('till Malmö/Köpenhamn', 'to Malmö/Copenhagen', 'do Malmö/Kopenhagi'),
        subtext: ls('Bra för kombinerade projekt', 'Great for combined projects', 'Świetne dla projektów po obu stronach')
      },
      {
        value: '3',
        label: ls('logistikkluster', 'logistics clusters', 'klastry logistyczne'),
        subtext: ls('E4, Ättekulla, södra hamnen', 'E4, Ättekulla, south harbour', 'E4, Ättekulla, południowy port')
      }
    ],
    neighborhoods: [
      {
        name: ls('Oceanhamnen', 'Oceanhamnen', 'Oceanhamnen'),
        description: ls('Nya fastigheter med gångväg till hamnen.', 'New properties with a short walk to the harbour.', 'Nowe obiekty kilka minut pieszo od portu.'),
        distance: ls('3 min till färjeterminalen', '3 min to the ferry terminal', '3 min do terminalu promowego')
      },
      {
        name: ls('Eneborg & Söder', 'Eneborg & Söder', 'Eneborg i Söder'),
        description: ls('Prisvärda lägenheter för längre vistelser.', 'Affordable apartments for longer stays.', 'Przystępne cenowo mieszkania na dłuższe pobyty.'),
        distance: ls('8 min till city', '8 min to downtown', '8 min do centrum')
      },
      {
        name: ls('Ättekulla', 'Ättekulla', 'Ättekulla'),
        description: ls('Närhet till logistikterminaler och E4.', 'Close to logistics terminals and the E4.', 'Blisko terminali logistycznych i E4.'),
        distance: ls('5 min till motorvägen', '5 min to the motorway', '5 min do autostrady')
      }
    ],
    projects: [
      {
        name: ls('Oceanhamnen', 'Oceanhamnen', 'Oceanhamnen'),
        description: ls('Fasad- och installationslag bor mitt i området.', 'Façade and installation crews live inside the district.', 'Ekipy fasadowe i instalacyjne mieszkają w samym sercu dzielnicy.')
      },
      {
        name: ls('Helsingborgs hamn', 'Helsingborg Harbour', 'Port w Helsingborgu'),
        description: ls('Boenden för skiftgående kranmekaniker.', 'Housing for crane mechanics on shifts.', 'Noclegi dla mechaników suwnic pracujących na zmiany.')
      },
      {
        name: ls('E4-logistik', 'E4 logistics corridor', 'Korytarz logistyczny E4'),
        description: ls('Stora hus för lagerprojekt längs södra infarten.', 'Large houses for warehouse projects along the southern approach.', 'Duże domy dla projektów magazynowych przy południowym wjeździe.')
      }
    ],
    testimonial: {
      quote: ls('Hamnen krävde nattbemanning och vi fick bo kvar i Oceanhamnen hela projektet utan att byta adress.', 'The harbour needed night staffing and we stayed in Oceanhamnen for the whole project without changing address.', 'Port wymagał nocnej obsady i mieszkaliśmy w Oceanhamnen przez cały projekt bez zmiany adresu.'),
      author: 'Linda M.',
      role: ls('Operations Lead', 'Operations Lead', 'Lider operacyjny'),
      company: 'Järnväg & Infrastruktur'
    },
    faq: [
      {
        question: ls('Kan ni kombinera Helsingborg och Helsingör?', 'Can you combine Helsingborg and Helsingør?', 'Czy możecie łączyć Helsingborg i Helsingør?'),
        answer: ls('Ja, vi placerar boenden nära färjeterminalen i Helsingborg så teamet enkelt kan pendla till Helsingör.', 'Yes, we place housing near the ferry terminal in Helsingborg so the team can easily commute to Helsingør.', 'Tak, lokujemy noclegi blisko terminalu promowego w Helsingborg, by zespół łatwo dojeżdżał do Helsingør.')
      },
      {
        question: ls('Hur hanterar ni färjeförseningar?', 'How do you handle ferry delays?', 'Jak radzicie sobie z opóźnieniami promów?'),
        answer: ls('Vi lägger boenden på båda sidor så att teamskiften klarar förseningar utan stopp.', 'We place housing on both sides so crew rotations survive delays without stoppage.', 'Lokujemy noclegi po obu stronach, by zmiany ekipy przechodziły mimo opóźnień.')
      },
      {
        question: ls('Får vi stora förråd?', 'Do we get large storage?', 'Czy zapewniacie duże magazyny?'),
        answer: ls('Flera radhus har egna förråd och vi kan addera containrar på tomten vid behov.', 'Several townhouses have their own storage and we can add containers on-site if needed.', 'Wiele segmentów ma własne magazyny, a w razie potrzeby dodajemy kontenery na działce.')
      }
    ],
    nearby: ['malmo', 'goteborg']
  },
  {
    slug: 'jonkoping',
    name: 'Jönköping',
    region: 'Jönköpings län',
    population: '140 000',
    description: 'Industristad vid Vättern med många byggprojekt.',
    highlights: ['Industriexpansion', 'Universitetsbyggnation', 'Centrumförnyelse', 'Bostadsutveckling'],
    industries: ['Industri', 'Utbildning', 'Kommersiellt', 'Bostäder'],
    coordinates: [57.7826, 14.1618],
    heroHook: ls('Lägenhetshotell & Personalboende i Jönköping – nära Elmia och Torsvik', 'Aparthotel & Worker Accommodation in Jönköping – Near Elmia & Torsvik', 'Aparthotel & Noclegi Pracownicze w Jönköping – Blisko Elmii i Torsvik'),
    intro: ls('Elmia-mässor, logistiknavet Torsvik och nya bostadskvarter kräver boenden med plats för utrustning. Våra lägenhetshotell i Huskvarna och centrum samt villor söder om stan passar team med servicebilar.', 'Elmia fairs, the Torsvik logistics hub and new housing blocks need space for equipment. Our aparthotels in Huskvarna and downtown plus villas south of town suit teams with service vans.', 'Targi Elmia, hub logistyczny Torsvik i nowe osiedla potrzebują miejsca na sprzęt. Nasze aparthotele w Huskvarnie, centrum i wille na południu miasta pasują ekipom z autami serwisowymi.'),
    keywords: lk(
      ['personalboende jönköping', 'företagsboende torsvik', 'logistikboende elmia', 'boende byggarbetare jönköping', 'montörboende jönköping', 'tillfälligt boende företag jönköping', 'lägenhetshotell jönköping'],
      ['staff housing jonkoping', 'corporate housing torsvik', 'elmia logistics housing', 'worker accommodation jonkoping sweden', 'temporary housing jonkoping', 'construction crew accommodation jonkoping'],
      ['zakwaterowanie pracownicze jonkoping', 'mieszkania firmowe torsvik', 'noclegi logistyka elmia', 'noclegi dla budowlańców jönköping szwecja', 'kwatery pracownicze jönköping', 'tymczasowe zakwaterowanie jönköping szwecja']
    ),
    metrics: [
      {
        value: '30',
        label: ls('platser nära Elmia', 'beds near Elmia', 'miejsc blisko Elmia'),
        subtext: ls('Perfekt för mäss- och monterlag', 'Perfect for tradeshow crews', 'Idealne dla ekip targowych')
      },
      {
        value: '15',
        label: ls('hus i Huskvarna', 'houses in Huskvarna', 'domy w Huskvarnie'),
        subtext: ls('Nära Scania och batteriprojekt', 'Close to Scania and battery builds', 'Blisko Scanii i projektów baterii')
      },
      {
        value: '20 min',
        label: ls('till Torsvik', 'to Torsvik', 'do Torsvik'),
        subtext: ls('Snabb access till lagerbyggen', 'Fast access to warehouse builds', 'Szybki dojazd do budów magazynowych')
      }
    ],
    neighborhoods: [
      {
        name: ls('Huskvarna', 'Huskvarna', 'Huskvarna'),
        description: ls('Kedjehus med garage för verktyg.', 'Townhouses with garages for tools.', 'Segmenty z garażami na sprzęt.'),
        distance: ls('8 min till centrala Jönköping', '8 min to central Jönköping', '8 min do centrum Jönköping')
      },
      {
        name: ls('Torsvik/Södra', 'Torsvik/South', 'Torsvik/Południe'),
        description: ls('Nästan på logistikparken – perfekt för nattpass.', 'Right next to the logistics park – perfect for night shifts.', 'Tuż przy parku logistycznym – idealnie na nocne zmiany.'),
        distance: ls('5 min till terminalerna', '5 min to the terminals', '5 min do terminali')
      },
      {
        name: ls('Centrum & Munksjön', 'City & Munksjön', 'Centrum i Munksjön'),
        description: ls('Lägenheter för projektledare nära vatten.', 'Apartments for managers close to the water.', 'Mieszkania dla kadry zarządzającej nad wodą.'),
        distance: ls('Promenadavstånd till city', 'Walking distance to downtown', 'Spacer do centrum')
      }
    ],
    projects: [
      {
        name: ls('Elmia & Kongress', 'Elmia & Congress Center', 'Elmia i centrum kongresowe'),
        description: ls('Blockhyrda lägenheter för återkommande mässbyggen.', 'Block-rented apartments for recurring trade fairs.', 'Blokowe wynajmy mieszkań na cykliczne targi.')
      },
      {
        name: ls('Torsvik logistik', 'Torsvik logistics', 'Logistyka Torsvik'),
        description: ls('Boende för lager- och automationsprojekt.', 'Housing for warehouse and automation projects.', 'Zakwaterowanie dla projektów magazynowych i automatyki.')
      },
      {
        name: ls('Huskvarna industri', 'Huskvarna industry', 'Przemysł Huskvarna'),
        description: ls('Villor åt maskinlag hos Husqvarna.', 'Villas for machine crews at Husqvarna.', 'Wille dla ekip maszynowych w Husqvarnie.')
      }
    ],
    testimonial: {
      quote: ls('Vi behövde både kontorsfolk och montörer och StayOnSite hittade lösningar så alla bodde max 10 min från Elmia.', 'We needed both office staff and installers and StayOnSite found setups so everyone lived within 10 minutes of Elmia.', 'Potrzebowaliśmy biura i monterów, a StayOnSite znalazł rozwiązania, dzięki którym wszyscy mieszkali maks 10 minut od Elmia.'),
      author: 'Erik L.',
      role: ls('Project Director', 'Project Director', 'Dyrektor projektu'),
      company: 'El & Automation'
    },
    faq: [
      {
        question: ls('Kan vi få boende under Elmia-mässorna trots högtryck?', 'Can we get housing during the Elmia fairs despite high demand?', 'Czy zapewnicie noclegi podczas targów Elmia mimo dużego popytu?'),
        answer: ls('Ja, vi förbokar block i Huskvarna och stan inför mässsäsongen, så uppge datum i god tid.', 'Yes, we pre-book blocks in Huskvarna and downtown before fair season, so share your dates in time.', 'Tak, przed sezonem targowym rezerwujemy bloki w Huskvarnie i centrum, więc podajcie terminy odpowiednio wcześniej.')
      },
      {
        question: ls('Ingår förråd och verkstadsyta?', 'Is storage and workshop space included?', 'Czy w cenie są magazyny i warsztat?'),
        answer: ls('I Huskvarna och Torsvik har vi garage/förråd som kan göras om till enklare verkstad.', 'In Huskvarna and Torsvik we have garages/storage that can convert into light workshops.', 'W Huskvarnie i Torsviku mamy garaże/magazyny, które można przerobić na prosty warsztat.')
      },
      {
        question: ls('Fixar ni transport till Vaggeryd/Nässjö?', 'Do you arrange transport to Vaggeryd/Nässjö?', 'Czy organizujecie dojazdy do Vaggeryd/Nässjö?'),
        answer: ls('Vi lägger boenden längs E4 så pendling till Vaggeryd eller Nässjö blir enkel.', 'We place housing along the E4 so commuting to Vaggeryd or Nässjö stays easy.', 'Lokujemy noclegi przy E4, aby dojazdy do Vaggeryd lub Nässjö były proste.')
      }
    ],
    nearby: ['linkoping', 'goteborg']
  },
  {
    slug: 'norrkoping',
    name: 'Norrköping',
    region: 'Östergötlands län',
    population: '145 000',
    description: 'Industristad med omfattande förnyelse och byggprojekt.',
    highlights: ['Industriområdesförnyelse', 'Campusbyggnation', 'Stadsdelsutveckling', 'Infrastrukturprojekt'],
    industries: ['Industri', 'Utbildning', 'Stadsförnyelse', 'Teknik'],
    coordinates: [58.5942, 16.1826],
    heroHook: ls('Boende & Personalboende i Norrköping – nära Ostlänken och Inre hamnen', 'Accommodation & Worker Housing in Norrköping – Near Ostlänken & Inre Hamnen', 'Noclegi & Zakwaterowanie Pracownicze w Norrköping – Blisko Ostlänken i Inre Hamnen'),
    intro: ls('Stora projekt som Ostlänken och Inre hamnen gör att många företag behöver boende i Norrköping. Vi ordnar möblerade lägenhetshotell i Saltängen, Hageby och Åby med kort avstånd till era arbetsplatser.', 'Major projects like Ostlänken and Inre Hamnen mean many companies need accommodation in Norrköping. We arrange furnished aparthotels in Saltängen, Hageby and Åby close to your work sites.', 'Duże projekty jak Ostlänken i Inre Hamnen sprawiają, że wiele firm potrzebuje noclegów w Norrköping. Organizujemy umeblowane aparthotele w Saltängen, Hageby i Åby blisko Waszych budów.'),
    keywords: lk(
      ['personalboende norrköping', 'företagsboende ostlänken', 'byggboende inre hamnen', 'boende byggarbetare norrköping', 'montörboende norrköping', 'tillfälligt boende företag norrköping', 'boende norrköping'],
      ['staff housing norrkoping', 'ostlanken corporate housing', 'inre hamnen construction housing', 'worker accommodation norrkoping sweden', 'temporary housing norrkoping', 'construction crew accommodation norrkoping'],
      ['zakwaterowanie pracownicze norrkoping', 'mieszkania firmowe ostlanken', 'noclegi inre hamnen', 'noclegi dla budowlańców norrköping szwecja', 'kwatery pracownicze norrköping', 'tymczasowe zakwaterowanie norrköping szwecja']
    ),
    metrics: [
      {
        value: '25',
        label: ls('lägenheter i Inre hamnen', 'apartments in Inre Hamnen', 'mieszkania w Inre Hamnen'),
        subtext: ls('Utsikt över kajen', 'Quay views', 'Widok na nabrzeże')
      },
      {
        value: '14',
        label: ls('min till Linköping', 'min to Linköping', 'min do Linköping'),
        subtext: ls('Bra för kombinerade projekt', 'Good for combined projects', 'Dobre dla łączonych projektów')
      },
      {
        value: '5',
        label: ls('järnvägsprojekt', 'rail projects', 'projekty kolejowe'),
        subtext: ls('Team nära depå och spår', 'Crews near depots and tracks', 'Ekipy blisko zaplecza i torów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Saltängen & Inre hamnen', 'Saltängen & Inre Hamnen', 'Saltängen i Inre Hamnen'),
        description: ls('Mitt i stadsutvecklingen för korta transporter.', 'In the heart of the redevelopment for short transfers.', 'W centrum rewitalizacji – krótkie przejazdy.'),
        distance: ls('Gångavstånd till city', 'Walking distance to downtown', 'Spacer do centrum')
      },
      {
        name: ls('Hageby', 'Hageby', 'Hageby'),
        description: ls('Prisvärda lägenheter med bra kollektivtrafik.', 'Affordable apartments with good transit.', 'Tanie mieszkania z dobrą komunikacją.'),
        distance: ls('10 min till hamnen', '10 min to the harbour', '10 min do portu')
      },
      {
        name: ls('Åby & Herstadberg', 'Åby & Herstadberg', 'Åby i Herstadberg'),
        description: ls('Villor nära E4 för industriområdena norrut.', 'Villas near the E4 for northern industrial zones.', 'Wille przy E4 dla północnych stref przemysłowych.'),
        distance: ls('8 min till Händelö', '8 min to Händelö', '8 min do Händelö')
      }
    ],
    projects: [
      {
        name: ls('Ostlänken', 'Ostlänken', 'Ostlänken'),
        description: ls('Boende åt mark- och signalteam under nattpass.', 'Housing for ground and signalling crews on night shifts.', 'Zakwaterowanie dla ekip ziemnych i sygnałowych na nocnych zmianach.')
      },
      {
        name: ls('Inre hamnen', 'Inner Harbour', 'Inre Hamnen'),
        description: ls('Långtidsboende för stommontörer och installatörer.', 'Long-term housing for frame and installation teams.', 'Długie pobyty dla ekip konstrukcyjnych i instalacyjnych.')
      },
      {
        name: ls('Industrilandskapet', 'Industrial Landscape', 'Industrial Landscape'),
        description: ls('Renoveringsprojekt med krav på historiska miljöer.', 'Renovation projects with strict heritage demands.', 'Renowacje z wymogami konserwatorskimi.')
      }
    ],
    testimonial: {
      quote: ls('Med hela teamet i Saltängen kunde vi gå till bygget och slapp pendling helt.', 'With the whole crew in Saltängen we walked to the site and removed commuting entirely.', 'Cała ekipa w Saltängen mogła chodzić pieszo na budowę – zero dojazdów.'),
      author: 'Sara B.',
      role: ls('Site Manager', 'Site Manager', 'Kierownik budowy'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Kan ni kombinera Linköping och Norrköping?', 'Can you combine Linköping and Norrköping?', 'Czy można połączyć Linköping i Norrköping?'),
        answer: ls('Ja, vi synkar kontrakt så att projekt som rör båda städerna får gemensam planering.', 'Yes, we sync contracts so projects covering both cities share one plan.', 'Tak, synchronizujemy umowy, aby projekty w obu miastach miały wspólny plan.')
      },
      {
        question: ls('Hur nära Ostlänken får vi bo?', 'How close to Ostlänken can we stay?', 'Jak blisko Ostlänken możemy mieszkać?'),
        answer: ls('Vi har objekt på promenadavstånd till arbetsplatserna längs hamnen och i Herstadberg.', 'We have units within walking distance of the harbour works and Herstadberg.', 'Mamy lokale w zasięgu spaceru od robót w porcie i Herstadbergu.')
      },
      {
        question: ls('Ingår slutstädning när team roterar varje vecka?', 'Is final cleaning included when crews rotate weekly?', 'Czy sprzątanie końcowe jest w cenie przy cotygodniowych rotacjach?'),
        answer: ls('Ja, vi städar mellan varje teamrotation så nästa lag kan flytta in i ett rent boende.', 'Yes, we clean between each crew rotation so the next team moves into fresh housing.', 'Tak, sprzątamy między zmianami, by kolejna ekipa wprowadzała się do czystego mieszkania.')
      }
    ],
    nearby: ['linkoping', 'stockholm']
  },
  {
    slug: 'gavle',
    name: 'Gävle',
    region: 'Gävleborgs län',
    population: '103 000',
    description: 'Hamnstad med omfattande industribyggnation och hamnutbyggnad.',
    highlights: ['Hamnutbyggnad', 'Skogsindustriprojekt', 'Datacenterbyggen', 'Bostadsutveckling'],
    industries: ['Hamn & Logistik', 'Skogsindustri', 'Datacenter', 'Bostäder'],
    coordinates: [60.6749, 17.1413],
    heroHook: ls(
      'Lägenhetshotell & Personalboende i Gävle – nära hamnen och datacenter',
      'Aparthotel & Worker Accommodation in Gävle – Near Harbour & Data Centers',
      'Aparthotel & Noclegi Pracownicze w Gävle – Blisko Portu i Centrów Danych'
    ),
    intro: ls(
      'Hamnutbyggnaden, nya datacenter och skogsindustriprojekt kräver att hela team kan bo nära arbetsplatserna. Våra lägenhetshotell och radhus i Andersberg, Brynäs och Sätra ger era montörer egna sovrum och delade kök.',
      'Harbor expansion, new data centers and forestry projects require whole crews living near the sites. Our aparthotels and townhouses in Andersberg, Brynäs and Sätra give your fitters private bedrooms and shared kitchens.',
      'Rozbudowa portu, nowe centra danych i projekty leśne wymagają, by całe ekipy mieszkały blisko inwestycji. Nasze aparthotele i szeregowce w Andersberg, Brynäs i Sätra zapewniają prywatne sypialnie i wspólne kuchnie.'
    ),
    keywords: lk(
      ['personalboende gävle', 'företagslägenheter hamn', 'byggboende datacenter gävle', 'boende byggarbetare gävle', 'montörboende gävle', 'tillfälligt boende företag gävle', 'lägenhetshotell gävle'],
      ['corporate housing gavle', 'harbor staff apartments', 'datacenter construction housing gavle', 'worker accommodation gavle sweden', 'temporary housing gavle', 'construction crew accommodation gavle'],
      ['zakwaterowanie pracownicze gavle', 'mieszkania portowe', 'noclegi datacenter gavle', 'noclegi dla budowlańców gävle szwecja', 'kwatery pracownicze gävle', 'tymczasowe zakwaterowanie gävle szwecja']
    ),
    metrics: [
      {
        value: '45',
        label: ls('platser nära hamnen', 'beds near the harbor', 'miejsc blisko portu'),
        subtext: ls('Brynäs och Sätra', 'Brynäs and Sätra', 'Brynäs i Sätra')
      },
      {
        value: '6',
        label: ls('datacenterbyggen', 'data center projects', 'projekty data center'),
        subtext: ls('Team nära Forsbacka', 'Crews near Forsbacka', 'Ekipy blisko Forsbacka')
      },
      {
        value: '22',
        label: ls('min till hamnen', 'min to the harbor', 'min do portu'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Andersberg', 'Andersberg', 'Andersberg'),
        description: ls('Moderna lägenheter nära skogsindustriprojekt.', 'Modern apartments near forestry projects.', 'Nowoczesne mieszkania blisko projektów leśnych.'),
        distance: ls('15 min till Korsnäs', '15 min to Korsnäs', '15 min do Korsnäs')
      },
      {
        name: ls('Brynäs', 'Brynäs', 'Brynäs'),
        description: ls('Nära hamnen och datacenterområdena.', 'Close to harbor and data center zones.', 'Blisko portu i stref datacenter.'),
        distance: ls('8 min till hamnen', '8 min to harbor', '8 min do portu')
      },
      {
        name: ls('Sätra', 'Sätra', 'Sätra'),
        description: ls('Lugnt med parkering för arbetsbussar.', 'Quiet with parking for crew vans.', 'Spokojnie z parkingiem dla busów.'),
        distance: ls('12 min till city', '12 min to downtown', '12 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Hamnutbyggnad Gävle', 'Gävle Harbor Expansion', 'Rozbudowa portu Gävle'),
        description: ls('Långtidsboende för hamn- och kranmontörer.', 'Long-term housing for harbor and crane fitters.', 'Długoterminowe noclegi dla monterów portowych i dźwigów.')
      },
      {
        name: ls('Datacenter Forsbacka', 'Forsbacka Data Center', 'Datacenter Forsbacka'),
        description: ls('Team nära kylsystem och elinstallationer.', 'Crews near cooling systems and electrical installations.', 'Ekipy przy systemach chłodzenia i instalacjach elektrycznych.')
      },
      {
        name: ls('Skogsindustriprojekt', 'Forestry Industry Projects', 'Projekty przemysłu leśnego'),
        description: ls('Boende för processoperatörer och underhållsteam.', 'Housing for process operators and maintenance crews.', 'Zakwaterowanie dla operatorów procesów i ekip serwisowych.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 12 montörer vid hamnen och StayOnSite ordnade radhus i Brynäs med 5 minuters bilresa till kajen.',
        'We needed housing for 12 fitters at the harbor and StayOnSite arranged townhouses in Brynäs with a 5-minute drive to the quay.',
        'Potrzebowaliśmy noclegów dla 12 monterów w porcie i StayOnSite zorganizowało szeregowce w Brynäs – 5 minut jazdy do nabrzeża.'
      ),
      author: 'Anders L.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Hamn & Logistik'
    },
    faq: [
      {
        question: ls('Kan vi kombinera Gävle och Sandviken?', 'Can we combine Gävle and Sandviken?', 'Czy możemy połączyć Gävle i Sandviken?'),
        answer: ls(
          'Ja, vi planerar boenden i båda städerna med samma kontaktperson för smidiga rotationer.',
          'Yes, we plan housing in both cities with the same contact for smooth rotations.',
          'Tak, planujemy noclegi w obu miastach z tym samym opiekunem dla płynnych rotacji.'
        )
      },
      {
        question: ls('Hur nära hamnen kan vi bo?', 'How close to the harbor can we stay?', 'Jak blisko portu możemy mieszkać?'),
        answer: ls(
          'Vi har radhus i Brynäs och lägenheter i Sätra med 8-15 minuters körning till hamnen.',
          'We have townhouses in Brynäs and apartments in Sätra with 8-15 minutes drive to the harbor.',
          'Mamy szeregowce w Brynäs i mieszkania w Sätra – 8-15 minut jazdy do portu.'
        )
      },
      {
        question: ls('Ingår städning mellan skift?', 'Is cleaning included between shifts?', 'Czy sprzątanie jest w cenie między zmianami?'),
        answer: ls(
          'Ja, vi gör genomgång mellan varje crew så nästa team kan flytta in direkt.',
          'Yes, we clean between each crew so the next team can move in right away.',
          'Tak, sprzątamy między ekipami, by kolejny zespół mógł się od razu wprowadzić.'
        )
      }
    ],
    nearby: ['uppsala', 'stockholm', 'falun']
  },
  {
    slug: 'boden',
    name: 'Boden',
    region: 'Norrbottens län',
    population: '28 000',
    description: 'Militär garnisonstad med omfattande försvarsinvesteringar och infrastrukturprojekt.',
    highlights: ['Försvarsutbyggnad', 'Militära anläggningar', 'Infrastrukturprojekt', 'Testcentrum'],
    industries: ['Försvar', 'Bygg & Anläggning', 'Infrastruktur', 'Testanläggningar'],
    coordinates: [65.8252, 21.6886],
    heroHook: ls(
      'Boende & Personalboende i Boden – nära försvaret och H2 Green Steel',
      'Accommodation & Worker Housing in Boden – Near Defence & H2 Green Steel',
      'Noclegi & Zakwaterowanie Pracownicze w Boden – Blisko Obronności i H2 Green Steel'
    ),
    intro: ls(
      'Försvarsutbyggnaden och militära projekt kräver säkra och flexibla boenden i Boden. Vi har företagslägenheter och villor i centrala Boden och Svartbyträsk där era team får komfort efter långa arbetspass i norr.',
      'Defense expansion and military projects require secure and flexible accommodation in Boden. We have corporate apartments and houses in central Boden and Svartbyträsk where your teams get comfort after long shifts in the north.',
      'Rozbudowa obronna i projekty wojskowe wymagają bezpiecznych i elastycznych noclegów w Boden. Mamy mieszkania firmowe i domy w centrum Boden i Svartbyträsk, gdzie Twoje ekipy odpoczną po długich zmianach na północy.'
    ),
    keywords: lk(
      ['personalboende boden', 'företagslägenheter försvar', 'byggboende militär boden', 'boende byggarbetare boden', 'lägenheter boden', 'boende boden', 'hyreslägenheter boden', 'tillfälligt boende företag boden'],
      ['corporate housing boden', 'defense staff apartments', 'military construction housing boden', 'worker accommodation boden sweden', 'temporary housing boden', 'apartments boden sweden'],
      ['zakwaterowanie pracownicze boden', 'mieszkania obronne', 'noclegi wojskowe boden', 'noclegi dla budowlańców boden szwecja', 'kwatery pracownicze boden', 'tymczasowe zakwaterowanie boden szwecja']
    ),
    metrics: [
      {
        value: '32',
        label: ls('platser nära försvaret', 'beds near defense areas', 'miejsc blisko wojska'),
        subtext: ls('Centralt i Boden', 'Central in Boden', 'Centrum Boden')
      },
      {
        value: '8',
        label: ls('försvarsbyggen', 'defense projects', 'projekty obronne'),
        subtext: ls('Nya kaserner och anläggningar', 'New barracks and facilities', 'Nowe koszary i obiekty')
      },
      {
        value: '15',
        label: ls('min till Bodenfortet', 'min to Boden Fortress', 'min do Fortecy Boden'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Boden', 'Central Boden', 'Centrum Boden'),
        description: ls('Nära alla militära anläggningar och service.', 'Close to all military facilities and services.', 'Blisko wszystkich obiektów wojskowych i usług.'),
        distance: ls('5 min till garnisonen', '5 min to garrison', '5 min do garnizonu')
      },
      {
        name: ls('Svartbyträsk', 'Svartbyträsk', 'Svartbyträsk'),
        description: ls('Lugnt område för längre uppdrag.', 'Quiet area for longer deployments.', 'Spokojna okolica na dłuższe kontrakty.'),
        distance: ls('12 min till testcentrum', '12 min to test center', '12 min do centrum testowego')
      },
      {
        name: ls('Sävast', 'Sävast', 'Sävast'),
        description: ls('Villor med parkering för arbetsbussar och utrustning.', 'Houses with parking for crew vans and equipment.', 'Domy z parkingiem dla busów i sprzętu.'),
        distance: ls('10 min till city', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Försvarsutbyggnad', 'Defense Expansion', 'Rozbudowa obronna'),
        description: ls('Boende för bygg- och installationsteam vid nya kaserner.', 'Housing for construction and installation crews at new barracks.', 'Zakwaterowanie dla ekip budowlanych przy nowych koszarach.')
      },
      {
        name: ls('Infrastrukturprojekt', 'Infrastructure Projects', 'Projekty infrastrukturalne'),
        description: ls('Team nära väg- och järnvägsbyggen.', 'Crews near road and rail construction.', 'Ekipy przy budowie dróg i kolei.')
      },
      {
        name: ls('Testcentrum', 'Test Center', 'Centrum testowe'),
        description: ls('Långtidsboende för tekniker och testoperatörer.', 'Long-term housing for technicians and test operators.', 'Długoterminowe noclegi dla techników i operatorów testowych.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 15 montörer under sex månader och StayOnSite löste villor i Sävast där teamet fick ro mellan passen.',
        'We needed housing for 15 fitters for six months and StayOnSite arranged houses in Sävast where the crew got peace between shifts.',
        'Potrzebowaliśmy noclegów dla 15 monterów przez pół roku i StayOnSite zorganizowało domy w Sävast, gdzie zespół miał spokój między zmianami.'
      ),
      author: 'Magnus N.',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Hur funkar säkerheten vid försvarsbyggen?', 'How does security work at defense builds?', 'Jak działa bezpieczeństwo przy obiektach obronnych?'),
        answer: ls(
          'Vi är vana vid projekt med höga säkerhetskrav och anpassar boenden efter era behov.',
          'We are experienced with high-security projects and adapt housing to your requirements.',
          'Przestrzegamy wszystkich wymagań bezpieczeństwa i współpracujemy z siłami zbrojnymi przy zgodach i dokumentacji.'
        )
      },
      {
        question: ls('Kan ni hantera korta varsel?', 'Can you handle short notice?', 'Czy możecie obsłużyć krótkie terminy?'),
        answer: ls(
          'Ja, vi har beredskap för snabba bemanningsförändringar och kan ordna boende inom 48 timmar.',
          'Yes, we are prepared for rapid staffing changes and can arrange housing within 48 hours.',
          'Tak, jesteśmy przygotowani na szybkie zmiany obsady i możemy zorganizować noclegi w 48 godzin.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerade boenden med köksredskap, sängkläder, städ varje vecka och el/värme/wifi.',
          'Fully furnished housing with kitchen equipment, bed linens, weekly cleaning and electricity/heating/wifi.',
          'W pełni umeblowane noclegi ze sprzętem kuchennym, pościelą, cotygodniowym sprzątaniem i prądem/ogrzewaniem/wifi.'
        )
      }
    ],
    nearby: ['lulea', 'umea']
  },
  {
    slug: 'saffle',
    name: 'Säffle',
    region: 'Värmlands län',
    population: '16 000',
    description: 'Industri- och möbelstad med nya produktionsanläggningar.',
    highlights: ['Möbel- och träindustri', 'Produktionsanläggningar', 'Industripark', 'Leverantörsprojekt'],
    industries: ['Möbelindustri', 'Träindustri', 'Produktion', 'Logistik'],
    coordinates: [59.1333, 12.9333],
    heroHook: ls(
      'Företagsboende i Säffle – nära trä- och möbelindustrin i Värmland',
      'Corporate Housing in Säffle – Near Wood & Furniture Industry in Värmland',
      'Zakwaterowanie Firmowe w Säffle – Blisko Przemysłu Drzewnego w Värmland'
    ),
    intro: ls(
      'Möbel- och träindustrin i Säffle expanderar och kräver flexibla företagsboenden för monteringsteam och produktionspersonal. Vi har lägenheter och villor i centrala Säffle och Nysäter nära fabrikerna.',
      'The furniture and wood industry in Säffle is expanding and requires flexible corporate housing for assembly crews and production staff. We have apartments and houses in central Säffle and Nysäter near the factories.',
      'Przemysł meblarski i drzewny w Säffle się rozrasta i wymaga elastycznych noclegów firmowych dla ekip montażowych i produkcyjnych. Mamy mieszkania i domy w centrum Säffle i Nysäter blisko fabryk.'
    ),
    keywords: lk(
      ['personalboende säffle', 'företagslägenheter möbelindustri', 'byggboende träindustri säffle', 'boende byggarbetare säffle', 'montörboende säffle', 'tillfälligt boende företag säffle'],
      ['corporate housing saffle', 'furniture industry apartments', 'wood industry housing saffle', 'worker accommodation saffle sweden', 'temporary housing saffle', 'construction crew accommodation saffle'],
      ['zakwaterowanie pracownicze saffle', 'mieszkania przemysł meblarski', 'noclegi przemysł drzewny saffle', 'noclegi dla budowlańców säffle szwecja', 'kwatery pracownicze säffle', 'tymczasowe zakwaterowanie säffle szwecja']
    ),
    metrics: [
      {
        value: '18',
        label: ls('platser nära industrin', 'beds near industry', 'miejsc blisko przemysłu'),
        subtext: ls('Centralt i Säffle', 'Central in Säffle', 'Centrum Säffle')
      },
      {
        value: '4',
        label: ls('produktionsprojekt', 'production projects', 'projekty produkcyjne'),
        subtext: ls('Möbel och träindustri', 'Furniture and wood', 'Meble i drewno')
      },
      {
        value: '10',
        label: ls('min till fabrikerna', 'min to factories', 'min do fabryk'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Säffle', 'Central Säffle', 'Centrum Säffle'),
        description: ls('Nära service och produktionsområden.', 'Close to services and production areas.', 'Blisko usług i obszarów produkcyjnych.'),
        distance: ls('5 min till fabriker', '5 min to factories', '5 min do fabryk')
      },
      {
        name: ls('Nysäter', 'Nysäter', 'Nysäter'),
        description: ls('Lugnt område med parkeringsmöjligheter.', 'Quiet area with parking options.', 'Spokojna okolica z możliwością parkowania.'),
        distance: ls('8 min till industrin', '8 min to industry', '8 min do przemysłu')
      },
      {
        name: ls('Östanå', 'Östanå', 'Östanå'),
        description: ls('Villor med gårdsplats för arbetsbilar.', 'Houses with yard for work vehicles.', 'Domy z podwórkiem dla aut służbowych.'),
        distance: ls('12 min till centrum', '12 min to downtown', '12 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Möbelindustriprojekt', 'Furniture Industry Projects', 'Projekty przemysłu meblarskiego'),
        description: ls('Boende för monteringsteam vid nya produktionslinjer.', 'Housing for assembly crews at new production lines.', 'Zakwaterowanie dla ekip montażowych przy nowych liniach produkcyjnych.')
      },
      {
        name: ls('Träindustriutbyggnad', 'Wood Industry Expansion', 'Rozbudowa przemysłu drzewnego'),
        description: ls('Team nära sågverk och förädlingsanläggningar.', 'Crews near sawmills and processing facilities.', 'Ekipy blisko tartaków i zakładów przetwórczych.')
      },
      {
        name: ls('Logistikanläggningar', 'Logistics Facilities', 'Obiekty logistyczne'),
        description: ls('Långtidsboende för lager- och transportpersonal.', 'Long-term housing for warehouse and transport staff.', 'Długoterminowe noclegi dla personelu magazynowego i transportowego.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 8 monterare under tre månader och StayOnSite ordnade radhus i Nysäter med 10 minuters bilresa till fabriken.',
        'We needed housing for 8 assemblers for three months and StayOnSite arranged townhouses in Nysäter with a 10-minute drive to the factory.',
        'Potrzebowaliśmy noclegów dla 8 monterów przez trzy miesiące i StayOnSite zorganizowało szeregowce w Nysäter – 10 minut jazdy do fabryki.'
      ),
      author: 'Lars B.',
      role: ls('Produktionschef', 'Production Manager', 'Kierownik produkcji'),
      company: 'Möbelindustri'
    },
    faq: [
      {
        question: ls('Kan ni hantera skiftarbete?', 'Can you handle shift work?', 'Czy możecie obsłużyć pracę zmianową?'),
        answer: ls(
          'Ja, våra boenden är anpassade för natt- och dagskift med tyst miljö för sömn.',
          'Yes, our housing is adapted for night and day shifts with a quiet environment for sleep.',
          'Tak, nasze noclegi są dostosowane do zmian nocnych i dziennych z cichym otoczeniem do snu.'
        )
      },
      {
        question: ls('Hur nära fabrikerna kan vi bo?', 'How close to the factories can we stay?', 'Jak blisko fabryk możemy mieszkać?'),
        answer: ls(
          'Vi har boenden med 5-12 minuters körning till de största produktionsanläggningarna.',
          'We have housing with 5-12 minutes drive to the largest production facilities.',
          'Mamy noclegi 5-12 minut jazdy do największych zakładów produkcyjnych.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städ varje vecka och el/värme/wifi.',
          'Fully furnished with kitchen, bed linens, weekly cleaning and electricity/heating/wifi.',
          'W pełni umeblowane z kuchnią, pościelą, cotygodniowym sprzątaniem i prądem/ogrzewaniem/wifi.'
        )
      }
    ],
    nearby: ['karlstad', 'kristinehamn']
  },
  {
    slug: 'vingaker',
    name: 'Vingåker',
    region: 'Södermanlands län',
    population: '9 000',
    description: 'Liten industristad med logistik- och produktionsanläggningar.',
    highlights: ['Logistikprojekt', 'Industriutbyggnad', 'Produktionsanläggningar', 'Outlet-expansion'],
    industries: ['Logistik', 'Produktion', 'Detaljhandel', 'Distribution'],
    coordinates: [59.0442, 15.8711],
    heroHook: ls(
      'Företagsboende i Vingåker – mellan Stockholm och Örebro',
      'Corporate Housing in Vingåker – Between Stockholm & Örebro',
      'Zakwaterowanie Firmowe w Vingåker – Między Sztokholmem a Örebro'
    ),
    intro: ls(
      'Vingåkers strategiska läge mellan Stockholm och Örebro gör staden perfekt för logistikprojekt. Våra företagsboenden ger era team ro efter långa arbetspass och nå både E4 och E20 på minuter.',
      'Vingåker\'s strategic location between Stockholm and Örebro makes the town perfect for logistics projects. Our corporate housing gives your teams peace after long shifts with E4 and E20 minutes away.',
      'Strategiczne położenie Vingåker między Sztokholmem a Örebro czyni miasto idealnym dla projektów logistycznych. Nasze noclegi firmowe zapewniają ekipom spokój po zmianach z dojazdem do E4 i E20 w kilka minut.'
    ),
    keywords: lk(
      ['personalboende vingåker', 'företagslägenheter logistik', 'byggboende produktion vingåker', 'boende byggarbetare vingåker', 'montörboende vingåker', 'tillfälligt boende företag vingåker'],
      ['corporate housing vingaker', 'logistics staff apartments', 'production housing vingaker', 'worker accommodation vingaker sweden', 'temporary housing vingaker', 'construction crew accommodation vingaker'],
      ['zakwaterowanie pracownicze vingaker', 'mieszkania logistyczne', 'noclegi produkcyjne vingaker', 'noclegi dla budowlańców vingåker szwecja', 'kwatery pracownicze vingåker', 'tymczasowe zakwaterowanie vingåker szwecja']
    ),
    metrics: [
      {
        value: '14',
        label: ls('platser nära E4/E20', 'beds near E4/E20', 'miejsc blisko E4/E20'),
        subtext: ls('Perfekt för logistik', 'Perfect for logistics', 'Idealne dla logistyki')
      },
      {
        value: '3',
        label: ls('logistikprojekt', 'logistics projects', 'projekty logistyczne'),
        subtext: ls('Lager och distribution', 'Warehouse and distribution', 'Magazyny i dystrybucja')
      },
      {
        value: '5',
        label: ls('min till E4', 'min to E4', 'min do E4'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Vingåker', 'Central Vingåker', 'Centrum Vingåker'),
        description: ls('Nära service och snabb access till motorvägarna.', 'Close to services and fast access to highways.', 'Blisko usług i szybki dostęp do autostrad.'),
        distance: ls('3 min till E4', '3 min to E4', '3 min do E4')
      },
      {
        name: ls('Söder', 'Söder', 'Söder'),
        description: ls('Lugnt område med parkering för lastbilar.', 'Quiet area with parking for trucks.', 'Spokojna okolica z parkingiem dla ciężarówek.'),
        distance: ls('7 min till logistikområdet', '7 min to logistics area', '7 min do obszaru logistycznego')
      },
      {
        name: ls('Norr', 'Norr', 'Norr'),
        description: ls('Villor med garage för arbetsfordon.', 'Houses with garages for work vehicles.', 'Domy z garażami dla pojazdów służbowych.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Logistikpark E4', 'E4 Logistics Park', 'Park logistyczny E4'),
        description: ls('Boende för lager- och kranförare vid nya terminaler.', 'Housing for warehouse workers and crane operators at new terminals.', 'Zakwaterowanie dla pracowników magazynowych i operatorów dźwigów przy nowych terminalach.')
      },
      {
        name: ls('Produktionsanläggningar', 'Production Facilities', 'Obiekty produkcyjne'),
        description: ls('Team nära monteringshallar och förråd.', 'Crews near assembly halls and storage.', 'Ekipy blisko hal montażowych i magazynów.')
      },
      {
        name: ls('Outlet-expansion', 'Outlet Expansion', 'Rozbudowa outlet'),
        description: ls('Långtidsboende för byggteam vid handelsområdet.', 'Long-term housing for construction crews at retail area.', 'Długoterminowe noclegi dla ekip budowlanych przy obszarze handlowym.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 6 kranförare och StayOnSite löste villor med 5 minuters körning till terminalen vid E4.',
        'We needed housing for 6 crane operators and StayOnSite arranged houses with a 5-minute drive to the terminal at E4.',
        'Potrzebowaliśmy noclegów dla 6 operatorów dźwigów i StayOnSite zorganizowało domy 5 minut jazdy do terminala przy E4.'
      ),
      author: 'Johan S.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Logistik & Distribution'
    },
    faq: [
      {
        question: ls('Kan ni hantera korta varsel?', 'Can you handle short notice?', 'Czy możecie obsłużyć krótkie terminy?'),
        answer: ls(
          'Ja, vi har beredskap och kan ordna boende inom 24 timmar för logistikprojekt.',
          'Yes, we are prepared and can arrange housing within 24 hours for logistics projects.',
          'Tak, jesteśmy przygotowani i możemy zorganizować noclegi w 24 godziny dla projektów logistycznych.'
        )
      },
      {
        question: ls('Finns det parkering för lastbilar?', 'Is there parking for trucks?', 'Czy jest parking dla ciężarówek?'),
        answer: ls(
          'Ja, våra villor har stora gårdar och uppställningsplatser för arbetsfordon.',
          'Yes, our houses have large yards and parking spaces for work vehicles.',
          'Tak, nasze domy mają duże podwórka i miejsca postojowe dla pojazdów służbowych.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städ och el/värme/wifi.',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi.',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi.'
        )
      }
    ],
    nearby: ['katrineholm', 'orebro']
  },
  {
    slug: 'vastervik',
    name: 'Västervik',
    region: 'Kalmar län',
    population: '38 000',
    description: 'Kuststad med skeppsvarv, hamn och turismindustri.',
    highlights: ['Skeppsvarv', 'Hamnutbyggnad', 'Marina projekt', 'Turism och service'],
    industries: ['Skeppsbyggnad', 'Hamn', 'Marin industri', 'Turism'],
    coordinates: [57.7584, 16.6374],
    heroHook: ls(
      'Företagsboende i Västervik – nära hamnen och skeppsvarven',
      'Corporate Housing in Västervik – Near the Harbour & Shipyards',
      'Zakwaterowanie Firmowe w Västervik – Blisko Portu i Stoczni'
    ),
    intro: ls(
      'Skeppsvarven och hamnutbyggnaden kräver specialistkompetens som ofta arbetar projektbaserat. Våra företagsboenden i Västervik och Gamleby ger era team nära till vattnet och arbetsplatserna.',
      'The shipyards and harbor expansion require specialist skills that often work project-based. Our corporate housing in Västervik and Gamleby puts your teams near the water and work sites.',
      'Stocznie i rozbudowa portu wymagają specjalistów często pracujących projektowo. Nasze noclegi firmowe w Västervik i Gamleby zapewniają ekipom bliskość wody i miejsca pracy.'
    ),
    keywords: lk(
      ['personalboende västervik', 'företagslägenheter skeppsvarv', 'byggboende hamn västervik', 'boende byggarbetare västervik', 'montörboende västervik', 'tillfälligt boende företag västervik'],
      ['corporate housing vastervik', 'shipyard staff apartments', 'harbor construction housing vastervik', 'worker accommodation vastervik sweden', 'temporary housing vastervik', 'construction crew accommodation vastervik'],
      ['zakwaterowanie pracownicze vastervik', 'mieszkania stoczniowe', 'noclegi portowe vastervik', 'noclegi dla budowlańców västervik szwecja', 'kwatery pracownicze västervik', 'tymczasowe zakwaterowanie västervik szwecja']
    ),
    metrics: [
      {
        value: '22',
        label: ls('platser nära hamnen', 'beds near harbor', 'miejsc blisko portu'),
        subtext: ls('Västervik och Gamleby', 'Västervik and Gamleby', 'Västervik i Gamleby')
      },
      {
        value: '5',
        label: ls('skeppsprojekt', 'ship projects', 'projekty stoczniowe'),
        subtext: ls('Varv och marina byggen', 'Yards and marine builds', 'Stocznie i budowy morskie')
      },
      {
        value: '8',
        label: ls('min till varvet', 'min to shipyard', 'min do stoczni'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Västervik', 'Central Västervik', 'Centrum Västervik'),
        description: ls('Nära hamnen och skeppsvarven med havsutsikt.', 'Close to harbor and shipyards with sea views.', 'Blisko portu i stoczni z widokiem na morze.'),
        distance: ls('5 min till varvet', '5 min to shipyard', '5 min do stoczni')
      },
      {
        name: ls('Gamleby', 'Gamleby', 'Gamleby'),
        description: ls('Lugnt område för längre uppdrag vid industrin.', 'Quiet area for longer deployments at industry.', 'Spokojna okolica na dłuższe kontrakty w przemyśle.'),
        distance: ls('18 min till Västervik', '18 min to Västervik', '18 min do Västervik')
      },
      {
        name: ls('Loftahammar', 'Loftahammar', 'Loftahammar'),
        description: ls('Kustvillor med parkering för servicebilar.', 'Coastal houses with parking for service vehicles.', 'Domy nadmorskie z parkingiem dla aut serwisowych.'),
        distance: ls('12 min till hamnen', '12 min to harbor', '12 min do portu')
      }
    ],
    projects: [
      {
        name: ls('Skeppsvarv Västervik', 'Västervik Shipyard', 'Stocznia Västervik'),
        description: ls('Boende för svetsteam och skeppsmontörer.', 'Housing for welding crews and ship fitters.', 'Zakwaterowanie dla spawaczy i monterów okrętowych.')
      },
      {
        name: ls('Hamnutbyggnad', 'Harbor Expansion', 'Rozbudowa portu'),
        description: ls('Team nära kajer och kranbyggnation.', 'Crews near quays and crane construction.', 'Ekipy blisko nabrzeży i budowy dźwigów.')
      },
      {
        name: ls('Marina projekt', 'Marina Projects', 'Projekty przystani'),
        description: ls('Långtidsboende för marin infrastruktur.', 'Long-term housing for marine infrastructure.', 'Długoterminowe noclegi dla infrastruktury morskiej.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 10 svetsteam vid varvet och StayOnSite ordnade lägenheter med havsutsikt 5 minuter från arbetet.',
        'We needed housing for 10 welding crews at the shipyard and StayOnSite arranged apartments with sea views 5 minutes from work.',
        'Potrzebowaliśmy noclegów dla 10 zespołów spawaczy w stoczni i StayOnSite zorganizowało mieszkania z widokiem na morze 5 minut od pracy.'
      ),
      author: 'Per A.',
      role: ls('Produktionschef', 'Production Manager', 'Kierownik produkcji'),
      company: 'Skeppsbyggnad'
    },
    faq: [
      {
        question: ls('Kan ni hantera projektbaserade team?', 'Can you handle project-based teams?', 'Czy możecie obsłużyć ekipy projektowe?'),
        answer: ls(
          'Ja, vi är vana vid flexibla kontrakt för skepps- och marinprojekt som varierar i längd.',
          'Yes, we are used to flexible contracts for ship and marine projects that vary in length.',
          'Tak, jesteśmy przyzwyczajeni do elastycznych umów dla projektów stoczniowych i morskich o zmiennej długości.'
        )
      },
      {
        question: ls('Hur nära varvet kan vi bo?', 'How close to the shipyard can we stay?', 'Jak blisko stoczni możemy mieszkać?'),
        answer: ls(
          'Vi har lägenheter med 5-8 minuters körning till skeppsvarven i Västervik.',
          'We have apartments with 5-8 minutes drive to the shipyards in Västervik.',
          'Mamy mieszkania 5-8 minut jazdy do stoczni w Västervik.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städ och el/värme/wifi.',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi.',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi.'
        )
      }
    ],
    nearby: ['kalmar', 'oskarshamn']
  },
  {
    slug: 'motala',
    name: 'Motala',
    region: 'Östergötlands län',
    population: '44 000',
    description: 'Industristad vid Vättern med verkstads- och tillverkningsindustri.',
    highlights: ['Verkstadsindustri', 'Kanalbyggnation', 'Marina projekt', 'Industriexpansion'],
    industries: ['Verkstad', 'Tillverkning', 'Marin teknik', 'Logistik'],
    coordinates: [58.5370, 15.0402],
    heroHook: ls(
      'Företagsboende i Motala – nära verkstadsindustrin och Göta kanal',
      'Corporate Housing in Motala – Near Engineering Industry & Göta Canal',
      'Zakwaterowanie Firmowe w Motala – Blisko Przemysłu i Kanału Göta'
    ),
    intro: ls(
      'Verkstadsindustrin och Göta kanal kräver boenden nära arbetsplatserna. Våra företagsboenden i Motala och Borensberg ger era team plats vid Vättern med kort resa till fabrikerna.',
      'The engineering industry and Göta Canal require housing near the workplaces. Our corporate housing in Motala and Borensberg puts your teams by Vättern with a short trip to the factories.',
      'Przemysł maszynowy i Kanał Göta wymagają noclegów blisko miejsca pracy. Nasze noclegi firmowe w Motala i Borensberg zapewniają ekipom miejsce nad Vättern z krótką drogą do fabryk.'
    ),
    keywords: lk(
      ['personalboende motala', 'företagslägenheter verkstad', 'byggboende kanal motala', 'boende byggarbetare motala', 'montörboende motala', 'tillfälligt boende företag motala'],
      ['corporate housing motala', 'workshop staff apartments', 'canal construction housing motala', 'worker accommodation motala sweden', 'temporary housing motala', 'construction crew accommodation motala'],
      ['zakwaterowanie pracownicze motala', 'mieszkania warsztatowe', 'noclegi kanałowe motala', 'noclegi dla budowlańców motala szwecja', 'kwatery pracownicze motala', 'tymczasowe zakwaterowanie motala szwecja']
    ),
    metrics: [
      {
        value: '28',
        label: ls('platser nära industrin', 'beds near industry', 'miejsc blisko przemysłu'),
        subtext: ls('Motala och Borensberg', 'Motala and Borensberg', 'Motala i Borensberg')
      },
      {
        value: '7',
        label: ls('verkstadsprojekt', 'workshop projects', 'projekty warsztatowe'),
        subtext: ls('Tillverkning och teknik', 'Manufacturing and tech', 'Produkcja i technika')
      },
      {
        value: '12',
        label: ls('min till fabrikerna', 'min to factories', 'min do fabryk'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Motala', 'Central Motala', 'Centrum Motala'),
        description: ls('Nära verkstäderna och Göta kanal.', 'Close to workshops and Göta Canal.', 'Blisko warsztatów i Kanału Göta.'),
        distance: ls('8 min till industrin', '8 min to industry', '8 min do przemysłu')
      },
      {
        name: ls('Borensberg', 'Borensberg', 'Borensberg'),
        description: ls('Lugnt vid kanalen för längre uppdrag.', 'Quiet by the canal for longer deployments.', 'Spokojnie przy kanale na dłuższe kontrakty.'),
        distance: ls('15 min till Motala', '15 min to Motala', '15 min do Motala')
      },
      {
        name: ls('Varamon', 'Varamon', 'Varamon'),
        description: ls('Villor med parkering för servicefordon.', 'Houses with parking for service vehicles.', 'Domy z parkingiem dla pojazdów serwisowych.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Verkstadsindustri', 'Engineering Industry', 'Przemysł maszynowy'),
        description: ls('Boende för monteringsteam vid nya produktionshallar.', 'Housing for assembly crews at new production halls.', 'Zakwaterowanie dla ekip montażowych przy nowych halach produkcyjnych.')
      },
      {
        name: ls('Göta kanal projekt', 'Göta Canal Projects', 'Projekty Kanału Göta'),
        description: ls('Team nära slussbyggnation och underhåll.', 'Crews near lock construction and maintenance.', 'Ekipy przy budowie śluz i konserwacji.')
      },
      {
        name: ls('Marina anläggningar', 'Marine Facilities', 'Obiekty morskie'),
        description: ls('Långtidsboende för marin teknisk personal.', 'Long-term housing for marine technical staff.', 'Długoterminowe noclegi dla personelu technicznego morskiego.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 12 svetsare vid verkstaden och StayOnSite löste radhus i Borensberg med 15 minuters resa till fabriken.',
        'We needed housing for 12 welders at the workshop and StayOnSite arranged townhouses in Borensberg with a 15-minute drive to the factory.',
        'Potrzebowaliśmy noclegów dla 12 spawaczy w warsztacie i StayOnSite zorganizowało szeregowce w Borensberg – 15 minut jazdy do fabryki.'
      ),
      author: 'Karin N.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Verkstadsindustri'
    },
    faq: [
      {
        question: ls('Kan ni kombinera Motala och Linköping?', 'Can you combine Motala and Linköping?', 'Czy możecie połączyć Motala i Linköping?'),
        answer: ls(
          'Ja, vi planerar boenden i båda städerna med samma kontakt för smidiga rotationer.',
          'Yes, we plan housing in both cities with the same contact for smooth rotations.',
          'Tak, planujemy noclegi w obu miastach z tym samym opiekunem dla płynnych rotacji.'
        )
      },
      {
        question: ls('Finns det boende vid kanalen?', 'Is there housing by the canal?', 'Czy są noclegi przy kanale?'),
        answer: ls(
          'Ja, vi har lägenheter i Borensberg nära Göta kanal med vattenutsikt.',
          'Yes, we have apartments in Borensberg near Göta Canal with water views.',
          'Tak, mamy mieszkania w Borensberg blisko Kanału Göta z widokiem na wodę.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städ och el/värme/wifi.',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi.',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi.'
        )
      }
    ],
    nearby: ['linkoping', 'orebro']
  },
  {
    slug: 'lulea',
    name: 'Luleå',
    region: 'Norrbottens län',
    population: '78 000',
    description: 'Norrlands största stad med gruvindustri, datacenter och hamnexpansion.',
    highlights: ['Gruvindustri', 'Datacenterbyggen', 'Hamnutbyggnad', 'Tech-industri'],
    industries: ['Gruvdrift', 'Datacenter', 'Hamn & Logistik', 'Teknologi'],
    coordinates: [65.5848, 22.1547],
    heroHook: ls(
      'Boende & Personalboende i Luleå – nära datacenter och gruvnäring',
      'Accommodation & Worker Housing in Luleå – Near Data Centers & Mining',
      'Noclegi & Zakwaterowanie Pracownicze w Luleå – Blisko Centrów Danych i Kopalni'
    ),
    intro: ls(
      'Gruvindustrin, datacenter och hamnen gör Luleå till en av Sveriges mest expansiva städer. Vårt korttidsboende och företagslägenheter i Luleå och Porsön ger era team norrlänsk komfort nära arbetsplatserna.',
      'The mining industry, data centers and harbor make Luleå one of Sweden\'s most expansive cities. Our short-term housing and corporate apartments in Luleå and Porsön give your teams northern comfort near the workplaces.',
      'Przemysł wydobywczy, centra danych i port czynią Luleå jednym z najbardziej rozwijających się miast Szwecji. Nasze noclegi krótkoterminowe i mieszkania firmowe w Luleå i Porsön zapewniają ekipom północny komfort blisko pracy.'
    ),
    keywords: lk(
      ['personalboende luleå', 'företagslägenheter datacenter', 'boende luleå', 'hyra lägenhet luleå', 'korttidsboende luleå', 'boende byggarbetare luleå', 'montörboende luleå', 'tillfälligt boende företag luleå'],
      ['corporate housing lulea', 'datacenter staff apartments', 'mining construction housing lulea', 'worker accommodation lulea sweden', 'temporary housing lulea', 'apartments lulea sweden'],
      ['zakwaterowanie pracownicze lulea', 'mieszkania datacenter', 'noclegi kopalnie lulea', 'noclegi dla budowlańców luleå szwecja', 'kwatery pracownicze luleå', 'tymczasowe zakwaterowanie luleå szwecja']
    ),
    metrics: [
      {
        value: '85',
        label: ls('platser i Luleå', 'beds in Luleå', 'miejsc w Luleå'),
        subtext: ls('Centrum, Porsön, Hertsön', 'Downtown, Porsön, Hertsön', 'Centrum, Porsön, Hertsön')
      },
      {
        value: '12',
        label: ls('datacenterbyggen', 'data center projects', 'projekty datacenter'),
        subtext: ls('Facebook och nya anläggningar', 'Facebook and new facilities', 'Facebook i nowe obiekty')
      },
      {
        value: '18',
        label: ls('min till hamnen', 'min to harbor', 'min do portu'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Luleå', 'Central Luleå', 'Centrum Luleå'),
        description: ls('Nära universitet och tech-företagen.', 'Close to university and tech companies.', 'Blisko uniwersytetu i firm technologicznych.'),
        distance: ls('10 min till datacenter', '10 min to data centers', '10 min do datacenter')
      },
      {
        name: ls('Porsön', 'Porsön', 'Porsön'),
        description: ls('Modernt område nära hamnen och industrin.', 'Modern area near harbor and industry.', 'Nowoczesny obszar blisko portu i przemysłu.'),
        distance: ls('8 min till hamnen', '8 min to harbor', '8 min do portu')
      },
      {
        name: ls('Hertsön', 'Hertsön', 'Hertsön'),
        description: ls('Lugnt med parkering för arbetsfordon.', 'Quiet with parking for work vehicles.', 'Spokojnie z parkingiem dla pojazdów służbowych.'),
        distance: ls('15 min till centrum', '15 min to downtown', '15 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Datacenter Luleå', 'Luleå Data Centers', 'Centra danych Luleå'),
        description: ls('Boende för el- och kyltekniker vid Facebook och nya anläggningar.', 'Housing for electrical and cooling technicians at Facebook and new facilities.', 'Zakwaterowanie dla elektryków i techników chłodzenia przy Facebook i nowych obiektach.')
      },
      {
        name: ls('Gruvindustriprojekt', 'Mining Industry Projects', 'Projekty górnicze'),
        description: ls('Team nära Kiruna och Malmfälten med boende i Luleå.', 'Crews near Kiruna and the Mining District with housing in Luleå.', 'Ekipy blisko Kiruny i Okręgu Górniczego z noclegami w Luleå.')
      },
      {
        name: ls('Hamnutbyggnad', 'Harbor Expansion', 'Rozbudowa portu'),
        description: ls('Långtidsboende för hamn- och kranmontörer.', 'Long-term housing for harbor and crane fitters.', 'Długoterminowe noclegi dla monterów portowych i dźwigów.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde plats för 20 tekniker vid datacenterbygget och StayOnSite löste lägenheter i Porsön med 10 minuters resa till anläggningen.',
        'We needed housing for 20 technicians at the data center build and StayOnSite arranged apartments in Porsön with a 10-minute drive to the facility.',
        'Potrzebowaliśmy noclegów dla 20 techników przy budowie datacenter i StayOnSite zorganizowało mieszkania w Porsön – 10 minut jazdy do obiektu.'
      ),
      author: 'Emma L.',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Tech & Datacenter'
    },
    faq: [
      {
        question: ls('Kan ni hantera stora team för datacenter?', 'Can you handle large teams for data centers?', 'Czy możecie obsłużyć duże ekipy dla datacenter?'),
        answer: ls(
          'Ja, vi har 85+ platser och kan skala upp för stora tech-projekt i Luleå.',
          'Yes, we have 85+ beds and can scale up for large tech projects in Luleå.',
          'Tak, mamy 85+ miejsc i możemy skalować dla dużych projektów technologicznych w Luleå.'
        )
      },
      {
        question: ls('Hur funkar boende vid gruvor utanför stan?', 'How does housing work for mines outside town?', 'Jak działa zakwaterowanie przy kopalniach poza miastem?'),
        answer: ls(
          'Vi ordnar boende i Luleå med pendling eller kombinerar med lokala boenden vid gruvorna.',
          'We arrange housing in Luleå with commuting or combine with local housing at the mines.',
          'Organizujemy noclegi w Luleå z dojazdami lub łączymy z lokalnymi noclegami przy kopalniach.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städning och el/värme/wifi – allt ingår i priset.',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi – everything included in the price.',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi – wszystko w cenie.'
        )
      }
    ],
    nearby: ['boden', 'pitea']
  },
  {
    slug: 'oskarshamn',
    name: 'Oskarshamn',
    region: 'Kalmar län',
    population: '27 000',
    description: 'Kärnkrafts- och industristad med hamn vid Östersjön.',
    highlights: ['Kärnkraftverk', 'Hamnutbyggnad', 'Industrianläggningar', 'Energiprojekt'],
    industries: ['Kärnkraft', 'Energi', 'Hamn & Logistik', 'Industri'],
    coordinates: [57.2644, 16.4486],
    heroHook: ls(
      'Boende & Personalboende i Oskarshamn – nära OKG och hamnen',
      'Accommodation & Worker Housing in Oskarshamn – Near OKG & the Harbour',
      'Noclegi & Zakwaterowanie Pracownicze w Oskarshamn – Blisko OKG i Portu'
    ),
    intro: ls(
      'OKG och hamnutbyggnaden skapar stort behov av boende i Oskarshamn. Våra företagslägenheter och villor i Oskarshamn och Figeholm ligger nära arbetsplatserna.',
      'OKG and the harbor expansion create a big need for accommodation in Oskarshamn. Our corporate apartments and houses in Oskarshamn and Figeholm sit near the work sites.',
      'OKG i rozbudowa portu tworzą duże zapotrzebowanie na noclegi w Oskarshamn. Nasze mieszkania firmowe i domy w Oskarshamn i Figeholm znajdują się blisko miejsc pracy.'
    ),
    keywords: lk(
      ['personalboende oskarshamn', 'företagslägenheter kärnkraft', 'boende oskarshamn', 'boende i oskarshamn', 'byggboende okg oskarshamn', 'boende byggarbetare oskarshamn', 'montörboende oskarshamn', 'tillfälligt boende företag oskarshamn'],
      ['corporate housing oskarshamn', 'nuclear power staff apartments', 'accommodation oskarshamn', 'okg construction housing oskarshamn', 'worker accommodation oskarshamn sweden', 'temporary housing oskarshamn'],
      ['zakwaterowanie pracownicze oskarshamn', 'mieszkania energetyka jądrowa', 'noclegi okg oskarshamn', 'noclegi dla budowlańców oskarshamn szwecja', 'kwatery pracownicze oskarshamn', 'tymczasowe zakwaterowanie oskarshamn szwecja']
    ),
    metrics: [
      {
        value: '35',
        label: ls('platser nära OKG', 'beds near OKG', 'miejsc blisko OKG'),
        subtext: ls('Nära kärnkraftverket', 'Close to the power plant', 'Blisko elektrowni')
      },
      {
        value: '8',
        label: ls('energiprojekt', 'energy projects', 'projekty energetyczne'),
        subtext: ls('Kärnkraft och infrastruktur', 'Nuclear and infrastructure', 'Jądrowa i infrastruktura')
      },
      {
        value: '15',
        label: ls('min till kärnkraftverket', 'min to nuclear plant', 'min do elektrowni'),
        subtext: ls('Från våra boenden', 'From our housing', 'Z naszych noclegów')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Oskarshamn', 'Central Oskarshamn', 'Centrum Oskarshamn'),
        description: ls('Nära hamnen och service med bra kommunikationer.', 'Close to harbor and services with good transit.', 'Blisko portu i usług z dobrą komunikacją.'),
        distance: ls('12 min till OKG', '12 min to OKG', '12 min do OKG')
      },
      {
        name: ls('Figeholm', 'Figeholm', 'Figeholm'),
        description: ls('Kustsamhälle nära kärnkraftverket.', 'Coastal community near the nuclear plant.', 'Nadmorska miejscowość blisko elektrowni.'),
        distance: ls('5 min till OKG', '5 min to OKG', '5 min do OKG')
      },
      {
        name: ls('Kristineberg', 'Kristineberg', 'Kristineberg'),
        description: ls('Lugnt område för längre uppdrag vid industrin.', 'Quiet area for longer deployments at industry.', 'Spokojna okolica na dłuższe kontrakty w przemyśle.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('OKG Kärnkraftverk', 'OKG Nuclear Power Plant', 'Elektrownia jądrowa OKG'),
        description: ls('Boende för tekniker och ingenjörer vid kärnkraftverket.', 'Housing for technicians and engineers at the nuclear power plant.', 'Zakwaterowanie dla techników i inżynierów przy elektrowni jądrowej.')
      },
      {
        name: ls('Hamnutbyggnad', 'Harbor Expansion', 'Rozbudowa portu'),
        description: ls('Team nära kajer och terminal för stora transporter.', 'Crews near quays and terminal for heavy transport.', 'Ekipy blisko nabrzeży i terminala dla ciężkiego transportu.')
      },
      {
        name: ls('Industrianläggningar', 'Industrial Facilities', 'Obiekty przemysłowe'),
        description: ls('Långtidsboende för underhålls- och produktionsteam.', 'Long-term housing for maintenance and production crews.', 'Długoterminowe noclegi dla ekip serwisowych i produkcyjnych.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde boende för 15 tekniker nära OKG och StayOnSite ordnade lägenheter i Figeholm med bara 5 minuters resa till anläggningen.',
        'We needed housing for 15 technicians near OKG and StayOnSite arranged apartments in Figeholm with just a 5-minute drive to the facility.',
        'Potrzebowaliśmy noclegów dla 15 techników blisko OKG i StayOnSite zorganizowało mieszkania w Figeholm – zaledwie 5 minut jazdy do obiektu.'
      ),
      author: 'Stefan K.',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Kärnkraft & Energi'
    },
    faq: [
      {
        question: ls('Hur funkar säkerheten vid kärnkraftverket?', 'How does security work at the nuclear plant?', 'Jak działa bezpieczeństwo przy elektrowni?'),
        answer: ls(
          'Vi är vana vid att ordna boende åt team som jobbar vid OKG och anpassar oss efter era krav.',
          'We are experienced arranging housing for teams working at OKG and adapt to your requirements.',
          'Mamy doświadczenie w organizacji noclegów dla zespołów pracujących przy OKG i dostosowujemy się do Waszych wymagań.'
        )
      },
      {
        question: ls('Kan ni hantera specialkompetens?', 'Can you handle specialist skills?', 'Czy możecie obsłużyć specjalistów?'),
        answer: ls(
          'Ja, vi är vana vid att arbeta med tekniker och ingenjörer som kräver särskilda boenden och säkerhet.',
          'Yes, we are used to working with technicians and engineers requiring special housing and security.',
          'Tak, jesteśmy przyzwyczajeni do pracy z technikami i inżynierami wymagającymi specjalnych noclegów i bezpieczeństwa.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included in the housing?', 'Co jest wliczone w nocleg?'),
        answer: ls(
          'Fullt möblerat med kök, sängkläder, städ och el/värme/wifi. Alla säkerhetskrav uppfyllda.',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi. All security requirements met.',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi. Wszystkie wymogi bezpieczeństwa spełnione.'
        )
      }
    ],
    nearby: ['vastervik', 'kalmar']
  },
  {
    slug: 'umea',
    name: 'Umeå',
    region: 'Västerbottens län',
    population: '130 000',
    description: 'Norrlands huvudstad med universitet, sjukhus och växande industri.',
    highlights: ['Norrlands Universitetssjukhus', 'Umeå Universitet', 'Norrbotniabanan', 'Komatsu Forest'],
    industries: ['Vård', 'Utbildning', 'Industri', 'Infrastruktur'],
    coordinates: [63.8258, 20.2630],
    heroHook: ls(
      'Boende & Personalboende i Umeå – nära sjukhuset och Norrbotniabanan',
      'Accommodation & Worker Housing in Umeå – Near the Hospital & Norrbotniabanan',
      'Noclegi & Zakwaterowanie Pracownicze w Umeå – Blisko Szpitala i Norrbotniabanan'
    ),
    intro: ls(
      'Norrlands universitetssjukhus och industrin i Umeå driver stora projekt som kräver boende för projektpersonal. Våra företagslägenheter och hus på Ersboda, Teg och Mariehem ger era team bekvämt boende nära arbetsplatserna.',
      'Norrlands University Hospital and the industry in Umeå drive large projects requiring accommodation for project staff. Our corporate apartments and houses in Ersboda, Teg and Mariehem give your teams comfortable housing near the workplaces.',
      'Szpital Uniwersytecki Norrlands i przemysł w Umeå napędzają duże projekty wymagające noclegów dla personelu projektowego. Nasze mieszkania firmowe i domy na Ersboda, Teg i Mariehem zapewniają ekipom wygodne zakwaterowanie blisko pracy.'
    ),
    keywords: lk(
      ['personalboende umeå', 'företagslägenheter sjukhus', 'byggboende norrbotniabanan', 'boende byggarbetare umeå', 'montörboende umeå', 'tillfälligt boende företag umeå', 'boende umeå'],
      ['corporate housing umea', 'hospital staff apartments', 'norrbotniabanan construction housing', 'worker accommodation umea sweden', 'temporary housing umea', 'construction crew accommodation umea'],
      ['zakwaterowanie pracownicze umea', 'mieszkania szpitalne', 'noclegi norrbotniabanan', 'noclegi dla budowlańców umeå szwecja', 'kwatery pracownicze umeå', 'tymczasowe zakwaterowanie umeå szwecja']
    ),
    metrics: [
      {
        value: '40',
        label: ls('platser nära sjukhuset', 'beds near hospital', 'miejsc blisko szpitala'),
        subtext: ls('Mariehem och Ålidhem', 'Mariehem and Ålidhem', 'Mariehem i Ålidhem')
      },
      {
        value: '6',
        label: ls('industriprojekt', 'industry projects', 'projekty przemysłowe'),
        subtext: ls('Västerslätt och hamnen', 'Västerslätt and harbor', 'Västerslätt i port')
      },
      {
        value: '10',
        label: ls('min till city', 'min to downtown', 'min do centrum'),
        subtext: ls('Från våra områden', 'From our areas', 'Z naszych dzielnic')
      }
    ],
    neighborhoods: [
      {
        name: ls('Ersboda', 'Ersboda', 'Ersboda'),
        description: ls('Nära handelsområden och industri.', 'Close to retail areas and industry.', 'Blisko handlu i przemysłu.'),
        distance: ls('8 min till centrum', '8 min to downtown', '8 min do centrum')
      },
      {
        name: ls('Teg', 'Teg', 'Teg'),
        description: ls('Södra sidan älven, nära flygplatsen.', 'South side of river, near airport.', 'Południowa strona rzeki, blisko lotniska.'),
        distance: ls('5 min till flyget', '5 min to airport', '5 min do lotniska')
      },
      {
        name: ls('Mariehem', 'Mariehem', 'Mariehem'),
        description: ls('Nära sjukhuset och universitetet.', 'Close to hospital and university.', 'Blisko szpitala i uniwersytetu.'),
        distance: ls('Gångavstånd till NUS', 'Walking distance to NUS', 'Spacer do NUS')
      }
    ],
    projects: [
      {
        name: ls('Norrlands Universitetssjukhus', 'University Hospital', 'Szpital Uniwersytecki'),
        description: ls('Boende för vårdpersonal och byggteam vid utbyggnader.', 'Housing for healthcare staff and construction crews at expansions.', 'Noclegi dla personelu medycznego i ekip budowlanych przy rozbudowie.')
      },
      {
        name: ls('Norrbotniabanan', 'North Botnia Line', 'Linia Norrbotniabanan'),
        description: ls('Team nära järnvägsutbyggnaden.', 'Crews near railway expansion.', 'Ekipy blisko rozbudowy kolei.')
      },
      {
        name: ls('Komatsu Forest', 'Komatsu Forest', 'Komatsu Forest'),
        description: ls('Boende för installatörer vid fabriken.', 'Housing for installers at the factory.', 'Noclegi dla instalatorów w fabryce.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde boende för 8 personer vid sjukhusbygget och StayOnSite fixade lägenheter på Mariehem direkt.',
        'We needed housing for 8 people at the hospital build and StayOnSite sorted apartments in Mariehem immediately.',
        'Potrzebowaliśmy noclegów dla 8 osób przy budowie szpitala i StayOnSite załatwiło mieszkania na Mariehem od ręki.'
      ),
      author: 'Klara W.',
      role: ls('HR-ansvarig', 'HR Manager', 'Kierownik HR'),
      company: 'Vårdbyggarna'
    },
    faq: [
      {
        question: ls('Hur nära sjukhuset kan vi bo?', 'How close to the hospital can we stay?', 'Jak blisko szpitala możemy mieszkać?'),
        answer: ls(
          'Vi har lägenheter på Mariehem och Ålidhem, ca 5-10 minuters promenad från sjukhuset.',
          'We have apartments in Mariehem and Ålidhem, about 5-10 minutes walk from the hospital.',
          'Mamy mieszkania na Mariehem i Ålidhem, ok. 5-10 minut spacerem od szpitala.'
        )
      },
      {
        question: ls('Har ni parkering på Teg?', 'Do you have parking in Teg?', 'Czy macie parking na Teg?'),
        answer: ls(
          'Ja, våra villor på Teg har egna uppfarter med plats för flera bilar.',
          'Yes, our houses in Teg have private driveways with space for multiple cars.',
          'Tak, nasze domy na Teg mają prywatne podjazdy z miejscem na kilka aut.'
        )
      },
      {
        question: ls('Vad ingår?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['skelleftea', 'lulea', 'ornskoldsvik']
  },
  {
    slug: 'skelleftea',
    name: 'Skellefteå',
    region: 'Västerbottens län',
    population: '36 000',
    description: 'Snabbväxande industristad med Europas största batterifabrik och massiv byggnation.',
    highlights: ['Batterifabrik & industri', 'Stadsomvandling', 'Datacenterprojekt', 'Infrastrukturutbyggnad'],
    industries: ['Batteriindustri', 'Bygg & Anläggning', 'Gruvnäring', 'Datacenter'],
    coordinates: [64.7507, 20.9528],
    heroHook: ls(
      'Boende & Personalboende i Skellefteå – nära industrin och stadsprojekten',
      'Accommodation & Worker Housing in Skellefteå – Near Industry & City Projects',
      'Noclegi & Zakwaterowanie Pracownicze w Skellefteå – Blisko Przemysłu i Projektów'
    ),
    intro: ls(
      'Batteriindustri, nya bostadsområden och infrastrukturutbyggnader gör Skellefteå till en av Sveriges snabbast växande industristäder. Vi ordnar företagsboenden och korttidsboende för byggteam, montörer och produktionspersonal — nära fabrikerna.',
      'Battery industry, new residential areas and infrastructure projects make Skellefteå one of Sweden\'s fastest growing industrial cities. We arrange corporate housing and short-term accommodation for construction crews, fitters and production staff — close to the factories.',
      'Przemysł bateryjny, nowe osiedla i projekty infrastrukturalne czynią Skellefteå jednym z najszybciej rozwijających się miast przemysłowych Szwecji. Organizujemy zakwaterowanie firmowe i krótkoterminowe noclegi dla ekip budowlanych i produkcyjnych — blisko fabryk.'
    ),
    keywords: lk(
      ['personalboende skellefteå', 'boende skellefteå', 'företagslägenheter skellefteå', 'byggboende skellefteå', 'korttidsboende skellefteå', 'montörboende skellefteå', 'tillfälligt boende skellefteå', 'lägenhetshotell skellefteå'],
      ['corporate housing skelleftea', 'worker accommodation skelleftea', 'construction housing skelleftea', 'temporary housing skelleftea sweden', 'short term rentals skelleftea', 'staff apartments skelleftea'],
      ['zakwaterowanie pracownicze skellefteå', 'noclegi firmowe skellefteå', 'mieszkania firmowe skellefteå', 'noclegi dla budowlańców skellefteå szwecja', 'kwatery pracownicze skellefteå', 'tymczasowe zakwaterowanie skellefteå']
    ),
    metrics: [
      {
        value: '40+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centralt och nära industrin', 'Central and near industry', 'Centrum i blisko przemysłu')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '8',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Batteri, bostäder, datacenter', 'Battery, housing, data centers', 'Baterie, mieszkania, centra danych')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Skellefteå', 'Central Skellefteå', 'Centrum Skellefteå'),
        description: ls('Nära service, restauranger och kollektivtrafik.', 'Close to services, restaurants and public transport.', 'Blisko usług, restauracji i komunikacji miejskiej.'),
        distance: ls('15 min till industriområdet', '15 min to industrial area', '15 min do strefy przemysłowej')
      },
      {
        name: ls('Hedensbyn', 'Hedensbyn', 'Hedensbyn'),
        description: ls('Industriområde nära batterifabriken.', 'Industrial area close to the battery factory.', 'Strefa przemysłowa blisko fabryki baterii.'),
        distance: ls('5 min till fabriken', '5 min to factory', '5 min do fabryki')
      },
      {
        name: ls('Moröhöjden', 'Moröhöjden', 'Moröhöjden'),
        description: ls('Lugnt bostadsområde med goda kommunikationer.', 'Quiet residential area with good connections.', 'Spokojna dzielnica z dobrym dojazdem.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Batterifabriken', 'Battery Factory', 'Fabryka Baterii'),
        description: ls('Boende för bygg- och produktionspersonal vid batterifabriken i Hedensbyn.', 'Housing for construction and production staff at the battery factory in Hedensbyn.', 'Noclegi dla ekip budowlanych i produkcyjnych przy fabryce baterii w Hedensbyn.')
      },
      {
        name: ls('Stadsomvandling Skellefteå', 'City Transformation Skellefteå', 'Transformacja Miasta Skellefteå'),
        description: ls('Nya bostadskvarter och infrastruktur i takt med befolkningsökningen.', 'New residential blocks and infrastructure matching the population growth.', 'Nowe kwartały mieszkalne i infrastruktura w związku ze wzrostem populacji.')
      },
      {
        name: ls('Sara Kulturhus', 'Sara Cultural Centre', 'Centrum Kultury Sara'),
        description: ls('Trähuset i centrum — team för underhåll och omgivande byggnation.', 'The wooden landmark downtown — crews for maintenance and surrounding construction.', 'Drewniany budynek w centrum — ekipy konserwacyjne i budowlane.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi fick boende för 12 montörer i Skellefteå på under två dagar. Lägenheter med fullt kök — personalen kunde äntligen slippa hotellmiddagar.',
        'We got housing for 12 fitters in Skellefteå in under two days. Apartments with full kitchens — staff could finally skip hotel dinners.',
        'Dostaliśmy noclegi dla 12 monterów w Skellefteå w mniej niż dwa dni. Mieszkania z pełną kuchnią — personel mógł wreszcie zrezygnować z hotelowych obiadów.'
      ),
      author: 'Erik S.',
      role: ls('Platschef', 'Site Manager', 'Kierownik budowy'),
      company: 'Indutek'
    },
    faq: [
      {
        question: ls('Hur nära industriområdet kan vi bo?', 'How close to the industrial area can we stay?', 'Jak blisko strefy przemysłowej możemy mieszkać?'),
        answer: ls(
          'Vi har boenden med 5-15 minuters körning till industriområdena i Hedensbyn, beroende på område.',
          'We have housing 5-15 minutes drive to the Hedensbyn industrial areas, depending on location.',
          'Mamy noclegi 5-15 minut jazdy do stref przemysłowych w Hedensbyn, w zależności od lokalizacji.'
        )
      },
      {
        question: ls('Kan ni ta emot stora grupper?', 'Can you accommodate large groups?', 'Czy możecie przyjąć duże grupy?'),
        answer: ls(
          'Ja, vi hanterar grupper upp till 30+ personer med en blandning av lägenheter och villor.',
          'Yes, we handle groups of up to 30+ people with a mix of apartments and houses.',
          'Tak, obsługujemy grupy do 30+ osób, łącząc mieszkania i domy.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['umea', 'lulea']
  },
  {
    slug: 'karlstad',
    name: 'Karlstad',
    region: 'Värmlands län',
    population: '95 000',
    description: 'Värmlands huvudort med stark industri, servicenäring och infrastrukturprojekt.',
    highlights: ['Industri och logistik', 'Sjukhusutbyggnad', 'E18-korridoren', 'Universitetsstad'],
    industries: ['Pappersindustri', 'Försäkring & IT', 'Bygg & Anläggning', 'Logistik'],
    coordinates: [59.3793, 13.5036],
    heroHook: ls(
      'Boende & Personalboende i Karlstad – vid E18 och Värmlands industrier',
      'Accommodation & Worker Housing in Karlstad – By E18 & Värmland Industry',
      'Noclegi & Zakwaterowanie Pracownicze w Karlstad – Przy E18 i Przemyśle'
    ),
    intro: ls(
      'Pappersindustri, sjukhusutbyggnader och E18-korridoren skapar ständigt behov av personalboende i Karlstad. Vi ordnar företagsboenden nära industriområdena och centrala Karlstad — flexibla avtal, fullt möblerat.',
      'Paper industry, hospital expansions and the E18 corridor create ongoing demand for worker housing in Karlstad. We arrange corporate accommodation near industrial areas and central Karlstad — flexible contracts, fully furnished.',
      'Przemysł papierniczy, rozbudowa szpitala i korytarz E18 tworzą stałe zapotrzebowanie na zakwaterowanie pracownicze w Karlstad. Organizujemy noclegi firmowe blisko stref przemysłowych i centrum — elastyczne umowy, pełne wyposażenie.'
    ),
    keywords: lk(
      ['personalboende karlstad', 'karlstad boende', 'företagslägenheter karlstad', 'byggboende karlstad', 'korttidsboende karlstad', 'montörboende karlstad', 'tillfälligt boende karlstad', 'boende i karlstad'],
      ['corporate housing karlstad', 'worker accommodation karlstad', 'construction housing karlstad', 'temporary housing karlstad sweden', 'short term rentals karlstad', 'staff apartments karlstad'],
      ['zakwaterowanie pracownicze karlstad', 'mieszkania firmowe karlstad', 'noclegi dla budowlańców karlstad szwecja', 'kwatery pracownicze karlstad', 'tymczasowe zakwaterowanie karlstad', 'noclegi firmowe karlstad']
    ),
    metrics: [
      {
        value: '25+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centrum och industriområden', 'Central and industrial areas', 'Centrum i strefy przemysłowe')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '6',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Industri, sjukhus, infrastruktur', 'Industry, hospital, infrastructure', 'Przemysł, szpital, infrastruktura')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Karlstad', 'Central Karlstad', 'Centrum Karlstad'),
        description: ls('Nära service, restauranger och kollektivtrafik.', 'Close to services, restaurants and public transport.', 'Blisko usług, restauracji i komunikacji.'),
        distance: ls('10 min till industriområden', '10 min to industrial areas', '10 min do stref przemysłowych')
      },
      {
        name: ls('Välsviken', 'Välsviken', 'Välsviken'),
        description: ls('Handels- och industriområde med goda kommunikationer.', 'Commercial and industrial area with good connections.', 'Strefa handlowa i przemysłowa z dobrym dojazdem.'),
        distance: ls('5 min till E18', '5 min to E18', '5 min do E18')
      },
      {
        name: ls('Zachariasberg', 'Zachariasberg', 'Zachariasberg'),
        description: ls('Lugnt bostadsområde nära sjukhuset.', 'Quiet residential area near the hospital.', 'Spokojna dzielnica blisko szpitala.'),
        distance: ls('Gångavstånd till CSK', 'Walking distance to CSK', 'Spacer do CSK')
      }
    ],
    projects: [
      {
        name: ls('Centralsjukhuset Karlstad', 'Karlstad Central Hospital', 'Szpital Centralny Karlstad'),
        description: ls('Boende för vårdpersonal och byggteam vid sjukhusutbyggnaden.', 'Housing for healthcare staff and construction crews at the hospital expansion.', 'Noclegi dla personelu medycznego i ekip budowlanych przy rozbudowie szpitala.')
      },
      {
        name: ls('E18-korridoren', 'E18 Corridor', 'Korytarz E18'),
        description: ls('Team nära infrastrukturprojekt längs E18.', 'Crews near infrastructure projects along E18.', 'Ekipy blisko projektów infrastrukturalnych wzdłuż E18.')
      },
      {
        name: ls('Pappersindustri Gruvön', 'Paper Industry Gruvön', 'Przemysł Papierniczy Gruvön'),
        description: ls('Underhålls- och installationspersonal vid BillerudKorsnäs.', 'Maintenance and installation staff at BillerudKorsnäs.', 'Personel konserwacyjny i instalacyjny w BillerudKorsnäs.')
      }
    ],
    testimonial: {
      quote: ls(
        'StayOnSite ordnade lägenheter för vårt team på 10 personer under sjukhusrenoveringen. Centralt, möblerat och smidig hantering.',
        'StayOnSite arranged apartments for our 10-person team during the hospital renovation. Central, furnished and smooth handling.',
        'StayOnSite zorganizowało mieszkania dla naszego 10-osobowego zespołu podczas remontu szpitala. Centralne, umeblowane i sprawna obsługa.'
      ),
      author: 'Anna K.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Sjukhusbyggarna'
    },
    faq: [
      {
        question: ls('Hur nära industriområdena kan vi bo?', 'How close to the industrial areas can we stay?', 'Jak blisko stref przemysłowych możemy mieszkać?'),
        answer: ls(
          'Vi har boenden med 5-15 minuters körning till Välsviken, Lamberget och andra industriområden.',
          'We have housing 5-15 minutes drive to Välsviken, Lamberget and other industrial areas.',
          'Mamy noclegi 5-15 minut jazdy do Välsviken, Lamberget i innych stref przemysłowych.'
        )
      },
      {
        question: ls('Hur lång uppsägningstid har ni?', 'What is the notice period?', 'Jaki jest okres wypowiedzenia?'),
        answer: ls(
          'Vi erbjuder flexibla avtal — ofta 1 månads uppsägning, men kan anpassas efter projektbehov.',
          'We offer flexible contracts — usually 1 month notice, but can be adjusted to project needs.',
          'Oferujemy elastyczne umowy — zwykle 1 miesiąc wypowiedzenia, ale dostosowujemy do potrzeb projektu.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['saffle', 'orebro', 'ludvika']
  },
  {
    slug: 'ostersund',
    name: 'Östersund',
    region: 'Jämtlands län',
    population: '64 000',
    description: 'Jämtlands huvudort med militärbas, sjukhusutbyggnad och infrastrukturprojekt.',
    highlights: ['Försvarsmakten/A4', 'Östersunds sjukhus', 'Infrastrukturprojekt', 'Vinteridrott'],
    industries: ['Försvar', 'Vård & Omsorg', 'Bygg & Anläggning', 'Turism'],
    coordinates: [63.1792, 14.6357],
    heroHook: ls(
      'Boende & Personalboende i Östersund – nära försvaret och sjukhuset',
      'Accommodation & Worker Housing in Östersund – Near Defence & Hospital',
      'Noclegi & Zakwaterowanie Pracownicze w Östersund – Blisko Wojska i Szpitala'
    ),
    intro: ls(
      'Försvarsmakten, sjukhusutbyggnaden och infrastrukturprojekt i Östersund kräver flexibelt personalboende. Vi ordnar företagsboenden nära de centrala arbetsplatserna — helrustad lägenhet inom 24 timmar.',
      'The Armed Forces, hospital expansion and infrastructure projects in Östersund demand flexible worker housing. We arrange corporate accommodation near key worksites — fully equipped apartment within 24 hours.',
      'Siły zbrojne, rozbudowa szpitala i projekty infrastrukturalne w Östersund wymagają elastycznego zakwaterowania pracowniczego. Organizujemy noclegi firmowe blisko kluczowych miejsc pracy — w pełni wyposażone mieszkanie w 24 godziny.'
    ),
    keywords: lk(
      ['personalboende östersund', 'boende östersund', 'företagslägenheter östersund', 'byggboende östersund', 'korttidsboende östersund', 'montörboende östersund', 'tillfälligt boende östersund', 'boende i östersund'],
      ['corporate housing ostersund', 'worker accommodation ostersund', 'construction housing ostersund', 'temporary housing ostersund sweden', 'short term rentals ostersund', 'staff apartments ostersund'],
      ['zakwaterowanie pracownicze östersund', 'mieszkania firmowe östersund', 'noclegi dla budowlańców östersund szwecja', 'kwatery pracownicze östersund', 'tymczasowe zakwaterowanie östersund', 'noclegi firmowe östersund']
    ),
    metrics: [
      {
        value: '20+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centrum och Frösön', 'Central and Frösön', 'Centrum i Frösön')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '5',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Försvar, sjukhus, infrastruktur', 'Defence, hospital, infrastructure', 'Wojsko, szpital, infrastruktura')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Östersund', 'Central Östersund', 'Centrum Östersund'),
        description: ls('Nära sjukhuset, service och kollektivtrafik.', 'Close to hospital, services and public transport.', 'Blisko szpitala, usług i komunikacji.'),
        distance: ls('5 min till sjukhuset', '5 min to hospital', '5 min do szpitala')
      },
      {
        name: ls('Frösön', 'Frösön', 'Frösön'),
        description: ls('Lugnt läge på ön med utsikt över Storsjön.', 'Quiet location on the island with lake views.', 'Spokojna lokalizacja na wyspie z widokiem na jezioro.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      },
      {
        name: ls('Odenskog', 'Odenskog', 'Odenskog'),
        description: ls('Nära handelsområde och idrottsanläggningar.', 'Near retail area and sports facilities.', 'Blisko strefy handlowej i obiektów sportowych.'),
        distance: ls('7 min till centrum', '7 min to downtown', '7 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Försvarsmakten A4', 'Armed Forces A4', 'Siły Zbrojne A4'),
        description: ls('Boende för kontrakterad personal och byggteam vid garnisonen.', 'Housing for contracted staff and construction crews at the garrison.', 'Noclegi dla personelu kontraktowego i ekip budowlanych przy garnizonie.')
      },
      {
        name: ls('Östersunds sjukhus', 'Östersund Hospital', 'Szpital Östersund'),
        description: ls('Personal nära sjukhusutbyggnaden och renoveringar.', 'Staff near hospital expansion and renovations.', 'Personel blisko rozbudowy i remontów szpitala.')
      },
      {
        name: ls('Infrastrukturprojekt E14/E45', 'Infrastructure E14/E45', 'Infrastruktura E14/E45'),
        description: ls('Team som arbetar med vägförbättringar i regionen.', 'Crews working on road improvements in the region.', 'Ekipy pracujące przy modernizacji dróg w regionie.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi hade 6 specialister som behövde bo nära sjukhuset under en månad. StayOnSite ordnade lägenheter i centrum samma vecka.',
        'We had 6 specialists who needed to stay near the hospital for a month. StayOnSite arranged downtown apartments the same week.',
        'Mieliśmy 6 specjalistów, którzy musieli mieszkać blisko szpitala przez miesiąc. StayOnSite zorganizowało mieszkania w centrum w tym samym tygodniu.'
      ),
      author: 'Mikael H.',
      role: ls('Driftchef', 'Operations Manager', 'Kierownik operacyjny'),
      company: 'MedTech Service'
    },
    faq: [
      {
        question: ls('Hur nära garnisonen kan vi bo?', 'How close to the garrison can we stay?', 'Jak blisko garnizonu możemy mieszkać?'),
        answer: ls(
          'Vi har boenden i centrala Östersund med 5-10 minuters körning till A4-garnisonen.',
          'We have housing in central Östersund, 5-10 minutes drive to the A4 garrison.',
          'Mamy noclegi w centrum Östersund, 5-10 minut jazdy do garnizonu A4.'
        )
      },
      {
        question: ls('Fungerar det för korta uppdrag?', 'Does it work for short assignments?', 'Czy działa dla krótkich zleceń?'),
        answer: ls(
          'Ja, vi erbjuder flexibla avtal från en vecka och uppåt.',
          'Yes, we offer flexible contracts from one week and up.',
          'Tak, oferujemy elastyczne umowy od jednego tygodnia wzwyż.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['gavle', 'umea']
  },
  {
    slug: 'eskilstuna',
    name: 'Eskilstuna',
    region: 'Södermanlands län',
    population: '107 000',
    description: 'Tillverknings- och logistikstad strategiskt belägen mellan Stockholm och Örebro.',
    highlights: ['Tillverkningsindustri', 'Logistikcenter', 'Stadsförnyelse', 'E20-korridoren'],
    industries: ['Tillverkning', 'Logistik', 'Bygg & Anläggning', 'Energi'],
    coordinates: [59.3710, 16.5098],
    heroHook: ls(
      'Boende & Personalboende i Eskilstuna – nära industrin och E20',
      'Accommodation & Worker Housing in Eskilstuna – Near Industry & E20',
      'Noclegi & Zakwaterowanie Pracownicze w Eskilstuna – Blisko Przemysłu i E20'
    ),
    intro: ls(
      'Tillverkningsindustrin, logistikcentra och stadsförnyelse i Eskilstuna skapar löpande behov av personalboende. Vi ordnar företagsboenden nära arbetsplatserna — flexibla avtal, fullt möblerat, komplett boendeplan inom 24 timmar.',
      'Manufacturing, logistics centres and urban renewal in Eskilstuna create ongoing demand for worker housing. We arrange corporate accommodation near worksites — flexible contracts, fully furnished, complete housing plan within 24 hours.',
      'Przemysł produkcyjny, centra logistyczne i rewitalizacja Eskilstuny tworzą stałe zapotrzebowanie na zakwaterowanie pracownicze. Organizujemy noclegi firmowe blisko miejsc pracy — elastyczne umowy, pełne wyposażenie, plan w 24 godziny.'
    ),
    keywords: lk(
      ['personalboende eskilstuna', 'boende eskilstuna', 'företagslägenheter eskilstuna', 'byggboende eskilstuna', 'korttidsboende eskilstuna', 'montörboende eskilstuna', 'tillfälligt boende eskilstuna', 'lägenhetshotell eskilstuna'],
      ['corporate housing eskilstuna', 'worker accommodation eskilstuna', 'construction housing eskilstuna', 'temporary housing eskilstuna sweden', 'short term rentals eskilstuna', 'staff apartments eskilstuna'],
      ['zakwaterowanie pracownicze eskilstuna', 'mieszkania firmowe eskilstuna', 'noclegi dla budowlańców eskilstuna szwecja', 'kwatery pracownicze eskilstuna', 'tymczasowe zakwaterowanie eskilstuna', 'noclegi firmowe eskilstuna']
    ),
    metrics: [
      {
        value: '20+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centrum och industriområden', 'Central and industrial areas', 'Centrum i strefy przemysłowe')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '5',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Tillverkning, logistik, infrastruktur', 'Manufacturing, logistics, infrastructure', 'Produkcja, logistyka, infrastruktura')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Eskilstuna', 'Central Eskilstuna', 'Centrum Eskilstuna'),
        description: ls('Nära service och kollektivtrafik.', 'Close to services and public transport.', 'Blisko usług i komunikacji.'),
        distance: ls('10 min till industriområden', '10 min to industrial areas', '10 min do stref przemysłowych')
      },
      {
        name: ls('Munktellstaden', 'Munktellstaden', 'Munktellstaden'),
        description: ls('Omvandlat industriområde med moderna bostäder.', 'Converted industrial area with modern housing.', 'Przekształcona strefa przemysłowa z nowymi mieszkaniami.'),
        distance: ls('Gångavstånd till centrum', 'Walking distance to downtown', 'Spacer do centrum')
      },
      {
        name: ls('Skiftinge', 'Skiftinge', 'Skiftinge'),
        description: ls('Nära handelsområde och E20.', 'Near retail area and E20.', 'Blisko strefy handlowej i E20.'),
        distance: ls('5 min till E20', '5 min to E20', '5 min do E20')
      }
    ],
    projects: [
      {
        name: ls('Logistikparken', 'Logistics Park', 'Park Logistyczny'),
        description: ls('Boende för installations- och lagerpersonal vid nya logistikcenter.', 'Housing for installation and warehouse staff at new logistics centres.', 'Noclegi dla personelu instalacyjnego i magazynowego przy nowych centrach logistycznych.')
      },
      {
        name: ls('Tillverkningsindustrin', 'Manufacturing Industry', 'Przemysł Produkcyjny'),
        description: ls('Team nära fabriker och produktionsanläggningar.', 'Crews near factories and production facilities.', 'Ekipy blisko fabryk i zakładów produkcyjnych.')
      },
      {
        name: ls('Stadsförnyelse Centrum', 'City Centre Renewal', 'Rewitalizacja Centrum'),
        description: ls('Byggteam vid omvandling av centrala kvarter.', 'Construction crews at central block redevelopment.', 'Ekipy budowlane przy przebudowie centralnych kwartałów.')
      }
    ],
    testimonial: {
      quote: ls(
        'Behövde lägenheter för 8 installatörer vid logistikparken. StayOnSite hade allt klart inom tre dagar — proffsigt och smidigt.',
        'Needed apartments for 8 installers at the logistics park. StayOnSite had everything ready within three days — professional and smooth.',
        'Potrzebowaliśmy mieszkań dla 8 instalatorów przy parku logistycznym. StayOnSite miało wszystko gotowe w trzy dni — profesjonalnie i sprawnie.'
      ),
      author: 'Peter L.',
      role: ls('Installationsledare', 'Installation Manager', 'Kierownik instalacji'),
      company: 'LogiBuild'
    },
    faq: [
      {
        question: ls('Hur nära E20 kan vi bo?', 'How close to E20 can we stay?', 'Jak blisko E20 możemy mieszkać?'),
        answer: ls(
          'Vi har boenden i Skiftinge och centralt — 5-10 minuter till E20-infarten.',
          'We have housing in Skiftinge and central Eskilstuna — 5-10 minutes to the E20 junction.',
          'Mamy noclegi w Skiftinge i centrum — 5-10 minut do zjazdu E20.'
        )
      },
      {
        question: ls('Kan ni ordna boende för skiftarbete?', 'Can you arrange housing for shift work?', 'Czy możecie zorganizować noclegi dla pracy zmianowej?'),
        answer: ls(
          'Ja, våra lägenheter är anpassade för skiftarbete med tyst miljö och bra sovmöjligheter.',
          'Yes, our apartments are adapted for shift work with a quiet environment and good sleeping conditions.',
          'Tak, nasze mieszkania są dostosowane do pracy zmianowej z cichym otoczeniem i dobrymi warunkami do snu.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['vasteras', 'orebro']
  },
  {
    slug: 'lund',
    name: 'Lund',
    region: 'Skåne län',
    population: '127 000',
    description: 'Forskningsstad med stora byggnationer kring ESS, MAX IV och biotech-anläggningar.',
    highlights: ['ESS & MAX IV', 'Biotech-konstruktion', 'Universitetsexpansion', 'Brunnshög stadsdel'],
    industries: ['Forskning & Biotech', 'Bygg & Anläggning', 'Life Science', 'Utbildning'],
    coordinates: [55.7047, 13.1910],
    heroHook: ls(
      'Lägenhetshotell & Personalboende i Lund – nära ESS, MAX IV och sjukhuset',
      'Aparthotel & Worker Housing in Lund – Near ESS, MAX IV & the Hospital',
      'Aparthotel & Zakwaterowanie Pracownicze w Lund – Blisko ESS, MAX IV i Szpitala'
    ),
    intro: ls(
      'ESS, MAX IV och biotech-konstruktioner runt Lund samlar specialister från hela Europa. Våra lägenhetshotell och företagslägenheter ligger nära forskningsanläggningarna — komplett boendeplan inom 24 timmar.',
      'ESS, MAX IV and biotech constructions around Lund bring specialists from across Europe. Our aparthotels and corporate apartments sit close to the research facilities — complete housing plan within 24 hours.',
      'ESS, MAX IV i budowy biotech wokół Lund przyciągają specjalistów z całej Europy. Nasze aparthotele i mieszkania firmowe znajdują się blisko ośrodków badawczych — pełny plan zakwaterowania w 24 godziny.'
    ),
    keywords: lk(
      ['personalboende lund', 'lägenhetshotell lund', 'företagslägenheter lund', 'byggboende lund', 'korttidsboende lund', 'montörboende lund', 'tillfälligt boende lund', 'boende lund'],
      ['corporate housing lund', 'aparthotel lund', 'worker accommodation lund', 'construction housing lund sweden', 'temporary housing lund', 'staff apartments lund'],
      ['zakwaterowanie pracownicze lund', 'aparthotel lund', 'mieszkania firmowe lund', 'noclegi dla budowlańców lund szwecja', 'kwatery pracownicze lund', 'tymczasowe zakwaterowanie lund']
    ),
    metrics: [
      {
        value: '30+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centrum, Brunnshög, Ideon', 'Central, Brunnshög, Ideon', 'Centrum, Brunnshög, Ideon')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '7',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('ESS, MAX IV, biotech, sjukhus', 'ESS, MAX IV, biotech, hospital', 'ESS, MAX IV, biotech, szpital')
      }
    ],
    neighborhoods: [
      {
        name: ls('Brunnshög', 'Brunnshög', 'Brunnshög'),
        description: ls('Ny stadsdel intill ESS och MAX IV.', 'New district adjacent to ESS and MAX IV.', 'Nowa dzielnica obok ESS i MAX IV.'),
        distance: ls('Gångavstånd till ESS', 'Walking distance to ESS', 'Spacer do ESS')
      },
      {
        name: ls('Centrala Lund', 'Central Lund', 'Centrum Lund'),
        description: ls('Nära tågstation, sjukhuset och universitetet.', 'Close to train station, hospital and university.', 'Blisko dworca, szpitala i uniwersytetu.'),
        distance: ls('10 min till ESS', '10 min to ESS', '10 min do ESS')
      },
      {
        name: ls('Ideon/Medicon Village', 'Ideon/Medicon Village', 'Ideon/Medicon Village'),
        description: ls('Forskningspark med biotech- och life science-företag.', 'Science park with biotech and life science companies.', 'Park naukowy z firmami biotech i life science.'),
        distance: ls('5 min till MAX IV', '5 min to MAX IV', '5 min do MAX IV')
      }
    ],
    projects: [
      {
        name: ls('ESS (European Spallation Source)', 'ESS (European Spallation Source)', 'ESS (European Spallation Source)'),
        description: ls('Boende för internationella bygg- och forskningsteam vid neutronforskningsanläggningen.', 'Housing for international construction and research teams at the neutron research facility.', 'Noclegi dla międzynarodowych ekip budowlanych i badawczych przy ośrodku badań neutronowych.')
      },
      {
        name: ls('MAX IV-laboratoriet', 'MAX IV Laboratory', 'Laboratorium MAX IV'),
        description: ls('Specialister och underhållspersonal vid synkrotronljusanläggningen.', 'Specialists and maintenance staff at the synchrotron light facility.', 'Specjaliści i personel konserwacyjny przy synchrotronie.')
      },
      {
        name: ls('Lunds universitetssjukhus', 'Lund University Hospital', 'Szpital Uniwersytecki w Lund'),
        description: ls('Vårdpersonal och byggteam vid sjukhusutbyggnader.', 'Healthcare staff and construction crews at hospital expansions.', 'Personel medyczny i ekipy budowlane przy rozbudowie szpitala.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vårt forskningsteam från Tyskland behövde boende nära ESS i tre månader. StayOnSite fixade lägenheter i Brunnshög med perfekt pendlingsavstånd.',
        'Our research team from Germany needed housing near ESS for three months. StayOnSite arranged apartments in Brunnshög with perfect commuting distance.',
        'Nasz zespół badawczy z Niemiec potrzebował noclegów blisko ESS na trzy miesiące. StayOnSite zorganizowało mieszkania w Brunnshög z idealnym dojazdem.'
      ),
      author: 'Dr. Martin S.',
      role: ls('Forskningsledare', 'Research Director', 'Dyrektor badawczy'),
      company: 'Helmholtz-Zentrum'
    },
    faq: [
      {
        question: ls('Hur nära ESS kan vi bo?', 'How close to ESS can we stay?', 'Jak blisko ESS możemy mieszkać?'),
        answer: ls(
          'Vi har lägenheter i Brunnshög med gångavstånd till ESS och MAX IV.',
          'We have apartments in Brunnshög within walking distance to ESS and MAX IV.',
          'Mamy mieszkania w Brunnshög w odległości spaceru od ESS i MAX IV.'
        )
      },
      {
        question: ls('Kan ni hantera internationella team?', 'Can you handle international teams?', 'Czy możecie obsłużyć międzynarodowe zespoły?'),
        answer: ls(
          'Ja, vi har erfarenhet av internationella forskar- och byggteam. Engelskspråkig kontakt och avtal.',
          'Yes, we have experience with international research and construction teams. English-speaking contact and contracts.',
          'Tak, mamy doświadczenie z międzynarodowymi zespołami badawczymi i budowlanymi. Kontakt i umowy po angielsku.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['malmo', 'helsingborg']
  },
  {
    slug: 'kiruna',
    name: 'Kiruna',
    region: 'Norrbottens län',
    population: '23 000',
    description: 'Gruvstad under historisk stadsflytt med LKAB:s expansion och rymdbasen Esrange.',
    highlights: ['LKAB gruvexpansion', 'Stadsflytten', 'Esrange rymdcenter', 'Arktisk infrastruktur'],
    industries: ['Gruvnäring', 'Rymdteknik', 'Bygg & Anläggning', 'Infrastruktur'],
    coordinates: [67.8558, 20.2253],
    heroHook: ls(
      'Boende & Personalboende i Kiruna – nära LKAB och stadsflytten',
      'Accommodation & Worker Housing in Kiruna – Near LKAB & the City Relocation',
      'Noclegi & Zakwaterowanie Pracownicze w Kiruna – Blisko LKAB i Przeniesienia Miasta'
    ),
    intro: ls(
      'LKAB:s gruvexpansion, stadsflytten och Esrange skapar enormt behov av personalboende i Kiruna. Vi ordnar företagsboenden för byggteam, gruvarbetare och specialister — nära arbetsplatsen, fullt möblerat.',
      'LKAB\'s mine expansion, the city relocation and Esrange create massive demand for worker housing in Kiruna. We arrange corporate accommodation for construction crews, miners and specialists — close to the worksite, fully furnished.',
      'Ekspansja kopalni LKAB, przeniesienie miasta i Esrange tworzą ogromne zapotrzebowanie na zakwaterowanie pracownicze w Kirunie. Organizujemy noclegi firmowe dla ekip budowlanych, górników i specjalistów — blisko pracy, pełne wyposażenie.'
    ),
    keywords: lk(
      ['personalboende kiruna', 'boende kiruna', 'företagslägenheter kiruna', 'byggboende kiruna', 'korttidsboende kiruna', 'montörboende kiruna LKAB', 'tillfälligt boende kiruna', 'gruvboende kiruna'],
      ['corporate housing kiruna', 'worker accommodation kiruna', 'mining housing kiruna', 'construction housing kiruna sweden', 'temporary housing kiruna', 'staff apartments kiruna LKAB'],
      ['zakwaterowanie pracownicze kiruna', 'noclegi górnicze kiruna', 'mieszkania firmowe kiruna', 'noclegi dla budowlańców kiruna szwecja', 'kwatery pracownicze kiruna LKAB', 'tymczasowe zakwaterowanie kiruna']
    ),
    metrics: [
      {
        value: '25+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Nya centrum och Lombolo', 'New centre and Lombolo', 'Nowe centrum i Lombolo')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '6',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('LKAB, stadsflytt, Esrange', 'LKAB, city relocation, Esrange', 'LKAB, przeniesienie miasta, Esrange')
      }
    ],
    neighborhoods: [
      {
        name: ls('Nya centrum', 'New City Centre', 'Nowe Centrum'),
        description: ls('Det nya Kiruna centrum som byggs öster om det gamla.', 'The new Kiruna city centre being built east of the old one.', 'Nowe centrum Kiruny budowane na wschód od starego.'),
        distance: ls('10 min till LKAB', '10 min to LKAB', '10 min do LKAB')
      },
      {
        name: ls('Lombolo', 'Lombolo', 'Lombolo'),
        description: ls('Etablerat bostadsområde med service och skola.', 'Established residential area with services and school.', 'Ugruntowana dzielnica z usługami i szkołą.'),
        distance: ls('8 min till centrum', '8 min to centre', '8 min do centrum')
      },
      {
        name: ls('Tuolluvaara', 'Tuolluvaara', 'Tuolluvaara'),
        description: ls('Nära gruvan med goda kommunikationer.', 'Near the mine with good connections.', 'Blisko kopalni z dobrym dojazdem.'),
        distance: ls('5 min till LKAB', '5 min to LKAB', '5 min do LKAB')
      }
    ],
    projects: [
      {
        name: ls('LKAB Gruvexpansion', 'LKAB Mine Expansion', 'Ekspansja Kopalni LKAB'),
        description: ls('Boende för gruvarbetare och underhållsteam vid LKAB:s utvidgning.', 'Housing for miners and maintenance crews at LKAB\'s expansion.', 'Noclegi dla górników i ekip konserwacyjnych przy rozbudowie LKAB.')
      },
      {
        name: ls('Stadsflytten Kiruna', 'Kiruna City Relocation', 'Przeniesienie Miasta Kiruna'),
        description: ls('Byggteam och infrastrukturpersonal vid Sveriges största stadsflytt.', 'Construction crews and infrastructure staff at Sweden\'s largest city relocation.', 'Ekipy budowlane i personel infrastruktury przy największym przenieseniu miasta w Szwecji.')
      },
      {
        name: ls('Esrange Space Center', 'Esrange Space Center', 'Centrum Kosmiczne Esrange'),
        description: ls('Specialister och tekniker vid rymdbasen utanför Kiruna.', 'Specialists and technicians at the space centre outside Kiruna.', 'Specjaliści i technicy w centrum kosmicznym pod Kiruną.')
      }
    ],
    testimonial: {
      quote: ls(
        'Stadsflytten krävde plats för 15 byggnadsarbetare i fyra månader. StayOnSite levererade lägenheter i Lombolo med kort avstånd till bygget.',
        'The city relocation required housing for 15 construction workers for four months. StayOnSite delivered apartments in Lombolo close to the construction site.',
        'Przeniesienie miasta wymagało noclegów dla 15 budowlańców na cztery miesiące. StayOnSite dostarczyło mieszkania w Lombolo blisko budowy.'
      ),
      author: 'Jonas N.',
      role: ls('Platschef', 'Site Manager', 'Kierownik budowy'),
      company: 'NCC'
    },
    faq: [
      {
        question: ls('Hur nära LKAB-gruvan kan vi bo?', 'How close to the LKAB mine can we stay?', 'Jak blisko kopalni LKAB możemy mieszkać?'),
        answer: ls(
          'Vi har boenden med 5-10 minuters körning till LKAB, framför allt i Tuolluvaara och nya centrum.',
          'We have housing 5-10 minutes drive to LKAB, primarily in Tuolluvaara and the new centre.',
          'Mamy noclegi 5-10 minut jazdy do LKAB, głównie w Tuolluvaara i nowym centrum.'
        )
      },
      {
        question: ls('Fungerar det vintertid?', 'Does it work in winter?', 'Czy to działa zimą?'),
        answer: ls(
          'Absolut — alla lägenheter har fullvärme, motorvärmare och vinterutrustning. Vi är vana vid arktiskt klimat.',
          'Absolutely — all apartments have full heating, engine block heaters and winter equipment. We are used to arctic conditions.',
          'Oczywiście — wszystkie mieszkania mają pełne ogrzewanie, podgrzewacze silnika i wyposażenie zimowe. Jesteśmy przyzwyczajeni do warunków arktycznych.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['gallivare', 'lulea']
  },
  {
    slug: 'gallivare',
    name: 'Gällivare',
    region: 'Norrbottens län',
    population: '18 000',
    description: 'Gruvstad med LKAB-expansion och Bolidens malmbrytning i Aitik.',
    highlights: ['LKAB Malmberget', 'Aitik koppargruva', 'Gruvsamhälle i omställning', 'Infrastrukturprojekt'],
    industries: ['Gruvnäring', 'Bygg & Anläggning', 'Infrastruktur', 'Energi'],
    coordinates: [67.1341, 20.6518],
    heroHook: ls(
      'Boende & Personalboende i Gällivare – nära LKAB och Aitik-gruvan',
      'Accommodation & Worker Housing in Gällivare – Near LKAB & Aitik Mine',
      'Noclegi & Zakwaterowanie Pracownicze w Gällivare – Blisko LKAB i Kopalni Aitik'
    ),
    intro: ls(
      'LKAB:s expansion i Malmberget och Bolidens Aitik-gruva gör Gällivare till ett nav för gruvrelaterat byggande. Vi ordnar personalboende och företagsboenden för gruvarbetare, montörer och specialister — nära gruvorna.',
      'LKAB\'s expansion in Malmberget and Boliden\'s Aitik mine make Gällivare a hub for mining-related construction. We arrange worker housing and corporate accommodation for miners, fitters and specialists — close to the mines.',
      'Ekspansja LKAB w Malmberget i kopalnia Aitik Bolidenu czynią Gällivare centrum budownictwa górniczego. Organizujemy zakwaterowanie pracownicze dla górników, monterów i specjalistów — blisko kopalń.'
    ),
    keywords: lk(
      ['personalboende gällivare', 'boende gällivare', 'företagslägenheter gällivare', 'byggboende gällivare', 'korttidsboende gällivare', 'gruvboende gällivare', 'tillfälligt boende gällivare', 'montörboende LKAB gällivare'],
      ['corporate housing gallivare', 'worker accommodation gallivare', 'mining housing gallivare', 'construction housing gallivare sweden', 'temporary housing gallivare', 'staff apartments gallivare'],
      ['zakwaterowanie pracownicze gällivare', 'noclegi górnicze gällivare', 'mieszkania firmowe gällivare', 'noclegi dla budowlańców gällivare szwecja', 'kwatery pracownicze gällivare', 'tymczasowe zakwaterowanie gällivare']
    ),
    metrics: [
      {
        value: '15+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Gällivare och Malmberget', 'Gällivare and Malmberget', 'Gällivare i Malmberget')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '4',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('LKAB, Aitik, infrastruktur', 'LKAB, Aitik, infrastructure', 'LKAB, Aitik, infrastruktura')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Gällivare', 'Central Gällivare', 'Centrum Gällivare'),
        description: ls('Nära service, järnvägsstation och sjukhus.', 'Close to services, railway station and hospital.', 'Blisko usług, stacji kolejowej i szpitala.'),
        distance: ls('10 min till gruvorna', '10 min to the mines', '10 min do kopalń')
      },
      {
        name: ls('Malmberget', 'Malmberget', 'Malmberget'),
        description: ls('Gruvsamhälle intill LKAB:s verksamhet.', 'Mining community adjacent to LKAB operations.', 'Osiedle górnicze obok operacji LKAB.'),
        distance: ls('5 min till LKAB', '5 min to LKAB', '5 min do LKAB')
      },
      {
        name: ls('Koskullskulle', 'Koskullskulle', 'Koskullskulle'),
        description: ls('Villaområde mellan Gällivare och Malmberget.', 'Residential area between Gällivare and Malmberget.', 'Dzielnica domów między Gällivare a Malmberget.'),
        distance: ls('7 min till centrum', '7 min to downtown', '7 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('LKAB Malmberget', 'LKAB Malmberget', 'LKAB Malmberget'),
        description: ls('Boende för gruvarbetare och underhållsteam vid LKAB:s anläggning.', 'Housing for miners and maintenance crews at LKAB\'s facility.', 'Noclegi dla górników i ekip konserwacyjnych przy zakładzie LKAB.')
      },
      {
        name: ls('Aitik koppargruva', 'Aitik Copper Mine', 'Kopalnia Miedzi Aitik'),
        description: ls('Team vid en av Europas största koppargruvor.', 'Crews at one of Europe\'s largest copper mines.', 'Ekipy przy jednej z największych kopalń miedzi w Europie.')
      },
      {
        name: ls('Samhällsomvandling Malmberget', 'Malmberget Community Transformation', 'Transformacja Malmberget'),
        description: ls('Byggteam vid omflyttning och nybyggnation i gruvsamhället.', 'Construction crews at relocation and new builds in the mining community.', 'Ekipy budowlane przy relokacji i nowych budowach w osiedlu górniczym.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi hade underhållsstopp på Aitik och behövde plats för 10 tekniker under sex veckor. StayOnSite ordnade lägenheter i Gällivare snabbt och smidigt.',
        'We had a maintenance shutdown at Aitik and needed housing for 10 technicians for six weeks. StayOnSite arranged apartments in Gällivare quickly and smoothly.',
        'Mieliśmy postój konserwacyjny w Aitik i potrzebowaliśmy noclegów dla 10 techników na sześć tygodni. StayOnSite zorganizowało mieszkania w Gällivare szybko i sprawnie.'
      ),
      author: 'Björn T.',
      role: ls('Underhållschef', 'Maintenance Manager', 'Kierownik konserwacji'),
      company: 'Boliden'
    },
    faq: [
      {
        question: ls('Hur nära Aitik kan vi bo?', 'How close to Aitik can we stay?', 'Jak blisko Aitik możemy mieszkać?'),
        answer: ls(
          'Vi har boenden i Gällivare med ca 15 minuters körning till Aitik-gruvan.',
          'We have housing in Gällivare about 15 minutes drive to the Aitik mine.',
          'Mamy noclegi w Gällivare, ok. 15 minut jazdy do kopalni Aitik.'
        )
      },
      {
        question: ls('Klarar boendena arktisk vinter?', 'Can the housing handle arctic winter?', 'Czy noclegi wytrzymują arktyczną zimę?'),
        answer: ls(
          'Ja — alla boenden har fullvärme, motorvärmare och vinterutrustning. Vi är vana vid -30°C.',
          'Yes — all housing has full heating, engine block heaters and winter equipment. We are used to -30°C.',
          'Tak — wszystkie noclegi mają pełne ogrzewanie, podgrzewacze silnika i wyposażenie zimowe. Jesteśmy przyzwyczajeni do -30°C.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['kiruna', 'boden']
  },
  {
    slug: 'halmstad',
    name: 'Halmstad',
    region: 'Hallands län',
    population: '104 000',
    description: 'Industristad med hamn, tillverkning och infrastrukturprojekt vid E6-korridoren.',
    highlights: ['Halmstads hamn', 'Tillverkningsindustri', 'E6-korridoren', 'Högskoleexpansion'],
    industries: ['Tillverkning', 'Hamn & Logistik', 'Bygg & Anläggning', 'Energi'],
    coordinates: [56.6745, 12.8578],
    heroHook: ls(
      'Lägenhetshotell & Personalboende i Halmstad – nära hamnen och E6',
      'Aparthotel & Worker Housing in Halmstad – Near the Port & E6',
      'Aparthotel & Zakwaterowanie Pracownicze w Halmstad – Blisko Portu i E6'
    ),
    intro: ls(
      'Hamnen, tillverkningsindustrin och infrastrukturprojekt längs E6 gör Halmstad till ett nav för bygg- och industripersonal. Våra lägenhetshotell och företagsboenden ligger nära arbetsplatserna — flexibla avtal, fullt möblerat.',
      'The port, manufacturing industry and infrastructure projects along the E6 make Halmstad a hub for construction and industrial staff. Our aparthotels and corporate housing sit close to the worksites — flexible contracts, fully furnished.',
      'Port, przemysł produkcyjny i projekty infrastrukturalne wzdłuż E6 czynią Halmstad centrum dla personelu budowlanego i przemysłowego. Nasze aparthotele i noclegi firmowe znajdują się blisko miejsc pracy — elastyczne umowy, pełne wyposażenie.'
    ),
    keywords: lk(
      ['personalboende halmstad', 'boende halmstad', 'lägenhetshotell halmstad', 'företagslägenheter halmstad', 'byggboende halmstad', 'korttidsboende halmstad', 'montörboende halmstad', 'tillfälligt boende halmstad'],
      ['corporate housing halmstad', 'aparthotel halmstad', 'worker accommodation halmstad', 'construction housing halmstad sweden', 'temporary housing halmstad', 'staff apartments halmstad'],
      ['zakwaterowanie pracownicze halmstad', 'aparthotel halmstad', 'mieszkania firmowe halmstad', 'noclegi dla budowlańców halmstad szwecja', 'kwatery pracownicze halmstad', 'tymczasowe zakwaterowanie halmstad']
    ),
    metrics: [
      {
        value: '20+',
        label: ls('möblerade lägenheter', 'furnished apartments', 'umeblowane mieszkania'),
        subtext: ls('Centrum och hamnområdet', 'Central and port area', 'Centrum i strefa portowa')
      },
      {
        value: '24 h',
        label: ls('till första offert', 'to first proposal', 'do pierwszej oferty'),
        subtext: ls('Vi återkopplar direkt', 'We reply immediately', 'Odpowiadamy od razu')
      },
      {
        value: '5',
        label: ls('aktiva projekt', 'active projects', 'aktywne projekty'),
        subtext: ls('Hamn, industri, infrastruktur', 'Port, industry, infrastructure', 'Port, przemysł, infrastruktura')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Halmstad', 'Central Halmstad', 'Centrum Halmstad'),
        description: ls('Nära tågstation, service och restauranger.', 'Close to train station, services and restaurants.', 'Blisko dworca, usług i restauracji.'),
        distance: ls('10 min till hamnen', '10 min to the port', '10 min do portu')
      },
      {
        name: ls('Andersberg', 'Andersberg', 'Andersberg'),
        description: ls('Bostadsområde nära handelsplatser och industri.', 'Residential area close to retail and industry.', 'Dzielnica blisko handlu i przemysłu.'),
        distance: ls('5 min till E6', '5 min to E6', '5 min do E6')
      },
      {
        name: ls('Fyllinge', 'Fyllinge', 'Fyllinge'),
        description: ls('Lugnt område med bra kommunikationer norrut.', 'Quiet area with good connections northward.', 'Spokojna okolica z dobrym dojazdem na północ.'),
        distance: ls('8 min till centrum', '8 min to downtown', '8 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Halmstads hamn', 'Halmstad Port', 'Port Halmstad'),
        description: ls('Boende för hamnarbetare och installationsteam vid hamnens expansion.', 'Housing for port workers and installation teams at the port expansion.', 'Noclegi dla pracowników portowych i ekip instalacyjnych przy rozbudowie portu.')
      },
      {
        name: ls('Tillverkningsindustrin', 'Manufacturing Industry', 'Przemysł Produkcyjny'),
        description: ls('Montörer och produktionspersonal vid regionens fabriker.', 'Fitters and production staff at the region\'s factories.', 'Monterzy i personel produkcyjny w fabrykach regionu.')
      },
      {
        name: ls('E6-infrastruktur', 'E6 Infrastructure', 'Infrastruktura E6'),
        description: ls('Team vid vägprojekt och broarbeten längs E6.', 'Crews at road projects and bridge works along E6.', 'Ekipy przy projektach drogowych i mostowych wzdłuż E6.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi behövde snabbt boende för montörer vid hamnutbyggnaden. StayOnSite hade lägenheter klara på tre dagar — bra läge och bra pris.',
        'We quickly needed housing for fitters at the port expansion. StayOnSite had apartments ready in three days — good location and good price.',
        'Szybko potrzebowaliśmy noclegów dla monterów przy rozbudowie portu. StayOnSite miało mieszkania gotowe w trzy dni — dobra lokalizacja i dobra cena.'
      ),
      author: 'Fredrik J.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Hamnbyggarna'
    },
    faq: [
      {
        question: ls('Hur nära hamnen kan vi bo?', 'How close to the port can we stay?', 'Jak blisko portu możemy mieszkać?'),
        answer: ls(
          'Vi har boenden i centrala Halmstad med ca 10 minuters körning till hamnen.',
          'We have housing in central Halmstad about 10 minutes drive to the port.',
          'Mamy noclegi w centrum Halmstad, ok. 10 minut jazdy do portu.'
        )
      },
      {
        question: ls('Går det att boka för en enstaka vecka?', 'Can we book for a single week?', 'Czy można zarezerwować na jeden tydzień?'),
        answer: ls(
          'Ja, vi erbjuder flexibla avtal från en vecka och uppåt beroende på tillgänglighet.',
          'Yes, we offer flexible contracts from one week and up depending on availability.',
          'Tak, oferujemy elastyczne umowy od jednego tygodnia wzwyż, w zależności od dostępności.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['helsingborg', 'jonkoping']
  },
  {
    slug: 'falun',
    name: 'Falun',
    region: 'Dalarnas län',
    population: '60 000',
    description: 'Universitetsstad och industricentrum med SSAB, gruvtradition och växande byggsektorn.',
    highlights: ['SSAB stålverk', 'Högskolan Dalarna', 'Koppargruvan', 'Energiprojekt'],
    industries: ['Stål & Metall', 'Utbildning', 'Bygg & Anläggning', 'Energi'],
    coordinates: [60.6065, 15.6355],
    heroHook: ls(
      'Personalboende i Falun – nära SSAB, Högskolan och byggprojekten i Dalarna',
      'Worker Housing in Falun – Near SSAB, University & Construction in Dalarna',
      'Zakwaterowanie Pracownicze w Falun – Blisko SSAB, Uczelni i Budów w Dalarna'
    ),
    intro: ls(
      'SSAB:s stålverk, Högskolan Dalarna och regionens bygg- och energiprojekt skapar ett stadigt behov av personalboende i Falun. Vi erbjuder möblerade lägenheter och hus i centrala Falun och Lugnet-området — flexibla avtal från en vecka.',
      'SSAB\'s steelworks, Dalarna University and the region\'s construction and energy projects create a steady demand for worker housing in Falun. We offer furnished apartments and houses in central Falun and the Lugnet area — flexible contracts from one week.',
      'Stalownia SSAB, Uniwersytet Dalarna oraz regionalne projekty budowlane i energetyczne tworzą stałe zapotrzebowanie na zakwaterowanie pracownicze w Falun. Oferujemy umeblowane mieszkania i domy w centrum Falun i okolicy Lugnet — elastyczne umowy od jednego tygodnia.'
    ),
    keywords: lk(
      ['personalboende falun', 'företagsboende falun', 'boende falun', 'lägenheter falun', 'montörboende dalarna', 'tillfälligt boende falun', 'korttidsboende falun', 'byggboende falun'],
      ['corporate housing falun', 'worker accommodation falun', 'apartments falun sweden', 'temporary housing falun', 'staff accommodation dalarna'],
      ['zakwaterowanie pracownicze falun', 'mieszkania firmowe falun', 'noclegi dla budowlańców falun szwecja', 'kwatery pracownicze falun', 'tymczasowe zakwaterowanie falun']
    ),
    metrics: [
      {
        value: '24+',
        label: ls('platser i Falun', 'beds in Falun', 'miejsc w Falun'),
        subtext: ls('Lägenheter & villor', 'Apartments & houses', 'Mieszkania i domy')
      },
      {
        value: '10',
        label: ls('min till SSAB', 'min to SSAB', 'min do SSAB'),
        subtext: ls('Från centrala boenden', 'From central housing', 'Z centralnych noclegów')
      },
      {
        value: '24h',
        label: ls('svar på förfrågan', 'response time', 'czas odpowiedzi'),
        subtext: ls('Garanterad återkoppling', 'Guaranteed response', 'Gwarantowana odpowiedź')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Falun', 'Central Falun', 'Centrum Falun'),
        description: ls('Nära service, restauranger och kollektivtrafik.', 'Close to services, restaurants and public transport.', 'Blisko usług, restauracji i transportu publicznego.'),
        distance: ls('10 min till SSAB', '10 min to SSAB', '10 min do SSAB')
      },
      {
        name: ls('Lugnet', 'Lugnet', 'Lugnet'),
        description: ls('Nära skidstadion och friluftsområden.', 'Near the ski stadium and outdoor areas.', 'Blisko stadionu narciarskiego i terenów rekreacyjnych.'),
        distance: ls('15 min till centrum', '15 min to downtown', '15 min do centrum')
      },
      {
        name: ls('Domnarvets industriområde', 'Domnarvet industrial area', 'Domnarvet strefa przemysłowa'),
        description: ls('Nära SSAB och industriparken.', 'Close to SSAB and the industrial park.', 'Blisko SSAB i parku przemysłowego.'),
        distance: ls('5 min till stålverket', '5 min to steelworks', '5 min do stalowni')
      }
    ],
    projects: [
      {
        name: ls('SSAB underhåll & expansion', 'SSAB Maintenance & Expansion', 'Konserwacja i rozbudowa SSAB'),
        description: ls('Boende för montörer och tekniker vid stålverket.', 'Housing for fitters and technicians at the steelworks.', 'Zakwaterowanie dla monterów i techników przy stalowni.')
      },
      {
        name: ls('Energiprojekt Dalarna', 'Energy Projects Dalarna', 'Projekty energetyczne Dalarna'),
        description: ls('Team vid vindkraft- och nätutbyggnad i regionen.', 'Crews at wind power and grid expansion in the region.', 'Ekipy przy budowie farm wiatrowych i sieci w regionie.')
      },
      {
        name: ls('Bygg & Renovering', 'Construction & Renovation', 'Budownictwo i renowacja'),
        description: ls('Bostadsbyggen och infrastrukturprojekt i Falun.', 'Housing construction and infrastructure projects in Falun.', 'Budowa mieszkań i projekty infrastrukturalne w Falun.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi hade 12 montörer som jobbade med underhållsstopp på SSAB i tre månader. StayOnSite ordnade lägenheter i centrum på två dagars varsel.',
        'We had 12 fitters working on a maintenance shutdown at SSAB for three months. StayOnSite arranged apartments in the center at two days\' notice.',
        'Mieliśmy 12 monterów pracujących przy przestoju konserwacyjnym w SSAB przez trzy miesiące. StayOnSite zorganizowało mieszkania w centrum w dwa dni.'
      ),
      author: 'Erik L.',
      role: ls('Platschef', 'Site Manager', 'Kierownik budowy'),
      company: 'Industriservice AB'
    },
    faq: [
      {
        question: ls('Finns boende nära SSAB?', 'Is there housing near SSAB?', 'Czy są noclegi blisko SSAB?'),
        answer: ls(
          'Ja, vi har lägenheter i Domnarvet och centrala Falun, 5–10 minuter från stålverket.',
          'Yes, we have apartments in Domnarvet and central Falun, 5–10 minutes from the steelworks.',
          'Tak, mamy mieszkania w Domnarvet i centrum Falun, 5–10 minut od stalowni.'
        )
      },
      {
        question: ls('Kan ni ta emot större grupper?', 'Can you accommodate larger groups?', 'Czy możecie przyjąć większe grupy?'),
        answer: ls(
          'Ja, vi har kapacitet för grupper upp till 20 personer i Falun-området.',
          'Yes, we have capacity for groups up to 20 people in the Falun area.',
          'Tak, mamy pojemność dla grup do 20 osób w rejonie Falun.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['ludvika', 'gavle']
  },
  {
    slug: 'ludvika',
    name: 'Ludvika',
    region: 'Dalarnas län',
    population: '26 000',
    description: 'Industristad med Hitachi Energy (fd ABB) och vattenkraftsprojekt i Bergslagen.',
    highlights: ['Hitachi Energy', 'Vattenkraft', 'Bergslagen', 'Transformatortillverkning'],
    industries: ['Energiteknik', 'Vattenkraft', 'Tillverkning', 'Bygg & Anläggning'],
    coordinates: [60.1493, 15.1870],
    heroHook: ls(
      'Personalboende i Ludvika – nära Hitachi Energy och vattenkraftsprojekten',
      'Worker Housing in Ludvika – Near Hitachi Energy & Hydropower Projects',
      'Zakwaterowanie Pracownicze w Ludvika – Blisko Hitachi Energy i Hydroelektrowni'
    ),
    intro: ls(
      'Hitachi Energys transformatorfabrik och de stora vattenkraftsprojekten i Bergslagen gör Ludvika till en nyckelort för tekniker och montörer. Vi erbjuder möblerade boenden nära fabriken och i centrala Ludvika — allt från enstaka veckor till årskontrakt.',
      'Hitachi Energy\'s transformer factory and the major hydropower projects in Bergslagen make Ludvika a key location for technicians and fitters. We offer furnished housing near the factory and in central Ludvika — from single weeks to annual contracts.',
      'Fabryka transformatorów Hitachi Energy i duże projekty hydroenergetyczne w Bergslagen czynią Ludvikę kluczową lokalizacją dla techników i monterów. Oferujemy umeblowane noclegi blisko fabryki i w centrum Ludviki — od pojedynczych tygodni po roczne kontrakty.'
    ),
    keywords: lk(
      ['personalboende ludvika', 'företagsboende ludvika', 'boende ludvika', 'montörboende ludvika', 'tillfälligt boende ludvika', 'lägenheter ludvika', 'byggboende bergslagen', 'korttidsboende ludvika'],
      ['corporate housing ludvika', 'worker accommodation ludvika', 'apartments ludvika sweden', 'temporary housing ludvika', 'staff accommodation bergslagen'],
      ['zakwaterowanie pracownicze ludvika', 'mieszkania firmowe ludvika', 'noclegi dla budowlańców ludvika szwecja', 'kwatery pracownicze ludvika', 'tymczasowe zakwaterowanie ludvika']
    ),
    metrics: [
      {
        value: '18+',
        label: ls('platser i Ludvika', 'beds in Ludvika', 'miejsc w Ludvika'),
        subtext: ls('Lägenheter & villor', 'Apartments & houses', 'Mieszkania i domy')
      },
      {
        value: '5',
        label: ls('min till Hitachi Energy', 'min to Hitachi Energy', 'min do Hitachi Energy'),
        subtext: ls('Från centrala boenden', 'From central housing', 'Z centralnych noclegów')
      },
      {
        value: '0%',
        label: ls('avgift för husägare', 'fee for homeowners', 'prowizja dla właścicieli'),
        subtext: ls('Du behåller hela hyran', 'You keep the full rent', 'Zatrzymujesz cały czynsz')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Ludvika', 'Central Ludvika', 'Centrum Ludvika'),
        description: ls('Nära tågstation, butiker och service.', 'Close to train station, shops and services.', 'Blisko dworca, sklepów i usług.'),
        distance: ls('5 min till Hitachi Energy', '5 min to Hitachi Energy', '5 min do Hitachi Energy')
      },
      {
        name: ls('Grängesberg', 'Grängesberg', 'Grängesberg'),
        description: ls('Lugnt bostadsområde med villor nära naturen.', 'Quiet residential area with houses near nature.', 'Spokojna dzielnica mieszkalna z domami blisko natury.'),
        distance: ls('20 min till centrum', '20 min to downtown', '20 min do centrum')
      },
      {
        name: ls('Industriområdet', 'Industrial area', 'Strefa przemysłowa'),
        description: ls('Intill Hitachi Energys fabrik.', 'Next to Hitachi Energy\'s factory.', 'Obok fabryki Hitachi Energy.'),
        distance: ls('Gångavstånd till fabriken', 'Walking distance to factory', 'Pieszo do fabryki')
      }
    ],
    projects: [
      {
        name: ls('Hitachi Energy', 'Hitachi Energy', 'Hitachi Energy'),
        description: ls('Boende för montörer och tekniker vid transformatorfabriken.', 'Housing for fitters and technicians at the transformer factory.', 'Zakwaterowanie dla monterów i techników przy fabryce transformatorów.')
      },
      {
        name: ls('Vattenkraftsprojekt', 'Hydropower Projects', 'Projekty hydroenergetyczne'),
        description: ls('Team vid damm- och turbinrenovering i Bergslagen.', 'Crews at dam and turbine renovation in Bergslagen.', 'Ekipy przy renowacji zapór i turbin w Bergslagen.')
      },
      {
        name: ls('Nätutbyggnad', 'Grid Expansion', 'Rozbudowa sieci'),
        description: ls('Elnätsprojekt i Dalarna och Bergslagen.', 'Power grid projects in Dalarna and Bergslagen.', 'Projekty sieci energetycznych w Dalarna i Bergslagen.')
      }
    ],
    testimonial: {
      quote: ls(
        'Våra tekniker pendlar hit för uppdrag på Hitachi Energy. StayOnSite fixade fyra lägenheter nära fabriken — smidigt och professionellt.',
        'Our technicians commute here for assignments at Hitachi Energy. StayOnSite arranged four apartments near the factory — smooth and professional.',
        'Nasi technicy dojeżdżają tu na zlecenia w Hitachi Energy. StayOnSite zorganizowało cztery mieszkania blisko fabryki — sprawnie i profesjonalnie.'
      ),
      author: 'Anders K.',
      role: ls('Driftchef', 'Operations Manager', 'Kierownik operacyjny'),
      company: 'Energimontage Nord'
    },
    faq: [
      {
        question: ls('Hur nära Hitachi Energy ligger boendena?', 'How close to Hitachi Energy are the accommodations?', 'Jak blisko Hitachi Energy są noclegi?'),
        answer: ls(
          'Våra boenden i centrala Ludvika ligger 5 minuter med bil från fabriken.',
          'Our housing in central Ludvika is 5 minutes by car from the factory.',
          'Nasze noclegi w centrum Ludviki są 5 minut samochodem od fabryki.'
        )
      },
      {
        question: ls('Kan ni ordna boende med kort varsel?', 'Can you arrange housing at short notice?', 'Czy możecie zorganizować noclegi na krótki termin?'),
        answer: ls(
          'Ja, vi har oftast tillgängliga boenden och kan ordna inflyttning inom 24–48 timmar.',
          'Yes, we usually have available housing and can arrange move-in within 24–48 hours.',
          'Tak, zwykle mamy dostępne noclegi i możemy zorganizować zakwaterowanie w ciągu 24–48 godzin.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['falun', 'karlstad']
  },
  {
    slug: 'nykoping',
    name: 'Nyköping',
    region: 'Södermanlands län',
    population: '56 000',
    description: 'Residensstad vid Ostlänken-korridoren med flygplats, industri och infrastrukturprojekt.',
    highlights: ['Ostlänken', 'Stockholm Skavsta flygplats', 'Industri', 'Infrastruktur'],
    industries: ['Bygg & Anläggning', 'Logistik', 'Tillverkning', 'Infrastruktur'],
    coordinates: [58.7530, 17.0086],
    heroHook: ls(
      'Personalboende i Nyköping – nära Ostlänken, Skavsta och industrierna',
      'Worker Housing in Nyköping – Near Ostlänken Railway, Skavsta & Industry',
      'Zakwaterowanie Pracownicze w Nyköping – Blisko Ostlänken, Skavsta i Przemysłu'
    ),
    intro: ls(
      'Ostlänken — Sveriges största järnvägsprojekt — passerar genom Nyköping och skapar ett enormt behov av personalboende de kommande åren. Tillsammans med Skavsta flygplats och regionens industriprojekt erbjuder vi möblerade lägenheter och hus med flexibla avtal.',
      'Ostlänken — Sweden\'s largest railway project — passes through Nyköping, creating enormous demand for worker housing in coming years. Combined with Skavsta airport and the region\'s industrial projects, we offer furnished apartments and houses with flexible contracts.',
      'Ostlänken — największy projekt kolejowy Szwecji — przechodzi przez Nyköping, tworząc ogromne zapotrzebowanie na zakwaterowanie pracownicze w nadchodzących latach. W połączeniu z lotniskiem Skavsta i projektami przemysłowymi regionu oferujemy umeblowane mieszkania i domy z elastycznymi umowami.'
    ),
    keywords: lk(
      ['personalboende nyköping', 'företagsboende nyköping', 'boende nyköping', 'montörboende nyköping', 'tillfälligt boende nyköping', 'lägenheter nyköping', 'byggboende ostlänken', 'korttidsboende nyköping'],
      ['corporate housing nykoping', 'worker accommodation nykoping', 'apartments nykoping sweden', 'temporary housing nykoping', 'ostlanken worker housing'],
      ['zakwaterowanie pracownicze nykoping', 'mieszkania firmowe nykoping', 'noclegi dla budowlańców nykoping szwecja', 'kwatery pracownicze nykoping', 'tymczasowe zakwaterowanie nykoping']
    ),
    metrics: [
      {
        value: '20+',
        label: ls('platser i Nyköping', 'beds in Nyköping', 'miejsc w Nyköping'),
        subtext: ls('Lägenheter & villor', 'Apartments & houses', 'Mieszkania i domy')
      },
      {
        value: '2026–35',
        label: ls('Ostlänken byggtid', 'Ostlänken build period', 'okres budowy Ostlänken'),
        subtext: ls('Långsiktigt boendebehov', 'Long-term housing need', 'Długoterminowe zapotrzebowanie')
      },
      {
        value: '24h',
        label: ls('svar på förfrågan', 'response time', 'czas odpowiedzi'),
        subtext: ls('Garanterad återkoppling', 'Guaranteed response', 'Gwarantowana odpowiedź')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Nyköping', 'Central Nyköping', 'Centrum Nyköping'),
        description: ls('Nära tågstation, service och restauranger.', 'Close to train station, services and restaurants.', 'Blisko dworca, usług i restauracji.'),
        distance: ls('10 min till Ostlänken-bygget', '10 min to Ostlänken construction', '10 min do budowy Ostlänken')
      },
      {
        name: ls('Arnö', 'Arnö', 'Arnö'),
        description: ls('Bostadsområde med villor och lugn miljö.', 'Residential area with houses and quiet environment.', 'Dzielnica mieszkalna z domami i spokojnym otoczeniem.'),
        distance: ls('8 min till centrum', '8 min to downtown', '8 min do centrum')
      },
      {
        name: ls('Skavsta-området', 'Skavsta area', 'Okolica Skavsta'),
        description: ls('Nära flygplatsen och logistikcentrum.', 'Near the airport and logistics center.', 'Blisko lotniska i centrum logistycznego.'),
        distance: ls('5 min till flygplatsen', '5 min to airport', '5 min do lotniska')
      }
    ],
    projects: [
      {
        name: ls('Ostlänken', 'Ostlänken Railway', 'Kolej Ostlänken'),
        description: ls('Boende för byggnadsarbetare vid höghastighetsjärnvägen.', 'Housing for construction workers at the high-speed railway.', 'Zakwaterowanie dla budowlańców przy kolei dużych prędkości.')
      },
      {
        name: ls('Skavsta utveckling', 'Skavsta Development', 'Rozwój Skavsta'),
        description: ls('Team vid flygplats- och logistikprojekt.', 'Crews at airport and logistics projects.', 'Ekipy przy projektach lotniskowych i logistycznych.')
      },
      {
        name: ls('Kommunal infrastruktur', 'Municipal Infrastructure', 'Infrastruktura komunalna'),
        description: ls('VA-projekt och vägbyggen i Sörmland.', 'Water and road construction in Sörmland.', 'Projekty wod-kan i drogowe w Sörmland.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi bygger en sträcka av Ostlänken och behövde 20 platser i Nyköping. StayOnSite ordnade allt på en vecka — vi kan fokusera på bygget.',
        'We\'re building a section of Ostlänken and needed 20 beds in Nyköping. StayOnSite arranged everything in a week — we can focus on construction.',
        'Budujemy odcinek Ostlänken i potrzebowaliśmy 20 miejsc w Nyköping. StayOnSite zorganizowało wszystko w tydzień — możemy skupić się na budowie.'
      ),
      author: 'Johan S.',
      role: ls('Projektledare', 'Project Manager', 'Kierownik projektu'),
      company: 'Anläggning & Infrastruktur'
    },
    faq: [
      {
        question: ls('Har ni boende nära Ostlänken-bygget?', 'Do you have housing near the Ostlänken construction?', 'Czy macie noclegi blisko budowy Ostlänken?'),
        answer: ls(
          'Ja, våra boenden i centrala Nyköping ligger 10–15 minuter från de pågående byggplatserna.',
          'Yes, our housing in central Nyköping is 10–15 minutes from the ongoing construction sites.',
          'Tak, nasze noclegi w centrum Nyköping są 10–15 minut od trwających budów.'
        )
      },
      {
        question: ls('Hur lång tid kan vi boka?', 'How long can we book?', 'Na jak długo możemy zarezerwować?'),
        answer: ls(
          'Från en vecka till flera år — perfekt för långvariga infrastrukturprojekt.',
          'From one week to several years — perfect for long-term infrastructure projects.',
          'Od jednego tygodnia do kilku lat — idealne dla długoterminowych projektów infrastrukturalnych.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['norrkoping', 'linkoping']
  },
  {
    slug: 'ornskoldsvik',
    name: 'Örnsköldsvik',
    region: 'Västernorrlands län',
    population: '56 000',
    description: 'Industristad vid Höga Kusten med Domsjö bioraffinaderi och Nya Ostkustbanan.',
    highlights: ['Domsjö bioraffinaderi', 'Nya Ostkustbanan', 'Höga Kusten', 'Skogsindustri'],
    industries: ['Bioindustri', 'Skogsindustri', 'Bygg & Anläggning', 'Infrastruktur'],
    coordinates: [63.2909, 18.7152],
    heroHook: ls(
      'Personalboende i Örnsköldsvik – nära Domsjö, Ostkustbanan och skogsindustrin',
      'Worker Housing in Örnsköldsvik – Near Domsjö, East Coast Line & Forestry',
      'Zakwaterowanie Pracownicze w Örnsköldsvik – Blisko Domsjö, Kolei Wschodniej i Leśnictwa'
    ),
    intro: ls(
      'Domsjö bioraffinaderi, Nya Ostkustbanans utbyggnad och den starka skogsindustrin gör Örnsköldsvik till en viktig ort för personalboende. Vi erbjuder möblerade lägenheter och hus nära arbetsplatserna — flexibla avtal, allt inklusive.',
      'The Domsjö biorefinery, expansion of the New East Coast Line and the strong forestry industry make Örnsköldsvik a key location for worker housing. We offer furnished apartments and houses near the worksites — flexible contracts, all-inclusive.',
      'Biorafineria Domsjö, rozbudowa Nowej Kolei Wschodniej i silny przemysł leśny czynią Örnsköldsvik kluczową lokalizacją dla zakwaterowania pracowniczego. Oferujemy umeblowane mieszkania i domy blisko miejsc pracy — elastyczne umowy, all-inclusive.'
    ),
    keywords: lk(
      ['personalboende örnsköldsvik', 'företagsboende örnsköldsvik', 'boende örnsköldsvik', 'montörboende örnsköldsvik', 'tillfälligt boende örnsköldsvik', 'lägenheter örnsköldsvik', 'byggboende norrland', 'korttidsboende örnsköldsvik'],
      ['corporate housing ornskoldsvik', 'worker accommodation ornskoldsvik', 'apartments ornskoldsvik sweden', 'temporary housing ornskoldsvik', 'staff accommodation high coast'],
      ['zakwaterowanie pracownicze ornskoldsvik', 'mieszkania firmowe ornskoldsvik', 'noclegi dla budowlańców ornskoldsvik szwecja', 'kwatery pracownicze ornskoldsvik', 'tymczasowe zakwaterowanie ornskoldsvik']
    ),
    metrics: [
      {
        value: '16+',
        label: ls('platser i Örnsköldsvik', 'beds in Örnsköldsvik', 'miejsc w Örnsköldsvik'),
        subtext: ls('Lägenheter & villor', 'Apartments & houses', 'Mieszkania i domy')
      },
      {
        value: '10',
        label: ls('min till Domsjö', 'min to Domsjö', 'min do Domsjö'),
        subtext: ls('Från centrala boenden', 'From central housing', 'Z centralnych noclegów')
      },
      {
        value: '0%',
        label: ls('avgift för husägare', 'fee for homeowners', 'prowizja dla właścicieli'),
        subtext: ls('Du behåller hela hyran', 'You keep the full rent', 'Zatrzymujesz cały czynsz')
      }
    ],
    neighborhoods: [
      {
        name: ls('Centrala Örnsköldsvik', 'Central Örnsköldsvik', 'Centrum Örnsköldsvik'),
        description: ls('Nära tågstation, hamn och service.', 'Close to train station, port and services.', 'Blisko dworca, portu i usług.'),
        distance: ls('10 min till Domsjö', '10 min to Domsjö', '10 min do Domsjö')
      },
      {
        name: ls('Domsjö', 'Domsjö', 'Domsjö'),
        description: ls('Intill bioraffinaderiet och industriområdet.', 'Next to the biorefinery and industrial area.', 'Obok biorafinerii i strefy przemysłowej.'),
        distance: ls('5 min till fabriken', '5 min to factory', '5 min do fabryki')
      },
      {
        name: ls('Själevad', 'Själevad', 'Själevad'),
        description: ls('Lugnt villaområde söder om centrum.', 'Quiet residential area south of downtown.', 'Spokojna dzielnica na południe od centrum.'),
        distance: ls('10 min till centrum', '10 min to downtown', '10 min do centrum')
      }
    ],
    projects: [
      {
        name: ls('Domsjö bioraffinaderi', 'Domsjö Biorefinery', 'Biorafineria Domsjö'),
        description: ls('Boende för processtekniker och underhållspersonal.', 'Housing for process technicians and maintenance staff.', 'Zakwaterowanie dla techników procesowych i personelu konserwacyjnego.')
      },
      {
        name: ls('Nya Ostkustbanan', 'New East Coast Line', 'Nowa Kolej Wschodnia'),
        description: ls('Byggnadsarbetare vid järnvägsutbyggnaden.', 'Construction workers at the railway expansion.', 'Budowlańcy przy rozbudowie kolei.')
      },
      {
        name: ls('Skogsindustri', 'Forestry Industry', 'Przemysł leśny'),
        description: ls('Montörer och maskinförare vid skogsbruk och sågverk.', 'Fitters and machine operators at forestry and sawmills.', 'Monterzy i operatorzy maszyn przy leśnictwie i tartakach.')
      }
    ],
    testimonial: {
      quote: ls(
        'Vi hade ett team på 8 personer vid Domsjö i sex månader. StayOnSite hittade villor med kort avstånd till fabriken — teamet var nöjda.',
        'We had a team of 8 at Domsjö for six months. StayOnSite found houses close to the factory — the team was happy.',
        'Mieliśmy zespół 8 osób w Domsjö przez sześć miesięcy. StayOnSite znalazło domy blisko fabryki — zespół był zadowolony.'
      ),
      author: 'Maria J.',
      role: ls('HR-ansvarig', 'HR Manager', 'Kierownik HR'),
      company: 'Process & Teknik'
    },
    faq: [
      {
        question: ls('Finns boende nära Domsjö?', 'Is there housing near Domsjö?', 'Czy są noclegi blisko Domsjö?'),
        answer: ls(
          'Ja, vi har lägenheter i Domsjö-området och centrala Örnsköldsvik, 5–10 minuter från bioraffinaderiet.',
          'Yes, we have apartments in the Domsjö area and central Örnsköldsvik, 5–10 minutes from the biorefinery.',
          'Tak, mamy mieszkania w okolicy Domsjö i centrum Örnsköldsvik, 5–10 minut od biorafinerii.'
        )
      },
      {
        question: ls('Hur fungerar det med längre kontrakt?', 'How do longer contracts work?', 'Jak działają dłuższe umowy?'),
        answer: ls(
          'Vi erbjuder avtal från en vecka till flera år med fast månadskostnad.',
          'We offer contracts from one week to several years with a fixed monthly cost.',
          'Oferujemy umowy od jednego tygodnia do kilku lat ze stałym kosztem miesięcznym.'
        )
      },
      {
        question: ls('Vad ingår i boendet?', 'What is included?', 'Co jest wliczone?'),
        answer: ls(
          'Möblerat, kök, sängkläder, wifi, el, värme och slutstädning.',
          'Furnished, kitchen, linens, wifi, electricity, heating and final cleaning.',
          'Umeblowane, kuchnia, pościel, wifi, prąd, ogrzewanie i sprzątanie końcowe.'
        )
      }
    ],
    nearby: ['umea', 'skelleftea']
  },
];

export const citySlugs = cities.map((city) => city.slug);

export const getCityBySlug = (slug: string): City | undefined => {
  return cities.find((city) => city.slug === slug);
};

export const getNearbyCities = (slug: string, count = 2): City[] => {
  const city = getCityBySlug(slug);
  if (!city) return [];

  const preferred = city.nearby
    .map((nearSlug) => getCityBySlug(nearSlug))
    .filter((nearCity): nearCity is City => Boolean(nearCity));

  if (preferred.length >= count) {
    return preferred.slice(0, count);
  }

  const fallback = cities.filter((item) => item.slug !== slug && !city.nearby.includes(item.slug));
  return [...preferred, ...fallback].slice(0, count);
};

