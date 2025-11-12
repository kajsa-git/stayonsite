export type AvailableLanguages = 'sv' | 'en' | 'pl';

export type TranslationKey =
  | 'nav.home'
  | 'nav.services'
  | 'nav.references'
  | 'nav.contact'
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
  | 'references.stats.cities';

export const translations: Record<AvailableLanguages, Record<TranslationKey, string>> = {
  sv: {
    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.references': 'Referenser',
    'nav.contact': 'Kontakt',
    'nav.inquiryForm': 'Ring oss',
    'nav.forCompanies': 'För byggbolag',
    
    'hero.title': 'Vi tar hand om personalboendet när ni rullar ut ert projekt i Sverige',
    'hero.subtitle': 'Från första ingenjör till sista montör – vi planerar, hyr och koordinerar långtidshyreslösningar nära byggplatsen.',
    'hero.cta': 'Skicka förfrågan',
    'hero.tagline': 'Långsiktigt boendestöd för etableringsteam',
    'hero.bullet1': 'Lokala bostadsnätverk runt datacenter och energikluster',
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
    'services.subtitle': 'Vi hjälper dig att snabbt hitta rätt boenden när dina arbetare eller underentreprenörer är i behov av logi på annan ort. Vi erbjuder både longstay och shortstay lösningar över hela Sverige',
    'services.tagline': 'Enkelt och smidigt',
    'services.process.title': 'Så här fungerar det',
    'services.process.step1.title': 'Skicka förfrågan',
    'services.process.step1.description': 'Fyll i vårt enkla formulär med detaljer om era behov',
    'services.process.step2.title': 'Snabbt svar',
    'services.process.step2.description': 'Vi svarar snabbt via mail eller SMS med alternativ',
    'services.process.step3.title': 'Bekräftelse',
    'services.process.step3.description': 'Välj det alternativ som passar er bäst, och vi bokar det åt er',
    'services.process.step4.title': 'Inflyttning',
    'services.process.step4.description': 'Era arbetare får all information de behöver för en smidig inflyttning',
    'services.security.title': 'Trygghet genom erfaren partner',
    'services.security.description': 'Med över 10 års erfarenhet av att hjälpa byggbolag med boende, kan ni lita på att StayOnSite levererar boenden som uppfyller era behov, i tid och enligt överenskommelse. Vi har ett brett nätverk av boendealternativ över hela Sverige.',
    'services.whyus.title': 'Varför välja oss?',
    'services.whyus.point1': 'Snabba svar inom 24 timmar',
    'services.whyus.point2': 'Boenden över hela Sverige',
    'services.whyus.point3': 'Smidig process från start till mål',
    'services.whyus.point4': 'Över 10 års erfarenhet',
    
    'references.title': 'Referenser',
    'references.subtitle': 'Vad våra kunder säger om oss',
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
    
    'faq.title': 'Vanliga frågor',
    'faq.subtitle': 'Här hittar du svar på de vanligaste frågorna om våra tjänster och personalboende.',
    'faq.tagline': 'Vanliga frågor',
    'faq.question1': 'Hur snabbt kan ni ordna boende?',
    'faq.answer1': 'Vi strävar efter att ge er alternativ inom 24 timmar efter att vi mottagit er förfrågan. I brådskande fall kan vi ofta ordna boende samma dag.',
    'faq.question2': 'Vilka städer täcker ni?',
    'faq.answer2': 'Vi har boenden i över 40 städer i Sverige, från Stockholm till Göteborg och Malmö samt många mindre orter. Kontakta oss för att höra om vi kan hjälpa er på den specifika ort ni behöver.',
    'faq.question3': 'Vad kostar det att hyra boende genom er?',
    'faq.answer3': 'Priserna varierar beroende på ort, typ av boende och längd på hyresperioden. Vi skickar alltid prisuppgifter tillsammans med våra förslag så ni kan ta ett informerat beslut.',
    'faq.question4': 'Är boendet möblerat?',
    'faq.answer4': 'Ja, alla våra boenden är fullt möblerade och utrustade med allt era arbetare behöver - sängar, kök, vardagsrum och ofta även wi-fi och parkering.',
    'faq.question5': 'Kan vi göra ändringar i bokningen efter bekräftelse?',
    'faq.answer5': 'Vi förstår att planer kan ändras i byggbranschen. Kontakta oss så snart som möjligt så hjälper vi er att göra nödvändiga ändringar, såsom förlängning eller förkortning av hyresperioden.',
    
    'footer.rights': 'Alla rättigheter förbehållna',
    'footer.contact': 'Kontakta oss',
    'footer.description': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.',
    'footer.quickLinks': 'Snabblänkar',
    'footer.location': 'Stockholm, Sverige',
    
    'floatingPhone.call': 'Ring oss',
    'floatingPhone.tooltip': 'Ring oss direkt på +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Skriv på WhatsApp',
    'floatingPhone.whatsappTooltip': 'Skriv till oss på WhatsApp – svar inom 15 minuter på vardagar',
    'stickyContact.title': 'Behöver ni boende snabbt?',
    'stickyContact.subtitle': 'Tveka inte att höra av er – vi svarar inom 15 minuter på vardagar',
    'stickyContact.call': 'Ring nu',

    'why.title': 'Varför StayOnSite',
    'why.subtitle': 'Ett lokalt team följer projektet från planering till drift så att ni kan fokusera på bygget.',
    'why.steps.plan.title': 'Planering på plats',
    'why.steps.plan.description': 'Vi kartlägger bostadsmarknaden runt er site och säkrar värdar innan etableringen startar.',
    'why.steps.plan.cta': 'Prata planering → Vi ringer inom 15 min',
    'why.steps.contracts.title': 'Kontrakt & inflytt',
    'why.steps.contracts.description': 'Hyresavtal, nycklar, inventeringar och servicelistor hanteras av oss med tydliga 3–36 mån villkor.',
    'why.steps.contracts.cta': 'Diskutera kontrakt → Snabbt svar',
    'why.steps.operations.title': 'Drift & rapportering',
    'why.steps.operations.description': 'Beläggning, veckostädning och avvikelser rapporteras direkt till projektledningen.',
    'why.steps.operations.cta': 'Fråga om drift → Vi hjälper dig',
    'case.title': 'Case: Solcellspark i Säffle',
    'case.subtitle': 'Ett polskt bolag bad oss ordna boende till hela montörsteamet inför uppstarten i Säffle.',
    'case.timeline.proposal.title': '24 h · Första förslaget klart',
    'case.timeline.proposal.description': 'Vi säkrade kontakt med lokala värdar och skickade tre alternativ inom första dygnet.',
    'case.timeline.moveIn.title': '48 h · Inflyttning startar',
    'case.timeline.moveIn.description': 'Montörerna flyttade in med färdiga nyckelrutiner, veckostädning och journummer.',
    'case.timeline.expand.title': '3 sajter · Fortsatt expansion',
    'case.timeline.expand.description': 'Samma kund har anlitat oss för tre etableringar runt Sverige med samma team.',
    'case.metrics.proposal.value': '24 h',
    'case.metrics.proposal.description': 'Första boendeförslag',
    'case.metrics.moveIn.value': '48 h',
    'case.metrics.moveIn.description': 'Första inflytten',
    'case.metrics.deployments.value': '3 sajter',
    'case.metrics.deployments.description': 'Pågående etableringar',

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
    'homeowner.form.disclaimer': 'Genom att registrera dig godkänner du att vi kontaktar dig angående uthyrning av din bostad.'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.references': 'References',
    'nav.contact': 'Contact',
    'nav.inquiryForm': 'Inquiry',
    'nav.forCompanies': 'For Companies',
    
    'hero.title': 'Let us run your staff housing in Sweden',
    'hero.subtitle': 'Planning, contracts, and move-ins handled within 24–48 hours.',
    'hero.cta': 'Send Inquiry',
    'hero.tagline': 'Long-term housing support for deployment teams',
    'hero.bullet1': 'Local housing scouts near data centers and energy parks',
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
    'services.subtitle': 'We help you quickly find the right accommodations when your workers or subcontractors need lodging in another location. We offer both longstay and shortstay solutions throughout Sweden',
    'services.tagline': 'Simple and smooth',
    'services.process.title': 'How it works',
    'services.process.step1.title': 'Send inquiry',
    'services.process.step1.description': 'Fill out our simple form with details about your needs',
    'services.process.step2.title': 'Quick response',
    'services.process.step2.description': 'We respond quickly via email or SMS with options',
    'services.process.step3.title': 'Confirmation',
    'services.process.step3.description': 'Choose the option that suits you best, and we book it for you',
    'services.process.step4.title': 'Move in',
    'services.process.step4.description': 'Your workers get all the information they need for a smooth move-in',
    'services.security.title': 'Security through an experienced partner',
    'services.security.description': 'With over 10 years of experience helping construction companies with accommodation, you can trust that StayOnSite delivers accommodations that meet your needs, on time and as agreed. We have a wide network of housing options throughout Sweden.',
    'services.whyus.title': 'Why choose us?',
    'services.whyus.point1': 'Quick responses within 24 hours',
    'services.whyus.point2': 'Accommodations throughout Sweden',
    'services.whyus.point3': 'Smooth process from start to finish',
    'services.whyus.point4': 'Over 10 years of experience',
    
    'references.title': 'References',
    'references.subtitle': 'What our customers say about us',
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
    
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Find answers to the most common questions about our services and staff accommodation.',
    'faq.tagline': 'FAQ',
    'faq.question1': 'How quickly can you arrange accommodation?',
    'faq.answer1': 'We strive to provide you with options within 24 hours of receiving your inquiry. In urgent cases, we can often arrange accommodation the same day.',
    'faq.question2': 'Which cities do you cover?',
    'faq.answer2': 'We have accommodations in over 40 cities in Sweden, from Stockholm to Gothenburg and Malmö as well as many smaller towns. Contact us to hear if we can help you in the specific location you need.',
    'faq.question3': 'What does it cost to rent accommodation through you?',
    'faq.answer3': 'Prices vary depending on location, type of accommodation and length of rental period. We always send pricing information along with our suggestions so you can make an informed decision.',
    'faq.question4': 'Is the accommodation furnished?',
    'faq.answer4': 'Yes, all our accommodations are fully furnished and equipped with everything your workers need - beds, kitchen, living room and often also wi-fi and parking.',
    'faq.question5': 'Can we make changes to the booking after confirmation?',
    'faq.answer5': 'We understand that plans can change in the construction industry. Contact us as soon as possible and we will help you make necessary changes, such as extending or shortening the rental period.',
    
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact us',
    'footer.description': 'We help construction companies quickly find accommodations in other locations for their workers.',
    'footer.quickLinks': 'Quick Links',
    'footer.location': 'Stockholm, Sweden',
    
    'floatingPhone.call': 'Call us',
    'floatingPhone.tooltip': 'Call us directly at +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Message on WhatsApp',
    'floatingPhone.whatsappTooltip': 'Message us on WhatsApp—responses within 15 minutes on weekdays',
    'stickyContact.title': 'Need housing fast?',
    'stickyContact.subtitle': 'Don\'t hesitate to reach out – we respond within 15 minutes on weekdays',
    'stickyContact.call': 'Call now',

    'why.title': 'Why StayOnSite',
    'why.subtitle': 'A local housing team shadows your rollout from planning to operations so you can stay on schedule.',
    'why.steps.plan.title': 'On-site planning',
    'why.steps.plan.description': 'We map the housing market around your site and secure landlords before the crews arrive.',
    'why.steps.plan.cta': 'Talk planning → We call within 15 min',
    'why.steps.contracts.title': 'Contracts & move-ins',
    'why.steps.contracts.description': 'We run leases, keys, inspections, and services with transparent 3–36 month terms.',
    'why.steps.contracts.cta': 'Discuss contracts → Fast response',
    'why.steps.operations.title': 'Operations & reporting',
    'why.steps.operations.description': 'Occupancy, weekly cleaning, and incident reports go straight to the project manager.',
    'why.steps.operations.cta': 'Ask about operations → We help you',
    'case.title': 'Case: Solar park in Säffle',
    'case.subtitle': 'A Polish contractor asked us to house their entire installer crew ahead of the Säffle build.',
    'case.timeline.proposal.title': '24 h · First proposal ready',
    'case.timeline.proposal.description': 'We activated local landlords and delivered three options within the first day.',
    'case.timeline.moveIn.title': '48 h · Crews moved in',
    'case.timeline.moveIn.description': 'Installers received keys, weekly cleaning, and an on-call number before arrival.',
    'case.timeline.expand.title': '3 sites · Ongoing rollout',
    'case.timeline.expand.description': 'The same client now uses us on three Swedish deployments with the same housing playbook.',
    'case.metrics.proposal.value': '24 h',
    'case.metrics.proposal.description': 'First proposal',
    'case.metrics.moveIn.value': '48 h',
    'case.metrics.moveIn.description': 'First move-in',
    'case.metrics.deployments.value': '3 sites',
    'case.metrics.deployments.description': 'Active rollouts',

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
    'homeowner.form.disclaimer': 'By registering, you agree that we may contact you regarding renting out your property.'
  },
  pl: {
    'nav.home': 'Strona główna',
    'nav.services': 'Usługi',
    'nav.references': 'Referencje',
    'nav.contact': 'Kontakt',
    'nav.inquiryForm': 'Zapytanie',
    'nav.forCompanies': 'Dla firm',

    'hero.title': 'Zajmiemy się zakwaterowaniem Twojego zespołu w Szwecji',
    'hero.subtitle': 'Planowanie, umowy i wprowadzki w 24–48 godzin.',
    'hero.cta': 'Wyślij zapytanie',
    'hero.tagline': 'Długoterminowe wsparcie mieszkaniowe dla zespołów projektowych',
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
    'services.subtitle': 'Pomagamy szybko znaleźć odpowiednie zakwaterowanie, gdy Twoi pracownicy lub podwykonawcy potrzebują miejsca noclegowego w innej miejscowości. Oferujemy rozwiązania zarówno krótko-, jak i długoterminowe w całej Szwecji.',
    'services.tagline': 'Prosto i sprawnie',
    'services.process.title': 'Jak to działa',
    'services.process.step1.title': 'Wyślij zapytanie',
    'services.process.step1.description': 'Wypełnij nasz prosty formularz, podając szczegóły dotyczące Twoich potrzeb.',
    'services.process.step2.title': 'Szybka odpowiedź',
    'services.process.step2.description': 'Odpowiadamy szybko przez e-mail lub SMS, przedstawiając dostępne propozycje.',
    'services.process.step3.title': 'Potwierdzenie',
    'services.process.step3.description': 'Wybierz najlepszą dla siebie opcję, a my dokonamy rezerwacji.',
    'services.process.step4.title': 'Wprowadzka',
    'services.process.step4.description': 'Twoi pracownicy otrzymują wszystkie informacje potrzebne do sprawnej wprowadzki.',
    'services.security.title': 'Bezpieczeństwo dzięki doświadczonemu partnerowi',
    'services.security.description': 'Dzięki ponad 10-letniemu doświadczeniu w zapewnianiu zakwaterowania dla firm budowlanych, możesz nam zaufać. StayOnSite zapewnia obiekty spełniające Twoje potrzeby, na czas i zgodnie z umową. Posiadamy szeroką sieć mieszkań w całej Szwecji.',
    'services.whyus.title': 'Dlaczego my?',
    'services.whyus.point1': 'Szybkie odpowiedzi w ciągu 24 godzin',
    'services.whyus.point2': 'Zakwaterowanie w całej Szwecji',
    'services.whyus.point3': 'Sprawny proces od początku do końca',
    'services.whyus.point4': 'Ponad 10 lat doświadczenia',

    'references.title': 'Referencje',
    'references.subtitle': 'Co nasi klienci mówią o nas',
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

    'faq.title': 'Najczęściej zadawane pytania',
    'faq.subtitle': 'Tutaj znajdziesz odpowiedzi na najczęstsze pytania dotyczące naszych usług i zakwaterowania dla pracowników.',
    'faq.tagline': 'FAQ',
    'faq.question1': 'Jak szybko możecie zorganizować zakwaterowanie?',
    'faq.answer1': 'Staramy się przedstawić opcje w ciągu 24 godzin od otrzymania zapytania. W pilnych przypadkach często możemy zorganizować zakwaterowanie tego samego dnia.',
    'faq.question2': 'W jakich miastach działacie?',
    'faq.answer2': 'Posiadamy obiekty w ponad 40 miastach w Szwecji, od Sztokholmu po Göteborg i Malmö, a także w wielu mniejszych miejscowościach. Skontaktuj się z nami, aby dowiedzieć się, czy możemy pomóc w Twojej lokalizacji.',
    'faq.question3': 'Ile kosztuje wynajem zakwaterowania za Waszym pośrednictwem?',
    'faq.answer3': 'Ceny różnią się w zależności od lokalizacji, rodzaju zakwaterowania i długości okresu najmu. Zawsze wysyłamy informacje o cenach wraz z naszymi propozycjami, abyś mógł podjąć świadomą decyzję.',
    'faq.question4': 'Czy zakwaterowanie jest umeblowane?',
    'faq.answer4': 'Tak, wszystkie nasze obiekty są w pełni umeblowane i wyposażone we wszystko, czego potrzebują Twoi pracownicy - łóżka, kuchnię, salon, a często także Wi-Fi i parking.',
    'faq.question5': 'Czy możemy wprowadzać zmiany w rezerwacji po jej potwierdzeniu?',
    'faq.answer5': 'Rozumiemy, że plany w branży budowlanej mogą się zmieniać. Skontaktuj się z nami jak najszybciej, a pomożemy Ci wprowadzić niezbędne zmiany, takie jak wydłużenie lub skrócenie okresu najmu.',

    'footer.rights': 'Wszelkie prawa zastrzeżone',
    'footer.contact': 'Skontaktuj się z nami',
    'footer.description': 'Pomagamy firmom budowlanym szybko znaleźć zakwaterowanie w innych miejscowościach dla ich pracowników.',
    'footer.quickLinks': 'Szybkie linki',
    'footer.location': 'Sztokholm, Szwecja',

    'floatingPhone.call': 'Zadzwoń do nas',
    'floatingPhone.tooltip': 'Zadzwoń do nas bezpośrednio pod numer +46 73-628 77 09',
    'floatingPhone.whatsapp': 'Napisz na WhatsApp',
    'floatingPhone.whatsappTooltip': 'Napisz do nas na WhatsApp – odpowiadamy w 15 minut w dni robocze',
    'stickyContact.title': 'Potrzebujesz szybko zakwaterowania?',
    'stickyContact.subtitle': 'Nie wahaj się z nami skontaktować – odpowiadamy w 15 minut w dni robocze',
    'stickyContact.call': 'Zadzwoń teraz',

    'why.title': 'Dlaczego StayOnSite',
    'why.subtitle': 'Lokalny zespół wspiera projekt od planowania po bieżącą obsługę, abyście mogli skupić się na budowie.',
    'why.steps.plan.title': 'Planowanie na miejscu',
    'why.steps.plan.description': 'Analizujemy rynek nieruchomości wokół Państwa inwestycji i pozyskujemy wynajmujących, zanim dotrą ekipy.',
    'why.steps.plan.cta': 'Porozmawiajmy o planie → Oddzwonimy w 15 min',
    'why.steps.contracts.title': 'Umowy i wprowadzki',
    'why.steps.contracts.description': 'Zarządzamy umowami najmu, przekazaniem kluczy, protokołami zdawczo-odbiorczymi i serwisem w ramach przejrzystych umów na 3–36 miesięcy.',
    'why.steps.contracts.cta': 'Omów umowy → Szybka odpowiedź',
    'why.steps.operations.title': 'Bieżąca obsługa i raportowanie',
    'why.steps.operations.description': 'Raporty dotyczące obłożenia, cotygodniowego sprzątania i ewentualnych usterek trafiają bezpośrednio do kierownika projektu.',
    'why.steps.operations.cta': 'Zapytaj o obsługę → Pomożemy',
    'case.title': 'Studium przypadku: Farma fotowoltaiczna w Säffle',
    'case.subtitle': 'Polska firma poprosiła nas o zakwaterowanie całego zespołu monterów przed startem inwestycji w Säffle.',
    'case.timeline.proposal.title': '24 h · Pierwsza oferta gotowa',
    'case.timeline.proposal.description': 'Skontaktowaliśmy się z lokalnymi wynajmującymi i w ciągu doby przedstawiliśmy trzy opcje.',
    'case.timeline.moveIn.title': '48 h · Wprowadzka ekipy',
    'case.timeline.moveIn.description': 'Monterzy otrzymali klucze, harmonogram sprzątania i numer alarmowy jeszcze przed przyjazdem.',
    'case.timeline.expand.title': '3 lokalizacje · Stała współpraca',
    'case.timeline.expand.description': 'Ten sam klient korzysta dziś z naszego wsparcia przy trzech projektach w całej Szwecji.',
    'case.metrics.proposal.value': '24 h',
    'case.metrics.proposal.description': 'Pierwsza propozycja',
    'case.metrics.moveIn.value': '48 h',
    'case.metrics.moveIn.description': 'Pierwsza wprowadzka',
    'case.metrics.deployments.value': '3 lokalizacje',
    'case.metrics.deployments.description': 'Aktywne projekty',

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
    'homeowner.form.disclaimer': 'Rejestrując się, wyrażasz zgodę na kontakt z naszej strony w sprawie wynajmu Twojej nieruchomości.'
  }
};
