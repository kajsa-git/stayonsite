export interface City {
  slug: string;
  name: string;
  region: string;
  population: string;
  description: string;
  highlights: string[];
  industries: string[];
  coordinates: [number, number];
}

export const cities: City[] = [
  {
    slug: "stockholm",
    name: "Stockholm",
    region: "Stockholms län",
    population: "975 000",
    description: "Sveriges huvudstad och största stad med omfattande byggnation och infrastrukturprojekt.",
    highlights: [
      "Stora infrastrukturprojekt som Nya Slussen",
      "Omfattande bostadsbyggnation",
      "Tunnelbanebyggnation",
      "Kontorsbyggnation i cityområden"
    ],
    industries: ["Bygg & Anläggning", "Infrastruktur", "Bostäder", "Kommersiellt"],
    coordinates: [59.3293, 18.0686]
  },
  {
    slug: "goteborg",
    name: "Göteborg",
    region: "Västra Götalands län",
    population: "580 000",
    description: "Sveriges andra största stad med stor hamn och aktiv byggsektor.",
    highlights: [
      "Stora hamnprojekt",
      "Spårvagnsutbyggnad",
      "Bostadsområden som Backaplan",
      "Industribyggnation"
    ],
    industries: ["Hamn & Logistik", "Industri", "Bostäder", "Transport"],
    coordinates: [57.7089, 11.9746]
  },
  {
    slug: "malmo",
    name: "Malmö",
    region: "Skåne län",
    population: "350 000",
    description: "Snabbväxande stad med många byggprojekt och närhet till Köpenhamn.",
    highlights: [
      "Västra Hamnen-projektet",
      "Citytunnel-underhåll",
      "Moderna bostadsområden",
      "Öresundsbron-relaterade projekt"
    ],
    industries: ["Bostäder", "Infrastruktur", "Kommersiellt", "Transport"],
    coordinates: [55.6050, 13.0038]
  },
  {
    slug: "uppsala",
    name: "Uppsala",
    region: "Uppsala län",
    population: "230 000",
    description: "Universitetsstad med stark tillväxt och många byggprojekt.",
    highlights: [
      "Universitetsbyggnader",
      "Nya bostadsområden",
      "Forskningsanläggningar",
      "Infrastrukturprojekt"
    ],
    industries: ["Utbildning", "Forskning", "Bostäder", "Offentlig sektor"],
    coordinates: [59.8586, 17.6389]
  },
  {
    slug: "vasteras",
    name: "Västerås",
    region: "Västmanlands län",
    population: "155 000",
    description: "Industristad med stora energiprojekt och byggverksamhet.",
    highlights: [
      "Kraftverksbyggnation",
      "Industrianläggningar",
      "Bostadsprojekt",
      "Energiinfrastruktur"
    ],
    industries: ["Energi", "Industri", "Bygg & Anläggning", "Bostäder"],
    coordinates: [59.6162, 16.5528]
  },
  {
    slug: "orebro",
    name: "Örebro",
    region: "Örebro län",
    population: "155 000",
    description: "Strategiskt belägen stad med växande byggsektor.",
    highlights: [
      "Universitetsexpansion",
      "Sjukhusbyggnation",
      "Centrala bostadsprojekt",
      "Logistikanläggningar"
    ],
    industries: ["Utbildning", "Vård", "Logistik", "Bostäder"],
    coordinates: [59.2741, 15.2066]
  },
  {
    slug: "linkoping",
    name: "Linköping",
    region: "Östergötlands län",
    population: "165 000",
    description: "Teknologistad med avancerade byggprojekt och forskningsanläggningar.",
    highlights: [
      "Universitetsbyggnader",
      "Teknikpark-utveckling",
      "Moderna bostadsområden",
      "Forskningscentra"
    ],
    industries: ["Teknologi", "Forskning", "Utbildning", "Industri"],
    coordinates: [58.4108, 15.6214]
  },
  {
    slug: "helsingborg",
    name: "Helsingborg",
    region: "Skåne län",
    population: "150 000",
    description: "Hamnstad med aktiv byggsektor och närhet till Danmark.",
    highlights: [
      "Hamnområdesutveckling",
      "Logistikcentra",
      "Bostadsprojekt",
      "Kommersiella anläggningar"
    ],
    industries: ["Hamn & Logistik", "Kommersiellt", "Bostäder", "Transport"],
    coordinates: [56.0465, 12.6945]
  },
  {
    slug: "jonkoping",
    name: "Jönköping",
    region: "Jönköpings län",
    population: "140 000",
    description: "Industristad vid Vättern med många byggprojekt.",
    highlights: [
      "Industriexpansion",
      "Universitetsbyggnation",
      "Centrumförnyelse",
      "Bostadsutveckling"
    ],
    industries: ["Industri", "Utbildning", "Kommersiellt", "Bostäder"],
    coordinates: [57.7826, 14.1618]
  },
  {
    slug: "norrkoping",
    name: "Norrköping",
    region: "Östergötlands län",
    population: "145 000",
    description: "Industristad med omfattande förnyelse och byggprojekt.",
    highlights: [
      "Industriområdesförnyelse",
      "Campusbyggnation",
      "Stadsdelsutveckling",
      "Infrastrukturprojekt"
    ],
    industries: ["Industri", "Utbildning", "Stadsförnyelse", "Teknik"],
    coordinates: [58.5942, 16.1826]
  }
];

export const getCityBySlug = (slug: string): City | undefined => {
  return cities.find(city => city.slug === slug);
};