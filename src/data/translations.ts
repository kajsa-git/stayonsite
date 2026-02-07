export type AvailableLanguages = "sv" | "en" | "pl";

export type TranslationKey =
  | "nav.home"
  | "nav.services"
  | "nav.references"
  | "nav.contact"
  | "nav.case"
  | "nav.inquiryForm"
  | "nav.homeowner"
  | "nav.forCompanies"
  | "hero.title"
  | "hero.subtitle"
  | "hero.cta"
  | "hero.tagline"
  | "hero.bullet1"
  | "hero.bullet2"
  | "hero.bullet3"
  | "hero.ctaPhone"
  | "hero.ctaWhatsapp"
  | "hero.ctaSubtext"
  | "hero.responseTime"
  | "hero.metrics.proposal.value"
  | "hero.metrics.proposal.description"
  | "hero.metrics.moveIn.value"
  | "hero.metrics.moveIn.description"
  | "hero.metrics.deployments.value"
  | "hero.metrics.deployments.description"
  | "services.title"
  | "services.subtitle"
  | "services.tagline"
  | "services.process.title"
  | "services.process.step1.title"
  | "services.process.step1.description"
  | "services.process.step2.title"
  | "services.process.step2.description"
  | "services.process.step3.title"
  | "services.process.step3.description"
  | "services.process.step4.title"
  | "services.process.step4.description"
  | "services.security.title"
  | "services.security.description"
  | "services.whyus.title"
  | "services.whyus.point1"
  | "services.whyus.point2"
  | "services.whyus.point3"
  | "services.whyus.point4"
  | "services.card1.title"
  | "services.card1.highlight"
  | "services.card1.description"
  | "services.card1.bullet1"
  | "services.card1.bullet2"
  | "services.card1.bullet3"
  | "services.card1.cta"
  | "services.card2.title"
  | "services.card2.highlight"
  | "services.card2.description"
  | "services.card2.bullet1"
  | "services.card2.bullet2"
  | "services.card2.bullet3"
  | "services.card2.cta"
  | "services.card3.title"
  | "services.card3.highlight"
  | "services.card3.description"
  | "services.card3.bullet1"
  | "services.card3.bullet2"
  | "services.card3.bullet3"
  | "services.card3.cta"
  | "references.title"
  | "references.subtitle"
  | "references.tagline"
  | "references.testimonial1.quote"
  | "references.testimonial1.author"
  | "references.testimonial1.company"
  | "references.testimonial2.quote"
  | "references.testimonial2.author"
  | "references.testimonial2.company"
  | "references.testimonial3.quote"
  | "references.testimonial3.author"
  | "references.testimonial3.company"
  | "inquiry.title"
  | "inquiry.subtitle"
  | "inquiry.tagline"
  | "inquiry.form.companyName"
  | "inquiry.form.contactName"
  | "inquiry.form.email"
  | "inquiry.form.phone"
  | "inquiry.form.location"
  | "inquiry.form.workers"
  | "inquiry.form.startDate"
  | "inquiry.form.endDate"
  | "inquiry.form.message"
  | "inquiry.form.submit"
  | "inquiry.form.success"
  | "inquiry.form.error"
  | "inquiry.form.untilFurtherNotice"
  | "inquiry.contactInfo.title"
  | "inquiry.cta.meeting"
  | "faq.title"
  | "faq.subtitle"
  | "faq.tagline"
  | "faq.question1"
  | "faq.answer1"
  | "faq.question2"
  | "faq.answer2"
  | "faq.question3"
  | "faq.answer3"
  | "faq.question4"
  | "faq.answer4"
  | 'faq.question5'
  | 'faq.answer5'
  | 'faq.question6'
  | 'faq.answer6'
  | "footer.rights"
  | "footer.contact"
  | "footer.description"
  | "footer.quickLinks"
  | "footer.location"
  | "footer.care"
  | "floatingPhone.call"
  | "floatingPhone.tooltip"
  | "floatingPhone.whatsapp"
  | "floatingPhone.whatsappTooltip"
  | "stickyContact.title"
  | "stickyContact.subtitle"
  | "stickyContact.call"
  | "why.title"
  | "why.subtitle"
  | "why.steps.plan.title"
  | "why.steps.plan.description"
  | "why.steps.plan.cta"
  | "why.steps.contracts.title"
  | "why.steps.contracts.description"
  | "why.steps.contracts.cta"
  | "why.steps.operations.title"
  | "why.steps.operations.description"
  | "why.steps.operations.cta"
  | "case.title"
  | "case.subtitle"
  | "case.tagline"
  | "case.timeline.proposal.title"
  | "case.timeline.proposal.description"
  | "case.timeline.moveIn.title"
  | "case.timeline.moveIn.description"
  | "case.timeline.expand.title"
  | "case.timeline.expand.description"
  | "case.metrics.proposal.value"
  | "case.metrics.proposal.description"
  | "case.metrics.moveIn.value"
  | "case.metrics.moveIn.description"
  | 'case.metrics.deployments.value'
  | 'case.metrics.deployments.description'
  | 'case.cta.question'
  | 'case.cta.button'
  | 'case.cta.description'
  | 'case.cta.callDirect'
  | 'case.cta.responseTime'
  | "homeowner.hero.title"
  | "homeowner.hero.subtitle"
  | "homeowner.hero.pill"
  | "homeowner.hero.incomeRange"
  | "homeowner.hero.incomeDescription"
  | "homeowner.hero.cta"
  | "homeowner.hero.trustBadge"
  | "homeowner.benefits.title"
  | "homeowner.benefits.subtitle"
  | "homeowner.benefits.income.title"
  | "homeowner.benefits.income.description"
  | "homeowner.benefits.security.title"
  | "homeowner.benefits.security.description"
  | "homeowner.benefits.hassle.title"
  | "homeowner.benefits.hassle.description"
  | "homeowner.benefits.flexibility.title"
  | "homeowner.benefits.flexibility.description"
  | "homeowner.benefits.guarantee.title"
  | "homeowner.benefits.guarantee.description"
  | "homeowner.guarantee.title"
  | "homeowner.guarantee.subtitle"
  | "homeowner.guarantee.payment.title"
  | "homeowner.guarantee.payment.description"
  | "homeowner.guarantee.protection.title"
  | "homeowner.guarantee.protection.description"
  | "homeowner.guarantee.support.title"
  | "homeowner.guarantee.support.description"
  | "homeowner.guarantee.badge"
  | "homeowner.guarantee.badgeDescription"
  | "homeowner.process.title"
  | "homeowner.process.subtitle"
  | "homeowner.process.step1.title"
  | "homeowner.process.step1.description"
  | "homeowner.process.step2.title"
  | "homeowner.process.step2.description"
  | "homeowner.process.step3.title"
  | "homeowner.process.step3.description"
  | "homeowner.process.step4.title"
  | "homeowner.process.step4.description"
  | "homeowner.process.step5.title"
  | "homeowner.process.step5.description"
  | "homeowner.process.step1.time"
  | "homeowner.process.step2.time"
  | "homeowner.process.step3.time"
  | "homeowner.process.step4.time"
  | "homeowner.process.step5.time"
  | "homeowner.process.businessModel"
  | "homeowner.comparison.title"
  | "homeowner.comparison.subtitle"
  | "homeowner.comparison.note"
  | "homeowner.testimonials.title"
  | "homeowner.testimonials.subtitle"
  | "homeowner.testimonials.testimonial1.quote"
  | "homeowner.testimonials.testimonial1.author"
  | "homeowner.testimonials.testimonial1.location"
  | "homeowner.testimonials.testimonial1.income"
  | "homeowner.testimonials.testimonial2.quote"
  | "homeowner.testimonials.testimonial2.author"
  | "homeowner.testimonials.testimonial2.location"
  | "homeowner.testimonials.testimonial2.income"
  | "homeowner.testimonials.testimonial3.quote"
  | "homeowner.testimonials.testimonial3.author"
  | "homeowner.testimonials.testimonial3.location"
  | "homeowner.testimonials.testimonial3.income"
  | "homeowner.testimonials.trustIndicator"
  | "homeowner.testimonials.trustDescription"
  | "homeowner.about.title"
  | "homeowner.about.subtitle"
  | "homeowner.about.message"
  | "homeowner.about.kajsa"
  | "homeowner.about.team"
  | "homeowner.about.nathalie"
  | "homeowner.about.cta"
  | "homeowner.hero.stats.homeowners"
  | "homeowner.hero.stats.homeownersLabel"
  | "homeowner.hero.stats.fee"
  | "homeowner.hero.stats.feeLabel"
  | "homeowner.hero.stats.guarantee"
  | "homeowner.hero.stats.guaranteeLabel"
  | "homeowner.hero.estimatedIncome"
  | "homeowner.benefits.sectionLabel"
  | "homeowner.faq.sectionLabel"
  | "homeowner.testimonials.sectionLabel"
  | "homeowner.form.sectionLabel"
  | "homeowner.faq.title"
  | "homeowner.faq.subtitle"
  | "homeowner.faq.question1"
  | "homeowner.faq.answer1"
  | "homeowner.faq.question2"
  | "homeowner.faq.answer2"
  | "homeowner.faq.question3"
  | "homeowner.faq.answer3"
  | "homeowner.faq.question4"
  | "homeowner.faq.answer4"
  | "homeowner.faq.question5"
  | "homeowner.faq.answer5"
  | "homeowner.faq.question6"
  | "homeowner.faq.answer6"
  | "homeowner.faq.contactPrompt"
  | "homeowner.form.title"
  | "homeowner.form.subtitle"
  | "homeowner.form.promise"
  | "homeowner.form.promiseDescription"
  | "homeowner.form.fieldsTitle"
  | "homeowner.form.fieldsSubtitle"
  | "homeowner.form.firstName"
  | "homeowner.form.firstNamePlaceholder"
  | "homeowner.form.lastName"
  | "homeowner.form.lastNamePlaceholder"
  | "homeowner.form.email"
  | "homeowner.form.emailPlaceholder"
  | "homeowner.form.phone"
  | "homeowner.form.phonePlaceholder"
  | "homeowner.form.address"
  | "homeowner.form.addressPlaceholder"
  | "homeowner.form.city"
  | "homeowner.form.cityPlaceholder"
  | "homeowner.form.submit"
  | "homeowner.form.submitLine1"
  | "homeowner.form.submitLine2"
  | "homeowner.form.submitting"
  | "homeowner.form.success"
  | "homeowner.form.error"
  | "homeowner.form.disclaimer"
  | "references.stats.happyClients"
  | "references.stats.accommodations"
  | "references.stats.responseTime"
  | "references.stats.cities"
  | "seo.home.title"
  | "seo.home.description"
  | "seo.homeowner.title"
  | "seo.homeowner.description"
  | "seo.city.title"
  | "seo.city.description"
  | "seo.notFound.title"
  | "seo.notFound.description";

export const translations: Record<
  AvailableLanguages,
  Record<TranslationKey, string>
