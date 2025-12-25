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
      author: 'Mikael Johansson',
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
      company: 'Bygg & Anläggning'
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
      company: 'Försvarsindustri'
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
      company: 'Järnväg & Infrastruktur'
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
        answer: ls('Ja, mellan varje skift gör vi full genomgång så nästa lag kan flytta in direkt.', 'Yes, between each shift we do a full cleaning so the next crew moves in immediately.', 'Tak, między zmianami wykonujemy pełne sprzątanie, by kolejna ekipa mogła się od razu wprowadzić.')
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
      'Säkra boende i Gävle för team som bygger hamnen, datacenter och skogsindustrin.',
      'Secure housing in Gävle for crews building the harbour, data centers and forest industry.',
      'Zapewnij noclegi w Gävle dla ekip budujących port, centra danych i przemysł leśny.'
    ),
    intro: ls(
      'Hamnutbyggnaden, nya datacenter och skogsindustriprojekt kräver att hela team kan bo nära arbetsplatserna. Vi har lägenheter och radhus i Andersberg, Brynäs och Sätra där era montörer får egna sovrum och delade kök.',
      'Harbor expansion, new data centers and forestry projects require whole crews living near the sites. We have apartments and townhouses in Andersberg, Brynäs and Sätra where your fitters get private bedrooms and shared kitchens.',
      'Rozbudowa portu, nowe centra danych i projekty leśne wymagają, by całe ekipy mieszkały blisko inwestycji. Mamy mieszkania i szeregowce w Andersberg, Brynäs i Sätra z prywatnymi sypialniami i wspólnymi kuchniami.'
    ),
    keywords: lk(
      ['personalboende gävle', 'företagslägenheter hamn', 'byggboende datacenter gävle'],
      ['corporate housing gavle', 'harbor staff apartments', 'datacenter construction housing gavle'],
      ['zakwaterowanie pracownicze gavle', 'mieszkania portowe', 'noclegi datacenter gavle']
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
      author: 'Anders Lindqvist',
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
    nearby: ['uppsala', 'stockholm']
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
      'Säkra boende i Boden för team som bygger försvarets nya anläggningar och infrastruktur.',
      'Secure housing in Boden for crews building new defense facilities and infrastructure.',
      'Zapewnij noclegi w Boden dla ekip budujących nowe obiekty obronne i infrastrukturę.'
    ),
    intro: ls(
      'Försvarsutbyggnaden och militära projekt kräver säkra och flexibla boenden. Vi har lägenheter och villor i centrala Boden och Svartbyträsk där era team får komfort efter långa arbetspass i norr.',
      'Defense expansion and military projects require secure and flexible housing. We have apartments and houses in central Boden and Svartbyträsk where your teams get comfort after long shifts in the north.',
      'Rozbudowa obronna i projekty wojskowe wymagają bezpiecznych i elastycznych noclegów. Mamy mieszkania i domy w centrum Boden i Svartbyträsk, gdzie Twoje ekipy odpoczną po długich zmianach na północy.'
    ),
    keywords: lk(
      ['personalboende boden', 'företagslägenheter försvar', 'byggboende militär boden'],
      ['corporate housing boden', 'defense staff apartments', 'military construction housing boden'],
      ['zakwaterowanie pracownicze boden', 'mieszkania obronne', 'noclegi wojskowe boden']
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
      author: 'Magnus Nordin',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Bygg & Anläggning'
    },
    faq: [
      {
        question: ls('Hur funkar säkerheten vid försvarsbyggen?', 'How does security work at defense builds?', 'Jak działa bezpieczeństwo przy obiektach obronnych?'),
        answer: ls(
          'Vi följer alla säkerhetskrav och samarbetar med försvarsmakten för clearance och dokumentation.',
          'We follow all security requirements and work with the armed forces for clearance and documentation.',
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
      'Säkra boende i Säffle för team som bygger möbel- och träindustrin.',
      'Secure housing in Säffle for crews building furniture and wood industry.',
      'Zapewnij noclegi w Säffle dla ekip budujących przemysł meblarski i drzewny.'
    ),
    intro: ls(
      'Möbel- och träindustrin i Säffle expanderar och kräver flexibla boenden för monteringsteam och produktionspersonal. Vi har lägenheter och villor i centrala Säffle och Nysäter där era team får komfort nära fabrikerna.',
      'The furniture and wood industry in Säffle is expanding and requires flexible housing for assembly crews and production staff. We have apartments and houses in central Säffle and Nysäter where your teams get comfort near the factories.',
      'Przemysł meblarski i drzewny w Säffle się rozrasta i wymaga elastycznych noclegów dla ekip montażowych i produkcyjnych. Mamy mieszkania i domy w centrum Säffle i Nysäter, gdzie Twoje ekipy mają komfort blisko fabryk.'
    ),
    keywords: lk(
      ['personalboende säffle', 'företagslägenheter möbelindustri', 'byggboende träindustri säffle'],
      ['corporate housing saffle', 'furniture industry apartments', 'wood industry housing saffle'],
      ['zakwaterowanie pracownicze saffle', 'mieszkania przemysł meblarski', 'noclegi przemysł drzewny saffle']
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
      author: 'Lars Bergström',
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
      'Säkra boende i Vingåker för team som bygger logistik och produktion.',
      'Secure housing in Vingåker for crews building logistics and production.',
      'Zapewnij noclegi w Vingåker dla ekip budujących logistykę i produkcję.'
    ),
    intro: ls(
      'Vingåkers strategiska läge mellan Stockholm och Örebro gör staden perfekt för logistikprojekt. Vi har lägenheter och villor där era team får ro efter långa arbetspass och kan nå både E4 och E20 på minuter.',
      'Vingåker\'s strategic location between Stockholm and Örebro makes the town perfect for logistics projects. We have apartments and houses where your teams get peace after long shifts and can reach both E4 and E20 within minutes.',
      'Strategiczne położenie Vingåker między Sztokholmem a Örebro czyni miasto idealnym dla projektów logistycznych. Mamy mieszkania i domy, gdzie Twoje ekipy odpoczną po długich zmianach i dotrą do E4 i E20 w kilka minut.'
    ),
    keywords: lk(
      ['personalboende vingåker', 'företagslägenheter logistik', 'byggboende produktion vingåker'],
      ['corporate housing vingaker', 'logistics staff apartments', 'production housing vingaker'],
      ['zakwaterowanie pracownicze vingaker', 'mieszkania logistyczne', 'noclegi produkcyjne vingaker']
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
      author: 'Johan Svensson',
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
      'Säkra boende i Västervik för team som bygger hamnen och skeppsvarven.',
      'Secure housing in Västervik for crews building the harbor and shipyards.',
      'Zapewnij noclegi w Västervik dla ekip budujących port i stocznie.'
    ),
    intro: ls(
      'Skeppsvarven och hamnutbyggnaden kräver specialistkompetens som ofta arbetar projektbaserat. Vi har lägenheter och villor i Västervik och Gamleby där era team får bo nära vattnet och arbetsplatserna.',
      'The shipyards and harbor expansion require specialist skills that often work project-based. We have apartments and houses in Västervik and Gamleby where your teams live near the water and work sites.',
      'Stocznie i rozbudowa portu wymagają specjalistów często pracujących projektowo. Mamy mieszkania i domy w Västervik i Gamleby, gdzie Twoje ekipy mieszkają blisko wody i miejsca pracy.'
    ),
    keywords: lk(
      ['personalboende västervik', 'företagslägenheter skeppsvarv', 'byggboende hamn västervik'],
      ['corporate housing vastervik', 'shipyard staff apartments', 'harbor construction housing vastervik'],
      ['zakwaterowanie pracownicze vastervik', 'mieszkania stoczniowe', 'noclegi portowe vastervik']
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
      author: 'Per Andersson',
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
      'Säkra boende i Motala för team som bygger verkstäder och marina anläggningar.',
      'Secure housing in Motala for crews building workshops and marine facilities.',
      'Zapewnij noclegi w Motala dla ekip budujących warsztaty i obiekty morskie.'
    ),
    intro: ls(
      'Verkstadsindustrin och Göta kanal kräver boenden nära arbetsplatserna. Vi har lägenheter och villor i Motala och Borensberg där era team får bo vid Vättern med kort resa till fabrikerna.',
      'The engineering industry and Göta Canal require housing near the workplaces. We have apartments and houses in Motala and Borensberg where your teams live by Vättern with short distance to the factories.',
      'Przemysł maszynowy i Kanał Göta wymagają noclegów blisko miejsca pracy. Mamy mieszkania i domy w Motala i Borensberg, gdzie Twoje ekipy mieszkają nad Vättern z krótką drogą do fabryk.'
    ),
    keywords: lk(
      ['personalboende motala', 'företagslägenheter verkstad', 'byggboende kanal motala'],
      ['corporate housing motala', 'workshop staff apartments', 'canal construction housing motala'],
      ['zakwaterowanie pracownicze motala', 'mieszkania warsztatowe', 'noclegi kanałowe motala']
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
      author: 'Karin Nilsson',
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
      'Säkra boende i Luleå för team som bygger gruvor, datacenter och hamnen.',
      'Secure housing in Luleå for crews building mines, data centers and the harbor.',
      'Zapewnij noclegi w Luleå dla ekip budujących kopalnie, centra danych i port.'
    ),
    intro: ls(
      'Gruvindustrin, Facebook och nya datacenter gör Luleå till en av Sveriges mest expansiva städer. Vi har lägenheter och villor i Luleå och Porsön där era team får bo nära arbetsplatserna med norrlänsk komfort.',
      'The mining industry, Facebook and new data centers make Luleå one of Sweden\'s most expansive cities. We have apartments and houses in Luleå and Porsön where your teams live near the workplaces with northern comfort.',
      'Przemysł wydobywczy, Facebook i nowe centra danych czynią Luleå jednym z najbardziej rozwijających się miast Szwecji. Mamy mieszkania i domy w Luleå i Porsön, gdzie Twoje ekipy mieszkają blisko pracy z północnym komfortem.'
    ),
    keywords: lk(
      ['personalboende luleå', 'företagslägenheter datacenter', 'byggboende gruva luleå'],
      ['corporate housing lulea', 'datacenter staff apartments', 'mining construction housing lulea'],
      ['zakwaterowanie pracownicze lulea', 'mieszkania datacenter', 'noclegi kopalnie lulea']
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
      author: 'Emma Lundqvist',
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
          'Fullt möblerat med kök, sängkläder, städ och el/värme/wifi. Extra viktigt i norr!',
          'Fully furnished with kitchen, bed linens, cleaning and electricity/heating/wifi. Extra important up north!',
          'W pełni umeblowane z kuchnią, pościelą, sprzątaniem i prądem/ogrzewaniem/wifi. Szczególnie ważne na północy!'
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
      'Säkra boende i Oskarshamn för team som bygger kärnkraft, hamnen och industrin.',
      'Secure housing in Oskarshamn for crews building nuclear power, harbor and industry.',
      'Zapewnij noclegi w Oskarshamn dla ekip budujących energię jądrową, port i przemysł.'
    ),
    intro: ls(
      'Kärnkraftverket OKG och hamnutbyggnaden kräver specialkompetens med säkerhetsclearance. Vi har lägenheter och villor i Oskarshamn och Figeholm där era team får bo nära arbetsplatserna med högsta säkerhetskrav.',
      'The OKG nuclear power plant and harbor expansion require specialist skills with security clearance. We have apartments and houses in Oskarshamn and Figeholm where your teams live near the workplaces with highest security requirements.',
      'Elektrownia jądrowa OKG i rozbudowa portu wymagają specjalistów z dopuszczeniem bezpieczeństwa. Mamy mieszkania i domy w Oskarshamn i Figeholm, gdzie Twoje ekipy mieszkają blisko pracy z najwyższymi wymaganiami bezpieczeństwa.'
    ),
    keywords: lk(
      ['personalboende oskarshamn', 'företagslägenheter kärnkraft', 'byggboende okg oskarshamn'],
      ['corporate housing oskarshamn', 'nuclear power staff apartments', 'okg construction housing oskarshamn'],
      ['zakwaterowanie pracownicze oskarshamn', 'mieszkania energetyka jądrowa', 'noclegi okg oskarshamn']
    ),
    metrics: [
      {
        value: '35',
        label: ls('platser nära OKG', 'beds near OKG', 'miejsc blisko OKG'),
        subtext: ls('Säkerhetsclearade boenden', 'Security-cleared housing', 'Mieszkania z dopuszczeniem')
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
        description: ls('Boende för tekniker och ingenjörer med säkerhetsclearance.', 'Housing for technicians and engineers with security clearance.', 'Zakwaterowanie dla techników i inżynierów z dopuszczeniem bezpieczeństwa.')
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
        'Vi behövde plats för 15 tekniker vid OKG med säkerhetsclearance och StayOnSite löste lägenheter i Figeholm med 5 minuters resa till anläggningen.',
        'We needed housing for 15 technicians at OKG with security clearance and StayOnSite arranged apartments in Figeholm with a 5-minute drive to the facility.',
        'Potrzebowaliśmy noclegów dla 15 techników przy OKG z dopuszczeniem bezpieczeństwa i StayOnSite zorganizowało mieszkania w Figeholm – 5 minut jazdy do obiektu.'
      ),
      author: 'Stefan Karlsson',
      role: ls('Projektchef', 'Project Manager', 'Kierownik projektu'),
      company: 'Kärnkraft & Energi'
    },
    faq: [
      {
        question: ls('Hur funkar säkerheten vid kärnkraftverket?', 'How does security work at the nuclear plant?', 'Jak działa bezpieczeństwo przy elektrowni?'),
        answer: ls(
          'Vi samarbetar med OKG för clearance och dokumentation enligt alla säkerhetskrav.',
          'We work with OKG for clearance and documentation according to all security requirements.',
          'Współpracujemy z OKG przy dopuszczeniach i dokumentacji zgodnie z wszystkimi wymogami bezpieczeństwa.'
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
      'Säkra boende i Umeå för team vid sjukhuset och industrin.',
      'Secure housing in Umeå for crews at the hospital and industry.',
      'Zapewnij noclegi w Umeå dla ekip przy szpitalu i w przemyśle.'
    ),
    intro: ls(
      'Norrlands universitetssjukhus och industrin i Umeå driver stora projekt som kräver tillfälliga boenden. Vi har lägenheter och hus på Ersboda, Teg och Mariehem där era team bor bekvämt nära arbetsplatserna.',
      'Norrlands University Hospital and the industry in Umeå drive large projects requiring temporary housing. We have apartments and houses in Ersboda, Teg and Mariehem where your teams live comfortably near the workplaces.',
      'Szpital Uniwersytecki Norrlands i przemysł w Umeå napędzają duże projekty wymagające tymczasowych noclegów. Mamy mieszkania i domy na Ersboda, Teg i Mariehem, gdzie Twoje ekipy mieszkają wygodnie blisko pracy.'
    ),
    keywords: lk(
      ['personalboende umeå', 'företagslägenheter sjukhus', 'byggboende norrbotniabanan'],
      ['corporate housing umea', 'hospital staff apartments', 'norrbotniabanan construction housing'],
      ['zakwaterowanie pracownicze umea', 'mieszkania szpitalne', 'noclegi norrbotniabanan']
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
      author: 'Klara Wikström',
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
    nearby: ['lulea', 'sundsvall']
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

