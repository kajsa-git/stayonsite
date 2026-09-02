import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const LaddstationerPersonalboendeHusagareGuide = () => {
  const post = getBlogPost('laddstationer-personalboende-husagare-guide-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Fler och fler byggföretag ställer om sina fordonsflottor till el &ndash; och det märks direkt i vilka krav
        de ställer på boendet till sina montörer och yrkesarbetare. För husägare som hyr ut via blockhyra till
        entreprenörer blir en fungerande laddstation snabbt en förutsättning, inte en bonus. Samtidigt skärper
        Boverket kraven på laddinfrastruktur genom BFS 2026:4, och det finns flera bidrag och avdrag att känna
        till innan du sätter spaden i jorden. Den här guiden går igenom vad som gäller 2026, steg för steg.
      </p>

      <h2>1. Varför laddstation blir allt viktigare vid uthyrning till byggföretag</h2>
      <p>
        Elektrifieringen av företagens fordonsflottor går snabbt. 
Sverige är en av de ledande marknaderna där över 70 procent av nya företagsbilar är elektriska.
{' '}
        Det gäller även servicebilar och skåpbilar hos entreprenörer, vilket direkt påverkar vilka krav
        byggföretag ställer på boende de blockhyr till sina team. 
Elbilarnas marknadsandel landar på 41 procent hittills under 2026, vilket är i linje med helårsprognosen på 40 procent.

      </p>
      <p>
        Att kunna erbjuda laddning på plats är också en ekonomisk fråga för hyresgästen. 
Sedan 1 juli 2023 är det skattefritt för anställda att ladda sin elbil på arbetsplatsen, och undantaget gäller fram till 30 juni 2026 med förslag om att göra reglerna permanenta från och med 1 juli 2026.
{' '}
        För byggföretag med stora andelar elbilar i flottan innebär det att boendet med laddmöjlighet blir
        ekonomiskt fördelaktigt jämfört med alternativ utan. Läs mer om hur infrastruktur påverkar valet av
        boende i vår{' '}
        <Link href="/blogg/infrastruktur-personalboende-karta-2026">karta över infrastruktur vid personalboende</Link>{' '}
        och i{' '}
        <Link href="/blogg/elnatsutbyggnad-nordsyd-personalboende-guide-2026">guiden om elnätsutbyggnad och personalboende</Link>.
      </p>

      <h2>2. Nya byggregler BFS 2026:4 och det retroaktiva laddkravet 2027</h2>
      <p>
        
Den 1 juli 2026 träder Boverkets nya föreskrifter om hållbar mobilitet (BFS 2026:4) i kraft, vilket innebär skärpta krav på laddinfrastruktur vid nybyggnation och ombyggnad av fastigheter samt retroaktiva krav på befintliga lokalbyggnader från 1 januari 2027.
{' '}
        Reglerna bygger på EU:s uppdaterade energiprestandadirektiv och omfattar även krav på cykelparkering,
        men det är laddkraven som får störst praktisk betydelse för fastighetsägare.
      </p>
      <p>
        
Från 1 januari 2027 utökas de retroaktiva kraven: befintliga lokalbyggnader med fler än 20 parkeringsplatser måste välja antingen tomrör till 50 procent av platserna eller minst en laddpunkt per 10 platser.
{' '}
        Kraven gäller i första hand kommersiella lokalbyggnader, men samma logik driver efterfrågan även hos
        privata husägare som hyr ut till byggföretag &ndash; hyresgästerna förväntar sig samma standard som de
        möter på kontor och arbetsplatser.
      </p>

      <blockquote>
        
&quot;Det här är den största förändringen i lagkraven för fastigheter och laddinfrastruktur sedan Boverkets första regler kom. Tidigare kunde man vänta och se &ndash; nu måste man agera. Retroaktiva krav på befintliga byggnader innebär att det inte längre räcker att planera för framtiden. Framtiden är redan här&quot;, säger Niklas Berg, medgrundare och affärsutvecklare på ChargeNode.

      </blockquote>

      <p>
        En viktig detalj för husägare i planeringsfasen: 
de nya reglerna innebär att många fastighetsägare behöver agera snabbare än tidigare, eftersom hela processen från projektering till installation och driftsättning normalt tar 6&ndash;9 månader.
{' '}
        Vill du ha laddinfrastrukturen på plats inför en säsong med blockhyra till byggföretag bör du alltså
        räkna med god framförhållning. Behöver du samtidigt se över avtalsvillkor inför en sådan uthyrning,
        finns vägledning i vår{' '}
        <Link href="/blogg/avtalskrav-personalboende-guide-2026">guide om avtalskrav vid personalboende</Link>{' '}
        och i{' '}
        <Link href="/blogg/blockhyra-nya-regler-juli-2026-guide-foretag">artikeln om nya regler för blockhyra</Link>.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Fastighetstyp</th>
              <th>Regelverk</th>
              <th>Datum</th>
              <th>Krav</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nybyggnation/större ombyggnad</td>
              <td>BFS 2026:4</td>
              <td>1 juli 2026</td>
              <td>Skärpta tekniska krav: smart laddning, öppna protokoll (OCPP), interoperabilitet</td>
            </tr>
            <tr>
              <td>Befintlig lokalbyggnad, &gt;20 p-platser</td>
              <td>BFS 2026:4, retroaktivt</td>
              <td>1 januari 2027</td>
              <td>Minst 1 laddpunkt per 10 platser eller tomrör till 50 % av platserna</td>
            </tr>
            <tr>
              <td>Privat husägare (småhus, personalboende)</td>
              <td>Inget lagkrav idag</td>
              <td>&ndash;</td>
              <td>Frivilligt, men allt vanligare krav från byggföretag vid blockhyra</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. Bidrag och avdrag för husägare: vad gäller och hur ansöker man</h2>
      <p>
        Som privat husägare är det viktigt att skilja på de två huvudsakliga stöden. 
&quot;Ladda bilen-bidraget&quot; är inte tillgängligt för privatpersoner som vill installera laddboxar i sina hem.
{' '}
        Det stödet riktar sig i stället till 
företag och BRF som kan ansöka om &quot;Ladda bilen&quot;-bidrag från Naturvårdsverket, vilket täcker upp till 15 000 kr per laddpunkt.
{' '}
        Sedan 1 februari 2026 gäller nya villkor: 
stora fastighetsägare och koncerner kan nu göra omfattande utrullningar utan att begränsas av det tidigare EU-taket för stöd av mindre betydelse.
{' '}
        Viktigt att komma ihåg om du driver verksamhet kring uthyrningen: 
företag och organisationer som tillhandahåller varor eller tjänster på marknaden måste skicka in ansökan innan installation påbörjas.

      </p>
      <p>
        För husägare som installerar laddbox i sin egen bostad &ndash; det vill säga småhus, ägarlägenhet eller
        bostadsrätt som du själv äger &ndash; är det i stället Grönt avdrag som gäller. 
Installation av laddningspunkt till elfordon ger skattereduktion med 50 procent av kostnaden för arbete och material.
{' '}
        Avdraget hanteras direkt på fakturan av installationsföretaget, precis som ROT- och RUT-avdrag, och
        taket ligger på 50 000 kronor per person och år.
      </p>

      <blockquote>
        
&quot;Förändringarna i Ladda bilen förbättrar möjligheterna till elbilsladdning för alla som bor i flerfamiljshus. Det är en viktig del i elektrifieringen av transporter&quot;, säger Axel Nekham, chef för enheten för laddinfrastruktur på Klimatklivet.

      </blockquote>

      <p>
        Fundera på om det du planerar kan omfattas av skatteregler för uthyrningsintäkter i övrigt &ndash;
        vi går igenom det i{' '}
        <Link href="/blogg/schablonavdrag-skatt-blockhyra-husagare-2026">guiden om schablonavdrag vid blockhyra</Link>.
        Är du osäker på hur privatuthyrningslagens regler samspelar med företagsuthyrning finns svar i{' '}
        <Link href="/blogg/privatuthyrningslagen-reform-2026">artikeln om privatuthyrningslagens reform</Link>.
      </p>

      <h2>4. Installation steg för steg</h2>
      <p>
        Innan du beställer laddbox behöver du kartlägga fastighetens elanläggning. Ofta är det just
        huvudsäkringens kapacitet &ndash; inte själva laddboxen &ndash; som avgör hur snabbt och hur många
        fordon som kan laddas samtidigt utan att du behöver uppgradera elanslutningen.
      </p>
      <ul>
        <li>
          <strong>1. Behovsanalys.</strong> Hur många fordon behöver ladda samtidigt, och vilken effekt
          finns tillgänglig i huvudsäkringen?
        </li>
        <li>
          <strong>2. Certifierad installatör.</strong> 
Arbetet måste utföras av en auktoriserad elinstallatör
 för att installationen ska vara godkänd och för att bidrag och avdrag ska kunna beviljas.
        </li>
        <li>
          <strong>3. Rätt utrustning.</strong> Laddpunkten ska ha uttag av Typ 2 eller Combo 2 för att
          uppfylla kraven för både Grönt avdrag och Ladda bilen-bidraget.
        </li>
        <li>
          <strong>4. Individuell mätning vid flera hyresgäster.</strong> 
Varje punkt ska vara förberedd för elmätning och debitering av den faktiska förbrukningen
, vilket är avgörande om du hyr ut till flera hyresgäster eller ett byggföretag som vill se transparent kostnad per fordon.
        </li>
        <li>
          <strong>5. Driftsättning och test.</strong> Kontrollera lastbalansering så att flera fordon kan
          ladda samtidigt utan att överbelasta anläggningen.
        </li>
      </ul>
      <p>
        Vad som exakt ingår i en installation varierar mellan projekt &ndash; vanligtvis ingår
        behovsanalys, materialkostnad, installationsarbete och driftsättning, men exakt omfattning avtalas
        per projekt med din elinstallatör. Är du osäker på hur laddinfrastruktur passar in i en större
        satsning på personalboende, se vår{' '}
        <Link href="/blogg/forbered-fastighet-blockhyra-infrastruktursatsning-2026">guide om att förbereda fastigheten för blockhyra</Link>.
      </p>

      <h2>5. Så blir laddstation en konkurrensfördel vid blockhyra till byggföretag</h2>
      <p>
        
Fastighetsägare som inte erbjuder laddmöjlighet riskerar att förlora hyresgäster till konkurrenter som gör det, eftersom laddinfrastruktur inte bara handlar om regelefterlevnad utan om fastighetens konkurrenskraft.
{' '}
        För husägare som hyr ut till byggföretag inför infrastrukturprojekt, ombyggnationer eller
        anläggningsarbeten kan en fungerande laddstation vara skillnaden mellan att bli förstahandsval eller
        inte, särskilt när entreprenören själv har krav från sina uppdragsgivare på fossilfria transporter.
        Det gäller inte minst i norr, där stora industrisatsningar driver efterfrågan &ndash; läs mer i vår
        artikel om{' '}
        <Link href="/blogg/gron-omstallning-norr-boende">grön omställning och boende i norra Sverige</Link>.
      </p>
      <p>
        Boende med laddstation efterfrågas i hela landet, från{' '}
        <Link href="/stad/stockholm">Stockholm</Link> och{' '}
        <Link href="/stad/goteborg">Göteborg</Link> till{' '}
        <Link href="/stad/lulea">Luleå</Link>,{' '}
        <Link href="/stad/boden">Boden</Link> och{' '}
        <Link href="/stad/umea">Umeå</Link>, där stora infrastruktur- och industriprojekt drar in
        byggföretag med elektrifierade fordonsflottor. Ska du planera var ditt boende passar bäst geografiskt,
        se vår{' '}
        <Link href="/blogg/regional-bostadsanalys-2026-var-finns-boende-montorer">regionala bostadsanalys för montörer</Link>{' '}
        och{' '}
        <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">guiden om infrastrukturplanen 2026&ndash;2037</Link>.
      </p>

      <h2>Vanliga frågor</h2>
      <h3>Måste jag installera laddstation för att hyra ut till byggföretag?</h3>
      <p>
        Det finns inget generellt lagkrav för privata husägare idag, men allt fler byggföretag ställer det
        som praktiskt krav vid blockhyra eftersom en stor andel av deras fordon är elektrifierade. En
        laddstation ökar chansen att bli förstahandsval vid upphandling av personalboende.
      </p>
      <h3>Kan jag få både Grönt avdrag och Ladda bilen-bidraget?</h3>
      <p>
        Nej, du väljer det stöd som passar din situation. Grönt avdrag gäller privatpersoner som installerar
        i sin egen bostad, medan Ladda bilen-bidraget riktar sig till företag, BRF:er och organisationer.
        Samma installation kan inte få båda stöden samtidigt.
      </p>
      <h3>Vad händer om jag väntar med installationen till 2027?</h3>
      <p>
        Om din fastighet omfattas av de retroaktiva kraven i BFS 2026:4 riskerar du att stå utan godkänd
        laddinfrastruktur när kravet träder i kraft 1 januari 2027. Eftersom hela processen ofta tar
        6&ndash;9 månader från beslut till driftsättning är det klokt att påbörja planeringen i god tid.
      </p>
      <h3>Behöver varje hyresgäst en egen mätare?</h3>
      <p>
        Ja, om du hyr ut till flera hyresgäster eller till ett byggföretag med flera fordon bör varje
        laddpunkt vara förberedd för individuell elmätning så att förbrukningen kan debiteras korrekt per
        fordon eller hyresgäst.
      </p>

      <h2>Redo att erbjuda ett boende som byggföretag vill hyra?</h2>
      <p>
        StayOnSite hjälper dig som husägare att matcha ditt boende &ndash; med eller utan laddstation &ndash;
        mot professionella hyresgäster inom bygg och infrastruktur. Vi tar 0 % avgift av dig som husägare,
        erbjuder garanterad hyra och en boendeplan inom 24 timmar &ndash; vi återkommer alltid inom en
        arbetsdag, ofta inom några timmar. StayOnSite grundades 2016 och har betyg 5,0 på Google. Är du
        byggföretag och söker boende till era montörer, se{' '}
        <Link href="/for-foretag">/for-foretag</Link>. Är du husägare som vill hyra ut, läs mer på{' '}
        <Link href="/for-husagare">/for-husagare</Link>. Ring oss gärna direkt på{' '}
        <a href="tel:0762498486">076-249 84 86</a> för att komma igång.
      </p>
    </BlogLayout>
  );
};

export default LaddstationerPersonalboendeHusagareGuide;
