import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const VadKostarPersonalboende2026 = () => {
  const post = getBlogPost('vad-kostar-personalboende-sverige-2026-verkliga-priser')!;
  return (
    <BlogLayout post={post}>
      <p>
        Den som googlar &quot;vad kostar personalboende&quot; hittar mest vaga svar: &quot;det
        beror på&quot;, &quot;kontakta oss för offert&quot;. Det hjälper ingen som sitter med en
        anbudskalkyl. Därför publicerar vi i stället siffror ur vår egen portfölj — 38 aktiva
        objekt i juli 2026, från enskilda lägenheter till hus med tio bäddar. Det här är vad
        personalboende faktiskt kostar i Sverige just nu.
      </p>

      <h2>Snittpriser ur vår portfölj, juli 2026</h2>

      <p>
        Två siffror sammanfattar marknaden: instegspriset är <strong>5 900 kr per person och
        månad</strong>, och snittet över hela beståndet ligger på <strong>cirka 7 000 kr per
        bäddplats och månad</strong>. I städerna där vi har flest objekt ser det ut så här:
      </p>

      <table>
        <thead>
          <tr>
            <th>Stad</th>
            <th>Objekt i underlaget</th>
            <th>Månadspris helt boende</th>
            <th>Snittpris per bäddplats</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kiruna</td>
            <td>5</td>
            <td>34 900–39 900 kr</td>
            <td>ca 8 000 kr</td>
          </tr>
          <tr>
            <td>Luleå</td>
            <td>4</td>
            <td>27 900–49 900 kr</td>
            <td>ca 6 100 kr</td>
          </tr>
          <tr>
            <td>Mönsterås</td>
            <td>3</td>
            <td>22 500–37 300 kr</td>
            <td>ca 6 100 kr</td>
          </tr>
          <tr>
            <td>Oskarshamn</td>
            <td>3</td>
            <td>9 500–29 900 kr</td>
            <td>ca 7 600 kr</td>
          </tr>
        </tbody>
      </table>

      <p>
        Siffrorna är faktiska månadspriser mot kund i juli 2026, avrundade till närmaste
        hundralapp. Spannet inom varje stad förklaras nästan helt av storleken: 9 500 kr i
        Oskarshamn är en mindre lägenhet, 49 900 kr i Luleå är ett stort hus med plats för ett
        helt arbetslag. I övriga städer — bland andra Gävle, Boden och Sandviken — har vi färre
        objekt i underlaget, men prisbilden per bäddplats ligger i samma spann: ungefär
        6 000–8 000 kr per månad.
      </p>

      <h2>Vad som driver priset</h2>

      <p>
        Fyra faktorer förklarar det mesta av variationen:
      </p>

      <ul>
        <li>
          <strong>Ortens efterfrågetryck.</strong> Kiruna är dyrast per bäddplats i vårt bestånd.
          Gruvnäringen och stadsomvandlingen håller efterfrågan hög samtidigt som utbudet av
          större bostäder är litet. I <Link href="/stad/lulea">Luleå</Link> finns fler stora hus,
          vilket pressar priset per bädd trots industriboomen.
        </li>
        <li>
          <strong>Antal bäddar per boende.</strong> Ju fler som delar ett hus, desto lägre
          kostnad per person. Ett hus med 7 bäddar för 42 000 kr ger 6 000 kr per bädd — en
          tvåa för 15 000 kr delad av två ger 7 500 kr.
        </li>
        <li>
          <strong>Avtalslängd.</strong> Månadsvisa avtal från en månad är standard, men vid
          uppdrag på ett halvår eller mer finns ofta utrymme att förhandla.
        </li>
        <li>
          <strong>Standard och krav.</strong> Eget sovrum till alla är norm i vårt bestånd.
          Egen parkering för servicebilar, garage eller verktygsförvaring kan påverka priset.
        </li>
      </ul>

      <p>
        I priserna ingår typiskt möblering, el, värme, vatten och wifi. Exakt omfattning —
        till exempel sängkläder, förbrukningsmaterial och löpande städning — avtalas separat
        utifrån projektets förutsättningar.
      </p>

      <h2>Jämförelsen med hotell</h2>

      <p>
        En hotellnatt utanför storstäderna kostar 700–1 000 kr. Vid 30 nätter blir det
        21 000–30 000 kr per person och månad — tre till fyra gånger priset för en bäddplats i
        personalboende, och då utan kök att laga mat i. Vi har räknat igenom hela jämförelsen,
        inklusive Airbnb och egen hantering, i{' '}
        <Link href="/blogg/personalboende-vs-hotell-kostnad-jamforelse">
          Personalboende vs hotell: Vad kostar det egentligen?
        </Link>
      </p>

      <h2>Räkneexempel: 6 montörer i Kiruna i 5 månader</h2>

      <table>
        <thead>
          <tr>
            <th>Alternativ</th>
            <th>Kostnad per månad</th>
            <th>Totalt 5 månader</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Helt hus, 6 bäddar (StayOnSite)</td>
            <td>ca 37 000 kr</td>
            <td>ca 185 000 kr</td>
          </tr>
          <tr>
            <td>Hotell, 6 rum à 900 kr/natt</td>
            <td>ca 162 000 kr</td>
            <td>ca 810 000 kr</td>
          </tr>
        </tbody>
      </table>

      <p>
        Skillnaden på ett enda uppdrag är över 600 000 kr — före matkostnaderna som tillkommer
        när teamet saknar kök. Det är den typen av post som avgör om en anbudskalkyl håller.
      </p>

      <h2>Vanliga frågor om priser</h2>

      <h3>Vad kostar personalboende per person och månad?</h3>
      <p>
        Från 5 900 kr per person och månad. Snittet i vårt bestånd är cirka 7 000 kr per
        bäddplats (38 objekt, juli 2026). Priset per person sjunker med antalet bäddar i
        boendet.
      </p>

      <h3>Varför är Kiruna dyrast per bäddplats?</h3>
      <p>
        Efterfrågan från gruvnäringen och stadsomvandlingen är hög samtidigt som utbudet av
        större bostäder är begränsat. Snittet i vårt Kiruna-bestånd ligger runt 8 000 kr per
        bäddplats mot cirka 6 100 kr i Luleå och Mönsterås.
      </p>

      <h3>Vad ingår i hyran?</h3>
      <p>
        Typiskt möblering, el, värme, vatten och wifi. Sängkläder, löpande städning och annan
        service avtalas separat utifrån projektets förutsättningar, så att ni inte betalar för
        sådant ni inte behöver.
      </p>

      <h3>Är det billigare att hyra ett helt hus än enskilda bäddplatser?</h3>
      <p>
        Ja, nästan alltid. Ett hus med sex till åtta bäddar ger den lägsta kostnaden per
        person och håller dessutom ihop teamet på ett ställe — en praktisk fördel vid skiftgång
        och samåkning.
      </p>

      <h2>Slutsats</h2>

      <p>
        Personalboende i Sverige kostar 2026 i praktiken 6 000–8 000 kr per bäddplats och månad
        i de industristäder där behovet är störst, med instegspris från 5 900 kr. Ett helt hus
        för ett arbetslag på fem till sju personer landar typiskt på 28 000–42 000 kr per
        månad. Mot hotellets 21 000–30 000 kr per person är det en skillnad som syns direkt i
        projektkalkylen.
      </p>

      <p>
        Vill du ha en exakt siffra för ert projekt?{' '}
        <Link href="/for-foretag">Skicka en förfrågan</Link> med ort, antal personer och datum
        så återkommer vi med en boendeplan med adresser och priser inom 24 timmar. Aktuellt
        utbud finns i städerna, till exempel <Link href="/stad/kiruna">Kiruna</Link>,{' '}
        <Link href="/stad/lulea">Luleå</Link>, <Link href="/stad/oskarshamn">Oskarshamn</Link>{' '}
        och <Link href="/stad/monsteras">Mönsterås</Link>.
      </p>
    </BlogLayout>
  );
};

export default VadKostarPersonalboende2026;
