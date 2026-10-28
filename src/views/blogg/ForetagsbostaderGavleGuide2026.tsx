import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ForetagsbostaderGavleGuide2026 = () => {
  const post = getBlogPost('foretagsbostader-gavle-rattscentrum-nyhamn-guide-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Byggföretag bokar <strong>företagsbostäder</strong> i Gävle genom blockhyra eller en personalboendeleverantör,
        helst 6&ndash;12 månader före byggstart. Orsaken är att flera stora projekt pågår samtidigt och konkurrerar om
        samma hyresmarknad: häktesbygget i Kungsbäck, stadsutvecklingen på Nyhamn och dubbelspåret på Ostkustbanan
        löper delvis parallellt fram mot 2030-talet. Den som väntar till några veckor före projektstart riskerar att
        hitta ett tomt eller överbokat läge i <Link href="/stad/gavle">Gävle</Link>. Nedan går vi igenom vilka projekt
        som driver efterfrågan och hur ni säkrar boende i tid.
      </p>

      <h2>Gävle mitt i en byggvåg</h2>
      <p>
        Gävle kommun beskriver själva att staden står inför en rad infrastruktursatsningar och
        stadsomvandlingsprojekt i{' '}
        <a href="https://www.gavle.se/bygga-trafik-och-miljo/detaljplaner-byggprojekt-och-driftinformation/vara-pagaende-och-planerade-projekt/trafikpusslet-i-gavle-stora-infrastruktursatsningar-till-ar-2040/" target="_blank" rel="noreferrer">Gävle kommun &ndash; Trafikpusslet i Gävle</a>,
        där kommunen planerar satsningar i 20-miljardersklassen baserat på ett avtal mellan staten, Region Gävleborg
        och Gävle kommun.
      </p>
      <p>
        En av de tyngsta delarna är det nya rättscentrumet i Kungsbäck. Enligt{' '}
        <a href="https://www.gd.se/gavle/klart-nytt-rattscentrum-med-polishus-och-hakte-i-kungsback/" target="_blank" rel="noreferrer">Gefle Dagblad</a>{' '}
        blir rättscentrumet totalt 55 000 kvadratmeter och ligger i Kungsbäck intill E4 och E16. Fastighetsbolaget
        Intea är byggherre för häktet, och enligt{' '}
        <a href="https://www.byggvarlden.se/klartecken-for-nytt-hakte/" target="_blank" rel="noreferrer">Byggvärlden</a>{' '}
        har Kriminalvården tagit ett genomförandebeslut för häktet, med drygt 180 platser och NCC som
        huvudentreprenör. Kriminalvården och Intea har även tecknat ett 25-årigt hyresavtal som godkänts av
        regeringen.
      </p>
      <p>
        Parallellt utreder Kriminalvården en helt ny anstalt i Ersbo syd. Enligt{' '}
        <a href="https://www.gavle.se/nyhetergavlekommun/kriminalvarden-utreder-ny-tomt-i-gavle/" target="_blank" rel="noreferrer">Gävle kommun</a>{' '}
        ligger den aktuella tomten i företagsområdet Ersbo syd, och om satsningen blir verklighet kan den ge omkring
        250 arbetstillfällen i en anstalt i säkerhetsklass 2 med minst 500 platser, som också ska kunna växa till
        dubbla storleken. Detta är i dagsläget en förstudie, inte ett byggbeslut, men det visar på den samlade volymen
        av kriminalvårds- och rättsväsendeprojekt i staden.
      </p>
      <p>
        Samtidigt pågår planeringen av stadsdelen Nyhamn, som enligt{' '}
        <a href="https://www.gavle.se/bygga-trafik-och-miljo/detaljplaner-byggprojekt-och-driftinformation/vara-pagaende-och-planerade-projekt/nyhamn-stadsdelen-som-vagar/" target="_blank" rel="noreferrer">Gävle kommun</a>{' '}
        är första etappen av projektet Näringen, tänkt att bli en av Europas hållbaraste stadsdelar. Enligt kommunens
        avtal för Näringen ska Gävle kommun bygga en ny hållbar stadsdel med 6 000 bostäder över flera etapper, där
        Nyhamn är den första. Ett beslut om visionen för etappen togs i kommunfullmäktige våren 2025.
      </p>
      <p>
        Till detta kommer järnvägsutbyggnaden. Trafikverket planerar nytt dubbelspår på sträckan
        Gävle&ndash;Kringlan och beskriver i sitt planeringsunderlag att{' '}
        <a href="https://bransch.trafikverket.se/contentassets/019279a1b15d495eb81bf72d7f103996/informationsfolder-gavle-c-tolvforsskogen_tillganglighetsanpassad.pdf" target="_blank" rel="noreferrer">Trafikverket &ndash; Järnvägsplan Ostkustbanan Gävle&ndash;Kringlan</a>{' '}
        järnvägen behöver byggas ut i två etapper, 2027&ndash;2032 och 2031&ndash;2036, för att tågtrafik ska kunna gå
        under hela byggtiden. En ny regional tågstation, Gävle Västra, planeras i anslutning till sjukhusområdet
        enligt samma underlag.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <thead>
            <tr>
              <th>Projekt</th>
              <th>Fas (okt 2026)</th>
              <th>Ungefärlig tidsperiod</th>
              <th>Läge i Gävle</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rättscentrum (polishus + häkte)</td>
              <td>Genomförandebeslut, NCC huvudentreprenör för häktet</td>
              <td>Byggnation pågående in i 2027&ndash;2028</td>
              <td>Kungsbäck, vid E4/E16</td>
            </tr>
            <tr>
              <td>Nyhamn (etapp 1 av Näringen)</td>
              <td>Planprogram, vision beslutad i kommunfullmäktige 2025</td>
              <td>Byggstart ej fastställd, planering pågår</td>
              <td>Alderholmen/Näringen, centrala Gävle</td>
            </tr>
            <tr>
              <td>Dubbelspår Gävle&ndash;Kringlan</td>
              <td>Järnvägsplan, del av nationell plan 2026&ndash;2037</td>
              <td>Byggtid i två etapper 2027&ndash;2032 och 2031&ndash;2036</td>
              <td>Gävle C &ndash; Tolvforsskogen &ndash; Kringlan</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Vad det betyder för behovet av personalboende 2026&ndash;2030</h2>
      <p>
        När häktesbygget, stadsdelsutvecklingen på Nyhamn och järnvägsplaneringen löper över delvis samma år uppstår
        perioder då flera entreprenörer, underentreprenörer och konsulter ska bo i samma stad samtidigt. Det handlar
        inte bara om byggarbetare på plats, utan även om projektledning, besiktningspersonal och leverantörer som
        roterar in under kortare perioder. Gävle kommun är dessutom, enligt Boverkets regionala analys, den enda
        kommunen i länet som ökade sin befolkning under 2024, enligt{' '}
        <a href="https://www.boverket.se/contentassets/1a53e212b3214d54ab50aec70135d4ea/bostadsmarknadsanalys-2025-gavleborgs-lan.pdf" target="_blank" rel="noreferrer">Boverket &ndash; Analys av bostadsmarknaden i Gävleborg 2025</a>,
        medan övriga kommuner i länet minskade. Det gör att den ordinarie hyresmarknaden redan möter efterfrågan från
        inflyttning, innan projektboendet läggs ovanpå.
      </p>
      <p>
        Samma rapport visar att Gävle har flest hyresrätter i länet, 25 528 av länets totalt 60 957, vilket ger ett
        bredare utbud än i många mindre orter &ndash; men det betyder inte att lägenheter automatiskt finns
        tillgängliga för blockhyra under exakt de veckor ett byggprojekt behöver dem. Praktisk slutsats: boka inte
        utifrån det totala beståndet, utan utifrån hur många lediga objekt som faktiskt kan blockhyras under er
        specifika byggperiod.
      </p>
      <p>
        För byggföretag som planerar bemanning över flera år är det värt att jämföra med hur andra orter med stora
        statliga och kommunala satsningar hanterar samma utmaning, se vår{' '}
        <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">guide till infrastrukturplanen 2026&ndash;2037</Link>{' '}
        för en bredare bild av var i landet konkurrensen om personalboende väntas bli som hårdast.
      </p>

      <h2>Fem faktorer byggföretag bör väga in vid val av boende i Gävle</h2>
      <ul>
        <li>
          <strong>Läge i förhållande till arbetsplatsen.</strong> Boende nära Kungsbäck passar häktes- och
          polishusprojektet, medan boende centralt i <Link href="/stad/gavle">Gävle</Link> ligger närmare Nyhamn och
          järnvägsarbetena kring Gävle C.
        </li>
        <li>
          <strong>Avtalslängd mot projektfas.</strong> Matcha avtalet mot den fas projektet befinner sig i &ndash; en
          kort byggfas kräver kortare, flexibla avtal, medan flerårsprojekt som dubbelspåret motiverar längre
          blockhyresavtal.
        </li>
        <li>
          <strong>Kapacitet att skala upp och ned.</strong> Bemanningstoppar uppstår ofta i samband med leveranser
          eller särskilda arbetsmoment. Boendet bör kunna växa och krympa utan att hela avtalet omförhandlas.
        </li>
        <li>
          <strong>Standard och vad som ingår.</strong> Vanligtvis ingår städning, internet och möblering i en
          företagsbostad; exakt omfattning avtalas per projekt och bör specificeras skriftligt innan inflyttning.
        </li>
        <li>
          <strong>Ansvar och avtalsvillkor.</strong> Tydliggör vem som ansvarar för skador, försäkring och eventuell
          andrahandsuthyrning &ndash; se vår{' '}
          <Link href="/blogg/checklista-personalboende-boendebrief">checklista för personalboende och boendebrief</Link>{' '}
          för en komplett genomgång.
        </li>
      </ul>

      <h2>Så undviker ni att stå utan boende när flera projekt konkurrerar om samma bostadsmarknad</h2>
      <p>
        Den praktiska risken i Gävle de kommande åren är inte att bostäder saknas totalt, utan att rätt typ av boende
        &ndash; nära rätt arbetsplats, med rätt avtalslängd &ndash; är upptaget när ert projekt startar. Tre åtgärder
        minskar den risken:
      </p>
      <ul>
        <li>
          Boka boendeplan så snart byggstart är satt, inte när personalen redan ska flytta in. En leverantör som
          svarar snabbt ger er tid att jämföra alternativ innan konkurrerande projekt hinner teckna samma lägenheter.
        </li>
        <li>
          Separera kortsiktigt behov (besiktning, uppstartsveckor) från långsiktigt behov (hela byggfasen) i samma
          förfrågan, så att leverantören kan föreslå en kombination av lösningar istället för en enda avtalstyp.
        </li>
        <li>
          Räkna med överlappande projekt i tidsplaneringen &ndash; som tabellen ovan visar pågår häktesbygget,
          Nyhamns planering och järnvägsarbetena under delvis samma år, vilket gör att marknaden kan vara mer
          ansträngd 2027&ndash;2032 än den är idag.
        </li>
      </ul>

      <h2>Checklista inför bokning av företagsbostäder i Gävle</h2>
      <ul>
        <li>Är läget rimligt pendlingsavstånd från er specifika arbetsplats (Kungsbäck, Nyhamn eller spårsträckan)?</li>
        <li>Matchar avtalslängden projektets faktiska tidsplan, inklusive eventuell förlängning?</li>
        <li>Finns skriftlig specifikation av vad som ingår &ndash; städning, internet, möblering, parkering?</li>
        <li>Går boendet att skala upp vid bemanningstoppar utan nytt upphandlingsförfarande?</li>
        <li>Är ansvarsfördelning för skador och försäkring tydligt reglerad i avtalet?</li>
        <li>Hur snabbt kan leverantören lämna en konkret boendeplan efter förfrågan?</li>
      </ul>

      <h2>Vanliga frågor</h2>
      <h3>När bör byggföretag börja boka personalboende i Gävle?</h3>
      <p>
        Så snart byggstart och ungefärlig bemanningskurva är kända, helst 6&ndash;12 månader i förväg. Med flera
        stora projekt som delvis överlappar i tid minskar sannolikheten att hitta rätt läge och avtalslängd ju
        närmare byggstart ni väntar.
      </p>
      <h3>Finns det risk för bostadsbrist i Gävle på grund av de stora projekten?</h3>
      <p>
        Boverkets bostadsmarknadsanalys visar generellt ingen länsövergripande bostadsbrist, men efterfrågan varierar
        kraftigt mellan centralorten och övriga kommunen. Den praktiska risken för byggföretag handlar mer om att
        rätt typ av objekt &ndash; nära rätt arbetsplats, under rätt period &ndash; kan vara upptaget, inte att
        bostäder helt saknas.
      </p>
      <h3>Kan man blockhyra bostäder nära både Kungsbäck och Nyhamn samtidigt?</h3>
      <p>
        Ja, men det kräver ofta två separata lösningar eftersom avstånden och arbetsplatserna skiljer sig åt. Många
        byggföretag kombinerar boende nära Kungsbäck för häktes- och polishuspersonal med boende mer centralt i{' '}
        <Link href="/stad/gavle">Gävle</Link> för personal kopplad till Nyhamn och järnvägsarbetena.
      </p>
      <h3>Vad ingår normalt i en företagsbostad i Gävle?</h3>
      <p>
        Vanligtvis ingår möblering, städning och internetuppkoppling; exakt omfattning avtalas per projekt och bör
        alltid specificeras i avtalet innan inflyttning, tillsammans med ansvarsfördelning för skador och försäkring.
      </p>

      <p>
        StayOnSite hjälper byggföretag att boka personalboende inför projekt kring rättscentrum, Nyhamn och
        Ostkustbanan i Gävle. Ring 076-249 84 86 eller besök{' '}
        <Link href="/for-foretag">StayOnSite för företag</Link> för att få en boendeplan som matchar er tidsplan.
      </p>
    </BlogLayout>
  );
};

export default ForetagsbostaderGavleGuide2026;
