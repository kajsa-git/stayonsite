import Link from 'next/link';
import { getBlogPost } from '@/data/blog-posts';
import BlogLayout from './BlogLayout';

const BoendeNorrsundetForetag = () => {
  const post = getBlogPost('boende-norrsundet-foretag')!;

  return (
    <BlogLayout post={post}>
      <p>
        Söker ni <strong>boende i Norrsundet</strong> för personal eller ett arbetslag? StayOnSite har
        boende registrerat på orten och hjälper företag att hitta boende för längre uppdrag. Möjlig
        inflyttning för det registrerade boendet är från januari 2027. Kontakta oss för att stämma av
        tillgänglighet och villkor för just era datum. Våra företagsboenden hyrs ut från tre månader.
      </p>

      <h2>Bo nära arbetsplatsen i Norrsundet</h2>
      <p>
        Norrsundet ligger i Hamrångebygden vid kusten, drygt fyra mil norr om centrala Gävle, enligt{' '}
        <a href="https://www.gavlegardarna.se/hyr-bostad/vara-omraden/norrsundet/" target="_blank" rel="noreferrer">Gavlegårdarna</a>.
        För den som arbetar i Norrsundet kan ett boende på orten eller i närheten göra vardagen enklare
        än en längre daglig resa från staden. Det är särskilt värt att jämföra resvägen om arbetslaget
        har tidiga starter eller skiftarbete.
      </p>
      <p>
        <a href="https://norrsundetshamn.com/" target="_blank" rel="noreferrer">Norrsundets hamn</a>{' '}
        beskriver sitt läge nära E4 och sin verksamhet med bland annat godshantering och logistik.
        Om ert uppdrag finns i hamn- eller industriområdet, ange rätt adress och infart när ni frågar
        om boende. För uppdrag i Gävle stad är det klokt att jämföra med våra möjligheter till{' '}
        <Link href="/stad/gavle">företagsboende i Gävle</Link> och räkna på den faktiska resvägen.
      </p>

      <h2>Företagsboende för längre uppdrag</h2>
      <p>
        När personal arbetar på annan ort under en längre tid behöver boendet fungera även efter arbetsdagen:
        det ska finnas plats för återhämtning, matlagning och de rutiner som får vardagen att gå ihop.
        Företagsboende kan vara ett hus eller en lägenhet, men antal platser, möblering och utrustning
        varierar. Vi går igenom vad som finns för er period och vad som ingår i det aktuella förslaget.
      </p>
      <p>
        Berätta gärna om ni behöver separata sovrum, flera parkeringsplatser eller utrymme för att tvätta
        arbetskläder. Om personer arbetar olika skift är det också bra att ta upp hur de kan få lugn och
        vila. Då kan boendet bedömas utifrån hur hela arbetslaget faktiskt ska bo.
      </p>

      <h2>Vad behöver ni skicka med i en förfrågan?</h2>
      <p>
        Ni behöver inte ha varje detalj klar, men följande uppgifter hjälper oss att undersöka rätt alternativ:
      </p>
      <ul>
        <li><strong>Arbetsplats:</strong> adress, infart och om ni behöver bo i Norrsundet eller kan resa från närliggande orter.</li>
        <li><strong>Period:</strong> önskat inflyttningsdatum och ungefärligt slutdatum. Vi erbjuder boende från tre månader.</li>
        <li><strong>Personer och rum:</strong> hur många som ska bo och om var och en behöver ett eget sovrum.</li>
        <li><strong>Vardagen:</strong> behov av kök, tvättmöjlighet, internet, parkering och eventuellt skiftarbete.</li>
        <li><strong>Förändringar:</strong> om bemanningen kan öka, minska eller om ni behöver kunna förlänga.</li>
      </ul>
      <p>
        Be om en skriftlig sammanställning av pris, hyresperiod, vad som ingår och villkor för
        förlängning innan ni bokar. Är arbetslaget uppdelat i etapper kan ni ange vilka datum och
        personantal som är bekräftade och vilka som fortfarande är preliminära.
      </p>

      <h2>Planerade projekt i Norrsundet</h2>
      <p>
        Blykalla har ansökt om att få etablera en kärnteknisk anläggning i Norrsundet. Enligt{' '}
        <a href="https://www.lansstyrelsen.se/gavleborg/samhalle/ny-karnkraft.html" target="_blank" rel="noreferrer">Länsstyrelsen Gävleborg</a>{' '}
        pågår processen kring ansökan och anläggningsplanen. Det är ett planerat projekt och de
        nödvändiga besluten och tillstånden behöver komma på plats innan ett bygge kan bli aktuellt.
      </p>
      <p>
        Har ni ett eget uppdrag i området, utgå från den tidplan och bemanning som er beställare har
        bekräftat. Framtida projektplaner säger inte i sig när det kommer att finnas ett konkret
        boendebehov eller vilka bostäder som är tillgängliga. Mer om planering inför arbete vid
        kärntekniska anläggningar finns i artikeln om{' '}
        <Link href="/blogg/boende-karnkraftverk-revision-projekt">boende vid kärnkraftverk</Link>.
      </p>

      <h2>Vanliga frågor om boende i Norrsundet</h2>
      {post.faq?.map(({ q, a }) => (
        <div key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}

      <h2>Kontakta oss om boende i Norrsundet</h2>
      <p>
        Berätta var ni ska arbeta, hur många ni är och när ni behöver flytta in. Vi undersöker
        tillgängligheten och återkommer om vad som kan passa ert uppdrag. Skicka en{' '}
        <Link href="/for-foretag">förfrågan om företagsboende</Link> eller ring oss på{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default BoendeNorrsundetForetag;
