import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const LagenhetshotellEllerForetagsbostad2026 = () => {
  const post = getBlogPost('lagenhetshotell-eller-foretagsbostad-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Lägenhetshotell och företagsbostad blandas ofta ihop, men det är två olika produkter
        med olika villkor. Vilket alternativ som passar beror bland annat på projektperiod,
        läge, service och hur många som ska bo. Här jämför vi alternativen och visar ett
        räkneexempel.
      </p>

      <h2>Vad är vad?</h2>

      <p>
        Ett <strong>lägenhetshotell</strong> (även aparthotel eller serviced apartments) är ett
        hotellkoncept med möblerade lägenheter. Reception, städservice, pris och hyresperiod
        varierar mellan orter och leverantörer.
      </p>

      <p>
        En <strong>företagsbostad</strong> är en vanlig bostad — lägenhet eller hus — som hyrs
        möblerad till ett företag. Den kan ge arbetslaget tillgång till kök och gemensamma ytor,
        utan hotellservice. Det är den modell vi på StayOnSite arbetar med; pris och villkor
        bekräftas för varje boende.
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
            <td>varierar med läge, period och service</td>
            <td>varierar med boende, period och villkor</td>
          </tr>
          <tr>
            <td>Avtalsform</td>
            <td>per natt, vecka eller längre period</td>
            <td>varierar mellan leverantörer; hos StayOnSite minst tre månader</td>
          </tr>
          <tr>
            <td>Kök</td>
            <td>ofta pentry eller kokvrå</td>
            <td>varierar mellan bostäder</td>
          </tr>
          <tr>
            <td>Utrymme för team</td>
            <td>varierar mellan lägenheter</td>
            <td>lägenheter och hus i olika storlekar</td>
          </tr>
          <tr>
            <td>Reception och daglig service</td>
            <td>varierar mellan anläggningar</td>
            <td>nej — fast kontaktperson i stället</td>
          </tr>
          <tr>
            <td>Städning</td>
            <td>varierar mellan anläggningar</td>
            <td>kontrollera vad som ingår i offerten</td>
          </tr>
          <tr>
            <td>Parkering för servicebilar</td>
            <td>varierar mellan anläggningar</td>
            <td>kontrollera tillgången för det aktuella boendet</td>
          </tr>
          <tr>
            <td>Finns på mindre orter</td>
            <td>varierar mellan orter och perioder</td>
            <td>varierar mellan orter och perioder</td>
          </tr>
        </tbody>
      </table>

      <p>
        Jämför offerter för samma antal personer och period, och kontrollera vad som ingår.
        Mer om kostnader och vad som påverkar dem finns i{' '}
        <Link href="/blogg/vad-kostar-personalboende-sverige-2026-verkliga-priser">
          Vad kostar personalboende i Sverige 2026?
        </Link>
      </p>

      <h2>När lägenhetshotell är rätt val</h2>

      <ul>
        <li>Vistelser under tre månader, som StayOnSite inte erbjuder.</li>
        <li>Enstaka medarbetare på tjänsteresa, inte hela team.</li>
        <li>Citynära uppdrag där reception och daglig städning har ett värde.</li>
        <li>Osäkra datum där ni behöver jämföra avbokningsvillkor.</li>
      </ul>

      <h2>När företagsbostad är rätt val</h2>

      <ul>
        <li>Team om 4 personer eller fler som bor tillsammans under projektet.</li>
        <li>Uppdrag på tre månader eller längre där pris och villkor för hela perioden är viktiga.</li>
        <li>
          För projektorter som <Link href="/stad/boden">Boden</Link>,{' '}
          <Link href="/stad/oskarshamn">Oskarshamn</Link> och{' '}
          <Link href="/stad/monsteras">Mönsterås</Link> kan tillgänglighet, restid och villkor
          skilja sig. Jämför lägenhetshotell och företagsbostäder för de datum ni behöver.
        </li>
        <li>Behov av riktigt kök, tvättmaskin och plats för servicebilar och verktyg.</li>
      </ul>

      <p>
        För <Link href="/stad/boden">företagsboende i Boden</Link> kan ni skicka antal personer,
        önskade sovrum, arbetsplats och projektperiod i förfrågan. Pris och villkor bekräftas
        för det aktuella boendet innan ni bokar.
      </p>

      <h2>Räkneexempel: 6 montörer i 4 månader</h2>

      <p>Exemplet bygger på antagna priser och är inte en offert.</p>

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
        Med de antagna priserna blir huset hälften så dyrt. Den faktiska skillnaden beror på
        tillgänglighet, hyresperiod, rumsfördelning och vad som ingår i respektive offert.
      </p>

      <h2>Vanliga frågor</h2>

      <h3>Är lägenhetshotell och företagslägenhet samma sak?</h3>
      <p>
        Nej. Ett lägenhetshotell är ett hotellkoncept med möblerade lägenheter. En
        företagslägenhet är en möblerad bostad som hyrs till ett företag. Pris, service och
        hyresperiod kan skilja sig mellan alternativen.
      </p>

      <h3>Finns lägenhetshotell i mindre städer?</h3>
      <p>
        Ja, det kan finnas även på mindre orter. Utbud och lediga datum varierar, så jämför
        lägenhetshotell med företagsbostäder utifrån arbetsplats, antal personer, hyresperiod
        och vad som ingår.
      </p>

      <h3>Vad är billigast för ett team på sex personer eller fler?</h3>
      <p>
        I vårt räkneexempel blir ett hyrt hus billigare för sex personer. Den faktiska kostnaden
        beror på tillgänglighet, hyresperiod, rum och service, så jämför offerter för ert projekt.
      </p>

      <h3>Ingår städning i en företagsbostad?</h3>
      <p>
        Det varierar mellan bostäder och leverantörer. Kontrollera i offerten om slutstädning
        eller löpande städning ingår och om det finns tillägg.
      </p>

      <h2>Slutsats</h2>

      <p>
        Jämför alternativen utifrån projektets längd, teamets storlek, restid och vilken service
        ni behöver. StayOnSite hyr ut från tre månader. Be om offerter för samma period och
        kontrollera vad som ingår innan ni väljer.
      </p>

      <p>
        Behöver ni boende för ett team?{' '}
        <Link href="/for-foretag">Skicka en förfrågan</Link> med ort, antal personer och datum
        så återkommer vi med ett boendeförslag anpassat efter era behov.
      </p>
    </BlogLayout>
  );
};

export default LagenhetshotellEllerForetagsbostad2026;
