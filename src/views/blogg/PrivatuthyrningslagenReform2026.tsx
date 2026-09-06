import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const PrivatuthyrningslagenReform2026 = () => {
  const post = getBlogPost('privatuthyrningslagen-reform-2026')!;

  return (
    <BlogLayout post={post}>
      <div className="not-prose mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
        <p className="font-semibold">Rättelse och faktakontroll 6 september 2026</p>
        <p className="mt-2">
          En tidigare version uppgav felaktigt att schablonavdraget höjdes till 50&nbsp;000
          kronor. Reformen ändrade hyresreglerna, inte skattereglerna. Skatteverket anger
          fortfarande högst 40&nbsp;000 kronor per bostad och år. Artikeln är omarbetad mot
          lagtext, riksdagsbeslut och Skatteverkets aktuella vägledning.
        </p>
      </div>

      <p>
        Den 1 juli 2026 trädde <strong>privatuthyrningslag (2026:772)</strong> i kraft. Den
        ersatte lagen (2012:978) om uthyrning av egen bostad och samlar reglerna för
        privatpersoner som hyr ut ägda bostäder. Samtidigt ändrades reglerna om bland annat
        blockhyra i 12 kap. jordabalken.
      </p>

      <p>
        Här skiljer vi på tre frågor som ofta blandas ihop: vilken uthyrning den nya lagen
        omfattar, hur hyran får bestämmas och hur hyresinkomsten beskattas. Artikeln ger
        allmän information och ersätter inte juridisk eller skattemässig rådgivning i ett
        enskilt avtal.
      </p>

      <h2>Beslutet bakom de nya reglerna</h2>

      <p>
        Riksdagen biföll proposition 2025/26:187, <em>En mer flexibel hyresmarknad</em>, den
        20 maj 2026. Den nya lagen kungjordes som SFS 2026:772 och trädde i kraft den 1 juli
        2026. Den officiella lagtexten finns hos{' '}
        <a
          href="https://svenskforfattningssamling.se/doc/2026772.html"
          target="_blank"
          rel="noreferrer"
        >
          Svensk författningssamling
        </a>
        , och hela beslutsunderlaget finns hos{' '}
        <a
          href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/en-mer-flexibel-hyresmarknad_hd03187/"
          target="_blank"
          rel="noreferrer"
        >
          Sveriges riksdag
        </a>
        .
      </p>

      <h2>1. Lagen kan omfatta högst två fristående lägenheter</h2>

      <p>
        Privatuthyrningslagen gäller när en fysisk person eller ett dödsbo mot ersättning
        upplåter ett ägt hus eller en del av ett hus som bostad. Den gäller däremot inte om
        hyresvärden <strong>regelmässigt hyr ut fler än två lägenheter</strong> som inte är
        en del av den egna bostaden. Då gäller normalt hyreslagen i 12 kap. jordabalken.
      </p>

      <p>
        Ordet <em>regelmässigt</em> är viktigt. Bedömningen utgår från hur verksamheten är
        ordnad över tid, inte bara hur många avtal som råkar löpa en viss dag. Rum och
        uthyrningsdelar i det hus där hyresvärden själv bor bedöms särskilt och räknas inte
        alltid på samma sätt som fristående bostäder.
      </p>

      <p>Lagen gäller inte heller när:</p>

      <ul>
        <li>hyresvärden själv innehar bostaden med hyresrätt,</li>
        <li>upplåtelsen avser fritidsändamål, eller</li>
        <li>uthyrningen har sådan omfattning att undantaget för fler än två lägenheter gäller.</li>
      </ul>

      <p>
        För en bostadsrätt behövs fortfarande föreningens samtycke eller tillstånd från
        hyresnämnden till andrahandsupplåtelsen. Den nya privatuthyrningslagen ersätter inte
        bostadsrättslagens krav på tillstånd.
      </p>

      <h2>2. Nya och gamla avtal följer olika lagar</h2>

      <p>
        Den nya lagen gäller för avtal som ingås från och med den 1 juli 2026. Ett avtal som
        ingicks enligt den tidigare lagen fortsätter att omfattas av den upphävda lagen. Det
        betyder att två liknande uthyrningar kan följa olika regler beroende på när avtalen
        tecknades.
      </p>

      <p>
        Skriv därför alltid in avtalsdatum, hyresobjekt, användningsändamål, hyra, vad som
        ingår och uppsägningstid tydligt. Enligt den nya lagen ska avtalet upprättas skriftligt
        om hyresvärden eller hyresgästen begär det. I praktiken bör ett uthyrningsavtal alltid
        vara skriftligt.
      </p>

      <h2>3. Friare inflyttningshyra – men inte utan skyddsregel</h2>

      <p>
        Parterna får som utgångspunkt komma överens om inflyttningshyrans storlek. Det är en
        annan modell än den tidigare kopplingen till kapital- och driftskostnader. Hyran ska
        normalt anges som ett bestämt belopp, medan faktisk förbrukning av exempelvis el,
        värme och vatten kan regleras separat enligt lagen.
      </p>

      <p>
        Avtalsfriheten är inte obegränsad. Hyresgästen kan ansöka hos hyresnämnden om att få
        hyran sänkt om den är <strong>väsentligt högre</strong> än den hyra som i allmänhet
        tas ut för liknande eller i motsvarande omfattning efterfrågade bostäder som hyrs ut
        enligt privatuthyrningslagen. Läget, bostadens skick, förmåner och efterfrågan kan
        vägas in i jämförelsen.
      </p>

      <h2>4. Schablonavdraget är fortfarande 40 000 kronor</h2>

      <p>
        Reformen av privatuthyrningslagen ändrade inte inkomstskattelagen. Enligt{' '}
        <a
          href="https://www.skatteverket.se/privat/skatter/arbeteochinkomst/inkomster/hyrautbostadbilochsaker/hyrautprivatbostad.106.1c68351d170ce554527ef5.html"
          target="_blank"
          rel="noreferrer"
        >
          Skatteverkets vägledning om privatuthyrning
        </a>{' '}
        är schablonavdraget 2026 högst <strong>40&nbsp;000 kronor per bostad och år</strong>.
        Avdraget gäller per bostad, inte per person. Om flera äger bostaden fördelas det
        mellan ägarna efter ägarandel.
      </p>

      <p>
        För småhus och ägarlägenhet får du dessutom normalt dra av 20 procent av
        hyresintäkten. För bostadsrätt och hyresrätt gäller andra kompletterande avdrag.
        Skatteverkets beräkningshjälp är säkrast när du vill räkna på just din bostad.
      </p>

      <h3>Räkneexempel: villa som hyrs ut för 15 000 kr per månad</h3>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Post</th>
              <th>Belopp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hyresintäkt, 12 månader</td>
              <td>180 000 kr</td>
            </tr>
            <tr>
              <td>Schablonavdrag</td>
              <td>&minus;40 000 kr</td>
            </tr>
            <tr>
              <td>Avdrag med 20 % av hyran</td>
              <td>&minus;36 000 kr</td>
            </tr>
            <tr>
              <td>Överskott att beskatta</td>
              <td>104 000 kr</td>
            </tr>
            <tr>
              <td>Kapitalskatt, 30 %</td>
              <td>31 200 kr</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Exemplet gäller ett småhus som är privatbostad, ägs av en person hela året och inte
        har andra inkomster kopplade till bostaden. Skatten kan bli en annan för en
        bostadsrätt, hyresrätt, delat ägande eller uthyrning som bedöms som näringsverksamhet.
      </p>

      <h2>Privatuthyrning till företag är inte automatiskt blockhyra</h2>

      <p>
        Ett företag kan vara avtalspart när en bostad ska användas som boende för personal,
        men det gör inte upplägget automatiskt till blockhyra. Blockhyra i hyreslagens mening
        avser minst tre bostadslägenheter som hyrs ut tillsammans och regleras separat i 12
        kap. jordabalken.
      </p>

      <p>
        För en privat husägare som hyr ut en eller två bostäder till ett företag behöver
        avtalskedjan bedömas för sig: vem är hyresgäst, vem bor i bostaden, får företaget byta
        boende personer och vem ansvarar för skador, nycklar och uppsägning? Läs vår separata{' '}
        <Link href="/blogg/blockhyra-nya-regler-juli-2026-guide-foretag">
          guide om blockhyra för företag
        </Link>{' '}
        om upplägget omfattar tre eller fler lägenheter.
      </p>

      <h2>Praktisk checklista före nytt avtal</h2>

      <ul>
        <li>Fastställ om bostaden ägs eller innehas med hyresrätt.</li>
        <li>Kontrollera om den nya lagen eller äldre övergångsregler gäller.</li>
        <li>Räkna hur många fristående lägenheter som hyrs ut regelmässigt.</li>
        <li>Kontrollera föreningens eller hyresvärdens tillstånd när det behövs.</li>
        <li>Beskriv användningen som bostad och ange vilka som får bo där.</li>
        <li>Ange fast hyra och specificera eventuell debitering av faktisk förbrukning.</li>
        <li>Reglera deposition, skador, inventarier, nycklar och uppsägning skriftligt.</li>
        <li>Använd Skatteverkets aktuella regler när du räknar på nettot.</li>
      </ul>

      <h2>Vanliga frågor om privatuthyrningslagen 2026</h2>

      <h3>När började den nya privatuthyrningslagen gälla?</h3>
      <p>
        Den trädde i kraft den 1 juli 2026. Äldre avtal fortsätter att följa lagen (2012:978)
        om uthyrning av egen bostad.
      </p>

      <h3>Kan jag hyra ut två bostäder enligt lagen?</h3>
      <p>
        Ja, lagen kan omfatta högst två fristående lägenheter. Om du regelmässigt hyr ut fler
        än två gäller normalt hyreslagen för upplåtelserna. Bedömningen görs utifrån hur
        uthyrningen är organiserad över tid.
      </p>

      <h3>Får jag sätta vilken hyra jag vill?</h3>
      <p>
        Du och hyresgästen får som utgångspunkt avtala om inflyttningshyran. Hyresnämnden kan
        dock sänka en hyra som är väsentligt högre än för jämförbara privatuthyrda bostäder.
      </p>

      <h3>Hur stort är schablonavdraget 2026?</h3>
      <p>
        Högst 40&nbsp;000 kronor per bostad och år enligt Skatteverket. För småhus och
        ägarlägenhet finns normalt även ett avdrag med 20 procent av hyresintäkten.
      </p>

      <h2>Behöver du ett tryggt företagsavtal?</h2>

      <p>
        StayOnSite arbetar med personalboende och företagsbostäder i hela Sverige. Vi hjälper
        till att tydliggöra boendebehov, avtalsparter och det praktiska ansvaret innan
        inflyttning. Vill du hyra ut din bostad till ett företag kan du{' '}
        <Link href="/registrera-bostad">registrera bostaden</Link>. Företag som söker boende
        kan skicka en <Link href="/kontakt">projektförfrågan</Link> eller ringa{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default PrivatuthyrningslagenReform2026;
