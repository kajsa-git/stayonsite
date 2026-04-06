import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const SaFungerarDetHusagare2026 = () => {
  const post = getBlogPost('sa-fungerar-det-fran-intresse-till-forsta-hyran')!;
  return (
    <BlogLayout post={post}>
      <p>
        Många husägare som kontaktar oss vet att de vill hyra ut, men är osäkra på hur
        processen ser ut. Vad händer efter att man anmält intresse? Hur lång tid tar det
        innan pengarna börjar rulla in? Och vad behöver man förbereda?
      </p>

      <p>
        Den här artikeln går igenom hela förloppet - från att du fyller i ett formulär till
        att hyran landar på kontot. Det är enklare än du tror.
      </p>

      <h2>Hur StayOnSites modell fungerar</h2>

      <p>
        StayOnSite hyr din bostad av dig till en fast månadshyra. Vi hyr sedan ut bostaden
        vidare till företag som behöver boende för sin personal - montörer, projektledare,
        konsulter och yrkesarbetare som jobbar på tillfälliga uppdrag runt om i Sverige.
      </p>

      <p>
        Det innebär att du som husägare har ett avtal med oss, inte med de enskilda
        hyresgästerna. Din hyra betalas ut varje månad, oavsett om bostaden är belagd eller
        inte. Inga avdrag, inga avgifter, inga provisioner.
      </p>

      <p>
        Till skillnad från plattformar som Samtrygg (15 % avgift) och Qasa (4,95 %) tar
        StayOnSite <strong>0 procent i avgift av husägaren</strong>. Det vi kommer överens
        om får du alltid helt utan avdrag.
      </p>

      <h2>De fem stegen - från intresse till hyra</h2>

      <h3>Steg 1: Anmäl intresse</h3>

      <p>
        Allt börjar med att du fyller i ett kort formulär på vår{' '}
        <Link href="/for-husagare">husägarsida</Link>. Du anger ort, ungefär hur många
        personer bostaden rymmer, och ett telefonnummer eller en e-postadress. Det tar
        under en minut.
      </p>

      <p>
        Du behöver inte ha bestämt dig. Formuläret är en intresseanmälan, inte ett bindande
        åtagande. Vi kontaktar dig sedan för att diskutera förutsättningarna.
      </p>

      <h3>Steg 2: Vi ringer dig</h3>

      <p>
        Inom 24 timmar på vardagar ringer Kajsa, som ansvarar för uthyrningarna, upp dig.
        Det är ett kort samtal - ofta inte mer än 10 minuter - där vi ställer några
        frågor om bostaden och berättar vad vi kan erbjuda.
      </p>

      <p>Vi vill veta:</p>

      <ul>
        <li>Bostadens storlek och antal sovrum</li>
        <li>Adress - så vi kan bedöma läge och avstånd till arbetsplatser</li>
        <li>Om bostaden är komplett möblerad (sängar, kök, tvättutrustning, internet) och vad som eventuellt saknas</li>
        <li>Dina förväntningar på hyra och avtalstid</li>
      </ul>

      <p>
        Under samtalet får du också veta om vi ser ett konkret behov i din ort just nu.
        Efterfrågan varierar beroende på vilka byggprojekt och industrisatsningar som pågår
        i regionen. Vi är raka med om vi kan erbjuda något eller inte.
      </p>

      <h3>Steg 3: Besiktning och avtal</h3>

      <p>
        Om samtalet pekar mot ett samarbete bokar vi en besiktning av bostaden. Antingen
        kommer vi hem till dig, eller så kan besiktningen ske via video om det är
        smidigare. Vi går igenom bostaden och dokumenterar med foton eller video.
      </p>

      <p>Besiktningen fyller tre syften:</p>

      <ul>
        <li>Vi dokumenterar bostadens skick inför inflyttning</li>
        <li>Vi bedömer vilken hyra som är realistisk</li>
        <li>Vi säkerställer att bostaden uppfyller kraven från de företag vi arbetar med</li>
      </ul>

      <p>
        Krav från företagskunderna handlar i regel om fungerande kök, tillräcklig
        sovplatser, fungerande internet och att bostaden är ren och presentabel. Det är
        inga orimliga krav, men vi behöver se bostaden med egna ögon.
      </p>

      <p>
        Om allt ser bra ut skriver vi ett avtal. Avtalet reglerar hyresbelopp, avtalstid
        och villkor. Typiska avtalstider är 6 till 24 månader, beroende på vilket behov vi
        har i din ort.
      </p>

      <h3>Steg 4: Inflyttning</h3>

      <p>
        När avtalet är signerat koordinerar StayOnSite inflyttningen med det företag som
        ska hyra bostaden. Du behöver inte ha kontakt med de enskilda personerna som bor
        där. Nyckelöverlämning, inflyttningsprotokoll och all löpande kommunikation med
        hyresgästen sköter vi.
      </p>

      <p>
        Om det uppstår ett problem i bostaden - ett trasigt lås, en läckande kran, ett
        trasigt vitvaror - kontaktar hyresgästen StayOnSite, inte dig. Vi hanterar
        felanmälningar och koordinerar med dig om något behöver åtgärdas.
      </p>

      <p>
        Från signerat avtal till inflyttning tar det normalt 1 till 3 veckor, beroende på
        när företaget behöver tillträde.
      </p>

      <h3>Steg 5: Du får hyran</h3>

      <p>
        Hyran betalas ut den 25:e varje månad, direkt till ditt bankkonto. Inga avdrag,
        inga fakturahantering, inga mellanhänder som tar en del.
      </p>

      <p>
        Eftersom StayOnSite är avtalspart - inte de enskilda hyresgästerna - behöver du
        inte oroa dig för om ett visst företag betalar i tid. Vi bär den risken. Du får
        din hyra som avtalat.
      </p>

      <h2>Vad behöver du förbereda?</h2>

      <p>
        Kortsvaret: inte mycket. Du behöver inte anlita mäklare, skriva ihop något
        hyresavtal eller ta fram en massa dokument innan du hör av dig.
      </p>

      <p>Det som faktiskt behövs:</p>

      <ul>
        <li>
          <strong>En bostäder i acceptabelt skick.</strong> Den behöver inte vara nyrenoverad.
          Men den ska vara ren, fungerande och möjlig att bo i.
        </li>
        <li>
          <strong>Grundläggande möblering</strong> om vi avtalat om möblerat (sängar,
          matbord, soffa). Omöblerat fungerar också beroende på vad företaget efterfrågar.
        </li>
        <li>
          <strong>Fungerande internet.</strong> Det är ett grundkrav från i princip alla
          företagskunder.
        </li>
        <li>
          <strong>Ditt personnummer och bankkontonummer</strong> för avtalet och utbetalning.
        </li>
      </ul>

      <p>
        Om bostaden behöver mindre åtgärder innan inflyttning diskuterar vi det under
        besiktningen och hittar en lösning som fungerar för båda parter.
      </p>

      <h2>Tidslinje: Hur lång tid tar det?</h2>

      <p>
        Från intresseanmälan till att pengarna börjar komma in tar det normalt 3 till
        6 veckor. Här är en realistisk uppskattning:
      </p>

      <ul>
        <li><strong>Dag 1:</strong> Du fyller i formuläret</li>
        <li><strong>Dag 1-2:</strong> Vi ringer upp</li>
        <li><strong>Dag 3-7:</strong> Besiktning bokas och genomförs</li>
        <li><strong>Dag 7-14:</strong> Avtal skrivs och signeras</li>
        <li><strong>Dag 14-30:</strong> Inflyttning</li>
        <li><strong>Dag 25 (nästkommande):</strong> Första hyran betalas ut</li>
      </ul>

      <p>
        I situationer med akut efterfrågan - när ett företag behöver boende inom kort -
        kan processen gå snabbare. Vi har ordnat inflyttning inom en vecka från första
        kontakt när situationen krävt det.
      </p>

      <h2>Vanliga frågor</h2>

      <h3>Måste jag vara tillgänglig under uthyrningsperioden?</h3>
      <p>
        Ja, om det inte avtalas om annat. Du behöver inte hantera felanmälningar,
        nyckelbyten eller löpande frågor - det sköter vi. Men vi behöver kunna nå dig
        vid behov, exempelvis om något behöver åtgärdas i bostaden.
      </p>

      <h3>Vad händer om bostaden skadas?</h3>
      <p>
        Bostaden besiktigas och fotograferas innan inflyttning. Det ger ett tydligt
        utgångsläge. Om något skadas under hyrestiden hanteras det inom ramen för avtalet
        med det hyrestagande företaget. Vi dokumenterar skick noggrant just för att
        undvika tvister.
      </p>

      <h3>Kan jag säga upp avtalet i förtid?</h3>
      <p>
        Det beror på avtalets villkor. Precis som med alla hyresavtal gäller avtalade
        uppsägningstider. Vi försöker alltid hitta avtalslängder som passar din situation,
        och vi diskuterar detta öppet under avtalsprocessen.
      </p>

      <h3>Behöver jag informera min bank?</h3>
      <p>
        Nej, du behöver inte informera din bank om att bostaden hyrs ut. Ditt bolån
        påverkas inte av uthyrningen.
      </p>

      <h3>Vad gäller angående försäkring?</h3>
      <p>
        Du bör informera ditt försäkringsbolag om att bostaden hyrs ut till företag så
        att du har rätt försäkringsskydd. De flesta hemförsäkringar täcker uthyrning, men
        det kan krävas ett tillägg. Kontrollera med ditt bolag innan avtalet tecknas.
      </p>

      <h3>Vilka orter är aktuella?</h3>
      <p>
        Vi täcker i princip hela Sverige, med fokus på orter där det pågår
        infrastrukturprojekt, industrisatsningar eller annan verksamhet som kräver
        tillfälligt boende för personal. Orter som <Link href="/stad/lulea">Luleå</Link>,{' '}
        <Link href="/stad/boden">Boden</Link>, <Link href="/stad/oskarshamn">Oskarshamn</Link>,{' '}
        <Link href="/stad/gavle">Gävle</Link>, <Link href="/stad/ludvika">Ludvika</Link> och{' '}
        <Link href="/stad/saffle">Säffle</Link> är exempel på platser med hög efterfrågan.
        Men hör av dig oavsett ort, så berättar vi vad som gäller hos dig.
      </p>

      <h3>Måste bostaden vara möblerad?</h3>
      <p>
        Inte alltid. Det beror på vad företagskunderna efterfrågar. Möblerat är vanligast
        för korttidsuthyrning (under 6 månader), medan omöblerat kan fungera för längre
        avtal. Vi diskuterar detta under telefonsamtalet och anpassar upplägget.
      </p>

      <h3>Vad händer när avtalet löper ut?</h3>
      <p>
        Vi diskuterar förlängning i god tid - normalt 1 till 2 månader innan avtalet
        löper ut. Många husägare väljer att förlänga. Om du vill avsluta samarbetet
        återlämnas bostaden i dokumenterat skick efter avflyttningsbesiktning.
      </p>

      <h2>Vad kan din bostad ge?</h2>

      <p>Här är två exempel på vad husägare tjänar via StayOnSite:</p>

      <h3>Scenario A: Villa med 3 sovrum i mindre stad</h3>
      <p>
        En möblerad villa i exempelvis <Link href="/stad/oskarshamn">Oskarshamn</Link> eller{' '}
        <Link href="/stad/ludvika">Ludvika</Link> med 3 sovrum, fullt kök och internet.
        Fast månadshyra: <strong>25 000 kr</strong>. Inga avdrag, inga avgifter.
        Det ger 300 000 kr per år i garanterad inkomst.
      </p>

      <h3>Scenario B: Större hus med 5+ sovrum nära industriprojekt</h3>
      <p>
        Ett rymligt hus i <Link href="/stad/lulea">Luleå</Link> eller{' '}
        <Link href="/stad/boden">Boden</Link> nära pågående industrisatsningar,
        med plats för ett helt projektteam. Fast månadshyra:{' '}
        <strong>40 000 kr</strong>. Det ger nästan en halv miljon per år.
      </p>

      <h2>Nästa steg</h2>

      <p>
        Är du nyfiken på vad just din bostad kan ge i fast månadshyra?{' '}
        <Link href="/for-husagare">Gå till husägarsidan</Link> och fyll i ett kort
        formulär. Det binder inte, och du får svar inom 24 timmar på vardag.
      </p>

      <p>
        Du kan också ringa Kajsa, som ansvarar för uthyrningarna, direkt på{' '}
        <a href="tel:+46762498486">076-249 84 86</a> om du hellre vill prata innan
        du fyller i något.
      </p>

      <p>
        Läs gärna också vår artikel om{' '}
        <Link href="/blogg/privatuthyrningslagen-reform-2026">
          nya reglerna i privatuthyrningslagen från juli 2026
        </Link>{' '}
        och hur de påverkar vad du kan tjäna på uthyrning.
      </p>
    </BlogLayout>
  );
};

export default SaFungerarDetHusagare2026;
