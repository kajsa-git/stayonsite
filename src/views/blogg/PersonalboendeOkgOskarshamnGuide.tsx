import Link from 'next/link';
import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';

const PersonalboendeOkgOskarshamnGuide = () => {
  const post = getBlogPost('personalboende-okg-oskarshamn-guide')!;

  return (
    <BlogLayout post={post}>
      <p>
        Företag som söker <strong>boende vid OKG</strong> behöver lösa mer än antal bäddar.
        Restid till Simpevarp, skiftider, parkering, tvätt och vem som får bo var påverkar både
        arbetsmiljön och projektets logistik. Den här guiden hjälper entreprenörer att göra en
        tydlig boendebrief innan de begär offert på personalboende i Oskarshamn.
      </p>

      <h2>Varför efterfrågan kring OKG kommer i tydliga toppar</h2>
      <p>
        Oskarshamn har en koncentration av energi- och industriverksamhet. Kommunen lyfter OKG,
        SKB, Scania, Saft och flera teknikföretag som centrala delar av det lokala näringslivet.{' '}
        <a
          href="https://www.oskarshamn.se/tillvaxt-och-naringsliv/vart-naringslivs-historia-och-framtid/"
          target="_blank"
          rel="noreferrer"
        >
          Oskarshamns kommun beskriver näringslivets struktur
        </a>.
      </p>
      <p>
        Vid en revisionsavställning ökar mängden arbete under en avgränsad period. Under
        revisionen 2026 uppgav OKG att Oskarshamn 3 omfattades av omkring 2&nbsp;000
        arbetsordrar, anläggningsändringar och flera större moderniseringar. Uppgiften beskriver
        just 2026 års revision och ska inte läsas som en prognos för kommande år.{' '}
        <a
          href="https://www.mynewsdesk.com/se/okg/news/revision-2026-en-viktig-pusselbit-foer-framtidens-drift-507304"
          target="_blank"
          rel="noreferrer"
        >
          Läs OKG:s redogörelse för revisionen 2026
        </a>.
      </p>

      <h2>Oskarshamn eller Figeholm – välj efter arbetsplatsen</h2>
      <p>
        Börja med arbetsplatsens faktiska adress. OKG ligger i Simpevarp, norr om Oskarshamns
        tätort. Figeholm är därför ofta relevant när kortare resväg till anläggningen väger tyngst,
        medan centrala Oskarshamn ger närhet till ett större serviceutbud. Vilket alternativ som
        fungerar bäst beror på skift, tillgång på rätt bostadstyp och hur teamet transporteras.
      </p>
      <p>
        Be alltid om adresser innan bokning och kontrollera restiden vid de tider laget faktiskt
        börjar och slutar. Formuleringen ”nära OKG” räcker inte som beslutsunderlag.
      </p>

      <h2>Skilj boendet från OKG:s tillträdeskrav</h2>
      <p>
        En bostadsleverantör kan ordna logi, men ansvarar inte för behörighet till
        kärnkraftverket. OKG anger att den som ska arbeta på anläggningen behöver rätt
        tillträdeshandlingar och utbildningar samt genomgå relevanta kontroller.{' '}
        <a
          href="https://okg.se/arbeta-pa-okg/for-dig-som-ska-arbeta-pa-okg/"
          target="_blank"
          rel="noreferrer"
        >
          Kontrollera alltid de aktuella kraven direkt hos OKG
        </a>.
      </p>
      <p>
        Lägg därför två separata spår i projektplanen: ett för inpassering och utbildning och ett
        för personalboendet. Då blir det tydligt vem som ansvarar för respektive deadline.
      </p>

      <h2>Boendebrief för montörer och revisionsteam</h2>
      <p>Skicka följande uppgifter redan i första förfrågan:</p>
      <ul>
        <li>in- och utflyttningsdatum samt eventuella etapper</li>
        <li>antal personer och krav på eget eller delat sovrum</li>
        <li>arbetsplatsens adress och lagets skifttider</li>
        <li>antal personbilar, servicebilar och eventuella höga fordon</li>
        <li>behov av tvättmaskin, kök, wifi och regelbunden städning</li>
        <li>kontaktperson för ändringar i bemanning och datum</li>
        <li>hur kostnaden ska delas mellan projekt, underentreprenörer eller kostnadsställen</li>
      </ul>
      <p>
        Ett komplett underlag gör det möjligt att jämföra faktiska boendealternativ i stället för
        ett generellt pris per bädd. För större team kan en kombination av hus och lägenheter vara
        mer realistisk än att kräva ett enda objekt.
      </p>

      <h2>Kontrollera detta innan kontraktet skrivs</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <caption className="sr-only">Kontroller före bokning av personalboende vid OKG</caption>
          <thead>
            <tr>
              <th>Kontroll</th>
              <th>Det ska framgå</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Adress och restid</td>
              <td>Exakt adress, parkering och realistisk körväg till arbetsplatsen</td>
            </tr>
            <tr>
              <td>Kapacitet</td>
              <td>Antal personer, sovrum och vilka sängar som får delas</td>
            </tr>
            <tr>
              <td>Kostnad</td>
              <td>Hyra samt vad som ingår i el, värme, wifi, städning och slutstädning</td>
            </tr>
            <tr>
              <td>Förändringar</td>
              <td>Villkor för förlängning, minskat antal personer och ändrade datum</td>
            </tr>
            <tr>
              <td>Ansvar</td>
              <td>Felanmälan, besiktning, nycklar och kontakt utanför kontorstid</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Så undviker ni de vanligaste kostnadsfällorna</h2>
      <p>
        Räkna på hela projektkostnaden, inte bara månadshyran. Lång restid, för få
        parkeringsplatser eller ett kök som inte fungerar för lagets storlek kan bli dyrare än ett
        något högre boendepris. Bekräfta även vilka tillägg som kan uppstå vid förlängning,
        extra städning eller ändrad bemanning.
      </p>
      <p>
        Behöver ni ett konkret förslag kan ni börja på sidan om{' '}
        <Link href="/stad/oskarshamn">företagsboende och personalboende i Oskarshamn</Link>.
        Ange ”OKG/Simpevarp” som arbetsplats och lägg till skiftider i förfrågan.
      </p>

      <h2>Vanliga frågor om boende vid OKG</h2>
      <h3>Är boende i Figeholm alltid bäst för den som arbetar på OKG?</h3>
      <p>
        Inte alltid. Figeholm kan ge ett läge närmare Simpevarp, men bostadens standard,
        kapacitet, parkering och tillgänglighet måste vägas mot alternativ i Oskarshamn.
      </p>
      <h3>Kan StayOnSite ordna inpassering till OKG?</h3>
      <p>
        Nej. Tillträdeshandlingar, kontroller och utbildningar hanteras enligt OKG:s och
        arbetsgivarens rutiner. StayOnSite hjälper till med boendet.
      </p>
      <h3>Hur tidigt bör ett revisionsteam boka?</h3>
      <p>
        Så snart bemanning och ungefärliga datum är kända. Återkommande industristopp skapar
        koncentrerad efterfrågan, och större team behöver ofta kombineras över flera bostäder.
      </p>
    </BlogLayout>
  );
};

export default PersonalboendeOkgOskarshamnGuide;
