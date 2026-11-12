import Link from 'next/link';
import { getBlogPost } from '@/data/blog-posts';
import BlogLayout from './BlogLayout';

const BoendeKarnkraftverkRevisionProjekt = () => {
  const post = getBlogPost('boende-karnkraftverk-revision-projekt')!;

  return (
    <BlogLayout post={post}>
      <p>
        Ska ert företag skicka personal till ett kärnkraftverk? <strong>Boende vid kärnkraftverk</strong>{' '}
        skiljer sig från andra projektboenden på två sätt: arbetet är låst till datum som anläggningen
        bestämmer, och ingen börjar arbeta förrän tillträdet är klart. StayOnSite ordnar möblerade hus och
        lägenheter för arbetslag, med hyresperioder från tre månader.
      </p>

      <h2>Revisionen bestämmer datumen, inte ni</h2>
      <p>
        En revisionsavställning har ett fast startdatum och mycket arbete på kort tid. När OKG inledde
        revisionen på Oskarshamn 3 den 19 mars 2026 omfattade den enligt bolaget omkring 2&nbsp;000
        arbetsordrar.{' '}
        <a
          href="https://www.mynewsdesk.com/se/okg/news/revision-2026-en-viktig-pusselbit-foer-framtidens-drift-507304"
          target="_blank"
          rel="noreferrer"
        >
          Läs OKG:s beskrivning av revisionen 2026
        </a>
        . Uppgiften gäller just det året och säger inget om kommande revisioner.
      </p>
      <p>
        För er betyder det att boendet behöver vara bokat när ni vet era datum, även om den sista
        bemanningen inte är klar. Ange hellre ett spann, till exempel sex till åtta personer, och säg vilka
        veckor som är bekräftade av er beställare och vilka som kan tillkomma.
      </p>

      <h2>Räkna in dagarna före första arbetspasset</h2>
      <p>
        Boendet och tillträdet till anläggningen är två separata spår. OKG anger att den som ska arbeta på
        anläggningen behöver tillstånd, rätt tillträdeshandlingar och rätt utbildning, och att alla som ska in
        genomgår kontroller.{' '}
        <a href="https://okg.se/arbeta-pa-okg/for-dig-som-ska-arbeta-pa-okg/" target="_blank" rel="noreferrer">
          Kontrollera de aktuella kraven direkt hos OKG
        </a>
        .
      </p>
      <p>
        Fråga er beställare vilken dag personalen ska vara på plats för inpassering och utbildning, och
        sätt inflyttningen efter den dagen i stället för efter första arbetspasset. StayOnSite ordnar
        boendet; tillträde, kontroller och utbildningar hanteras enligt anläggningens och er arbetsgivares
        rutiner.
      </p>

      <h2>Oskarshamn: OKG och Clab i Simpevarp</h2>
      <p>
        OKG och SKB:s mellanlager Clab ligger i Simpevarp norr om Oskarshamn. Vi har publicerade bostäder i
        Oskarshamns kommun, och valet står oftast mellan Figeholm, som ligger närmare Simpevarp, och
        Oskarshamns tätort med fler bostäder och mer service. Jämförelsen finns i vår artikel om{' '}
        <Link href="/blogg/boende-figeholm-okg-clab">boende i Figeholm för OKG och Clab</Link>, och{' '}
        <Link href="/blogg/personalboende-okg-oskarshamn-guide">guiden till personalboende vid OKG</Link> går
        igenom vad som bör stämmas av före kontrakt.
      </p>
      <p>
        OKG erbjuder också egen logi på Figeholm Konferens för entreprenörer med boendeavtal. Fråga er
        kontaktperson på OKG om ni omfattas innan ni bokar annat boende.{' '}
        <a
          href="https://okg.se/arbeta-pa-okg/for-dig-som-ska-arbeta-pa-okg/bostad-och-fritid/"
          target="_blank"
          rel="noreferrer"
        >
          Läs OKG:s sida om bostad och fritid
        </a>
        .
      </p>
      <p>
        SKB planerar dessutom en inkapslingsanläggning intill Clab. Mark- och miljödomstolen gav
        miljötillstånd i oktober 2024, men bygglov från Oskarshamns kommun återstår och SKB anger ingen
        fast byggstart.{' '}
        <a href="https://skb.se/projekt-for-framtiden/inkapslingsanlaggning/" target="_blank" rel="noreferrer">
          Läs SKB:s information om inkapslingsanläggningen
        </a>
        . Aktuella bostäder visas under{' '}
        <Link href="/stad/oskarshamn#homes">lediga boenden i Oskarshamn</Link>.
      </p>

      <h2>Norrsundet: planerad reaktorpark norr om Gävle</h2>
      <p>
        Blykalla AB har under våren 2026 ansökt hos regeringen om att få bygga en kärnteknisk anläggning i
        Norrsundet i Gävle kommun: en park med sex små modulära reaktorer och en elektrisk effekt på cirka
        330 MWe. Länsstyrelsen Gävleborg har regeringens uppdrag att ta fram ett förslag till anläggningsplan
        och håller samråd till den 13 november 2026. Förslaget ska lämnas till regeringen i december 2026.{' '}
        <a href="https://www.lansstyrelsen.se/gavleborg/samhalle/ny-karnkraft.html" target="_blank" rel="noreferrer">
          Läs Länsstyrelsen Gävleborgs information om samrådet
        </a>
        .
      </p>
      <p>
        En godkänd anläggningsplan är inget tillstånd att bygga eller driva anläggningen. Gävle kommun behöver
        tillstyrka förslaget, och tillstånd från Strålsäkerhetsmyndigheten och Mark- och miljödomstolen
        återstår. Det finns alltså inget byggprojekt att bemanna i dag. Har ni redan uppdrag i området kring
        hamnen eller industrin finns mer i vår artikel om{' '}
        <Link href="/blogg/boende-norrsundet-foretag">boende i Norrsundet för företag</Link>.
      </p>

      <h2>Det här behöver arbetslaget av bostaden</h2>
      <ul>
        <li>
          <strong>Sömn i skift:</strong> egna sovrum när dag- och nattpersonal delar bostad.
        </li>
        <li>
          <strong>Kök och dusch för hela laget:</strong> tillräckligt för att alla ska hinna före och efter
          passet.
        </li>
        <li>
          <strong>Tvätt:</strong> möjlighet att tvätta arbetskläder under hela uppdraget.
        </li>
        <li>
          <strong>Parkering:</strong> plats för både personbilar och servicebilar vid bostaden.
        </li>
        <li>
          <strong>Restid:</strong> mätt från bostaden till den infart där personalen ska inställa sig, vid
          de tider laget faktiskt börjar och slutar.
        </li>
      </ul>

      <h2>Skicka med det här i förfrågan</h2>
      <ul>
        <li><strong>Anläggning och infart:</strong> var personalen ska inställa sig.</li>
        <li><strong>Datum:</strong> dag för inpassering eller utbildning, första arbetspass och beräknat slut. Vi hyr ut från tre månader.</li>
        <li><strong>Personer:</strong> bekräftat antal och hur många som kan tillkomma.</li>
        <li><strong>Skift:</strong> arbetstider och om laget roterar mellan arbetsveckor och ledighet.</li>
        <li><strong>Fordon:</strong> antal personbilar och servicebilar.</li>
        <li><strong>Fakturering:</strong> om boendet ska faktureras per projekt eller per arbetslag.</li>
      </ul>
      <p>
        Vi återkommer med ett boendeförslag för era datum och går igenom läge, pris och vad som ingår innan
        ni bokar.
      </p>

      <h2>Vanliga frågor om boende vid kärnkraftverk</h2>
      {post.faq?.map(({ q, a }) => (
        <div key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}

      <h2>Kontakta oss om boende inför revision eller projekt</h2>
      <p>
        Berätta vilken anläggning det gäller, hur många ni är och när personalen ska vara på plats. Skicka en{' '}
        <Link href="/for-foretag">förfrågan om företagsbostäder och personalboende</Link>, mejla{' '}
        <a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a> eller ring{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default BoendeKarnkraftverkRevisionProjekt;
