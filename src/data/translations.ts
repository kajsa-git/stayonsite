export type AvailableLanguages = 'sv' | 'en' | 'pl';

export type TranslationKey =
  | 'nav.home'
  | 'nav.services'
  | 'nav.references'
  | 'nav.contact'
  | 'nav.case'
  | 'nav.inquiryForm'
  | 'nav.homeowner'
  | 'nav.forCompanies'
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.cta'
  | 'hero.tagline'
  | 'hero.bullet1'
  | 'hero.bullet2'
  | 'hero.bullet3'
  | 'hero.ctaPhone'
  | 'hero.ctaWhatsapp'
  | 'hero.ctaSubtext'
  | 'hero.responseTime'
  | 'hero.metrics.proposal.value'
  | 'hero.metrics.proposal.description'
  | 'hero.metrics.moveIn.value'
  | 'hero.metrics.moveIn.description'
  | 'hero.metrics.deployments.value'
  | 'hero.metrics.deployments.description'
  | 'services.title'
  | 'services.subtitle'
  | 'services.tagline'
  | 'services.process.title'
  | 'services.process.step1.title'
  | 'services.process.step1.description'
  | 'services.process.step2.title'
  | 'services.process.step2.description'
  | 'services.process.step3.title'
  | 'services.process.step3.description'
  | 'services.process.step4.title'
  | 'services.process.step4.description'
  | 'services.security.title'
  | 'services.security.description'
  | 'services.whyus.title'
  | 'services.whyus.point1'
  | 'services.whyus.point2'
  | 'services.whyus.point3'
  | 'services.whyus.point4'
  | 'references.title'
  | 'references.subtitle'
  | 'references.tagline'
  | 'references.testimonial1.quote'
  | 'references.testimonial1.author'
  | 'references.testimonial1.company'
  | 'references.testimonial2.quote'
  | 'references.testimonial2.author'
  | 'references.testimonial2.company'
  | 'references.testimonial3.quote'
  | 'references.testimonial3.author'
  | 'references.testimonial3.company'
  | 'inquiry.title'
  | 'inquiry.subtitle'
  | 'inquiry.tagline'
  | 'inquiry.form.companyName'
  | 'inquiry.form.contactName'
  | 'inquiry.form.email'
  | 'inquiry.form.phone'
  | 'inquiry.form.location'
  | 'inquiry.form.workers'
  | 'inquiry.form.startDate'
  | 'inquiry.form.endDate'
  | 'inquiry.form.message'
  | 'inquiry.form.submit'
  | 'inquiry.form.success'
  | 'inquiry.form.error'
  | 'inquiry.form.untilFurtherNotice'
  | 'inquiry.contactInfo.title'
  | 'inquiry.cta.meeting'
  | 'faq.title'
  | 'faq.subtitle'
  | 'faq.tagline'
  | 'faq.question1'
  | 'faq.answer1'
  | 'faq.question2'
  | 'faq.answer2'
  | 'faq.question3'
  | 'faq.answer3'
  | 'faq.question4'
  | 'faq.answer4'
  | 'faq.question5'
  | 'faq.answer5'
  | 'footer.rights'
  | 'footer.contact'
  | 'footer.description'
  | 'footer.quickLinks'
  | 'footer.location'
  | 'floatingPhone.call'
  | 'floatingPhone.tooltip'
  | 'floatingPhone.whatsapp'
  | 'floatingPhone.whatsappTooltip'
  | 'stickyContact.title'
  | 'stickyContact.subtitle'
  | 'stickyContact.call'
  | 'why.title'
  | 'why.subtitle'
  | 'why.steps.plan.title'
  | 'why.steps.plan.description'
  | 'why.steps.plan.cta'
  | 'why.steps.contracts.title'
  | 'why.steps.contracts.description'
  | 'why.steps.contracts.cta'
  | 'why.steps.operations.title'
  | 'why.steps.operations.description'
  | 'why.steps.operations.cta'
  | 'case.title'
  | 'case.subtitle'
  | 'case.timeline.proposal.title'
  | 'case.timeline.proposal.description'
  | 'case.timeline.moveIn.title'
  | 'case.timeline.moveIn.description'
  | 'case.timeline.expand.title'
  | 'case.timeline.expand.description'
  | 'case.metrics.proposal.value'
  | 'case.metrics.proposal.description'
  | 'case.metrics.moveIn.value'
  | 'case.metrics.moveIn.description'
  | 'case.metrics.deployments.value'
  | 'case.metrics.deployments.description'
  | 'homeowner.hero.title'
  | 'homeowner.hero.subtitle'
  | 'homeowner.hero.incomeRange'
  | 'homeowner.hero.incomeDescription'
  | 'homeowner.hero.cta'
  | 'homeowner.benefits.title'
  | 'homeowner.benefits.subtitle'
  | 'homeowner.benefits.income.title'
  | 'homeowner.benefits.income.description'
  | 'homeowner.benefits.security.title'
  | 'homeowner.benefits.security.description'
  | 'homeowner.benefits.hassle.title'
  | 'homeowner.benefits.hassle.description'
  | 'homeowner.benefits.flexibility.title'
  | 'homeowner.benefits.flexibility.description'
  | 'homeowner.process.title'
  | 'homeowner.process.subtitle'
  | 'homeowner.process.step1.title'
  | 'homeowner.process.step1.description'
  | 'homeowner.process.step2.title'
  | 'homeowner.process.step2.description'
  | 'homeowner.process.step3.title'
  | 'homeowner.process.step3.description'
  | 'homeowner.process.step4.title'
  | 'homeowner.process.step4.description'
  | 'homeowner.testimonials.title'
  | 'homeowner.testimonials.subtitle'
  | 'homeowner.testimonials.testimonial1.quote'
  | 'homeowner.testimonials.testimonial1.author'
  | 'homeowner.testimonials.testimonial1.location'
  | 'homeowner.testimonials.testimonial1.income'
  | 'homeowner.testimonials.testimonial2.quote'
  | 'homeowner.testimonials.testimonial2.author'
  | 'homeowner.testimonials.testimonial2.location'
  | 'homeowner.testimonials.testimonial2.income'
  | 'homeowner.testimonials.testimonial3.quote'
  | 'homeowner.testimonials.testimonial3.author'
  | 'homeowner.testimonials.testimonial3.location'
  | 'homeowner.testimonials.testimonial3.income'
  | 'homeowner.testimonials.trustIndicator'
  | 'homeowner.testimonials.trustDescription'
  | 'homeowner.faq.title'
  | 'homeowner.faq.subtitle'
  | 'homeowner.faq.question1'
  | 'homeowner.faq.answer1'
  | 'homeowner.faq.question2'
  | 'homeowner.faq.answer2'
  | 'homeowner.faq.question4'
  | 'homeowner.faq.answer4'
  | 'homeowner.faq.question5'
  | 'homeowner.faq.answer5'
  | 'homeowner.faq.question6'
  | 'homeowner.faq.answer6'
  | 'homeowner.faq.contactPrompt'
  | 'homeowner.form.title'
  | 'homeowner.form.subtitle'
  | 'homeowner.form.promise'
  | 'homeowner.form.promiseDescription'
  | 'homeowner.form.fieldsTitle'
  | 'homeowner.form.fieldsSubtitle'
  | 'homeowner.form.firstName'
  | 'homeowner.form.firstNamePlaceholder'
  | 'homeowner.form.lastName'
  | 'homeowner.form.lastNamePlaceholder'
  | 'homeowner.form.email'
  | 'homeowner.form.emailPlaceholder'
  | 'homeowner.form.phone'
  | 'homeowner.form.phonePlaceholder'
  | 'homeowner.form.address'
  | 'homeowner.form.addressPlaceholder'
  | 'homeowner.form.city'
  | 'homeowner.form.cityPlaceholder'
  | 'homeowner.form.submit'
  | 'homeowner.form.submitting'
  | 'homeowner.form.success'
  | 'homeowner.form.error'
  | 'homeowner.form.disclaimer'
  | 'references.stats.happyClients'
  | 'references.stats.accommodations'
  | 'references.stats.responseTime'
  | 'references.stats.cities'
  | 'seo.home.title'
  | 'seo.home.description'
  | 'seo.homeowner.title'
  | 'seo.homeowner.description'
  | 'seo.city.title'
  | 'seo.city.description'
  | 'seo.notFound.title'
  | 'seo.notFound.description';

