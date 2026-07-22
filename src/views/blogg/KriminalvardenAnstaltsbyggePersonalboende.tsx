import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const KriminalvardenAnstaltsbyggePersonalboende = () => {
  const post = getBlogPost('kriminalvarden-anstaltsbygge-personalboende-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Sverige genomför just nu en av de största fastighetssatsningarna i myndighetshistorien &ndash; en utbyggnad av Kriminalvårdens anstalts- och häktesplatser som saknar motstycke. För byggföretag och underentreprenörer innebär detta flera års stabil orderingång på orter som annars sällan toppar byggstatistiken. Men bakom varje ny anstalt döljer sig en logistisk utmaning som ofta underskattas: var ska hantverkarna, projektledarna och specialisterna bo under de fyra till sex år som ett bygge pågår? I den här analysen går vi igenom omfattningen av utbyggnaden, var projekten finns och vad byggbolag behöver tänka på för att säkra personalboende inför anbud och byggstart.
      </p>

      <h2>Historisk utbyggnad: mer än en fördubbling på tio år</h2>
      <p>
        
Till följd av Tidöavtalets förändrade kriminalpolitik &ndash; som kommer resultera i fler intagna och längre strafftider &ndash; planerar Kriminalvården att bygga ut anstalts- och häktesverksamheten med omkring 11 000 platser under de kommande tio åren, vilket motsvarar mer än en fördubbling av nuvarande antal.
{' '}
        Enligt myndighetens egen kapacitetsrapport 
planerar Kriminalvården för att ha sammanlagt cirka 19 500 fasta platser på tio års sikt, vilket innebär en ökning med cirka 11 000 fasta platser. Det motsvarar mer än en dubblering av antalet fasta platser.

      </p>
      <p>
        Utbyggnaden handlar inte bara om platser &ndash; den kräver också betydligt fler medarbetare. 
Vi går mot betydligt större anstalter och häkten, lägre personaltäthet och hårdare prioriteringar, säger Susanne Wedin, chef för avdelningen anstalt, häkte och frivård.
 Samtidigt är takten på utbyggnaden beroende av byggbranschens kapacitet: 
rekryteringsbegränsningar och långa byggtider sätter de yttre ramarna för tillväxten.

      </p>
      <p>
        Sedan regeringen tillträdde har beslut fattats om ett stort antal nya hyresavtal. I samband med utökningen av anstalten Kristianstad Vä noterades att 
sedan regeringen tillträdde i oktober 2022 har den fattat beslut om hyresavtal som innebär cirka 4 500 nya platser i Kriminalvården, vilket motsvarar drygt sex Kumlaanstalter.
 Läs gärna vår genomgång av{' '}
        <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">infrastrukturplanen 2026&ndash;2037</Link>{' '}
        för att se hur kriminalvårdsprojekten samspelar med andra stora statliga satsningar på boende och personal.
      </p>

      <h2>Var byggs det? Genomgång av orterna</h2>
      <p>
        I april 2026 fattade regeringen ett samlat beslut som pekar ut sex orter för nya hyresavtal. 
Beslutet avser avtal för orterna Södertälje, Karlskoga, Hisingen, Värnamo, Trelleborg och Västervik. I Värnamo och Trelleborg kommer två nya anstalter att etableras.
{' '}
        Justitieminister Gunnar Strömmer kommenterade beslutet:
      </p>
      <blockquote>
        
Den fortsatta expansionen av Kriminalvården är viktig för att fortsätta trycka tillbaka den grova och organiserade brottsligheten. Drygt 1 800 nya platser motsvarar över två Kumlaanstalter. Det kommer att innebära ett märkbart tillskott till Kriminalvårdens kapacitet.

      </blockquote>
      <p>
        Utöver aprilbeslutet har regeringen även godkänt en andra etapp för anstalten i Kristianstad Vä: 
regeringen har beslutat om hyresavtal för den andra etappen av nybyggnation för anstalten Kristianstad Vä, vilket ger ytterligare cirka 400 platser. Sammantaget ger de två etapperna en platsutökning på cirka 600 platser.
 För byggföretag med uppdrag i Skåne kan{' '}
        <Link href="/stad/malmo">Malmö</Link>{' '}
        och{' '}
        <Link href="/stad/lund">Lund</Link>{' '}
        fungera som regionala baser för personalboende inför både Trelleborg- och Kristianstadprojekten.
      </p>
      <p>
        Hisingen ingår i beslutet och ligger inom{' '}
        <Link href="/stad/goteborg">Göteborgs</Link>{' '}
        kommun, vilket gör stadens redan etablerade bostadsmarknad till en naturlig utgångspunkt för inhyrd personal. Värnamoprojektet ligger en bit från större städer, men <Link href="/stad/jonkoping">Jönköping</Link> kan fungera som regional bas för pendling under uppstartsfasen. Karlskoga saknar en egen stadssida hos oss, men <Link href="/stad/orebro">Örebro</Link> ligger inom pendlingsavstånd och har ett bredare utbud av boendealternativ. Södertäljeprojektet, som handlar om en utbyggnad av anstalten Hall, ligger nära{' '}
        <Link href="/stad/stockholm">Stockholm</Link>, medan Västervik redan har en etablerad lokal marknad via{' '}
        <Link href="/stad/vastervik">Västervik</Link>.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Ort</th>
              <th>Nya platser (cirka)</th>
              <th>Byggstart / tillträde</th>
              <th>Hyresavtalets längd</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Trelleborg</td>
              <td>720 (häkte + anstalt) plus transportenhet</td>
              <td>Byggstart 2026, drift från cirka 2030&ndash;2031</td>
              <td>Långsiktigt avtal, flera decennier</td>
            </tr>
            <tr>
              <td>Värnamo</td>
              <td>250</td>
              <td>Tillträde från 2029&ndash;2030</td>
              <td>25 år</td>
            </tr>
            <tr>
              <td>Södertälje (Hall)</td>
              <td>160</td>
              <td>Successivt från 2029</td>
              <td>25 år</td>
            </tr>
            <tr>
              <td>Karlskoga</td>
              <td>160</td>
              <td>Tillträde 2029</td>
              <td>25 år</td>
            </tr>
            <tr>
              <td>Hisingen (Göteborg)</td>
              <td>Ingår i aprilbeslutets 1 818 platser</td>
              <td>Ej offentliggjort i detalj</td>
              <td>Ej offentliggjort i detalj</td>
            </tr>
            <tr>
              <td>Kristianstad/Vä</td>
              <td>600 (200 + 400 i två etapper)</td>
              <td>Etapp 2 pågående</td>
              <td>25 år (etapp 2)</td>
            </tr>
            <tr>
              <td>Västervik</td>
              <td>80</td>
              <td>Tillträde 2026</td>
              <td>18 år och 7 månader</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        Uppgifterna bygger på regeringens och Kriminalvårdens pressmeddelanden om respektive hyresavtal. Exakt platsantal per ort kan justeras under projektering.
      </p>

      <h2>Varför projekten kräver inflyttad arbetskraft</h2>
      <p>
        Storleken på anläggningarna är den enskilt viktigaste förklaringen till varför lokal arbetskraft sällan räcker till. Anstalten i Trelleborg är ett tydligt exempel: 
med en total byggyta på cirka 110 000 kvadratmeter blir Anstalt Trelleborg en av de största kriminalvårdsinvesteringarna i Sverige under de kommande åren.
{' '}
        Vid det första spadtaget i juni 2026 deltog omkring tusen personer från de inblandade bolagen: 
det gör det möjligt för det uppemot 1 000 medarbetare från fastighetsägaren Specialfastigheter och entreprenören NCC som ska bygga anläggningen.

      </p>
      <p>
        NCC:s egen divisionschef beskriver komplexiteten i projekttypen:
      </p>
      <blockquote>
        
Anstalter är komplexa projekt som kräver en speciell kompetens, och storleken på Trelleborgsanstalten adderar ytterligare dimensioner med utmaningar inom flera områden. NCC har bred erfarenhet av att genomföra stora projekt med hög säkerhetsklass, vilket kommer vara värdefullt för det här viktiga projektet.

      </blockquote>
      <p>
        Den specialistkompetens som krävs &ndash; säkerhetsklassad projektering, betongkonstruktioner i säkerhetsklass, komplexa installationer &ndash; finns sällan samlad på mindre orter. Det innebär att projektledare, betongarbetare, elektriker och andra yrkesgrupper ofta måste tas in från andra delar av landet, ibland även från utlandet. Behovet påminner om det vi tidigare beskrivit i vår guide om{' '}
        <Link href="/blogg/kompetensbristen-byggsektorn-2026-praktisk-rekryteringsguide">kompetensbristen i byggsektorn</Link>{' '}
        och om hur infrastrukturprojekt som{' '}
        <Link href="/blogg/blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026">Ostlänken och Norrbotniabanan</Link>{' '}
        hanterar samma typ av bemanningsutmaning.
      </p>

      <h2>Praktiska utmaningar för byggföretag</h2>
      <p>
        Kriminalvårdsprojekt skiljer sig från vanliga bostads- eller kontorsbyggen på flera avgörande punkter. För det första är byggarbetsplatserna säkerhetsklassade redan under produktionsfasen, vilket innebär strikta rutiner för in- och utpassering, bakgrundskontroller av personal och begränsad rörlighet på området. För det andra är byggtiderna långa &ndash; ofta fyra till sex år från spadtag till full drift, vilket ställer krav på boendelösningar som håller över flera säsonger och som kan skalas upp och ned i takt med projektets olika faser.
      </p>
      <p>
        För det tredje ligger flera av projekten i eller nära mindre orter med en begränsad bostadsmarknad. Ett hotellrum per natt är sällan ett hållbart eller kostnadseffektivt alternativ när hundratals medarbetare ska bo på plats i flera år. Den typen av avvägning &ndash; kostnad, kontinuitet och kvalitet &ndash; går vi igenom mer i detalj i{' '}
        <Link href="/blogg/personalboende-vs-hotell-kostnad-jamforelse">vår jämförelse mellan personalboende och hotell</Link>.
      </p>
      <p>
        Många av utmaningarna gäller även andra stora, säkerhetskänsliga eller geografiskt utspridda byggprojekt, till exempel elnätsutbyggnaden i norra Sverige. Se gärna vår genomgång av{' '}
        <Link href="/blogg/elnatsutbyggnad-nordsyd-personalboende-guide-2026">elnätsutbyggnadens boendebehov</Link>{' '}
        för fler paralleller.
      </p>

      <h2>Checklista: så säkrar byggföretag personalboende inför anbud och byggstart</h2>
      <ul>
        <li>Kartlägg bostadsmarknaden på och kring byggorten redan i anbudsskedet &ndash; se vår{' '}
          <Link href="/blogg/regional-bostadsanalys-2026-var-finns-boende-montorer">regionala bostadsanalys</Link>{' '}
          för aktuellt läge på flera av kriminalvårdens byggorter.
        </li>
        <li>Räkna med hela byggtiden, inte bara första etappen &ndash; kontrakt på fyra till sex år kräver en långsiktig boendeplan snarare än tillfälliga lösningar.</li>
        <li>
          Säkerställ att boendeavtalen uppfyller de avtalskrav som ofta ställs i statliga upphandlingar, se{' '}
          <Link href="/blogg/avtalskrav-personalboende-guide-2026">vår guide om avtalskrav för personalboende</Link>.
        </li>
        <li>
          Planera för personal som kommer från andra delar av landet eller utomlands, inklusive praktiska frågor om boendevillkor &ndash; se{' '}
          <Link href="/blogg/boende-utlandska-arbetare-bygg-praktisk-guide-2026">vår guide om boende för utländska arbetare i byggbranschen</Link>{' '}
          samt{' '}
          <Link href="/blogg/arbetskraftsinvandring-juni-2026-guide-byggforetag">reglerna kring arbetskraftsinvandring</Link>.
        </li>
        <li>Se över försäkrings- och ansvarsfrågor kopplade till personalboende innan avtal tecknas, enligt{' '}
          <Link href="/blogg/forsakring-ansvar-personalboende-guide-2026">vår guide om försäkring och ansvar</Link>.
        </li>
        <li>
          Jämför blockhyra mot andra lösningar tidigt i processen &ndash; vår{' '}
          <Link href="/blogg/hyra-ut-jamforelse-stayonsite-vs-andra-2026">jämförelse av olika leverantörer</Link>{' '}
          kan vara ett bra stöd.
        </li>
        <li>
          Ha en plan för säsongsvariation, till exempel under sommarmånaderna då bemanningen ofta förändras &ndash; se{' '}
          <Link href="/blogg/sommaruthyrning-montorer-guide-2026">vår guide om sommaruthyrning för montörer</Link>.
        </li>
      </ul>

      <h2>Vanliga frågor</h2>
      <h3>Hur många nya anstaltsplatser planeras totalt i Sverige?</h3>
      <p>
        Kriminalvården planerar en utbyggnad med omkring 11 000 nya fasta platser under en tioårsperiod, vilket mer än fördubblar dagens kapacitet. Utbyggnaden sker etappvis på en rad orter runt om i landet och pågår fram mot mitten av 2030-talet.
      </p>
      <h3>Vilka orter är mest aktuella just nu?</h3>
      <p>
        Trelleborg, Värnamo, Södertälje, Karlskoga, Hisingen och Västervik ingår i ett samlat regeringsbeslut om nya hyresavtal, medan Kristianstad/Vä byggs ut i separata etapper. Flera av dessa orter har begränsad lokal bostadsmarknad, vilket gör personalboende till en central planeringsfråga för entreprenörerna.
      </p>
      <h3>Varför räcker inte lokal arbetskraft till dessa projekt?</h3>
      <p>
        Anstalter i högre säkerhetsklass kräver specialistkompetens inom säkerhetsklassad projektering och byggnation som sällan finns samlad på mindre orter. Byggtiderna är dessutom långa, ofta fyra till sex år, vilket kräver en stabil, inflyttad arbetsstyrka under hela produktionen.
      </p>
      <h3>Hur bör byggföretag planera personalboende för säkerhetsklassade projekt?</h3>
      <p>
        Planeringen bör ske redan i anbudsskedet, med hänsyn till hela byggtiden, lokala bostadsmarknadens begränsningar och eventuella krav på bakgrundskontroller för boendeplatser nära byggarbetsplatsen. Vanligtvis ingår städning, internet och möblering i ett personalboendeavtal; exakt omfattning avtalas alltid per projekt.
      </p>

      <h2>Så kan StayOnSite hjälpa till</h2>
      <p>
        StayOnSite har sedan starten 2016 hjälpt byggföretag att säkra personalboende inför stora, ofta säkerhetskänsliga och långsiktiga projekt &ndash; från infrastruktursatsningar till anstaltsbyggen på mindre orter. Vi arbetar med{' '}
        <strong>0% avgift för husägare</strong>, <strong>garanterad hyra</strong> oavsett beläggning och enbart <strong>professionella hyresgäster</strong> från etablerade byggföretag. Vi återkommer alltid inom en arbetsdag &ndash; ofta inom några timmar &ndash; med en boendeplan, och priser för husägare som hyr ut via oss börjar från <strong>5 900 kr per person och månad</strong>. Läs mer om hur processen går till i{' '}
        <Link href="/blogg/sa-fungerar-det-fran-intresse-till-forsta-hyran">vår guide från intresse till första hyran</Link>{' '}
        eller se svar på vanliga frågor i{' '}
        <Link href="/blogg/personalboende-vanliga-fragor-byggforetag">vår FAQ för byggföretag</Link>. StayOnSite har betyget 5,0 på Google.
      </p>
      <p>
        Planerar ni ett kriminalvårdsprojekt eller ett annat storskaligt bygge och behöver säkra personalboende inför byggstart? Kontakta StayOnSite på{' '}
        <a href="tel:0762498486">076-249 84 86</a>{' '}
        så tar vi fram en boendeplan som matchar era behov. Läs mer på{' '}
        <Link href="/for-foretag">/for-foretag</Link>{' '}
        om ni är ett byggföretag som söker boende, eller på{' '}
        <Link href="/for-husagare">/for-husagare</Link>{' '}
        om ni äger en fastighet och vill hyra ut med garanterad hyra och utan avgift.
      </p>
    </BlogLayout>
  );
};

export default KriminalvardenAnstaltsbyggePersonalboende;
