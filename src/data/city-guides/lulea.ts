import { defineGuide, ls } from './common';

export const luleaGuide = defineGuide({
  name: 'Luleå',
  hero: ls('Företagsboende i Luleå – för industri, bygg och installation', 'Corporate housing in Luleå – for industry, construction and installation', 'Zakwaterowanie firmowe w Luleå – dla przemysłu, budownictwa i instalacji'),
  intro: ls(
    'Planerar ni personalboende i Luleå för ett längre uppdrag? Arbetsplatserna på Svartön, Hertsöfältet och andra delar av kommunen ger olika förutsättningar för resor och skift. StayOnSite hjälper er att jämföra möblerade företagslägenheter och hus utifrån arbetsplatsens infart, egna sovrum, parkering och hela projektperioden.',
    'Planning worker accommodation in Luleå for a longer assignment? Worksites on Svartön, Hertsöfältet and elsewhere in the municipality involve different journeys and shift arrangements. StayOnSite helps compare furnished corporate apartments and houses by site entrance, private bedrooms, parking and the full project period.',
    'Planujesz dłuższy pobyt pracowników w Luleå? Zakłady na Svartön, Hertsöfältet i w innych częściach gminy oznaczają różne dojazdy i układy zmian. StayOnSite pomaga porównać umeblowane mieszkania i domy według wjazdu do zakładu, własnych sypialni, parkingu i całego okresu projektu.',
  ),
  metadata: ls('Företagsboende och personalboende i Luleå. Jämför områden för Svartön, Hertsöfältet och industrin. Planera sovrum, vinterparkering och längre uppdrag.', 'Corporate housing in Luleå. Compare areas for Svartön, Hertsöfältet and industrial projects. Plan bedrooms, winter parking and longer assignments.', 'Noclegi pracownicze w Luleå. Porównaj okolice dla Svartön, Hertsöfältet i przemysłu. Zaplanuj sypialnie, zimowy parking i dłuższe zlecenia.'),
  projects: [
    {
      name: ls('Svartön: SSAB, LKAB och hamnen', 'Svartön: SSAB, LKAB and the port', 'Svartön: SSAB, LKAB i port'),
      description: ls('På Svartön finns bland annat SSAB, LKAB och Luleå Hamn. Området omfattar flera anläggningar och infarter. För ett installations- eller underhållsuppdrag behöver ni därför ange arbetsplatsens adress och samlingspunkt. Jämför boendena efter vägen till rätt anläggning, inte enbart avståndet till Svartön på kartan.', 'Svartön is home to SSAB, LKAB and the Port of Luleå, among others. The area includes several facilities and entrances. For installation or maintenance work, provide the exact worksite and meeting point. Compare housing by the route to the correct facility rather than map distance to Svartön.', 'Na Svartön działają m.in. SSAB, LKAB i port Luleå. Obszar obejmuje kilka zakładów oraz wjazdów. Przy instalacjach lub konserwacji podaj dokładny adres i miejsce zbiórki. Porównuj noclegi według trasy do właściwego zakładu, a nie samej odległości od Svartön na mapie.'),
    },
    {
      name: ls('Hertsöfältet och Luleå industripark', 'Hertsöfältet and Luleå Industrial Park', 'Hertsöfältet i park przemysłowy Luleå'),
      description: ls('Luleå industripark består av Svartön och Hertsöfältet. Kommunens planering omfattar industri och infrastruktur, medan varje aktör har sin egen tidplan. Vid mobilisering bör ni utgå från bekräftat uppdrag, antal personer per etapp och vilken del av området laget ska arbeta på. Boende och eventuell förlängning planeras därefter.', 'Luleå Industrial Park comprises Svartön and Hertsöfältet. Municipal planning covers industry and infrastructure, while each operator has its own schedule. Base mobilisation on the confirmed assignment, headcount per phase and the part of the site where the team will work. Plan housing and possible extensions accordingly.', 'Park przemysłowy Luleå obejmuje Svartön i Hertsöfältet. Gmina planuje przemysł oraz infrastrukturę, a poszczególni inwestorzy mają własne harmonogramy. Zakwaterowanie oprzyj na potwierdzonym zleceniu, liczbie osób na etap i właściwej części terenu. Na tej podstawie zaplanuj pobyt i możliwe przedłużenia.'),
    },
    {
      name: ls('Projekt mellan Luleå och Boden', 'Projects between Luleå and Boden', 'Projekty między Luleå a Boden'),
      description: ls('Om samma företag arbetar på båda orterna kan personalen behöva delas efter arbetsplats och skift. Jämför en gemensam bas med två boenden innan ni väljer. För personal utan egen bil behöver hämtning, lämning och reservtransport fungera även när någon blir kvar på arbetsplatsen längre.', 'If your company works in both locations, allocate staff by worksite and shift. Compare one shared base with two properties before deciding. For staff without their own car, plan pick-up, drop-off and backup transport for anyone finishing later.', 'Przy pracy firmy w obu miejscach podziel pracowników według zakładów i zmian. Przed wyborem porównaj wspólną bazę z dwoma obiektami. Dla osób bez własnego auta zaplanuj dowóz, odbiór i transport rezerwowy, gdy ktoś kończy później.'),
    },
  ],
  areas: [
    {
      name: 'Hertsön, Örnäset och Svartöstaden',
      suitableFor: ls('Områden att jämföra vid arbete på Svartön eller Hertsöfältet. Valet behöver ta hänsyn till den infart som används och hur personalen tar sig till arbetsplatsen.', 'Areas to compare for work on Svartön or Hertsöfältet. Consider the actual entrance and how staff travel to the worksite.', 'Okolice do porównania przy pracy na Svartön lub Hertsöfältet. Uwzględnij właściwy wjazd i sposób dojazdu do pracy.'),
      check: ls('Körväg till rätt grind, skifttider, sovrum och parkeringsyta. Att två platser ligger nära varandra på kartan räcker inte som underlag för daglig transport.', 'Route to the correct gate, shifts, bedrooms and parking. Proximity on the map is not enough to plan daily transport.', 'Trasa do właściwej bramy, godziny zmian, sypialnie i parking. Bliskość na mapie nie wystarcza do zaplanowania codziennego transportu.'),
    },
    {
      name: 'Centrala Luleå',
      suitableFor: ls('För projektpersonal som prioriterar vardagsservice och en samlad bas i staden. Kan jämföras med ytterområden när laget samåker eller arbetar på flera adresser.', 'For project staff prioritising daily services and a town base. Compare with outer areas when the team shares transport or works at several addresses.', 'Dla pracowników ceniących codzienne usługi i bazę w mieście. Porównaj z obrzeżami przy wspólnych dojazdach lub pracy pod kilkoma adresami.'),
      check: ls('Parkeringens kostnad, fordonshöjd om garage används och gångavstånd från bostaden till hämtplatsen. Bekräfta tillgång till parkering även kvällar och helger.', 'Parking cost, vehicle height if using a garage, and walking distance to pick-up. Confirm parking availability during evenings and weekends.', 'Koszt parkingu, wysokość pojazdów przy garażu i dojście do miejsca odbioru. Potwierdź dostępność miejsc wieczorami i w weekendy.'),
    },
    {
      name: 'Bergnäset',
      suitableFor: ls('Ett område att ta med när ankomst via flygplatsen eller arbetsplatser på den sidan av staden påverkar valet. Jämför samtidigt resan till industriområdet där uppdraget finns.', 'Consider this area when airport arrivals or worksites on that side of town influence the choice. Also compare the journey to the industrial site where work takes place.', 'Rozważ tę okolicę, gdy znaczenie ma przylot lub praca po tej stronie miasta. Jednocześnie porównaj dojazd do właściwego zakładu przemysłowego.'),
      check: ls('Resväg till varje arbetsplats, nyckelutlämning vid sena flyg och hur många bilar laget faktiskt behöver. Flygplatsläge och industriläge kan ge olika prioriteringar.', 'Route to each worksite, keys for late flights and the actual number of cars required. Airport access and industrial site access may lead to different priorities.', 'Trasa do każdego zakładu, klucze przy późnym przylocie i rzeczywista liczba potrzebnych aut. Bliskość lotniska i zakładu może oznaczać różne priorytety.'),
    },
    {
      name: 'Gammelstad och Sunderbyn',
      suitableFor: ls('Alternativ att jämföra för uppdrag på flera adresser eller resor i riktning mot Boden. Bedöm en konkret bostad mot veckans alla arbetsplatser innan området väljs.', 'Alternatives for multi-site assignments or travel towards Boden. Assess an actual property against all of the week’s worksites before choosing the area.', 'Alternatywy przy pracy w kilku miejscach lub przejazdach w stronę Boden. Przed wyborem oceń konkretny obiekt względem wszystkich miejsc pracy w tygodniu.'),
      check: ls('Samlad transporttid, tillgång till bil och vardagsservice. För arbete på Svartön behöver hela resan genom eller runt staden räknas med.', 'Total travel, car access and daily services. For work on Svartön, include the whole journey through or around town.', 'Łączny dojazd, dostęp do samochodu i codziennych usług. Przy pracy na Svartön uwzględnij całą trasę przez miasto lub wokół niego.'),
    },
  ],
  planning: [
    {
      title: ls('Välj bostad efter infart och skift', 'Choose housing by entrance and shift', 'Wybierz obiekt według wjazdu i zmian'),
      paragraphs: [ls('En arbetsplats märkt Luleå kan ligga på olika delar av industriparken eller någon annanstans i kommunen. Skicka därför infart, samlingspunkt och arbetstider tillsammans med boendeförfrågan. Om ni överväger kollektivtrafik behöver turerna kontrolleras mot första och sista passet, även helger. Vid samåkning bör lagets hämtplats och ansvar för fordon vara bestämda innan inflyttning.', 'A worksite labelled Luleå may be in different parts of the industrial park or elsewhere in the municipality. Send the entrance, meeting point and shift times with your enquiry. Check public transport against the first and last shifts, including weekends. For shared transport, agree pick-up points and vehicle responsibility before arrival.', 'Miejsce pracy opisane jako Luleå może leżeć w różnych częściach parku lub gminy. Dołącz wjazd, miejsce zbiórki i godziny zmian do zapytania. Komunikację publiczną sprawdź dla pierwszej i ostatniej zmiany, także w weekendy. Przy wspólnych dojazdach ustal miejsce odbioru i odpowiedzialność za pojazd przed przyjazdem.')],
    },
    {
      title: ls('Gör boendet användbart under vintern', 'Make the property work through winter', 'Zadbaj o warunki zimowego pobytu'),
      paragraphs: [ls('Vid ett längre uppdrag i Luleå behöver värme, snöröjning och parkering ingå i jämförelsen. Fråga vad som debiteras utöver hyran, vem som skottar infarten och hur arbetskläder kan torkas. Motorvärmare, laddning och plats för större servicebilar är separata krav som behöver kontrolleras. För personal som sover dagtid är mörkläggning och lugna sovrum också relevanta under ljusare delar av året.', 'For a longer Luleå assignment, compare heating, snow clearance and parking. Ask about charges beyond rent, who clears the driveway and how workwear can dry. Engine heaters, charging and space for larger vans are separate requirements to check. Staff sleeping during the day may also need blackout options and quiet bedrooms during lighter months.', 'Przy dłuższym pobycie w Luleå porównaj ogrzewanie, odśnieżanie i parking. Zapytaj o dopłaty, odśnieżanie podjazdu i suszenie odzieży. Podgrzewanie silnika, ładowanie oraz duże auta służbowe wymagają osobnego sprawdzenia. Osobom śpiącym w dzień przydadzą się też zaciemnienie i spokojne sypialnie w jaśniejszych miesiącach.')],
    },
    {
      title: ls('Boka efter er etapp, inte en övergripande projekttidplan', 'Book around your phase of the project', 'Rezerwuj według etapu własnych prac'),
      paragraphs: [ls('En större industrietablering kan ha flera entreprenader med olika start- och slutdatum. Utgå från er bekräftade beställning och ange vilka veckor bemanningen ökar eller minskar. Be om tydliga villkor för förlängning, personalbyte och eventuellt ytterligare boende. Jämför sedan total kostnad för rum, transport och service över den period ni faktiskt behöver.', 'A large industrial development can involve contracts with different start and end dates. Use your confirmed order and specify when staffing increases or decreases. Ask for clear terms on extensions, crew changes and additional properties. Then compare rooms, transport and service costs for the period actually required.', 'Duża inwestycja przemysłowa może obejmować kontrakty z różnymi terminami. Oprzyj się na potwierdzonym zleceniu i wskaż tygodnie zwiększenia lub zmniejszenia obsady. Uzgodnij przedłużenia, zmiany pracowników i dodatkowe obiekty. Następnie porównaj koszty pokoi, transportu i usług przez rzeczywiście potrzebny okres.')],
    },
  ],
  faq: [
    {
      question: ls('Var ska vi bo vid arbete på Svartön eller Hertsöfältet?', 'Where should we stay for work on Svartön or Hertsöfältet?', 'Gdzie nocować przy pracy na Svartön lub Hertsöfältet?'),
      answer: ls('Jämför bland annat Hertsön, Örnäset, Svartöstaden och centrala Luleå mot den infart ni ska använda. Arbetsplatsens läge, skift, tillgång till bil och antal separata sovrum avgör vilket alternativ som fungerar. Restid och parkering stäms av för den konkreta bostaden.', 'Compare Hertsön, Örnäset, Svartöstaden and central Luleå against your actual site entrance. Worksite, shifts, car access and private bedrooms determine which option works. Travel and parking are checked for the specific property.', 'Porównaj m.in. Hertsön, Örnäset, Svartöstaden i centrum Luleå z właściwym wjazdem. Wybór zależy od zakładu, zmian, samochodu i oddzielnych sypialni. Dojazd oraz parking sprawdzamy dla konkretnego obiektu.'),
    },
    {
      question: ls('Kan vi bo i Luleå och arbeta i Boden?', 'Can we stay in Luleå and work in Boden?', 'Czy można mieszkać w Luleå i pracować w Boden?'),
      answer: ls('Det går att jämföra, men ange båda arbetsplatserna och högsta acceptabla restid. Om laget har tidiga pass eller olika sluttider kan ett boende närmare respektive arbetsplats fungera bättre. Vi kan undersöka alternativ på båda orterna i samma förfrågan.', 'We can compare that option, but provide both worksites and the maximum acceptable commute. Early starts or different finishing times may favour accommodation closer to each site. We can investigate both locations in one enquiry.', 'Możemy porównać taką opcję, ale podaj miejsca pracy i maksymalny dojazd. Przy wczesnych lub różnych zmianach wygodniejszy może być nocleg bliżej każdego zakładu. W jednym zapytaniu sprawdzimy obie miejscowości.'),
    },
    {
      question: ls('Går det att ordna egna sovrum för nattpersonal?', 'Can we request private bedrooms for night workers?', 'Czy można zapewnić własne sypialnie pracownikom nocnym?'),
      answer: ls('Ange antal egna rum, badrum och hur dag- och nattskift fördelas. Vi kontrollerar planlösning och diskuterar mörkläggning, tvätt och gemensamma utrymmen för aktuella alternativ. Ett visst antal bäddar betyder inte att samma antal separata sovrum finns.', 'Specify private rooms, bathrooms and the split between day and night shifts. We check floor plans and discuss blackout options, laundry and shared areas. A bed count does not mean the same number of separate bedrooms.', 'Podaj własne pokoje, łazienki i podział na zmiany dzienne oraz nocne. Sprawdzimy rzuty, zaciemnienie, pranie i wspólną przestrzeń. Liczba łóżek nie oznacza tej samej liczby oddzielnych sypialni.'),
    },
    {
      question: ls('Ingår värme, snöröjning och parkering?', 'Are heating, snow clearance and parking included?', 'Czy ogrzewanie, odśnieżanie i parking są w cenie?'),
      answer: ls('Det behöver bekräftas för varje boende. Be att kostnad och ansvar för värme, el, parkering och vinterunderhåll står i förslaget. Skriv också om ni behöver motorvärmare, laddning eller plats för minibuss och släp så att det kontrolleras före bokning.', 'Confirm this for each property. Ask for heating, electricity, parking and winter maintenance costs and responsibilities in the proposal. State any engine heater, charging, minibus or trailer requirements so they can be checked before booking.', 'Potwierdź to dla każdego obiektu. Poproś o koszty i odpowiedzialność za ogrzewanie, prąd, parking oraz utrzymanie zimowe. Podaj potrzeby podgrzewania silnika, ładowania, minibusa lub przyczepy do sprawdzenia przed rezerwacją.'),
    },
  ],
  sources: [
    { title: 'Luleå kommun – frågor och svar om industriparken', url: 'https://www.lulea.se/special/lulea-industripark/fragor-och-svar.html' },
    { title: 'Luleå kommun – Svartön och dess verksamheter', url: 'https://www.lulea.se/special/lulea-industripark/aktuellt-pa-svarton.html' },
  ],
  nearby: ['boden'],
});
