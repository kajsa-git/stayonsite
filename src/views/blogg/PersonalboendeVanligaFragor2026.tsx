import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const PersonalboendeVanligaFragor2026 = () => {
  const post = getBlogPost('personalboende-vanliga-fragor-byggforetag')!;
  return (
    <BlogLayout post={post}>
      <p>
        Att ordna personalboende för ett byggprojekt är ofta mer komplicerat än det
        verkar. Hur snabbt går det att få platser? Vad ingår? Hur faktureras det?
        De här frågorna dyker upp i nästan varje samtal vi har med nya kunder.
      </p>

      <p>
        Nedan svarar vi på de åtta vanligaste frågorna vi får från byggföretag,
        montageentreprenörer och industrikunder som behöver tillfälligt boende för
        sin personal.
      </p>

      <h2>1. Hur snabbt kan ni ordna boende?</h2>

      <p>
        Det vanligaste kravet vi möter är att boenden behövs igår. Projektet är
        igång, personal är bokad och ingen har löst logistitken.
      </p>

      <p>
        I normalfallet presenterar vi en boendeplan inom 24 timmar - en konkret
        förteckning med tillgängliga adresser, antal sovplatser och pris per
        person. Vid akuta behov kan vi ofta ordna inflyttning under samma vecka.
      </p>

      <p>
        Det förutsätter att vi har tillgång till boenden i rätt stad. Vi täcker
        i dag{' '}
        <Link href="/for-foretag">40+ städer runt om i Sverige</Link>, med extra
        kapacitet i orter med hög projektaktivitet som{' '}
        <Link href="/stad/lulea">Luleå</Link>,{' '}
        <Link href="/stad/boden">Boden</Link>,{' '}
        <Link href="/stad/oskarshamn">Oskarshamn</Link> och{' '}
        <Link href="/stad/gavle">Gävle</Link>.
      </p>

      <p>
        Är ni osäkra på tillgången i en specifik ort. Ring oss direkt på{' '}
        <a href="tel:+46762498486">076-249 84 86</a> så kollar vi omedelbart.
      </p>

      <h2>2. Vad kostar personalboende?</h2>

      <p>
        Priset beror på ort, antal personer och avtalstid. Som riktmärke är
        priset från 6 900 kr per person och månad för ett fullt möblerat boende.
      </p>

      <p>
        Det är alltid billigare än hotell. En enkel hotelövernattning i en mellanstor
        svensk stad kostar 900 till 1 500 kr per natt - det är 27 000 till
        45 000 kr per person och månad. Personalboende via StayOnSite kostar en
        bråkdel av det.
      </p>

      <p>
        Utöver lägre kostnad per natt finns ytterligare fördelar för ett byggföretag:
      </p>

      <ul>
        <li>Personal bor samlat, inte utspridd på tre olika hotell</li>
        <li>Tillgång till kök - lägre kostnader för traktamente och restaurang</li>
        <li>Tvättmaskin ingår - ingen logistik runt tvätt</li>
        <li>Avdragsgilla kostnader som företagsboende</li>
      </ul>

      <p>
        Kontakta oss via formuläret på{' '}
        <Link href="/for-foretag">sidan för företag</Link> för en prisuppgift
        anpassad till er situation.
      </p>

      <h2>3. Vilka städer täcker ni?</h2>

      <p>
        StayOnSite finns i 40+ städer, från Malmö i söder till Luleå i norr. Vi
        har boenden i de flesta orter med aktiv bygg- och industriverkssamhet.
      </p>

      <p>
        Städer med hög efterfrågan just nu inkluderar bland annat:
      </p>

      <ul>
        <li>
          <Link href="/stad/lulea">Luleå</Link> och{' '}
          <Link href="/stad/boden">Boden</Link> - grön industri och
          infrastrukturinvesteringar i Norrbotten
        </li>
        <li>
          <Link href="/stad/oskarshamn">Oskarshamn</Link> - kärnkraft och
          industriprojekt längs Östersjökusten
        </li>
        <li>
          <Link href="/stad/gavle">Gävle</Link> och{' '}
          <Link href="/stad/borlange">Borlänge</Link> - datacenteretablering och
          logistikutbyggnad
        </li>
        <li>
          <Link href="/stad/saffle">Säffle</Link> och övriga Värmland - regional
          infrastruktur och energiprojekt
        </li>
        <li>
          <Link href="/stad/malmo">Malmö</Link>,{' '}
          <Link href="/stad/goteborg">Göteborg</Link> och{' '}
          <Link href="/stad/stockholm">Stockholm</Link> - brett projektunderlag
        </li>
      </ul>

      <p>
        Hittar ni inte er ort i listan. Hör av er ändå. Vi utökar ständigt vår
        täckning utifrån var efterfrågan finns.
      </p>

      <h2>4. Är boendet möblerat?</h2>

      <p>
        Ja. Allt boende vi erbjuder är fullt möblerat och klart att flytta in i.
        Det innebär att ni inte behöver transportera möbler, ordna sängkläder eller
        köpa köksutrustning.
      </p>

      <p>Standard i varje boende:</p>

      <ul>
        <li>Sängar med madrasser och sängkläder</li>
        <li>Fullt utrustat kök - spis, ugn, kyl, frys, mikrovågsugn</li>
        <li>Köksutrustning och porslin</li>
        <li>Tvättmaskin och torktumlare</li>
        <li>Möblerat vardagsrum och matplats</li>
        <li>Bredbandsinternet ingår alltid</li>
      </ul>

      <p>
        Personal kan alltså flytta in med sin personliga bagage. Inget mer behövs.
        Det är ett praktiskt krav vi ställer på alla fastighetsägare vi samarbetar
        med.
      </p>

      <h2>5. Hur fungerar faktureringen?</h2>

      <p>
        Faktureringen är utformad för att passa byggföretagens administrativa behov.
        Ni får en samlad företagsfaktura per adress och månad, inte ett kaos av
        separata kvitton per person.
      </p>

      <p>
        Standardupplägg för fakturering:
      </p>

      <ul>
        <li>Faktura i företagets namn - moms och kostnadsredovisning klar</li>
        <li>10 dagars betalningsvillkor som standard</li>
        <li>Möjlighet till projektmärkning på fakturan för er internredovisning</li>
        <li>Fakturaunderlag visar antal personer, adress och period</li>
      </ul>

      <p>
        Byggföretag med flera parallella projekt kan välja att samla allt på en
        faktura per månad eller hålla projekten separerade. Det anpassar vi utifrån
        hur ni arbetar internt.
      </p>

      <h2>6. Erbjuder ni ramavtal?</h2>

      <p>
        Ja. För kunder med löpande behov av personalboende upprättar vi ramavtal
        med förhandlade villkor. Det innebär att ni kan avopa boenden löpande utan
        att förhandla pris och villkor varje gång ett nytt projekt startar.
      </p>

      <p>
        Ett ramavtal innehåller typiskt:
      </p>

      <ul>
        <li>Pristak eller fastpris per person och natt/månad</li>
        <li>Garanter runt tillgänglighet och leveranstid</li>
        <li>Avropsbara platser i prioriterade städer</li>
        <li>Möjlighet att lägga till städer under avtalstiden</li>
      </ul>

      <p>
        Ramavtal passar byggbolag, bemanningsföretag och industriföretag som
        regelbundet behöver flytta personal runt om i landet. Kontakta oss på{' '}
        <a href="mailto:info@stayonsite.se">info@stayonsite.se</a> för att
        diskutera villkor.
      </p>

      <h2>7. Kan ni kommunicera med utländska arbetslag?</h2>

      <p>
        Det är en fråga vi får allt oftare. En stor andel av de yrkesarbetare som
        rör sig runt svenska byggprojekt talar inte svenska - ofta polska, ukrainska,
        litauiska eller engelska.
      </p>

      <p>
        Vi kommunicerar löpande via WhatsApp, som fungerar på alla telefoner och
        alla språk. Vid behov använder vi AI-stödd översättning för att säkerställa
        att boendeinformation och praktiska instruktioner når fram korrekt.
      </p>

      <p>
        Inflyttningsinstruktioner, regler och kontaktuppgifter kan vi ta fram på
        det språk som er personal förstår. Det minskar friktion och missförstånd
        vid inflyttning.
      </p>

      <p>
        Har ni ett internationellt lag som ska till en specifik ort. Berätta det
        när ni hör av er, så förbereder vi kommunikationen på rätt språk.
      </p>

      <h2>8. Vad är minsta avtalstid?</h2>

      <p>
        Minsta avtalstid per boende är tre månader. Det är den kortaste period som
        fungerar ekonomiskt för fastighetsägarna vi samarbetar med, och det ger er
        som kund den stabilitet ni behöver för ett seriöst projekt.
      </p>

      <p>
        Kortare projekt - under tre månader - är svårare att lösa via vår
        plattform. I de fallen rekommenderar vi att ni hör av er ändå, så kan vi
        bedöma situationen och eventuellt hitta en lösning.
      </p>

      <p>
        Övre gräns för avtalstid finns inte. Vi har kunder med löpande projekt
        som haft samma adresser i 18 till 24 månader.
      </p>

      <h2>Fler frågor?</h2>

      <p>
        De flesta frågor löser sig snabbast via ett kort telefonsamtal. Ring Kajsa
        direkt på{' '}
        <a href="tel:+46762498486">076-249 84 86</a> eller skicka en förfrågan via{' '}
        <Link href="/for-foretag">formuläret på företagssidan</Link>.
      </p>

      <p>
        Vill du veta mer om hur personalboende fungerar rent allmänt rekommenderar
        vi vår{' '}
        <Link href="/blogg/personalboende-guide-2026">
          kompletta guide till personalboende 2026
        </Link>. Den täcker allt från kollektivavtalskrav till vad som faktiskt
        ingår i ett välskött boende.
      </p>
    </BlogLayout>
  );
};

export default PersonalboendeVanligaFragor2026;
