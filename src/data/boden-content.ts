import type { CityPageContent } from './cities';
import type { LocalizedString } from '@/types/localized';

const ls = (sv: string, en: string, pl: string): LocalizedString => ({ sv, en, pl });

export const bodenPageContent: CityPageContent = {
  metadataDescription: ls(
    'Företagsboende i Boden för arbetslag: möblerade hus och lägenheter. Se bostäder och fråga om pris, sovrum, parkering och hyresperiod för ert projekt.',
    'Corporate housing in Boden for project teams. Furnished houses and apartments, with bedrooms, parking, rental dates and included services confirmed before booking.',
    'Zakwaterowanie firmowe w Boden: umeblowane domy i mieszkania dla ekip. Zapytaj o cenę, sypialnie, parking i okres najmu na potrzeby projektu.'
  ),
  projectsLabel: ls('För arbetslag', 'For project teams', 'Dla ekip projektowych'),
  projectsHeading: ls(
    'Personalboende för bygg, industri och montage i Boden',
    'Worker accommodation for construction, industry and installation in Boden',
    'Noclegi dla ekip budowlanych, przemysłowych i montażowych w Boden'
  ),
  checklistDescription: ls(
    'Samla arbetslagets boendekrav i vår ifyllbara PDF-mall och skicka underlaget till StayOnSite för ett boendeförslag.',
    'Collect your team’s requirements in our fillable PDF and send them to StayOnSite for an accommodation proposal.',
    'Zbierz wymagania zespołu w naszym formularzu PDF i prześlij je do StayOnSite, aby otrzymać propozycję zakwaterowania.'
  ),
  neighborhoodsIntro: ls(
    'Arbetsplatsens läge och projektperioden avgör vilka områden som passar. Vi stämmer av restid och parkeringsbehov för aktuella boendealternativ.',
    'The worksite location and project dates determine which areas suit your team. We check travel time and parking needs for the available accommodation options.',
    'Lokalizacja miejsca pracy i termin projektu decydują o wyborze okolicy. Dla dostępnych obiektów sprawdzamy dojazd i wymagania parkingowe.'
  ),
  listingNote: ls(
    'Se publicerade bostäder nedan. Tillgänglighet för era datum, pris och vad som ingår bekräftas i boendeförslaget.',
    'Browse published properties below. Availability for your dates, price and included services are confirmed in the accommodation proposal.',
    'Poniżej znajdziesz opublikowane oferty. Dostępność w wybranym terminie, cenę i zakres usług potwierdzamy w propozycji zakwaterowania.'
  ),
  processIntro: ls(
    'Skicka en förfrågan till StayOnSite med projektperiod och arbetslagets behov. Vi kontrollerar boendealternativ i Boden och återkommer med ett förslag.',
    'Send StayOnSite your project dates and accommodation requirements. We check housing options in Boden and get back to you with a proposal.',
    'Wyślij do StayOnSite termin projektu i wymagania zespołu. Sprawdzimy możliwości zakwaterowania w Boden i przygotujemy propozycję.'
  ),
  inquiryChecklist: [
    ls('Antal personer och hur många separata sovrum ni behöver.', 'Number of people and separate bedrooms required.', 'Liczba osób i potrzebnych oddzielnych sypialni.'),
    ls('In- och utflyttningsdatum samt arbetsplatsens adress eller område.', 'Arrival and departure dates, plus the worksite address or area.', 'Daty przyjazdu i wyjazdu oraz adres lub lokalizacja miejsca pracy.'),
    ls('Behov av parkering för servicebilar, tvätt och eventuell städning.', 'Parking for work vans, laundry facilities and any cleaning requirements.', 'Wymagania dotyczące parkingu dla pojazdów służbowych, prania i sprzątania.'),
  ],
  processSteps: [
    {
      title: ls('Beskriv arbetslagets behov', 'Tell us what your team needs', 'Opisz potrzeby zespołu'),
      description: ls(
        'Ange datum, antal personer, sovrum och arbetsplats. Berätta vilka krav som är viktigast för er.',
        'Provide dates, team size, bedrooms and the worksite location. Tell us which requirements matter most.',
        'Podaj termin, liczbę osób, sypialnie i miejsce pracy. Wskaż najważniejsze wymagania.'
      ),
    },
    {
      title: ls('Få ett boendeförslag', 'Receive an accommodation proposal', 'Otrzymaj propozycję zakwaterowania'),
      description: ls(
        'Vi kontrollerar alternativ för er period och återkommer med pris, bostadsuppgifter och vad som ingår.',
        'We check options for your dates and provide prices, property details and included services.',
        'Sprawdzamy możliwości w wybranym terminie i przedstawiamy cenę, szczegóły obiektu oraz zakres usług.'
      ),
    },
    {
      title: ls('Bekräfta villkoren', 'Confirm the terms', 'Potwierdź warunki'),
      description: ls(
        'Vi går igenom hyresperiod, eventuella tillägg och villkor för ändringar innan ni bokar.',
        'We review the rental period, any extra charges and the terms for changes before you book.',
        'Przed rezerwacją omawiamy okres najmu, ewentualne dopłaty i warunki zmian.'
      ),
    },
    {
      title: ls('Planera inflyttningen', 'Plan your arrival', 'Zaplanuj przyjazd'),
      description: ls(
        'När bokningen är klar stämmer vi av ankomst, nycklar och kontaktvägar under vistelsen.',
        'Once the booking is confirmed, we agree on arrival, keys and contact details for the stay.',
        'Po potwierdzeniu rezerwacji ustalamy przyjazd, odbiór kluczy i sposób kontaktu podczas pobytu.'
      ),
    },
  ],
  faq: [
    {
      question: ls('Vad kostar företagsboende i Boden?', 'What does corporate housing in Boden cost?', 'Ile kosztuje zakwaterowanie firmowe w Boden?'),
      answer: ls(
        'Priset beror på bostad, antal sovrum, hyresperiod och önskad service. Skicka datum och arbetslagets behov till StayOnSite så tar vi fram ett boendeförslag. Pris och eventuella tillägg bekräftas innan ni bokar.',
        'The price depends on the property, bedrooms, rental period and services requested. Send StayOnSite your dates and requirements for a proposal. Prices and any extra charges are confirmed before booking.',
        'Cena zależy od obiektu, liczby sypialni, okresu najmu i wybranych usług. Prześlij StayOnSite termin i wymagania zespołu, aby otrzymać propozycję. Cenę i ewentualne dopłaty potwierdzamy przed rezerwacją.'
      ),
    },
    {
      question: ls('Vad ingår i boendet?', 'What is included in the accommodation?', 'Co jest wliczone w zakwaterowanie?'),
      answer: ls(
        'Det varierar mellan bostäderna. I boendeförslaget anger vi vad som ingår, exempelvis el, värme, wifi, sängkläder och städning, samt eventuella tillägg. Kontrollera uppgifterna för det boende ni vill boka.',
        'This varies between properties. The proposal states whether electricity, heating, wifi, bed linen and cleaning are included, along with any extra charges. Check the details for the property you wish to book.',
        'Zakres różni się między obiektami. W propozycji podajemy, czy prąd, ogrzewanie, wifi, pościel i sprzątanie są wliczone w cenę, oraz wskazujemy ewentualne dopłaty. Sprawdź szczegóły wybranego obiektu.'
      ),
    },
    {
      question: ls('Kan vi få egna sovrum och parkering för servicebilar?', 'Can we request separate bedrooms and parking for work vans?', 'Czy możemy zamówić oddzielne sypialnie i parking dla pojazdów służbowych?'),
      answer: ls(
        'Ange hur många separata sovrum ni behöver och vilka fordon som ska parkeras. Vi kontrollerar rumsfördelning och parkeringsmöjligheter för varje boende innan ni bokar.',
        'Tell us how many separate bedrooms you need and which vehicles require parking. We check the room layout and parking options for each property before booking.',
        'Podaj liczbę potrzebnych oddzielnych sypialni i rodzaje pojazdów. Przed rezerwacją sprawdzamy układ pokoi oraz możliwości parkowania w każdym obiekcie.'
      ),
    },
    {
      question: ls('Vilka hyresperioder är möjliga?', 'Which rental periods are available?', 'Jakie okresy najmu są możliwe?'),
      answer: ls(
        'Vi hyr ut från tre månader och uppåt. Skicka önskat start- och slutdatum, även om projektets slut är preliminärt. Villkor för förlängning eller ändringar bekräftas för det aktuella boendet.',
        'Our minimum rental period is three months. Send your preferred start and end dates, even if the project end is provisional. Extension and change terms are confirmed for the property concerned.',
        'Minimalny okres najmu to trzy miesiące. Prześlij planowane daty rozpoczęcia i zakończenia, nawet jeśli koniec projektu jest wstępny. Warunki przedłużenia i zmian potwierdzamy dla konkretnego obiektu.'
      ),
    },
    {
      question: ls('Kan vi fråga om flera bostäder till samma arbetslag?', 'Can we enquire about several properties for one team?', 'Czy możemy zapytać o kilka obiektów dla jednego zespołu?'),
      answer: ls(
        'Ja, skicka en gemensam förfrågan med totalt antal personer och önskad rumsfördelning. Vi undersöker vilka alternativ som finns för perioden och stämmer av restid till arbetsplatsen med er.',
        'Yes. Send one enquiry with the total headcount and preferred room allocation. We check options for the period and discuss travel to the worksite with you.',
        'Tak. Wyślij jedno zapytanie z łączną liczbą osób i preferowanym podziałem pokoi. Sprawdzimy możliwości w danym terminie i omówimy dojazd do miejsca pracy.'
      ),
    },
    {
      question: ls('Hur får vi ett boendeförslag i Boden?', 'How do we request accommodation in Boden?', 'Jak otrzymać propozycję zakwaterowania w Boden?'),
      answer: ls(
        'Fyll i formuläret på sidan eller kontakta StayOnSite på kajsa@stayonsite.se eller 076-249 84 86. Ange datum, antal personer, behov av sovrum och arbetsplatsens adress eller område.',
        'Use the form on this page or contact StayOnSite at kajsa@stayonsite.se or +46 76 249 84 86. Include dates, headcount, bedroom requirements and the worksite address or area.',
        'Wypełnij formularz na stronie lub skontaktuj się ze StayOnSite: kajsa@stayonsite.se, +46 76 249 84 86. Podaj termin, liczbę osób, wymagania dotyczące sypialni i lokalizację miejsca pracy.'
      ),
    },
  ],
  showRating: false,
  updatedAt: '2026-10-20',
};
