import { defineGuide, ls } from './common';

export const oskarshamnGuide = defineGuide({
  name: 'Oskarshamn',
  hero: ls(
    'Företagsboende i Oskarshamn – för OKG, industri och montage',
    'Corporate housing in Oskarshamn – for OKG, industry and installation teams',
    'Zakwaterowanie firmowe w Oskarshamn – dla ekip przy OKG i w przemyśle',
  ),
  intro: ls(
    'Personalboende i Oskarshamn behöver passa den arbetsplats där dagen börjar. Ett uppdrag på OKG eller Clab i Simpevarp ger andra resor än arbete vid Scania eller i tätorten. StayOnSite hjälper er att jämföra möblerade hus och lägenheter i Oskarshamn med alternativ i Figeholm, Fårbo och Mönsterås.',
    'Worker accommodation in Oskarshamn needs to suit where the working day starts. OKG or Clab in Simpevarp involves different journeys from Scania or town-based assignments. StayOnSite helps compare furnished houses and apartments in Oskarshamn with options in Figeholm, Fårbo and Mönsterås.',
    'Noclegi pracownicze w Oskarshamn powinny odpowiadać miejscu rozpoczęcia dnia pracy. Zlecenia przy OKG lub Clab w Simpevarp oznaczają inne dojazdy niż praca przy Scania lub w mieście. StayOnSite pomaga porównać umeblowane domy i mieszkania w Oskarshamn z opcjami w Figeholm, Fårbo i Mönsterås.',
  ),
  metadata: ls(
    'Personalboende och företagsbostäder i Oskarshamn. Jämför lägen för OKG, Clab och industri, se bostäder och planera sovrum, skift och parkering.',
    'Corporate housing in Oskarshamn. Compare areas for OKG, Clab and industrial assignments, explore properties and plan bedrooms, shifts and parking.',
    'Noclegi pracownicze w Oskarshamn. Porównaj lokalizacje do pracy przy OKG, Clab i w przemyśle. Zaplanuj sypialnie, zmiany i parking.',
  ),
  projects: [
    {
      name: ls('OKG i Simpevarp', 'OKG in Simpevarp', 'OKG w Simpevarp'),
      description: ls('OKG ligger i Simpevarp, utanför Oskarshamns tätort. För revision, underhåll eller installation behöver boendeplanen utgå från rätt infart och arbetstider. Figeholm och Fårbo är orter att jämföra med Oskarshamn. Be beställaren bekräfta inställelsedag och planera in eventuell introduktion före första arbetspasset.', 'OKG is in Simpevarp, outside Oskarshamn town. For outage, maintenance or installation work, plan housing around the correct entrance and shift times. Compare Figeholm and Fårbo with Oskarshamn. Confirm the reporting date with your client and allow for any induction before the first shift.', 'OKG znajduje się w Simpevarp, poza miastem Oskarshamn. Przy remontach, konserwacji i instalacjach zaplanuj noclegi według właściwego wjazdu oraz godzin zmian. Porównaj Figeholm i Fårbo z Oskarshamn. Potwierdź termin stawienia się i uwzględnij ewentualne wdrożenie przed pierwszą zmianą.'),
    },
    {
      name: ls('Clab och uppdrag i Simpevarp', 'Clab and assignments in Simpevarp', 'Clab i zlecenia w Simpevarp'),
      description: ls('SKB:s mellanlager Clab finns också i Simpevarp. Ange anläggning och mötesplats även om projektbeskrivningen bara säger Oskarshamn. Om laget arbetar på flera delar av området behöver ni veta var transporten lämnar och hämtar personal. Tillträdesfrågor stäms av med arbetsplatsen när boendet planeras.', 'SKB’s Clab interim storage facility is also in Simpevarp. Specify the facility and meeting point even if the project brief only says Oskarshamn. For work across several site areas, establish where transport drops off and collects staff. Coordinate access arrangements with the worksite while planning accommodation.', 'Magazyn pośredni Clab należący do SKB również znajduje się w Simpevarp. Podaj zakład i miejsce zbiórki, nawet jeśli opis projektu wskazuje tylko Oskarshamn. Przy pracy w kilku częściach terenu ustal punkty dowozu i odbioru pracowników. Dostęp uzgodnij z miejscem pracy podczas planowania noclegów.'),
    },
    {
      name: ls('Scania och industri i Oskarshamn', 'Scania and industry in Oskarshamn', 'Scania i przemysł w Oskarshamn'),
      description: ls('Scania har hyttillverkning i Oskarshamn. För entreprenörer inom produktion, el och montage kan en bostad i tätorten vara ett alternativ att jämföra med boende längre norrut. Skicka den exakta arbetsplatsen: ett boende valt för Simpevarp behöver inte vara det mest praktiska för ett uppdrag inne i staden.', 'Scania manufactures truck cabs in Oskarshamn. Contractors in production, electrical work and installation can compare town accommodation with options farther north. Send the exact worksite: housing chosen for Simpevarp may not be the most practical base for an assignment within the town.', 'Scania produkuje kabiny ciężarówek w Oskarshamn. Wykonawcy prac produkcyjnych, elektrycznych i montażowych mogą porównać noclegi w mieście z opcjami dalej na północ. Podaj dokładny adres pracy: baza dobrana dla Simpevarp może nie być najpraktyczniejsza przy zleceniu w samym mieście.'),
    },
  ],
  areas: [
    {
      name: 'Centrala Oskarshamn och Kristineberg',
      suitableFor: ls('För uppdrag i tätorten och arbetslag som vill samla boende och vardagsservice i samma stad. Jämför ett centralt läge med en bostad närmare den specifika arbetsplatsen.', 'For town-based assignments and teams wanting accommodation and daily services in one town. Compare a central address with a property closer to the specific worksite.', 'Przy zleceniach w mieście i dla ekip chcących mieć noclegi oraz codzienne usługi w jednej miejscowości. Porównaj centrum z obiektem bliżej konkretnego miejsca pracy.'),
      check: ls('Körväg till arbetsplatsen, parkering för servicebilar och avstånd till matinköp. För nattpersonal är sovrummens läge och möjlighet till mörkläggning viktiga frågor.', 'Route to work, work van parking and grocery access. For night workers, check bedroom position and blackout options.', 'Trasa do pracy, parking dla aut służbowych i zakupy. Przy nocnych zmianach sprawdź położenie sypialni i możliwość zaciemnienia.'),
    },
    {
      name: 'Figeholm',
      suitableFor: ls('En ort att jämföra vid uppdrag på OKG eller Clab i Simpevarp. Bedöm hela resan från bostaden till den infart där personalen ska inställa sig.', 'An area to consider for OKG or Clab assignments in Simpevarp. Assess the full journey from the property to the entrance where staff report.', 'Miejscowość do rozważenia przy pracy na terenie OKG lub Clab w Simpevarp. Oceń całą drogę od obiektu do wjazdu, przy którym stawiają się pracownicy.'),
      check: ls('Tillgång till bostad under hela projektet, egna sovrum, kök och tvätt. Bekräfta transport efter sena pass och planera inköp utifrån butikernas aktuella öppettider.', 'Availability for the entire project, separate bedrooms, kitchen and laundry. Confirm transport after late shifts and plan groceries around current shop hours.', 'Dostępność przez cały projekt, oddzielne sypialnie, kuchnia i pranie. Potwierdź powrót po późnych zmianach i zakupy według aktualnych godzin sklepów.'),
    },
    {
      name: 'Fårbo',
      suitableFor: ls('Ett alternativ när ni jämför boenden mellan E22 och arbetsplatserna vid Simpevarp. Relevant att ta med om hela laget reser gemensamt med bil eller minibuss.', 'An alternative when comparing housing between the E22 corridor and Simpevarp worksites. Consider it when the team travels together by car or minibus.', 'Alternatywa przy porównywaniu noclegów między trasą E22 a zakładami w Simpevarp. Warta rozważenia, gdy zespół dojeżdża razem autem lub minibusem.'),
      check: ls('Den faktiska resvägen, möjlighet att parkera och hur laget kommer hem om arbetspassen slutar olika tider. Kontrollera även vem som disponerar fordonet under dagen.', 'Actual route, parking and the journey home if shifts finish at different times. Also check who uses the vehicle during the day.', 'Rzeczywista trasa, parking i powrót przy różnych godzinach końca zmian. Ustal również, kto dysponuje pojazdem w ciągu dnia.'),
    },
    {
      name: 'Mönsterås',
      suitableFor: ls('En alternativ bas söder om Oskarshamn när uppdraget omfattar flera orter eller när ni vill jämföra fler bostäder. Läget behöver vägas mot arbetsplatsen, särskilt vid arbete i Simpevarp.', 'An alternative base south of Oskarshamn for multi-location assignments or a broader property search. Weigh the location against the worksite, especially for Simpevarp assignments.', 'Alternatywna baza na południe od Oskarshamn przy zleceniach w kilku miejscach lub szerszym wyszukiwaniu obiektów. Zestaw lokalizację z miejscem pracy, zwłaszcza przy Simpevarp.'),
      check: ls('Totalkostnad inklusive daglig transport och om samma bostad kan hyras under hela perioden. Ange högsta acceptabla restid innan sökområdet utökas.', 'Total cost including daily transport and availability of the same property for the full stay. Set a maximum commute before broadening the search.', 'Całkowity koszt z codziennym transportem i dostępność tego samego obiektu przez cały pobyt. Określ maksymalny dojazd przed rozszerzeniem wyszukiwania.'),
    },
  ],
  planning: [
    {
      title: ls('Skilj på ankomstdag och första arbetsdag', 'Separate arrival from the first working day', 'Oddziel przyjazd od pierwszego dnia pracy'),
      paragraphs: [ls('Vid uppdrag på en större anläggning kan första dagen innehålla introduktion eller andra moment före ordinarie skift. Stäm av detta med beställaren och boka ankomsten så att laget hinner hämta nycklar och komma i ordning. Ange om någon kommer sent och om personalen anländer från olika orter. Nyckelutlämning och kontakt vid ankomst ska vara bestämda före resan.', 'At a large facility, the first day may include induction or other steps before normal shifts. Check with your client and plan arrival so staff can collect keys and settle in. Specify late arrivals and whether staff travel from different locations. Agree key collection and an arrival contact before travelling.', 'W dużym zakładzie pierwszy dzień może obejmować wdrożenie lub inne czynności przed zwykłą zmianą. Uzgodnij to ze zleceniodawcą i zaplanuj przyjazd z czasem na klucze oraz zakwaterowanie. Podaj późne przyjazdy i osoby podróżujące z różnych miejsc. Odbiór kluczy i kontakt ustal przed podróżą.')],
    },
    {
      title: ls('Planera bostaden för revision och skiftgång', 'Plan the property around outages and shifts', 'Dopasuj obiekt do remontów i pracy zmianowej'),
      paragraphs: [ls('Om samma boende ska användas av dag- och nattpersonal behöver ni mer än ett tillräckligt antal bäddar. Jämför egna sovrum, antal duschar, matlagningsmöjligheter och tvättider. Berätta hur teamet roterar mellan arbetsveckor och ledighet. Städning, byte av sängkläder och nyckelhantering vid personalbyten behöver finnas med i överenskommelsen om ni vill ha den servicen.', 'A property shared by day and night staff needs more than enough beds. Compare separate bedrooms, showers, cooking facilities and laundry access. Describe rotations between work weeks and leave. Include cleaning, linen changes and key handling at crew changes in the agreement when those services are required.', 'Przy wspólnym pobycie pracowników dziennych i nocnych sama liczba łóżek nie wystarczy. Porównaj sypialnie, prysznice, gotowanie i dostęp do prania. Opisz rotacje tygodni pracy i odpoczynku. Jeśli potrzebujesz sprzątania, zmiany pościeli i obsługi kluczy przy wymianie ekip, uwzględnij to w umowie.')],
    },
    {
      title: ls('Jämför hela perioden och möjliga etapper', 'Compare the full stay and possible phases', 'Porównaj cały pobyt i możliwe etapy'),
      paragraphs: [ls('Utgå från bekräftad bemanning och skilj den från personal som kan tillkomma. Be om månadskostnad, vad som ingår och hur eventuell förlängning hanteras. En bostad som passar första månaden behöver också fungera när skiften eller lagets storlek ändras. Vid projekt i både Oskarshamn och Mönsterås kan två mindre boenden vara värda att jämföra med en gemensam bas.', 'Start with confirmed staff and separate them from possible later arrivals. Ask for the monthly cost, inclusions and extension terms. A property suitable at the start must also work if shifts or team size change. For projects in both Oskarshamn and Mönsterås, compare two smaller properties with a shared base.', 'Zacznij od potwierdzonej obsady i oddziel osoby, które mogą dołączyć później. Poproś o koszt miesięczny, zakres usług i warunki przedłużenia. Obiekt musi odpowiadać także zmianom grafiku lub wielkości ekipy. Przy pracy w Oskarshamn i Mönsterås porównaj dwa mniejsze obiekty ze wspólną bazą.')],
    },
  ],
  faq: [
    {
      question: ls('Var bör vi bo vid arbete på OKG?', 'Where should we stay for work at OKG?', 'Gdzie nocować przy pracy na terenie OKG?'),
      answer: ls('Jämför Figeholm, Fårbo och Oskarshamn utifrån rätt infart i Simpevarp, skifttider och transport. Den bästa lösningen beror också på egna sovrum, service och tillgänglighet under hela uppdraget. Vi kontrollerar restiden från den konkreta bostaden när alternativen jämförs.', 'Compare Figeholm, Fårbo and Oskarshamn against the correct entrance in Simpevarp, shifts and transport. The best option also depends on private bedrooms, services and full-period availability. We check travel from the specific property when comparing options.', 'Porównaj Figeholm, Fårbo i Oskarshamn względem właściwego wjazdu w Simpevarp, zmian i transportu. Wybór zależy też od własnych sypialni, usług i dostępności przez całe zlecenie. Dojazd sprawdzamy dla konkretnego obiektu.'),
    },
    {
      question: ls('Kan ni hjälpa till med personalboende vid Clab?', 'Can you help with accommodation for Clab assignments?', 'Czy pomagacie z noclegami przy pracy w Clab?'),
      answer: ls('Ja, skicka projektperiod, antal personer och arbetsplatsens mötespunkt i Simpevarp. Vi jämför bostäder för ert behov av rum, parkering och transport. Beställaren eller anläggningen bekräftar vilka tillträdeskrav som gäller och när personalen ska inställa sig.', 'Yes. Send the project dates, headcount and meeting point in Simpevarp. We compare housing against your room, parking and transport needs. Your client or the facility confirms access requirements and reporting times.', 'Tak. Podaj termin, liczbę osób i miejsce zbiórki w Simpevarp. Porównamy obiekty według potrzeb pokojowych, parkingu i transportu. Zleceniodawca lub zakład potwierdza wymagania dostępu i godzinę stawienia się.'),
    },
    {
      question: ls('Är Mönsterås ett alternativ till Oskarshamn?', 'Is Mönsterås an alternative to Oskarshamn?', 'Czy Mönsterås jest alternatywą dla Oskarshamn?'),
      answer: ls('Det kan vara relevant om ni söker fler bostäder eller arbetar på flera orter. Jämför total boendekostnad med pendlingen till den faktiska arbetsplatsen. För ett uppdrag i Simpevarp behöver resvägen bedömas särskilt; närhet till Oskarshamn betyder inte automatiskt närhet till OKG.', 'It can be relevant for a wider property search or work across locations. Compare the total housing cost with travel to the actual worksite. Assess Simpevarp journeys specifically; being close to Oskarshamn does not automatically mean being close to OKG.', 'Może być opcją przy szerszym poszukiwaniu noclegów lub pracy w kilku miejscach. Zestaw koszt całego pobytu z dojazdem do właściwego zakładu. Trasę do Simpevarp oceń osobno; bliskość Oskarshamn nie oznacza automatycznie bliskości OKG.'),
    },
    {
      question: ls('Kan arbetslaget få egna sovrum och gemensamt kök?', 'Can the team have private bedrooms and a shared kitchen?', 'Czy zespół może mieć własne sypialnie i wspólną kuchnię?'),
      answer: ls('Ange det som ett krav i förfrågan och skriv hur många rum och badrum som behövs. Vi kontrollerar planlösning och utrustning för aktuella alternativ. Bekräfta även tvätt, wifi, parkering och städning för just den bostad ni väljer.', 'List this as a requirement and state the number of bedrooms and bathrooms. We check layouts and equipment for the available options. Confirm laundry, wifi, parking and cleaning for the property you choose.', 'Wpisz to jako wymaganie i podaj liczbę sypialni oraz łazienek. Sprawdzimy układ i wyposażenie dostępnych obiektów. Potwierdź również pranie, wifi, parking i sprzątanie dla wybranego miejsca.'),
    },
  ],
  sources: [
    { title: 'OKG – kontakt och läge i Simpevarp', url: 'https://okg.se/vi-ar-okg/kontakt/' },
    { title: 'SKB – mellanlagret Clab', url: 'https://skb.se/anlaggningar-i-drift/mellanlagret-clab/' },
    { title: 'Scania Produktion Oskarshamn', url: 'https://www.scania.com/oskarshamn/sv/home/om-oss.html' },
  ],
  nearby: ['monsteras', 'vastervik'],
});
