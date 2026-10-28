import type { City, CityFAQ, CityPageContent, CityProject } from '../cities';
import type { LocalizedString } from '@/types/localized';

export const ls = (sv: string, en: string, pl: string): LocalizedString => ({ sv, en, pl });
export const CITY_GUIDES_UPDATED = '2026-10-28';

export interface GuideArea {
  name: string;
  suitableFor: LocalizedString;
  check: LocalizedString;
}

export interface CityGuide {
  areas: GuideArea[];
  planning: Array<{ title: LocalizedString; paragraphs: LocalizedString[] }>;
  sources: Array<{ title: string; url: string }>;
  reviewedAt: string;
}

interface GuideInput extends Omit<CityGuide, 'reviewedAt'> {
  name: string;
  hero: LocalizedString;
  intro: LocalizedString;
  metadata: LocalizedString;
  projects: CityProject[];
  faq: CityFAQ[];
  nearby: string[];
}

export type GuideCityContent = Pick<City,
  'description' | 'highlights' | 'industries' | 'heroHook' | 'intro' |
  'metrics' | 'neighborhoods' | 'projects' | 'testimonial' | 'pageContent' |
  'faq' | 'nearby' | 'guide'
>;

function pageContent(input: GuideInput): CityPageContent {
  const name = input.name;
  return {
    metadataDescription: input.metadata,
    projectsLabel: ls('Arbetsplatser och projekt', 'Worksites and projects', 'Miejsca pracy i projekty'),
    projectsHeading: ls(
      'Personalboende nära arbetsplatserna i ' + name,
      'Worker accommodation for projects in ' + name,
      'Zakwaterowanie dla ekip pracujących w ' + name,
    ),
    checklistDescription: ls(
      'Samla datum, sovrum, fordon och servicebehov i vår ifyllbara boendebrief. Skicka den till StayOnSite så kan vi jämföra bostäder mot samma krav.',
      'Use our fillable accommodation brief to collect dates, bedrooms, vehicles and service needs. Send it to StayOnSite so we can compare properties against the same requirements.',
      'Zbierz terminy, sypialnie, pojazdy i wymagania dotyczące usług w naszym formularzu. Prześlij go do StayOnSite, abyśmy mogli porównać obiekty według tych samych kryteriów.',
    ),
    neighborhoodsIntro: ls(
      'Jämför området med arbetsplatsens faktiska infart och arbetslagets vardag. Restid, parkering och tillgänglighet kontrolleras för den bostad och period ni vill boka.',
      'Compare each area with the actual worksite entrance and your team’s daily routine. Travel, parking and availability are checked for the property and dates you wish to book.',
      'Porównaj okolicę z rzeczywistym wjazdem na teren pracy i codziennymi potrzebami zespołu. Dojazd, parking i dostępność sprawdzamy dla konkretnego obiektu oraz terminu.',
    ),
    listingNote: ls(
      'Här visas publicerade bostäder. Antal bäddar och sovrum hjälper er att jämföra alternativen; tillgänglighet för era datum, pris och service bekräftas i boendeförslaget.',
      'These are published properties. Bed and bedroom counts help you compare options; availability for your dates, price and services are confirmed in your proposal.',
      'Poniżej znajdują się opublikowane oferty. Liczba łóżek i sypialni ułatwia porównanie; dostępność w wybranym terminie, cenę i usługi potwierdzamy w propozycji.',
    ),
    processIntro: ls(
      'Skicka projektperiod, arbetsplats och rumsbehov till StayOnSite. Vi undersöker bostäder i ' + name + ' och går igenom läge, kostnad och villkor med er före bokning.',
      'Send StayOnSite your project dates, worksite and room requirements. We check properties in ' + name + ' and review location, cost and terms with you before booking.',
      'Prześlij StayOnSite termin projektu, miejsce pracy i wymagania dotyczące pokoi. Sprawdzimy obiekty w ' + name + ' i przed rezerwacją omówimy lokalizację, koszty oraz warunki.',
    ),
    inquiryChecklist: [
      ls('Arbetsplatsens adress eller infart, skifttider och längsta acceptabla restid.', 'Worksite address or entrance, shift times and maximum acceptable commute.', 'Adres lub wjazd na teren pracy, godziny zmian i maksymalny akceptowany dojazd.'),
      ls('Antal personer, separata sovrum och badrum samt fordon som behöver parkering.', 'Headcount, separate bedrooms and bathrooms, and vehicles needing parking.', 'Liczba osób, oddzielnych sypialni i łazienek oraz pojazdów wymagających parkingu.'),
      ls('Start- och slutdatum, preliminära förlängningar och eventuella personalbyten.', 'Start and end dates, possible extensions and any crew changes.', 'Daty rozpoczęcia i zakończenia, możliwe przedłużenia i zmiany składu zespołu.'),
    ],
    processSteps: [
      {
        title: ls('Beskriv uppdraget', 'Describe the assignment', 'Opisz zlecenie'),
        description: ls('Ange datum, personer, sovrum och arbetsplats. Skilj på krav och önskemål så att rätt bostäder kan jämföras.', 'Provide dates, headcount, bedrooms and worksite. Separate essential requirements from preferences to help compare suitable properties.', 'Podaj terminy, liczbę osób, sypialnie i miejsce pracy. Oddziel wymagania od preferencji, aby ułatwić dobór obiektów.'),
      },
      {
        title: ls('Jämför boendeförslaget', 'Compare the proposal', 'Porównaj propozycję'),
        description: ls('Vi stämmer av alternativ för er period, rumsfördelning, parkering, pris och vad som ingår.', 'We check options for your dates, room allocation, parking, price and included services.', 'Sprawdzamy możliwości na wskazany termin, podział pokoi, parking, cenę i zakres usług.'),
      },
      {
        title: ls('Bekräfta villkoren', 'Confirm the terms', 'Potwierdź warunki'),
        description: ls('Hyresperiod, betalning, eventuella tillägg och villkor för ändringar gås igenom innan ni bokar.', 'Rental period, payment, any extras and change terms are reviewed before booking.', 'Przed rezerwacją omawiamy okres najmu, płatności, ewentualne dopłaty i warunki zmian.'),
      },
      {
        title: ls('Planera inflyttningen', 'Plan your arrival', 'Zaplanuj przyjazd'),
        description: ls('Stäm av ankomsttid, nycklar, rumsfördelning och vem arbetslaget kontaktar under vistelsen.', 'Agree arrival time, key collection, room allocation and who the team contacts during the stay.', 'Ustal godzinę przyjazdu, odbiór kluczy, przydział pokoi i osobę kontaktową na czas pobytu.'),
      },
    ],
    faq: [
      ...input.faq,
      {
        question: ls('Vad kostar företagsboende i ' + name + '?', 'What does corporate housing in ' + name + ' cost?', 'Ile kosztuje zakwaterowanie firmowe w ' + name + '?'),
        answer: ls(
          'Priset beror på bostad, antal separata sovrum, hyresperiod och service. Be om en total månadskostnad där el, värme, wifi, parkering, städning och eventuella tillägg är specificerade. Skicka datum, personer och budget till StayOnSite för ett boendeförslag.',
          'The price depends on the property, separate bedrooms, rental period and services. Ask for a total monthly cost specifying electricity, heating, wifi, parking, cleaning and any extras. Send StayOnSite your dates, headcount and budget for a proposal.',
          'Cena zależy od obiektu, liczby oddzielnych sypialni, okresu najmu i usług. Poproś o całkowity koszt miesięczny z wyszczególnieniem prądu, ogrzewania, wifi, parkingu, sprzątania i dopłat. Prześlij StayOnSite termin, liczbę osób oraz budżet.',
        ),
      },
      {
        question: ls('Hur länge kan vi hyra, och går det att förlänga?', 'How long can we rent, and can we extend?', 'Na jak długo można wynająć obiekt i czy można przedłużyć pobyt?'),
        answer: ls(
          'Vi hyr ut från tre månader och uppåt. Ange både bekräftade datum och den period som kan tillkomma. En förlängning behöver stämmas av innan det befintliga avtalet löper ut; möjligheten, uppsägningstiden och villkoren beror på det aktuella boendet.',
          'Our minimum rental period is three months. Include confirmed dates and any possible additional period. An extension needs to be agreed before the existing contract ends; availability, notice periods and terms depend on the property.',
          'Minimalny okres najmu to trzy miesiące. Podaj potwierdzone daty i możliwy dodatkowy okres. Przedłużenie należy uzgodnić przed końcem umowy; dostępność, okres wypowiedzenia i warunki zależą od danego obiektu.',
        ),
      },
      {
        question: ls('Vad behöver ni för att ta fram ett boendeförslag?', 'What do you need to prepare an accommodation proposal?', 'Jakie informacje są potrzebne do przygotowania propozycji?'),
        answer: ls(
          'Ange arbetsplatsens adress, datum, antal personer, separata sovrum, skifttider och fordon. Skriv även budget och önskemål om kök, tvätt och städning. Använd formuläret på sidan eller kontakta kajsa@stayonsite.se eller 076-249 84 86.',
          'Include the worksite address, dates, headcount, separate bedrooms, shift times and vehicles. Add your budget and kitchen, laundry and cleaning requirements. Use the form on this page or contact kajsa@stayonsite.se or +46 76 249 84 86.',
          'Podaj adres pracy, terminy, liczbę osób i oddzielnych sypialni, godziny zmian oraz pojazdy. Dodaj budżet i wymagania dotyczące kuchni, prania i sprzątania. Skorzystaj z formularza lub napisz na kajsa@stayonsite.se albo zadzwoń pod +46 76 249 84 86.',
        ),
      },
    ],
    showRating: false,
    updatedAt: CITY_GUIDES_UPDATED,
  };
}

export function defineGuide(input: GuideInput): GuideCityContent {
  return {
    description: input.intro.sv,
    highlights: input.projects.map((project) => project.name.sv),
    industries: ['Bygg & Anläggning', 'Industri', 'Installation', 'Infrastruktur'],
    heroHook: input.hero,
    intro: input.intro,
    metrics: [],
    neighborhoods: input.areas.map((area) => ({
      name: ls(area.name, area.name, area.name),
      description: area.suitableFor,
      distance: area.check,
    })),
    projects: input.projects,
    testimonial: null,
    pageContent: pageContent(input),
    faq: [],
    nearby: input.nearby,
    guide: {
      areas: input.areas,
      planning: input.planning,
      sources: input.sources,
      reviewedAt: CITY_GUIDES_UPDATED,
    },
  };
}
