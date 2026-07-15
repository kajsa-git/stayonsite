import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ElnatsutbyggnadNordSydPersonalboende = () => {
  const post = getBlogPost('elnatsutbyggnad-nordsyd-personalboende-guide-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Sverige står inför sin största elnätssatsning i modern tid. Svenska kraftnät bygger, förnyar och
        förstärker stamnätet i en takt som saknar motstycke sedan efterkrigstiden &ndash; och för varje
        spadtag i denna utbyggnad följer ett konkret behov av boende för entreprenörer, montörer och
        projektledare längs kraftledningskorridorerna. I den här analysen går vi igenom vad NordSyd och
        övriga stamnätsprogram innebär för perioden 2026&ndash;2035, var arbetskraften behövs mest och hur
        entreprenörer bör tänka kring personalboende inför upphandling och byggstart.
      </p>

      <h2>En historisk satsning: 180 miljarder kronor och stamnätets omställning</h2>
      <p>
        
Totalt handlar satsningen om cirka 180 miljarder kronor under perioden 2026&ndash;2035, vilket gör den till en av de största infrastruktursatsningarna i modern tid.
{' '}
        Bakgrunden är att 
stora delar av dagens stamnät byggdes på 1950-, 60- och 70-talen och nu närmar sig slutet av sin tekniska livslängd
,
        samtidigt som elektrifieringen av industri, transporter och datacenter driver upp behovet av
        överföringskapacitet.
      </p>
      <blockquote>
        &quot;Vi satsar 180 miljarder och det är en viktig del i bygget av ett konkurrenskraftigt Sverige som når sina klimatmål&quot;, säger Daniel Gustafsson, avdelningschef Kraftsystem på Svenska kraftnät.
      </blockquote>
      <p>
        Rent praktiskt innebär planen att 
Svenska kraftnät de kommande tio åren ska ta cirka 2 900 kilometer nya ledningar och cirka 40 nya stationer i drift, samt reinvestera över 1 100 km ledningar och cirka hälften av de närmare 200 stationerna
.
        Investeringstakten ökar snabbt: 
de årliga investeringarna i anläggningsprojekt kommer att öka från nio miljarder kronor 2025 till 20 miljarder per år under 2026 och 2027
.
        För byggsektorn, elentreprenörer och underleverantörer innebär det flera parallella storprojekt i
        olika landsändar under lång tid &ndash; något vi också beskriver i vår{' '}
        <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">guide till infrastrukturplanen 2026&ndash;2037</Link>.
      </p>

      <h2>NordSyd och övriga program: var byggs det?</h2>
      <p>
        Det enskilt största initiativet heter NordSyd. 
Svenska kraftnäts mest omfattande nätutvecklingsinitiativ någonsin omfattar investeringar i stamnätet för över 100 miljarder kronor, och när det är färdigbyggt i slutet av 2030-talet kommer överföringskapaciteten mellan elområde 2 och 3 att öka från dagens 7 300 megawatt till cirka 10 500 MW.
{' '}
        
NordSyd berör åtta av Sveriges län: Västernorrland, Jämtland, Gävleborg, Dalarna, Värmland, Västmanland, Uppsala och Stockholm.
{' '}
        Programmet är 
indelat i tio investeringspaket utifrån en regional nätstruktur
 och
        består av fyra huvudstråk: 
Uppsalabenet, Västeråsbenet, Karlstadbenet och Hallsbergsbenet, vilka beräknas tas i drift 2033&ndash;2035
.
      </p>
      <p>
        Parallellt med NordSyd pågår flera regionala program. 
Bland de större investeringarna under perioden 2026&ndash;2028 finns programmen Storstockholm Väst och Stockholms Ström, åtgärdspaket Norrlandskusten, Gotlandsförbindelsen och programmet NordSyd.
{' '}
        I Norrbotten och Västerbotten är målet tydligt: 
Svenska kraftnät har på uppdrag av regeringen slagit fast att målsättningen ska vara att öka överföringskapaciteten i Snitt 1 norrgående riktning från dagens 3 300 MW till 5 500 MW till år 2035.
{' '}
        Den satsningen hänger ihop med den gröna omställningen i norr som vi tidigare djupdykt i, se{' '}
        <Link href="/blogg/gron-omstallning-norr-boende">artikeln om grön omställning och boende i norr</Link>.
      </p>
      <p>
        I Skåne pågår en separat men lika omfattande regional planeringsprocess tillsammans med regionnätsägaren.
        
 Sedan 2016 har effektuttagsabonnemangen i Skåne ökat med 30 procent
, och{' '}
        
fullt utbyggt ökar den driftsäkra kapaciteten till regionen med över 1 000 MW, vilket motsvarar två gånger förbrukningen i Stor-Malmö
.
      </p>
      <blockquote>
        &quot;I debatten kan man få bilden av att Skåne inte har fått något ökat effektuttag från stamnätet på mycket lång tid&quot;, säger Daniel Gustafsson, som pekar på att effektuttaget faktiskt har ökat kraftigt sedan 2016.
      </blockquote>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Program/paket</th>
              <th>Berörda län och regioner</th>
              <th>Ungefärlig investeringsnivå</th>
              <th>Beräknad driftsättning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>NordSyd (fyra stråk)</td>
              <td>Västernorrland, Jämtland, Gävleborg, Dalarna, Värmland, Västmanland, Uppsala, Stockholm</td>
              <td>Över 100 miljarder kr</td>
              <td>Etapper 2030&ndash;2035</td>
            </tr>
            <tr>
              <td>Storstockholm Väst / Stockholms Ström</td>
              <td>Storstockholm, delar av Västra Götaland</td>
              <td>Del av 70 md kr 2027&ndash;2029</td>
              <td>Successivt, tidigt 2030-tal</td>
            </tr>
            <tr>
              <td>Norrlandskusten / Fossilfritt övre Norrland</td>
              <td>Norrbotten, Västerbotten</td>
              <td>Del av 180 md-satsningen</td>
              <td>Snitt 1-mål till 2035</td>
            </tr>
            <tr>
              <td>Regional plan södra Sverige</td>
              <td>Skåne</td>
              <td>Tre åtgärdspaket</td>
              <td>Huvudsakligen 2036&ndash;2045</td>
            </tr>
            <tr>
              <td>Gotlandsförbindelsen</td>
              <td>Gotland</td>
              <td>Del av investeringsprogrammet</td>
              <td>Tidigt 2030-tal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Konkret innebär detta byggaktivitet i orter som{' '}
        <Link href="/stad/stockholm">Stockholm</Link>,{' '}
        <Link href="/stad/vasteras">Västerås</Link>,{' '}
        <Link href="/stad/orebro">Örebro</Link>,{' '}
        <Link href="/stad/karlstad">Karlstad</Link>,{' '}
        <Link href="/stad/gavle">Gävle</Link>,{' '}
        <Link href="/stad/ornskoldsvik">Örnsköldsvik</Link>,{' '}
        <Link href="/stad/ostersund">Östersund</Link>,{' '}
        <Link href="/stad/lulea">Luleå</Link>,{' '}
        <Link href="/stad/boden">Boden</Link>,{' '}
        <Link href="/stad/skelleftea">Skellefteå</Link>,{' '}
        <Link href="/stad/umea">Umeå</Link>,{' '}
        <Link href="/stad/malmo">Malmö</Link>,{' '}
        <Link href="/stad/lund">Lund</Link> och{' '}
        <Link href="/stad/helsingborg">Helsingborg</Link>. En regional genomgång av var boende faktiskt
        efterfrågas finns i vår{' '}
        <Link href="/blogg/regional-bostadsanalys-2026-var-finns-boende-montorer">regionala bostadsanalys 2026</Link>{' '}
        och på vår{' '}
        <Link href="/blogg/infrastruktur-personalboende-karta-2026">infrastrukturkarta för personalboende</Link>.
      </p>

      <h2>Yrkesgrupper och tidslinjer i kraftledningsprojekten</h2>
      <p>
        Kraftledningsprojekt kräver en bred mix av kompetenser: linjemontörer, stolpklättrare, kabelläggare,
        ställverkstekniker, byggledare, projektledare, geotekniker, arkeologer och miljökonsulter &ndash; ofta
        i team som flyttar mellan flera delsträckor under ett och samma program. Branschen varnar för att
        tillgången på personal inte matchar utbyggnadstakten.
      </p>
      <blockquote>
        &quot;Under kommande tio år kommer branschen behöva 100 000 nya tekniker och ingenjörer för att klara energiomställningen&quot;, enligt branschens beräkningar, samtidigt som det redan i dag 
är stor brist på både montörer och projektledare som kan utföra regionnätsarbeten i Sverige
.
      </blockquote>
      <p>
        För att möta detta paketerar Svenska kraftnät byggprojekten i större kontrakt med långsiktiga
        ramavtal. 
Vi paketerar våra byggprojekt i större kontrakt via ramavtal med avrop över en längre tid, så kallad strategisk partnering. Det skapar trygghet för leverantörerna att rekrytera och att ha en långsiktig kompetensförsörjning
, säger finansdirektör Peter Wigert. Tidslinjerna sträcker sig ofta över fem till tio år per programpaket, vilket ger entreprenörer möjlighet att planera bemanning och boende långsiktigt &ndash; men också kräver att kompetensförsörjningen löses parallellt i flera regioner samtidigt. Läs mer om detta i vår{' '}
        <Link href="/blogg/kompetens-rekrytering-byggsektorn-guide-2026">rekryteringsguide för byggsektorn</Link>{' '}
        och{' '}
        <Link href="/blogg/kompetensbristen-byggsektorn-2026-praktisk-rekryteringsguide">artikeln om kompetensbristen 2026</Link>.
        Många projekt bemannas också med internationell arbetskraft, vilket ställer särskilda krav &ndash; se vår{' '}
        <Link href="/blogg/arbetskraftsinvandring-juni-2026-guide-byggforetag">guide om arbetskraftsinvandring</Link>{' '}
        och{' '}
        <Link href="/blogg/boende-utlandska-arbetare-bygg-praktisk-guide-2026">praktiska guiden om boende för utländska byggarbetare</Link>.
      </p>

      <h2>Så uppstår boendebehovet längs kraftledningskorridorerna</h2>
      <p>
        Boendebehovet vid kraftledningsprojekt uppstår i tydliga faser. Under förberedelsefasen behövs
        boende för projektörer, arkeologer och miljöutredare som kartlägger sträckningen. När byggstart
        närmar sig ökar behovet kraftigt &ndash; markarbeten, stolpresning och stationsbyggen kräver stora
        arbetslag under flera månader upp till några år per delsträcka. Eftersom ledningarna ofta går genom
        glesbygd, långt från hotell och större orter, blir personalboende i närliggande tätorter avgörande
        för att hålla produktiviteten uppe. Mot slutet, vid driftsättning och provkörning, minskar behovet
        successivt men kvarstår för underhålls- och servicepersonal.
      </p>
      <p>
        Detta mönster känns igen från andra stora infrastrukturprojekt, till exempel Ostlänken och
        Norrbotniabanan, som vi beskriver i{' '}
        <Link href="/blogg/blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026">artikeln om blockhyra för infrastrukturprojekt</Link>.
        Skillnaden med kraftledningsprojekt är att de ofta sträcker sig genom flera kommuner samtidigt,
        vilket innebär att boendebehovet vandrar geografiskt i takt med byggfronten &ndash; något
        entreprenörer måste planera för redan i anbudsskedet.
      </p>

      <h2>Checklista för entreprenörer: säkra personalboende i god tid</h2>
      <ul>
        <li>Kartlägg vilka kommuner och tätorter som ligger inom rimligt pendlingsavstånd från varje delsträcka innan anbud lämnas.</li>
        <li>Boka boendekapacitet parallellt med anbudsprocessen &ndash; inte efter tilldelning, eftersom lokalt utbud ofta är begränsat i mindre orter.</li>
        <li>Ställ tydliga avtalskrav på boendestandard, säkerhet och försäkring redan i förfrågningsunderlaget, se vår{' '}
          <Link href="/blogg/avtalskrav-personalboende-guide-2026">guide om avtalskrav för personalboende</Link>.
        </li>
        <li>Planera för säsongsvariation &ndash; sommarmånaderna kan innebära konkurrens om boende med annan uthyrning, se{' '}
          <Link href="/blogg/sommaruthyrning-montorer-guide-2026">guiden om sommaruthyrning för montörer</Link>.
        </li>
        <li>Säkerställ ansvarsfrågor och försäkringsskydd för både husägare och hyresgäster, beskrivet i vår{' '}
          <Link href="/blogg/forsakring-ansvar-personalboende-guide-2026">försäkrings- och ansvarsguide</Link>.
        </li>
        <li>Använd en checklista specifikt anpassad för infrastrukturkontrakt, se{' '}
          <Link href="/blogg/infrastrukturkontrakt-personalboende-checklista-2026">checklistan för infrastrukturkontrakt</Link>{' '}
          och vår{' '}
          <Link href="/blogg/forbered-infrastrukturkontrakt-2026-boende-entreprenorer-guide">guide för att förbereda infrastrukturkontrakt</Link>.
        </li>
      </ul>
      <p>
        Vanligtvis ingår städning, internet och möblering i ett professionellt personalboende; exakt
        omfattning avtalas per projekt utifrån entreprenörens behov och projektets längd. Grundläggande
        skillnader mellan att hyra personalboende och att boka hotell finns sammanfattade i vår{' '}
        <Link href="/blogg/personalboende-vs-hotell-kostnad-jamforelse">kostnadsjämförelse mellan personalboende och hotell</Link>.
      </p>

      <h2>Vanliga frågor</h2>
      <h3>Vilka regioner påverkas mest av elnätsutbyggnaden 2026&ndash;2035?</h3>
      <p>
        Störst byggvolym väntas i NordSyd-länen (Västernorrland, Jämtland, Gävleborg, Dalarna, Värmland,
        Västmanland, Uppsala och Stockholm), men även Norrbotten, Västerbotten, Skåne och Gotland har egna
        stora investeringsprogram parallellt med NordSyd.
      </p>
      <h3>När behöver entreprenörer säkra personalboende inför ett kraftledningsprojekt?</h3>
      <p>
        Boende bör bokas redan i anbudsskedet, innan upphandling avgörs, eftersom lokalt boendeutbud i
        glesbygd ofta är begränsat och konkurrensen om lediga bostäder kan vara hög under intensiva
        byggperioder.
      </p>
      <h3>Vilka yrkesgrupper behöver boende längs kraftledningskorridorerna?</h3>
      <p>
        Linjemontörer, ställverkstekniker, byggledare, projektledare samt konsulter inom miljö, geoteknik
        och arkeologi är några av de yrkesgrupper som rör sig längs korridorerna under olika projektfaser.
      </p>
      <h3>Hur snabbt kan StayOnSite ta fram en boendeplan för ett kraftledningsprojekt?</h3>
      <p>
        Vi återkommer alltid inom en arbetsdag &ndash; ofta inom några timmar &ndash; och kan i regel
        presentera en konkret boendeplan inom 24 timmar från första kontakt.
      </p>

      <h2>StayOnSite &ndash; din boendepartner för kraftledningsprojekten</h2>
      <p>
        StayOnSite grundades 2016 och har sedan dess hjälpt bygg- och infrastrukturentreprenörer att lösa
        personalboende snabbt och tryggt, med ett snittbetyg på 5,0 på Google. Vi erbjuder professionella
        hyresgäster, garanterad hyra och 0&nbsp;procent avgift för husägare som ansluter sina fastigheter till
        blockhyra &ndash; en modell som passar väl för de långa, geografiskt rörliga projekt som präglar
        NordSyd och övriga stamnätssatsningar. Vårt eget personalboende erbjuds från 5 900 kr per person och
        månad. Vill du veta hur processen går till från första kontakt till första hyran? Läs{' '}
        <Link href="/blogg/sa-fungerar-det-fran-intresse-till-forsta-hyran">vår steg-för-steg-guide</Link>{' '}
        eller se vanliga frågor från byggföretag i{' '}
        <Link href="/blogg/personalboende-vanliga-fragor-byggforetag">vår FAQ-artikel</Link>.
      </p>
      <p>
        Ska ditt företag bygga eller underhålla stamnät, regionnät eller stationer inom NordSyd eller
        något av de andra programmen? Kontakta StayOnSite på{' '}
        <a href="tel:0762498486">076-249 84 86</a> så tar vi fram en boendeplan för din personal &ndash; vi
        återkommer alltid inom en arbetsdag, ofta inom några timmar. Läs mer om våra tjänster för{' '}
        <Link href="/for-foretag">företag</Link>{' '}
        eller hur du som fastighetsägare kan{' '}
        <Link href="/for-husagare">hyra ut till oss</Link>.
      </p>
    </BlogLayout>
  );
};

export default ElnatsutbyggnadNordSydPersonalboende;
