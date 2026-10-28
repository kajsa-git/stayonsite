import { defineGuide, ls } from './common';

export const bodenGuide = defineGuide({
  name: 'Boden',
  hero: ls(
    'Företagsboende i Boden – hus och lägenheter för arbetslag',
    'Corporate housing in Boden – houses and apartments for project teams',
    'Zakwaterowanie firmowe w Boden – domy i mieszkania dla ekip',
  ),
  intro: ls(
    'Söker ni personalboende för ett uppdrag i Boden? StayOnSite hjälper er att jämföra möblerade hus och företagslägenheter utifrån arbetsplats, separata sovrum och projektperiod. Här får ni vägledning för boende vid industriparken i Svartbyn, uppdrag i centrala Boden och arbetslag som pendlar mellan Boden och Luleå.',
    'Looking for worker accommodation for a project in Boden? StayOnSite helps compare furnished houses and corporate apartments by worksite, separate bedrooms and project dates. This guide covers the industrial park in Svartbyn, assignments in central Boden and teams travelling between Boden and Luleå.',
    'Szukasz zakwaterowania dla pracowników w Boden? StayOnSite pomaga porównać umeblowane domy i mieszkania według miejsca pracy, oddzielnych sypialni i terminu projektu. Przewodnik obejmuje park przemysłowy w Svartbyn, zlecenia w centrum Boden i zespoły dojeżdżające między Boden a Luleå.',
  ),
  metadata: ls(
    'Företagsboende i Boden för arbetslag. Jämför Svartbyn, centrum och Sävast, se publicerade bostäder och planera sovrum, parkering och projektperiod.',
    'Corporate housing in Boden for project teams. Compare Svartbyn, central Boden and Sävast, explore properties and plan bedrooms, parking and project dates.',
    'Zakwaterowanie firmowe w Boden. Porównaj Svartbyn, centrum i Sävast. Sprawdź obiekty i zaplanuj sypialnie, parking oraz terminy projektu.',
  ),
  projects: [
    {
      name: ls('Boden Industrial Park och Stegra', 'Boden Industrial Park and Stegra', 'Boden Industrial Park i Stegra'),
      description: ls(
        'Industriparken i Svartbyn är ett eget mål för resan, skilt från Bodens centrum. Vid uppdrag kopplade till Stegra eller infrastrukturen runt området behöver boendesökningen utgå från er aktuella infart och samlingsplats. Ange vilket område entreprenaden gäller och när varje arbetslag ska vara på plats.',
        'The industrial park in Svartbyn is a separate destination from central Boden. For assignments connected with Stegra or surrounding infrastructure, start the housing search from your actual entrance and assembly point. Specify the site area and when each crew needs to arrive.',
        'Park przemysłowy w Svartbyn to inne miejsce docelowe niż centrum Boden. Przy zleceniach związanych ze Stegra lub otaczającą infrastrukturą szukaj noclegów względem właściwego wjazdu i miejsca zbiórki. Podaj teren robót i terminy przyjazdu poszczególnych ekip.',
      ),
    },
    {
      name: ls('Bygg- och installationsuppdrag', 'Construction and installation work', 'Prace budowlane i instalacyjne'),
      description: ls(
        'För arbetsplatser i tätorten kan närhet till service väga lika tungt som avståndet till bygget. Beskriv om montörer behöver åka direkt hemifrån med servicebil eller samlas vid ett gemensamt förråd. Det påverkar både områdesval och hur många parkeringsplatser boendet behöver.',
        'For urban worksites, access to services can matter as much as distance to the job. Explain whether installers travel directly from the property in work vans or assemble at a shared depot. This affects both location and the number of parking spaces needed.',
        'Przy pracy w mieście dostęp do usług może być równie ważny jak odległość od budowy. Napisz, czy monterzy jadą bezpośrednio z domu autem służbowym, czy spotykają się w magazynie. Wpływa to na wybór okolicy i liczbę miejsc parkingowych.',
      ),
    },
    {
      name: ls('Arbetslag på flera orter', 'Teams working across locations', 'Zespoły pracujące w kilku miejscach'),
      description: ls(
        'Boden och Luleå kan ingå i samma uppdrag, men välj bas efter var arbetspassen faktiskt börjar. Om olika delar av laget arbetar på skilda anläggningar kan två mindre boenden vara mer praktiska än ett gemensamt. Skicka arbetsplatserna och fördelningen mellan dem i samma förfrågan.',
        'Boden and Luleå may form part of one assignment, but choose the base around where shifts actually begin. If crews work at different facilities, two smaller properties may be more practical than one shared house. Include the worksites and team allocation in one enquiry.',
        'Boden i Luleå mogą należeć do jednego zlecenia, ale bazę wybierz według miejsca rozpoczęcia zmian. Gdy ekipy pracują w różnych zakładach, dwa mniejsze obiekty mogą być praktyczniejsze niż wspólny dom. W jednym zapytaniu podaj miejsca pracy i podział zespołu.',
      ),
    },
  ],
  areas: [
    {
      name: 'Norra Svartbyn, Erikslund och Fagernäs',
      suitableFor: ls('Om uppdraget gäller industriparken är dessa områden relevanta att jämföra med centrum. Börja med arbetsplatsens infart och kontrollera hur boendets läge fungerar för just ert transportupplägg.', 'For industrial park assignments, compare these areas with central Boden. Start with the worksite entrance and check how each property fits your transport arrangements.', 'Przy pracy w parku przemysłowym porównaj te okolice z centrum. Zacznij od wjazdu na teren zakładu i sprawdź, jak położenie obiektu pasuje do transportu zespołu.'),
      check: ls('Faktisk körväg, hämtning vid samåkning och parkeringsyta för samtliga fordon. Ett närliggande område innebär inte automatiskt gångavstånd till rätt grind.', 'Actual driving route, carpool pick-up and parking for all vehicles. A nearby area does not automatically mean walking distance to the correct gate.', 'Rzeczywista trasa, zbiórka przy wspólnych dojazdach i parking dla wszystkich aut. Bliska okolica nie oznacza dojścia pieszo do właściwej bramy.'),
    },
    {
      name: 'Centrala Boden',
      suitableFor: ls('För arbetslag som prioriterar vardagsservice eller har flera arbetsplatser i kommunen. En central lägenhet kan vara praktisk för den som kommer med tåg och samåker till jobbet.', 'For teams prioritising everyday services or several worksites in the municipality. A central apartment may suit staff arriving by train and sharing transport to work.', 'Dla ekip ceniących codzienne usługi lub pracujących w kilku miejscach gminy. Mieszkanie w centrum może odpowiadać osobom przyjeżdżającym pociągiem i wspólnie dojeżdżającym do pracy.'),
      check: ls('Avstånd från den konkreta adressen till matbutik och mötesplats, samt om parkering följer med bostaden eller ordnas separat.', 'Distance from the specific address to groceries and the meeting point, and whether parking is included or arranged separately.', 'Odległość konkretnego adresu od sklepu i miejsca zbiórki oraz to, czy parking należy do obiektu, czy wymaga osobnych ustaleń.'),
    },
    {
      name: 'Sävast',
      suitableFor: ls('Ett alternativ att ta med för arbetslag som söker hus och gemensamma ytor. Jämför läget med både arbetsplatsen och lagets inköp, tvätt och resor under lediga dagar.', 'An option for teams considering houses with shared living space. Compare the location with the worksite and the team’s shopping, laundry and days-off travel.', 'Opcja dla zespołów szukających domu ze wspólną przestrzenią. Porównaj lokalizację z miejscem pracy, zakupami, praniem i przejazdami w dni wolne.'),
      check: ls('Antal riktiga sovrum, badrum, möjlighet att laga mat samtidigt och utrymme för servicebilar. Bekräfta snöröjning om hyresperioden går över vintern.', 'Separate bedrooms, bathrooms, shared cooking capacity and space for work vans. Confirm snow clearance if the rental includes winter.', 'Oddzielne sypialnie, łazienki, możliwość wspólnego gotowania i miejsce na auta służbowe. Przy pobycie zimowym uzgodnij odśnieżanie.'),
    },
    {
      name: 'Södra Svartbyn och stråket mot Luleå',
      suitableFor: ls('För uppdrag där transporten går mellan tätorten, industriparken och andra arbetsplatser. Jämför bostäder efter hela veckans resor, särskilt om samma fordon används av flera personer.', 'For assignments involving travel between town, the industrial park and other worksites. Compare properties against the whole week’s journeys, especially when vehicles are shared.', 'Przy przejazdach między miastem, parkiem przemysłowym i innymi miejscami pracy. Porównaj obiekty według przejazdów z całego tygodnia, szczególnie gdy auta są współdzielone.'),
      check: ls('Vägval till varje infart, skiftens starttider och hur laget tar sig hem om någon arbetar över. Ange längsta acceptabla restid i förfrågan.', 'Routes to each entrance, shift start times and transport home when someone works late. State your maximum acceptable commute in the enquiry.', 'Trasy do każdego wjazdu, godziny zmian i powrót osób pracujących dłużej. W zapytaniu określ maksymalny akceptowany dojazd.'),
    },
  ],
  planning: [
    {
      title: ls('Planera vintervardagen redan vid bokning', 'Plan the winter routine before booking', 'Zaplanuj zimowy pobyt przed rezerwacją'),
      paragraphs: [ls(
        'När boendet ska fungera under flera månader i Boden behöver entré, parkering och uppvärmning vara tydliga delar av överenskommelsen. Fråga vem som sköter snöröjning och sandning, hur värmen debiteras och om det finns plats att torka arbetskläder. Har laget behov av motorvärmare eller laddning ska det anges som ett krav som kontrolleras för varje bostad.',
        'For a stay lasting several months in Boden, access, parking and heating need to be clear parts of the agreement. Ask who clears and grits access routes, how heating is charged and where workwear can dry. If engine heaters or charging are required, list them as requirements to check for each property.',
        'Przy kilkumiesięcznym pobycie w Boden dostęp do domu, parking i ogrzewanie powinny być jasno uzgodnione. Zapytaj o odśnieżanie, posypywanie dojść, rozliczenie ogrzewania i suszenie odzieży roboczej. Podgrzewanie silnika lub ładowanie auta wpisz jako wymagania do sprawdzenia dla każdego obiektu.',
      )],
    },
    {
      title: ls('Skiftarbete kräver rätt rumsfördelning', 'Match room allocation to shift patterns', 'Dopasuj podział pokoi do zmian'),
      paragraphs: [ls(
        'Åtta bäddar och åtta separata sovrum är olika upplägg. Om några arbetar natt behöver ni planera hur matlagning, dusch och tvätt fungerar när andra sover. Ange önskat antal egna rum, antal badrum och om arbetslaget anländer samtidigt. En planlösning ger ett bättre beslutsunderlag än enbart total bäddkapacitet.',
        'Eight beds and eight separate bedrooms are different arrangements. If some staff work nights, plan cooking, showers and laundry around those who sleep during the day. State the number of private rooms and bathrooms and whether everyone arrives together. A floor plan is more useful than bed capacity alone.',
        'Osiem łóżek i osiem oddzielnych sypialni to różne układy. Przy pracy nocnej zaplanuj gotowanie, prysznice i pranie z uwzględnieniem snu pozostałych osób. Podaj liczbę własnych pokoi, łazienek i terminy przyjazdu. Rzut obiektu daje więcej informacji niż sama liczba łóżek.',
      )],
    },
    {
      title: ls('Jämför boende och pendling i samma kalkyl', 'Compare accommodation and commuting together', 'Porównaj nocleg i dojazdy w jednym zestawieniu'),
      paragraphs: [ls(
        'Räkna på hela arbetslagets boendekostnad under projektperioden och lägg till transport, parkering och avtalad service. Ett lägre bostadspris behöver vägas mot fler dagliga resor. Om en entreprenad startar i etapper, dela upp behovet i bekräftade personer och senare tillkommande rum. Då kan offerten skilja på vad ni bokar nu och vad som behöver följas upp.',
        'Calculate the whole team’s housing cost for the project and add transport, parking and agreed services. Weigh a lower rent against extra daily travel. For phased mobilisation, separate confirmed arrivals from rooms needed later. The proposal can then distinguish what is booked now from requirements to follow up.',
        'Oblicz koszt zakwaterowania całej ekipy przez cały projekt, dodając transport, parking i uzgodnione usługi. Niższy czynsz zestaw z dodatkowymi codziennymi przejazdami. Przy etapowym rozpoczęciu oddziel potwierdzone przyjazdy od późniejszych pokoi. Propozycja wskaże wtedy obecną rezerwację i potrzeby do dalszych ustaleń.',
      )],
    },
  ],
  faq: [
    {
      question: ls('Kan vi söka boende för arbete vid Stegra i Boden?', 'Can we request housing for work at Stegra in Boden?', 'Czy można zapytać o noclegi do pracy przy Stegra w Boden?'),
      answer: ls('Ja. Ange arbetsplatsens aktuella infart, antal personer, sovrumsbehov och projektperiod. Vi jämför boendealternativ utifrån ert uppdrag. Företagsnamnet är en lägesreferens; er beställare bekräftar projektstart, samlingsplats och tillträde till arbetsområdet.', 'Yes. Include the current site entrance, headcount, bedrooms and project dates. We compare accommodation for your assignment. The company name identifies the location; your client confirms mobilisation, meeting point and site access.', 'Tak. Podaj aktualny wjazd, liczbę osób, sypialnie i termin projektu. Porównamy obiekty dla danego zlecenia. Nazwa firmy wskazuje lokalizację; rozpoczęcie prac, miejsce zbiórki i dostęp potwierdza zleceniodawca.'),
    },
    {
      question: ls('Är Sävast eller centrala Boden bäst för vårt arbetslag?', 'Is Sävast or central Boden better for our team?', 'Czy lepszą bazą dla zespołu jest Sävast czy centrum Boden?'),
      answer: ls('Det beror på arbetsplats, antal sovrum och transport. Jämför konkreta adresser med rätt infart, tillgång till service och parkeringsbehov. För ett arbetslag med flera skift kan rumsfördelning och badrum vara viktigare än att bo i ett visst område.', 'It depends on worksite, bedrooms and transport. Compare actual addresses against the correct entrance, services and parking. For teams on different shifts, room allocation and bathrooms may matter more than the area name.', 'Zależy to od miejsca pracy, sypialni i transportu. Porównaj konkretne adresy z właściwym wjazdem, usługami i parkingiem. Przy różnych zmianach układ pokoi i łazienki mogą być ważniejsze niż nazwa okolicy.'),
    },
    {
      question: ls('Kan samma förfrågan omfatta Boden och Luleå?', 'Can one enquiry cover both Boden and Luleå?', 'Czy jedno zapytanie może obejmować Boden i Luleå?'),
      answer: ls('Ja. Skicka arbetsplatserna, fördelningen av personal och datum för varje del. Vi kan undersöka en gemensam bas eller separata bostäder. Jämförelsen behöver utgå från arbetslagets verkliga resor och bekräftad tillgänglighet, inte en generell restid mellan städerna.', 'Yes. Send the worksites, crew allocation and dates for each part. We can investigate a shared base or separate properties. Compare the team’s actual journeys and confirmed availability rather than a general travel time between the towns.', 'Tak. Podaj miejsca pracy, podział pracowników i terminy każdej części. Możemy sprawdzić wspólną bazę lub osobne obiekty. Porównanie opiera się na rzeczywistych przejazdach i potwierdzonej dostępności, a nie ogólnym czasie między miastami.'),
    },
    {
      question: ls('Kan vi få parkering och motorvärmare?', 'Can we request parking and engine heaters?', 'Czy można zamówić parking i podgrzewanie silnika?'),
      answer: ls('Skriv antal fordon, storlek och behov av motorvärmare eller laddning. Vi kontrollerar vad den aktuella bostaden erbjuder och om något debiteras separat. Bekräfta även att infarten och parkeringen fungerar för era fordon under hela hyresperioden.', 'Specify vehicle numbers, sizes and any engine heater or charging needs. We check what each property offers and any separate charges. Also confirm that access and parking suit your vehicles for the whole rental period.', 'Podaj liczbę i wielkość pojazdów oraz potrzebę podgrzewania silnika lub ładowania. Sprawdzimy wyposażenie i ewentualne dopłaty. Potwierdź też, że wjazd i parking odpowiadają pojazdom przez cały okres najmu.'),
    },
  ],
  sources: [
    { title: 'Stegra – anläggningen i Boden Industrial Park', url: 'https://stegra.com/stegra-i-boden' },
    { title: 'Bodens kommun – resor till industriparken', url: 'https://www.boden.se/nyheter/nyhet/2025-11-06-smidiga-och-trygga-resor-till-boden-industrial-park' },
  ],
  nearby: ['lulea'],
});
