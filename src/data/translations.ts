export type AvailableLanguages = 'sv' | 'en';

export type TranslationKey =
  | 'nav.home'
  | 'nav.services'
  | 'nav.references'
  | 'nav.contact'
  | 'nav.inquiryForm'
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
  | 'footer.rights'
  | 'footer.contact'
  | 'footer.description'
  | 'footer.quickLinks';

export const translations: Record<AvailableLanguages, Record<TranslationKey, string>> = {
  sv: {
    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.references': 'Referenser',
    'nav.contact': 'Kontakt',
    'nav.inquiryForm': 'Ring oss',
    
    'hero.title': 'Snabbt boende till era byggarbetare',
    'hero.subtitle': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare',
    'hero.cta': 'Skicka förfrågan',
    'hero.tagline': 'Lugnt. Enkelt. Effektivt.',
    
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
    
    'footer.rights': 'Alla rättigheter förbehållna',
    'footer.contact': 'Kontakta oss',
    'footer.description': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.',
    'footer.quickLinks': 'Snabblänkar'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.references': 'References',
    'nav.contact': 'Contact',
    'nav.inquiryForm': 'Inquiry',
    
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
    
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact us',
    'footer.description': 'We help construction companies quickly find accommodations in other locations for their workers.',
    'footer.quickLinks': 'Quick Links'
  }
};