> = {
  sv: {
    "nav.home": "Hem",
    "nav.services": "Tjänster",
    "nav.references": "Referenser",
    "nav.contact": "Kontakt",
    "nav.case": "Case Säffle",
    "nav.inquiryForm": "Ring oss",
    "nav.forCompanies": "För byggbolag",

    "hero.title": "När ni har projekt i Sverige - så ordnar vi boendet",
    "hero.subtitle": "Från första ingenjör till sista montör",
    "hero.cta": "Skicka förfrågan",
    "hero.tagline": "Etableringspartner i Sverige",
    "hero.bullet1": "Lägenheter och villor - vi möter era behov",
    "hero.bullet2": "Alltid fullt möblerat och inflyttningsklart",
    "hero.bullet3": "Vi hjälper dig - telefon, SMS eller WhatsApp dygnet runt",
    "hero.ctaPhone": "Ring oss nu",
    "hero.ctaWhatsapp": "Chatta på WhatsApp",
    "hero.ctaSubtext": "+46 73-628 77 09 · Telefon / SMS / WhatsApp",
    "hero.responseTime": "Svar inom 15 minuter vardagar",
    "hero.metrics.proposal.value": "24 h",
    "hero.metrics.proposal.description": "Första boendeförslaget",
    "hero.metrics.moveIn.value": "48 h",
    "hero.metrics.moveIn.description": "Första inflytten klar",
    "hero.metrics.deployments.value": "3 orter",
    "hero.metrics.deployments.description": "Per kund i snitt",

    "services.title": "Vi ordnar företagsboenden i Stockholm",
    "services.subtitle":
      "Vi säkrar personalboenden nära era sajter – från två veckor till flera år – över hela Sverige.",
    "services.tagline": "Enkelt och smidigt",
    "services.process.title": "Så här fungerar det",
    "services.process.step1.title": "Skicka förfrågan",
    "services.process.step1.description":
      "Fyll i vårt enkla formulär med detaljer om era behov",
    "services.process.step2.title": "Snabbt svar",
    "services.process.step2.description":
      "Vi svarar via mail, SMS eller WhatsApp – oftast inom 15 minuter, alltid inom ett dygn",
    "services.process.step3.title": "Bekräftelse",
    "services.process.step3.description":
      "Välj det alternativ som passar er bäst, och vi bokar det åt er",
    "services.process.step4.title": "Inflyttning",
    "services.process.step4.description":
      "Era arbetare får all information de behöver för en smidig inflyttning",
    "services.security.title": "Trygghet genom erfaren partner",
    "services.security.description":
      "Inga mellanhänder, inga vänteköer. Ni når oss direkt och vi återkopplar – oftast inom 15 minuter, alltid inom ett dygn. 10+ års erfarenhet från byggbranschen.",
    "services.whyus.title": "Varför välja oss?",
    "services.whyus.point1": "Snabba svar inom 24 timmar",
    "services.whyus.point2": "Boenden över hela Sverige",
    "services.whyus.point3": "Smidig process från start till mål",
    "services.whyus.point4": "Över 10 års erfarenhet",
    'services.card1.title': 'Förfrågan och förslag',
    'services.card1.highlight': 'Besked inom 24 h',
    'services.card1.description': '',
    'services.card1.bullet1': 'Boenden i hela Sverige',
    "services.card1.bullet2": "Alternativ med egna eller delade sovrum",
    'services.card1.bullet3': '',
    "services.card1.cta": "Skicka förfrågan →",
    "services.card2.title": "Kontrakt & inflytt",
    "services.card2.highlight": "Smidiga 3–36 mån villkor",
    "services.card2.description":
      "Vi sköter allt - ni behöver bara flytta in.",
    "services.card2.bullet1": "Hyresavtal med digital signering",
    "services.card2.bullet2": "",
    "services.card2.bullet3": "Support via telefon eller WhatsApp",
    "services.card2.cta": "Ring oss nu →",
    "services.card3.title": "Löpande service",
    "services.card3.highlight": "Ni bygger – vi driver hemmet",
    "services.card3.description":
      "Vi tar hand om er tills sista personen flyttar ut och underhåller boendet när det behövs. Vi är alltid bara ett samtal bort.",
    "services.card3.bullet1": "Underhåll vid behov",
    "services.card3.bullet2": "Direktkontakt vid frågor",
    "services.card3.bullet3": "",
    "services.card3.cta": "Fråga om drift →",

    "references.title": "Referenser",
    "references.subtitle": "Omdömen från några av våra kunder.",
    "references.tagline": "Vad våra kunder säger",
    "references.testimonial1.quote":
      "Alltid trevligt och professionellt bemötande. Enkelt och smidigt att hyra, och servicen var riktigt bra. Rekommenderar varmt StayOnSite.",
    "references.testimonial1.author": "Mats Johansson",
    "references.testimonial1.company": "Logistik",
    "references.testimonial2.quote":
      "Tusen tack Kajsa för ditt fantastiska engagemang, mycket bättre än det jag fått från de stora etablerade företagen!",
    "references.testimonial2.author": "Sara Magnusson",
    "references.testimonial2.company": "Energi",
    "references.testimonial3.quote":
      "Snabb service och flexibla lösningar. Rekommenderar varmt!",
    "references.testimonial3.author": "Erik Lindberg",
    "references.testimonial3.company": "Grönt Stål",

    "inquiry.title": "Skicka en förfrågan",
    "inquiry.subtitle":
      "Fyll i formuläret nedan så återkommer vi så snart som möjligt",
    "inquiry.tagline": "Kontakta oss",
    "inquiry.form.companyName": "Företagsnamn",
    "inquiry.form.contactName": "Kontaktperson",
    "inquiry.form.email": "E-post",
    "inquiry.form.phone": "Telefon",
    "inquiry.form.location": "Önskad ort",
    "inquiry.form.workers": "Antal arbetare",
    "inquiry.form.startDate": "Startdatum",
    "inquiry.form.endDate": "Slutdatum",
    "inquiry.form.message": "Meddelande",
    "inquiry.form.submit": "Skicka förfrågan",
    "inquiry.form.success":
      "Tack för din förfrågan! Vi återkommer så snart som möjligt.",
    "inquiry.form.error":
      "Det uppstod ett fel vid skickandet av formuläret. Försök igen senare.",
    "inquiry.form.untilFurtherNotice": "Tillsvidare",
    "inquiry.contactInfo.title": "Kontaktinformation",
    "inquiry.cta.meeting": "Boka 15 min",

    "faq.title": "Vanliga frågor",
    "faq.subtitle":
      "Kort om hur vi jobbar, hur snabbt det går och vad som ingår.",
    "faq.tagline": "Vanliga frågor",
    "faq.question1": "Hur snabbt kan ni ordna boende?",
    "faq.answer1": "Vi presenterar oftast alternativ inom 24 h.",
    "faq.question2": "Vilka städer täcker ni?",
    "faq.answer2":
      "Vi har lokala hyresvärdar över hela Sverige - fråga oss gärna om du har en specifik ort.",
    "faq.question3": "Vad kostar det att hyra boende genom er?",
    "faq.answer3":
      "Priset styrs av antal personer, ort, delade eller separata sovrum etc. Vi kommer överens om villkoren tillsammans och ni får en tydlig offert.",
    "faq.question4": "Är boendet möblerat?",
    "faq.answer4":
      "Ja, det är alltid fullt möblerat. Skulle ni behöva något speciellt så hjälper vi till att ordna det.",
    "faq.question5": "Kan vi göra ändringar i bokningen efter bekräftelse?",
    "faq.answer5":
      "Hör av er direkt så ser vi vad vi kan göra. I många fall går det att lösa - vi är vana med svängiga tidsplaner.",
    "faq.question6": "Vad kostar det att anlita er som boende koordinator?",
    "faq.answer6":
      "Det kostar ingenting, ni betalar endast för de boenden ni hyr. Inga andra avgifter tillkommer.",

    "footer.rights": "Alla rättigheter förbehållna",
    "footer.contact": "Kontakta oss",
    "footer.description":
      "Vi hjälper byggbolag att snabbt hitta boenden på annan ort för deras arbetare.",
    "footer.quickLinks": "Snabblänkar",
    "footer.location": "Solna, Sverige",
    "footer.care": "Med omsorg, Kajsa med Team",

    "floatingPhone.call": "Ring oss",
    "floatingPhone.tooltip": "Ring oss direkt på +46 73-628 77 09",
    "floatingPhone.whatsapp": "Skriv på WhatsApp",
    "floatingPhone.whatsappTooltip":
      "Skriv till oss på WhatsApp – svar inom 15 minuter på vardagar",
    "stickyContact.title": "Behöver ni boende?",
    "stickyContact.subtitle": "Hör av dig via telefon eller SMS",
    "stickyContact.call": "Ring nu",

    "why.title": "Varför StayOnSite",
    "why.subtitle":
      "Vi hjälper ert företag med boenden i hela Sverige – från smarta lägenheter till rymliga villor. Alltid fullt möblerade och inflyttningsklara.",
    "why.steps.plan.title": "Planering & förslag",
    "why.steps.plan.description":
      "Skicka förfrågan via formulär, mail eller WhatsApp. Vi kartlägger lokala värdar och svarar med alternativ – oftast inom 15 minuter, alltid inom ett dygn.",
    "why.steps.plan.cta": "Skicka förfrågan →",
    "why.steps.contracts.title": "Kontrakt & inflytt",
    "why.steps.contracts.description":
      "Välj alternativ som passar er. Vi hanterar hyresavtal, nycklar och inventeringar med tydliga 3–36 mån villkor. Era arbetare får all info för smidig inflyttning.",
    "why.steps.contracts.cta": "Ring oss nu →",
    "why.steps.operations.title": "Drift & rapportering",
    "why.steps.operations.description":
      "Beläggning, veckostädning och avvikelser rapporteras direkt till projektledningen. Ni når oss direkt – inga mellanhänder, inga vänteköer.",
    "why.steps.operations.cta": "Fråga om drift →",
    "case.tagline": "Kundcase",
    "case.title": "Så hjälpte vi ett polskt bolag med 45 montörer i Säffle",
    "case.subtitle":
      "Solcellspark med kort varsel – från förfrågan till inflytt på 48 timmar.",
    "case.timeline.proposal.title": "24 h · Förslag",
    "case.timeline.proposal.description":
      "Tre alternativ skickades samma dygn tack vare lokala hyresvärdar.",
    "case.timeline.moveIn.title": "48 h · Inflytt",
    "case.timeline.moveIn.description":
      "Teamet flyttade in i fullt möblerade hus och lägenheter.",
    "case.timeline.expand.title": "Vidare samarbete",
    "case.timeline.expand.description":
      "Kunden använder oss nu vid tre etableringar i Sverige.",
    "case.metrics.proposal.value": "45 personer",
    "case.metrics.proposal.description": "Total kapacitet",
    "case.metrics.moveIn.value": "3 orter",
    "case.metrics.moveIn.description": "Samtidiga projekt",
    "case.metrics.deployments.value": "18 månader",
    "case.metrics.deployments.description": "Pågående samarbete",
    "case.cta.question": "Behöver du boende på annan ort?",
    "case.cta.button": "Skicka ett SMS",
    "case.cta.description": "Vi hjälper dig hela vägen. Hör av dig till oss direkt för ett personligt svar!",
    "case.cta.callDirect": "Ring direkt: 076-249 84 86",
    "case.cta.responseTime": "Svar inom 15 minuter",


    "references.stats.happyClients": "Nöjda kunder",
    "references.stats.accommodations": "Ordnade boenden",
    "references.stats.responseTime": "Genomsnittlig svarstid",
    "references.stats.cities": "Städer i Sverige",

    "nav.homeowner": "För husägare",

    "homeowner.hero.title": "Tjäna 10 000–30 000 kr/mån på ditt boende",
    "homeowner.hero.subtitle":
      "Vi hyr din bostad till en fast månadshyra – du får betalt utan avdrag, vi sköter resten.",
    "homeowner.hero.pill": "PASSIV INKOMST UTAN KRÅNGEL",
    "homeowner.hero.incomeRange": "10 000 – 30 000 kr/månad",
    "homeowner.hero.incomeDescription": "Fast garanterad hyra – inga avdrag",
    "homeowner.hero.cta": "Få gratis intäktsbedömning",
    "homeowner.hero.trustBadge": "Fast hyra utan avdrag · Betalning i förskott · Vi sköter allt",
    "homeowner.hero.stats.homeowners": "100+",
    "homeowner.hero.stats.homeownersLabel": "nöjda husägare",
    "homeowner.hero.stats.fee": "Inga avdrag",
    "homeowner.hero.stats.feeLabel": "från din hyra",
    "homeowner.hero.stats.guarantee": "Från 3 mån",
    "homeowner.hero.stats.guaranteeLabel": "garantiperiod",
    "homeowner.hero.estimatedIncome": "Beräknad intäkt",
    "homeowner.benefits.sectionLabel": "Fördelar",
    "homeowner.faq.sectionLabel": "Vanliga frågor",
    "homeowner.testimonials.sectionLabel": "Recensioner",
    "homeowner.form.sectionLabel": "Intresseanmälan",

    "homeowner.benefits.title": "Varför husägare väljer StayOnSite",
    "homeowner.benefits.subtitle":
      "Vi hyr din bostad av dig och tar all risk – du får en trygg, fast inkomst varje månad",
    "homeowner.benefits.income.title": "Garanterad hyra varje månad",
    "homeowner.benefits.income.description":
      "10 000–30 000 kr/mån i passiv inkomst från stabila företag. Betalning alltid i förskott, med 1 månads uppsägningstid.",
    "homeowner.benefits.security.title": "Total trygghet för ditt boende",
    "homeowner.benefits.security.description":
      "Endast verifierade företagshyresgäster, vanligtvis 30–50 år, från etablerade bolag. Besiktning och skadeskydd ingår.",
    "homeowner.benefits.hassle.title": "Vi sköter allt",
    "homeowner.benefits.hassle.description":
      "Kontrakt, nycklar, kommunikation, städning och betalningar – du behöver inte lyfta ett finger.",
    "homeowner.benefits.flexibility.title": "Du bestämmer – helt och hållet",
    "homeowner.benefits.flexibility.description":
      "Från 3 månaders avtal, 1 månads uppsägningstid. Inga långa bindningstider – du bestämmer.",
    "homeowner.benefits.guarantee.title": "Inga avdrag från din hyra",
    "homeowner.benefits.guarantee.description":
      "Andra aktörer tar 5–15 % av din hyra. Vi hyr direkt av dig till ett fast pris – du behåller hela den avtalade hyran.",

    "homeowner.guarantee.title": "Vårt löfte till dig",
    "homeowner.guarantee.subtitle": "Vi tar risken – du får tryggheten",
    "homeowner.guarantee.payment.title": "Betalningsgaranti",
    "homeowner.guarantee.payment.description": "Vi hyr bostaden av dig till en fast månadshyra, från 3 månader och uppåt. Du får alltid betalt i förskott. Uppsägningstid: bara 1 månad.",
    "homeowner.guarantee.protection.title": "Fullständigt skadeskydd",
    "homeowner.guarantee.protection.description": "Noggrann besiktning med fotodokumentation vid in- och utflytt. Försäkring ingår. Vi hanterar alla eventuella skadeärenden.",
    "homeowner.guarantee.support.title": "Personlig support dygnet runt",
    "homeowner.guarantee.support.description": "Kajsa ringer dig inom 24 timmar efter registrering. Därefter har du alltid en direkt linje till teamet – inga vänteköer, inga mellanhänder.",
    "homeowner.guarantee.badge": "100+ nöjda husägare",
    "homeowner.guarantee.badgeDescription": "Vi har hjälpt hundratals husägare att tjäna passiv inkomst med trygghet – utan en enda tvist.",

    "homeowner.process.title": "Så enkelt fungerar det",
    "homeowner.process.subtitle":
      "Från registrering till första betalningen – vi guidar dig hela vägen",
    "homeowner.process.step1.title": "Registrera din bostad",
    "homeowner.process.step1.description":
      "Fyll i vårt enkla formulär – det tar bara 2 minuter. Helt utan förpliktelse.",
    "homeowner.process.step2.title": "Kajsa ringer dig",
    "homeowner.process.step2.description":
      "Inom 24 timmar får du ett personligt samtal för att diskutera din bostad och få en kostnadsfri intäktsbedömning.",
    "homeowner.process.step3.title": "Besiktning & avtal",
    "homeowner.process.step3.description":
      "Vi kommer till dig för en kostnadsfri besiktning med fotodokumentation. Avtal från 3 månader, 1 månads uppsägningstid.",
    "homeowner.process.step4.title": "Matchning med företag",
    "homeowner.process.step4.description":
      "Vi matchar din bostad med verifierade företagshyresgäster, vanligtvis 30–50 år, från etablerade bolag.",
    "homeowner.process.step5.title": "Du får betalt varje månad",
    "homeowner.process.step5.description": "Fast hyra direkt till ditt konto, alltid i förskott. Inga avdrag, inga dolda avgifter – vi sköter resten.",
    "homeowner.process.step1.time": "2 min",
    "homeowner.process.step2.time": "Inom 24h",
    "homeowner.process.step3.time": "Vi kommer till dig",
    "homeowner.process.step4.time": "",
    "homeowner.process.step5.time": "Varje månad",
    "homeowner.process.businessModel": "Vi hyr av dig → Vi hyr ut till företag → Du får fast hyra utan avdrag",

    "homeowner.comparison.title": "StayOnSite vs andra alternativ",
    "homeowner.comparison.subtitle": "Se varför husägare väljer oss framför att hyra ut själv eller via andra aktörer",
    "homeowner.comparison.note": "Vi hyr din bostad direkt av dig till ett fast pris – inga avdrag. Andra aktörer tar 5–15 % av hyran. Du behåller hela din avtalade hyra med StayOnSite.",

    "homeowner.testimonials.title": "Vad våra husägare säger",
    "homeowner.testimonials.subtitle":
      "Husägare som tjänar passiv inkomst med trygghet genom StayOnSite",
    "homeowner.testimonials.testimonial1.quote":
      "Vi hyrde ut vårt radhus till en ingenjör via StayOnSite. Professionell, städad, aldrig några problem. Nu har vi samma upplägg med en ny hyresgäst – det bara fungerar.",
    "homeowner.testimonials.testimonial1.author": "Anna E.",
    "homeowner.testimonials.testimonial1.location": "Älvsjö, Stockholm",
    "homeowner.testimonials.testimonial1.income": "+13 000 kr/mån · 18 månader",
    "homeowner.testimonials.testimonial2.quote":
      "Kajsa skötte allt från besiktning till kontrakt. Hyresgästerna jobbar på ett 8-månaders projekt. Vi har inte behövt tänka på någonting – hyran bara trillar in varje månad.",
    "homeowner.testimonials.testimonial2.author": "Lars A.",
    "homeowner.testimonials.testimonial2.location": "Eriksberg, Göteborg",
    "homeowner.testimonials.testimonial2.income": "+11 000 kr/mån · 12 månader",
    "homeowner.testimonials.testimonial3.quote":
      "Först var jag skeptisk till att hyra ut vår lägenhet. Men företagshyresgäster är helt annorlunda. Äldre, ansvarstagande, här för jobb. Aldrig ett problem på 14 månader.",
    "homeowner.testimonials.testimonial3.author": "Maria J.",
    "homeowner.testimonials.testimonial3.location": "Limhamn, Malmö",
    "homeowner.testimonials.testimonial3.income": "+17 000 kr/mån · 14 månader",
    "homeowner.testimonials.trustIndicator":
      "100+ nöjda husägare litar på StayOnSite",
    "homeowner.testimonials.trustDescription":
      "Gå med i vårt nätverk av husägare som tjänar trygga hyresintäkter varje månad – utan bekymmer",

    "homeowner.about.title": "Möt teamet bakom StayOnSite",
    "homeowner.about.subtitle": "Personlig service – inte en anonym plattform",
    "homeowner.about.message": "Vi vet att det är en stor sak att hyra ut sitt hem. Därför är vi alltid personligt involverade – från första samtalet till sista dagen. Du pratar alltid med människor som faktiskt fattar besluten. Inga mellanhänder, inga köer.",
    "homeowner.about.kajsa": "Kajsa – Grundare & VD",
    "homeowner.about.team": "Kajsa med Team",
    "homeowner.about.nathalie": "Teamet – Dedikerad support",
    "homeowner.about.cta": "Ring oss direkt",

    "homeowner.faq.title": "Vanliga frågor från husägare",
    "homeowner.faq.subtitle":
      "Allt du behöver veta om att hyra ut tryggt med StayOnSite",
    "homeowner.faq.question1": "Hur skyddar ni mitt boende mot skador?",
    "homeowner.faq.answer1":
      "Vi gör noggrann besiktning med fotodokumentation vid både in- och utflytt. Alla företagshyresgäster har hemförsäkring. Vid eventuell skada hanterar vi hela processen – du behöver inte göra något själv.",
    "homeowner.faq.question2": "Hur mycket kan jag tjäna?",
    "homeowner.faq.answer2":
      "Vanligtvis mellan 10 000 och 30 000 kr per månad beroende på bostadens läge, storlek och skick. Företag betalar ofta 20–30 % mer än privatpersoner. Vi ger dig en kostnadsfri intäktsbedömning.",
    "homeowner.faq.question3": "Varför är företagshyresgäster bättre än privata?",
    "homeowner.faq.answer3":
      "Företagshyresgäster är här för jobb, inte för fest. De är vanligtvis 30–50 år, ansvarstagande och professionella. Företaget står för betalningen – noll risk för utebliven hyra. Dessutom innebär kortare hyresperioder att du alltid har kontroll.",
    "homeowner.faq.question4": "Vad händer mellan uthyrningar?",
    "homeowner.faq.answer4":
      "Du får tillbaka full tillgång till din bostad. Vi arbetar aktivt med att hitta nästa företagshyresgäst så snabbt som möjligt för att minimera tomgångsperioder.",
    "homeowner.faq.question5": "Behöver jag göra något speciellt med bostaden?",
    "homeowner.faq.answer5":
      "Bostaden behöver vara möblerad, ren och i fungerande skick. Vi hjälper gärna med råd om vad som behövs för att maximera din intäkt.",
    "homeowner.faq.question6": "Hur fungerar betalningen?",
    "homeowner.faq.answer6":
      "Vi hyr bostaden av dig till en fast månadshyra som betalas i förskott, direkt till ditt bankkonto. Inga avdrag, inga dolda avgifter – du vet exakt vad du får varje månad.",
    "homeowner.faq.contactPrompt": "Har du fler frågor? Ring oss direkt!",

    "homeowner.form.title": "Hur mycket kan du tjäna?",
    "homeowner.form.subtitle":
      "Lämna ditt nummer så ringer Kajsa dig inom 24 timmar med en kostnadsfri bedömning",
    "homeowner.form.promise": "Helt utan förpliktelse",
    "homeowner.form.promiseDescription":
      "Vi berättar exakt vad du kan tjäna på din bostad. Du bestämmer själv om du vill gå vidare – ingen press, inga bindningstider.",
    "homeowner.form.fieldsTitle": "Dina kontaktuppgifter",
    "homeowner.form.fieldsSubtitle":
      "Vi behöver bara grundläggande information för att komma igång",
    "homeowner.form.firstName": "Förnamn",
    "homeowner.form.firstNamePlaceholder": "Ange ditt förnamn",
    "homeowner.form.lastName": "Efternamn",
    "homeowner.form.lastNamePlaceholder": "Ange ditt efternamn",
    "homeowner.form.email": "E-post",
    "homeowner.form.emailPlaceholder": "din@email.se",
    "homeowner.form.phone": "Telefonnummer",
    "homeowner.form.phonePlaceholder": "070-123 45 67",
    "homeowner.form.address": "Adress",
    "homeowner.form.addressPlaceholder": "Gatuadress och nummer",
    "homeowner.form.city": "Stad",
    "homeowner.form.cityPlaceholder": "Ange stad",
    "homeowner.form.submit":
      "Få gratis intäktsbedömning – 2 minuter, ingen förpliktelse",
    "homeowner.form.submitLine1": "Skicka intresseanmälan",
    "homeowner.form.submitLine2": "Säkra din passiva inkomst idag",
    "homeowner.form.submitting": "Registrerar...",
    "homeowner.form.success":
      "Tack för din registrering! Vi kontaktar dig inom 24 timmar.",
    "homeowner.form.error":
      "Det uppstod ett fel. Försök igen eller ring oss direkt.",
    "homeowner.form.disclaimer": "eller ring oss direkt",

    "seo.home.title":
      "Personalboende & Företagsbostäder i Sverige | StayOnSite",
    "seo.home.description":
      "Vi ordnar snabbt och effektivt boende för företag och deras personal i hela Sverige. Långsiktiga och flexibla hyreslösningar för bygg-, energi- och datacenterprojekt.",
    "seo.homeowner.title":
      "Hyr ut till företag – 10 000-30 000 kr/mån | Garanterad hyra | StayOnSite",
    "seo.homeowner.description":
      "Hyr ut din bostad till företagshyresgäster och tjäna 10 000–30 000 kr/mån i garanterad hyra. Inga avdrag, betalning i förskott, 1 månads uppsägningstid. 100+ nöjda husägare.",
    "seo.city.title":
      "Företagsboende i {cityName} | Hyr lägenhet till personal | StayOnSite",
    "seo.city.description":
      "Letar ditt företag efter boende till personal i {cityName}? StayOnSite erbjuder möblerade lägenheter och hus för kort- och långtidshyra. Kontakta oss för en snabb offert.",
    "seo.notFound.title": "404: Sidan hittades inte | StayOnSite",
    "seo.notFound.description":
      "Sidan du letar efter verkar inte finnas. Gå tillbaka till startsidan för att hitta boende för ditt företags personal.",
  },
  en: {
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.references": "References",
    "nav.contact": "Contact",
    "nav.case": "Case",
    "nav.inquiryForm": "Call Us",
    "nav.forCompanies": "For Companies",

    "hero.title":
      "When you have projects in Sweden - we arrange the accommodation",
    "hero.subtitle": "From the first engineer to the last installer",
    "hero.cta": "Send Inquiry",
    "hero.tagline": "Deployment partner in Sweden",
    "hero.bullet1": "Apartments and houses - we meet your needs",
    "hero.bullet2": "Always fully furnished and move-in ready",
    "hero.bullet3": "We help you - phone, SMS or WhatsApp 24/7",
    "hero.ctaPhone": "Call us now",
    "hero.ctaWhatsapp": "Chat on WhatsApp",
    "hero.ctaSubtext": "+46 73 628 77 09 · Phone / SMS / WhatsApp",
    "hero.responseTime": "Replies within 15 minutes on weekdays",
    "hero.metrics.proposal.value": "24 h",
    "hero.metrics.proposal.description": "First housing proposal",
    "hero.metrics.moveIn.value": "48 h",
    "hero.metrics.moveIn.description": "First move-in completed",
    "hero.metrics.deployments.value": "3 sites",
    "hero.metrics.deployments.description": "Per client on average",

    "services.title": "Our Services",
    "services.subtitle":
      "We secure long- and short-stay housing close to your sites anywhere in Sweden.",
    "services.tagline": "Simple and smooth",
    "services.process.title": "How it works",
    "services.process.step1.title": "Send inquiry",
    "services.process.step1.description":
      "Fill out our simple form with details about your needs",
    "services.process.step2.title": "Quick response",
    "services.process.step2.description":
      "We respond via email, SMS, or WhatsApp – usually within 15 minutes, always within 24 hours",
    "services.process.step3.title": "Confirmation",
    "services.process.step3.description":
      "Choose the option that suits you best, and we book it for you",
    "services.process.step4.title": "Move in",
    "services.process.step4.description":
      "Your workers get all the information they need for a smooth move-in",
    "services.security.title": "Security through an experienced partner",
    "services.security.description":
      "No middlemen, no queues. You reach us directly and we respond – usually within 15 minutes, always within 24 hours. 10+ years of construction experience.",
    "services.whyus.title": "Why choose us?",
    "services.whyus.point1": "Quick responses within 24 hours",
    "services.whyus.point2": "Accommodations throughout Sweden",
    "services.whyus.point3": "Smooth process from start to finish",
    "services.whyus.point4": "Over 10 years of experience",
    "services.card1.title": "Planning & proposals",
    "services.card1.highlight": "Response within 15 minutes",
    "services.card1.description":
      "Send inquiry via form, email, or WhatsApp. We map local landlords and return with 2–3 suitable options – usually within 15 minutes, always within 24 hours.",
    "services.card1.bullet1": "Nationwide network of landlords",
    "services.card1.bullet2": "Options with private or shared bedrooms",
    "services.card1.bullet3": "Furnished homes with common areas",
    "services.card1.cta": "Send inquiry →",
    "services.card2.title": "Contracts & move-ins",
    "services.card2.highlight": "Flexible 3–36 month terms",
    "services.card2.description":
      "You choose the accommodation that fits your team. We handle leases, keys, and inventories, and ensure each worker gets practical info before move-in, in Swedish or English.",
    "services.card2.bullet1": "Lease agreements ready for signing",
    "services.card2.bullet2":
      "Furniture, linens, and kitchen equipment included",
    "services.card2.bullet3": "Support via phone or WhatsApp",
    "services.card2.cta": "Call us now →",
    "services.card3.title": "Operations & reporting",
    "services.card3.highlight": "You build – we run the home",
    "services.card3.description":
      "We follow the project until the last person moves out and maintain the accommodation when needed. You get status reports directly and skip the middlemen.",
    "services.card3.bullet1": "Maintenance as needed",
    "services.card3.bullet2": "Direct contact for questions or changes",
    "services.card3.bullet3": "Final cleaning and handover",
    "services.card3.cta": "Ask about operations →",

    "references.title": "References",
    "references.subtitle": "Reviews from some of our customers.",
    "references.tagline": "What our customers say",
    "references.testimonial1.quote":
      "Always pleasant and professional service. Easy and smooth to rent, and the service was really good. Highly recommend StayOnSite.",
    "references.testimonial1.author": "Mats Johansson",
    "references.testimonial1.company": "Logistics",
    "references.testimonial2.quote":
      "Thank you so much Kajsa for your fantastic commitment, much better than what I got from the large established companies!",
    "references.testimonial2.author": "Sara Magnusson",
    "references.testimonial2.company": "Energy",
    "references.testimonial3.quote":
      "Fast service and flexible solutions. Highly recommended!",
    "references.testimonial3.author": "Erik Lindberg",
    "references.testimonial3.company": "Green Steel",

    "inquiry.title": "Send an Inquiry",
    "inquiry.subtitle":
      "Fill out the form below and we will get back to you as soon as possible",
    "inquiry.tagline": "Contact us",
    "inquiry.form.companyName": "Company Name",
    "inquiry.form.contactName": "Contact Person",
    "inquiry.form.email": "Email",
    "inquiry.form.phone": "Phone",
    "inquiry.form.location": "Desired Location",
    "inquiry.form.workers": "Number of Workers",
    "inquiry.form.startDate": "Start Date",
    "inquiry.form.endDate": "End Date",
    "inquiry.form.message": "Message",
    "inquiry.form.submit": "Submit Inquiry",
    "inquiry.form.success":
      "Thank you for your inquiry! We will get back to you as soon as possible.",
    "inquiry.form.error":
      "There was an error submitting the form. Please try again later.",
    "inquiry.form.untilFurtherNotice": "Until further notice",
    "inquiry.contactInfo.title": "Contact Information",
    "inquiry.cta.meeting": "Schedule 15 min",

    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "How we work, how fast we move, and what’s included.",
    "faq.tagline": "FAQ",
    "faq.question1": "How quickly can you arrange accommodation?",
    "faq.answer1": "We usually present options within 24 hours.",
    "faq.question2": "Which cities do you cover?",
    "faq.answer2":
      "We have local landlords throughout Sweden - feel free to ask us about a specific location.",
    "faq.question3": "What does it cost to rent accommodation through you?",
    "faq.answer3":
      "Pricing depends on number of people, location, shared or separate bedrooms, etc. We agree on terms together and you get a clear quote.",
    "faq.question4": "Is the accommodation furnished?",
    "faq.answer4":
      "Yes, it's always fully furnished. If you need anything special, we'll help arrange it.",
    "faq.question5": "Can we make changes to the booking after confirmation?",
    "faq.answer5":
      "Contact us directly and we'll see what we can do. In many cases it can be solved - we're used to changing schedules.",
    "faq.question6": "What does it cost to hire you as accommodation coordinator?",
    "faq.answer6":
      "It costs nothing, you only pay for the accommodations you rent. No other fees apply.",

    "footer.rights": "All rights reserved",
    "footer.contact": "Contact us",
    "footer.description":
      "We help construction companies quickly find accommodations in other locations for their workers.",
    "footer.quickLinks": "Quick Links",
    "footer.location": "Solna, Sweden",
    "footer.care": "With care, Kajsa & Team",

    "floatingPhone.call": "Call us",
    "floatingPhone.tooltip": "Call us directly at +46 73-628 77 09",
    "floatingPhone.whatsapp": "Message on WhatsApp",
    "floatingPhone.whatsappTooltip":
      "Message us on WhatsApp—responses within 15 minutes on weekdays",
    "stickyContact.title": "Need housing?",
    "stickyContact.subtitle":
      "Don't hesitate to reach out – we respond within 15 minutes on weekdays",
    "stickyContact.call": "Call now",

    "why.title": "Why StayOnSite",
    "why.subtitle":
      "A local housing team owns planning, contracts, and operations so you stay on schedule.",
    "why.steps.plan.title": "Planning & proposals",
    "why.steps.plan.description":
      "Send inquiry via form, email, or WhatsApp. We map local landlords and respond with options – usually within 15 minutes, always within 24 hours.",
    "why.steps.plan.cta": "Send inquiry →",
    "why.steps.contracts.title": "Contracts & move-ins",
    "why.steps.contracts.description":
      "Choose the option that fits you. We handle leases, keys, and inspections with transparent 3–36 month terms. Your workers get all info for smooth move-in.",
    "why.steps.contracts.cta": "Call us now →",
    "why.steps.operations.title": "Operations & reporting",
    "why.steps.operations.description":
      "Occupancy, weekly cleaning, and incidents reported directly to project management. You reach us directly – no middlemen, no queues.",
    "why.steps.operations.cta": "Ask about operations →",
    "case.tagline": "Customer Case",
    "case.title":
      "How we helped a Polish company house 45 installers in Säffle",
    "case.subtitle":
      "Solar park on short notice – from inquiry to move-in within 48 hours.",
    "case.timeline.proposal.title": "24 h · Proposal",
    "case.timeline.proposal.description":
      "Three options sent day one thanks to existing landlords.",
    "case.timeline.moveIn.title": "48 h · Move-in",
    "case.timeline.moveIn.description":
      "Crew arrived to ready keys, weekly cleaning, and on-call support.",
    "case.timeline.expand.title": "3 sites · Next",
    "case.timeline.expand.description":
      "Same customer now runs three Swedish deployments with us.",
    "case.metrics.proposal.value": "45 people",
    "case.metrics.proposal.description": "Total capacity",
    "case.metrics.moveIn.value": "3 locations",
    "case.metrics.moveIn.description": "Concurrent projects",
    "case.metrics.deployments.value": "18 months",
    "case.metrics.deployments.description": "Ongoing partnership",
    "case.cta.question": "Need accommodation in another location?",
    "case.cta.button": "Send an SMS",
    "case.cta.description": "We help you every step of the way. Contact us directly for a personal response!",
    "case.cta.callDirect": "Call directly: 076-249 84 86",
    "case.cta.responseTime": "Response within 15 minutes",

    "references.stats.happyClients": "Happy clients",
    "references.stats.accommodations": "Accommodations arranged",
    "references.stats.responseTime": "Average response time",
    "references.stats.cities": "Cities in Sweden",

    "nav.homeowner": "For Homeowners",

    "homeowner.hero.title": "Earn 10,000–30,000 SEK/month from your property",
    "homeowner.hero.subtitle":
      "We rent your property at a fixed monthly rate – you get paid without deductions, we handle the rest.",
    "homeowner.hero.pill": "PASSIVE INCOME WITHOUT HASSLE",
    "homeowner.hero.incomeRange": "10,000 – 30,000 SEK/month",
    "homeowner.hero.incomeDescription": "Fixed guaranteed rent – no deductions",
    "homeowner.hero.cta": "Get a free income estimate",
    "homeowner.hero.trustBadge": "Fixed rent, no deductions · Upfront payment · We handle everything",
    "homeowner.hero.stats.homeowners": "100+",
    "homeowner.hero.stats.homeownersLabel": "satisfied homeowners",
    "homeowner.hero.stats.fee": "No deductions",
    "homeowner.hero.stats.feeLabel": "from your rent",
    "homeowner.hero.stats.guarantee": "From 3 mo",
    "homeowner.hero.stats.guaranteeLabel": "guarantee period",
    "homeowner.hero.estimatedIncome": "Estimated income",
    "homeowner.benefits.sectionLabel": "Benefits",
    "homeowner.faq.sectionLabel": "FAQ",
    "homeowner.testimonials.sectionLabel": "Reviews",
    "homeowner.form.sectionLabel": "Expression of interest",

    "homeowner.benefits.title": "Why homeowners choose StayOnSite",
    "homeowner.benefits.subtitle":
      "We rent your property and take all the risk – you get a secure, fixed income every month",
    "homeowner.benefits.income.title": "Guaranteed rent every month",
    "homeowner.benefits.income.description":
      "10,000–30,000 SEK/month in passive income from stable companies. Always paid upfront, with 1 month notice period.",
    "homeowner.benefits.security.title": "Total security for your property",
    "homeowner.benefits.security.description":
      "Only verified corporate tenants, typically aged 30–50, from established companies. Inspection and damage protection included.",
    "homeowner.benefits.hassle.title": "We handle everything",
    "homeowner.benefits.hassle.description":
      "Contracts, keys, communication, cleaning and payments – you don't need to lift a finger.",
    "homeowner.benefits.flexibility.title": "You decide – completely",
    "homeowner.benefits.flexibility.description":
      "From 3-month contracts, 1 month notice period. No long commitments – you decide.",
    "homeowner.benefits.guarantee.title": "No deductions from your rent",
    "homeowner.benefits.guarantee.description":
      "Other platforms take 5–15% of your rent. We rent directly from you at a fixed price – you keep your full agreed rent.",

    "homeowner.guarantee.title": "Our promise to you",
    "homeowner.guarantee.subtitle": "We take the risk – you get the security",
    "homeowner.guarantee.payment.title": "Payment guarantee",
    "homeowner.guarantee.payment.description": "We rent your property at a fixed monthly rate, from 3 months and up. You always get paid upfront. Notice period: just 1 month.",
    "homeowner.guarantee.protection.title": "Full damage protection",
    "homeowner.guarantee.protection.description": "Thorough inspection with photo documentation at move-in and move-out. Insurance included. We handle all damage claims.",
    "homeowner.guarantee.support.title": "Personal support around the clock",
    "homeowner.guarantee.support.description": "Kajsa calls you within 24 hours of registration. After that, you always have a direct line to the team – no queues, no middlemen.",
    "homeowner.guarantee.badge": "100+ satisfied homeowners",
    "homeowner.guarantee.badgeDescription": "We have helped hundreds of homeowners earn passive income with security – without a single dispute.",

    "homeowner.process.title": "How it works",
    "homeowner.process.subtitle":
      "From registration to first payment – we guide you all the way",
    "homeowner.process.step1.title": "Register your property",
    "homeowner.process.step1.description":
      "Fill out our simple form – it takes just 2 minutes. No obligation.",
    "homeowner.process.step2.title": "Kajsa calls you",
    "homeowner.process.step2.description":
      "Within 24 hours you get a personal call to discuss your property and receive a free income estimate.",
    "homeowner.process.step3.title": "Inspection & contract",
    "homeowner.process.step3.description":
      "We come to you for a free inspection with photo documentation. Contracts from 3 months, 1 month notice period.",
    "homeowner.process.step4.title": "Matching with a company",
    "homeowner.process.step4.description":
      "We match your property with verified corporate tenants, typically aged 30–50, from established companies.",
    "homeowner.process.step5.title": "You get paid every month",
    "homeowner.process.step5.description": "Fixed rent directly to your account, always upfront. No deductions, no hidden fees – we handle the rest.",
    "homeowner.process.step1.time": "2 min",
    "homeowner.process.step2.time": "Within 24h",
    "homeowner.process.step3.time": "We come to you",
    "homeowner.process.step4.time": "",
    "homeowner.process.step5.time": "Every month",
    "homeowner.process.businessModel": "We rent from you → We rent to companies → You get fixed rent with no deductions",

    "homeowner.comparison.title": "StayOnSite vs other options",
    "homeowner.comparison.subtitle": "See why homeowners choose us over renting out themselves or through other platforms",
    "homeowner.comparison.note": "We rent your property directly from you at a fixed price – no deductions. Other platforms take 5–15% of the rent. You keep your full agreed rent with StayOnSite.",

    "homeowner.testimonials.title": "What our homeowners say",
    "homeowner.testimonials.subtitle":
      "Homeowners earning passive income with security through StayOnSite",
    "homeowner.testimonials.testimonial1.quote":
      "We rented out our townhouse to an engineer via StayOnSite. Professional, clean, never any problems. Now we have the same setup with a new tenant – it just works.",
    "homeowner.testimonials.testimonial1.author": "Anna E.",
    "homeowner.testimonials.testimonial1.location": "Älvsjö, Stockholm",
    "homeowner.testimonials.testimonial1.income": "+13,000 SEK/mo · 18 months",
    "homeowner.testimonials.testimonial2.quote":
      "Kajsa handled everything from inspection to contract. The tenants work on an 8-month project. We haven't had to think about anything – the rent just comes in every month.",
    "homeowner.testimonials.testimonial2.author": "Lars A.",
    "homeowner.testimonials.testimonial2.location": "Eriksberg, Gothenburg",
    "homeowner.testimonials.testimonial2.income": "+11,000 SEK/mo · 12 months",
    "homeowner.testimonials.testimonial3.quote":
      "At first I was skeptical about renting out our apartment. But corporate tenants are completely different. Older, responsible, here for work. Never a problem in 14 months.",
    "homeowner.testimonials.testimonial3.author": "Maria J.",
    "homeowner.testimonials.testimonial3.location": "Limhamn, Malmö",
    "homeowner.testimonials.testimonial3.income": "+17,000 SEK/mo · 14 months",
    "homeowner.testimonials.trustIndicator":
      "100+ satisfied homeowners trust StayOnSite",
    "homeowner.testimonials.trustDescription":
      "Join our network of homeowners earning secure rental income every month – worry-free",

    "homeowner.about.title": "Meet the team behind StayOnSite",
    "homeowner.about.subtitle": "Personal service – not an anonymous platform",
    "homeowner.about.message": "We know renting out your home is a big deal. That's why we're always personally involved – from the first call to the last day. You always talk to people who actually make the decisions. No middlemen, no queues.",
    "homeowner.about.kajsa": "Kajsa – Founder & CEO",
    "homeowner.about.team": "Kajsa & Team",
    "homeowner.about.nathalie": "The Team – Dedicated support",
    "homeowner.about.cta": "Call us directly",

    "homeowner.faq.title": "Common questions from homeowners",
    "homeowner.faq.subtitle":
      "Everything you need to know about renting out safely with StayOnSite",
    "homeowner.faq.question1": "How do you protect my property from damage?",
    "homeowner.faq.answer1":
      "We do thorough inspections with photo documentation at both move-in and move-out. All corporate tenants have home insurance. If damage occurs, we handle the entire process – you don't need to do anything.",
    "homeowner.faq.question2": "How much can I earn?",
    "homeowner.faq.answer2":
      "Typically between 10,000 and 30,000 SEK per month depending on location, size and condition. Companies often pay 20–30% more than private tenants. We provide a free income estimate.",
    "homeowner.faq.question3": "Why are corporate tenants better than private ones?",
    "homeowner.faq.answer3":
      "Corporate tenants are here for work, not for parties. They are typically 30–50 years old, responsible and professional. The company pays the rent – zero risk of missed payments. Shorter rental periods also mean you always stay in control.",
    "homeowner.faq.question4": "What happens between rentals?",
    "homeowner.faq.answer4":
      "You get full access to your property back. We actively work to find the next corporate tenant as quickly as possible to minimize vacancy periods.",
    "homeowner.faq.question5":
      "Do I need to do anything special with the property?",
    "homeowner.faq.answer5":
      "The property needs to be furnished, clean and in working condition. We're happy to advise on what's needed to maximize your income.",
    "homeowner.faq.question6": "How does payment work?",
    "homeowner.faq.answer6":
      "We rent your property at a fixed monthly rate paid upfront, directly to your bank account. No deductions, no hidden fees – you know exactly what you get every month.",
    "homeowner.faq.contactPrompt": "Have more questions? Call us directly!",

    "homeowner.form.title": "How much can you earn?",
    "homeowner.form.subtitle":
      "Leave your number and Kajsa will call you within 24 hours with a free estimate",
    "homeowner.form.promise": "No obligation whatsoever",
    "homeowner.form.promiseDescription":
      "We'll tell you exactly what you can earn from your property. You decide if you want to proceed – no pressure, no commitments.",
    "homeowner.form.fieldsTitle": "Your contact information",
    "homeowner.form.fieldsSubtitle":
      "We only need basic information to get started",
    "homeowner.form.firstName": "First name",
    "homeowner.form.firstNamePlaceholder": "Enter your first name",
    "homeowner.form.lastName": "Last name",
    "homeowner.form.lastNamePlaceholder": "Enter your last name",
    "homeowner.form.email": "Email",
    "homeowner.form.emailPlaceholder": "your@email.com",
    "homeowner.form.phone": "Phone number",
    "homeowner.form.phonePlaceholder": "070-123 45 67",
    "homeowner.form.address": "Address",
    "homeowner.form.addressPlaceholder": "Street address and number",
    "homeowner.form.city": "City",
    "homeowner.form.cityPlaceholder": "Enter city",
    "homeowner.form.submit":
      "Get free income estimate – 2 minutes, no obligation",
    "homeowner.form.submitLine1": "Send inquiry",
    "homeowner.form.submitLine2": "Secure your passive income today",
    "homeowner.form.submitting": "Registering...",
    "homeowner.form.success":
      "Thank you for your registration! We will contact you within 24 hours.",
    "homeowner.form.error":
      "An error occurred. Please try again or call us directly.",
    "homeowner.form.disclaimer": "or call us directly",

    "seo.home.title":
      "Staff Housing & Corporate Apartments in Sweden | StayOnSite",
    "seo.home.description":
      "We quickly and efficiently arrange housing for companies and their staff throughout Sweden. Long-term and flexible rental solutions for construction, energy, and data center projects.",
    "seo.homeowner.title":
      "Rent to companies – 10,000-30,000 SEK/mo | Guaranteed rent | StayOnSite",
    "seo.homeowner.description":
      "Rent out your property to corporate tenants and earn 10,000–30,000 SEK/month in guaranteed rent. No deductions, upfront payment, 1 month notice period. 100+ satisfied homeowners.",
    "seo.city.title":
      "Corporate Housing in {cityName} | Rent Apartments for Staff | StayOnSite",
    "seo.city.description":
      "Is your company looking for staff housing in {cityName}? StayOnSite offers furnished apartments and houses for short and long-term rent. Contact us for a quick quote.",
    "seo.notFound.title": "404: Page Not Found | StayOnSite",
    "seo.notFound.description":
      "The page you are looking for does not seem to exist. Go back to the homepage to find housing for your company's staff.",
  },
  pl: {
    "nav.home": "Strona główna",
    "nav.services": "Usługi",
    "nav.references": "Referencje",
    "nav.contact": "Kontakt",
    "nav.case": "Studium przypadku",
    "nav.inquiryForm": "Zapytanie",
    "nav.forCompanies": "Dla firm",

    "hero.title":
      "Kiedy macie projekty w Szwecji - my organizujemy zakwaterowanie",
    "hero.subtitle": "Od pierwszego inżyniera po ostatniego montera",
    "hero.cta": "Wyślij zapytanie",
    "hero.tagline": "Partner ds. wdrożeń w Szwecji",
    "hero.bullet1": "Mieszkania i domy - spełniamy Wasze potrzeby",
    "hero.bullet2": "Zawsze w pełni umeblowane i gotowe do zamieszkania",
    "hero.bullet3": "Pomagamy Ci - telefon, SMS lub WhatsApp 24/7",
    "hero.ctaPhone": "Zadzwoń teraz",
    "hero.ctaWhatsapp": "Napisz na WhatsApp",
    "hero.ctaSubtext": "+46 73 628 77 09 · Telefon / SMS / WhatsApp",
    "hero.responseTime": "Odpowiedź w 15 minut w dni robocze",
    "hero.metrics.proposal.value": "24 h",
    "hero.metrics.proposal.description": "Pierwsza propozycja zakwaterowania",
    "hero.metrics.moveIn.value": "48 h",
    "hero.metrics.moveIn.description": "Pierwsza wprowadzka zakończona",
    "hero.metrics.deployments.value": "3 lokalizacje",
    "hero.metrics.deployments.description": "Średnio na klienta",

    "services.title": "Nasze usługi",
    "services.subtitle":
      "Zapewniamy lokum blisko inwestycji – od krótkich pobytów po wielomiesięczne najmy w całej Szwecji.",
    "services.tagline": "Prosto i sprawnie",
    "services.process.title": "Jak to działa",
    "services.process.step1.title": "Wyślij zapytanie",
    "services.process.step1.description":
      "Wypełnij nasz prosty formularz, podając szczegóły dotyczące Twoich potrzeb.",
    "services.process.step2.title": "Szybka odpowiedź",
    "services.process.step2.description":
      "Odpowiadamy przez e-mail, SMS lub WhatsApp – zwykle w 15 minut, zawsze w ciągu doby",
    "services.process.step3.title": "Potwierdzenie",
    "services.process.step3.description":
      "Wybierz najlepszą dla siebie opcję, a my dokonamy rezerwacji.",
    "services.process.step4.title": "Wprowadzka",
    "services.process.step4.description":
      "Twoi pracownicy otrzymują wszystkie informacje potrzebne do sprawnej wprowadzki.",
    "services.security.title":
      "Bezpieczeństwo dzięki doświadczonemu partnerowi",
    "services.security.description":
      "Bez pośredników, bez kolejek. Kontaktujecie się bezpośrednio z nami i odpowiadamy – zwykle w 15 minut, zawsze w ciągu doby. Ponad 10 lat doświadczenia w branży budowlanej.",
    "services.whyus.title": "Dlaczego my?",
    "services.whyus.point1": "Szybkie odpowiedzi w ciągu 24 godzin",
    "services.whyus.point2": "Zakwaterowanie w całej Szwecji",
    "services.whyus.point3": "Sprawny proces od początku do końca",
    "services.whyus.point4": "Ponad 10 lat doświadczenia",
    "services.card1.title": "Planowanie i propozycje",
    "services.card1.highlight": "Odpowiedź w 15 minut",
    "services.card1.description":
      "Wyślij zapytanie przez formularz, e-mail lub WhatsApp. Mapujemy lokalnych gospodarzy i wracamy z 2–3 odpowiednimi opcjami – zwykle w 15 minut, zawsze w ciągu doby.",
    "services.card1.bullet1": "Ogólnopolska sieć gospodarzy",
    "services.card1.bullet2": "Opcje z własnymi lub wspólnymi sypialniami",
    "services.card1.bullet3": "Umeblowane domy z miejscami wspólnymi",
    "services.card1.cta": "Wyślij zapytanie →",
    "services.card2.title": "Umowa i wprowadzka",
    "services.card2.highlight": "Elastyczne warunki 3–36 miesięcy",
    "services.card2.description":
      "Wybieracie zakwaterowanie, które pasuje do zespołu. Obsługujemy umowy najmu, klucze i inwentaryzacje, zapewniając każdemu pracownikowi praktyczne informacje przed wprowadzką, po szwedzku lub angielsku.",
    "services.card2.bullet1": "Umowy najmu gotowe do podpisania",
    "services.card2.bullet2": "Meble, pościel i wyposażenie kuchenne w cenie",
    "services.card2.bullet3": "Wsparcie przez telefon lub WhatsApp",
    "services.card2.cta": "Zadzwoń teraz →",
    "services.card3.title": "Eksploatacja i raportowanie",
    "services.card3.highlight": "Ty budujesz – my prowadzimy dom",
    "services.card3.description":
      "Śledzimy projekt, aż ostatnia osoba się wyprowadzi i utrzymujemy zakwaterowanie w razie potrzeby. Otrzymujesz raporty statusu bezpośrednio i unikasz pośredników.",
    "services.card3.bullet1": "Konserwacja w razie potrzeby",
    "services.card3.bullet2": "Bezpośredni kontakt przy pytaniach lub zmianach",
    "services.card3.bullet3": "Sprzątanie końcowe i przekazanie",
    "services.card3.cta": "Zapytaj o eksploatację →",

    "references.title": "Referencje",
    "references.subtitle": "Opinie od niektórych naszych klientów.",
    "references.tagline": "Co mówią nasi klienci",
    "references.testimonial1.quote":
      "Zawsze miła i profesjonalna obsługa. Łatwe i sprawne wynajmowanie, a usługa była naprawdę dobra. Gorąco polecam StayOnSite.",
    "references.testimonial1.author": "Mats Johansson",
    "references.testimonial1.company": "Logistyka",
    "references.testimonial2.quote":
      "Wielkie dzięki Kajsa za Twoje fantastyczne zaangażowanie, znacznie lepsze niż to, co otrzymałem od dużych uznanych firm!",
    "references.testimonial2.author": "Sara Magnusson",
    "references.testimonial2.company": "Energia",
    "references.testimonial3.quote":
      "Szybka obsługa i elastyczne rozwiązania. Gorąco polecam!",
    "references.testimonial3.author": "Erik Lindberg",
    "references.testimonial3.company": "Zielona Stal",

    "inquiry.title": "Wyślij zapytanie",
    "inquiry.subtitle":
      "Wypełnij poniższy formularz, a skontaktujemy się z Tobą tak szybko, jak to możliwe.",
    "inquiry.tagline": "Skontaktuj się z nami",
    "inquiry.form.companyName": "Nazwa firmy",
    "inquiry.form.contactName": "Osoba kontaktowa",
    "inquiry.form.email": "E-mail",
    "inquiry.form.phone": "Telefon",
    "inquiry.form.location": "Preferowana lokalizacja",
    "inquiry.form.workers": "Liczba pracowników",
    "inquiry.form.startDate": "Data rozpoczęcia",
    "inquiry.form.endDate": "Data zakończenia",
    "inquiry.form.message": "Wiadomość",
    "inquiry.form.submit": "Wyślij zapytanie",
    "inquiry.form.success":
      "Dziękujemy za zapytanie! Skontaktujemy się z Tobą tak szybko, jak to możliwe.",
    "inquiry.form.error":
      "Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie później.",
    "inquiry.form.untilFurtherNotice": "Do odwołania",
    "inquiry.contactInfo.title": "Informacje kontaktowe",
    "inquiry.cta.meeting": "Umów 15 min",

    "faq.title": "Najczęściej zadawane pytania",
    "faq.subtitle": "Jak działamy, jak szybko reagujemy i co obejmuje usługa.",
    "faq.tagline": "FAQ",
    "faq.question1": "Jak szybko możecie zorganizować zakwaterowanie?",
    "faq.answer1": "Zazwyczaj prezentujemy opcje w ciągu 24 godzin.",
    "faq.question2": "W jakich miastach działacie?",
    "faq.answer2":
      "Mamy lokalnych właścicieli w całej Szwecji - pytaj nas o konkretną lokalizację.",
    "faq.question3":
      "Ile kosztuje wynajem zakwaterowania za Waszym pośrednictwem?",
    "faq.answer3":
      "Cena zależy od liczby osób, lokalizacji, wspólnych lub oddzielnych sypialni itp. Uzgadniamy warunki wspólnie i otrzymujecie jasną ofertę.",
    "faq.question4": "Czy zakwaterowanie jest umeblowane?",
    "faq.answer4":
      "Tak, zawsze jest w pełni umeblowane. Jeśli potrzebujecie czegoś specjalnego, pomożemy to załatwić.",
    "faq.question5":
      "Czy możemy wprowadzać zmiany w rezerwacji po jej potwierdzeniu?",
    "faq.answer5":
      "Skontaktuj się z nami bezpośrednio, a zobaczymy, co możemy zrobić. W wielu przypadkach da się rozwiązać - jesteśmy przyzwyczajeni do zmiennych harmonogramów.",
    "faq.question6": "Ile kosztuje zatrudnienie Was jako koordynatora zakwaterowania?",
    "faq.answer6":
      "Nic nie kosztuje, płacicie tylko za wynajmowane zakwaterowanie. Nie ma żadnych innych opłat.",

    "footer.rights": "Wszelkie prawa zastrzeżone",
    "footer.contact": "Skontaktuj się z nami",
    "footer.description":
      "Pomagamy firmom budowlanym szybko znaleźć zakwaterowanie w innych miejscowościach dla ich pracowników.",
    "footer.quickLinks": "Szybkie linki",
    "footer.location": "Solna, Szwecja",
    "footer.care": "Z troską, Kajsa i Zespół",

    "floatingPhone.call": "Zadzwoń do nas",
    "floatingPhone.tooltip":
      "Zadzwoń do nas bezpośrednio pod numer +46 73-628 77 09",
    "floatingPhone.whatsapp": "Napisz na WhatsApp",
    "floatingPhone.whatsappTooltip":
      "Napisz do nas na WhatsApp – odpowiadamy w 15 minut w dni robocze",
    "stickyContact.title": "Potrzebujesz zakwaterowania?",
    "stickyContact.subtitle":
      "Nie wahaj się z nami skontaktować – odpowiadamy w 15 minut w dni robocze",
    "stickyContact.call": "Zadzwoń teraz",

    "why.title": "Dlaczego StayOnSite",
    "why.subtitle":
      "Lokalny zespół przejmuje planowanie, umowy i eksploatację, żebyście mogli dalej budować.",
    "why.steps.plan.title": "Planowanie i propozycje",
    "why.steps.plan.description":
      "Wyślij zapytanie przez formularz, e-mail lub WhatsApp. Analizujemy lokalnych wynajmujących i odpowiadamy z opcjami – zwykle w 15 minut, zawsze w ciągu doby.",
    "why.steps.plan.cta": "Wyślij zapytanie →",
    "why.steps.contracts.title": "Umowy i wprowadzki",
    "why.steps.contracts.description":
      "Wybierz opcję, która pasuje. Zajmujemy się umowami najmu, kluczami i protokołami z przejrzystymi warunkami na 3–36 miesięcy. Pracownicy dostaną wszystkie informacje do sprawnej wprowadzki.",
    "why.steps.contracts.cta": "Zadzwoń teraz →",
    "why.steps.operations.title": "Bieżąca obsługa i raportowanie",
    "why.steps.operations.description":
      "Obłożenie, cotygodniowe sprzątanie i usterki raportowane bezpośrednio do kierownika projektu. Kontaktujecie się bezpośrednio z nami – bez pośredników, bez kolejek.",
    "why.steps.operations.cta": "Zapytaj o obsługę →",
    "case.tagline": "Studium przypadku",
    "case.title":
      "Jak pomogliśmy polskiej firmie zakwaterować 45 monterów w Säffle",
    "case.subtitle":
      "Farma fotowoltaiczna w krótkim czasie – od zapytania do wprowadzki w 48 godzin.",
    "case.timeline.proposal.title": "24 h · Pierwsza oferta gotowa",
    "case.timeline.proposal.description":
      "Skontaktowaliśmy się z lokalnymi wynajmującymi i w ciągu doby przedstawiliśmy trzy opcje.",
    "case.timeline.moveIn.title": "48 h · Wprowadzka ekipy",
    "case.timeline.moveIn.description":
      "Monterzy otrzymali klucze, harmonogram sprzątania i numer alarmowy jeszcze przed przyjazdem.",
    "case.timeline.expand.title": "3 lokalizacje · Stała współpraca",
    "case.timeline.expand.description":
      "Ten sam klient korzysta dziś z naszego wsparcia przy trzech projektach w całej Szwecji.",
    "case.metrics.proposal.value": "45 osób",
    "case.metrics.proposal.description": "Całkowita pojemność",
    "case.metrics.moveIn.value": "3 lokalizacje",
    "case.metrics.moveIn.description": "Równoczesne projekty",
    "case.metrics.deployments.value": "18 miesięcy",
    "case.metrics.deployments.description": "Trwająca współpraca",
    "case.cta.question": "Potrzebujesz zakwaterowania w innej lokalizacji?",
    "case.cta.button": "Wyślij SMS",
    "case.cta.description": "Pomagamy na każdym kroku. Skontaktuj się z nami bezpośrednio, aby uzyskać osobistą odpowiedź!",
    "case.cta.callDirect": "Zadzwoń: 076-249 84 86",
    "case.cta.responseTime": "Odpowiedź w ciągu 15 minut",

    "references.stats.happyClients": "Zadowoleni klienci",
    "references.stats.accommodations": "Zapewnione zakwaterowania",
    "references.stats.responseTime": "Średni czas odpowiedzi",
    "references.stats.cities": "Miasta w Szwecji",

    "nav.homeowner": "Dla właścicieli",

    "homeowner.hero.title": "Wynajmij swoją nieruchomość",
    "homeowner.hero.subtitle":
      "Masz domek, mieszkanie lub dom, który stoi pusty?",
    "homeowner.hero.pill": "PASYWNY DOCHÓD BEZ KŁOPOTÓW",
    "homeowner.hero.incomeRange": "10 000 - 30 000 SEK/miesiąc",
    "homeowner.hero.incomeDescription": "Pewny dochód z wynajmu co miesiąc",
    "homeowner.hero.cta": "Zarejestruj swoją nieruchomość już dziś",
    "homeowner.hero.trustBadge": "Stały czynsz bez potrąceń · Płatność z góry · Zajmujemy się wszystkim",
    "homeowner.hero.stats.homeowners": "100+",
    "homeowner.hero.stats.homeownersLabel": "zadowolonych właścicieli",
    "homeowner.hero.stats.fee": "Bez potrąceń",
    "homeowner.hero.stats.feeLabel": "z Twojego czynszu",
    "homeowner.hero.stats.guarantee": "Od 3 mies.",
    "homeowner.hero.stats.guaranteeLabel": "okres gwarancji",
    "homeowner.hero.estimatedIncome": "Szacowany dochód",
    "homeowner.benefits.sectionLabel": "Korzyści",
    "homeowner.faq.sectionLabel": "FAQ",
    "homeowner.testimonials.sectionLabel": "Opinie",
    "homeowner.form.sectionLabel": "Zgłoszenie zainteresowania",

    "homeowner.benefits.title": "Dlaczego warto wynajmować ze StayOnSite?",
    "homeowner.benefits.subtitle":
      "Zyskaj dodatkowy dochód ze swojego domu – bezpiecznie i bez wysiłku.",
    "homeowner.benefits.income.title": "Gwarantowany dochód",
    "homeowner.benefits.income.description":
      "10 000–30 000 SEK/mies. pasywnego dochodu od stabilnych firm. Zawsze z góry, z 1-miesięcznym okresem wypowiedzenia.",
    "homeowner.benefits.security.title": "Bezpieczeństwo i pewność",
    "homeowner.benefits.security.description":
      "Tylko zweryfikowani najemcy firmowi, zazwyczaj w wieku 30–50 lat, z renomowanych firm. Inspekcja i ochrona przed szkodami w cenie.",
    "homeowner.benefits.hassle.title": "Zero zmartwień",
    "homeowner.benefits.hassle.description":
      "Zajmujemy się wszystkim – weryfikacją najemców, umowami, komunikacją i płatnościami.",
    "homeowner.benefits.flexibility.title": "Pełna elastyczność",
    "homeowner.benefits.flexibility.description":
      "Od 3-miesięcznych umów, 1 miesiąc wypowiedzenia. Bez długich zobowiązań – Ty decydujesz.",
    "homeowner.benefits.guarantee.title": "Brak potrąceń z czynszu",
    "homeowner.benefits.guarantee.description":
      "Inne platformy pobierają 5–15% Twojego czynszu. My wynajmujemy bezpośrednio od Ciebie po stałej cenie – zatrzymujesz pełną uzgodnioną kwotę.",

    "homeowner.guarantee.title": "Nasza obietnica",
    "homeowner.guarantee.subtitle": "My ponosimy ryzyko – Ty zyskujesz bezpieczeństwo",
    "homeowner.guarantee.payment.title": "Gwarancja płatności",
    "homeowner.guarantee.payment.description": "Wynajmujemy Twoją nieruchomość po stałym miesięcznym czynszu, od 3 miesięcy wzwyż. Zawsze płacimy z góry. Okres wypowiedzenia: tylko 1 miesiąc.",
    "homeowner.guarantee.protection.title": "Pełna ochrona przed szkodami",
    "homeowner.guarantee.protection.description": "Dokładna inspekcja z dokumentacją fotograficzną przy wprowadzce i wyprowadzce. Ubezpieczenie w cenie.",
    "homeowner.guarantee.support.title": "Osobiste wsparcie całodobowe",
    "homeowner.guarantee.support.description": "Kajsa dzwoni do Ciebie w ciągu 24 godzin od rejestracji. Potem zawsze masz bezpośredni kontakt z zespołem – bez kolejek, bez pośredników.",
    "homeowner.guarantee.badge": "100+ zadowolonych właścicieli",
    "homeowner.guarantee.badgeDescription": "Pomogliśmy setkom właścicieli zarabiać pasywny dochód bezpiecznie.",

    "homeowner.process.title": "Jak to działa",
    "homeowner.process.subtitle":
      "Prosty proces od rejestracji do pierwszego dochodu z wynajmu",
    "homeowner.process.step1.title": "Zarejestruj swoją nieruchomość",
    "homeowner.process.step1.description":
      "Wypełnij nasz prosty formularz – zajmie to tylko 2 minuty. Bez zobowiązań.",
    "homeowner.process.step2.title": "Kajsa do Ciebie dzwoni",
    "homeowner.process.step2.description":
      "W ciągu 24 godzin otrzymasz osobisty telefon, aby omówić Twoją nieruchomość i otrzymać bezpłatną wycenę dochodu.",
    "homeowner.process.step3.title": "Inspekcja i umowa",
    "homeowner.process.step3.description":
      "Przyjedziemy do Ciebie na bezpłatną inspekcję z dokumentacją fotograficzną. Umowy od 3 miesięcy, 1 miesiąc wypowiedzenia.",
    "homeowner.process.step4.title": "Dopasowanie z firmą",
    "homeowner.process.step4.description":
      "Dopasujemy Twoją nieruchomość do zweryfikowanych najemców firmowych, zazwyczaj w wieku 30–50 lat.",
    "homeowner.process.step5.title": "Otrzymujesz płatność co miesiąc",
    "homeowner.process.step5.description": "Stały czynsz bezpośrednio na Twoje konto, zawsze z góry. Bez potrąceń, bez ukrytych opłat.",
    "homeowner.process.step1.time": "2 min",
    "homeowner.process.step2.time": "W ciągu 24h",
    "homeowner.process.step3.time": "Przyjedziemy do Ciebie",
    "homeowner.process.step4.time": "",
    "homeowner.process.step5.time": "Co miesiąc",
    "homeowner.process.businessModel": "Wynajmujemy od Ciebie → Wynajmujemy firmom → Dostajesz stały czynsz bez potrąceń",

    "homeowner.comparison.title": "StayOnSite vs inne opcje",
    "homeowner.comparison.subtitle": "Zobacz dlaczego właściciele wybierają nas",
    "homeowner.comparison.note": "Wynajmujemy Twoją nieruchomość bezpośrednio po stałej cenie – bez potrąceń. Inne platformy pobierają 5–15% czynszu. Zatrzymujesz pełną uzgodnioną kwotę ze StayOnSite.",

    "homeowner.testimonials.title": "Co mówią nasi właściciele",
    "homeowner.testimonials.subtitle":
      "Ponad 200 rodzin już zarabia dodatkowe pieniądze dzięki StayOnSite.",
    "homeowner.testimonials.testimonial1.quote":
      "Idealne rozwiązanie! Zarabiamy 5000 SEK dodatkowo co miesiąc, a najemcy są zawsze uprzejmi i porządni.",
    "homeowner.testimonials.testimonial1.author": "Anna Eriksson",
    "homeowner.testimonials.testimonial1.location": "Sztokholm",
    "homeowner.testimonials.testimonial1.income": "+13 000 SEK/miesiąc",
    "homeowner.testimonials.testimonial2.quote":
      "StayOnSite zajmuje się wszystkim za nas. Nie musimy nawet spotykać się z najemcami, jeśli nie chcemy.",
    "homeowner.testimonials.testimonial2.author": "Lars Andersson",
    "homeowner.testimonials.testimonial2.location": "Göteborg",
    "homeowner.testimonials.testimonial2.income": "+11 000 SEK/miesiąc",
    "homeowner.testimonials.testimonial3.quote":
      "Wynajmuję od ponad roku. Nigdy żadnych problemów i płatności zawsze na czas.",
    "homeowner.testimonials.testimonial3.author": "Maria Johansson",
    "homeowner.testimonials.testimonial3.location": "Malmö",
    "homeowner.testimonials.testimonial3.income": "+17 000 SEK/miesiąc",
    "homeowner.testimonials.trustIndicator":
      "Ponad 200 rodzin już zarabia dodatkowe pieniądze",
    "homeowner.testimonials.trustDescription":
      "Dołącz do naszej sieci zadowolonych właścicieli, którzy co miesiąc zyskują pewny dochód z wynajmu.",

    "homeowner.about.title": "Poznaj zespół StayOnSite",
    "homeowner.about.subtitle": "Osobista obsługa – nie anonimowa platforma",
    "homeowner.about.message": "Wiemy, że wynajem domu to poważna sprawa. Dlatego zawsze jesteśmy osobiście zaangażowani. Rozmawiasz z ludźmi, którzy podejmują decyzje.",
    "homeowner.about.kajsa": "Kajsa – Założycielka i CEO",
    "homeowner.about.team": "Kajsa i Zespół",
    "homeowner.about.nathalie": "Zespół – Dedykowane wsparcie",
    "homeowner.about.cta": "Zadzwoń bezpośrednio",

    "homeowner.faq.title": "Najczęściej zadawane pytania dla właścicieli",
    "homeowner.faq.subtitle":
      "Znajdź odpowiedzi na najczęstsze pytania dotyczące wynajmu Twojej nieruchomości.",
    "homeowner.faq.question1": "Co się stanie, jeśli coś się zepsuje?",
    "homeowner.faq.answer1":
      "Posiadamy pełne ubezpieczenie, które pokrywa wszelkie szkody. Dodatkowo dokładnie weryfikujemy wszystkich najemców, aby minimalizować ryzyko.",
    "homeowner.faq.question2": "Ile mogę zarobić?",
    "homeowner.faq.answer2":
      "W zależności od lokalizacji i rodzaju nieruchomości, nasi właściciele zarabiają od 10 000 do 30 000 SEK miesięcznie. Zapewniamy bezpłatną wycenę dochodu.",
    "homeowner.faq.question3": "Dlaczego najemcy firmowi są lepsi od prywatnych?",
    "homeowner.faq.answer3":
      "Najemcy firmowi są tu do pracy, nie na imprezy. Są odpowiedzialni i profesjonalni. Firma płaci czynsz – zero ryzyka braku płatności.",
    "homeowner.faq.question4": "Co dzieje się między okresami wynajmu?",
    "homeowner.faq.answer4":
      "Odzyskujesz pełny dostęp do swojej nieruchomości. Pomagamy również jak najszybciej znaleźć nowych najemców.",
    "homeowner.faq.question5":
      "Czy muszę jakoś specjalnie przygotować nieruchomość?",
    "homeowner.faq.answer5":
      "Nie, akceptujemy nieruchomości w obecnym stanie. Możemy jednak udzielić wskazówek dotyczących drobnych ulepszeń, które mogą zwiększyć dochód z najmu.",
    "homeowner.faq.question6": "Jak otrzymam zapłatę?",
    "homeowner.faq.answer6":
      "Czynsz jest wypłacany bezpośrednio na Twoje konto bankowe pierwszego dnia każdego miesiąca. Zajmujemy się całą fakturacją i administracją.",
    "homeowner.faq.contactPrompt":
      "Masz więcej pytań? Zadzwoń do nas bezpośrednio!",

    "homeowner.form.title": "Ile możesz zarobić?",
    "homeowner.form.subtitle":
      "Zostaw numer – Kajsa oddzwoni w ciągu 24 godzin z bezpłatną wyceną",
    "homeowner.form.promise": "Całkowicie bez zobowiązań",
    "homeowner.form.promiseDescription":
      "Powiemy Ci dokładnie, ile możesz zarobić na swojej nieruchomości. Ty decydujesz, czy chcesz kontynuować – bez presji, bez zobowiązań.",
    "homeowner.form.fieldsTitle": "Twoje dane kontaktowe",
    "homeowner.form.fieldsSubtitle":
      "Potrzebujemy tylko podstawowych informacji, aby zacząć.",
    "homeowner.form.firstName": "Imię",
    "homeowner.form.firstNamePlaceholder": "Wpisz swoje imię",
    "homeowner.form.lastName": "Nazwisko",
    "homeowner.form.lastNamePlaceholder": "Wpisz swoje nazwisko",
    "homeowner.form.email": "E-mail",
    "homeowner.form.emailPlaceholder": "twoj@email.pl",
    "homeowner.form.phone": "Numer telefonu",
    "homeowner.form.phonePlaceholder": "070-123 45 67",
    "homeowner.form.address": "Adres",
    "homeowner.form.addressPlaceholder": "Ulica i numer",
    "homeowner.form.city": "Miasto",
    "homeowner.form.cityPlaceholder": "Wpisz miasto",
    "homeowner.form.submit":
      "To zajmie tylko dwie minuty - pomożemy Ci znaleźć odpowiedniego najemcę",
    "homeowner.form.submitLine1": "To zajmie tylko dwie minuty",
    "homeowner.form.submitLine2": "Pomożemy Ci znaleźć odpowiedniego najemcę",
    "homeowner.form.submitting": "Rejestrowanie...",
    "homeowner.form.success":
      "Dziękujemy za rejestrację! Skontaktujemy się z Tobą w ciągu 24 godzin.",
    "homeowner.form.error":
      "Wystąpił błąd. Spróbuj ponownie lub zadzwoń do nas bezpośrednio.",
    "homeowner.form.disclaimer": "lub zadzwoń bezpośrednio",

    "seo.home.title":
      "Zakwaterowanie dla personelu i mieszkania służbowe w Szwecji | StayOnSite",
    "seo.home.description":
      "Szybko i sprawnie organizujemy zakwaterowanie dla firm i ich personelu w całej Szwecji. Długoterminowe i elastyczne rozwiązania wynajmu dla projektów budowlanych, energetycznych i centrów danych.",
    "seo.homeowner.title":
      "Wynajmij swoją nieruchomość firmom | Gwarantowany czynsz | StayOnSite",
    "seo.homeowner.description":
      "Wynajmij nieruchomość najemcom firmowym i zarabiaj 10 000–30 000 SEK/mies. gwarantowanego czynszu. Bez potrąceń, płatność z góry, 1 miesiąc wypowiedzenia. 100+ zadowolonych właścicieli.",
    "seo.city.title":
      "Mieszkania służbowe w {cityName} | Wynajem dla personelu | StayOnSite",
    "seo.city.description":
      "Twoja firma szuka zakwaterowania dla personelu w {cityName}? StayOnSite oferuje umeblowane mieszkania i domy na wynajem krótko- i długoterminowy. Skontaktuj się z nami, aby otrzymać szybką ofertę.",
    "seo.notFound.title": "404: Strona nie została znaleziona | StayOnSite",
    "seo.notFound.description":
      "Strona, której szukasz, nie istnieje. Wróć na stronę główną, aby znaleźć zakwaterowanie dla personelu Twojej firmy.",
  },
};
