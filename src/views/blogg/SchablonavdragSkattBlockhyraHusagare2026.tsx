import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const SchablonavdragSkattBlockhyraHusagare2026 = () => {
  const post = getBlogPost('schablonavdrag-skatt-blockhyra-husagare-2026')!;

  return (
    <BlogLayout post={post}>
      <div className="not-prose mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-950">
        <p className="font-semibold">Rättelse och faktakontroll 6 september 2026</p>
        <p className="mt-2">
          En tidigare version beskrev ett beslutat schablonavdrag på 50&nbsp;000 kronor.
          Det var fel. Skatteverket anger fortsatt högst 40&nbsp;000 kronor per bostad och
          år. Alla räkneexempel och slutsatser nedan har därför räknats om.
        </p>
      </div>

      <p>
        När du hyr ut en privatbostad betalar du normalt 30 procent skatt på det överskott
        som återstår efter tillåtna avdrag. Två regelverk måste hållas isär: skattereglerna
        avgör hur inkomsten beräknas, medan privatuthyrningslagen och hyreslagen styr själva
        hyresförhållandet.
      </p>

      <p>
        Den nya privatuthyrningslagen som började gälla den 1 juli 2026 ändrade inte
        schablonavdraget. Den här guiden utgår från{' '}
        <a
          href="https://www.skatteverket.se/privat/skatter/arbeteochinkomst/inkomster/hyrautbostadbilochsaker/hyrautprivatbostad.106.1c68351d170ce554527ef5.html"
          target="_blank"
          rel="noreferrer"
        >
          Skatteverkets aktuella vägledning om privatuthyrning
        </a>
        .
      </p>

      <h2>Schablonavdraget 2026: högst 40 000 kronor</h2>

      <p>
        Du får normalt göra ett schablonavdrag på högst <strong>40&nbsp;000 kronor per
        privatbostad och år</strong>. Avdraget gäller per bostad, inte per ägare. Om ni är
        flera som äger bostaden ska avdraget fördelas efter ägarandel.
      </p>

      <p>
        Äger du bostaden hela året påverkas inte schablonavdraget av att du bara hyr ut
        under en del av året. Har du däremot inte ägt bostaden hela året begränsas avdraget
        till de månader du ägt den. Avdraget får aldrig vara högre än de inkomster som hör
        till bostaden.
      </p>

      <p>
        Skatteverket anger också att schablonavdraget är tänkt att täcka kostnader som extra
        försäkring, möbler, reparationer och ökade driftskostnader. Du får därför inte dra av
        sådana faktiska kostnader en gång till.
      </p>

      <h2>Ytterligare avdrag beror på bostadstyp</h2>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Bostadstyp</th>
              <th>Schablonavdrag</th>
              <th>Kompletterande avdrag</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Småhus eller ägarlägenhet</td>
              <td>Högst 40 000 kr</td>
              <td>Normalt 20 % av hyresintäkten</td>
            </tr>
            <tr>
              <td>Bostadsrätt</td>
              <td>Högst 40 000 kr</td>
              <td>Den del av avgiften som avser uthyrd tid och del, enligt Skatteverkets regler</td>
            </tr>
            <tr>
              <td>Hyresrätt</td>
              <td>Högst 40 000 kr</td>
              <td>Den del av den egna hyran som avser uthyrd tid och del</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Privatuthyrningslag (2026:772) gäller inte när uthyraren själv innehar bostaden med
        hyresrätt, men skattereglerna har ändå särskilda beräkningsregler för den som hyr ut
        en hyresrätt i andra hand. Det är ett exempel på varför hyresrätt och skatt inte ska
        blandas ihop.
      </p>

      <h2>Räkneexempel: småhus uthyrt i tio månader</h2>

      <p>
        Anta att du äger ett småhus hela året och hyr ut det för 15&nbsp;000 kronor per
        månad under tio månader. Du har inga andra inkomster som ska räknas ihop med
        bostadens uthyrningsinkomst.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Beräkning</th>
              <th>Belopp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hyresintäkt: 15 000 × 10</td>
              <td>150 000 kr</td>
            </tr>
            <tr>
              <td>Schablonavdrag</td>
              <td>&minus;40 000 kr</td>
            </tr>
            <tr>
              <td>Avdrag: 20 % av 150 000</td>
              <td>&minus;30 000 kr</td>
            </tr>
            <tr>
              <td>Överskott</td>
              <td>80 000 kr</td>
            </tr>
            <tr>
              <td>Skatt: 30 % av 80 000</td>
              <td>24 000 kr</td>
            </tr>
            <tr>
              <td>Hyresintäkt efter skatt</td>
              <td><strong>126 000 kr</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Det är ett förenklat exempel. Elersättning, städavgifter och andra betalningar kan
        räknas som hyresintäkt. Använd därför Skatteverkets beräkningshjälp med dina egna
        förutsättningar.
      </p>

      <h2>Två bostäder betyder inte automatiskt näringsverksamhet</h2>

      <p>
        Sedan den 1 juli 2026 kan privatuthyrningslagen under vissa förutsättningar omfatta
        en privatpersons uthyrning av högst två fristående lägenheter. Vid regelmässig
        uthyrning av fler än två gäller normalt hyreslagen. Det framgår av{' '}
        <a
          href="https://svenskforfattningssamling.se/doc/2026772.html"
          target="_blank"
          rel="noreferrer"
        >
          privatuthyrningslag (2026:772)
        </a>
        .
      </p>

      <p>
        Den civilrättsliga gränsen avgör inte ensam om inkomsten skattemässigt ska behandlas
        som kapital eller näringsverksamhet. Även bostadens skattemässiga karaktär, hur den
        används och verksamhetens omfattning kan spela roll. Påståendet att en tredje bostad
        automatiskt utlöser en viss skattesats eller egenavgift blir därför missvisande.
      </p>

      <p>
        Bakgrunden till lagändringen och riksdagens beslut finns i{' '}
        <a
          href="https://www.riksdagen.se/sv/dokument-och-lagar/dokument/proposition/en-mer-flexibel-hyresmarknad_hd03187/"
          target="_blank"
          rel="noreferrer"
        >
          proposition 2025/26:187
        </a>
        . Läs även vår <Link href="/blogg/privatuthyrningslagen-reform-2026">uppdaterade genomgång av privatuthyrningslagen</Link>.
      </p>

      <h2>Är uthyrning till företag samma sak som blockhyra?</h2>

      <p>
        Nej. Att hyresgästen är ett företag gör inte automatiskt avtalet till blockhyra.
        Blockhyra i hyreslagens mening avser minst tre bostadslägenheter som hyrs ut
        tillsammans för vidareupplåtelse. En privat husägare som hyr ut en villa till ett
        företag kan ha ett företagsavtal utan att upplägget är blockhyra.
      </p>

      <p>
        Skatten på ägarens inkomst måste fortfarande bedömas utifrån bostadstypen och de
        faktiska omständigheterna. Om du hyr ut till din egen eller en närståendes arbetsgivare
        finns dessutom särskilda skatteregler. Kontrollera därför avtalet innan du räknar på
        nettot.
      </p>

      <h2>Underlag att spara</h2>

      <ul>
        <li>hyresavtal och eventuella bilagor,</li>
        <li>samtliga hyresbetalningar och separata avgifter,</li>
        <li>uppgift om ägarandel och ägandetid under året,</li>
        <li>bostadsrättsavgift eller egen hyra för uthyrningsperioden,</li>
        <li>mätunderlag om el, vatten eller värme debiteras efter förbrukning, och</li>
        <li>beräkningen som ligger bakom deklarerat överskott.</li>
      </ul>

      <h2>Vanliga frågor om schablonavdrag och skatt</h2>

      <h3>Höjdes schablonavdraget den 1 juli 2026?</h3>
      <p>
        Nej. Skatteverket anger fortsatt högst 40&nbsp;000 kronor per bostad och år. Den
        nya privatuthyrningslagen ändrade hyresreglerna, inte inkomstskattelagen.
      </p>

      <h3>Får två delägare 40 000 kronor var?</h3>
      <p>
        Nej. Schablonavdraget gäller per bostad. Delägarna fördelar avdraget mellan sig efter
        ägarandel.
      </p>

      <h3>Får jag dra av möbler, reparationer och extra försäkring?</h3>
      <p>
        Inte som separata faktiska kostnader inom den vanliga beräkningen för privatbostad.
        Schablonavdraget är avsett att täcka sådana kostnader.
      </p>

      <h3>Gäller 20-procentsavdraget för en bostadsrätt?</h3>
      <p>
        Nej, 20-procentsavdraget gäller småhus och ägarlägenhet. För bostadsrätt beräknas i
        stället ett kompletterande avdrag utifrån bland annat avgiften och uthyrningstiden.
      </p>

      <h2>Vill du hyra ut till företag?</h2>

      <p>
        StayOnSite hjälper husägare och företag med det praktiska upplägget kring
        personalboende. Vi lämnar inte individuell skatterådgivning, men ser till att
        avtalsparter, boendeanvändning och ansvar är tydliga inför inflyttning. Du kan{' '}
        <Link href="/registrera-bostad">registrera din bostad</Link> eller ringa{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default SchablonavdragSkattBlockhyraHusagare2026;
