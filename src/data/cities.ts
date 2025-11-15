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
      'Säkra personalboende i Stockholm utan att fastna i bostadsköer.',
      'Secure staff housing in Stockholm without getting stuck in waiting lists.',
      'Zapewnij zakwaterowanie pracownikom w Sztokholmie bez czekania w kolejkach.'
    ),
    intro: ls(
      'Slussen, tunnelbaneutbyggnaden och datacenter runt Stockholm kräver bemanning som kan ändras varje vecka. Vi har färdigförhandlade lägenheter där hela lag bor nära arbetsplatsen och får en komplett plan inom 24 timmar.',
      'Projects like Slussen, the metro extension and new data centers change staffing needs weekly. We already have negotiated apartments so whole crews live close to the site and receive a full housing plan within 24 hours.',
      'Budowy takie jak Slussen, rozbudowa metra czy centra danych wymagają elastycznych ekip. Mamy wynegocjowane mieszkania, dzięki czemu całe zespoły mieszkają blisko inwestycji i otrzymują pełny plan zakwaterowania w 24 godziny.'
    ),
    keywords: lk(
      ['personalboende stockholm', 'företagslägenheter stockholm', 'byggboende stockholm'],
      ['corporate housing stockholm', 'staff apartments stockholm', 'construction housing stockholm'],
      ['zakwaterowanie pracownicze sztokholm', 'mieszkania firmowe sztokholm', 'noclegi dla ekip sztokholm']
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
        subtext: ls('Kajsa eller Natalie återkopplar direkt', 'Kajsa or Natalie replies immediately', 'Kajsa lub Natalie oddzwania od razu')
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
        'Vi behövde 18 montörer nära Frihamnen och StayOnSite löste tre lägenheter i samma hus på två dygn.',
        'We needed 18 fitters near Frihamnen and StayOnSite secured three apartments in the same building within two days.',
        'Potrzebowaliśmy 18 monterów przy Frihamnen i StayOnSite załatwiło trzy mieszkania w tym samym budynku w dwa dni.'
      ),
      author: 'Mikael Johansson',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Implenia Sverige'
    },
    faq: [
      {
        question: ls('Kan ni ordna parkering för servicebilar?', 'Can you arrange parking for service vans?', 'Czy możecie zorganizować parking dla aut serwisowych?'),
        answer: ls('Ja, flera av våra fastigheter i Solna, Årsta och Barkarby har reserverade platser. Ange behovet i briefen så inkluderar vi det i offerten.', 'Yes, our properties in Solna, Årsta and Barkarby have reserved spots. Mention the need in your brief and we include it in the proposal.', 'Tak, w Solnie, Årście i Barkarby mamy zarezerwowane miejsca. Wpiszcie to w briefie, a dodamy do oferty.')
      },
      {
        question: ls('Hur nära city kan ni placera större lag?', 'How close to downtown can you place larger crews?', 'Jak blisko centrum możecie ulokować większe ekipy?'),
        answer: ls('För team över 10 personer använder vi Hammarby Sjöstad, Liljeholmen och Solna där vi kan blockhyra hela trapphus.', 'For teams above 10 people we use Hammarby Sjöstad, Liljeholmen and Solna where we can block-rent entire stairwells.', 'Dla ekip powyżej 10 osób korzystamy z Hammarby Sjöstad, Liljeholmen i Solny, gdzie możemy wynająć całe klatki.')
      },
      {
        question: ls('Tar ni hand om städning mellan passen?', 'Do you handle cleaning between shifts?', 'Czy zajmujecie się sprzątaniem między zmianami?'),
        answer: ls('Ja, slutstädning och månadsvis genomgång ingår alltid i Stockholm.', 'Yes, final cleaning and monthly inspections are always included in Stockholm.', 'Tak, sprzątanie końcowe i comiesięczne inspekcje są w cenie w Sztokholmie.')
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
    heroHook: ls('Placera byggteam i Göteborg nära hamnen och Hisingen utan extra administration.', 'House your crews in Gothenburg close to the harbour and Hisingen without extra admin.', 'Zakwateruj ekipy w Göteborgu blisko portu i Hisingen bez dodatkowej biurokracji.'),
    intro: ls('Från Hisingsbron till varvsrenoveringar behövs boenden med kort restid och enkel parkering. Vi har hus och större lägenheter på Hisingen, Majorna och Mölndal där hela lag kan dela kök och jobba skift dygnet runt.', 'From Hisingsbron to yard renovations you need housing with short travel time and easy parking. We run houses and large apartments on Hisingen, Majorna and Mölndal so whole crews share kitchens and run shifts 24/7.', 'Od mostu Hisingsbron po remonty stoczni potrzeba noclegów z krótkim dojazdem i parkingiem. Mamy domy i duże mieszkania na Hisingen, w Majornie i Mölndal, gdzie całe ekipy dzielą kuchnie i pracują na zmiany.'),
    keywords: lk(
      ['personalboende göteborg', 'företagsboende göteborg', 'byggboende hisingen'],
      ['staff housing gothenburg', 'corporate housing gothenburg', 'construction housing hisingen'],
      ['zakwaterowanie pracownicze göteborg', 'noclegi firmowe göteborg', 'mieszkania hisingen']
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
      author: 'Helena Ström',
      role: ls('Site Manager', 'Site Manager', 'Kierownik budowy'),
      company: 'AFRY Industrial'
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
    heroHook: ls('Boenden för montörer i Malmö med 30 minuter till både Hyllie och Copenhagen Gate.', 'House installers in Malmö with 30 minutes to both Hyllie and Copenhagen Gate.', 'Zakwateruj monterów w Malmö z 30 minutami do Hyllie i Copenhagen Gate.'),
    intro: ls('När projekten rullar i Hyllie, Västra Hamnen eller utefter E6:an behöver ni flexibla kontrakt. Vi fyller hus i Limhamn, Fosie och centrala Malmö med komplett köksutrustning, veckostäd och tvättlösningar.', 'When projects run in Hyllie, Västra Hamnen or along the E6 you need flexible contracts. We fill houses in Limhamn, Fosie and central Malmö with full kitchens, weekly cleaning and laundry.', 'Gdy projekty toczą się w Hyllie, Västra Hamnen lub wzdłuż E6, potrzebujecie elastycznych umów. Zapewniamy domy w Limhamn, Fosie i centrum Malmö z pełnymi kuchniami, cotygodniowym sprzątaniem i praniem.'),
    keywords: lk(
      ['personalboende malmö', 'företagsboende malmö', 'relocation malmö bygg'],
      ['staff housing malmo', 'corporate apartments malmo', 'relocation malmo construction'],
      ['zakwaterowanie pracownicze malmo', 'mieszkania firmowe malmo', 'relokacja budowlana malmo']
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
        subtext: ls('BroBizz och transit på begäran', 'BroBizz and transit on request', 'BroBizz i przeprawy na życzenie')
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
      author: 'Peter Madsen',
      role: ls('Operations Manager', 'Operations Manager', 'Dyrektor operacyjny'),
      company: 'Per Aarsleff'
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
        answer: ls('Vi förser chaufförer med BroBizz och planerar lägenheter nära Hyllie för snabb passage.', 'We supply drivers with BroBizz and place apartments near Hyllie for fast passage.', 'Zapewniamy kierowcom BroBizz i wybieramy mieszkania blisko Hyllie, by szybko przekraczać most.')
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
    heroHook: ls('Snabbt personalboende i Uppsala för life science- och utbildningsprojekt.', 'Fast staff housing in Uppsala for life-science and education projects.', 'Szybkie zakwaterowanie w Uppsali dla projektów life science i edukacyjnych.'),
    intro: ls('Akademiska sjukhuset, nya campusytor och bostadsexpansion kräver boenden där installatörer kan dela vardag. Vi har kedjehus och större lägenheter i Gränby, Rosendal och Bäcklösa med kort restid till både city och industriområden.', 'The university hospital, new campuses and housing expansion need accommodation where installers can live comfortably. We run townhouses and larger flats in Gränby, Rosendal and Bäcklösa with short travel to both city and industrial zones.', 'Szpital uniwersytecki, nowe kampusy i rozbudowa mieszkaniowa wymagają zakwaterowania, w którym monterzy mogą normalnie żyć. Prowadzimy segmenty i większe mieszkania w Gränby, Rosendalu i Bäcklöse z krótkim dojazdem do centrum i stref przemysłowych.'),
    keywords: lk(
      ['personalboende uppsala', 'företagslägenheter uppsala', 'byggboende life science'],
      ['staff housing uppsala', 'corporate apartments uppsala', 'life science housing uppsala'],
      ['zakwaterowanie pracownicze uppsala', 'mieszkania firmowe uppsala', 'noclegi life science uppsala']
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
      author: 'Anna Törnqvist',
      role: ls('Construction Manager', 'Construction Manager', 'Kierownik budowy'),
      company: 'Peab'
    },
    faq: [
      {
        question: ls('Kan ni hantera arbetstillstånd hos Akademiska?', 'Can you handle site permits at the hospital?', 'Czy możecie zająć się przepustkami do szpitala?'),
        answer: ls('Ja, vi har rutin för passerkort och introduktion när teamen jobbar i sjukhusmiljö.', 'Yes, we manage badges and onboarding when teams work inside the hospital.', 'Tak, organizujemy przepustki i szkolenia, gdy zespoły pracują w szpitalu.')
      },
      {
        question: ls('Hur långt i förväg måste vi boka?', 'How far in advance must we book?', 'Z jakim wyprzedzeniem musimy rezerwować?'),
        answer: ls('Med 5–7 dagars framförhållning kan vi blockhyra större ytor, men nödlösningar sker på 24 h.', 'With 5–7 days notice we can block-rent larger spaces, yet emergency moves happen within 24h.', 'Przy wyprzedzeniu 5–7 dni możemy zarezerwować większe powierzchnie, ale sytuacje awaryjne obsługujemy w 24 h.')
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
    heroHook: ls('Bo nära Mälarenergi och logistiknavet i Västerås utan att offra komfort.', 'Stay close to Mälarenergi and the logistics hub in Västerås without sacrificing comfort.', 'Mieszkaj blisko Mälarenergi i centrum logistycznego w Västerås bez rezygnacji z wygody.'),
    intro: ls('Västerås projekten drivs av batterifabriker, kraftverk och logistik. Vi placerar team i Tunbytorp, Gideonsberg och Köpingstrakten för snabb åtkomst till E18 och hamnen. Alltid möblerat, alltid slutstädat.', 'Local projects run on battery plants, power stations and logistics hubs. We place teams in Tunbytorp, Gideonsberg and Köping for fast access to the E18 and harbour. Always furnished and cleaned.', 'Projekty w Västerås to fabryki baterii, elektrownie i logistyczne huby. Ulokujemy ekipy w Tunbytorp, Gideonsbergu i okolicach Köping, z szybkim dojazdem do E18 i portu. Zawsze umeblowane, zawsze wysprzątane.'),
    keywords: lk(
      ['personalboende västerås', 'företagsboende mälarenergi', 'byggboende batterifabrik'],
      ['staff housing vasteras', 'corporate housing malarenergi', 'battery plant housing sweden'],
      ['zakwaterowanie pracownicze vasteras', 'mieszkania firmowe malarenergi', 'noclegi fabryka baterii']
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
        name: ls('Northvolt/ABB', 'Northvolt/ABB', 'Northvolt/ABB'),
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
      author: 'Joakim Edlund',
      role: ls('Site Lead', 'Site Lead', 'Kierownik obiektu'),
      company: 'Hitachi Energy'
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
    heroHook: ls('Placera team i Örebro mitt mellan E18 och E20 – perfekt för logistikbyggen.', 'Base your crews in Örebro right between the E18 and E20 – perfect for logistics builds.', 'Ulokuj ekipy w Örebro pomiędzy E18 a E20 – idealnie dla projektów logistycznych.'),
    intro: ls('Universitetet, nya logistikparker och sjukhusutbyggnaden kräver flexibla boenden. Vi jobbar med moderna radhus och lägenheter i Bettorp, Adolfsberg och Marieberg så att lag kan dela gemensamma ytor men ha egna sovrum.', 'The university, logistics parks and hospital expansion demand flexible housing. We use modern townhouses and apartments in Bettorp, Adolfsberg and Marieberg so crews share common areas but keep private bedrooms.', 'Uniwersytet, parki logistyczne i rozbudowa szpitala wymagają elastycznych noclegów. Korzystamy z nowoczesnych segmentów i mieszkań w Bettorp, Adolfsbergu i Mariebergu, by ekipy miały wspólne przestrzenie i własne sypialnie.'),
    keywords: lk(
      ['personalboende örebro', 'företagsboende logistik', 'byggboende universitet örebro'],
      ['staff housing orebro', 'logistics corporate housing', 'university construction housing orebro'],
      ['zakwaterowanie pracownicze orebro', 'mieszkania logistyczne', 'noclegi kampusowe orebro']
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
      author: 'Caroline Westin',
      role: ls('Projektledare', 'Project Lead', 'Kierownik projektu'),
      company: 'NCC'
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
    heroHook: ls('Bo nära Saab, universitetet och Mjärdevi – allt i samma boendeplan.', 'Stay close to Saab, the university and Mjärdevi – all in one housing plan.', 'Mieszkaj blisko Saaba, uniwersytetu i Mjärdevi – w jednym planie zakwaterowania.'),
    intro: ls('Linköping drivs av högteknologi och avancerade installationer. Vi placerar projektlag i Lambohov, Vallastaden och Mjärdevi så att resan till labb och hangarer tar under tio minuter.', 'Linköping runs on high-tech and advanced installs. We place crews in Lambohov, Vallastaden and Mjärdevi so trips to labs and hangars stay under ten minutes.', 'Linköping to wysokie technologie i zaawansowane instalacje. Umieszczamy ekipy w Lambohov, Vallastaden i Mjärdevi, aby dojazd do laboratoriów i hangarów zajmował mniej niż dziesięć minut.'),
    keywords: lk(
      ['personalboende linköping', 'företagslägenheter mjärdevi', 'byggboende saab'],
      ['staff housing linkoping', 'corporate apartments mjar devi', 'saab construction housing'],
      ['zakwaterowanie pracownicze linkoping', 'mieszkania firmowe mjar devi', 'noclegi saab']
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
        description: ls('Boenden åt installatörer i sjukhusmiljö.', 'Housing for installers working inside the hospital.', 'Zakwaterowanie dla instalatorów pracujących w szpitalu.')
      }
    ],
    testimonial: {
      quote: ls('Vi slapp hotell helt – StayOnSite ordnade studios i Vallastaden där teknikerna kunde jobba kvällar ostört.', 'We skipped hotels entirely – StayOnSite set up studios in Vallastaden so technicians could work evenings undisturbed.', 'Obeszło się bez hoteli – StayOnSite zorganizowało studia w Vallastaden, więc technicy mogli spokojnie pracować wieczorami.'),
      author: 'Daniel Krausz',
      role: ls('Program Manager', 'Program Manager', 'Kierownik programu'),
      company: 'Saab'
    },
    faq: [
      {
        question: ls('Hur löser ni säkerhetsklassning?', 'How do you handle security clearance?', 'Jak zapewniacie dostęp z certyfikacją bezpieczeństwa?'),
        answer: ls('Vi koordinerar med Saab och kommunen för bakgrundskrav och uppdaterar gäster innan inflytt.', 'We coordinate with Saab and the municipality for background checks and brief guests before move-in.', 'Koordynujemy z Saabem i gminą wymogi sprawdzeń i przygotowujemy gości przed wprowadzeniem.')
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
    heroHook: ls('Placera team i Helsingborg med gångavstånd till hamn och färjeläge.', 'Place your crews in Helsingborg within walking distance of the harbour and ferry terminal.', 'Ulokuj ekipy w Helsingborgu w zasięgu spaceru od portu i promu.'),
    intro: ls('Utvecklingen av Helsingborgs hamn, Oceanhamnen och logistikterminalerna kräver snabb access till färjor och E4. Vi har lägenheter och radhus i Oceanhamnen, Eneborg och Ättekulla med stora förråd och parkering.', 'The harbour, Oceanhamnen and logistics terminals need fast access to ferries and the E4. We offer apartments and townhouses in Oceanhamnen, Eneborg and Ättekulla with ample storage and parking.', 'Rozwój portu, Oceanhamnen i terminali logistycznych wymaga szybkiego dostępu do promów i E4. Zapewniamy mieszkania i segmenty w Oceanhamnen, Eneborgu i Ättekulli z dużymi magazynami i parkingami.'),
    keywords: lk(
      ['personalboende helsingborg', 'hamnboende bygg', 'företagsboende öresund'],
      ['staff housing helsingborg', 'harbour construction housing', 'oresund corporate housing'],
      ['zakwaterowanie pracownicze helsingborg', 'noclegi przy porcie', 'mieszkania firmowe oresund']
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
      author: 'Linda Mogensen',
      role: ls('Operations Lead', 'Operations Lead', 'Lider operacyjny'),
      company: 'NRC Group'
    },
    faq: [
      {
        question: ls('Kan ni kombinera Helsingborg och Helsingör?', 'Can you combine Helsingborg and Helsingør?', 'Czy możecie łączyć Helsingborg i Helsingør?'),
        answer: ls('Ja, vi ordnar passerkort och planerar boenden nära färjan för dagliga överfarter.', 'Yes, we arrange passes and place housing near the ferry for daily crossings.', 'Tak, organizujemy przepustki i lokujemy noclegi blisko promu na codzienne przeprawy.')
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
    heroHook: ls('Boendelösningar vid Vättern som funkar för både Elmia och logistikparken.', 'Housing by Lake Vättern that works for both Elmia and the logistics park.', 'Zakwaterowanie nad Vättern obsługujące Elmię i park logistyczny.'),
    intro: ls('Elmia-mässor, logistiknavet Torsvik och nya bostadskvarter kräver boenden med plats för utrustning. Vi använder kedjehus i Huskvarna, lägenheter i centrum och villor söder om stan där servicebilar får plats.', 'Elmia fairs, the Torsvik logistics hub and new housing blocks need space for equipment. We use townhouses in Huskvarna, central apartments and villas south of town where service vans fit.', 'Targi Elmia, hub logistyczny Torsvik i nowe osiedla potrzebują miejsca na sprzęt. Korzystamy z segmentów w Huskvarnie, mieszkań w centrum i willi na południu miasta, gdzie mieszczą się auta serwisowe.'),
    keywords: lk(
      ['personalboende jönköping', 'företagsboende torsvik', 'logistikboende elmia'],
      ['staff housing jonkoping', 'corporate housing torsvik', 'elmia logistics housing'],
      ['zakwaterowanie pracownicze jonkoping', 'mieszkania firmowe torsvik', 'noclegi logistyka elmia']
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
      author: 'Erik Lundén',
      role: ls('Project Director', 'Project Director', 'Dyrektor projektu'),
      company: 'Bravida'
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
    heroHook: ls('Få kontroll på boenden i Norrköping när Inre hamnen och Ostlänken expanderar.', 'Gain control over housing in Norrköping while Inre Hamnen and Ostlänken expand.', 'Zapewnij kontrolę nad noclegami w Norrköping, gdy rosną Inre Hamnen i Ostlänken.'),
    intro: ls('Industrilandskapet, Ostlänken och Inre hamnen kräver att entreprenörer kan rotera team varje vecka. Vi hyr hela trapphus i Saltängen, Hageby och Åby så att ni får samlat boende med kort resa till byggena.', 'The industrial landscape, Ostlänken and Inre Hamnen demand weekly crew rotations. We lease entire stairwells in Saltängen, Hageby and Åby so you keep clustered housing with short rides to the sites.', 'Industrial Landscape, Ostlänken i Inre Hamnen wymagają cotygodniowych rotacji ekip. Wynajmujemy całe klatki schodowe w Saltängen, Hageby i Åby, aby zapewnić zwarte noclegi z krótkim dojazdem na budowę.'),
    keywords: lk(
      ['personalboende norrköping', 'företagsboende ostlänken', 'byggboende inre hamnen'],
      ['staff housing norrkoping', 'ostlanken corporate housing', 'inre hamnen construction housing'],
      ['zakwaterowanie pracownicze norrkoping', 'mieszkania firmowe ostlanken', 'noclegi inre hamnen']
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
      author: 'Sara Blom',
      role: ls('Site Manager', 'Site Manager', 'Kierownik budowy'),
      company: 'Skanska Industrial'
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
        answer: ls('Ja, mellan varje skift gör vi full genomgång så nästa lag kan flytta in direkt.', 'Yes, between each shift we do a full cleaning so the next crew moves in immediately.', 'Tak, między zmianami wykonujemy pełne sprzątanie, by kolejna ekipa mogła się od razu wprowadzić.')
      }
    ],
    nearby: ['linkoping', 'stockholm']
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

