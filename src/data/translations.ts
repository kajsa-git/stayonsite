
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
  | 'services.title'
  | 'services.subtitle'
  | 'services.process.title'
  | 'services.process.step1.title'
  | 'services.process.step1.description'
  | 'services.process.step2.title'
  | 'services.process.step2.description'
  | 'services.process.step3.title'
  | 'services.process.step3.description'
  | 'services.process.step4.title'
  | 'services.process.step4.description'
  | 'references.title'
  | 'references.subtitle'
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
  | 'footer.rights'
  | 'footer.contact';

export const translations: Record<AvailableLanguages, Record<TranslationKey, string>> = {
  sv: {
    'nav.home': 'Hem',
    'nav.services': 'Tjänster',
    'nav.references': 'Referenser',
    'nav.contact': 'Kontakt',
    'nav.inquiryForm': 'Förfrågan',
    
    'hero.title': 'Snabbt boende till era byggarbetare',
    'hero.subtitle': 'Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare',
    'hero.cta': 'Skicka förfrågan',
    
    'services.title': 'Våra tjänster',
    'services.subtitle': 'Vi erbjuder en smidig process för att hitta rätt boende till era behov',
    'services.process.title': 'Så här fungerar det',
    'services.process.step1.title': 'Skicka förfrågan',
    'services.process.step1.description': 'Fyll i vårt enkla formulär med detaljer om era behov',
    'services.process.step2.title': 'Snabbt svar',
    'services.process.step2.description': 'Vi svarar snabbt via mail eller SMS med alternativ',
    'services.process.step3.title': 'Bekräftelse',
    'services.process.step3.description': 'Välj det alternativ som passar er bäst, och vi bokar det åt er',
    'services.process.step4.title': 'Inflyttning',
    'services.process.step4.description': 'Era arbetare får all information de behöver för en smidig inflyttning',
    
    'references.title': 'Referenser',
    'references.subtitle': 'Vad våra kunder säger om oss',
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
    
    'footer.rights': 'Alla rättigheter förbehållna',
    'footer.contact': 'Kontakta oss'
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
    
    'services.title': 'Our Services',
    'services.subtitle': 'We offer a smooth process to find the right accommodation for your needs',
    'services.process.title': 'How it works',
    'services.process.step1.title': 'Send inquiry',
    'services.process.step1.description': 'Fill out our simple form with details about your needs',
    'services.process.step2.title': 'Quick response',
    'services.process.step2.description': 'We respond quickly via email or SMS with options',
    'services.process.step3.title': 'Confirmation',
    'services.process.step3.description': 'Choose the option that suits you best, and we book it for you',
    'services.process.step4.title': 'Move in',
    'services.process.step4.description': 'Your workers get all the information they need for a smooth move-in',
    
    'references.title': 'References',
    'references.subtitle': 'What our customers say about us',
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
    
    'footer.rights': 'All rights reserved',
    'footer.contact': 'Contact us'
  }
};
