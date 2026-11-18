// Kajsas Facebook-grupper, sorterade efter län och ort. Underlag: listan över
// grupper hon är med i (303 st, 2026-11-18). Utlandsgrupper (Groningen, Málaga,
// Köpenhamn m.fl.) och grupper som inte har med boende att göra är bortplockade.
//
// typ:
//   bostad       grupp för uthyrning/bostadssök i orten eller länet (förstahandsval)
//   lokal        anslagstavla, köp/sälj eller ortsgrupp (bra komplement på små orter)
//   rikstackande hela Sverige, tas med för varje förfrågan
//
// orter: tom lista = gruppen täcker hela länet.
// vantar: Kajsa har bett att få gå med men är inte godkänd än.
// antal: flera grupper har exakt samma namn; sökningen på Facebook visar alla.
//
// Lägg till en grupp genom att lägga en rad under rätt län. Facebook-länken behövs
// inte: postningslistan öppnar Facebooks gruppsökning på namnet.

export type GruppTyp = "bostad" | "lokal" | "rikstackande";

export interface FacebookGrupp {
  namn: string;
  lan: string[];
  orter: string[];
  typ: GruppTyp;
  vantar?: boolean;
  antal?: number;
}

type Extra = { vantar?: boolean; antal?: number };

function lan(namn: string | string[], rader: Array<[GruppTyp, string, string[], Extra?]>): FacebookGrupp[] {
  const l = Array.isArray(namn) ? namn : [namn];
  return rader.map(([typ, gruppnamn, orter, extra]) => ({ namn: gruppnamn, lan: l, orter, typ, ...extra }));
}

const SKARABORG = ["Skaraborg", "Skövde", "Lidköping", "Mariestad", "Falköping", "Skara", "Tidaholm", "Hjo", "Götene"];

