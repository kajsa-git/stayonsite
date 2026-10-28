import { defineGuide, ls } from './common';

export const monsterasGuide = defineGuide({
  name: 'Mönsterås',
  hero: ls('Företagsboende i Mönsterås – hus och lägenheter för arbetslag', 'Corporate housing in Mönsterås – houses and apartments for project teams', 'Zakwaterowanie firmowe w Mönsterås – domy i mieszkania dla ekip'),
  intro: ls(
    'Söker ni personalboende i Mönsterås för industri, underhåll eller montage? StayOnSite hjälper er att jämföra möblerade hus och företagslägenheter med rätt antal sovrum och parkering för arbetslaget. Här jämför ni Mönsterås tätort, Oknö, Timmernabben, Blomstermåla och Ålem utifrån arbetsplats, projektperiod och vardagen mellan passen.',
    'Looking for worker accommodation in Mönsterås for industry, maintenance or installation? StayOnSite helps compare furnished houses and corporate apartments with the right bedrooms and parking. This guide compares Mönsterås town, Oknö, Timmernabben, Blomstermåla and Ålem by worksite, project dates and life between shifts.',
    'Szukasz noclegów pracowniczych w Mönsterås dla przemysłu, konserwacji lub montażu? StayOnSite pomaga porównać umeblowane domy i mieszkania z odpowiednimi sypialniami oraz parkingiem. Porównaj miasto Mönsterås, Oknö, Timmernabben, Blomstermåla i Ålem według miejsca pracy, terminów i codziennych potrzeb.',
  ),
  metadata: ls('Företagsboende och personalboende i Mönsterås. Jämför centrum, Oknö, Blomstermåla och Ålem för industriuppdrag med egna sovrum, kök och parkering.', 'Corporate housing in Mönsterås. Compare town, Oknö, Blomstermåla and Ålem for industrial projects, private bedrooms, kitchens and parking.', 'Noclegi pracownicze w Mönsterås. Porównaj centrum, Oknö, Blomstermåla i Ålem dla projektów przemysłowych, własnych sypialni, kuchni i parkingu.'),
  projects: [
    {
      name: ls('Södra Cell Mönsterås', 'Södra Cell Mönsterås', 'Södra Cell Mönsterås'),
      description: ls('Södras kombinat i Mönsterås omfattar bland annat massabruk och hamnverksamhet. Vid ett bekräftat uppdrag inom underhåll, el eller processinstallation behöver boendesökningen utgå från rätt infart och skifttider. Ange vilken del av anläggningen ni ska arbeta på och om laget samåker med en gemensam servicebil.', 'Södra’s Mönsterås site includes a pulp mill and port operations. For confirmed maintenance, electrical or process installation work, start the housing search from the correct entrance and shifts. Specify the site area and whether the team shares one work van.', 'Kompleks Södra w Mönsterås obejmuje m.in. celulozownię i port. Przy potwierdzonej konserwacji, elektryce lub instalacjach procesowych szukaj noclegów względem właściwego wjazdu i zmian. Podaj część zakładu i informację, czy zespół korzysta ze wspólnego auta.'),
    },
    {
      name: ls('Södra Wood och industriservice', 'Södra Wood and industrial services', 'Södra Wood i usługi przemysłowe'),
      description: ls('På kombinatet finns även Södra Wood Mönsterås. För montage- och servicelag behöver antal riktiga sovrum, duschar och tvättmöjligheter passa arbetsveckan. Om personer arbetar på olika delar av området är det viktigt att transporten fungerar även när arbetspassen börjar eller slutar vid skilda tider.', 'The site also includes Södra Wood Mönsterås. Installation and service teams need separate bedrooms, showers and laundry suited to the working week. If staff work in different site areas, transport needs to accommodate different shift start and finish times.', 'Na terenie kompleksu działa również Södra Wood Mönsterås. Ekipy montażowe i serwisowe potrzebują sypialni, pryszniców i prania dopasowanych do tygodnia pracy. Przy różnych częściach zakładu transport powinien uwzględniać odmienne godziny rozpoczęcia i zakończenia zmian.'),
    },
    {
      name: ls('Kronobäck och andra verksamhetsområden', 'Kronobäck and other business areas', 'Kronobäck i inne tereny działalności'),
      description: ls('Kommunen beskriver verksamhetsområden i bland annat Kronobäck, Blomstermåla och Ålem. För bygg- och installationsuppdrag behöver ni ange den konkreta adressen, eftersom Mönsterås kan avse både tätorten och kommunen. Vid flera arbetsplatser jämförs hela lagets resor innan ett boende väljs.', 'The municipality describes business areas including Kronobäck, Blomstermåla and Ålem. Provide the exact address for construction and installation work: Mönsterås may refer to the town or the municipality. For several worksites, compare the whole team’s travel before choosing accommodation.', 'Gmina opisuje tereny działalności m.in. w Kronobäck, Blomstermåla i Ålem. Przy budowie i instalacjach podaj dokładny adres: Mönsterås może oznaczać miasto albo gminę. Przy kilku zakładach porównaj przejazdy całej ekipy przed wyborem noclegu.'),
    },
  ],
  areas: [
    {
      name: 'Mönsterås tätort',
      suitableFor: ls('För ett arbetslag som vill ha en samlad bas och jämföra bostadens läge med service och arbetsplats. Relevant vid uppdrag på flera adresser i närområdet.', 'For a team wanting one base and a location to compare against services and work. Relevant for assignments at several nearby addresses.', 'Dla ekipy chcącej jednej bazy i lokalizacji do porównania z usługami oraz zakładem. Opcja przy pracy pod kilkoma adresami w okolicy.'),
      check: ls('Faktisk körväg till anläggningen, matinköp, separata sovrum och parkering. Ange antal bilar och om någon behöver lämna boendet före övriga laget.', 'Actual route to the facility, groceries, separate bedrooms and parking. Specify vehicle numbers and whether some staff leave earlier than others.', 'Rzeczywista trasa do zakładu, zakupy, oddzielne sypialnie i parking. Podaj liczbę aut i osoby wyjeżdżające przed resztą ekipy.'),
    },
    {
      name: 'Oknö och Timmernabben',
      suitableFor: ls('Alternativ att jämföra när ni söker ett hus med gemensamma ytor. Välj efter den konkreta bostadens planlösning och hela hyresperioden, snarare än hur många personer som ryms tillfälligt.', 'Alternatives when looking for a house with shared space. Choose by the actual floor plan and full rental period, rather than temporary sleeping capacity.', 'Alternatywy przy szukaniu domu ze wspólną przestrzenią. Kieruj się rzeczywistym układem i całym okresem najmu, zamiast tymczasową liczbą miejsc do spania.'),
      check: ls('Om huset kan hyras över alla önskade månader, uppvärmning, internet, tvätt och fordonens plats på tomten. Vid säsongsuthyrning ska hela projektperioden bekräftas.', 'Availability for every required month, heating, internet, laundry and on-site vehicle space. For seasonal rentals, confirm the entire project period.', 'Dostępność przez wszystkie miesiące, ogrzewanie, internet, pranie i miejsce na pojazdy. Przy najmie sezonowym potwierdź cały termin projektu.'),
    },
    {
      name: 'Blomstermåla',
      suitableFor: ls('En ort att jämföra om arbetsplatsen ligger där eller när ni söker fler alternativ inom kommunen. Läget bedöms mot beställarens adress och hur laget använder sina fordon.', 'Compare this town if the worksite is there or for more options within the municipality. Assess the location against the client’s address and vehicle use.', 'Porównaj tę miejscowość, jeśli znajduje się tam praca lub szukasz większego wyboru w gminie. Oceń adres zleceniodawcy i wykorzystanie pojazdów.'),
      check: ls('Restid till rätt infart, service utanför arbetstid och transport för personal utan bil. Ett boende som passar ett uppdrag i Blomstermåla behöver jämföras på nytt för arbete vid bruket.', 'Journey to the correct entrance, services outside working hours and transport for staff without cars. Reassess a property suited to Blomstermåla when the assignment is at the mill.', 'Dojazd do właściwego wjazdu, usługi po pracy i transport osób bez auta. Obiekt dobry dla pracy w Blomstermåla oceń ponownie przy zleceniu w celulozowni.'),
    },
    {
      name: 'Ålem',
      suitableFor: ls('Relevant vid arbetsplatser i den södra delen av kommunen eller när uppdraget omfattar resor på flera orter. Jämför med Mönsterås tätort utifrån faktisk transport och boendekrav.', 'Relevant for worksites in the southern part of the municipality or multi-location travel. Compare with Mönsterås town by actual transport and housing requirements.', 'Opcja przy pracy w południowej części gminy lub przejazdach między miejscowościami. Porównaj z miastem Mönsterås według transportu i wymagań noclegowych.'),
      check: ls('Tillgång till bil, sovrumsfördelning och om samma boende fungerar under hela arbetsveckan. Ange även eventuella arbetsplatser i Oskarshamn eller Kalmar i förfrågan.', 'Car access, bedroom allocation and suitability for the full working week. Include any worksites in Oskarshamn or Kalmar in your enquiry.', 'Dostęp do auta, podział sypialni i warunki przez cały tydzień pracy. W zapytaniu uwzględnij również zakłady w Oskarshamn lub Kalmar.'),
    },
  ],
  planning: [
    {
      title: ls('Börja med sovrum, inte bäddantal', 'Start with bedrooms, not bed count', 'Zacznij od sypialni zamiast liczby łóżek'),
      paragraphs: [ls('För fyra personer som behöver egna rum krävs fyra separata sovrum. Ett hus med sex bäddar kan ändå ha för få rum om flera sängar står tillsammans. Be därför om rumsfördelning och kontrollera om någon sovplats finns i vardagsrum eller genomgångsrum. Antal badrum, köksutrustning och möjlighet till tvätt behöver också fungera för hela laget under en vanlig arbetsvecka.', 'Four people needing private rooms require four separate bedrooms. A six-bed house may still have too few rooms if beds are shared between them. Ask for room allocation and check whether any sleeping spaces are in a living room or walk-through room. Bathrooms, cooking equipment and laundry also need to suit the team throughout a normal working week.', 'Cztery osoby potrzebujące własnych pokoi wymagają czterech oddzielnych sypialni. Dom z sześcioma łóżkami może mieć za mało pokoi, jeśli łóżka stoją razem. Poproś o podział pomieszczeń i sprawdź miejsca do spania w salonie lub pokojach przechodnich. Łazienki, kuchnia i pranie też muszą odpowiadać całej ekipie.')],
    },
    {
      title: ls('Säkra hela perioden när ni jämför hus', 'Confirm the full period when comparing houses', 'Potwierdź cały okres przy porównywaniu domów'),
      paragraphs: [ls('Om ni överväger en bostad som också hyrs ut säsongsvis behöver varje månad av uppdraget vara bekräftad. Fråga om samma hus kan användas hela tiden, hur värme och el debiteras och vilka villkor som gäller vid förlängning. För en längre arbetsvistelse är det också relevant att kontrollera internet, matförvaring och plats för arbetskläder, inte enbart hur bostaden fungerar under en kortare vistelse.', 'If considering a property also offered seasonally, confirm every month of the assignment. Ask whether the same house is available throughout, how heating and electricity are charged and what extension terms apply. For a longer working stay, check internet, food storage and space for workwear, beyond how the property works for a short visit.', 'Jeśli obiekt jest także wynajmowany sezonowo, potwierdź każdy miesiąc zlecenia. Zapytaj o dostępność tego samego domu, rozliczenie ogrzewania i prądu oraz warunki przedłużenia. Przy dłuższym pobycie sprawdź internet, przechowywanie jedzenia i miejsce na odzież roboczą, nie tylko warunki krótkiego wypoczynku.')],
    },
    {
      title: ls('Bedöm Mönsterås och Oskarshamn mot rätt arbetsplats', 'Compare Mönsterås and Oskarshamn by worksite', 'Porównaj Mönsterås i Oskarshamn według miejsca pracy'),
      paragraphs: [ls('Om uppdraget omfattar båda orterna, skicka adresser och hur många personer som arbetar på varje plats. Jämför en gemensam bas med två boenden och räkna in fordon och daglig transport. Ett projekt i Simpevarp behöver bedömas separat från arbete inne i Oskarshamn. Det är resan till rätt arbetsplats, tillsammans med rum och kostnad, som ska avgöra sökområdet.', 'For work in both towns, send addresses and headcount for each. Compare one shared base with two properties, including vehicles and daily transport. Assess Simpevarp separately from work in Oskarshamn town. The journey to the actual worksite, together with rooms and cost, should determine the search area.', 'Przy pracy w obu miejscowościach podaj adresy i liczbę osób w każdym miejscu. Porównaj wspólną bazę z dwoma obiektami, uwzględniając auta oraz codzienny transport. Simpevarp oceń osobno od pracy w mieście Oskarshamn. Trasa do właściwego zakładu, pokoje i koszt powinny wyznaczać obszar wyszukiwania.')],
    },
  ],
  faq: [
    {
      question: ls('Kan vi få personalboende för arbete vid Södra i Mönsterås?', 'Can we request housing for work at Södra in Mönsterås?', 'Czy można zapytać o noclegi do pracy przy Södra w Mönsterås?'),
      answer: ls('Ja. Skicka datum, antal personer, separata sovrum och den infart ni ska använda. Vi jämför bostäder utifrån uppdraget och kontrollerar parkering och service för aktuella alternativ. Bekräfta arbetsplats och skifttider med er beställare innan boendet bokas.', 'Yes. Send dates, headcount, private bedrooms and the entrance you will use. We compare properties for the assignment and check parking and services. Confirm the worksite and shifts with your client before booking.', 'Tak. Prześlij terminy, liczbę osób, własne sypialnie i właściwy wjazd. Porównamy obiekty oraz sprawdzimy parking i usługi. Przed rezerwacją potwierdź ze zleceniodawcą miejsce pracy i zmiany.'),
    },
    {
      question: ls('Kan fyra personer få fyra egna sovrum?', 'Can four people have four private bedrooms?', 'Czy cztery osoby mogą otrzymać cztery własne sypialnie?'),
      answer: ls('Ange fyra separata sovrum som ett krav, tillsammans med datum och budget. Vi kontrollerar vilka aktuella bostäder som har rätt rumsfördelning. Om inget enskilt hus passar kan flera lägenheter jämföras, med hänsyn till transport och gemensamma behov.', 'List four separate bedrooms as a requirement, together with dates and budget. We check current properties for the right layout. If one house does not fit, compare several apartments alongside transport and shared needs.', 'Wpisz cztery oddzielne sypialnie jako wymaganie wraz z terminem i budżetem. Sprawdzimy układy aktualnych obiektów. Jeśli jeden dom nie odpowiada potrzebom, można porównać kilka mieszkań, uwzględniając transport i wspólne potrzeby.'),
    },
    {
      question: ls('Passar ett hus på Oknö för ett längre industriuppdrag?', 'Can a house on Oknö suit a longer industrial assignment?', 'Czy dom na Oknö nadaje się na dłuższe zlecenie przemysłowe?'),
      answer: ls('Det beror på huset och perioden. Kontrollera att hela vistelsen kan bokas, att sovrummen räcker och att värme, tvätt, wifi och parkering passar en arbetsvardag. Be om tydliga uppgifter för den aktuella bostaden och jämför resan till arbetsplatsen.', 'It depends on the house and dates. Confirm the entire stay, enough bedrooms and heating, laundry, wifi and parking suitable for work routines. Ask for details for the specific property and compare the journey to work.', 'Zależy to od domu i terminu. Potwierdź cały pobyt, sypialnie oraz ogrzewanie, pranie, wifi i parking odpowiadające codziennej pracy. Poproś o szczegóły konkretnego obiektu i porównaj dojazd do zakładu.'),
    },
    {
      question: ls('Kan vi jämföra Mönsterås med Blomstermåla och Ålem?', 'Can we compare Mönsterås with Blomstermåla and Ålem?', 'Czy można porównać Mönsterås z Blomstermåla i Ålem?'),
      answer: ls('Ja. Ange arbetsplatsens adress, högsta acceptabla restid och om laget har bil. Vi kan undersöka fler lägen utan att ändra kraven på egna rum och service. Välj efter den konkreta bostaden och arbetsresan snarare än kommunnamnet.', 'Yes. Include the worksite address, maximum commute and car access. We can investigate more locations while keeping the same private-room and service requirements. Choose by the actual property and commute rather than the municipality name.', 'Tak. Podaj adres pracy, maksymalny dojazd i dostęp do auta. Możemy sprawdzić więcej lokalizacji przy tych samych wymaganiach dotyczących własnych pokoi i usług. Wybierz według konkretnego obiektu i trasy, a nie nazwy gminy.'),
    },
  ],
  sources: [
    { title: 'Södra – kombinatet i Mönsterås', url: 'https://www.sodra.com/sv/se/omoss/organisation/anlaggningar/monsteras/' },
    { title: 'Mönsterås kommun – verksamhetsområden', url: 'https://www.monsteras.se/jobb-och-foretagande/starta-driva-och-utveckla-foretag/hitta-mark-och-lokal/industri-och-handelstomter/' },
  ],
  nearby: ['oskarshamn'],
});
