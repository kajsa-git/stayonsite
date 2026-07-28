import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const LagenhetshotellEllerForetagsbostad2026 = () => {
  const post = getBlogPost('lagenhetshotell-eller-foretagsbostad-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Lägenhetshotell och företagsbostad blandas ofta ihop, men det är två olika produkter
        med olika prislogik. Den som väljer fel betalar antingen för hotellservice teamet inte
        behöver, eller upptäcker att det inte finns något lägenhetshotell alls på orten där
        projektet ligger. Här är skillnaderna, priserna och en enkel regel för valet.
      </p>

      <h2>Vad är vad?</h2>

      <p>
        Ett <strong>lägenhetshotell</strong> (även aparthotel eller serviced apartments) är ett
        hotellkoncept: möblerade lägenheter med reception, städservice och pris per natt eller
        vecka. Kedjor som Forenom och Sky Hotel Apartments finns främst i storstäderna och de
        större regionstäderna.
      </p>

      <p>
        En <strong>företagsbostad</strong> är en vanlig bostad — lägenhet eller hus — som hyrs
        möblerad på månadsavtal, med företaget som avtalspart. Ingen reception, men fullt kök,
        fler kvadratmeter och en väsentligt lägre månadskostnad. Det är den modell vi på
        StayOnSite arbetar med.
      </p>

      <h2>Skillnaderna sida vid sida</h2>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Lägenhetshotell</th>
            <th>Företagsbostad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pris per person och månad</td>
            <td>typiskt 12 000–25 000 kr</td>
            <td>från 5 900 kr</td>
          </tr>
          <tr>
            <td>Avtalsform</td>
            <td>per natt eller vecka</td>
            <td>månadsavtal, från 1 månad</td>
          </tr>
          <tr>
            <td>Kök</td>
            <td>ofta pentry eller kokvrå</td>
            <td>fullt kök</td>
          </tr>
          <tr>
            <td>Utrymme för team</td>
            <td>en lägenhet per 1–2 personer</td>
            <td>hela hus med 4–10 bäddar</td>
          </tr>
          <tr>
            <td>Reception och daglig service</td>
            <td>ja</td>
            <td>nej — fast kontaktperson i stället</td>
          </tr>
          <tr>
            <td>Städning</td>
            <td>ingår löpande</td>
            <td>slutstädning ingår, löpande städ avtalas separat</td>
          </tr>
          <tr>
            <td>Parkering för servicebilar</td>
            <td>sällan, betald cityparkering</td>
            <td>ofta egen uppfart eller reserverade platser</td>
          </tr>
          <tr>
            <td>Finns på mindre orter</td>
            <td>sällan</td>
            <td>ja</td>
          </tr>
        </tbody>
      </table>

      <p>
        Prisbilden för lägenhetshotell bygger på typiska longstay-priser i svenska städer
        2025–2026; i storstädernas citylägen kan det vara högre. Företagsbostädernas priser är
        ur vår egen portfölj — verkliga siffror stad för stad finns i{' '}
        <Link href="/blogg/vad-kostar-personalboende-sverige-2026-verkliga-priser">
          Vad kostar personalboende i Sverige 2026?
        </Link>
      </p>

      <h2>När lägenhetshotell är rätt val</h2>

      <ul>
        <li>Vistelser under en månad, där månadsavtal inte hinner löna sig.</li>
        <li>Enstaka medarbetare på tjänsteresa, inte hela team.</li>
        <li>Citynära uppdrag där reception och daglig städning har ett värde.</li>
        <li>Osäkra datum där ni behöver kunna avboka natt för natt.</li>
      </ul>

      <h2>När företagsbostad är rätt val</h2>

      <ul>
        <li>Team om 4 personer eller fler som bor tillsammans under projektet.</li>
        <li>Uppdrag på en månad eller längre — då är prisskillnaden avgörande.</li>
        <li>
          Projektorter utan lägenhetshotell: i städer som <Link href="/stad/boden">Boden</Link>,{' '}
          <Link href="/stad/oskarshamn">Oskarshamn</Link> och{' '}
          <Link href="/stad/monsteras">Mönsterås</Link> är alternativet annars hotell eller lång
          pendling.
        </li>
        <li>Behov av riktigt kök, tvättmaskin och plats för servicebilar och verktyg.</li>
      </ul>

      <h2>Räkneexempel: 6 montörer i Luleå i 4 månader</h2>

      <table>
        <thead>
          <tr>
            <th>Alternativ</th>
            <th>Kostnad per månad</th>
            <th>Totalt 4 månader</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lägenhetshotell, longstay-pris 14 000 kr/person</td>
            <td>84 000 kr</td>
            <td>336 000 kr</td>
          </tr>
          <tr>
            <td>Företagsbostad, helt hus med 6+ bäddar</td>
            <td>ca 42 000 kr</td>
            <td>ca 168 000 kr</td>
          </tr>
        </tbody>
      </table>

      <p>
        Halva kostnaden — och teamet bor i samma hus i stället för utspritt på sex rum. Ju
        längre uppdraget är och ju större teamet, desto större blir gapet.
      </p>

      <h2>Vanliga frågor</h2>

      <h3>Är lägenhetshotell och företagslägenhet samma sak?</h3>
      <p>
        Nej. Ett lägenhetshotell är ett hotellkoncept med reception och nattpriser. En
        företagslägenhet är en vanlig bostad som hyrs möblerad på månadsavtal med företaget
        som avtalspart — utan hotellservice, till betydligt lägre månadskostnad.
      </p>

      <h3>Finns lägenhetshotell i mindre städer?</h3>
      <p>
        Sällan. Kedjorna finns i storstäderna och de större regionstäderna. På industriorter
        som Boden, Mönsterås eller Oskarshamn står valet i praktiken mellan vanligt hotell,
        pendling eller en företagsbostad.
      </p>

      <h3>Vad är billigast för ett team på sex personer eller fler?</h3>
      <p>
        Ett helt hus som företagsbostad. Per bäddplats landar det på cirka 6 000–8 000 kr per
        månad, mot typiskt 12 000–25 000 kr per person på lägenhetshotell och 21 000–30 000 kr
        på vanligt hotell.
      </p>

      <h3>Ingår städning i en företagsbostad?</h3>
      <p>
        Slutstädning ingår. Löpande städning under vistelsen avtalas separat utifrån projektets
        förutsättningar — många team föredrar att sköta det själva och hålla nere kostnaden.
      </p>

      <h2>Slutsats</h2>

      <p>
        Regeln är enkel: under en månad eller enstaka resenärer — lägenhetshotell, om det finns
        på orten. En månad eller mer, team, eller projektort utanför storstäderna —
        företagsbostad. För ett typiskt montörsteam på sex personer skiljer det över 150 000 kr
        på ett fyramånadersuppdrag.
      </p>

      <p>
        Behöver ni boende för ett team?{' '}
        <Link href="/for-foretag">Skicka en förfrågan</Link> med ort, antal personer och datum
        så får ni en boendeplan med adresser och priser inom 24 timmar — även på orter där
        lägenhetshotellen aldrig etablerade sig.
      </p>
    </BlogLayout>
  );
};

export default LagenhetshotellEllerForetagsbostad2026;
