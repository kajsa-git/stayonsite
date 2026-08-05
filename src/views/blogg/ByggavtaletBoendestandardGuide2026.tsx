import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ByggavtaletBoendestandardGuide2026 = () => {
  const post = getBlogPost('byggavtalet-boendestandard-krav-personalboende-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        För byggföretag som skickar montörer och yrkesarbetare till förrättningsorter är boendestandarden inte en fråga om smak &ndash; det är en avtalsfråga. Byggavtalet mellan Byggföretagen och Byggnads reglerar i detalj vad som gäller för fri kost och logi, vilken standard boendet måste hålla och hur traktamentet påverkas beroende på vad arbetsgivaren erbjuder. I den här guiden går vi igenom vad som faktiskt krävs av personalboendet enligt kollektivavtalet, och hur du som arbetsgivare säkerställer att ni ligger rätt &ndash; både juridiskt och för att behålla kompetent personal. Läs även vår {' '}
        <Link href="/blogg/avtalskrav-personalboende-guide-2026">grundguide om avtalskrav för personalboende</Link>{' '} för en bredare genomgång av kollektivavtalens krav.
      </p>

      <h2>Vad säger Byggavtalet om fri kost och logi?</h2>
      <p>
        Byggavtalet 2025&ndash;2027, som gäller under hela 2026, innehåller ett eget avsnitt om 
fri kost och logi samt boendestandard
 i kapitlet om traktamentsersättning. Reglerna gäller när en arbetstagare måste övernatta på förrättningsorten, det vill säga när avståndet mellan bostad och arbetsplats gör dagliga resor orimliga.
      </p>
      <p>
        Traktamentsbeloppen justeras årligen. 
Från och med den 1 januari 2026 höjs det högsta skattefria traktamentsbeloppet från 435 kr till 450 kr, vilket innebär att det nya traktamentsbeloppet är 450 kr per dag
. Om arbetsgivaren istället väljer att tillhandahålla boendet direkt, gäller andra regler: 
om arbetsgivaren tillhandahåller fri logi reduceras traktamentsbeloppet med 35 procent
. Rätten till traktamente eller fri logi uppstår normalt när 
arbetaren har mer än 70 km från sin bostad till arbetsplatsen och behöver övernatta
.
      </p>
      <p>
        Det betyder i praktiken att arbetsgivaren har två vägar att gå: betala fullt traktamente och låta arbetstagaren ordna eget boende, eller tillhandahålla logi och betala ett reducerat traktamente för kost. För större projekt &ndash; till exempel infrastruktursatsningar i regioner som{' '}
        <Link href="/stad/lulea">Luleå</Link>{' '} eller{' '}
        <Link href="/stad/boden">Boden</Link>{' '} &ndash; väljer de flesta entreprenörer att organisera boendet centralt, både för att hålla ner kostnaderna och för att säkerställa att standarden uppfylls konsekvent för hela arbetsstyrkan. Vår artikel om{' '}
        <Link href="/blogg/personalboende-vs-hotell-kostnad-jamforelse">personalboende jämfört med hotellkostnad</Link>{' '} går igenom kalkylen mer i detalj.
      </p>

      <h2>Boendestandardens krav &ndash; vad räknas som godkänt boende?</h2>
      <p>
        Byggavtalet och Byggnads rekommendationer ställer konkreta krav på boendets utformning. Utgångspunkten är att 
boendet ska vara av god standard och du ska inte behöva dela rum om du inte vill
. Innan boendet ordnas ska arbetsgivare och arbetstagare komma överens om formerna &ndash; 
du och din arbetsgivare ska i förväg ha kommit överens om hur och var du ska bo
.
      </p>
      <p>
        Nedan sammanfattas de viktigaste kraven som brukar användas som riktmärke vid bedömning av godtagbar standard:
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Utrymme/funktion</th>
              <th>Krav enligt Byggnads rekommendationer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sovrum</td>
              <td>
Enkelrum bör vara minst 8,5 kvadratmeter
</td>
            </tr>
            <tr>
              <td>Säng</td>
              <td>
En säng på minst 80 × 200 cm är önskvärd
</td>
            </tr>
            <tr>
              <td>Möblering</td>
              <td>
Sänglampa, nattduksbord, garderob för förvaring av kläder och ett skrivbord
</td>
            </tr>
            <tr>
              <td>Matplats</td>
              <td>
Minst 1,2 kvadratmeter per person
</td>
            </tr>
            <tr>
              <td>Kök</td>
              <td>
Tillgång till kyl, frys, mikro samt skåp för förvaring av livsmedel
</td>
            </tr>
            <tr>
              <td>Hygien</td>
              <td>
Toalett, tvättställ och dusch samt tvättmaskiner och möjlighet att torka kläder
</td>
            </tr>
            <tr>
              <td>Gemensamhetsutrymme</td>
              <td>Möblerat utrymme med soffa, fåtöljer och lågt bord vid delat boende</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Kraven gäller oavsett boendeform. Enligt Byggnads gäller samma princip 
om husvagn erbjuds av arbetsgivaren ska boendet kompletteras av närliggande och goda toalett- och duschmöjligheter samt minst ett gemensamhetsutrymme
, och vid lägenhetsboende ska 
standarden på lägenheten vara med fungerande dusch, toalett och matlagningsmöjligheter, och man har alltid rätt till eget rum
.
      </p>
      <blockquote>
        Boendet ska vara av god standard och du ska inte behöva dela rum om du inte vill.
        <br />&mdash; Byggnads, om kollektivavtalets krav på personalboende
      </blockquote>
      <p>
        Detta ställer krav på fastighetsägare och husägare som hyr ut till byggföretag i block. Vill du förstå vilka regionala förutsättningar som gäller för att hitta boende som klarar standarden, är vår{' '}
        <Link href="/blogg/regional-bostadsanalys-2026-var-finns-boende-montorer">regionala bostadsanalys för montörer</Link>{' '} en bra utgångspunkt, tillsammans med{' '}
        <Link href="/blogg/infrastruktur-personalboende-karta-2026">kartan över infrastruktur och personalboende</Link>.
      </p>

      <h2>Nattraktamente vs. fri logi &ndash; vilka regler gäller?</h2>
      <p>
        En vanlig missuppfattning är att arbetsgivaren kan välja fritt mellan att betala fullt traktamente och samtidigt ordna boende. Så fungerar det inte. Om arbetsgivaren tillhandahåller logi ska traktamentet reduceras i motsvarande mån &ndash; annars blir det en dubbelersättning som inte är avsedd enligt avtalet. Som nämnts 
reduceras traktamentsbeloppet med 35 procent
 när fri logi erbjuds. Om arbetsgivaren däremot inte ordnar boende alls, och arbetstagaren själv måste stå för logikostnaden, gäller istället fullt traktamente eller nattraktamente enligt gällande schablonbelopp.
      </p>
      <p>
        Skillnaden mellan de två modellerna handlar i grunden om vem som bär risken och ansvaret för boendets kvalitet. Om standarden inte uppfylls har arbetstagaren rätt till kompensation: 
om inte arbetsgivaren vill ordna ett boende som håller rätt standard, så kan du ha rätt till ett förrättningstillägg
. Det gör det ekonomiskt riskabelt att slarva med boendestandarden &ndash; ett underdimensionerat boende kan i praktiken bli dyrare än ett korrekt dimensionerat, eftersom tillägg och tvister tillkommer utöver den ordinarie kostnaden.
      </p>
      <p>
        För arbetsgivare som hanterar personal på flera orter samtidigt, exempelvis vid utbyggnad av elnät eller järnväg mellan{' '}
        <Link href="/stad/umea">Umeå</Link>{' '} och{' '}
        <Link href="/stad/skelleftea">Skellefteå</Link>, blir frågan om fri logi kontra traktamente en administrativ utmaning i sig. Vår guide om{' '}
        <Link href="/blogg/elnatsutbyggnad-nordsyd-personalboende-guide-2026">personalboende vid elnätsutbyggnad</Link>{' '} beskriver hur större entreprenörer löser detta i praktiken, och{' '}
        <Link href="/blogg/schablonavdrag-skatt-blockhyra-husagare-2026">artikeln om schablonavdrag vid blockhyra</Link>{' '} förklarar skattekonsekvenserna för husägaren som hyr ut.
      </p>

      <h2>Tillfällig bostad vid varaktig omplacering</h2>
      <p>
        Byggavtalet innehåller även ett särskilt avsnitt om 
tillfällig bostad vid varaktig omplacering
, skilt från de vanliga reglerna om förrättning. Det här avsnittet blir relevant när en arbetstagare inte bara skickas iväg tillfälligt, utan faktiskt omplaceras varaktigt till en ny arbetsort &ndash; till exempel vid en lång anställning på ett större infrastrukturprojekt.
      </p>
      <p>
        Skillnaden mot vanlig förrättning är att omplaceringen förväntas vara mer permanent, vilket påverkar både vilken typ av boende som är rimligt och hur länge kostnadsansvaret ligger kvar hos arbetsgivaren. I praktiken innebär det ofta en övergång från tillfälligt boende av hotellkaraktär till en mer lägenhetslik lösning med möjlighet till självhushåll, eftersom arbetstagaren kan komma att bo på orten under en betydligt längre period.
      </p>
      <p>
        Den här gränsdragningen är särskilt viktig vid stora, fleråriga projekt som Norrbotniabanan eller Ostlänken, där arbetskraft ofta flyttas mellan etapper. Vi går igenom detta mer utförligt i{' '}
        <Link href="/blogg/blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026">artikeln om blockhyra vid stora infrastrukturprojekt</Link>{' '} och i{' '}
        <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">guiden till infrastrukturplanen 2026&ndash;2037</Link>.
      </p>

      <h2>Checklista: så säkerställer arbetsgivaren att personalboendet uppfyller kollektivavtalet</h2>
      <ul>
        <li>Kontrollera att sovrum uppfyller minimimåttet på 8,5 kvadratmeter per person och att ingen tvingas dela rum.</li>
        <li>Säkerställ tillgång till fungerande kök med kyl, frys, mikro och förvaring av livsmedel.</li>
        <li>Verifiera att toalett, dusch och tvättmöjligheter finns i tillräcklig omfattning för antalet boende.</li>
        <li>Kom överens om boendeform med arbetstagaren i förväg &ndash; det är ett avtalskrav, inte en formalitet.</li>
        <li>Räkna rätt på traktamentet: fullt belopp om ni inte ordnar logi, reducerat med 35 procent om ni gör det.</li>
        <li>Dokumentera boendestandarden skriftligt inför varje projekt för att undvika tvister om förrättningstillägg.</li>
        <li>Se över boendeplanen löpande vid varaktig omplacering, eftersom kraven skiljer sig från kortare förrättningar.</li>
      </ul>
      <p>
        Att bocka av dessa punkter är särskilt viktigt när flera underentreprenörer delar samma boende, eller när boendet ligger i orter med begränsat utbud, som{' '}
        <Link href="/stad/kiruna">Kiruna</Link>{' '} eller{' '}
        <Link href="/stad/gallivare">Gällivare</Link>. Branschens egna aktörer betonar att kvaliteten på boendet påverkar mer än bara efterlevnaden av avtalet:
      </p>
      <blockquote>
        När arbetsgivare satsar på bra boenden skapas inte bara en trivsam miljö, det stärker även arbetsglädjen, produktiviteten och tryggheten för arbetstagarna.
        <br />&mdash; Adapteo, om krav på entreprenörsbostäder
      </blockquote>
      <p>
        Vill du gå igenom hela processen från behov till inflyttning, från intresseanmälan till första hyresbetalning? Vår artikel{' '}
        <Link href="/blogg/sa-fungerar-det-fran-intresse-till-forsta-hyran">så fungerar det &ndash; från intresse till första hyran</Link>{' '} beskriver varje steg, och{' '}
        <Link href="/blogg/personalboende-guide-2026">grundguiden till personalboende 2026</Link>{' '} ger en helhetsbild för de som är nya i frågan.
      </p>

      <h2>Vanliga frågor</h2>
      <h3>Måste arbetsgivaren alltid erbjuda fri logi enligt Byggavtalet?</h3>
      <p>
        Nej, arbetsgivaren kan istället välja att betala fullt traktamente och låta arbetstagaren ordna eget boende. Men om arbetsgivaren väljer att erbjuda fri logi, ska traktamentet reduceras i enlighet med avtalets regler, och boendet måste då hålla den standard som kollektivavtalet anger.
      </p>
      <h3>Vad händer om personalboendet inte håller rätt standard?</h3>
      <p>
        Om boendet inte uppfyller kraven på god standard kan arbetstagaren ha rätt till kompensation i form av förrättningstillägg. Det innebär att bristande standard kan bli en direkt kostnad för arbetsgivaren utöver den ordinarie boendekostnaden.
      </p>
      <h3>Gäller samma boendekrav vid korta och långa uppdrag?</h3>
      <p>
        Grundkraven på rum, hygienutrymmen och matlagningsmöjligheter gäller oavsett uppdragets längd. Vid varaktig omplacering tillkommer dock särskilda regler om tillfällig bostad, eftersom situationen då liknar en mer permanent flytt snarare än en kortare förrättning.
      </p>
      <h3>Kan flera anställda dela boende för att sänka kostnaden?
      </h3>
      <p>
        Delat boende är tillåtet för gemensamhetsutrymmen, men varje arbetstagare har enligt kollektivavtalet rätt till ett eget sovrum om inte annat överenskommits. Att pressa in fler personer i samma rum för att sänka kostnaden strider mot avtalets krav och riskerar att utlösa förrättningstillägg.
      </p>

      <h2>Så kan StayOnSite hjälpa er att möta kraven</h2>
      <p>
        Att i detalj hålla koll på boendestandard, traktamentesregler och varaktig omplacering tar tid från kärnverksamheten. StayOnSite, grundat 2016, har byggt hela sin verksamhet kring att matcha byggföretag med kvalitetssäkrat personalboende som uppfyller kollektivavtalets krav. Vi arbetar med garanterad hyra och 0&nbsp;% avgift för husägare, väljer noggrant ut professionella hyresgäster, och återkommer alltid med en konkret boendeplan inom 24 timmar &ndash; ofta redan inom några timmar. Priser för färdigt personalboende börjar från 5&nbsp;900 kr per person och månad, och exakt omfattning &ndash; till exempel vad som ingår i kost, städ eller möblering &ndash; avtalas alltid per projekt.
      </p>
      <p>
        Är ni byggföretag och vill säkra ett boende som klarar Byggavtalets krav utan att själva behöva förhandla varje detalj? Ring oss på{' '}
        <a href="tel:0762498486">076-249 84 86</a>{' '} eller läs mer om vårt erbjudande för{' '}
        <Link href="/for-foretag">företag</Link>. Är ni istället husägare som vill hyra ut till trygga, professionella hyresgäster utan avgift, hitta mer information under{' '}
        <Link href="/for-husagare">för husägare</Link>.
      </p>
    </BlogLayout>
  );
};

export default ByggavtaletBoendestandardGuide2026;