export const GRUPPER: FacebookGrupp[] = [
  ...lan("Stockholm", [
    ["bostad", "Lägenheter i Stockholm", ["Stockholm"], { antal: 3 }],
    ["bostad", "Lägenheter i Stockholm - Öppen grupp", ["Stockholm"]],
    ["bostad", "Lägenheter i Stockholm - Fri från spam och bedragare.", ["Stockholm"]],
    ["bostad", "Lägenhet sökes i Stockholm", ["Stockholm"]],
    ["bostad", "Bostäder Bytes/Uthyres i Stockholm", ["Stockholm"]],
    ["bostad", "Hyra bostad Stockholm", ["Stockholm"]],
    ["bostad", "🏡 Hyra bostad i Stockholm | Lediga lägenheter & hyresbostäder", ["Stockholm"]],
    ["bostad", "Bostad Stockholm", ["Stockholm"]],
    ["bostad", "LÄGENHET SÖKES/FINNES/ i Stockholm", ["Stockholm"]],
    ["bostad", "Lägenheter och bostäder i Stockholm uthyres, bytes och sökes", ["Stockholm"]],
    ["bostad", "SÖK BOENDE I STHLM", ["Stockholm"]],
    ["bostad", "Lägenheter uthyres, bytes och överlåtes i Stockholm", ["Stockholm"]],
    ["bostad", "Lägenheter i Märsta", ["Märsta", "Sigtuna"]],
    ["bostad", "Boende i Sigtuna Stadsängar", ["Sigtuna"]],
    ["bostad", "Lägenheter i Upplands Väsby - Öppen grupp", ["Upplands Väsby"]],
    ["lokal", "Köp/Byt/Sälj - Upplands Väsby", ["Upplands Väsby"]],
    ["lokal", "väsby vad händer", ["Upplands Väsby"]],
    ["lokal", "Marketplace Stockholm samarbetar ned gott och blandat älta Nacka köpp sälj", ["Nacka", "Älta"]],
  ]),
  ...lan("Uppsala", [
    ["bostad", "Uppsala Housing", ["Uppsala"]],
    ["bostad", "Hyra Lägenhet & Bostad i Uppsala", ["Uppsala"]],
    ["bostad", "Lägenheter i Uppsala med omnejd", ["Uppsala"]],
    ["bostad", "Boende i Uppsala", ["Uppsala"]],
    ["bostad", "Lägenheter i Uppsala", ["Uppsala"]],
    ["bostad", "Hyra lägenhet i Uppsala BURHAN ÖZDEMİR", ["Uppsala"]],
    ["bostad", "Bostad Uppsala", ["Uppsala"]],
    ["bostad", "Lägenheter i Uppsala - Öppen grupp", ["Uppsala"]],
  ]),
  ...lan("Södermanland", [
    ["bostad", "Hus, gårdar och lägenheter uthyres/hyres södermanland", []],
    ["bostad", "Lägenheter i Eskilstuna/närliggande kommuner", ["Eskilstuna"]],
    ["bostad", "Lediga lägenheter i Eskilstuna – Hyra bostad Eskilstuna", ["Eskilstuna"]],
    ["bostad", "Bostad 016 Eskilstuna", ["Eskilstuna"]],
    ["bostad", "Lägenhet sökes i Eskilstuna", ["Eskilstuna"]],
    ["bostad", "Lägenheter i Eskilstuna med omnejd", ["Eskilstuna"]],
    ["bostad", "Hyreslägenheter i Eskilstuna", ["Eskilstuna"]],
    ["bostad", "Lägenheter i Eskilstuna", ["Eskilstuna"]],
    ["bostad", "Lägenheter i Eskilstuna - Öppen grupp", ["Eskilstuna"]],
    ["bostad", "Lägenheter i Katrineholm", ["Katrineholm"]],
    ["bostad", "Lediga lägenheter i Katrineholm", ["Katrineholm"]],
    ["lokal", "Händer i Katrineholm.", ["Katrineholm"]],
    ["bostad", "Lediga Lägenheter Vingåker", ["Vingåker"]],
    ["lokal", "Vi som gärna hjälper till, Vingåker.", ["Vingåker"]],
  ]),
  ...lan("Östergötland", [
    ["bostad", "Sverige/Östergötland lägenhet/hus uthyres/köpes", []],
    ["bostad", "Lägenheter uthyres i Linköping", ["Linköping"], { vantar: true }],
    ["bostad", "Bostad Linköping", ["Linköping"]],
    ["bostad", "Linkoping - Housing/Room/Flat/Sublet/Apartment/Studio/Roommate.", ["Linköping"]],
    ["bostad", "🏡 Hyra bostad i Linköping | Lediga lägenheter & hyresbostäder", ["Linköping"]],
    ["bostad", "Lägenheter i Linköping - Öppen grupp", ["Linköping"]],
    ["bostad", "Lediga Lägenheter Linköping", ["Linköping"]],
    ["bostad", "Lägenheter i Linköping", ["Linköping"]],
    ["lokal", "Linköping", ["Linköping"]],
    ["bostad", "Lägenheter i Norrköping - EJ BYTE!", ["Norrköping"]],
    ["bostad", "Lägenheter i Norrköping med omnejd", ["Norrköping"]],
    ["bostad", "Vi som söker lägenhet i Norrköping", ["Norrköping"]],
    ["bostad", "Lägenheter i Norrköping - Öppen grupp", ["Norrköping"], { antal: 2 }],
    ["bostad", "Lägenheter i Norrköping", ["Norrköping"]],
    ["bostad", "lägenheter, hus bytes säljes uthyres i Motala", ["Motala"]],
    ["lokal", "Vadstena! För alla som bor, lever och verkar i denna stad. Vad händer?", ["Vadstena"]],
  ]),
  ...lan("Jönköping", [
    ["bostad", "Lediga Lägenheter Jönköping/Huskvarna", ["Jönköping", "Huskvarna"]],
    ["bostad", "Hyra lägenhet /Rent apartment i JÖNKÖPING", ["Jönköping"]],
    ["bostad", "Lägenheter i Jönköping med omnejd", ["Jönköping"]],
    ["bostad", "Hus & Lägenheter i Jönköping", ["Jönköping"]],
    ["bostad", "Lägenheter i Jönköping", ["Jönköping"], { antal: 3 }],
    ["bostad", "Lägenheter i Jönköping - Öppen grupp", ["Jönköping"]],
    ["lokal", "Jönköpingsgruppen", ["Jönköping"]],
    ["lokal", "Aktuellt i Huskvarna", ["Huskvarna"]],
    ["bostad", "Lägenhet/Hus Uthyres/Bytes/Säljes i Eksjö", ["Eksjö"]],
    ["bostad", "Lediga Lägenheter Eksjö", ["Eksjö"]],
  ]),
  ...lan("Kronoberg", [
    ["bostad", "Lediga lägenheter i Växjö", ["Växjö"]],
    ["bostad", "Hyra Lägenhet & Bostad i Växjö", ["Växjö"]],
    ["bostad", "Lägenheter i Växjö med omnejd", ["Växjö"]],
    ["bostad", "Lägenheter i Växjö", ["Växjö"]],
    ["bostad", "Lägenheter i Växjö - Öppen grupp", ["Växjö"]],
    ["bostad", "Lägenheter i Ljungby", ["Ljungby"]],
  ]),
  ...lan("Kalmar", [
    ["bostad", "Hyra hus/lägenhet privat i kalmar län", [], { vantar: true }],
    ["bostad", "Bostäder Uthyres/hyres i Kalmar län & på Öland", []],
    ["lokal", "Köp/sälj kalmar län > skänkes", []],
    ["lokal", "Händer i Kalmar Län", []],
    ["bostad", "Lägenheter i Kalmar", ["Kalmar"]],
    ["bostad", "Lägenheter Kalmar - Öppen grupp", ["Kalmar"]],
    ["bostad", "Lägenheter i Kalmar - Öppen grupp", ["Kalmar"]],
    ["bostad", "Lägenheter i Oskarshamn", ["Oskarshamn"], { antal: 2 }],
    ["bostad", "Lediga Lägenheter Oskarshamn", ["Oskarshamn"]],
    ["bostad", "Bostäder i Oskarshamn med omnejd (ca 5 mil) . Hyres/Uthyres Köpes/Säljes", ["Oskarshamn"]],
    ["lokal", "Köp & Sälj oskarshamn, mönsterås & högsby", ["Oskarshamn", "Mönsterås", "Högsby"], { vantar: true }],
    ["lokal", "Oskarshamns anslagstavla", ["Oskarshamn"]],
    ["lokal", "Oskarshamn Anslagstavla", ["Oskarshamn"]],
    ["lokal", "Oskarshamnsgruppen", ["Oskarshamn"]],
    ["lokal", "Du vet att du är från Oskarshamn när...", ["Oskarshamn"]],
    ["lokal", "Säljes, Köpes och byten i Oskarshamn", ["Oskarshamn"]],
    ["lokal", "Skänkes , Säljes och Bytes Oskarshamn", ["Oskarshamn"]],
    ["bostad", "Lediga Lägenheter Mönsterås", ["Mönsterås"]],
    ["lokal", "Mönsterås anslagstavla", ["Mönsterås"]],
    ["lokal", "Mönsterås Evenemang & Tjänster", ["Mönsterås"]],
    ["lokal", "Mönsterås", ["Mönsterås"]],
    ["lokal", "Mönsteråsgruppen", ["Mönsterås"]],
    ["bostad", "Lägenheter i Västervik", ["Västervik"]],
    ["bostad", "Hyresledigt i Västervik - med omnejd", ["Västervik"]],
    ["bostad", "Bostäder uthyres i Västerviks kommun!", ["Västervik"]],
    ["bostad", "Bostäder sökes och Bostäder uthyres Vimmerby kommun!", ["Vimmerby"]],
    ["bostad", "lägenheter/hus m.m säljes/uthyres/köpes. vimmerby/hultsfred", ["Vimmerby", "Hultsfred"]],
    ["lokal", "Vimmerby,Hultsfred,Västervik Loppis för allt.", ["Vimmerby", "Hultsfred", "Västervik"]],
    ["lokal", "Hultsfreds anslagstavla", ["Hultsfred"]],
    ["lokal", "Målilla", ["Målilla", "Hultsfred"]],
  ]),
  ...lan("Blekinge", [
    ["bostad", "Lediga Bostäder i Karlshamn", ["Karlshamn"]],
    ["bostad", "Lediga Lägenheter Karlshamn", ["Karlshamn"]],
    ["bostad", "Lägenheter i Karlshamn", ["Karlshamn"]],
    ["lokal", "Det händer i Karlshamn", ["Karlshamn"]],
    ["bostad", "Lägenheter i Karlskrona - Öppen grupp", ["Karlskrona"]],
  ]),
  ...lan("Skåne", [
    ["bostad", "Bostad i Skåne 🏠 Lägenheter, Hus och Rum", []],
    ["bostad", "Lägenheter i Landskrona - Öppen grupp", ["Landskrona"]],
    ["bostad", "Lägenheter Kristianstad", ["Kristianstad"]],
    ["bostad", "Lägenheter i Kristianstad", ["Kristianstad"]],
    ["bostad", "Lediga Lägenheter Kristianstad", ["Kristianstad"]],
    ["bostad", "Boende i Åhus", ["Åhus", "Kristianstad"]],
    ["lokal", "Nya Åhus Med Omnejd", ["Åhus", "Kristianstad"]],
    ["bostad", "lägenhet Malmö &Trelleborg Lund Eslöv Köpenhaman", ["Malmö", "Trelleborg", "Lund", "Eslöv"]],
    ["bostad", "Lägenheter i Malmö", ["Malmö"]],
    ["bostad", "Lägenheter i Malmö - Öppen grupp", ["Malmö"]],
    ["bostad", "Lägenheter i Lund - Öppen grupp", ["Lund"]],
    ["bostad", "BOSTAD Helsingborg Önskas Hyra/uthyres/bytes", ["Helsingborg"]],
    ["bostad", "Lägenheter i Helsingborg", ["Helsingborg"]],
    ["bostad", "Lägenheter Helsingborg", ["Helsingborg"]],
    ["bostad", "Lägenheter i Helsingborg - Öppen grupp", ["Helsingborg"]],
  ]),
  ...lan("Halland", [
    ["bostad", "Lägenheter i Falkenberg", ["Falkenberg"]],
    ["bostad", "Lägenheter i Kungsbacka", ["Kungsbacka"]],
    ["bostad", "Hyra boende i Frillesås, Åsa, Stråvalla", ["Frillesås", "Åsa", "Stråvalla", "Kungsbacka", "Varberg"]],
  ]),
  ...lan("Västra Götaland", [
    ["bostad", "Bostad uthyres / önskas hyra Skaraborg", SKARABORG],
    ["bostad", "Lediga lägenheter/hus Skaraborg", SKARABORG],
    ["bostad", "Bostäder Skövde", ["Skövde"]],
    ["lokal", "Götenebor", ["Götene"]],
    ["bostad", "Lägenheter i Mölndal", ["Mölndal"]],
    ["bostad", "Lägenheter uthyres i Göteborg", ["Göteborg"]],
    ["bostad", "Lägenheter i Göteborg med omnejd", ["Göteborg"]],
    ["bostad", "Lägenhet sökes i Göteborg", ["Göteborg"]],
    ["bostad", "Lägenheter i Göteborg", ["Göteborg"], { antal: 2 }],
    ["bostad", "Lägenheter Göteborg", ["Göteborg"]],
    ["bostad", "Boende i Göteborg", ["Göteborg"]],
    ["bostad", "Hyra bostad Göteborg", ["Göteborg"]],
    ["bostad", "Lägenheter i Göteborg - Öppen grupp", ["Göteborg"]],
    ["bostad", "Lägenheter i Partille - Öppen grupp", ["Partille"]],
    ["bostad", "Lägenheter i Kungälv", ["Kungälv"], { antal: 2 }],
    ["bostad", "Lägenheter i Trollhättan", ["Trollhättan"]],
    ["bostad", "Lägenheter i Trollhättan - Öppen grupp", ["Trollhättan"]],
    ["bostad", "Lediga lägenheter i Ulricehamn", ["Ulricehamn"]],
    ["bostad", "Lediga Lägenheter Ulricehamn", ["Ulricehamn"]],
    ["bostad", "Köp, sälj och hyra hus, lägenheter i Uddevalla, Munkedal, Tanum & Strömstad", ["Uddevalla", "Munkedal", "Tanum", "Strömstad"]],
    ["bostad", "BOSTAD köp, sälj, hyra Strömstad", ["Strömstad"]],
    ["bostad", "Lägenheter i Uddevalla", ["Uddevalla"]],
    ["bostad", "Lägenheter i Uddevalla - Öppen grupp", ["Uddevalla"]],
  ]),
  ...lan(["Värmland", "Västra Götaland"], [["lokal", "Köp Och Sälj Runt Säffle Åmål", ["Säffle", "Åmål"]]]),
  ...lan("Värmland", [
    ["bostad", "Lägenheter/ hus uthyres och säljes i Karlstad + Värmland Län", []],
    ["bostad", "Lägenhet & hus sökes/uthyres i Säffle med omnejd!", ["Säffle"], { vantar: true }],
    ["bostad", "Bostäder och tjänster i Säffle med omnejd", ["Säffle"]],
    ["bostad", "Lediga lägenheter i Karlstad", ["Karlstad"]],
    ["bostad", "Hyra Lägenhet & Bostad i Karlstad", ["Karlstad"]],
    ["bostad", "Lägenheter i Karlstad", ["Karlstad"]],
    ["bostad", "Lediga Lägenheter Karlstad", ["Karlstad"]],
    ["bostad", "Lägenheter i Karlstad - Öppen grupp", ["Karlstad"]],
    ["lokal", "Karlstad: Säljes/Köpes/Bytes/Bortskänkes", ["Karlstad"]],
    ["bostad", "Lägenheter i Arvika", ["Arvika"]],
    ["lokal", "Arvika", ["Arvika"]],
    ["lokal", "Vi Som Bor I Arvika Kommun", ["Arvika"]],
    ["bostad", "Lediga Lägenheter Sunne", ["Sunne"]],
    ["lokal", "På gång i Sunne - Vi tipsar om vad som händer, när det händer...", ["Sunne"]],
  ]),
  ...lan("Örebro", [
    ["bostad", "Akut Boende I Örebro", ["Örebro"]],
    ["bostad", "Lägenheter i Örebro", ["Örebro"]],
    ["bostad", "Lägenheter i Örebro - Öppen grupp", ["Örebro"]],
    ["bostad", "Lediga lägenheter i karlskoga", ["Karlskoga"]],
  ]),
  ...lan("Västmanland", [
    ["bostad", "BOSTÄDER Västmanlands Län Hyres/säljes/bytes/köpes", []],
    ["bostad", "Uthyres/önskas Hyra Långsiktigt I Västmanland", []],
    ["bostad", "Jobb och bostad i Västerås - Work and live in Västerås", ["Västerås"]],
    ["bostad", "Lägenheter i Västerås", ["Västerås"], { antal: 2 }],
    ["bostad", "Möblerade boende uthyres i Västerås", ["Västerås"]],
    ["bostad", "Hyra Lägenhet & Bostad i Västerås", ["Västerås"]],
    ["bostad", "Lägenhet sökes i Västerås", ["Västerås"]],
    ["bostad", "Lediga lägenheter i Västerås – Hyra bostad Västerås", ["Västerås"]],
    ["bostad", "Lägenheter i Västerås - Öppen grupp", ["Västerås"]],
  ]),
  ...lan("Dalarna", [
    ["bostad", "Lägenheter i Avesta", ["Avesta"]],
    ["bostad", "Bostad & Lokal Sökes/Uthyres i Avesta med omnejd", ["Avesta"]],
    ["lokal", "HORNDAL Annonser från företag och föreningar.", ["Horndal", "Avesta"]],
    ["bostad", "Lägenheter i Falun", ["Falun"]],
    ["bostad", "Lägenheter / Rum Uthyres i Andra Hand Borlänge & Falun", ["Borlänge", "Falun"]],
    ["bostad", "Lediga Lägenheter Falun/Borlänge", ["Falun", "Borlänge"]],
    ["bostad", "Lägenheter i Falun - Öppen grupp", ["Falun"]],
    ["lokal", "Aktuellt i Enviken / Linghed / Svärdsjö / Sundborn med omnejd", ["Enviken", "Svärdsjö", "Sundborn", "Falun"]],
    ["bostad", "Lägenheter i Borlänge", ["Borlänge"]],
    ["bostad", "Lägenheter i Borlänge - Öppen grupp", ["Borlänge"]],
    ["bostad", "Lägenheter i Ludvika", ["Ludvika"]],
    ["bostad", "Lediga Lägenheter Ludvika", ["Ludvika"]],
    ["lokal", "Ludvika", ["Ludvika"]],
    ["bostad", "Lägenheter/Hus i Malung-Sälen", ["Malung", "Sälen"]],
    ["bostad", "Hyra/ uthyres boende i Sälen, Stöten & Kläppen", ["Sälen"]],
    ["bostad", "Sälen - Hyres eller uthyres stuga lägenhet", ["Sälen"]],
    ["bostad", "Boende i Sälen Uthyres / Hyres", ["Sälen"]],
    ["bostad", "Lägenheter i Mora", ["Mora"]],
    ["bostad", "Bostäder - Mora", ["Mora"]],
  ]),
  ...lan("Gävleborg", [
    ["bostad", "Bostad Gävleborg Lägenheter & Hus", []],
    ["bostad", "Uthyres Gävleborg", []],
    ["bostad", "Hyra Lägenhet & Bostad i Gävle", ["Gävle"]],
    ["bostad", "Lägenheter i Gävle", ["Gävle"]],
    ["bostad", "Lägenheter i Gävle - Öppen grupp", ["Gävle"]],
    ["bostad", "Lägenheter i Bollnäs", ["Bollnäs"]],
    ["bostad", "Boende uthyres/sökes Bollnäs-kommun", ["Bollnäs"]],
    ["bostad", "Boende uthyres och sökes i Bollnäs kommun", ["Bollnäs"]],
    ["lokal", "Bollnäs anslagstavla", ["Bollnäs"]],
    ["lokal", "Edsbyn - Alfta", ["Edsbyn", "Alfta", "Ovanåker"]],
  ]),
  ...lan("Västernorrland", [
    ["bostad", "Lägenheter i Sundsvall", ["Sundsvall"]],
    ["bostad", "Lägenheter i Sundsvall - Öppen grupp", ["Sundsvall"]],
    ["bostad", "Bostad i Sundsvall 🏠 Lägenheter, Hus och Rum", ["Sundsvall"]],
    ["bostad", "Lägenheter i Örnsköldsvik", ["Örnsköldsvik"]],
    ["bostad", "Villor & lägenheter i Örnsköldsvik, Husum, Hammerdal uthyres/säljas", ["Örnsköldsvik", "Husum"]],
    ["bostad", "Hyra Lägenhet & Bostad i Örnsköldsvik", ["Örnsköldsvik"]],
    ["bostad", "Lediga Lägenheter Örnsköldsvik", ["Örnsköldsvik"]],
    ["bostad", "Lägenheter i Örnsköldsvik - Öppen grupp", ["Örnsköldsvik"]],
    ["bostad", "Boende och lokaler i Sollefteå kommun", ["Sollefteå"]],
    ["lokal", "Långsele anslagstavla", ["Långsele", "Sollefteå"]],
    ["lokal", "Vad händer i Ånge? | Upplev Ånge", ["Ånge"]],
  ]),
  ...lan("Jämtland", [
    ["bostad", "Bostad Uthyres/Hyres Östersund", ["Östersund"]],
    ["bostad", "Lägenheter i Östersund - Öppen grupp", ["Östersund"]],
    ["lokal", "Köp o sälj Sveg med omnejd", ["Sveg", "Härjedalen"]],
  ]),
  ...lan(["Västerbotten", "Norrbotten"], [["bostad", "Byta Hyra Hyrköpa Bostad i Norr och Västerbotten", []]]),
  ...lan("Västerbotten", [
    ["bostad", "Lägenhet sökes i Umeå", ["Umeå"]],
    ["bostad", "Hyra Lägenhet & Bostad i Umeå", ["Umeå"]],
    ["bostad", "Lägenheter i Umeå", ["Umeå"]],
    ["bostad", "Umeå Lägenheter", ["Umeå"]],
    ["bostad", "Lägenheter i Umeå - Öppen grupp", ["Umeå"]],
    ["bostad", "lediga lägenheter i skellefteå", ["Skellefteå"]],
    ["bostad", "Lediga Lägenheter Skellefteå", ["Skellefteå"]],
    ["bostad", "Lägenheter i Skellefteå - Öppen grupp", ["Skellefteå"]],
    ["bostad", "Lycksele tillfälligt boende hyres/uthyres", ["Lycksele"]],
  ]),
  ...lan("Norrbotten", [
    ["bostad", "Bostäder Luleå", ["Luleå"]],
    ["bostad", "Lediga lägenheter & bostäder i Luleå", ["Luleå"]],
    ["bostad", "Bostäder i luleå", ["Luleå"]],
    ["bostad", "Bostad i luleå", ["Luleå"]],
    ["bostad", "Lägenheter i Luleå", ["Luleå"]],
    ["bostad", "Lägenheter i Luleå - Öppen grupp", ["Luleå"]],
    ["lokal", "KÖP, BYT & SÄLJ LOKALT I LULEÅ m. omnejd", ["Luleå"]],
    ["bostad", "Lediga Lägenheter Boden", ["Boden"]],
    ["bostad", "Hyra Lägenhet & Bostad i Boden", ["Boden"]],
    ["bostad", "Lägenheter i Boden", ["Boden"]],
    ["lokal", "Boden Aktuellt", ["Boden"]],
    ["lokal", "Boden Köp och Sälj", ["Boden"]],
    ["lokal", "Det händer i Boden", ["Boden"]],
    ["bostad", "Jobb och bostad i Kiruna - Work and live in Kiruna", ["Kiruna"]],
    ["bostad", "Lägenheter i Kiruna", ["Kiruna"]],
    ["bostad", "Lediga Lägenheter Kiruna", ["Kiruna"]],
    ["lokal", "Kiruna", ["Kiruna"]],
    ["lokal", "Nya Kiruna Fyndtorg", ["Kiruna"]],
  ]),
  ...lan("Hela Sverige", [
    ["rikstackande", "Lägenhetshus att hyra privat ägare", [], { antal: 2 }],
    ["rikstackande", "Lägenhet/hus Uthyres hela Sverige", []],
    ["rikstackande", "Radhus, Villor och Lägenheter uthyres Hela Sverige", []],
    ["rikstackande", "Hus, villor och gårdar UTHYRES", []],
    ["rikstackande", "Hitta lediga lägenheter och hus..", []],
    ["rikstackande", "Bostad Sökes / Säljes / Bytes / Köpes / uthyres", []],
    ["rikstackande", "Torp & stugor uthyres", []],
    ["rikstackande", "Torp och stugor, köp, sälj, hyr", []],
    ["rikstackande", "Semesterboende Uthyres", []],
  ]),
];

