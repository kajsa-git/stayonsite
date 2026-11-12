import Link from 'next/link';
import { getBlogPost } from '@/data/blog-posts';
import BlogLayout from './BlogLayout';

const BoendeFigeholmOkgClab = () => {
  const post = getBlogPost('boende-figeholm-okg-clab')!;

  return (
    <BlogLayout post={post}>
      <p>
        Söker ni <strong>boende i Figeholm</strong> för personal som ska arbeta på OKG eller Clab? Figeholm är
        ofta det första alternativet att jämföra med Oskarshamn när kort resväg till Simpevarp väger tyngst.
        StayOnSite ordnar möblerade hus och lägenheter för arbetslag i hela Oskarshamns kommun, med
        hyresperioder från tre månader.
      </p>

      <h2>Var ligger Figeholm i förhållande till OKG?</h2>
      <p>
        Figeholm är en ort i Oskarshamns kommun, knappt två mil norr om Oskarshamns stad. Enligt kommunen
        är det bara några kilometer därifrån till OKG, som är en av länets största arbetsplatser.{' '}
        <a
          href="https://www.oskarshamn.se/bygga-bo-miljo/samhallsplanering-kart--och-mattjanster/mark-och-exploatering/planlagd-mark-for-bostader-med-havsutsikt-i-figeholm/"
          target="_blank"
          rel="noreferrer"
        >
          Läs Oskarshamns kommuns beskrivning av Figeholm
        </a>.
      </p>
      <p>
        Det betyder inte att Figeholm alltid är det bästa valet. Utgå från den infart och mötesplats där
        personalen ska inställa sig, och kontrollera restiden vid de tider laget faktiskt börjar och slutar.
        Ett större hus i Oskarshamn kan fungera bättre än flera mindre bostäder i Figeholm om hela laget ändå
        åker tillsammans.
      </p>

      <h2>Figeholm eller Oskarshamn – så jämför ni</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <caption className="sr-only">Jämförelse mellan boende i Figeholm och i Oskarshamn</caption>
          <thead>
            <tr>
              <th>Fråga</th>
              <th>Figeholm</th>
              <th>Oskarshamn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Resväg till Simpevarp</td>
              <td>Kortare för de flesta adresser</td>
              <td>Längre, räkna med daglig bilresa</td>
            </tr>
            <tr>
              <td>Utbud av bostäder</td>
              <td>Mindre ort, färre lediga hus samtidigt</td>
              <td>Fler hus och lägenheter att välja mellan</td>
            </tr>
            <tr>
              <td>Vardag efter jobbet</td>
              <td>Mindre samhälle; stäm av inköp och service före inflytt</td>
              <td>Butiker och service i tätorten</td>
            </tr>
            <tr>
              <td>Passar ofta</td>
              <td>Skiftlag på OKG eller Clab som vill minimera restiden</td>
              <td>Större lag, uppdrag på flera platser eller arbete inne i stan</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        För större revisionslag kan en kombination vara mer realistisk: en del av laget i Figeholm och resten i Oskarshamn.
        Se fler lägen att jämföra, bland annat Fårbo och Mönsterås, på vår sida om{' '}
        <Link href="/stad/oskarshamn">företagsboende i Oskarshamn</Link>.
      </p>

      <h2>OKG:s egen logi på Figeholm Konferens</h2>
      <p>
        Kontrollera först om ni omfattas av OKG:s eget erbjudande. OKG erbjuder logi på Figeholm Konferens,
        knappt tio minuters bilresa från anläggningen, med stugor i olika storlekar, camping och ett mindre
        hotell. Entreprenörer som har boendeavtal med OKG debiteras enligt OKG 130 kronor per natt
        inklusive moms. Priset gäller inte vid arbete med avvecklingen av O1 och O2, och anläggningen kan
        låta gäster dela boende.{' '}
        <a
          href="https://okg.se/arbeta-pa-okg/for-dig-som-ska-arbeta-pa-okg/bostad-och-fritid/"
          target="_blank"
          rel="noreferrer"
        >
          Läs OKG:s sida om bostad och fritid
        </a>
        . Villkoren kan ändras, så stäm av dem med er kontaktperson på OKG.
      </p>
      <p>
        Har ni ett sådant avtal och får plats är det svårt att hitta något billigare. Ett eget hus eller en
        egen lägenhet via StayOnSite passar när ni inte omfattas av avtalet, när platserna är slut under
        revisionen, eller när laget ska bo tillsammans i en egen bostad under en längre period. Vi hyr ut
        från tre månader.
      </p>

      <h2>Boende för revision och skiftarbete</h2>
      <p>
        När dag- och nattpersonal delar bostad räcker det inte med tillräckligt många bäddar. Egna sovrum,
        flera duschar, ett kök som räcker för hela laget och möjlighet att tvätta arbetskläder gör stor skillnad
        under ett längre uppdrag. Ange också hur många bilar och servicebilar som behöver parkering.
      </p>
      <p>
        Boendet och tillträdet till anläggningen är två separata spår. OKG anger att den som ska arbeta på
        anläggningen behöver rätt tillträdeshandlingar och utbildningar.{' '}
        <a href="https://okg.se/arbeta-pa-okg/for-dig-som-ska-arbeta-pa-okg/" target="_blank" rel="noreferrer">
          Kontrollera de aktuella kraven direkt hos OKG
        </a>
        . Vår{' '}
        <Link href="/blogg/personalboende-okg-oskarshamn-guide">guide till personalboende vid OKG</Link> går
        igenom vad ni bör stämma av innan kontraktet skrivs.
      </p>

      <h2>Clab och den planerade inkapslingsanläggningen</h2>
      <p>
        SKB:s mellanlager Clab ligger också i Simpevarp. SKB planerar att bygga en inkapslingsanläggning direkt
        intill Clab; tillsammans ska anläggningarna kallas Clink. Mark- och miljödomstolen gav miljötillstånd i
        oktober 2024, men ett bygglov från Oskarshamns kommun återstår och SKB har inte satt något fast datum för
        byggstart. Enligt SKB hoppas bolaget kunna börja bygga under senare halvan av 2020-talet.{' '}
        <a href="https://skb.se/projekt-for-framtiden/inkapslingsanlaggning/" target="_blank" rel="noreferrer">
          Läs SKB:s information om inkapslingsanläggningen
        </a>
        .
      </p>
      <p>
        Har ni ett eget uppdrag kopplat till Clab eller Clink, utgå från den tidplan och bemanning som er
        beställare har bekräftat. Ett planerat projekt säger inte i sig när det finns ett konkret boendebehov.
      </p>

      <h2>Vad behöver ni skicka med i en förfrågan?</h2>
      <ul>
        <li><strong>Arbetsplats:</strong> anläggning, infart eller mötesplats i Simpevarp.</li>
        <li><strong>Period:</strong> inflyttning, ungefärligt slutdatum och eventuella etapper. Vi hyr ut från tre månader.</li>
        <li><strong>Personer och rum:</strong> antal personer och om alla behöver eget sovrum.</li>
        <li><strong>Skift:</strong> arbetstider och om laget roterar mellan arbetsveckor och ledighet.</li>
        <li><strong>Fordon:</strong> antal personbilar och servicebilar som ska stå vid bostaden.</li>
        <li><strong>Läge:</strong> om ni måste bo i Figeholm eller kan jämföra med Oskarshamn och Fårbo.</li>
      </ul>
      <p>
        Vi tar fram ett boendeförslag med de bostäder som finns för er period och går igenom läge, pris och vad
        som ingår innan ni bokar. Publicerade boenden i området visas under{' '}
        <Link href="/stad/oskarshamn#homes">lediga boenden i Oskarshamn</Link>.
      </p>

      <h2>Vanliga frågor om boende i Figeholm</h2>
      {post.faq?.map(({ q, a }) => (
        <div key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}

      <h2>Kontakta oss om boende i Figeholm</h2>
      <p>
        Berätta var ni ska arbeta, hur många ni är och när ni behöver flytta in. Skicka en{' '}
        <Link href="/for-foretag">förfrågan om företagsboende</Link>, mejla{' '}
        <a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a> eller ring{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default BoendeFigeholmOkgClab;