export const translations: Record<AvailableLanguages, Record<TranslationKey, string>> = {
  sv: {
    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.references': 'Referenser',
    'nav.contact': 'Kontakt',
    'nav.case': 'Case Säffle',
    'nav.inquiryForm': 'Ring oss',
    'nav.forCompanies': 'För byggbolag',
    
    'hero.title': 'Vi löser boendet när ni bygger i Sverige',
    'hero.subtitle': 'Från första ingenjör till sista montör – planering, kontrakt och inflytt på plats inom 48 timmar.',
    'hero.cta': 'Skicka förfrågan',
    'hero.tagline': 'Etableringspartner i Sverige',
    'hero.bullet1': 'Vårt lokala team följer projektet från planering till drift',
    'hero.bullet2': 'Tydliga villkor och kontrakt 3–36 månader',
    'hero.bullet3': 'En kontaktväg – telefon, SMS eller WhatsApp dygnet runt',
    'hero.ctaPhone': 'Ring oss nu',
    'hero.ctaWhatsapp': 'Chatta på WhatsApp',
    'hero.ctaSubtext': '+46 73-628 77 09 · Telefon / SMS / WhatsApp',
    'hero.responseTime': 'Svar inom 15 minuter vardagar',
    'hero.metrics.proposal.value': '24 h',
    'hero.metrics.proposal.description': 'Första boendeförslaget',
    'hero.metrics.moveIn.value': '48 h',
    'hero.metrics.moveIn.description': 'Första inflytten klar',
    'hero.metrics.deployments.value': '3 orter',
    'hero.metrics.deployments.description': 'Per kund i snitt',
    
    'services.title': 'Våra tjänster',
    'services.subtitle': 'Vi säkrar personalboenden nära era sajter – från två veckor till flera år – över hela Sverige.',
    'services.tagline': 'Enkelt och smidigt',
    'services.process.title': 'Så här fungerar det',
    'services.process.step1.title': 'Skicka förfrågan',
    'services.process.step1.description': 'Fyll i vårt enkla formulär med detaljer om era behov',
    'services.process.step2.title': 'Snabbt svar',
    'services.process.step2.description': 'Vi svarar via mail, SMS eller WhatsApp – oftast inom 15 minuter, alltid inom ett dygn',
    'services.process.step3.title': 'Bekräftelse',
    'services.process.step3.description': 'Välj det alternativ som passar er bäst, och vi bokar det åt er',
    'services.process.step4.title': 'Inflyttning',
    'services.process.step4.description': 'Era arbetare får all information de behöver för en smidig inflyttning',
    'services.security.title': 'Trygghet genom erfaren partner',
    'services.security.description': 'Inga mellanhänder, inga vänteköer. Ni når oss direkt och vi återkopplar – oftast inom 15 minuter, alltid inom ett dygn. 10+ års erfarenhet från byggbranschen.',
    'services.whyus.title': 'Varför välja oss?',
    'services.whyus.point1': 'Snabba svar inom 24 timmar',
    'services.whyus.point2': 'Boenden över hela Sverige',
    'services.whyus.point3': 'Smidig process från start till mål',
    'services.whyus.point4': 'Över 10 års erfarenhet',
    'services.card1.title': 'Planering & förslag',
    'services.card1.highlight': 'Besked inom 15 minuter',
    'services.card1.description': 'Skicka förfrågan via formulär, mail eller WhatsApp. Vi kartlägger lokala värdar och återkommer med 2–3 passande alternativ – oftast inom 15 minuter, alltid inom ett dygn.',
    'services.card1.bullet1': 'Sverigeomfattande nätverk av värdar',
    'services.card1.bullet2': 'Alternativ med egna eller delade sovrum',
    'services.card1.bullet3': 'Möblerade hem med gemensamma ytor',
    'services.card1.cta': 'Skicka förfrågan →',
    'services.card2.title': 'Kontrakt & inflytt',
    'services.card2.highlight': 'Smidiga 3–36 mån villkor',
    'services.card2.description': 'Ni väljer det boende som passar teamet. Vi hanterar hyresavtal, nycklar och inventeringar och ser till att varje arbetare får praktisk info innan inflytt, på svenska eller engelska.',
    'services.card2.bullet1': 'Hyresavtal redo för signering',
    'services.card2.bullet2': 'Möbler, sänglinne och köksutrustning ingår',
    'services.card2.bullet3': 'Support via telefon eller WhatsApp',
    'services.card2.cta': 'Ring oss nu →',
    'services.card3.title': 'Drift & rapportering',
    'services.card3.highlight': 'Ni bygger – vi driver hemmet',
    'services.card3.description': 'Vi följer projektet tills sista personen flyttar ut och underhåller boendet när det behövs. Ni får statusrapporter direkt och slipper mellanhänder.',
    'services.card3.bullet1': 'Underhåll vid behov',
    'services.card3.bullet2': 'Direktkontakt vid frågor eller byten',
    'services.card3.bullet3': 'Slutstäd och överlämning',
    'services.card3.cta': 'Fråga om drift →',

    'references.title': 'Referenser',
    'references.subtitle': 'Snabba citat från kunder som växt med oss.',
    'references.tagline': 'Vad våra kunder säger',
    'references.testimonial1.quote': 'StayOnSite löste vårt boendebekymmer på bara två dagar. Mycket imponerande service!',
    'references.testimonial1.author': 'Anders Johansson',
    'references.testimonial1.company': 'AB Byggbolaget',
    'references.testimonial2.quote': 'Vi använder alltid StayOnSite för våra projekt. Deras boenden är alltid av hög standard och personalen är mycket hjälpsam.',
    'references.testimonial2.author': 'Maria Andersson',
    'references.testimonial2.company': 'Konstruktion AB',
    'references.testimonial3.quote': 'Snabb service och flexibla lösningar. Rekommenderar varmt!',
    'references.testimonial3.author': 'Erik Lindberg',
    'references.testimonial3.company': 'Lindberg Construction',
    
    'inquiry.title': 'Skicka en förfrågan',
    'inquiry.subtitle': 'Fyll i formuläret nedan så återkommer vi så snart som möjligt',
    'inquiry.tagline': 'Kontakta oss',
    'inquiry.form.companyName': 'Företagsnamn',
    'inquiry.form.contactName': 'Kontaktperson',
    'inquiry.form.email': 'E-post',
    'inquiry.form.phone': 'Telefon',
    'inquiry.form.location': 'Önskad ort',
    'inquiry.form.workers': 'Antal arbetare',
    'inquiry.form.startDate': 'Startdatum',
    'inquiry.form.endDate': 'Slutdatum',
    'inquiry.form.message': 'Meddelande',
    'inquiry.form.submit': 'Skicka förfrågan',
    'inquiry.form.success': 'Tack för din förfrågan! Vi återkommer så snart som möjligt.',
    'inquiry.form.error': 'Det uppstod ett fel vid skickandet av formuläret. Försök igen senare.',
    'inquiry.form.untilFurtherNotice': 'Tillsvidare',
    'inquiry.contactInfo.title': 'Kontaktinformation',
    'inquiry.cta.meeting': 'Boka 15 min',
    
    'faq.title': 'Vanliga frågor',
    'faq.subtitle': 'Kort om hur vi jobbar, hur snabbt det går och vad som ingår.',
    'faq.tagline': 'Vanliga frågor',
    'faq.question1': 'Hur snabbt kan ni ordna boende?',
    'faq.answer1': 'Vi skickar alternativ inom 24 timmar – i akuta lägen löser vi boende samma dag.',
    'faq.question2': 'Vilka städer täcker ni?',
    'faq.answer2': 'Vi har värdar i 40+ städer och mobiliserar nya orter när projektet kräver det.',
    'faq.question3': 'Vad kostar det att hyra boende genom er?',
    'faq.answer3': 'Priset styrs av ort, storlek och längd. Varje förslag innehåller hyra, villkor och vad som ingår.',
    'faq.question4': 'Är boendet möblerat?',
    'faq.answer4': 'Ja, fullt möblerat med kök, Wi-Fi och ofta parkering. Städ och textilier lägger vi till vid behov.',
    'faq.question5': 'Kan vi göra ändringar i bokningen efter bekräftelse?',
    'faq.answer5': 'Hör av er direkt så justerar vi hyresperiod och antal platser – vi är vana vid svängiga tidplaner.',
    
    'footer.rights': 'Alla rättigheter förbehållna',
    'footer.contact': 'Kontakta oss',
    'footer.description': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.',
    'footer.quickLinks': 'Snabblänkar',
    'footer.location': 'Stockholm, Sverige',
    
    'floatingPhone.call': 'Ring oss',
    'floatingPhone.tooltip': 'Ring oss direkt på +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Skriv på WhatsApp',
    'floatingPhone.whatsappTooltip': 'Skriv till oss på WhatsApp – svar inom 15 minuter på vardagar',
    'stickyContact.title': 'Behöver ni boende?',
    'stickyContact.subtitle': 'Tveka inte att höra av er – vi svarar inom 15 minuter på vardagar',
    'stickyContact.call': 'Ring nu',

    'why.title': 'Varför StayOnSite',
    'why.subtitle': 'Ett lokalt team äger planering, kontrakt och drift så att ni kan fortsätta bygga.',
    'why.steps.plan.title': 'Planering & förslag',
    'why.steps.plan.description': 'Skicka förfrågan via formulär, mail eller WhatsApp. Vi kartlägger lokala värdar och svarar med alternativ – oftast inom 15 minuter, alltid inom ett dygn.',
    'why.steps.plan.cta': 'Skicka förfrågan →',
    'why.steps.contracts.title': 'Kontrakt & inflytt',
    'why.steps.contracts.description': 'Välj alternativ som passar er. Vi hanterar hyresavtal, nycklar och inventeringar med tydliga 3–36 mån villkor. Era arbetare får all info för smidig inflyttning.',
    'why.steps.contracts.cta': 'Ring oss nu →',
    'why.steps.operations.title': 'Drift & rapportering',
    'why.steps.operations.description': 'Beläggning, veckostädning och avvikelser rapporteras direkt till projektledningen. Ni når oss direkt – inga mellanhänder, inga vänteköer.',
    'why.steps.operations.cta': 'Fråga om drift →',
    'case.tagline': 'Kundcase',
    'case.title': 'Så hjälpte vi ett polskt bolag med 45 montörer i Säffle',
    'case.subtitle': 'Solcellspark med kort varsel – från förfrågan till inflytt på 48 timmar.',
    'case.timeline.proposal.title': '24 h · Förslag',
    'case.timeline.proposal.description': 'Tre alternativ skickades samma dygn tack vare lokala värdar.',
    'case.timeline.moveIn.title': '48 h · Inflytt',
    'case.timeline.moveIn.description': 'Teamet flyttade in med klara nyckelrutiner och journummer.',
    'case.timeline.expand.title': '3 sajter · Vidare',
    'case.timeline.expand.description': 'Kunden använder oss nu vid tre etableringar i Sverige.',
    'case.metrics.proposal.value': '45 personer',
    'case.metrics.proposal.description': 'Total kapacitet',
    'case.metrics.moveIn.value': '3 orter',
    'case.metrics.moveIn.description': 'Samtidiga projekt',
    'case.metrics.deployments.value': '18 månader',
    'case.metrics.deployments.description': 'Pågående samarbete',

    'references.stats.happyClients': 'Nöjda kunder',
    'references.stats.accommodations': 'Ordnade boenden',
    'references.stats.responseTime': 'Genomsnittlig svarstid',
    'references.stats.cities': 'Städer i Sverige',

    'nav.homeowner': 'För husägare',
    
    'homeowner.hero.title': 'Hyr ut ditt boende',
    'homeowner.hero.subtitle': 'Har du en stuga, lägenhet eller ett hus som står tomt?',
    'homeowner.hero.incomeRange': '3 000 - 8 000 kr/månad',
    'homeowner.hero.incomeDescription': 'Säkra hyresintäkter varje månad',
    'homeowner.hero.cta': 'Registrera din bostad idag',
    
    'homeowner.benefits.title': 'Varför välja StayOnSite?',
    'homeowner.benefits.subtitle': 'Få extra inkomst från ditt hem med trygghet och enkelhet',
    'homeowner.benefits.income.title': 'Garanterad inkomst',
    'homeowner.benefits.income.description': 'Säkra hyresintäkter från 3000-8000 kr/månad',
    'homeowner.benefits.security.title': 'Trygghet och säkerhet',
    'homeowner.benefits.security.description': 'Vi sköter allt - hyresgäster, kontrakt, kommunikation och betalningar',
    'homeowner.benefits.hassle.title': 'Inga bekymmer',
    'homeowner.benefits.hassle.description': 'Vi sköter allt - hitta hyresgäst, kontrakt, kommunikation och betalningar',
    'homeowner.benefits.flexibility.title': 'Full flexibilitet',
    'homeowner.benefits.flexibility.description': 'Du bestämmer vilka perioder som passar dig och dina villkor',
    
    'homeowner.process.title': 'Så här fungerar det',
    'homeowner.process.subtitle': 'Enkel process från registrering till första hyresintäkt',
    'homeowner.process.step1.title': 'Registrera din bostad',
    'homeowner.process.step1.description': 'Fyll i vårt enkla formulär med information om din bostad',
    'homeowner.process.step2.title': 'Vi kontaktar dig för besiktning',
    'homeowner.process.step2.description': 'Vi bokar tid för en kostnadsfri besiktning och inkomstuppskattning',
    'homeowner.process.step3.title': 'Vi matchar dig med hyresgäster',
    'homeowner.process.step3.description': 'Vi hittar lämpliga hyresgäster som passar dina krav och tidsramar',
    'homeowner.process.step4.title': 'Du får betalt varje månad',
    'homeowner.process.step4.description': 'Säkra och punktliga hyresbetalningar direkt till ditt konto',
    
    'homeowner.testimonials.title': 'Vad våra husägare säger',
    'homeowner.testimonials.subtitle': 'Över 200 familjer tjänar redan extra pengar genom StayOnSite',
    'homeowner.testimonials.testimonial1.quote': 'Perfekt lösning! Vi tjänar 5000 kr extra varje månad och hyresgästerna är alltid trevliga och ordningsamma.',
    'homeowner.testimonials.testimonial1.author': 'Anna Eriksson',
    'homeowner.testimonials.testimonial1.location': 'Stockholm',
    'homeowner.testimonials.testimonial1.income': '+5 000 kr/månad',
    'homeowner.testimonials.testimonial2.quote': 'StayOnSite sköter allt åt oss. Vi behöver inte ens träffa hyresgästerna om vi inte vill.',
    'homeowner.testimonials.testimonial2.author': 'Lars Andersson',
    'homeowner.testimonials.testimonial2.location': 'Göteborg',
    'homeowner.testimonials.testimonial2.income': '+4 200 kr/månad',
    'homeowner.testimonials.testimonial3.quote': 'Har hyrt ut i över ett år nu. Aldrig några problem och alltid i tid med betalningarna.',
    'homeowner.testimonials.testimonial3.author': 'Maria Johansson',
    'homeowner.testimonials.testimonial3.location': 'Malmö',
    'homeowner.testimonials.testimonial3.income': '+6 500 kr/månad',
    'homeowner.testimonials.trustIndicator': 'Över 200 familjer tjänar redan extra pengar',
    'homeowner.testimonials.trustDescription': 'Gå med i vårt nätverk av nöjda husägare som tjänar säkra hyresintäkter varje månad',
    
    'homeowner.faq.title': 'Vanliga frågor för husägare',
    'homeowner.faq.subtitle': 'Få svar på de vanligaste frågorna om att hyra ut till hyresgäster',
    'homeowner.faq.question1': 'Vad händer om något går sönder?',
    'homeowner.faq.answer1': 'Om något mot förmodan går sönder täcks det vanligtvis av hemförsäkringen – antingen din eller hyresgästens. Vi finns självklart med och hjälper till om något händer.',
    'homeowner.faq.question2': 'Hur mycket kan jag tjäna?',
    'homeowner.faq.answer2': 'Du kan vanligtvis tjäna mellan 3 000 och 8 000 kr per månad, beroende på bostadens läge och typ. Din faktiska vinst påverkas även av t.ex. lån och ränta. Vi ger dig gärna kostnadsfri rådgivning.',
    'homeowner.faq.question4': 'Vad händer mellan uthyrningar?',
    'homeowner.faq.answer4': 'Du får tillbaka full tillgång till din bostad. Vi hjälper också till att hitta nya hyresgäster så snabbt som möjligt.',
    'homeowner.faq.question5': 'Behöver jag göra något speciellt med bostaden?',
    'homeowner.faq.answer5': 'Nej, men bostaden behöver vara möblerad, ren och i fungerande skick.',
    'homeowner.faq.question6': 'Hur får jag betalt?',
    'homeowner.faq.answer6': 'Hyran betalas alltid ut i förskott varje månad, direkt till ditt bankkonto.',
    'homeowner.faq.contactPrompt': 'Har du fler frågor? Ring oss direkt!',
    
    'homeowner.form.title': 'Registrera din bostad',
    'homeowner.form.subtitle': 'Det tar bara 2 minuter - få din kostnadsfria inkomstuppskattning redan idag',
    'homeowner.form.promise': 'Vi kontaktar dig inom 24 timmar',
    'homeowner.form.promiseDescription': 'Efter registrering kontaktar vi dig för en kostnadsfri konsultation om hur mycket du kan tjäna på din bostad',
    'homeowner.form.fieldsTitle': 'Dina kontaktuppgifter',
    'homeowner.form.fieldsSubtitle': 'Vi behöver bara grundläggande information för att komma igång',
    'homeowner.form.firstName': 'Förnamn',
    'homeowner.form.firstNamePlaceholder': 'Ange ditt förnamn',
    'homeowner.form.lastName': 'Efternamn',
    'homeowner.form.lastNamePlaceholder': 'Ange ditt efternamn',
    'homeowner.form.email': 'E-post',
    'homeowner.form.emailPlaceholder': 'din@email.se',
    'homeowner.form.phone': 'Telefonnummer',
    'homeowner.form.phonePlaceholder': '070-123 45 67',
    'homeowner.form.address': 'Adress',
    'homeowner.form.addressPlaceholder': 'Gatuadress och nummer',
    'homeowner.form.city': 'Stad',
    'homeowner.form.cityPlaceholder': 'Ange stad',
    'homeowner.form.submit': 'Registrera bostad - Helt kostnadsfritt',
    'homeowner.form.submitting': 'Registrerar...',
    'homeowner.form.success': 'Tack för din registrering! Vi kontaktar dig inom 24 timmar.',
    'homeowner.form.error': 'Det uppstod ett fel. Försök igen eller ring oss direkt.',
    'homeowner.form.disclaimer': 'Genom att registrera dig godkänner du att vi kontaktar dig angående uthyrning av din bostad.',

    'seo.home.title': 'Personalboende & Företagsbostäder i Sverige | StayOnSite',
    'seo.home.description': 'Vi ordnar snabbt och effektivt boende för företag och deras personal i hela Sverige. Långsiktiga och flexibla hyreslösningar för bygg-, energi- och datacenterprojekt.',
    'seo.homeowner.title': 'Hyr ut din bostad till företag | Garanterad hyra | StayOnSite',
    'seo.homeowner.description': 'Hyr ut din bostad till stabila företag via StayOnSite. Vi erbjuder garanterade hyresintäkter, sköter all administration och hittar pålitliga hyresgäster. Registrera din bostad idag!',
    'seo.city.title': 'Företagsboende i {cityName} | Hyr lägenhet till personal | StayOnSite',
    'seo.city.description': 'Letar ditt företag efter boende till personal i {cityName}? StayOnSite erbjuder möblerade lägenheter och hus för kort- och långtidshyra. Kontakta oss för en snabb offert.',
    'seo.notFound.title': '404: Sidan hittades inte | StayOnSite',
    'seo.notFound.description': 'Sidan du letar efter verkar inte finnas. Gå tillbaka till startsidan för att hitta boende för ditt företags personal.'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.references': 'References',
    'nav.contact': 'Contact',
    'nav.case': 'Case',
    'nav.inquiryForm': 'Inquiry',
    'nav.forCompanies': 'For Companies',
    
    'hero.title': 'We solve housing while you build in Sweden',
    'hero.subtitle': 'From the first engineer to the last installer—planning, contracts, and move-ins within 48 hours.',
    'hero.cta': 'Send Inquiry',
    'hero.tagline': 'Deployment partner in Sweden',
    'hero.bullet1': 'Our local team follows the project from planning to operations',
    'hero.bullet2': 'Clear 3–36 month agreements',
    'hero.bullet3': 'One contact line—phone, SMS, or WhatsApp',
    'hero.ctaPhone': 'Call us now',
    'hero.ctaWhatsapp': 'Chat on WhatsApp',
    'hero.ctaSubtext': '+46 73 628 77 09 · Phone / SMS / WhatsApp',
    'hero.responseTime': 'Replies within 15 minutes on weekdays',
    'hero.metrics.proposal.value': '24 h',
    'hero.metrics.proposal.description': 'First housing proposal',
    'hero.metrics.moveIn.value': '48 h',
    'hero.metrics.moveIn.description': 'First move-in completed',
    'hero.metrics.deployments.value': '3 sites',
    'hero.metrics.deployments.description': 'Per client on average',
    
    'services.title': 'Our Services',
    'services.subtitle': 'We secure long- and short-stay housing close to your sites anywhere in Sweden.',
    'services.tagline': 'Simple and smooth',
    'services.process.title': 'How it works',
    'services.process.step1.title': 'Send inquiry',
    'services.process.step1.description': 'Fill out our simple form with details about your needs',
    'services.process.step2.title': 'Quick response',
    'services.process.step2.description': 'We respond via email, SMS, or WhatsApp – usually within 15 minutes, always within 24 hours',
    'services.process.step3.title': 'Confirmation',
    'services.process.step3.description': 'Choose the option that suits you best, and we book it for you',
    'services.process.step4.title': 'Move in',
    'services.process.step4.description': 'Your workers get all the information they need for a smooth move-in',
    'services.security.title': 'Security through an experienced partner',
    'services.security.description': 'No middlemen, no queues. You reach us directly and we respond – usually within 15 minutes, always within 24 hours. 10+ years of construction experience.',
    'services.whyus.title': 'Why choose us?',
    'services.whyus.point1': 'Quick responses within 24 hours',
    'services.whyus.point2': 'Accommodations throughout Sweden',
    'services.whyus.point3': 'Smooth process from start to finish',
    'services.whyus.point4': 'Over 10 years of experience',
    'services.card1.title': 'Planning & proposals',
    'services.card1.highlight': 'Response within 15 minutes',
    'services.card1.description': 'Send inquiry via form, email, or WhatsApp. We map local landlords and return with 2–3 suitable options – usually within 15 minutes, always within 24 hours.',
    'services.card1.bullet1': 'Nationwide network of landlords',
    'services.card1.bullet2': 'Options with private or shared bedrooms',
    'services.card1.bullet3': 'Furnished homes with common areas',
    'services.card1.cta': 'Send inquiry →',
    'services.card2.title': 'Contracts & move-ins',
    'services.card2.highlight': 'Flexible 3–36 month terms',
    'services.card2.description': 'You choose the accommodation that fits your team. We handle leases, keys, and inventories, and ensure each worker gets practical info before move-in, in Swedish or English.',
    'services.card2.bullet1': 'Lease agreements ready for signing',
    'services.card2.bullet2': 'Furniture, linens, and kitchen equipment included',
    'services.card2.bullet3': 'Support via phone or WhatsApp',
    'services.card2.cta': 'Call us now →',
    'services.card3.title': 'Operations & reporting',
    'services.card3.highlight': 'You build – we run the home',
    'services.card3.description': 'We follow the project until the last person moves out and maintain the accommodation when needed. You get status reports directly and skip the middlemen.',
    'services.card3.bullet1': 'Maintenance as needed',
    'services.card3.bullet2': 'Direct contact for questions or changes',
    'services.card3.bullet3': 'Final cleaning and handover',
    'services.card3.cta': 'Ask about operations →',

    'references.title': 'References',
    'references.subtitle': 'Quick quotes from customers who scaled with us.',
    'references.tagline': 'What our customers say',
    'references.testimonial1.quote': 'StayOnSite solved our accommodation issue in just two days. Very impressive service!',
    'references.testimonial1.author': 'Anders Johansson',
    'references.testimonial1.company': 'AB Byggbolaget',
    'references.testimonial2.quote': 'We always use StayOnSite for our projects. Their accommodations are always of high standard and the staff is very helpful.',
    'references.testimonial2.author': 'Maria Andersson',
    'references.testimonial2.company': 'Konstruktion AB',
    'references.testimonial3.quote': 'Fast service and flexible solutions. Highly recommended!',
    'references.testimonial3.author': 'Erik Lindberg',
    'references.testimonial3.company': 'Lindberg Construction',
    
    'inquiry.title': 'Send an Inquiry',
    'inquiry.subtitle': 'Fill out the form below and we will get back to you as soon as possible',
    'inquiry.tagline': 'Contact us',
    'inquiry.form.companyName': 'Company Name',
    'inquiry.form.contactName': 'Contact Person',
    'inquiry.form.email': 'Email',
    'inquiry.form.phone': 'Phone',
    'inquiry.form.location': 'Desired Location',
    'inquiry.form.workers': 'Number of Workers',
    'inquiry.form.startDate': 'Start Date',
    'inquiry.form.endDate': 'End Date',
    'inquiry.form.message': 'Message',
    'inquiry.form.submit': 'Submit Inquiry',
    'inquiry.form.success': 'Thank you for your inquiry! We will get back to you as soon as possible.',
    'inquiry.form.error': 'There was an error submitting the form. Please try again later.',
    'inquiry.form.untilFurtherNotice': 'Until further notice',
    'inquiry.contactInfo.title': 'Contact Information',
    'inquiry.cta.meeting': 'Schedule 15 min',
    
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'How we work, how fast we move, and what’s included.',
    'faq.tagline': 'FAQ',
    'faq.question1': 'How quickly can you arrange accommodation?',
    'faq.answer1': 'We send options within 24 hours – urgent cases often move in the same day.',
    'faq.question2': 'Which cities do you cover?',
    'faq.answer2': 'We have hosts in 40+ cities and spin up new locations as soon as your project needs them.',
    'faq.question3': 'What does it cost to rent accommodation through you?',
    'faq.answer3': 'Pricing depends on city, size, and term. Every proposal includes rent, terms, and inclusions.',
    'faq.question4': 'Is the accommodation furnished?',
    'faq.answer4': 'Yes—fully furnished with kitchen, Wi-Fi, and often parking. Cleaning and linen can be added.',
    'faq.question5': 'Can we make changes to the booking after confirmation?',
    'faq.answer5': 'Tell us as soon as plans shift and we’ll extend, shorten, or add units accordingly.',
    
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact us',
    'footer.description': 'We help construction companies quickly find accommodations in other locations for their workers.',
    'footer.quickLinks': 'Quick Links',
    'footer.location': 'Stockholm, Sweden',
    
    'floatingPhone.call': 'Call us',
    'floatingPhone.tooltip': 'Call us directly at +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Message on WhatsApp',
    'floatingPhone.whatsappTooltip': 'Message us on WhatsApp—responses within 15 minutes on weekdays',
    'stickyContact.title': 'Need housing?',
    'stickyContact.subtitle': 'Don\'t hesitate to reach out – we respond within 15 minutes on weekdays',
    'stickyContact.call': 'Call now',

    'why.title': 'Why StayOnSite',
    'why.subtitle': 'A local housing team owns planning, contracts, and operations so you stay on schedule.',
    'why.steps.plan.title': 'Planning & proposals',
    'why.steps.plan.description': 'Send inquiry via form, email, or WhatsApp. We map local landlords and respond with options – usually within 15 minutes, always within 24 hours.',
    'why.steps.plan.cta': 'Send inquiry →',
    'why.steps.contracts.title': 'Contracts & move-ins',
    'why.steps.contracts.description': 'Choose the option that fits you. We handle leases, keys, and inspections with transparent 3–36 month terms. Your workers get all info for smooth move-in.',
    'why.steps.contracts.cta': 'Call us now →',
    'why.steps.operations.title': 'Operations & reporting',
    'why.steps.operations.description': 'Occupancy, weekly cleaning, and incidents reported directly to project management. You reach us directly – no middlemen, no queues.',
    'why.steps.operations.cta': 'Ask about operations →',
    'case.tagline': 'Customer Case',
    'case.title': 'How we helped a Polish company house 45 installers in Säffle',
    'case.subtitle': 'Solar park on short notice – from inquiry to move-in within 48 hours.',
    'case.timeline.proposal.title': '24 h · Proposal',
    'case.timeline.proposal.description': 'Three options sent day one thanks to existing landlords.',
    'case.timeline.moveIn.title': '48 h · Move-in',
    'case.timeline.moveIn.description': 'Crew arrived to ready keys, weekly cleaning, and on-call support.',
    'case.timeline.expand.title': '3 sites · Next',
    'case.timeline.expand.description': 'Same customer now runs three Swedish deployments with us.',
    'case.metrics.proposal.value': '45 people',
    'case.metrics.proposal.description': 'Total capacity',
    'case.metrics.moveIn.value': '3 locations',
    'case.metrics.moveIn.description': 'Concurrent projects',
    'case.metrics.deployments.value': '18 months',
    'case.metrics.deployments.description': 'Ongoing partnership',

    'references.stats.happyClients': 'Happy clients',
    'references.stats.accommodations': 'Accommodations arranged',
    'references.stats.responseTime': 'Average response time',
    'references.stats.cities': 'Cities in Sweden',

    'nav.homeowner': 'For Homeowners',
    
    'homeowner.hero.title': 'Turn your home into an income source',
    'homeowner.hero.subtitle': 'We help you rent to reliable construction workers - completely hassle-free',
    'homeowner.hero.incomeRange': '3,000 - 8,000 SEK/month',
    'homeowner.hero.incomeDescription': 'Secure rental income from verified construction workers',
    'homeowner.hero.cta': 'Register your property today',
    
    'homeowner.benefits.title': 'Why choose StayOnSite?',
    'homeowner.benefits.subtitle': 'Get extra income from your home with security and simplicity',
    'homeowner.benefits.income.title': 'Guaranteed income',
    'homeowner.benefits.income.description': 'Secure rental income from 3,000-8,000 SEK/month from verified construction workers',
    'homeowner.benefits.security.title': 'Safety and security',
    'homeowner.benefits.security.description': 'Only verified construction workers from established companies. Insurance and damage guarantee included',
    'homeowner.benefits.hassle.title': 'No worries',
    'homeowner.benefits.hassle.description': 'We handle everything - screening, contracts, communication and payments',
    'homeowner.benefits.flexibility.title': 'Full flexibility',
    'homeowner.benefits.flexibility.description': 'You decide which periods suit you and your terms',
    
    'homeowner.process.title': 'How it works',
    'homeowner.process.subtitle': 'Simple process from registration to first rental income',
    'homeowner.process.step1.title': 'Register your property',
    'homeowner.process.step1.description': 'Fill out our simple form with information about your property',
    'homeowner.process.step2.title': 'We contact you for inspection',
    'homeowner.process.step2.description': 'We schedule a free inspection and income estimate',
    'homeowner.process.step3.title': 'We match you with tenants',
    'homeowner.process.step3.description': 'We find suitable construction workers that meet your requirements and timeframes',
    'homeowner.process.step4.title': 'You get paid every month',
    'homeowner.process.step4.description': 'Secure and punctual rental payments directly to your account',
    
    'homeowner.testimonials.title': 'What our homeowners say',
    'homeowner.testimonials.subtitle': 'Over 200 families already earn extra money through StayOnSite',
    'homeowner.testimonials.testimonial1.quote': 'Perfect solution! We earn 5,000 SEK extra every month and the tenants are always polite and tidy.',
    'homeowner.testimonials.testimonial1.author': 'Anna Eriksson',
    'homeowner.testimonials.testimonial1.location': 'Stockholm',
    'homeowner.testimonials.testimonial1.income': '+5,000 SEK/month',
    'homeowner.testimonials.testimonial2.quote': 'StayOnSite handles everything for us. We don\'t even need to meet the tenants if we don\'t want to.',
    'homeowner.testimonials.testimonial2.author': 'Lars Andersson',
    'homeowner.testimonials.testimonial2.location': 'Gothenburg',
    'homeowner.testimonials.testimonial2.income': '+4,200 SEK/month',
    'homeowner.testimonials.testimonial3.quote': 'Have been renting out for over a year now. Never any problems and always on time with payments.',
    'homeowner.testimonials.testimonial3.author': 'Maria Johansson',
    'homeowner.testimonials.testimonial3.location': 'Malmö',
    'homeowner.testimonials.testimonial3.income': '+6,500 SEK/month',
    'homeowner.testimonials.trustIndicator': 'Over 200 families already earn extra money',
    'homeowner.testimonials.trustDescription': 'Join our network of satisfied homeowners who earn secure rental income every month',
    
    'homeowner.faq.title': 'FAQ for homeowners',
    'homeowner.faq.subtitle': 'Get answers to the most common questions about renting to construction workers',
    'homeowner.faq.question1': 'What happens if something breaks?',
    'homeowner.faq.answer1': 'We have full insurance that covers any damages. We also do thorough screening of all tenants to minimize risks.',
    'homeowner.faq.question2': 'How much can I earn?',
    'homeowner.faq.answer2': 'Depending on location and type of property, our homeowners earn between 3,000-8,000 SEK per month. We provide a free income estimate.',
    'homeowner.faq.question4': 'What happens between rentals?',
    'homeowner.faq.answer4': 'You get full access back to your property. We also help find new tenants as quickly as possible.',
    'homeowner.faq.question5': 'Do I need to do anything special with the property?',
    'homeowner.faq.answer5': 'No, we accept properties in existing condition. However, we can give tips on minor improvements that could increase rental income.',
    'homeowner.faq.question6': 'How do I get paid?',
    'homeowner.faq.answer6': 'Rent is paid directly to your bank account on the first of each month. We handle all invoicing and administration.',
    'homeowner.faq.contactPrompt': 'Have more questions? Call us directly!',
    
    'homeowner.form.title': 'Register your property',
    'homeowner.form.subtitle': 'It only takes 2 minutes - get your free income estimate today',
    'homeowner.form.promise': 'We contact you within 24 hours',
    'homeowner.form.promiseDescription': 'After registration, we contact you for a free consultation about how much you can earn from your property',
    'homeowner.form.fieldsTitle': 'Your contact information',
    'homeowner.form.fieldsSubtitle': 'We only need basic information to get started',
    'homeowner.form.firstName': 'First name',
    'homeowner.form.firstNamePlaceholder': 'Enter your first name',
    'homeowner.form.lastName': 'Last name',
    'homeowner.form.lastNamePlaceholder': 'Enter your last name',
    'homeowner.form.email': 'Email',
    'homeowner.form.emailPlaceholder': 'your@email.com',
    'homeowner.form.phone': 'Phone number',
    'homeowner.form.phonePlaceholder': '070-123 45 67',
    'homeowner.form.address': 'Address',
    'homeowner.form.addressPlaceholder': 'Street address and number',
    'homeowner.form.city': 'City',
    'homeowner.form.cityPlaceholder': 'Enter city',
    'homeowner.form.submit': 'Register property - Completely free',
    'homeowner.form.submitting': 'Registering...',
    'homeowner.form.success': 'Thank you for your registration! We will contact you within 24 hours.',
    'homeowner.form.error': 'An error occurred. Please try again or call us directly.',
    'homeowner.form.disclaimer': 'By registering, you agree that we may contact you regarding renting out your property.',

    'seo.home.title': 'Staff Housing & Corporate Apartments in Sweden | StayOnSite',
    'seo.home.description': 'We quickly and efficiently arrange housing for companies and their staff throughout Sweden. Long-term and flexible rental solutions for construction, energy, and data center projects.',
    'seo.homeowner.title': 'Rent your property to companies | Guaranteed rent | StayOnSite',
    'seo.homeowner.description': 'Rent out your property to stable companies via StayOnSite. We offer guaranteed rental income, handle all administration, and find reliable tenants. Register your property today!',
    'seo.city.title': 'Corporate Housing in {cityName} | Rent Apartments for Staff | StayOnSite',
    'seo.city.description': 'Is your company looking for staff housing in {cityName}? StayOnSite offers furnished apartments and houses for short and long-term rent. Contact us for a quick quote.',
    'seo.notFound.title': '404: Page Not Found | StayOnSite',
    'seo.notFound.description': 'The page you are looking for does not seem to exist. Go back to the homepage to find housing for your company\'s staff.'
  },
  pl: {
    'nav.home': 'Strona główna',
    'nav.services': 'Usługi',
    'nav.references': 'Referencje',
    'nav.contact': 'Kontakt',
    'nav.case': 'Studium przypadku',
    'nav.inquiryForm': 'Zapytanie',
    'nav.forCompanies': 'Dla firm',

    'hero.title': 'Rozwiązujemy zakwaterowanie, gdy budujecie w Szwecji',
    'hero.subtitle': 'Od pierwszego inżyniera po ostatniego montera — planowanie, umowy i wprowadzki w 48 godzin.',
    'hero.cta': 'Wyślij zapytanie',
    'hero.tagline': 'Partner ds. wdrożeń w Szwecji',
    'hero.bullet1': 'Lokalni specjaliści ds. zakwaterowania w pobliżu centrów danych i parków energetycznych',
    'hero.bullet2': 'Przejrzyste umowy na 3–36 miesięcy',
    'hero.bullet3': 'Jedna linia kontaktu — telefon, SMS lub WhatsApp',
    'hero.ctaPhone': 'Zadzwoń teraz',
    'hero.ctaWhatsapp': 'Napisz na WhatsApp',
    'hero.ctaSubtext': '+46 73 628 77 09 · Telefon / SMS / WhatsApp',
    'hero.responseTime': 'Odpowiedź w 15 minut w dni robocze',
    'hero.metrics.proposal.value': '24 h',
    'hero.metrics.proposal.description': 'Pierwsza propozycja zakwaterowania',
    'hero.metrics.moveIn.value': '48 h',
    'hero.metrics.moveIn.description': 'Pierwsza wprowadzka zakończona',
    'hero.metrics.deployments.value': '3 lokalizacje',
    'hero.metrics.deployments.description': 'Średnio na klienta',

    'services.title': 'Nasze usługi',
    'services.subtitle': 'Zapewniamy lokum blisko inwestycji – od krótkich pobytów po wielomiesięczne najmy w całej Szwecji.',
    'services.tagline': 'Prosto i sprawnie',
    'services.process.title': 'Jak to działa',
    'services.process.step1.title': 'Wyślij zapytanie',
    'services.process.step1.description': 'Wypełnij nasz prosty formularz, podając szczegóły dotyczące Twoich potrzeb.',
    'services.process.step2.title': 'Szybka odpowiedź',
    'services.process.step2.description': 'Odpowiadamy przez e-mail, SMS lub WhatsApp – zwykle w 15 minut, zawsze w ciągu doby',
    'services.process.step3.title': 'Potwierdzenie',
    'services.process.step3.description': 'Wybierz najlepszą dla siebie opcję, a my dokonamy rezerwacji.',
    'services.process.step4.title': 'Wprowadzka',
    'services.process.step4.description': 'Twoi pracownicy otrzymują wszystkie informacje potrzebne do sprawnej wprowadzki.',
    'services.security.title': 'Bezpieczeństwo dzięki doświadczonemu partnerowi',
    'services.security.description': 'Bez pośredników, bez kolejek. Kontaktujecie się bezpośrednio z nami i odpowiadamy – zwykle w 15 minut, zawsze w ciągu doby. Ponad 10 lat doświadczenia w branży budowlanej.',
    'services.whyus.title': 'Dlaczego my?',
    'services.whyus.point1': 'Szybkie odpowiedzi w ciągu 24 godzin',
    'services.whyus.point2': 'Zakwaterowanie w całej Szwecji',
    'services.whyus.point3': 'Sprawny proces od początku do końca',
    'services.whyus.point4': 'Ponad 10 lat doświadczenia',
    'services.card1.title': 'Planowanie i propozycje',
    'services.card1.highlight': 'Odpowiedź w 15 minut',
    'services.card1.description': 'Wyślij zapytanie przez formularz, e-mail lub WhatsApp. Mapujemy lokalnych gospodarzy i wracamy z 2–3 odpowiednimi opcjami – zwykle w 15 minut, zawsze w ciągu doby.',
    'services.card1.bullet1': 'Ogólnopolska sieć gospodarzy',
    'services.card1.bullet2': 'Opcje z własnymi lub wspólnymi sypialniami',
    'services.card1.bullet3': 'Umeblowane domy z miejscami wspólnymi',
    'services.card1.cta': 'Wyślij zapytanie →',
    'services.card2.title': 'Umowa i wprowadzka',
    'services.card2.highlight': 'Elastyczne warunki 3–36 miesięcy',
    'services.card2.description': 'Wybieracie zakwaterowanie, które pasuje do zespołu. Obsługujemy umowy najmu, klucze i inwentaryzacje, zapewniając każdemu pracownikowi praktyczne informacje przed wprowadzką, po szwedzku lub angielsku.',
    'services.card2.bullet1': 'Umowy najmu gotowe do podpisania',
    'services.card2.bullet2': 'Meble, pościel i wyposażenie kuchenne w cenie',
    'services.card2.bullet3': 'Wsparcie przez telefon lub WhatsApp',
    'services.card2.cta': 'Zadzwoń teraz →',
    'services.card3.title': 'Eksploatacja i raportowanie',
    'services.card3.highlight': 'Ty budujesz – my prowadzimy dom',
    'services.card3.description': 'Śledzimy projekt, aż ostatnia osoba się wyprowadzi i utrzymujemy zakwaterowanie w razie potrzeby. Otrzymujesz raporty statusu bezpośrednio i unikasz pośredników.',
    'services.card3.bullet1': 'Konserwacja w razie potrzeby',
    'services.card3.bullet2': 'Bezpośredni kontakt przy pytaniach lub zmianach',
    'services.card3.bullet3': 'Sprzątanie końcowe i przekazanie',
    'services.card3.cta': 'Zapytaj o eksploatację →',

    'references.title': 'Referencje',
    'references.subtitle': 'Krótko, co mówią firmy rozwijające się z nami.',
    'references.tagline': 'Co mówią nasi klienci',
    'references.testimonial1.quote': 'StayOnSite rozwiązał nasz problem z zakwaterowaniem w zaledwie dwa dni. Bardzo imponująca obsługa!',
    'references.testimonial1.author': 'Anders Johansson',
    'references.testimonial1.company': 'AB Byggbolaget',
    'references.testimonial2.quote': 'Zawsze korzystamy ze StayOnSite w naszych projektach. Ich zakwaterowanie jest zawsze wysokiego standardu, a personel bardzo pomocny.',
    'references.testimonial2.author': 'Maria Andersson',
    'references.testimonial2.company': 'Konstruktion AB',
    'references.testimonial3.quote': 'Szybka obsługa i elastyczne rozwiązania. Gorąco polecam!',
    'references.testimonial3.author': 'Erik Lindberg',
    'references.testimonial3.company': 'Lindberg Construction',

    'inquiry.title': 'Wyślij zapytanie',
    'inquiry.subtitle': 'Wypełnij poniższy formularz, a skontaktujemy się z Tobą tak szybko, jak to możliwe.',
    'inquiry.tagline': 'Skontaktuj się z nami',
    'inquiry.form.companyName': 'Nazwa firmy',
    'inquiry.form.contactName': 'Osoba kontaktowa',
    'inquiry.form.email': 'E-mail',
    'inquiry.form.phone': 'Telefon',
    'inquiry.form.location': 'Preferowana lokalizacja',
    'inquiry.form.workers': 'Liczba pracowników',
    'inquiry.form.startDate': 'Data rozpoczęcia',
    'inquiry.form.endDate': 'Data zakończenia',
    'inquiry.form.message': 'Wiadomość',
    'inquiry.form.submit': 'Wyślij zapytanie',
    'inquiry.form.success': 'Dziękujemy za zapytanie! Skontaktujemy się z Tobą tak szybko, jak to możliwe.',
    'inquiry.form.error': 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.',
    'inquiry.form.untilFurtherNotice': 'Do odwołania',
    'inquiry.contactInfo.title': 'Informacje kontaktowe',
    'inquiry.cta.meeting': 'Umów 15 min',

    'faq.title': 'Najczęściej zadawane pytania',
    'faq.subtitle': 'Jak działamy, jak szybko reagujemy i co obejmuje usługa.',
    'faq.tagline': 'FAQ',
    'faq.question1': 'Jak szybko możecie zorganizować zakwaterowanie?',
    'faq.answer1': 'Wysyłamy propozycje w 24 h – przy pilnych zgłoszeniach często organizujemy nocleg tego samego dnia.',
    'faq.question2': 'W jakich miastach działacie?',
    'faq.answer2': 'Mamy gospodarzy w 40+ miastach i szybko rozwijamy sieć, gdy projekt potrzebuje nowej lokalizacji.',
    'faq.question3': 'Ile kosztuje wynajem zakwaterowania za Waszym pośrednictwem?',
    'faq.answer3': 'Cena zależy od miejscowości, metrażu i czasu wynajmu. Każda oferta zawiera koszt i warunki.',
    'faq.question4': 'Czy zakwaterowanie jest umeblowane?',
    'faq.answer4': 'Tak – pełne umeblowanie, kuchnia, Wi-Fi i często parking. Sprzątanie/tekstylia dokładamy w razie potrzeby.',
    'faq.question5': 'Czy możemy wprowadzać zmiany w rezerwacji po jej potwierdzeniu?',
    'faq.answer5': 'Daj znać, gdy harmonogram się zmieni – wydłużymy, skrócimy albo dodamy kolejne mieszkania.',

    'footer.rights': 'Wszelkie prawa zastrzeżone',
    'footer.contact': 'Skontaktuj się z nami',
    'footer.description': 'Pomagamy firmom budowlanym szybko znaleźć zakwaterowanie w innych miejscowościach dla ich pracowników.',
    'footer.quickLinks': 'Szybkie linki',
    'footer.location': 'Sztokholm, Szwecja',

    'floatingPhone.call': 'Zadzwoń do nas',
    'floatingPhone.tooltip': 'Zadzwoń do nas bezpośrednio pod numer +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Napisz na WhatsApp',
    'floatingPhone.whatsappTooltip': 'Napisz do nas na WhatsApp – odpowiadamy w 15 minut w dni robocze',
    'stickyContact.title': 'Potrzebujesz zakwaterowania?',
    'stickyContact.subtitle': 'Nie wahaj się z nami skontaktować – odpowiadamy w 15 minut w dni robocze',
    'stickyContact.call': 'Zadzwoń teraz',

    'why.title': 'Dlaczego StayOnSite',
    'why.subtitle': 'Lokalny zespół przejmuje planowanie, umowy i eksploatację, żebyście mogli dalej budować.',
    'why.steps.plan.title': 'Planowanie i propozycje',
    'why.steps.plan.description': 'Wyślij zapytanie przez formularz, e-mail lub WhatsApp. Analizujemy lokalnych wynajmujących i odpowiadamy z opcjami – zwykle w 15 minut, zawsze w ciągu doby.',
    'why.steps.plan.cta': 'Wyślij zapytanie →',
    'why.steps.contracts.title': 'Umowy i wprowadzki',
    'why.steps.contracts.description': 'Wybierz opcję, która pasuje. Zajmujemy się umowami najmu, kluczami i protokołami z przejrzystymi warunkami na 3–36 miesięcy. Pracownicy dostaną wszystkie informacje do sprawnej wprowadzki.',
    'why.steps.contracts.cta': 'Zadzwoń teraz →',
    'why.steps.operations.title': 'Bieżąca obsługa i raportowanie',
    'why.steps.operations.description': 'Obłożenie, cotygodniowe sprzątanie i usterki raportowane bezpośrednio do kierownika projektu. Kontaktujecie się bezpośrednio z nami – bez pośredników, bez kolejek.',
    'why.steps.operations.cta': 'Zapytaj o obsługę →',
    'case.tagline': 'Studium przypadku',
    'case.title': 'Jak pomogliśmy polskiej firmie zakwaterować 45 monterów w Säffle',
    'case.subtitle': 'Farma fotowoltaiczna w krótkim czasie – od zapytania do wprowadzki w 48 godzin.',
    'case.timeline.proposal.title': '24 h · Pierwsza oferta gotowa',
    'case.timeline.proposal.description': 'Skontaktowaliśmy się z lokalnymi wynajmującymi i w ciągu doby przedstawiliśmy trzy opcje.',
    'case.timeline.moveIn.title': '48 h · Wprowadzka ekipy',
    'case.timeline.moveIn.description': 'Monterzy otrzymali klucze, harmonogram sprzątania i numer alarmowy jeszcze przed przyjazdem.',
    'case.timeline.expand.title': '3 lokalizacje · Stała współpraca',
    'case.timeline.expand.description': 'Ten sam klient korzysta dziś z naszego wsparcia przy trzech projektach w całej Szwecji.',
    'case.metrics.proposal.value': '45 osób',
    'case.metrics.proposal.description': 'Całkowita pojemność',
    'case.metrics.moveIn.value': '3 lokalizacje',
    'case.metrics.moveIn.description': 'Równoczesne projekty',
    'case.metrics.deployments.value': '18 miesięcy',
    'case.metrics.deployments.description': 'Trwająca współpraca',

    'references.stats.happyClients': 'Zadowoleni klienci',
    'references.stats.accommodations': 'Zapewnione zakwaterowania',
    'references.stats.responseTime': 'Średni czas odpowiedzi',
    'references.stats.cities': 'Miasta w Szwecji',

    'nav.homeowner': 'Dla właścicieli',

    'homeowner.hero.title': 'Wynajmij swoją nieruchomość',
    'homeowner.hero.subtitle': 'Masz domek, mieszkanie lub dom, który stoi pusty?',
    'homeowner.hero.incomeRange': '3 000 - 8 000 SEK/miesiąc',
    'homeowner.hero.incomeDescription': 'Pewny dochód z wynajmu co miesiąc',
    'homeowner.hero.cta': 'Zarejestruj swoją nieruchomość już dziś',

    'homeowner.benefits.title': 'Dlaczego warto wynajmować ze StayOnSite?',
    'homeowner.benefits.subtitle': 'Zyskaj dodatkowy dochód ze swojego domu – bezpiecznie i bez wysiłku.',
    'homeowner.benefits.income.title': 'Gwarantowany dochód',
    'homeowner.benefits.income.description': 'Zapewnij sobie pewny dochód z wynajmu od 3 000 do 8 000 SEK miesięcznie od zweryfikowanych pracowników budowlanych.',
    'homeowner.benefits.security.title': 'Bezpieczeństwo i pewność',
    'homeowner.benefits.security.description': 'Tylko zweryfikowani pracownicy budowlani z renomowanych firm. Ubezpieczenie i gwarancja pokrycia szkód w cenie.',
    'homeowner.benefits.hassle.title': 'Zero zmartwień',
    'homeowner.benefits.hassle.description': 'Zajmujemy się wszystkim – weryfikacją najemców, umowami, komunikacją i płatnościami.',
    'homeowner.benefits.flexibility.title': 'Pełna elastyczność',
    'homeowner.benefits.flexibility.description': 'Ty decydujesz, które okresy Ci odpowiadają i na jakich warunkach.',

    'homeowner.process.title': 'Jak to działa',
    'homeowner.process.subtitle': 'Prosty proces od rejestracji do pierwszego dochodu z wynajmu',
    'homeowner.process.step1.title': 'Zarejestruj swoją nieruchomość',
    'homeowner.process.step1.description': 'Wypełnij nasz prosty formularz z informacjami o Twojej nieruchomości.',
    'homeowner.process.step2.title': 'Skontaktujemy się w sprawie inspekcji',
    'homeowner.process.step2.description': 'Umówimy termin bezpłatnej inspekcji i wyceny potencjalnego dochodu.',
    'homeowner.process.step3.title': 'Znajdziemy dla Ciebie najemców',
    'homeowner.process.step3.description': 'Znajdziemy odpowiednich pracowników budowlanych, którzy spełnią Twoje wymagania i ramy czasowe.',
    'homeowner.process.step4.title': 'Otrzymujesz płatność co miesiąc',
    'homeowner.process.step4.description': 'Bezpieczne i punktualne płatności czynszu bezpośrednio na Twoje konto.',

    'homeowner.testimonials.title': 'Co mówią nasi właściciele',
    'homeowner.testimonials.subtitle': 'Ponad 200 rodzin już zarabia dodatkowe pieniądze dzięki StayOnSite.',
    'homeowner.testimonials.testimonial1.quote': 'Idealne rozwiązanie! Zarabiamy 5000 SEK dodatkowo co miesiąc, a najemcy są zawsze uprzejmi i porządni.',
    'homeowner.testimonials.testimonial1.author': 'Anna Eriksson',
    'homeowner.testimonials.testimonial1.location': 'Sztokholm',
    'homeowner.testimonials.testimonial1.income': '+5 000 SEK/miesiąc',
    'homeowner.testimonials.testimonial2.quote': 'StayOnSite zajmuje się wszystkim za nas. Nie musimy nawet spotykać się z najemcami, jeśli nie chcemy.',
    'homeowner.testimonials.testimonial2.author': 'Lars Andersson',
    'homeowner.testimonials.testimonial2.location': 'Göteborg',
    'homeowner.testimonials.testimonial2.income': '+4 200 SEK/miesiąc',
    'homeowner.testimonials.testimonial3.quote': 'Wynajmuję od ponad roku. Nigdy żadnych problemów i płatności zawsze na czas.',
    'homeowner.testimonials.testimonial3.author': 'Maria Johansson',
    'homeowner.testimonials.testimonial3.location': 'Malmö',
    'homeowner.testimonials.testimonial3.income': '+6 500 SEK/miesiąc',
    'homeowner.testimonials.trustIndicator': 'Ponad 200 rodzin już zarabia dodatkowe pieniądze',
    'homeowner.testimonials.trustDescription': 'Dołącz do naszej sieci zadowolonych właścicieli, którzy co miesiąc zyskują pewny dochód z wynajmu.',

    'homeowner.faq.title': 'Najczęściej zadawane pytania dla właścicieli',
    'homeowner.faq.subtitle': 'Znajdź odpowiedzi na najczęstsze pytania dotyczące wynajmu Twojej nieruchomości.',
    'homeowner.faq.question1': 'Co się stanie, jeśli coś się zepsuje?',
    'homeowner.faq.answer1': 'Posiadamy pełne ubezpieczenie, które pokrywa wszelkie szkody. Dodatkowo dokładnie weryfikujemy wszystkich najemców, aby minimalizować ryzyko.',
    'homeowner.faq.question2': 'Ile mogę zarobić?',
    'homeowner.faq.answer2': 'W zależności od lokalizacji i rodzaju nieruchomości, nasi właściciele zarabiają od 3 000 do 8 000 SEK miesięcznie. Zapewniamy bezpłatną wycenę dochodu.',
    'homeowner.faq.question4': 'Co dzieje się między okresami wynajmu?',
    'homeowner.faq.answer4': 'Odzyskujesz pełny dostęp do swojej nieruchomości. Pomagamy również jak najszybciej znaleźć nowych najemców.',
    'homeowner.faq.question5': 'Czy muszę jakoś specjalnie przygotować nieruchomość?',
    'homeowner.faq.answer5': 'Nie, akceptujemy nieruchomości w obecnym stanie. Możemy jednak udzielić wskazówek dotyczących drobnych ulepszeń, które mogą zwiększyć dochód z najmu.',
    'homeowner.faq.question6': 'Jak otrzymam zapłatę?',
    'homeowner.faq.answer6': 'Czynsz jest wypłacany bezpośrednio na Twoje konto bankowe pierwszego dnia każdego miesiąca. Zajmujemy się całą fakturacją i administracją.',
    'homeowner.faq.contactPrompt': 'Masz więcej pytań? Zadzwoń do nas bezpośrednio!',

    'homeowner.form.title': 'Zarejestruj swoją nieruchomość',
    'homeowner.form.subtitle': 'To zajmuje tylko 2 minuty - otrzymaj bezpłatną wycenę dochodu już dziś.',
    'homeowner.form.promise': 'Skontaktujemy się z Tobą w ciągu 24 godzin',
    'homeowner.form.promiseDescription': 'Po rejestracji skontaktujemy się z Tobą w celu bezpłatnej konsultacji na temat tego, ile możesz zarobić na swojej nieruchomości.',
    'homeowner.form.fieldsTitle': 'Twoje dane kontaktowe',
    'homeowner.form.fieldsSubtitle': 'Potrzebujemy tylko podstawowych informacji, aby zacząć.',
    'homeowner.form.firstName': 'Imię',
    'homeowner.form.firstNamePlaceholder': 'Wpisz swoje imię',
    'homeowner.form.lastName': 'Nazwisko',
    'homeowner.form.lastNamePlaceholder': 'Wpisz swoje nazwisko',
    'homeowner.form.email': 'E-mail',
    'homeowner.form.emailPlaceholder': 'twoj@email.pl',
    'homeowner.form.phone': 'Numer telefonu',
    'homeowner.form.phonePlaceholder': '070-123 45 67',
    'homeowner.form.address': 'Adres',
    'homeowner.form.addressPlaceholder': 'Ulica i numer',
    'homeowner.form.city': 'Miasto',
    'homeowner.form.cityPlaceholder': 'Wpisz miasto',
    'homeowner.form.submit': 'Zarejestruj nieruchomość - Całkowicie bezpłatnie',
    'homeowner.form.submitting': 'Rejestrowanie...',
    'homeowner.form.success': 'Dziękujemy za rejestrację! Skontaktujemy się z Tobą w ciągu 24 godzin.',
    'homeowner.form.error': 'Wystąpił błąd. Spróbuj ponownie lub zadzwoń do nas bezpośrednio.',
    'homeowner.form.disclaimer': 'Rejestrując się, wyrażasz zgodę na kontakt z naszej strony w sprawie wynajmu Twojej nieruchomości.',

    'seo.home.title': 'Zakwaterowanie dla personelu i mieszkania służbowe w Szwecji | StayOnSite',
    'seo.home.description': 'Szybko i sprawnie organizujemy zakwaterowanie dla firm i ich personelu w całej Szwecji. Długoterminowe i elastyczne rozwiązania wynajmu dla projektów budowlanych, energetycznych i centrów danych.',
    'seo.homeowner.title': 'Wynajmij swoją nieruchomość firmom | Gwarantowany czynsz | StayOnSite',
    'seo.homeowner.description': 'Wynajmij swoją nieruchomość stabilnym firmom przez StayOnSite. Oferujemy gwarantowany dochód z najmu, zajmujemy się całą administracją i znajdujemy wiarygodnych najemców. Zarejestruj swoją nieruchomość już dziś!',
    'seo.city.title': 'Mieszkania służbowe w {cityName} | Wynajem dla personelu | StayOnSite',
    'seo.city.description': 'Twoja firma szuka zakwaterowania dla personelu w {cityName}? StayOnSite oferuje umeblowane mieszkania i domy na wynajem krótko- i długoterminowy. Skontaktuj się z nami, aby otrzymać szybką ofertę.',
    'seo.notFound.title': '404: Strona nie została znaleziona | StayOnSite',
    'seo.notFound.description': 'Strona, której szukasz, nie istnieje. Wróć na stronę główną, aby znaleźć zakwaterowanie dla personelu Twojej firmy.'
  }
};