export function normalisera(text: string): string {
  return text.toLowerCase().trim().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/s?\s+lan$/, "");
}

export function gruppLank(namn: string): string {
  return `https://www.facebook.com/search/groups/?q=${encodeURIComponent(namn)}`;
}

export interface GruppUrval {
  ort: string;
  lan: string[];
  /** Bostadsgrupper för just orten. */
  iOrten: FacebookGrupp[];
  /** Anslagstavlor och lokala grupper i orten. */
  lokalaIOrten: FacebookGrupp[];
  /** Grupper för hela länet. */
  helaLanet: FacebookGrupp[];
  /** Bostadsgrupper för andra orter i samma län, för pendlingsavstånd. */
  narliggande: FacebookGrupp[];
  rikstackande: FacebookGrupp[];
}

/** Väljer grupper för en ort. Länet räknas fram ur grupplistan om det inte anges. */
export function grupperFor(ort: string, lanNamn?: string | null, grupper: FacebookGrupp[] = GRUPPER): GruppUrval {
  const o = normalisera(ort);
  const iOrtenAlla = grupper.filter((g) => g.typ !== "rikstackande" && g.orter.some((x) => normalisera(x) === o));
  const lanSet = new Set(
    lanNamn?.trim() ? [normalisera(lanNamn)] : iOrtenAlla.flatMap((g) => g.lan.map(normalisera)),
  );
  const iLanet = grupper.filter(
    (g) => g.typ !== "rikstackande" && !iOrtenAlla.includes(g) && g.lan.some((l) => lanSet.has(normalisera(l))),
  );
  return {
    ort,
    lan: [...new Set(grupper.flatMap((g) => g.lan).filter((l) => lanSet.has(normalisera(l))))],
    iOrten: iOrtenAlla.filter((g) => g.typ === "bostad"),
    lokalaIOrten: iOrtenAlla.filter((g) => g.typ === "lokal"),
    helaLanet: iLanet.filter((g) => g.orter.length === 0),
    narliggande: iLanet.filter((g) => g.orter.length > 0 && g.typ === "bostad"),
    rikstackande: grupper.filter((g) => g.typ === "rikstackande"),
  };
}
