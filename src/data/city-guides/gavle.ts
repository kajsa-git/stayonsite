import { defineGuide, ls } from './common';

export const gavleGuide = defineGuide({
  name: 'Gävle',
  hero: ls('Företagsboende i Gävle – för hamn, industri och datacenter', 'Corporate housing in Gävle – for port, industry and datacenter projects', 'Zakwaterowanie firmowe w Gävle – dla portu, przemysłu i centrów danych'),
  intro: ls(
    'Behöver ni möblerade företagsbostäder i Gävle för ett arbetslag? Hamnen, Billeruds anläggning och datacenteruppdrag i regionen ger olika krav på läge och transport. StayOnSite hjälper er att jämföra hus och lägenheter utifrån rätt arbetsplats, separata sovrum, parkering och bemanning under projektets olika etapper.',
    'Need furnished corporate housing in Gävle for a project team? The port, Billerud’s mill and regional datacenter assignments call for different locations and transport arrangements. StayOnSite helps compare houses and apartments by the actual worksite, private bedrooms, parking and staffing across project phases.',
    'Potrzebujesz umeblowanego zakwaterowania firmowego w Gävle dla ekipy? Port, zakład Billerud i projekty centrów danych w regionie wymagają różnych lokalizacji oraz transportu. StayOnSite pomaga porównać domy i mieszkania według miejsca pracy, własnych sypialni, parkingu i obsady poszczególnych etapów.',
  ),
  metadata: ls('Företagsboende i Gävle för hamn, industri och datacenter. Jämför områden, se publicerade bostäder och planera sovrum, skift och transport för arbetslaget.', 'Corporate housing in Gävle for port, industry and datacenter projects. Compare areas, explore properties and plan bedrooms, shifts and transport.', 'Zakwaterowanie firmowe w Gävle dla portu, przemysłu i centrów danych. Porównaj okolice i obiekty. Zaplanuj sypialnie, zmiany oraz transport.'),
  projects: [
    {
      name: ls('Gävle Hamn', 'Port of Gävle', 'Port Gävle'),
      description: ls('Hamnen omfattar bland annat Fredriksskans och Granudden. För montage, service eller arbete med hamninfrastruktur behöver ni ange vilken del av området uppdraget gäller. Ett centralt boende ska jämföras med den faktiska infarten och var arbetslaget parkerar eller samlas, inte bara med avståndet till vattnet.', 'The port includes Fredriksskans and Granudden. For installation, service or port infrastructure work, specify the part of the port concerned. Compare a central property with the actual entrance and where the team parks or assembles, rather than distance to the waterfront.', 'Port obejmuje m.in. Fredriksskans i Granudden. Przy montażu, serwisie lub infrastrukturze podaj właściwą część portu. Obiekt w centrum porównuj z rzeczywistym wjazdem oraz miejscem parkowania lub zbiórki, a nie samą odległością od wody.'),
    },
    {
      name: ls('Billerud och processindustri', 'Billerud and process industry', 'Billerud i przemysł procesowy'),
      description: ls('Billerud har en produktionsanläggning i Gävle. Vid underhålls- och installationsuppdrag behöver boendeplanen anpassas efter beställarens arbetsplats och skift. Beskriv om personalen behöver egna sovrum, gemensam transport och utrymme för att tvätta eller torka arbetskläder. Det gör jämförelsen mellan hus och lägenheter mer träffsäker.', 'Billerud operates a production facility in Gävle. For maintenance and installation assignments, align accommodation with the client’s worksite and shifts. State private bedroom needs, shared transport and space for washing or drying workwear. This makes the comparison between houses and apartments more useful.', 'Billerud prowadzi zakład produkcyjny w Gävle. Przy konserwacji i instalacjach dostosuj noclegi do miejsca pracy i zmian zleceniodawcy. Opisz własne sypialnie, wspólny transport oraz pranie i suszenie odzieży roboczej. Ułatwi to porównanie domów z mieszkaniami.'),
    },
    {
      name: ls('Datacenter i Gävle–Sandviken', 'Datacenters in Gävle–Sandviken', 'Centra danych w Gävle–Sandviken'),
      description: ls('Microsoft driver datacenter i Gävle och Sandviken. För entreprenörer inom el, kyla och installation är det den bekräftade arbetsplatsen och den egna entreprenadens etapp som styr boendebehovet. Ange adress, mobiliseringsdatum och planerad personalökning så kan boendealternativen jämföras mot uppdraget.', 'Microsoft operates datacenters in Gävle and Sandviken. For electrical, cooling and installation contractors, the confirmed worksite and your own contract phase determine accommodation needs. Include the address, mobilisation date and expected staffing increases so housing can be compared against the assignment.', 'Microsoft prowadzi centra danych w Gävle i Sandviken. Dla wykonawców instalacji elektrycznych, chłodzenia i montażu liczą się potwierdzony zakład oraz etap własnego kontraktu. Podaj adres, datę rozpoczęcia i planowane zwiększenie obsady, aby porównać noclegi z potrzebami zlecenia.'),
    },
  ],
  areas: [
    {
      name: 'Centrala Gävle och Brynäs',
      suitableFor: ls('För personal som vill ha en stadsbas med vardagsservice eller anländer med tåg. Relevant att jämföra när laget arbetar på flera adresser och samåker från en gemensam plats.', 'For staff wanting a town base with daily services or arriving by train. Consider this for multi-site work and shared transport from a common pick-up point.', 'Dla osób chcących bazy w mieście z codziennymi usługami lub przyjeżdżających pociągiem. Opcja przy kilku adresach pracy i wspólnym transporcie.'),
      check: ls('Parkering för samtliga servicebilar, väg till rätt hamninfart eller industri och avstånd till samlingspunkten. Ett centralt läge innebär inte automatiskt närhet till er arbetsplats.', 'Parking for every work van, the route to the correct port entrance or plant, and distance to pick-up. A central address is not automatically close to your worksite.', 'Parking dla wszystkich aut, trasa do właściwego wjazdu do portu lub zakładu i odległość od zbiórki. Centrum nie oznacza automatycznie bliskości miejsca pracy.'),
    },
    {
      name: 'Bomhus',
      suitableFor: ls('Ett område att jämföra för industriuppdrag och arbetsplatser på den sidan av Gävle. Utgå från beställarens exakta adress när bostäder och möjliga transportupplägg bedöms.', 'An area to compare for industrial assignments and worksites on that side of Gävle. Use the client’s exact address when assessing housing and transport options.', 'Okolica do porównania przy zleceniach przemysłowych po tej stronie Gävle. Przy ocenie noclegów i transportu kieruj się dokładnym adresem zleceniodawcy.'),
      check: ls('Infart, skift, antal badrum och hur tvätt och matlagning fungerar för hela laget. Kontrollera rumsfördelningen om dag- och nattpersonal delar samma bostad.', 'Entrance, shifts, bathrooms and laundry and cooking capacity for the team. Check room allocation when day and night workers share a property.', 'Wjazd, zmiany, łazienki oraz pranie i gotowanie dla całego zespołu. Sprawdź podział pokoi przy wspólnym pobycie pracowników dziennych i nocnych.'),
    },
    {
      name: 'Sätra och Strömsbro',
      suitableFor: ls('Alternativ att ta med när ni jämför bostäder utanför centrum. Bedöm läget tillsammans med arbetsplatsens infart, vägval och hur personalen ska resa till och från arbetet.', 'Alternatives when comparing housing outside the centre. Assess location alongside the site entrance, route and how staff will travel to and from work.', 'Alternatywy przy porównywaniu noclegów poza centrum. Oceń położenie wraz z wjazdem, trasą i sposobem dojazdu pracowników.'),
      check: ls('Bekräftad parkering, möjlighet att samla laget och avstånd till service från den konkreta adressen. Stäm av eventuella byten mellan bil och kollektivtrafik mot skiften.', 'Confirmed parking, a place to assemble the team and actual distance to services. Match any transfers between car and public transport to shifts.', 'Potwierdzony parking, miejsce zbiórki i odległość konkretnego adresu od usług. Ewentualne przesiadki między autem a komunikacją dopasuj do zmian.'),
    },
    {
      name: 'Valbo och Forsbacka',
      suitableFor: ls('Områden att jämföra om uppdraget ligger väster om Gävle eller omfattar resor mot Sandviken. Be om rätt arbetsplatsadress innan ni väljer mellan en bas i Gävle och ett läge längre västerut.', 'Areas to compare for work west of Gävle or travel towards Sandviken. Obtain the actual worksite address before choosing between a Gävle base and a location farther west.', 'Okolice do porównania przy pracy na zachód od Gävle lub dojazdach w stronę Sandviken. Ustal dokładny adres przed wyborem bazy w Gävle lub dalej na zachód.'),
      check: ls('Restid till varje del av projektet och tillgång till transport för dem som saknar egen bil. Vid flera arbetsplatser kan separata boenden minska behovet av dagliga gruppresor.', 'Travel to each project location and transport for staff without cars. Separate properties may reduce daily group travel when several worksites are involved.', 'Dojazd do każdej części projektu i transport dla osób bez auta. Przy kilku zakładach osobne obiekty mogą ograniczyć codzienne wspólne przejazdy.'),
    },
  ],
  planning: [
    {
      title: ls('Ange rätt del av hamnen eller industriområdet', 'Identify the correct port or industrial area', 'Wskaż właściwą część portu lub terenu przemysłowego'),
      paragraphs: [ls('Skriv anläggning, infart och samlingsplats i förfrågan. För hamnarbete kan arbetsplatsens namn avse ett stort område, och den väg som servicebilar får använda behöver styra jämförelsen. Stäm av med beställaren var laget ska parkera och om ni ska fortsätta med gemensam transport inne på området. Räkna restiden till den punkt där arbetspasset faktiskt börjar.', 'Include the facility, entrance and assembly point in your enquiry. A port name may cover a large area, so compare the routes work vans can actually use. Check where staff park and whether shared transport continues inside the site. Assess the journey to where the working shift really starts.', 'W zapytaniu podaj zakład, wjazd i zbiórkę. Nazwa portu może oznaczać rozległy teren, dlatego porównaj trasy dostępne dla aut służbowych. Uzgodnij parking i dalszy transport wewnątrz obszaru. Oceniaj dojazd do punktu rzeczywistego rozpoczęcia zmiany.')],
    },
    {
      title: ls('Dela upp boendebehovet efter entreprenadens etapper', 'Split accommodation needs by contract phase', 'Podziel potrzeby noclegowe według etapów kontraktu'),
      paragraphs: [ls('Elinstallation, kyla, montage och driftsättning kan innebära att olika personer kommer vid olika tidpunkter. Skicka en enkel bemanningsplan med minsta bekräftade behov och senare möjliga tillskott. Be att offerten tydliggör vilka rum som är bokade och vilka utökningar som kräver ny bekräftelse. Det minskar risken att betala för tomma rum eller planera efter bostäder som inte är reserverade.', 'Electrical work, cooling, installation and commissioning may bring different staff at different times. Send a staffing plan showing confirmed requirements and possible later additions. Ask the proposal to distinguish booked rooms from extensions needing fresh confirmation. This helps avoid paying for empty rooms or relying on properties not reserved.', 'Instalacje elektryczne, chłodzenie, montaż i rozruch mogą wymagać różnych pracowników w różnych terminach. Prześlij plan potwierdzonych potrzeb i możliwych późniejszych przyjazdów. Propozycja powinna oddzielać zarezerwowane pokoje od rozszerzeń do ponownego potwierdzenia. Ogranicza to puste pokoje i opieranie planu na niezarezerwowanych obiektach.')],
    },
    {
      title: ls('Jämför gruppboende med flera mindre lägenheter', 'Compare a shared house with smaller apartments', 'Porównaj wspólny dom z mniejszymi mieszkaniami'),
      paragraphs: [ls('En samlad bostad kan förenkla gemensam transport, men kontrollera sovrum, badrum, kökskapacitet och hur nattpersonal får vila. Flera lägenheter kan vara värda att jämföra när teamen arbetar på skilda platser eller har olika arbetstider. Räkna samman hyra, service och fordon för båda uppläggen och kontrollera att samma boenden kan användas under hela den avtalade perioden.', 'One shared property can simplify transport, but check bedrooms, bathrooms, cooking capacity and rest for night staff. Several apartments may suit teams at different sites or on different shifts. Add rent, services and vehicles for both arrangements and confirm the same properties are available for the full agreed period.', 'Wspólny obiekt może uprościć transport, ale sprawdź sypialnie, łazienki, kuchnię i odpoczynek nocnej zmiany. Kilka mieszkań może odpowiadać ekipom w różnych miejscach lub godzinach. Zsumuj czynsz, usługi i pojazdy dla obu wariantów oraz potwierdź dostępność tych samych obiektów przez uzgodniony okres.')],
    },
  ],
  faq: [
    {
      question: ls('Hur väljer vi boende för arbete i Gävle Hamn?', 'How do we choose housing for work in the Port of Gävle?', 'Jak wybrać nocleg do pracy w porcie Gävle?'),
      answer: ls('Ange om uppdraget gäller Fredriksskans, Granudden eller någon annan del av hamnen, tillsammans med rätt infart och skift. Vi jämför bostäder efter den faktiska körvägen och behov av sovrum och parkering. Bekräfta arbetsplatsens samlingspunkt med beställaren.', 'Specify Fredriksskans, Granudden or the relevant port area, entrance and shifts. We compare properties by the actual route, bedrooms and parking. Confirm the worksite assembly point with your client.', 'Podaj Fredriksskans, Granudden lub właściwą część portu, wjazd i zmiany. Porównamy obiekty według rzeczywistej trasy, sypialni i parkingu. Zbiórkę potwierdź ze zleceniodawcą.'),
    },
    {
      question: ls('Kan vi söka personalboende för datacenterprojekt?', 'Can we request accommodation for datacenter projects?', 'Czy można zapytać o noclegi przy projekcie centrum danych?'),
      answer: ls('Ja. Skicka arbetsplatsadress, entreprenadens period och bemanning per etapp. Vi undersöker boendealternativ för uppdraget i Gävleområdet. Om delar av arbetet utförs i Sandviken eller på andra adresser ska det framgå så att transport och områdesval blir rätt.', 'Yes. Send the worksite address, contract dates and staffing by phase. We investigate housing for the assignment in the Gävle area. Include work in Sandviken or at other addresses so transport and location can be assessed correctly.', 'Tak. Podaj adres pracy, terminy kontraktu i obsadę etapów. Sprawdzimy noclegi dla zlecenia w rejonie Gävle. Uwzględnij pracę w Sandviken lub pod innymi adresami, aby właściwie ocenić transport i lokalizację.'),
    },
    {
      question: ls('Är Valbo eller centrala Gävle bättre för vårt projekt?', 'Is Valbo or central Gävle better for our project?', 'Czy dla projektu lepsze jest Valbo czy centrum Gävle?'),
      answer: ls('Det avgörs av den konkreta arbetsplatsen, skifttider och vilka fordon laget har. Jämför båda lägena med samma krav på sovrum och service. En lägre hyra bör vägas mot dagliga resor och om personalen behöver fler fordon för att få vardagen att fungera.', 'The actual worksite, shifts and vehicles determine the choice. Compare both locations against the same bedroom and service requirements. Weigh lower rent against daily travel and any extra vehicles needed for everyday routines.', 'Decydują dokładne miejsce pracy, zmiany i dostępne pojazdy. Porównaj obie lokalizacje według tych samych wymagań pokojowych i usług. Niższy czynsz zestaw z codziennymi przejazdami i ewentualnymi dodatkowymi autami.'),
    },
    {
      question: ls('Kan flera arbetslag dela boende utan att dela sovrum?', 'Can teams share accommodation without sharing bedrooms?', 'Czy ekipy mogą dzielić obiekt bez dzielenia sypialni?'),
      answer: ls('Ange antal separata sovrum och vilka skift som ska bo tillsammans. Vi kontrollerar aktuella bostäders planlösning och kan jämföra flera mindre alternativ. Bad- och kökskapacitet samt parkering behöver bedömas utifrån det totala antalet personer, inte bara antal rum.', 'State the separate bedrooms required and which shifts will share. We check current layouts and can compare several smaller options. Assess bathrooms, cooking capacity and parking against total headcount as well as room numbers.', 'Podaj liczbę oddzielnych sypialni i zmiany, które będą mieszkać razem. Sprawdzimy układy i możemy porównać kilka mniejszych obiektów. Łazienki, kuchnię i parking oceń według całkowitej liczby osób, a nie wyłącznie pokoi.'),
    },
  ],
  sources: [
    { title: 'Gävle Hamn – Fredriksskans och Granudden', url: 'https://gavlehamn.se/fran-granudden-till-fredriksskans/' },
    { title: 'Billerud – Gävle bruk', url: 'https://www.billerud.se/om-billerud/vara-produktionsanlaggningar/gavle' },
    { title: 'Microsoft – datacenter i Sverige', url: 'https://local.microsoft.com/communities/emea/sweden/' },
  ],
  nearby: ['uppsala', 'falun'],
});
