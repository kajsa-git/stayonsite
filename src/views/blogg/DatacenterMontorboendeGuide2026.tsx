import Link from 'next/link';
import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import { DATACENTER_PATHS } from '@/data/datacenter';

const DatacenterMontorboendeGuide2026 = () => {
  const post = getBlogPost('datacenter-montorboende-guide-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Boende vid ett datacenterbygge behöver följa entreprenörens bemanning.
        Markarbete, elinstallation, kyla och driftsättning kan ha olika tidsplaner,
        skift och krav på rum. Börja därför med det egna arbetslagets behov,
        även när det övergripande projektet är stort.
      </p>
      <p>
        StayOnSite hjälper företag att söka möblerade hus och lägenheter för
        projektteam. På vår sida för <Link href={DATACENTER_PATHS.sv}>boende för
        datacenterprojekt</Link> kan ni beskriva ort, antal personer, datum och
        krav. Internationella team kan använda vår{' '}
        <Link href={DATACENTER_PATHS.en} hrefLang="en">English data centre accommodation page</Link>.
      </p>

      <h2>Tre områden att utgå från</h2>
      <p>
        Projektuppgifterna nedan är kontrollerade den 27 oktober 2026 mot
        projektägarnas egna uppgifter. De visar var datacenterprojekt finns,
        men säger inte hur många av just ert företags medarbetare som behöver boende.
      </p>
      <ul>
        <li>
          <strong>Horndal–Avesta:</strong> Google meddelade byggstart i Horndal den
          2 juni 2026. Ange rätt infart när ni jämför bostäder i Horndal, Avesta
          och närliggande orter.
        </li>
        <li>
          <strong>Borlänge–Falun:</strong> EcoDataCenter och Mistral AI har
          aviserat ett AI-datacenter i Borlänge med planerad driftstart 2027.
          Bostäder i Borlänge och <Link href="/stad/falun">Falun</Link> behöver
          bedömas utifrån den faktiska arbetsplatsen och skifttiderna.
        </li>
        <li>
          <strong>Gävle–Sandviken:</strong> Microsofts svenska datacenterregion
          omfattar Gävle, Sandviken och Staffanstorp. För uppdrag i{' '}
          <Link href="/stad/gavle">Gävle</Link> eller Sandviken behöver ni ange
          vilken anläggning och entreprenad som berörs.
        </li>
      </ul>
      <p>
        Att en anläggning är planerad, under byggnation eller i drift är olika
        saker. Bemanning, inflyttningsdatum och boendekapacitet behöver alltid
        bekräftas för det aktuella uppdraget. StayOnSite presenteras här som
        boendeförmedlare för projektteam; projektägarnas namn innebär inte en
        avtalsrelation med StayOnSite.
      </p>

      <h2>Planera bäddar efter bemanning, inte efter megawatt</h2>
      <p>
        Ett datacenters effekt eller investeringsbelopp räcker inte för att
        beräkna ert boendebehov. Be projektledningen om antal personer per
        period, vilka som pendlar hem och hur rotationerna fungerar. Notera
        också om nya och avgående arbetslag behöver bo samtidigt vid skiftbyten.
      </p>
      <ul>
        <li>Första inflyttningen: antal personer och antal sovrum.</li>
        <li>Kommande etapper: datum och förväntad högsta bemanning.</li>
        <li>Rotation: vem som bor kvar och när nya medarbetare anländer.</li>
        <li>Avslut: planerad nedtrappning och behov av förlängningsoption.</li>
      </ul>

      <h2>Kontrollera vardagen innan ni bokar</h2>
      <p>
        Jämför restiden från varje bostad till rätt infart. Kontrollera parkering
        för arbetsfordon, möjlighet att laga mat och tvätta samt internet.
        Team som arbetar natt kan behöva en annan rumsfördelning för att kunna
        vila dagtid. Be om tydlig information om vad som ingår i priset.
      </p>
      <p>
        För större arbetslag kan flera hus och lägenheter behöva kombineras.
        Kartlägg vilka som delar bil och vilka som arbetar samma skift.
        Bostäder som ser likvärdiga ut per person kan ge olika total kostnad
        när resor, service och antalet fordon räknas in.
      </p>

      <h2>Stäm av villkoren för varje etapp</h2>
      <p>
        Kontrollera avtalsperiod, uppsägningstid, förlängning, deposition och
        vad som gäller vid skador. Gästbyten och fler personer innebär inte
        automatiskt att antalet hyrda bostäder kan ändras. Städning, linne,
        parkering och andra tjänster ska framgå av offerten.
      </p>
      <p>
        Utse en kontaktperson för ankomster, nycklar och felanmälan. Ange
        företagets fakturauppgifter och projektreferens innan inflyttningen.
      </p>

      <h2>Skicka ert boendebehov till StayOnSite</h2>
      <p>
        Beskriv arbetsplats, antal personer, sovrum, datum, högsta restid och
        praktiska krav. Vi går igenom förutsättningarna och söker relevanta
        alternativ. Tillgänglighet, pris och omfattning bekräftas i offert.
      </p>
      <p>
        <Link href={`${DATACENTER_PATHS.sv}#inquiry`}>Skicka en förfrågan om
        datacenterboende</Link> eller läs mer om{' '}
        <Link href="/projektboende">planering av projektboende</Link>.
      </p>
    </BlogLayout>
  );
};

export default DatacenterMontorboendeGuide2026;
