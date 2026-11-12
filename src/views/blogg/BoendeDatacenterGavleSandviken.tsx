import Link from 'next/link';
import { getBlogPost } from '@/data/blog-posts';
import { DATACENTER_PATHS } from '@/data/datacenter';
import BlogLayout from './BlogLayout';

const BoendeDatacenterGavleSandviken = () => {
  const post = getBlogPost('boende-datacenter-gavle-sandviken')!;

  return (
    <BlogLayout post={post}>
      <p>
        Söker ni <strong>boende vid datacenterbyggena i Gävle och Sandviken</strong>? Byggena ligger på tre
        platser i två kommuner, så första frågan är vilken anläggning laget ska arbeta vid. StayOnSite ordnar
        möblerade hus och lägenheter för installations- och byggteam, med hyresperioder från tre månader.
      </p>

      <h2>Tre platser: Ersbo, Tuna och Stackbo</h2>
      <p>
        Microsoft köpte i slutet av 2018 mark av Gävle och Sandvikens kommuner för en datacenteretablering.
        Enligt Gävle kommun ligger Microsofts mark i Ersbo i Gävle, Tuna i Sandviken och Stackbo i Valbo,
        och det pågår just nu tre byggen av datacenterhallar i Gävle och Sandviken.{' '}
        <a
          href="https://www.gavle.se/kommun-och-politik/samarbeten-projekt-och-arbetssatt/etablering-av-datacenter/"
          target="_blank"
          rel="noreferrer"
        >
          Läs Gävle kommuns sida om datacenteretableringen
        </a>
        .
      </p>
      <p>
        Microsoft beskriver själva sin svenska datacenterregion som flera sammankopplade datacenter i Gävle,
        Sandviken och Staffanstorp, i drift sedan 2021.{' '}
        <a
          href="https://news.microsoft.com/source/emea/2026/10/hur-microsoft-adresserar-digital-suveranitet-i-sverige/?lang=sv"
          target="_blank"
          rel="noreferrer"
        >
          Läs Microsofts beskrivning av den svenska regionen
        </a>
        .
      </p>

      <h2>Gävle, Valbo eller Sandviken – utgå från anläggningen</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full">
          <caption className="sr-only">Var arbetslaget kan bo beroende på vilken anläggning uppdraget gäller</caption>
          <thead>
            <tr>
              <th>Arbetsplats</th>
              <th>Kommun</th>
              <th>Jämför boende i</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ersbo</td>
              <td>Gävle</td>
              <td>Gävle och Valbo</td>
            </tr>
            <tr>
              <td>Stackbo</td>
              <td>Gävle (Valbo)</td>
              <td>Valbo, Gävle och Sandviken</td>
            </tr>
            <tr>
              <td>Tuna</td>
              <td>Sandviken</td>
              <td>Sandviken och Valbo</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Valbo ligger mellan Gävle och Sandviken och kan därför fungera när ett lag arbetar vid mer än en
        anläggning, eller när ni inte vet än vilken hall som blir nästa etapp. Kontrollera restiden från
        den konkreta bostaden till rätt infart, vid de tider laget börjar och slutar. Fler lägen och
        publicerade bostäder finns på vår sida om{' '}
        <Link href="/stad/gavle">företagsboende i Gävle</Link>.
      </p>

      <h2>Bemanningen ändras mellan etapperna</h2>
      <p>
        Ett datacenterbygge går från mark och stomme till el, kyla och driftsättning, och varje skede har
        sin egen bemanning. Boka därför inte efter det högsta antalet personer för hela perioden. Dela upp
        behovet per etapp och säg vilka som är bekräftade av er beställare:
      </p>
      <ul>
        <li><strong>Kärnlag:</strong> de som är på plats hela uppdraget och behöver samma bostad hela tiden.</li>
        <li><strong>Toppar:</strong> extra personal under avgränsade veckor, som kan bo i en egen bostad.</li>
        <li><strong>Specialister:</strong> korta insatser vid driftsättning, där tre månaders hyra sällan passar.</li>
      </ul>
      <p>
        Vi hyr ut från tre månader. Stäm av villkoren för förlängning innan ni bokar, så att kärnlaget kan bo
        kvar om nästa etapp tillkommer. Vår{' '}
        <Link href="/blogg/datacenter-montorboende-guide-2026">guide till montörboende vid datacenter</Link>{' '}
        går igenom planeringen per etapp mer i detalj.
      </p>

      <h2>Vad behöver ni skicka med i en förfrågan?</h2>
      <ul>
        <li><strong>Anläggning:</strong> Ersbo, Stackbo eller Tuna, och vilken infart laget använder.</li>
        <li><strong>Period:</strong> inflyttning, beräknat slut och vilka etapper som är bekräftade.</li>
        <li><strong>Personer och rum:</strong> antal personer per etapp och om alla behöver eget sovrum.</li>
        <li><strong>Skift:</strong> arbetstider och om laget roterar mellan arbetsveckor och ledighet.</li>
        <li><strong>Fordon:</strong> antal personbilar och servicebilar som ska stå vid bostaden.</li>
        <li><strong>Fakturering:</strong> om flera underentreprenörer ska dela boende men faktureras var för sig.</li>
      </ul>
      <p>
        Vi tar fram ett boendeförslag med de bostäder som finns för er period och går igenom läge, pris och
        vad som ingår innan ni bokar.
      </p>

      <h2>Vanliga frågor om boende vid datacenter i Gävle och Sandviken</h2>
      {post.faq?.map(({ q, a }) => (
        <div key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}

      <h2>Kontakta oss om boende i Gävle–Sandviken</h2>
      <p>
        Berätta vilken anläggning ni ska arbeta vid, hur många ni är och när ni behöver flytta in.{' '}
        <Link href={`${DATACENTER_PATHS.sv}#inquiry`}>Skicka en förfrågan om datacenterboende</Link>, mejla{' '}
        <a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a> eller ring{' '}
        <a href="tel:+46762498486">076-249 84 86</a>.
      </p>
    </BlogLayout>
  );
};

export default BoendeDatacenterGavleSandviken;
