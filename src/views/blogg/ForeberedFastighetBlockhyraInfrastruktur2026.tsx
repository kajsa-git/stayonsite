import BlogLayout from './BlogLayout';
import { getBlogPost } from '@/data/blog-posts';
import Link from 'next/link';

const ForeberedFastighetBlockhyraInfrastruktur2026 = () => {
  const post = getBlogPost('forbered-fastighet-blockhyra-infrastruktursatsning-2026')!;
  return (
    <BlogLayout post={post}>
      <p>
        Den 28 april 2026 beslutade regeringen om den nationella planen för transportinfrastrukturen 2026&ndash;2037, med en total ram på 1&nbsp;171 miljarder kronor. För svenska fastighetsägare innebär denna historiska satsning unika möjligheter att hyra ut till byggindustrin via blockhyra &mdash; men det kräver förberedelser.
      </p>

      <h2>Infrastrukturboomen 2026&ndash;2037: Var byggs det?</h2>
      
      <p>
        Flera av landets största infrastrukturprojekt når kritiska faser under 2026, vilket skapar massivt behov av personalboende i specifika regioner. Här är de största projekten där entreprenörer nu söker boende:
      </p>

      <h3>E4 Förbifart Stockholm</h3>
      <p>
        Trafikverket kommer att delöppna sträckan Häggvik&ndash;Hjulsta hösten 2026, medan hela den nya vägen blir klar omkring 2030. Den 21 kilometer långa motorvägen, varav 18 kilometer i tunnel, är ett av Sveriges största vägprojekt någonsin med en trolig slutkostnad på 51,5 miljarder kronor (2021 års prisnivå). Arbetet fortsätter nu med att inreda tunnlarna med väggar, asfalt och ventilation samt installation av säkerhetslösningar och tekniska system.
      </p>

      <p>
        <strong>Personalboendebehov:</strong> Främst i <Link href="/stad/stockholm">Stockholm</Link> med fokus på nordvästra förorterna samt Solna och angränsande kommuner.
      </p>

      <h3>Norrbotniabanan</h3>
      <p>
        Byggnation pågår på sträckan Umeå&ndash;Dåva med planerad trafikstart för godstrafik 2026. Under 2026 planerar Trafikverket för större byggstarter längs sträckan Dåva&ndash;Skellefteå där järnvägsplanerna har vunnit laga kraft. Hela sträckan Umeå&ndash;Skellefteå väntas vara klar 2032, medan planering för den norra etappen Skellefteå&ndash;Luleå har påbörjats. Totalkostnaden uppskattas till 43 miljarder kronor.
      </p>

      <blockquote>
        <p>&quot;Planförslaget utgår från historiskt stora ekonomiska ramar, och innebär viktiga satsningar för att stärka näringslivet, arbetspendlingen och totalförsvaret&quot;</p>
        <footer>&mdash; Roberto Maiorana, Trafikverkets generaldirektör, 30 september 2025</footer>
      </blockquote>

      <p>
        <strong>Personalboendebehov:</strong> Stor efterfrågan i <Link href="/stad/umea">Umeå</Link>, <Link href="/stad/skelleftea">Skellefteå</Link> och <Link href="/stad/lulea">Luleå</Link> samt mindre orter längs sträckan.
      </p>

      <h3>Västlänken i Göteborg</h3>
      <p>
        Den första delen av Västlänken öppnar i december 2026 när Station Centralen tas i drift som säckstation med fyra nya underjordiska spår. Hela järnvägstunneln under centrala Göteborg beräknas stå klar omkring 2030. Projektet omfattar cirka 6 kilometer tågtunnel med tre nya stationer: Centralstationen, Haga och Korsvägen. Enligt Trafikverkets bedömning ligger trolig kostnad på 32,2 miljarder kronor (2009 års prisnivå).
      </p>

      <p>
        <strong>Personalboendebehov:</strong> Koncentrerat till <Link href="/stad/goteborg">Göteborg</Link> och närliggande förorter med god kollektivtrafikförbindelse till centrala staden.
      </p>

      <h3>Malmbanan upprustning</h3>
      <p>
        Regeringen genomför en historisk satsning på Malmbanan under 2026 med åtgärder för 3 miljarder kronor. Sveriges tyngst trafikerade järnvägssträcka mellan Boden och Riksgränsen genomgår omfattande upprustning med ombyggnation av bangårdar i Nattavaara, Ljuså, Nuortikon och Buddbyn, spårbyte på åtta mil mellan Harrträsk och Näsberg, samt kontaktledningsupprustning mellan Boden och Gällivare fram till 2030.
      </p>

      <p>
        <strong>Personalboendebehov:</strong> Främst i <Link href="/stad/boden">Boden</Link>, <Link href="/stad/lulea">Luleå</Link>, <Link href="/stad/gallivare">Gällivare</Link> och <Link href="/stad/kiruna">Kiruna</Link>.
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-3 bg-gray-50">Projekt</th>
              <th className="text-left p-3 bg-gray-50">Byggintensitet 2026&ndash;2028</th>
              <th className="text-left p-3 bg-gray-50">Huvudorter för boende</th>
              <th className="text-left p-3 bg-gray-50">Beräknad färdigställning</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3">E4 Förbifart Stockholm</td>
              <td className="p-3">Hög (installation &amp; slutfas)</td>
              <td className="p-3">Stockholm, Solna, Järfälla</td>
              <td className="p-3">~2030</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Norrbotniabanan</td>
              <td className="p-3">Mycket hög</td>
              <td className="p-3">Umeå, Skellefteå, Luleå</td>
              <td className="p-3">2032 (hela projektet)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Västlänken</td>
              <td className="p-3">Hög (slutfas tunnlar)</td>
              <td className="p-3">Göteborg</td>
              <td className="p-3">~2030</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Malmbanan</td>
              <td className="p-3">Hög (upprustning)</td>
              <td className="p-3">Boden, Gällivare, Kiruna</td>
              <td className="p-3">2030 (kontaktledning)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Se även vår <Link href="/blogg/infrastrukturplan-2026-2037-personalboende-guide">kompletta guide till infrastrukturplanen 2026&ndash;2037</Link> {' '} för fler projekt och detaljerad regional analys.
      </p>

      <h2>Vad entreprenörer söker i personalboende</h2>

      <p>
        Byggbranschen har tydliga krav på personalboende, delvis definierade i kollektivavtal med Byggnads. För att din fastighet ska vara attraktiv för blockhyra till infrastrukturprojekt finns det specifika förväntningar du måste uppfylla.
      </p>

      <h3>Standardkrav från byggindustrin</h3>

      <p>
        Enligt Byggnads kollektivavtal måste arbetsgivaren tillhandahålla boende av &quot;godtagbar standard&quot;. Detta innebär i praktiken:
      </p>

      <ul>
        <li><strong>Eget rum per person:</strong> Varje arbetstagare har rätt till ett eget rum, inte bara en säng i delat utrymme</li>
        <li><strong>Goda toalett- och duschmöjligheter:</strong> Tillräcklig kapacitet i relation till antal boende</li>
        <li><strong>Gemensamhetsutrymme:</strong> Kök/matrum där personal kan laga mat och umgås</li>
        <li><strong>Kylskåpsförvaring:</strong> Varje boende måste kunna förvara egna matvaror</li>
        <li><strong>Fungerande ventilation:</strong> Luftkvalitet som uppfyller Boverkets byggregler</li>
        <li><strong>Tvättmöjligheter:</strong> Tvättstuga eller tillgång till sådan i närheten</li>
      </ul>

      <h3>Läge och logistik</h3>

      <p>
        För infrastrukturprojekt är läget avgörande. Entreprenörer prioriterar fastigheter inom 30&ndash;45 minuters pendlingsavstånd från byggarbetsplatsen. Tillgång till kollektivtrafik eller parkeringsmöjligheter är ofta nödvändigt, särskilt för projekt utanför stadskärnor.
      </p>

      <p>
        I regioner som Norrbotten där projekten ligger geografiskt utspridda är närhet till större samhällen som {' '} <Link href="/stad/skelleftea">Skellefteå</Link> eller <Link href="/stad/gallivare">Gällivare</Link> {' '} viktigt för att arbetarna ska ha tillgång till service under ledigheter.
      </p>

      <h3>Kapacitet: Hur många bäddar behövs?</h3>

      <p>
        Större infrastrukturprojekt kräver ofta boende för team om 8&ndash;30 personer beroende på arbetsfas. Mindre fastigheter med 4&ndash;6 rum kan vara attraktiva för specialistgrupper som installationsteam eller projektledning, medan större enheter med 15+ rum passar gjuteriarbetare eller tunnelsprängare.
      </p>

      <p>
        Läs mer om hur du kan <Link href="/blogg/hyra-ut-jamforelse-stayonsite-vs-andra-2026">optimera din fastighet för blockhyra jämfört med andra alternativ</Link>.
      </p>

      <h2>Checklista: Tekniska förberedelser</h2>

      <p>
        Innan du kontaktar företag för blockhyra bör du säkerställa att din fastighet uppfyller grundläggande tekniska krav. Här är de viktigaste områdena att inspektera:
      </p>

      <h3>1. Ventilation och luftkvalitet</h3>

      <ul>
        <li>Kontrollera att befintligt ventilationssystem fungerar och klarar ökad belastning</li>
        <li>Rengör eller byt ventilationsfilter</li>
        <li>Överväg uppgradering till FTX-system (värmeåtervinning) för energieffektivitet</li>
        <li>Säkerställ att kök har separat frånluft enligt Boverkets byggregler</li>
      </ul>

      <h3>2. Brandskydd</h3>

      <p>
        Vid blockhyra klassas fastigheten ofta som personalboende, vilket kan innebära högre brandskyddskrav än för vanligt boende:
      </p>

      <ul>
        <li>Installera brandvarnare i alla sovrum och gemensamma utrymmen</li>
        <li>Kontrollera att utrymningsvägar är tydligt markerade och fria</li>
        <li>Ha brandsläckare lättillgängliga, särskilt i kök</li>
        <li>Överväg installation av brandstegar vid höga byggnader</li>
        <li>Uppgradera eventuellt till brandklassade dörrar om byggnaden har fler än 2 våningar</li>
      </ul>

      <blockquote>
        <p>&quot;Transportsektorn behöver stärka sin förmåga att upprätthålla samhällsviktiga funktioner, både vid fredstida kriser och vid höjd beredskap&quot;</p>
        <footer>&mdash; Trafikverket om den nationella infrastrukturplanen 2026&ndash;2037</footer>
      </blockquote>

      <h3>3. Fiber och bredband</h3>

      <p>
        Moderna byggnadsarbetare förväntar sig stabilt internet för både arbete (projektstyrning, digitala ritningar) och fritid:
      </p>

      <ul>
        <li>Minst 100 Mbit/s upp- och nedladdningshastighet</li>
        <li>Wifi-täckning i alla rum</li>
        <li>Överväg mesh-system för större fastigheter</li>
        <li>Fiberdragning kan vara avgörande i landsbygdsområden &mdash; undersök statligt stöd via Bredbandsforum</li>
      </ul>

      <h3>4. Elkapacitet</h3>

      <p>
        Många fastigheter, särskilt äldre, har otillräcklig elkapacitet för moderna behov:
      </p>

      <ul>
        <li>Beräkna total effekt: 15&ndash;20 personer kan kräva 30&ndash;40 kW under topplast</li>
        <li>Kontrollera huvudsäkringar och uppgradera vid behov</li>
        <li>Installera motorvärmaruttag om parkeringsplatser finns (viktigt i norra Sverige)</li>
        <li>Säkerställ att elinstallationer är godkända och jordfelsbrytare fungerar</li>
      </ul>

      <h3>5. Vatten och avlopp</h3>

      <ul>
        <li>Testa vattentryck och värmekapacitet på varmvatten för flera samtidiga duschar</li>
        <li>Inspektera avloppssystem &mdash; äldre fastigheter kan behöva uppgradering</li>
        <li>Överväg installation av extra varmvattenberedare om befintlig är under 200 liter</li>
      </ul>

      <h3>6. Möblering och utrustning</h3>

      <p>
        För att uppfylla standardkrav måste varje rum vara komplett möblerat:
      </p>

      <ul>
        <li>Säng (minst 90 cm bred), madrass och kudde per person</li>
        <li>Skrivbord eller arbetsbord och stol i varje rum</li>
        <li>Klädförvaring (garderob eller klädstång med hyllor)</li>
        <li>Sängkläder, handdukar och kökshanddukar (ofta inkluderat i hyran)</li>
        <li>Komplett köksutrustning: spis, kylskåp, mikrovågsugn, kaffebryggare, disk- och köksredskap</li>
      </ul>

      <p>
        För detaljerad juridisk vägledning, se vår artikel om <Link href="/blogg/forsakring-ansvar-personalboende-guide-2026">försäkring och ansvar vid personalboende</Link> {' '} samt <Link href="/blogg/avtalskrav-personalboende-guide-2026">avtalskrav för personalboende</Link>.
      </p>

      <h2>Ekonomisk kalkyl: Lönar sig renovering?</h2>

      <p>
        En av de vanligaste frågorna från fastighetsägare är om det är värt att investera i uppgraderingar för att attrahera blockhyresgäster. Svaret beror på fastighetens nuvarande skick och lokala marknadens hyrespriser.
      </p>

      <h3>ROI-exempel: Fastighet i Skellefteå</h3>

      <p>
        Låt oss titta på ett konkret exempel från en faktisk fastighet som förbereddes för blockhyra i samband med Norrbotniabanan:
      </p>

      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-3 bg-gray-50">Post</th>
              <th className="text-right p-3 bg-gray-50">Kostnad (kr)</th>
              <th className="text-left p-3 bg-gray-50">Kommentar</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3"><strong>Investeringar</strong></td>
              <td className="p-3"></td>
              <td className="p-3"></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Ventilationsuppgradering (FTX)</td>
              <td className="text-right p-3">285 000</td>
              <td className="p-3">8 rum, komplett installation</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Brandskydd (varnare, släckare, dörrar)</td>
              <td className="text-right p-3">45 000</td>
              <td className="p-3">Brandklassade dörrar till trapphus</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Fiberinstallation</td>
              <td className="text-right p-3">35 000</td>
              <td className="p-3">Inkl. wifi-system</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Eluppgradering (huvudsäkringar)</td>
              <td className="text-right p-3">58 000</td>
              <td className="p-3">Från 35A till 63A</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Möblering (8 rum + gemensamhetsyta)</td>
              <td className="text-right p-3">95 000</td>
              <td className="p-3">IKEA Business-kvalitet</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Köksutrustning</td>
              <td className="text-right p-3">32 000</td>
              <td className="p-3">Vitvaror, porslin, bestick</td>
            </tr>
            <tr className="border-b-2 border-gray-300">
              <td className="p-3"><strong>Total investering</strong></td>
              <td className="text-right p-3"><strong>550 000</strong></td>
              <td className="p-3"></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3"><strong>Hyresintäkter (årligen)</strong></td>
              <td className="p-3"></td>
              <td className="p-3"></td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Blockhyra 8 rum á 5 500 kr/mån</td>
              <td className="text-right p-3">528 000</td>
              <td className="p-3">12 månader, full beläggning</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3">Alternativ: Privat uthyrning á 4 200 kr/mån</td>
              <td className="text-right p-3">403 200</td>
              <td className="p-3">Uppskattad lokal marknadshyra</td>
            </tr>
            <tr className="border-b-2 border-gray-300">
              <td className="p-3"><strong>Årlig mervinst med blockhyra</strong></td>
              <td className="text-right p-3"><strong>124 800</strong></td>
              <td className="p-3">+31% jämfört med privat uthyrning</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3"><strong>Återbetalningstid (payback)</strong></td>
              <td className="text-right p-3 font-bold">4,4 år</td>
              <td className="p-3">550 000 kr / 124 800 kr</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        <strong>Viktiga observationer:</strong>
      </p>

      <ul>
        <li>Kalkylen förutsätter full beläggning, vilket är realistiskt för infrastrukturprojekt med 3&ndash;5 års byggtid</li>
        <li>Många kostnader (ventilation, brandskydd, el) är engångsinvesteringar som höjer fastighetsvärdet långsiktigt</li>
        <li>Energibesparingar från FTX-ventilation kan reducera driftskostnader med 15&ndash;25%</li>
        <li>Efter projektets slut kan fastigheten fortsätta hyras ut med bibehållen högre standard</li>
      </ul>

      <h3>StayOnSites stöd: Vi tar kostnadsrisken</h3>

      <p>
        StayOnSite erbjuder en unik modell där vi kan stödja fastighetsägare med nödvändiga uppgraderingar:
      </p>

      <ul>
        <li><strong>Kostnadsfri besiktning:</strong> Vi identifierar exakt vilka åtgärder som behövs</li>
        <li><strong>Renoveringsstöd:</strong> I utvalda fall kan vi finansiera nödvändiga uppgraderingar mot längre hyreskontrakt</li>
        <li><strong>Garanterad hyra:</strong> Full hyresbetalning även vid vakanser (vid kontrakt 12+ månader)</li>
        <li><strong>0% avgift:</strong> Vi tar ingen provision &mdash; du får hela hyran</li>
      </ul>

      <p>
        Jämför vårt erbjudande med andra aktörer i vår <Link href="/blogg/hyra-ut-jamforelse-stayonsite-vs-andra-2026">detaljerade jämförelse</Link>.
      </p>

      <h2>Juridik och försäkring: Vad gäller vid blockhyra?</h2>

      <p>
        Blockhyra till företag skiljer sig juridiskt från vanlig bostadsuthyrning. Här är de viktigaste aspekterna att ha koll på:
      </p>

      <h3>Hyreslagstiftning</h3>

      <p>
        Sedan den nya <Link href="/blogg/blockhyra-nya-regler-juli-2026-guide-foretag">blockhyralagen från juli 2026</Link> {' '} trädde i kraft är reglerna tydligare. Nyckelord:
      </p>

      <ul>
        <li>Blockhyresavtal till företag faller <strong>inte</strong> under hyreslagen (12 kap. 3 § JB) om uthyrningen är kortare än 2 år</li>
        <li>Du kan därmed avtala fritt om hyra och uppsägningstid</li>
        <li>Vid längre kontrakt (2+ år) kan besittningsskydd uppstå &mdash; konsultera jurist</li>
      </ul>

      <p>
        För privatpersoner som hyr ut delar av sitt eget hem gäller särskilda regler enligt <Link href="/blogg/privatuthyrningslagen-reform-2026">privatuthyrningslagen</Link>.
      </p>

      <h3>Försäkring</h3>

      <p>
        Din vanliga villaförsäkring eller fastighetsförsäkring täcker <strong>inte</strong> kommersiell uthyrning. Du behöver:
      </p>

      <ul>
        <li><strong>Fastighetsförsäkring med tilläggsmodul för uthyrning:</strong> Täcker skador på byggnad och utrustning</li>
        <li><strong>Ansvarsförsäkring:</strong> Om någon skadar sig i fastigheten</li>
        <li><strong>Avbrottsförsäkring:</strong> Täcker hyresbortfall vid skador (rekommenderas)</li>
      </ul>

      <p>
        StayOnSite kräver att företagshyresgäster har eget ansvarsförsäkring och ställer depositioner för att skydda dig som fastighetsägare. Läs mer i vår guide om <Link href="/blogg/forsakring-ansvar-personalboende-guide-2026">försäkring och ansvar</Link>.
      </p>

      <h3>Skatt och schablonavdrag</h3>

      <p>
        Hyresintäkter från blockhyra beskattas som kapitalinkomst (30%). Tänk på:
      </p>

      <ul>
        <li>Du får göra <Link href="/blogg/schablonavdrag-skatt-blockhyra-husagare-2026">schablonavdrag på 40&nbsp;000 kr årligen</Link> {' '} för reparationer och underhåll vid möblerad uthyrning</li>
        <li>Alternativt kan du göra avdrag för faktiska kostnader (material, el, sophämtning, etc.)</li>
        <li>Ränteavdrag för lån är fullt avdragsgilla vid uthyrning av hel fastighet</li>
        <li>Investeringar i fastigheten skrivs av över 5&ndash;10 år beroende på typ</li>
      </ul>

      <p>
        Kontakta en skatterådgivare för att optimera din deklaration.
      </p>

      <h2>Nästa steg: Kontakta StayOnSite för besiktning</h2>

      <p>
        Om du har en fastighet i eller nära <Link href="/stad/stockholm">Stockholm</Link>, {' '} <Link href="/stad/goteborg">Göteborg</Link>, <Link href="/stad/umea">Umeå</Link>, {' '} <Link href="/stad/skelleftea">Skellefteå</Link>, <Link href="/stad/lulea">Luleå</Link>, {' '} <Link href="/stad/boden">Boden</Link>, <Link href="/stad/gallivare">Gällivare</Link> {' '} eller <Link href="/stad/kiruna">Kiruna</Link> {' '} &mdash; områden där infrastrukturbyggena nu tar fart &mdash; kan du ha en guldgruva i händerna.
      </p>

      <p>
        <strong>Så här går det till:</strong>
      </p>

      <ol>
        <li><strong>Kontakta oss:</strong> Ring <a href="tel:0762498486">076-249 84 86</a> eller fyll i formuläret på vår sida <Link href="/for-husagare">För husägare</Link></li>
        <li><strong>Kostnadsfri besiktning:</strong> Vi besöker fastigheten och bedömer potential och eventuella åtgärdsbehov</li>
        <li><strong>Offert inom 24 timmar:</strong> Du får ett konkret hyresförslag och rekommendationer</li>
        <li><strong>Vi matchar med företag:</strong> När vi hittat rätt hyresgäst (ofta inom 2&ndash;4 veckor) tecknas avtal</li>
        <li><strong>Garanterad hyra varje månad:</strong> Du får hyran i förskott &mdash; vi hanterar all administration</li>
      </ol>

      <h3>Varför välja StayOnSite?</h3>

      <ul>
        <li><strong>0% avgift:</strong> Ingen provision eller förmedlingsavgift &mdash; du får hela hyran</li>
        <li><strong>Garanterad hyra:</strong> Betalt även vid vakanser (vid längre kontrakt)</li>
        <li><strong>Professionella hyresgäster:</strong> Endast etablerade byggföretag med verifierade referenser</li>
        <li><strong>Svar inom 24 timmar:</strong> Snabb handläggning så du inte missar projektens byggstarter</li>
        <li><strong>Fullservice:</strong> Vi sköter kontrakt, betalningar och kontakt med hyresgäster</li>
      </ul>

      <p>
        Infrastrukturboomen 2026&ndash;2037 är här. Företag söker akut efter boende nära <Link href="/blogg/blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026">infrastrukturprojekt som Norrbotniabanan</Link> {' '} och Förbifart Stockholm. Med rätt förberedelser kan din fastighet generera stabil hyresintäkt i många år framöver.
      </p>

      <p>
        <strong>Redo att komma igång?</strong> Besök vår sida <Link href="/for-foretag">För företag</Link> {' '} om du representerar ett byggföretag som söker boende, eller <Link href="/for-husagare">För husägare</Link> {' '} om du vill hyra ut. Ring oss på <a href="tel:0762498486">076-249 84 86</a> för en kostnadsfri konsultation.
      </p>

      <p>
        Läs även: <Link href="/blogg/sa-fungerar-det-fran-intresse-till-forsta-hyran">Så fungerar det &mdash; från intresse till första hyran</Link>.
      </p>
    </BlogLayout>
  );
};

export default ForeberedFastighetBlockhyraInfrastruktur2026;
