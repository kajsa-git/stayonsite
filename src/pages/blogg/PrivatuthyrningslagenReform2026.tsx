import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import { Link } from 'react-router-dom';

const PrivatuthyrningslagenReform2026 = () => {
  const post = getBlogPost('privatuthyrningslagen-reform-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        I juni 2026 röstade riksdagen igenom den mest genomgripande reformen av
        privatuthyrningslagen sedan den infördes 2012. Förändringarna, som träder i kraft den
        1 juli 2026, påverkar hundratusentals svenska husägare som hyr ut &mdash; eller
        funderar på att hyra ut &mdash; sin bostad.
      </p>

      <p>
        I den här artikeln går vi igenom exakt vad som förändras, hur det påverkar din
        skattesituation, och vad du som husägare behöver göra. Vi förklarar också hur
        StayOnSite kan hjälpa dig att maximera din hyresintäkt utan avgifter.
      </p>

      <h2>Bakgrund: Privatuthyrningslagen i korthet</h2>

      <p>
        Privatuthyrningslagen (2012:978) infördes för att förenkla för privatpersoner att hyra
        ut sin bostad. Innan lagen gällde hyreslagen fullt ut, med besittningsskydd och
        bruksvärdesprincip, vilket avskräckte många från att hyra ut.
      </p>

      <p>De viktigaste dragen i den ursprungliga lagen:</p>

      <ul>
        <li>Hyran får sättas fritt (inte bunden av bruksvärdessystemet)</li>
        <li>Hyresgästen har inget besittningsskydd</li>
        <li>Uppsägningstiden är en hyresperiod (normalt en månad)</li>
        <li>Gäller privatpersoner som hyr ut högst en bostad</li>
        <li>Schablonavdraget för uthyrningsinkomster var 40 000 kr per år</li>
      </ul>

      <p>
        Lagen har fungerat väl för kortare uthyrningar, men kritiker har länge pekat på att den
        inte räcker för att möta den moderna bostadsmarknadens behov. Företag som behöver hyra
        bostäder för personal har hamnat i en gråzon, och schablonavdraget har inte justerats
        sedan lagens införande trots 14 år av inflation.
      </p>

      <h2>De viktigaste förändringarna i reformen</h2>

      <p>
        Reformen bygger på den statliga utredningen SOU 2025:65 &quot;En modern
        privatuthyrning&quot; och innehåller fyra huvudsakliga förändringar:
      </p>

      <h3>1. Schablonavdraget höjs från 40 000 till 50 000 kr</h3>

      <p>
        Det skattefria schablonavdraget vid uthyrning av privatbostad höjs med 25 procent.
        Det innebär att du som husägare kan tjäna mer på uthyrning innan du behöver betala
        skatt.
      </p>

      <blockquote>
        <p>
          &quot;Schablonavdraget vid uthyrning av privatbostad höjs till 50 000 kronor per
          beskattningsår. Utöver schablonavdraget får 20 procent av hyresintäkten dras av.
          Överskottet beskattas som inkomst av kapital med 30 procent skatt.&quot;
        </p>
        <cite>&mdash; Skatteverket, Regler för privatuthyrning fr.o.m. 2026-07-01</cite>
      </blockquote>

      <p>
        I praktiken innebär det att en husägare som hyr ut en bostad för 15 000 kr per
        månad (180 000 kr/år) får följande skatteberäkning:
      </p>

      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Före reformen</th>
            <th>Efter reformen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total hyresintäkt</td>
            <td>180 000 kr</td>
            <td>180 000 kr</td>
          </tr>
          <tr>
            <td>Schablonavdrag</td>
            <td>-40 000 kr</td>
            <td>-50 000 kr</td>
          </tr>
          <tr>
            <td>20 % avdrag på hyran</td>
            <td>-36 000 kr</td>
            <td>-36 000 kr</td>
          </tr>
          <tr>
            <td>Beskattningsbart belopp</td>
            <td>104 000 kr</td>
            <td>94 000 kr</td>
          </tr>
          <tr>
            <td>Skatt (30 %)</td>
            <td>31 200 kr</td>
            <td>28 200 kr</td>
          </tr>
          <tr>
            <td>Netto efter skatt</td>
            <td>148 800 kr</td>
            <td>151 800 kr</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Besparing: 3 000 kr per år</strong> vid en månadshyra på 15 000 kr. För
        husägare som hyr ut till ett lägre belopp &mdash; exempelvis 8 000 kr per månad
        (96 000 kr/år) &mdash; blir besparingen proportionellt ännu viktigare.
      </p>

      <h3>2. Uthyrning av upp till 2 bostäder utan näringsverksamhet</h3>

      <p>
        Tidigare gällde privatuthyrningslagen bara för en bostad. Hade du två bostäder
        riskerade du att Skatteverket bedömde uthyrningen som näringsverksamhet, med
        egenavgifter och momsplikt som följd.
      </p>

      <p>
        Nu utökas gränsen till <strong>två bostäder</strong>. Det innebär att du kan hyra
        ut exempelvis din villa och en sommarstuga &mdash; eller din lägenhet och ett
        oinrett gårdshus &mdash; utan att det klassas som näringsverksamhet.
      </p>

      <blockquote>
        <p>
          &quot;Gränsen för när uthyrning av privatbostad övergår till näringsverksamhet
          höjs från en till två bostäder. Schablonavdraget om 50 000 kronor gäller per
          bostad, det vill säga maximalt 100 000 kronor per år för den som hyr ut
          två bostäder.&quot;
        </p>
        <cite>&mdash; Prop. 2025/26:143, Regeringens proposition till riksdagen</cite>
      </blockquote>

      <p>
        Detta är en stor förändring för husägare i norra Sverige, där många äger både en
        permanentbostad och en fritidsbostad. Nu kan båda hyras ut med de förmånliga
        villkoren i privatuthyrningslagen.
      </p>

      <h3>3. Blockhyresreglerna förenklas</h3>

      <p>
        Blockhyra innebär att ett företag hyr flera bostäder av samma hyresvärd genom ett
        enda avtal. Det är den vanligaste modellen för personalboende &mdash; ett byggbolag
        hyr till exempel fem lägenheter i samma hus för sina montörer.
      </p>

      <p>
        Tidigare krävde blockhyresavtal med privatpersoner att man navigerade mellan
        privatuthyrningslagen och hyreslagen, med oklara gränsdragningar. Reformen
        förtydligar att:
      </p>

      <ul>
        <li>
          En privatperson kan ingå blockhyresavtal för upp till 2 bostäder under
          privatuthyrningslagens villkor.
        </li>
        <li>
          Företaget som hyr (blockhyresgästen) tar ansvar för andrahandsuthyrningen till
          de enskilda boende.
        </li>
        <li>
          Hyresvärden (husägaren) behöver inte förhålla sig till besittningsskydd gentemot
          de enskilda boende &mdash; det är blockhyresgästens ansvar.
        </li>
      </ul>

      <p>
        I praktiken innebär det att det blir enklare och tryggare för husägare att hyra ut
        till företag som StayOnSite. Du tecknar ett avtal med oss, vi sköter resten.
      </p>

      <h3>4. Fri hyressättning vid nyuthyrning bekräftas</h3>

      <p>
        Reformen förtydligar att privatuthyrningslagen ger fri hyressättning &mdash; det
        vill säga att hyran inte behöver följa bruksvärdessystemet. Dock får hyran inte vara
        &quot;oskälig&quot; i relation till bostadens storlek, läge och standard.
      </p>

      <p>
        Skatteverket har publicerat riktlinjer som anger att en skälig hyra normalt
        motsvarar bostadens marknadsvärde vid fri uthyrning. I praktiken innebär det att
        husägare i attraktiva lägen &mdash; nära industrietableringar, universitets&shy;städer
        eller storstäder &mdash; kan ta ut en hyra som speglar den verkliga efterfrågan.
      </p>

      <h2>Skatteeffekter: Räkneexempel för olika scenarier</h2>

      <p>
        Låt oss titta på tre vanliga scenarier och hur reformen påverkar nettointäkten:
      </p>

      <h3>Scenario A: Villa i Boden, hyra 12 000 kr/månad</h3>

      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Belopp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Årsintäkt</td>
            <td>144 000 kr</td>
          </tr>
          <tr>
            <td>Schablonavdrag (nytt)</td>
            <td>-50 000 kr</td>
          </tr>
          <tr>
            <td>20 % avdrag</td>
            <td>-28 800 kr</td>
          </tr>
          <tr>
            <td>Beskattningsbart</td>
            <td>65 200 kr</td>
          </tr>
          <tr>
            <td>Skatt (30 %)</td>
            <td>19 560 kr</td>
          </tr>
          <tr>
            <td><strong>Netto efter skatt</strong></td>
            <td><strong>124 440 kr</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Scenario B: Lägenhet i Stockholm, hyra 18 000 kr/månad</h3>

      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Belopp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Årsintäkt</td>
            <td>216 000 kr</td>
          </tr>
          <tr>
            <td>Schablonavdrag (nytt)</td>
            <td>-50 000 kr</td>
          </tr>
          <tr>
            <td>20 % avdrag</td>
            <td>-43 200 kr</td>
          </tr>
          <tr>
            <td>Beskattningsbart</td>
            <td>122 800 kr</td>
          </tr>
          <tr>
            <td>Skatt (30 %)</td>
            <td>36 840 kr</td>
          </tr>
          <tr>
            <td><strong>Netto efter skatt</strong></td>
            <td><strong>179 160 kr</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Scenario C: Två bostäder (villa + stuga), total hyra 20 000 kr/månad</h3>

      <table>
        <thead>
          <tr>
            <th>Post</th>
            <th>Belopp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Årsintäkt</td>
            <td>240 000 kr</td>
          </tr>
          <tr>
            <td>Schablonavdrag (2 bostäder)</td>
            <td>-100 000 kr</td>
          </tr>
          <tr>
            <td>20 % avdrag</td>
            <td>-48 000 kr</td>
          </tr>
          <tr>
            <td>Beskattningsbart</td>
            <td>92 000 kr</td>
          </tr>
          <tr>
            <td>Skatt (30 %)</td>
            <td>27 600 kr</td>
          </tr>
          <tr>
            <td><strong>Netto efter skatt</strong></td>
            <td><strong>212 400 kr</strong></td>
          </tr>
        </tbody>
      </table>

      <blockquote>
        <p>
          &quot;Kapitalinkomster från uthyrning av privatbostad beskattas med en skattesats
          om 30 procent. Avdrag medges med 50 000 kronor per bostad (schablonavdrag) samt
          20 procent av hyresintäkten.&quot;
        </p>
        <cite>&mdash; Skatteverket, SKV 370 utgåva 2026</cite>
      </blockquote>

      <h2>Vad innebär reformen för dig som husägare?</h2>

      <p>
        Sammanfattningsvis gör reformen det mer attraktivt att hyra ut sin bostad. Här är
        de viktigaste praktiska konsekvenserna:
      </p>

      <h3>Du behåller mer av hyran</h3>

      <p>
        Med det höjda schablonavdraget betalar du mindre skatt. Det extra avdraget på
        10 000 kr innebär en direkt skattebesparing på 3 000 kr per år (10 000 &times;
        30 %). Har du två bostäder sparar du upp till 6 000 kr per år.
      </p>

      <h3>Tryggare att hyra ut flera bostäder</h3>

      <p>
        Risken att klassas som näringsidkare minskar avsevärt. Har du en villa och en
        sommarstuga, eller en bostadsrätt och ett uthyrningsrum, kan du nu hyra ut båda med
        full trygghet.
      </p>

      <h3>Enklare att samarbeta med företag</h3>

      <p>
        De nya blockhyresreglerna gör det smidigare att hyra ut till företag som behöver
        bostäder för personal. Du behöver inte hantera enskilda hyresgäster &mdash;
        företaget tar det ansvaret.
      </p>

      <h3>Bättre villkor i orter med hög efterfrågan</h3>

      <p>
        I städer som <Link to="/stad/lulea">Luleå</Link>, <Link to="/stad/boden">Boden</Link>,{' '}
        <Link to="/stad/skelleftea">Skellefteå</Link> och <Link to="/stad/kiruna">Kiruna</Link> är
        efterfrågan på personalboende enorm. Med fri hyressättning och de nya avdragen kan husägare
        i dessa orter tjäna betydligt mer än genom traditionella hyreskontrakt.
      </p>

      <h2>Så hjälper StayOnSite dig som husägare</h2>

      <p>
        StayOnSite erbjuder en unik modell för husägare som vill hyra ut till företag:
      </p>

      <h3>Nollavgiftsmodellen: 0 % avgift</h3>

      <p>
        Till skillnad från konkurrenter som Samtrygg (15 % avgift) och Qasa (4,95 %) tar
        StayOnSite <strong>0 procent i avgift</strong> från husägaren. Din avtalade hyra
        betalas ut i sin helhet &mdash; inga dolda avdrag, inga serviceavgifter, inga
        provisioner.
      </p>

      <blockquote>
        <p>
          &quot;Vi tror att den bästa modellen för att lösa bostadsbristen är att göra det
          maximalt enkelt och lönsamt för husägare att hyra ut. Därför tar vi ingen avgift
          av husägaren &mdash; överhuvudtaget.&quot;
        </p>
        <cite>&mdash; Kajsa Lindwall, grundare StayOnSite</cite>
      </blockquote>

      <h3>Garanterad hyra varje månad</h3>

      <p>
        StayOnSite hyr din bostad på ett fast månadskontrakt. Du får din hyra den 25:e
        varje månad, oavsett om bostaden är fullt belagd eller inte. Ingen oro för
        utebliven betalning.
      </p>

      <h3>Professionella företagshyresgäster</h3>

      <p>
        Alla våra hyresgäster är verifierade företag med organisationsnummer. Det handlar
        om byggbolag, energiföretag och teknikföretag som behöver bostäder för sin
        personal. Professionella hyresgäster innebär mindre slitage, bättre ordning och
        tryggare uthyrning.
      </p>

      <h3>Vi sköter allt det praktiska</h3>

      <p>
        Kontraktshantering, nyckelöverlämning, felanmälan och kontakt med hyresgästen &mdash;
        allt sköts av StayOnSite. Du får din hyra utan att behöva lyfta ett finger.
      </p>

      <h2>Vanliga frågor om nya privatuthyrningslagen</h2>

      <h3>När träder de nya reglerna i kraft?</h3>
      <p>
        Den 1 juli 2026. Reglerna gäller för hyresintäkter från och med det datumet. För
        beskattningsåret 2026 gäller alltså det gamla schablonavdraget (40 000 kr) för
        januari&ndash;juni och det nya (50 000 kr, proportionerat) för juli&ndash;december.
      </p>

      <h3>Behöver jag skriva nytt hyresavtal?</h3>
      <p>
        Nej, befintliga hyresavtal fortsätter att gälla. De nya reglerna påverkar främst
        skatteberäkningen och möjligheten att hyra ut fler bostäder.
      </p>

      <h3>Kan jag hyra ut min bostadsrätt?</h3>
      <p>
        Ja, privatuthyrningslagen gäller även bostadsrätter. Du behöver dock fortfarande
        godkännande från din bostadsrättsförening för andrahandsuthyrning.
      </p>

      <h3>Vad händer om jag hyr ut mer än 2 bostäder?</h3>
      <p>
        Från och med den tredje bostaden klassas uthyrningen som näringsverksamhet. Det
        innebär att du behöver betala egenavgifter (cirka 28 %) och eventuellt registrera
        ett företag.
      </p>

      <h3>Hur påverkas jag om jag hyr ut i andra hand?</h3>
      <p>
        Privatuthyrningslagen gäller bara om du äger bostaden (äganderätt eller
        bostadsrätt). Om du hyr ut i andra hand gäller hyreslagen, och du behöver
        hyresvärdens godkännande.
      </p>

      <h3>Måste jag deklarera hyresintäkter under 50 000 kr?</h3>
      <p>
        Ja, alla hyresintäkter ska deklareras. Men med schablonavdraget och 20-procents&shy;avdraget
        blir den faktiska skatten noll om intäkterna understiger tröskeln. Du redovisar ändå
        intäkten i din inkomstdeklaration.
      </p>

      <h2>Nästa steg</h2>

      <p>
        Den nya privatuthyrningslagen gör det enklare, tryggare och mer lönsamt att hyra ut
        sin bostad i Sverige. Oavsett om du har en villa i Boden, en lägenhet i Göteborg
        eller en sommarstuga i Jämtland, finns det nu starkare incitament än någonsin att
        bli uthyrare.
      </p>

      <p>
        <strong>
          Vill du veta vad din bostad kan ge i hyra?{' '}
          <Link to="/for-husagare">Gå till vår husägarsida</Link> och få en kostnadsfri
          värdering &mdash; eller ring oss på{' '}
          <a href="tel:+46762498486">076-249 84 86</a>.
        </strong>
      </p>

      <p>
        Läs även vår <Link to="/blogg/personalboende-guide-2026">kompletta guide till
        personalboende 2026</Link> och vår analys av{' '}
        <Link to="/blogg/gron-omstallning-norr-boende">den gröna omställningens
        boendeeffekter</Link>.
      </p>
    </BlogLayout>
  );
};

export default PrivatuthyrningslagenReform2026;
