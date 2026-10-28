import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ForetagsbostaderGavleGuide2026 = () => {
  const post = getBlogPost('foretagsbostader-gavle-rattscentrum-nyhamn-guide-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Företag som söker <strong>företagsbostäder</strong> i <Link href="/stad/gavle">Gävle</Link> behöver
        utgå från sitt eget projekts arbetsplats, bemanning och tidsplan. Häktet i Kungsbäck är ett beslutat projekt,
        medan Nyhamn och dubbelspåret Gävle&ndash;Kringlan fortfarande planeras. Här går vi igenom projektens läge
        och vad som är bra att kontrollera inför en boendeförfrågan.
      </p>

      <h2>Planerade och pågående projekt i Gävle</h2>
      <p>
        Gävle kommun beskriver själva att staden står inför en rad infrastruktursatsningar och
        stadsomvandlingsprojekt i{' '}
        <a href="https://www.gavle.se/bygga-trafik-och-miljo/detaljplaner-byggprojekt-och-driftinformation/vara-pagaende-och-planerade-projekt/trafikpusslet-i-gavle-stora-infrastruktursatsningar-till-ar-2040/" target="_blank" rel="noreferrer">Gävle kommun &ndash; Trafikpusslet i Gävle</a>,
        där kommunen planerar satsningar i 20-miljardersklassen baserat på ett avtal mellan staten, Region Gävleborg
        och Gävle kommun.
      </p>
      <p>
        En av de större satsningarna är rättscentrumet i Kungsbäck. Enligt{' '}
        <a href="https://www.intea.se/sv/polismyndigheten-tilldelar-intea-polishusprojekt-i-gavle/" target="_blank" rel="noreferrer">Intea</a>{' '}
        planeras rättscentrumet omfatta cirka 55 000 kvadratmeter och ligga i Kungsbäck intill E4. Fastighetsbolaget
        Intea är byggherre för häktet, och enligt{' '}
        <a href="https://www.byggvarlden.se/klartecken-for-nytt-hakte/" target="_blank" rel="noreferrer">Byggvärlden</a>{' '}
        har Kriminalvården tagit ett genomförandebeslut för häktet, med drygt 180 platser och NCC som
        huvudentreprenör. Kriminalvården och Intea har även tecknat ett 25-årigt hyresavtal som godkänts av
        regeringen. <a href="https://www.intea.se/sv/fastigheter/pagaende-projekt/" target="_blank" rel="noreferrer">Intea</a>{' '}
        anger att häktet är i produktion och beräknas färdigställas under andra kvartalet 2030.
      </p>
      <p>
        Kriminalvården har också undersökt en ny anstalt i Ersbo syd. Enligt{' '}
        <a href="https://www.gavle.se/nyhetergavlekommun/kriminalvarden-utreder-ny-tomt-i-gavle/" target="_blank" rel="noreferrer">Gävle kommun</a>{' '}
        ligger den aktuella tomten i företagsområdet Ersbo syd, och om satsningen blir verklighet kan den ge omkring
        250 arbetstillfällen i en anstalt i säkerhetsklass 2 med minst 500 platser, som också ska kunna växa till
        dubbla storleken. Kommunen beskrev projektet som en förstudie i november 2025. Kontrollera det aktuella läget
        innan ni planerar boende för projektet.
      </p>
      <p>
        Samtidigt pågår planeringen av stadsdelen Nyhamn, som enligt{' '}
        <a href="https://www.gavle.se/bygga-trafik-och-miljo/detaljplaner-byggprojekt-och-driftinformation/vara-pagaende-och-planerade-projekt/nyhamn-stadsdelen-som-vagar/" target="_blank" rel="noreferrer">Gävle kommun</a>{' '}
        är första etappen av projektet Näringen. Kommunfullmäktige beslutade om visionen för Nyhamn våren 2025.
        Kommunen anger att byggstarten beror på när marknaden är redo och det finns behov av bostäder.
      </p>
      <p>
        <a href="https://www.trafikverket.se/vara-projekt/projekt-i-gavleborgs-lan/gavlekringlan-axmartavlan-nytt-dubbelspar-ostkustbanan-norra-stambanan-och-bergslagsbanan/" target="_blank" rel="noreferrer">Trafikverket</a>{' '}
        planerar ett nytt dubbelspår mellan Gävle och Kringlan. Projektet ingår i den nationella transportplanen
        2026&ndash;2037, men väg- och järnvägsplanerna behöver revideras utifrån ändrad omfattning och finansiering.
        Trafikverkets projektsida anger ännu ingen ny byggstart. Enligt{' '}
        <a href="https://www.trafikverket.se/vara-projekt/projekt-i-gavleborgs-lan/gavlekringlan-axmartavlan-nytt-dubbelspar-ostkustbanan-norra-stambanan-och-bergslagsbanan/nyheter-for-gavlekringlan-axmartavlan-nytt-dubbelspar-ostkustbanan/2026/regeringen-inkluderar-gavlekringlan-i-transportplanen-20262037/" target="_blank" rel="noreferrer">Trafikverkets besked om transportplanen</a>{' '}
        skulle en station i Gävle Västra kräva extern finansiering.
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
              <td>Häkte i Kungsbäck</td>
              <td>Genomförandebeslut, NCC huvudentreprenör</td>
              <td>Beräknat färdigställande andra kvartalet 2030 enligt Intea</td>
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
              <td>Planering och utredning, del av nationell plan 2026&ndash;2037</td>
              <td>Planerna revideras; någon ny byggstart anges ännu inte</td>
              <td>Gävle C &ndash; Tolvforsskogen &ndash; Kringlan</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Vad projekten kan betyda för personalboende</h2>
      <p>
        Större projekt kan innebära behov av boende för entreprenörer, underentreprenörer och konsulter. Hur stort
        behovet blir beror på bemanningen och vilka som pendlar. De planerade projekten har olika förutsättningar,
        så kontrollera aktuell tidsplan och efterfrågan innan ni reserverar bostäder.
      </p>
      <p>
        Bostadsbeståndet säger inte vilka möblerade bostäder som är lediga under en viss projektperiod. Fråga därför
        efter tillgänglighet, antal sovrum och villkor för just de datum och den plats som ert arbetslag behöver.
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
          den planerade järnvägssträckningen kring Gävle C.
        </li>
        <li>
          <strong>Avtalslängd mot projektfas.</strong> Matcha hyresperioden mot arbetslagets behov och kontrollera
          villkor för förlängning. StayOnSite erbjuder boende från tre månader.
        </li>
        <li>
          <strong>Kapacitet att skala upp och ned.</strong> Bemanningstoppar uppstår ofta i samband med leveranser
          eller särskilda arbetsmoment. Stäm av vilka möjligheter som finns att ändra antalet bostäder under avtalet.
        </li>
        <li>
          <strong>Standard och vad som ingår.</strong> Kontrollera möblering, internet och städning. Omfattningen
          avtalas per projekt och bör specificeras skriftligt innan inflyttning.
        </li>
        <li>
          <strong>Ansvar och avtalsvillkor.</strong> Tydliggör vem som ansvarar för skador, försäkring och eventuell
          andrahandsuthyrning &ndash; se vår{' '}
          <Link href="/blogg/checklista-personalboende-boendebrief">checklista för personalboende och boendebrief</Link>{' '}
          för en komplett genomgång.
        </li>
      </ul>

      <h2>Så planerar ni boendet inför ett projekt</h2>
      <p>
        Börja med arbetslagets behov och kontrollera vad som faktiskt är tillgängligt under projektperioden.
        Tre praktiska steg hjälper er att jämföra alternativen:
      </p>
      <ul>
        <li>
          Börja planera när arbetsplats, ungefärlig bemanning och datum är kända. Bekräfta projektets senaste
          tidsplan innan ni bokar.
        </li>
        <li>
          Beskriv antal personer och boendeperiod per projektfas, inklusive behov av egna rum och parkering.
        </li>
        <li>
          Kontrollera möjlighet till förlängning och hur villkoren påverkas om projektet försenas eller bemanningen
          ändras.
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
        Börja när arbetsplats, ungefärlig bemanning och datum är kända. Kontrollera projektets aktuella tidsplan
        och bostädernas tillgänglighet innan ni bokar.
      </p>
      <h3>Finns det risk för bostadsbrist i Gävle på grund av de stora projekten?</h3>
      <p>
        Det går inte att avgöra från projektplanerna ensamma. Tillgången på möblerade bostäder kan variera med
        läge och period, så kontrollera alternativ för ert arbetslag innan ni bokar.
      </p>
      <h3>Kan man blockhyra bostäder nära både Kungsbäck och Nyhamn samtidigt?</h3>
      <p>
        Det kan vara möjligt, beroende på tillgänglighet och företagets behov. Jämför adresser, restid och villkor
        för varje arbetsplats innan ni väljer en eller flera bostäder.
      </p>
      <h3>Vad ingår normalt i en företagsbostad i Gävle?</h3>
      <p>
        Det varierar mellan bostäder och avtal. Be om en skriftlig specifikation av möblering, internet, städning
        och övrig service, samt ansvarsfördelning för skador och försäkring.
      </p>

      <p>
        StayOnSite hjälper företag att söka personalboende i Gävle från tre månader. Ring 076-249 84 86 eller besök{' '}
        <Link href="/for-foretag">StayOnSite för företag</Link> för att få en boendeplan som matchar er tidsplan.
      </p>
    </BlogLayout>
  );
};

export default ForetagsbostaderGavleGuide2026;
