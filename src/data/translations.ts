export type AvailableLanguages = 'sv' | 'en';

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
  | 'floatingPhone.call'
  | 'floatingPhone.tooltip'
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
  | 'homeowner.form.disclaimer';

export const translations: Record<AvailableLanguages, Record<TranslationKey, string>> = {
  sv: {
    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.references': 'Referenser',
    'nav.contact': 'Kontakt',
    'nav.inquiryForm': 'Ring oss',
    'nav.forCompanies': 'För byggbolag',
    
    'hero.title': 'Snabbt boende till era byggarbetare',
    'hero.subtitle': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare',
    'hero.cta': 'Skicka förfrågan',
    'hero.tagline': 'Snabbt. Enkelt. Effektivt.',
    
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
    
    'floatingPhone.call': 'Ring oss',
    'floatingPhone.tooltip': 'Ring oss direkt på 076-249 84 86',
    
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
    
    'hero.title': 'Fast accommodation for your construction workers',
    'hero.subtitle': 'We help construction companies quickly find accommodations in other locations for their workers',
    'hero.cta': 'Send Inquiry',
    'hero.tagline': 'Calm. Simple. Effective.',
    
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
    
    'floatingPhone.call': 'Call us',
    'floatingPhone.tooltip': 'Call us directly at 076-249 84 86',
    
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
  }
};
