import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const HyraUtJamforelse2026 = () => {
  const post = getBlogPost('hyra-ut-jamforelse-stayonsite-vs-andra-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Vill du hyra ut ditt hus till ett företag? Det finns i grunden tre vägar: sköta uthyrningen
        på egen hand, anlita en plattform som StayOnSite, eller använda en av de större
        förmedlingstjänsterna som Samtrygg eller Qasa. Skillnaderna i avgifter, trygghet och
        praktisk hantering är betydande. Den här artikeln reder ut vad varje alternativ faktiskt
        innebär.
      </p>

      <h2>Alternativ 1: Egen uthyrning</h2>

      <p>
        Att hyra ut på egen hand innebär att du hittar hyresgästen själv, skriver avtal, sköter
        incheckning och hanterar allt som uppstår under hyresperioden. För privatpersoner som hyr
        ut till privatpersoner är detta den vanligaste modellen.
      </p>

      <h3>Fördelar med egen uthyrning</h3>

      <ul>
        <li>Inga avgifter till mellanhänder</li>
        <li>Full kontroll över vem du hyr ut till</li>
        <li>Du bestämmer hyranivån fritt</li>
      </ul>

      <h3>Nackdelar med egen uthyrning</h3>

      <ul>
        <li>Ingen garanterad hyra - betalar hyresgästen inte, är det ditt problem</li>
        <li>Du måste hitta och granska hyresgästen själv</li>
        <li>Avtal, besiktning och administration faller på dig</li>
        <li>Svårare att nå företag som söker personalboende</li>
        <li>Ingen kontakt med grundarna som kan lösa problem snabbt</li>
      </ul>

      <p>
        Egen uthyrning fungerar bra om du redan har ett nätverk och hyresgäster du litar på. Men
        för den som vill hyra ut till ett företag utan att ha en direktrelation med det bolaget
        är det svårt att komma igång och ännu svårare att garantera en stabil intäkt.
      </p>

      <h2>Alternativ 2: StayOnSite</h2>

      <p>
        StayOnSite är en mellanhands- och förvaltningsmodell specifikt för företagsboende. Det
        innebär att StayOnSite hyr din bostad direkt av dig på ett fast månadskontrakt och sedan
        hyr ut den vidare till sina företagskunder. Du som husägare har ett enda motpart - StayOnSite.
      </p>

      <h3>Så fungerar det i praktiken</h3>

      <p>
        StayOnSite besiktigar och fotodokumenterar bostaden innan inflyttning. Du tecknar ett avtal
        med StayOnSite och får din hyra den 25:e varje månad, oavsett om bostaden är belagd eller
        inte. Kontakten med de faktiska boende sköts helt av StayOnSite.
      </p>

      <blockquote>
        <p>
          &quot;Vi hyr din bostad på ett fast kontrakt. Din hyra betalas varje månad utan avdrag
          och utan avgifter. Vi sköter resten.&quot;
        </p>
        <cite>- Kajsa Lindwall, grundare StayOnSite</cite>
      </blockquote>

      <h3>Fördelar med StayOnSite</h3>

      <ul>
        <li>Garanterad fast hyra varje månad</li>
        <li>0 % avgift - hela avtalad hyra betalas ut</li>
        <li>Personlig kontakt med grundaren, inte ett callcenter</li>
        <li>Alla hyresgäster är verifierade företag, inga privatpersoner</li>
        <li>Besiktning och fotodokumentation ingår</li>
        <li>Du hanterar inte hyresgästkontakter, felanmälningar eller avtalsadministration</li>
      </ul>

      <h3>Nackdelar med StayOnSite</h3>

      <ul>
        <li>StayOnSite bestämmer hyranivån till företagen - du förhandlar din hyra med StayOnSite</li>
        <li>Passar bäst i orter med aktiv efterfrågan från byggbolag och industri</li>
      </ul>

      <p>
        StayOnSite är aktiva i städer med hög efterfrågan på personalboende, bland annat
        <Link href="/stad/lulea"> Luleå</Link>, <Link href="/stad/boden">Boden</Link>,{' '}
        <Link href="/stad/oskarshamn">Oskarshamn</Link>, <Link href="/stad/skelleftea">Skellefteå</Link>{' '}
        och <Link href="/stad/saffle">Säffle</Link>.
      </p>

      <h2>Alternativ 3: Andra plattformar (Samtrygg, Qasa, m.fl.)</h2>

      <p>
        Det finns ett antal förmedlingstjänster på den svenska marknaden som matchar husägare med
        hyresgäster. De vanligaste för längre hyresperioder är Samtrygg, Qasa och Rentaborg.
        Dessa fungerar som marknadsplatser. Du lägger upp din bostad, de marknadsför den och
        hjälper till med avtal.
      </p>

      <h3>Samtrygg</h3>

      <p>
        Samtrygg erbjuder en 12-månaders hyresgaranti och profil som trygg förmedlare. Avgiften
        är 15 procent av din månadshyra. Det innebär att en hyra på 12 000 kr per månad ger dig
        10 200 kr netto. Over ett år kostar det dig 21 600 kr i avgifter.
      </p>

      <h3>Qasa</h3>

      <p>
        Qasa är mer teknikfokuserat och erbjuder digitala avtal och kreditkontroller. Avgiften
        ligger på 4,95 procent av hyresintäkten. Vid 12 000 kr i månadshyra innebär det en
        avgift på 594 kr per månad, eller 7 128 kr per år.
      </p>

      <h3>Rentaborg</h3>

      <p>
        Rentaborg riktar sig mot längre uthyrningar och har en transparent prismodell. Plattformen
        är inriktad på den privata marknaden och erbjuder hyresintäktsberäkningar för att
        husägare ska kunna planera sina intäkter. Avgiftsmodellen varierar och kommuniceras direkt
        med husägare.
      </p>

      <h3>Fördelar med andra plattformar</h3>

      <ul>
        <li>Stor synlighet mot privatpersoner som söker boende</li>
        <li>Standardiserade avtal och kreditkontroller</li>
        <li>Välkänt varumärke ger trygghet för hyresgästen</li>
      </ul>

      <h3>Nackdelar med andra plattformar</h3>

      <ul>
        <li>Avgifter på 5-15 % dras från din hyra varje månad</li>
        <li>Ingen garanterad hyra om bostaden står tom</li>
        <li>Blandat med privatpersoner som hyresgäster - inte enbart företag</li>
        <li>Du hanterar fortfarande en del administration själv</li>
        <li>Personlig kontakt med grundaren saknas</li>
      </ul>

      <h2>Jämförelsetabell: 6 kriterier</h2>

      <table>
        <thead>
          <tr>
            <th>Kriterium</th>
            <th>Egen uthyrning</th>
            <th>StayOnSite</th>
            <th>Andra aktörer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Garanterad fast hyra</td>
            <td>Nej</td>
            <td>Ja</td>
            <td>Delvis</td>
          </tr>
          <tr>
            <td>Personlig kontakt med grundare</td>
            <td>Nej</td>
            <td>Ja</td>
            <td>Nej</td>
          </tr>
          <tr>
            <td>Enbart företagshyresgäster</td>
            <td>Nej</td>
            <td>Ja</td>
            <td>Delvis</td>
          </tr>
          <tr>
            <td>Inga avdrag från din hyra</td>
            <td>Ja</td>
            <td>Ja</td>
            <td>Nej</td>
          </tr>
          <tr>
            <td>Besiktning och fotodokumentation</td>
            <td>Nej</td>
            <td>Ja</td>
            <td>Delvis</td>
          </tr>
          <tr>
            <td>Avgift från din hyra</td>
            <td>0 %</td>
            <td>0 %</td>
            <td>5-15 %</td>
          </tr>
        </tbody>
      </table>

      <h2>Vad kostar avgifterna i kronor?</h2>

      <p>
        Det är lätt att se &quot;15 %&quot; som ett litet tal. Men räknat i kronor över ett år
        ser det annorlunda ut:
      </p>

      <table>
        <thead>
          <tr>
            <th>Månadshy ra</th>
            <th>Samtrygg 15 %/år</th>
            <th>Qasa 4,95 %/år</th>
            <th>StayOnSite 0 %/år</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>8 000 kr/mån</td>
            <td>14 400 kr/år</td>
            <td>4 752 kr/år</td>
            <td>0 kr/år</td>
          </tr>
          <tr>
            <td>12 000 kr/mån</td>
            <td>21 600 kr/år</td>
            <td>7 128 kr/år</td>
            <td>0 kr/år</td>
          </tr>
          <tr>
            <td>16 000 kr/mån</td>
            <td>28 800 kr/år</td>
            <td>9 504 kr/år</td>
            <td>0 kr/år</td>
          </tr>
        </tbody>
      </table>

      <p>
        En husägare som hyr ut för 12 000 kr per månad via Samtrygg förlorar 21 600 kr per år
        i avgifter. Över tre år är det 64 800 kr. Det är pengar som stannar hos husägaren med
        StayOnSites modell.
      </p>

      <h2>Vilket alternativ passar dig?</h2>

      <h3>Välj egen uthyrning om du</h3>

      <ul>
        <li>Redan har en hyresgäst du litar på</li>
        <li>Vill ha full kontroll och kan hantera administration</li>
        <li>Bor i en ort utan aktiv efterfrågan från företag</li>
      </ul>

      <h3>Välj StayOnSite om du</h3>

      <ul>
        <li>Bor i en ort med pågående byggprojekt eller industri</li>
        <li>Vill ha garanterad hyra utan att hantera hyresgäster</li>
        <li>Föredrar att jobba med ett litet bolag med personlig kontakt</li>
        <li>Inte vill betala avgifter som minskar din inkomst</li>
      </ul>

      <h3>Välj en annan plattform om du</h3>

      <ul>
        <li>Vill nå privatpersoner och inte bara företag</li>
        <li>Är i en storstad med hög rörlighet på hyresmarknaden</li>
        <li>Föredrar ett välkänt varumärke mot hyresgästen</li>
      </ul>

      <h2>Vanliga frågor</h2>

      <h3>Kan jag hyra ut via StayOnSite i vilken stad som helst?</h3>
      <p>
        StayOnSite arbetar i orter med aktiv efterfrågan från byggbolag, industri och offentlig
        sektor. Kontakta oss för att höra om din ort ingår eller är på väg in i nätverket.
      </p>

      <h3>Hur lång är bindningstiden med StayOnSite?</h3>
      <p>
        Det varierar beroende på det specifika avtalet. StayOnSite strävar efter stabila
        kontrakt som ger husägaren trygghet över tid, normalt minst 6 månader.
      </p>

      <h3>Vad händer om ett företag som hyr av StayOnSite inte betalar?</h3>
      <p>
        Det är StayOnSites risk, inte din. Du har ett avtal med StayOnSite och din hyra betalas
        oavsett vad som händer mellan StayOnSite och deras företagskunder.
      </p>

      <h3>Kan jag byta från Samtrygg eller Qasa till StayOnSite?</h3>
      <p>
        Ja, när befintliga avtal löper ut kan du byta. StayOnSite hjälper till med övergången
        och kan ta över förvaltningen vid kontraktets slut.
      </p>

      <h2>Slutsats</h2>

      <p>
        För husägare som vill hyra ut till företag är de avgörande skillnaderna: garanterad hyra,
        avgiftsnivå och vem som hanterar hyresgästkontakten. Samtrygg tar 15 % och Qasa tar
        nästan 5 %. StayOnSite tar 0 % och hanterar allt.
      </p>

      <p>
        Läs mer om hur du kan hyra ut din bostad till företag och vad StayOnSite erbjuder på{' '}
        <Link href="/for-husagare">vår husägarsida</Link>. Du kan också läsa mer om{' '}
        <Link href="/blogg/privatuthyrningslagen-reform-2026">nya privatuthyrningslagen 2026</Link>{' '}
        och hur reglerna påverkar dig som hyr ut.
      </p>
    </BlogLayout>
  );
};

export default HyraUtJamforelse2026;
