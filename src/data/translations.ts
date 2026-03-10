export type AvailableLanguages = "sv" | "en" | "pl";

export type TranslationKey =
  | "nav.home"
  | "nav.services"
  | "nav.references"
  | "nav.contact"
  | "nav.case"
  | "nav.inquiryForm"
  | "nav.homeowner"
  | "nav.about"
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
  | "references.testimonial2.quote"
  | "references.testimonial2.author"
  | "references.testimonial3.quote"
  | "references.testimonial3.author"
  | "references.testimonial4.quote"
  | "references.testimonial4.author"
  | "references.testimonial5.quote"
  | "references.testimonial5.author"
  | "references.testimonial6.quote"
  | "references.testimonial6.author"
  | "references.testimonial7.quote"
  | "references.testimonial7.author"
  | "references.testimonial8.quote"
  | "references.testimonial8.author"
  | "references.testimonial9.quote"
  | "references.testimonial9.author"
  | "heroForm.city"
  | "heroForm.cityPlaceholder"
  | "heroForm.people"
  | "heroForm.peoplePlaceholder"
  | "heroForm.contact"
  | "heroForm.contactPlaceholder"
  | "heroForm.submit"
  | "heroForm.success"
  | "heroForm.contactError"
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
  | "faq.question7"
  | "faq.answer7"
  | "faq.question8"
  | "faq.answer8"
  | "faq.question9"
  | "faq.answer9"
  | "faq.question10"
  | "faq.answer10"
  | "faq.question11"
  | "faq.answer11"
  | "faq.question12"
  | "faq.answer12"
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
  | "homeowner.faq.question7"
  | "homeowner.faq.answer7"
  | "homeowner.faq.question8"
  | "homeowner.faq.answer8"
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
  | "seo.notFound.description"
  | "brand.nollavgift.name"
  | "brand.nollavgift.tagline"
  | "brand.nollavgift.description"
  | "lp.husagare.formTitle"
  | "lp.husagare.formSubtitle"
  | "lp.husagare.submitButton"
  | "lp.husagare.bottomCta.title"
  | "lp.husagare.bottomCta.button"
  | "twotrack.company.tagline"
  | "twotrack.company.title"
  | "twotrack.company.description"
  | "twotrack.company.cta"
  | "twotrack.homeowner.tagline"
  | "twotrack.homeowner.title"
  | "twotrack.homeowner.description"
  | "twotrack.homeowner.cta";

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

    "hero.title": "Personalboende i hela Sverige - vi ordnar boendet för ert projekt",
    "hero.subtitle": "Från första ingenjör till sista montör",
    "hero.cta": "Skicka förfrågan",
    "hero.tagline": "Etableringspartner i Sverige",
    "hero.bullet1": "Lägenheter och villor - vi möter era behov",
    "hero.bullet2": "Alltid fullt möblerat och inflyttningsklart",
    "hero.bullet3": "Vi hjälper dig - telefon, mail eller WhatsApp dygnet runt",
    "hero.ctaPhone": "Ring oss nu",
    "hero.ctaWhatsapp": "Chatta på WhatsApp",
    "hero.ctaSubtext": "+46 73-628 77 09 · Telefon / Mail / WhatsApp",
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
      "Vi svarar via mail eller WhatsApp – oftast inom 15 minuter, alltid inom ett dygn",
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
      "Lätt, smidigt och enkelt. Dom tar hand om allt! Vi kan bara fokusera på vårt arbete.",
    "references.testimonial1.author": "Frans Åberg",
    "references.testimonial2.quote":
      "Bra och snabb service, hittar alltid lösningar. Tack för gott samarbete!",
    "references.testimonial2.author": "Valle Jensen",
    "references.testimonial3.quote":
      "Ett samarbete som bara flyter på. Inga konstigheter, tydlig dialog och hög kvalitet i leveransen. Precis så som man vill att det ska fungera.",
    "references.testimonial3.author": "Per Svensson",
    "references.testimonial4.quote":
      "Alltid lika professionella.",
    "references.testimonial4.author": "Johanna Mårdh",
    "references.testimonial5.quote":
      "Stay On Site levererar med en nivå av kvalitet som märks i varje detalj. De har hjälpt mig med boende i både Stockholm och Mora, med en process som varit genomtänkt, smidig och välorganiserad.",
    "references.testimonial5.author": "Tess Devlésa",
    "references.testimonial6.quote":
      "Snabb respons, tydlig kommunikation och ett professionellt bemötande. Rekommenderas!",
    "references.testimonial6.author": "Philip Af Wetterstedt",
    "references.testimonial7.quote":
      "Kajsa är en pålitlig och affärsmässig kvinna med ett hjärtligt engagemang och en utpräglat god känsla för kvalité. Hennes leverans överträffar din förväntan!",
    "references.testimonial7.author": "Charlotte Nilsson",
    "references.testimonial8.quote":
      "Vi är mycket nöjda med servicen. Snabb respons, bra erbjudande och all kommunikation gick mycket bra, väldigt mycket bra samarbete. Tack Kajsa för all vägledning.",
    "references.testimonial8.author": "Iragi Kulimishi",
    "references.testimonial9.quote":
      "Vi är mycket nöjda med servicen. Snabb respons, bra erbjudande och all kommunikation gick mycket bra. Tack Kajsa för all hjälp.",
    "references.testimonial9.author": "Gintarė Kedienė",

    "heroForm.city": "Ort",
    "heroForm.cityPlaceholder": "T.ex. Boden, Gävle, Luleå",
    "heroForm.people": "Antal personer",
    "heroForm.peoplePlaceholder": "Antal",
    "heroForm.contact": "Telefon eller e-post",
    "heroForm.contactPlaceholder": "073-123 45 67 eller namn@foretag.se",
    "heroForm.submit": "Få boendeförslag",
    "heroForm.success": "Tack! Vi återkommer inom 24 timmar.",
    "heroForm.contactError": "Ange giltigt telefonnummer eller e-post",

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
    "faq.answer1": "Inom 24 timmar. Vi presenterar boendeförslag samma dag som förfrågan kommer in – i akuta fall inom 3 timmar. Enligt Byggföretagen planerar allt fler byggbolag med kort varsel när projektstart skjuts fram, och vår genomsnittliga svarstid ligger under 3 timmar för befintliga kunder.",
    "faq.question2": "Vilka städer täcker ni?",
    "faq.answer2":
      "Över 40 städer i hela Sverige – från Malmö i söder till Luleå i norr. Vi täcker alla de 19 största byggmarknaderna plus specialorter som Boden, Oskarshamn och Säffle där stora energi- och infrastrukturprojekt pågår. Enligt Boverkets byggprognos (december 2025) beräknas 35 000 bostäder påbörjas under 2026, vilket driver behovet av tillfälligt personalboende i hela landet.",
    "faq.question3": "Vad kostar det att hyra boende genom er?",
    "faq.answer3":
      "Ni får en tydlig all-inclusive-offert. Priset beror på antal personer, ort och typ av boende (delat eller enskilt). Allt ingår: hyra, el, internet, städning och sänglinne. Inga dolda avgifter. Våra kunder sparar i snitt 20–30 % jämfört med hotellboende för samma period.",
    "faq.question4": "Är boendet möblerat?",
    "faq.answer4":
      "Ja, alltid fullt möblerat och inflyttningsklart. Varje boende har säng, kök, badrum, tvättmaskin, Wi-Fi och arbetsyta. Vi har möblerat över 500 boenden sedan 2013 och anpassar vid behov – exempelvis extra sängar, kontorsstolar eller parkeringsplatser för servicefordon.",
    "faq.question5": "Kan vi göra ändringar i bokningen efter bekräftelse?",
    "faq.answer5":
      "Ja, vi är vana vid ändrade tidsplaner. Byggsektorn är flexibel till sin natur – Byggföretagens konjunkturrapport visar att 4 av 5 projekt ändrar bemanning under projektets gång. Vi hanterar tillägg, minskningar och omdisponeringar löpande utan extra avgifter.",
    "faq.question6": "Vad kostar det att anlita er som boende koordinator?",
    "faq.answer6":
      "Noll kronor. Vi tar inte ut några avgifter, provisioner eller uppläggskostnader. Ni betalar enbart för de boenden ni faktiskt hyr. Vår intäkt kommer från hyresskillnaden – vilket innebär att vi har direkt incitament att hitta rätt boende till rätt pris.",
    "faq.question7": "Hur ser bostadsmarknaden ut för personalboende 2026?",
    "faq.answer7": "Efterfrågan på personalboende ökar kraftigt. Enligt Boverkets senaste prognos (december 2025) uppgår bostadsbristen till 52 300 bostäder per år, medan bara 35 000 beräknas påbörjas 2026. Samtidigt visar Byggföretagens konjunkturrapport att sysselsättningen i byggsektorn väntas öka till 369 500 personer 2025–2026. Detta skapar ett stort behov av tillfälliga boendelösningar, särskilt i norra Sverige där den gröna omställningen driver tusentals nya arbetstillfällen (Källa: Boverket, 'Indikatorer för bostadsbyggande', dec 2025; Byggföretagen, Konjunkturrapport 2025).",
    "faq.question8": "Vilka branscher behöver personalboende mest?",
    "faq.answer8": "Byggbranschen är den största efterfrågaren, följt av energisektorn. Enligt Byggföretagen ökar energirelaterade investeringar med 18 procent under 2024–2026, drivet av vindkraft, kärnkraft och datacenter. Vi ser också stark efterfrågan från infrastrukturprojekt (vägar, järnvägar, tunnelbyggen) samt industriinstallationer. Norrbotten och Västerbotten har störst tillväxt med projekt som Northvolts batterifabrik, H2 Green Steels stålverk och LKAB:s omställning (Källa: Byggföretagen, Konjunkturrapport 2025).",
    "faq.question9": "Hur skiljer sig personalboende från hotell?",
    "faq.answer9": "Personalboende genom StayOnSite kostar i snitt 40–60 % mindre än hotell för längre vistelser. Ni får fullt möblerade lägenheter med kök, tvättmaskin och internet – vilket ger era medarbetare ett riktigt hem, inte ett hotellrum. Enligt SCB:s hotellprisindex (2025) ligger genomsnittspriset för ett hotellrum i Sverige på 1 200–1 800 kr/natt, medan personalboende kostar från 350 kr/person/natt beroende på stad och längd.",
    "faq.question10": "Vilka lagar gäller för företagsuthyrning av boende?",
    "faq.answer10": "Uthyrning av privatbostad regleras av privatuthyrningslagen. Från juli 2026 reformeras lagen med nya regler som underlättar för mindre fastighetsägare att hyra ut till företag. Schablonavdraget höjs från 40 000 till 50 000 kr per år, och reglerna för blockhyra förenklas. StayOnSite hanterar alla avtal och säkerställer att alla juridiska krav uppfylls (Källa: Regeringens proposition 2025/26:NN; Skatteverket, 'Hyra ut privatbostad', 2025).",
    "faq.question11": "Hur fungerar StayOnSites Nollavgiftsmodell?",
    "faq.answer11": "Vår Nollavgiftsmodell innebär att fastighetsägaren får 100 % av den överenskomna hyran – utan avdrag. Till skillnad från Samtrygg (15 % avgift) och Qasa (4,95 % avgift) tar StayOnSite 0 % från fastighetsägaren. Vi tjänar istället på marginalen mellan den fasta hyran vi betalar och priset vi tar av företagskunden. Resultatet: fastighetsägaren får en garanterad, fast månadsinkomst utan överraskningar.",
    "faq.question12": "Varför välja StayOnSite framför Airbnb för företag?",
    "faq.answer12": "Airbnb är designat för turister, inte för professionella arbetsteam. Med StayOnSite får ni företagsfaktura, samlade avtal för hela teamet, en dedikerad kontaktperson och boenden anpassade för längre vistelser. Vi hanterar allt från kontrakt till felanmälan. Dessutom slipper ni Airbnbs serviceavgift (som kan vara 14–20 %) och risken att bokningar avbokas av värden. StayOnSite levererar trygghet, inte osäkerhet.",

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
    "stickyContact.subtitle": "Hör av dig via telefon eller mail",
    "stickyContact.call": "Ring nu",

    "why.title": "Varför StayOnSite",
    "why.subtitle":
      "500+ ordnade boenden sedan 2013. Vi hjälper ert företag med boenden i hela Sverige – från smarta lägenheter till rymliga villor. Alltid fullt möblerade och inflyttningsklara, med en genomsnittlig kundnöjdhet på 4,9 av 5.",
    "why.steps.plan.title": "Planering & förslag",
    "why.steps.plan.description":
      "Boendeförslag inom 24 timmar – ofta inom 3 timmar. Skicka förfrågan via formulär, mail eller WhatsApp. Vi kartlägger lokala värdar i vårt nätverk av 40+ städer och svarar med färdiga alternativ inklusive adress, planritning och pris.",
    "why.steps.plan.cta": "Skicka förfrågan →",
    "why.steps.contracts.title": "Kontrakt & inflytt",
    "why.steps.contracts.description":
      "Välj alternativ som passar er. Vi hanterar hyresavtal, nycklar och inventeringar med tydliga 3–36 mån villkor. Allt ingår: möbler, el, internet, sänglinne och städning. Era arbetare får komplett inflyttningsinformation på svenska, engelska eller polska.",
    "why.steps.contracts.cta": "Ring oss nu →",
    "why.steps.operations.title": "Drift & rapportering",
    "why.steps.operations.description":
      "En dedikerad kontaktperson genom hela projektet. Beläggning, veckostädning och avvikelser rapporteras direkt till projektledningen. Vi hanterar tillägg och ändringar löpande – 100+ företagskunder har valt oss för just den tryggheten.",
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
    "case.cta.button": "Skicka ett mail",
    "case.cta.description": "Vi hjälper dig hela vägen. Hör av dig till oss direkt för ett personligt svar!",
    "case.cta.callDirect": "Ring direkt: 076-249 84 86",
    "case.cta.responseTime": "Svar inom 15 minuter",


    "references.stats.happyClients": "Nöjda kunder",
    "references.stats.accommodations": "Ordnade boenden",
    "references.stats.responseTime": "Genomsnittlig svarstid",
    "references.stats.cities": "Städer i Sverige",

    "nav.homeowner": "För husägare",
    "nav.about": "Om oss",

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
      "100+ husägare har valt oss. Vi hyr din bostad av dig och tar all risk – du får en trygg, fast inkomst varje månad utan avdrag.",
    "homeowner.benefits.income.title": "Garanterad hyra varje månad",
    "homeowner.benefits.income.description":
      "10 000–30 000 kr/mån i passiv inkomst, direkt från stabila företag. Betalning alltid i förskott. Med Boverkets beräknade bostadsbrist på 52 300 bostäder per år finns det en stark efterfrågan som tryggar din intäkt.",
    "homeowner.benefits.security.title": "Total trygghet för ditt boende",
    "homeowner.benefits.security.description":
      "Endast verifierade företagshyresgäster, vanligtvis 30–50 år, från etablerade bolag. Besiktning med fotodokumentation. Noll tvister på 100+ uthyrningar.",
    "homeowner.benefits.hassle.title": "Vi sköter allt",
    "homeowner.benefits.hassle.description":
      "Kontrakt, nycklar, kommunikation, städning och betalningar – du behöver inte lyfta ett finger. Samma personliga kontaktperson från dag ett.",
    "homeowner.benefits.flexibility.title": "Du bestämmer – helt och hållet",
    "homeowner.benefits.flexibility.description":
      "Från 1 månads avtal, 1 månads uppsägningstid. Inga långa bindningstider. Du kan säga upp med en månads varsel och får tillbaka din bostad i ursprungligt skick.",
    "homeowner.benefits.guarantee.title": "Inga avdrag från din hyra",
    "homeowner.benefits.guarantee.description":
      "Konkurrenter som Samtrygg tar 15 % och Qasa 4,95 % av din hyra. Vi hyr direkt av dig till ett fast pris – du behåller hela den avtalade hyran, varje månad.",

    "homeowner.guarantee.title": "Vårt löfte till dig",
    "homeowner.guarantee.subtitle": "Vi tar risken – du får tryggheten. 100+ husägare har redan valt oss.",
    "homeowner.guarantee.payment.title": "Betalningsgaranti",
    "homeowner.guarantee.payment.description": "Fast månadshyra i förskott till ditt konto, från 1 månad och uppåt. Uppsägningstid bara 1 månad. Till skillnad från andra aktörer tar vi inga avdrag – du får 100 % av den avtalade hyran.",
    "homeowner.guarantee.protection.title": "I trygga händer",
    "homeowner.guarantee.protection.description": "Noggrann besiktning med fotodokumentation vid in- och utflytt. Vi har hanterat 100+ uthyrningar utan en enda tvist med våra husägare.",
    "homeowner.guarantee.support.title": "Personlig support dygnet runt",
    "homeowner.guarantee.support.description": "Kajsa ringer dig inom 24 timmar efter registrering. Därefter har du alltid en direkt linje till teamet – samma person varje gång. Inga telefonköer, inga mellanhänder.",
    "homeowner.guarantee.badge": "100+ nöjda husägare",
    "homeowner.guarantee.badgeDescription": "Vi har hjälpt hundratals husägare att tjäna passiv inkomst med trygghet – utan en enda tvist. 4,9 av 5 i kundbetyg.",

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
      "Vi kommer till dig för en kostnadsfri besiktning med fotodokumentation. Avtal från 1 månad, 1 månads uppsägningstid.",
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
      "Vi hyrde ut vårt radhus till en ingenjör som jobbar på tunnelbaneutbyggnaden i Stockholm. Professionell, städad och aldrig några problem. Nu har vi haft tre olika hyresgäster via StayOnSite och alla har varit lika bra. Det är en helt annan värld jämfört med att hyra ut privat.",
    "homeowner.testimonials.testimonial1.author": "Anna E.",
    "homeowner.testimonials.testimonial1.location": "Älvsjö, Stockholm",
    "homeowner.testimonials.testimonial1.income": "+13 000 kr/mån · 18 månader",
    "homeowner.testimonials.testimonial2.quote":
      "Kajsa skötte allt från besiktning till kontrakt på mindre än en vecka. Hyresgästerna jobbar på ett energiprojekt i 8 månader. Vi har inte behövt tänka på någonting – hyran trillar in den 25:e varje månad, utan avdrag.",
    "homeowner.testimonials.testimonial2.author": "Lars A.",
    "homeowner.testimonials.testimonial2.location": "Eriksberg, Göteborg",
    "homeowner.testimonials.testimonial2.income": "+11 000 kr/mån · 12 månader",
    "homeowner.testimonials.testimonial3.quote":
      "Först var jag skeptisk – hyra ut min lägenhet till främlingar? Men företagshyresgäster är helt annorlunda. 40-åringar som jobbar 10-timmarsskift och vill ha lugn och ro. Jag kollade med Samtrygg och Qasa också, men de tar procent av hyran. Med StayOnSite behåller jag allt.",
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
      "Med besiktning, försäkring och fotodokumentation. Vi genomför noggrann besiktning vid både in- och utflytt, med fotografering av varje rum. Alla företagshyresgäster har hemförsäkring. Vid eventuell skada hanterar vi hela processen – på 100+ uthyrningar har vi haft noll tvister med våra husägare.",
    "homeowner.faq.question2": "Hur mycket kan jag tjäna?",
    "homeowner.faq.answer2":
      "10 000–30 000 kr per månad, beroende på läge, storlek och skick. Företag betalar i snitt 20–30 % mer än privatpersoner. Enligt Boverket finns ett underskott på 52 300 bostäder per år i Sverige, medan bara 35 000 påbörjas – det innebär en stark efterfrågan på tillfälliga boenden som driver upp hyresnivåerna. Vi ger dig en kostnadsfri intäktsbedömning inom 24 timmar.",
    "homeowner.faq.question3": "Varför är företagshyresgäster bättre än privata?",
    "homeowner.faq.answer3":
      "Lägre risk, högre hyra, kortare kontrakt. Företagshyresgäster är vanligtvis 30–50 år och här för arbete, inte för fest. Företaget – inte individen – står för betalningen, vilket ger noll risk för utebliven hyra. Byggföretagen rapporterar att sysselsättningen i byggsektorn stiger med 1 200 personer till 369 500 under 2025–2026, vilket driver en stadig efterfrågan på personalboende i hela Sverige.",
    "homeowner.faq.question4": "Vad händer mellan uthyrningar?",
    "homeowner.faq.answer4":
      "Du får tillbaka full tillgång till din bostad direkt. Vi arbetar aktivt med att hitta nästa företagshyresgäst – vår genomsnittliga tomgångsperiod är under 2 veckor tack vare vårt nätverk av 100+ företagskunder i 40+ städer.",
    "homeowner.faq.question5": "Behöver jag göra något speciellt med bostaden?",
    "homeowner.faq.answer5":
      "Nej, bara grunderna: möblerad, ren och i fungerande skick. Vi ger dig kostnadsfria råd om hur du maximerar din intäkt – exempelvis vilka möbler och utrustning som företagshyresgäster värdesätter mest. Många av våra husägare investerar 5 000–10 000 kr och ökar sin månadshyra med 2 000–5 000 kr.",
    "homeowner.faq.question6": "Hur fungerar betalningen?",
    "homeowner.faq.answer6":
      "Fast hyra, i förskott, direkt till ditt bankkonto. Vi hyr bostaden av dig till ett avtalat månadspris utan avdrag – till skillnad från konkurrenter som tar 5–15 % i provision. Du vet exakt vad du får varje månad, och betalningen kommer alltid i tid.",
    "homeowner.faq.question7": "Vad innebär nya privatuthyrningslagen juli 2026?",
    "homeowner.faq.answer7": "Riksdagen har beslutat om en reform av privatuthyrningslagen som träder i kraft juli 2026. De viktigaste förändringarna: du kan hyra ut upp till 2 bostäder utan att det klassas som näringsverksamhet, schablonavdraget höjs från 40 000 till 50 000 kr per år, och reglerna för blockhyra förenklas. För dig som hyr ut via StayOnSite innebär detta ännu bättre förutsättningar – din garanterade hyra är helt laglig och skatteoptimerad (Källa: SOU 2025:65; Skatteverket, 'Uthyrning av privatbostad', 2025).",
    "homeowner.faq.question8": "Är det verkligen 0 % i avgift?",
    "homeowner.faq.answer8": "Ja, vår Nollavgiftsmodell innebär att du får 100 % av den överenskomna hyran varje månad – utan avdrag. Samtrygg tar 15 % av hyran, Qasa tar 4,95 %. StayOnSite tar 0 %. Vi tjänar istället på prisskillnaden gentemot företagskunden. Du betalar alltså ingenting till oss – vi betalar till dig.",
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

    "brand.nollavgift.name": "Nollavgiftsmodellen",
    "brand.nollavgift.tagline": "0 % avgift. 100 % av hyran till dig.",
    "brand.nollavgift.description": "StayOnSites unika modell där fastighetsägaren får hela hyran utan avdrag – till skillnad från konkurrenter som tar 5–15 % i avgift.",

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
    "lp.husagare.formTitle": "Få en gratis intäktsbedömning",
    "lp.husagare.formSubtitle": "Lämna ditt nummer – Kajsa ringer dig inom 24h",
    "lp.husagare.submitButton": "Skicka – helt gratis & utan förpliktelse",
    "lp.husagare.bottomCta.title": "Redo att börja tjäna på din bostad?",
    "lp.husagare.bottomCta.button": "Registrera din bostad nu",
    "twotrack.company.tagline": "För företag",
    "twotrack.company.title": "Behöver ni personalboende?",
    "twotrack.company.description": "Vi ordnar allt — från avtal till inflyttning. En kontakt, en faktura, fullt möblerat.",
    "twotrack.company.cta": "Se vad vi erbjuder",
    "twotrack.homeowner.tagline": "För husägare",
    "twotrack.homeowner.title": "Hyr ut din bostad till företag",
    "twotrack.homeowner.description": "Garanterad hyra varje månad, inga avdrag, 0 % i avgift.",
    "twotrack.homeowner.cta": "Så fungerar det",
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
      "Worker Accommodation Across Sweden — We Handle the Housing",
    "hero.subtitle": "From the first engineer to the last installer",
    "hero.cta": "Send Inquiry",
    "hero.tagline": "Deployment partner in Sweden",
    "hero.bullet1": "Apartments and houses - we meet your needs",
    "hero.bullet2": "Always fully furnished and move-in ready",
    "hero.bullet3": "We help you - phone, email or WhatsApp 24/7",
    "hero.ctaPhone": "Call us now",
    "hero.ctaWhatsapp": "Chat on WhatsApp",
    "hero.ctaSubtext": "+46 73 628 77 09 · Phone / Email / WhatsApp",
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
      "We respond via email or WhatsApp – usually within 15 minutes, always within 24 hours",
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
      "Easy, smooth and simple. They take care of everything! We can just focus on our work.",
    "references.testimonial1.author": "Frans Åberg",
    "references.testimonial2.quote":
      "Great and fast service, always finds solutions. Thanks for the great collaboration!",
    "references.testimonial2.author": "Valle Jensen",
    "references.testimonial3.quote":
      "A collaboration that just flows. No complications, clear dialogue and high quality delivery. Exactly how you want things to work.",
    "references.testimonial3.author": "Per Svensson",
    "references.testimonial4.quote":
      "Always equally professional.",
    "references.testimonial4.author": "Johanna Mårdh",
    "references.testimonial5.quote":
      "Stay On Site delivers with a level of quality that shows in every detail. They helped me with accommodation in both Stockholm and Mora, with a process that was well thought out, smooth and well organized.",
    "references.testimonial5.author": "Tess Devlésa",
    "references.testimonial6.quote":
      "Quick response, clear communication and a professional approach. Highly recommended!",
    "references.testimonial6.author": "Philip Af Wetterstedt",
    "references.testimonial7.quote":
      "Kajsa is a reliable and business-minded woman with a heartfelt commitment and an outstanding sense of quality. Her delivery exceeds your expectations!",
    "references.testimonial7.author": "Charlotte Nilsson",
    "references.testimonial8.quote":
      "We are very satisfied with the service. Quick response, great offer and all communication went very well, excellent collaboration. Thanks Kajsa for all the guidance.",
    "references.testimonial8.author": "Iragi Kulimishi",
    "references.testimonial9.quote":
      "We are very happy about the service. Quick reaction, good offer and all communication went very well. Thanks for Kajsa for all help.",
    "references.testimonial9.author": "Gintarė Kedienė",

    "heroForm.city": "Location",
    "heroForm.cityPlaceholder": "e.g. Boden, Gävle, Luleå",
    "heroForm.people": "Number of people",
    "heroForm.peoplePlaceholder": "Count",
    "heroForm.contact": "Phone or email",
    "heroForm.contactPlaceholder": "073-123 45 67 or name@company.com",
    "heroForm.submit": "Get housing proposal",
    "heroForm.success": "Thanks! We'll get back within 24 hours.",
    "heroForm.contactError": "Enter a valid phone number or email",

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
    "faq.answer1": "Within 24 hours. We present accommodation options the same day your inquiry arrives – in urgent cases within 3 hours. According to Byggföretagen (the Swedish Construction Federation), more construction companies plan with shorter lead times as project timelines shift, and our average response time is under 3 hours for existing clients.",
    "faq.question2": "Which cities do you cover?",
    "faq.answer2":
      "Over 40 cities across Sweden – from Malmö in the south to Luleå in the north. We cover all 19 major construction markets plus specialized locations like Boden, Oskarshamn and Säffle where large energy and infrastructure projects are underway. According to Boverket's building forecast (December 2025), 35,000 homes are expected to start in 2026, driving demand for temporary worker housing nationwide.",
    "faq.question3": "What does it cost to rent accommodation through you?",
    "faq.answer3":
      "You get a clear all-inclusive quote. Price depends on number of people, location, and accommodation type (shared or individual). Everything is included: rent, electricity, internet, cleaning, and bed linen. No hidden fees. Our clients typically save 20–30% compared to hotel accommodation for the same period.",
    "faq.question4": "Is the accommodation furnished?",
    "faq.answer4":
      "Yes, always fully furnished and move-in ready. Every accommodation has beds, kitchen, bathroom, washing machine, Wi-Fi, and workspace. We have furnished over 500 accommodations since 2013 and customize when needed – for example extra beds, office chairs, or parking for service vehicles.",
    "faq.question5": "Can we make changes to the booking after confirmation?",
    "faq.answer5":
      "Yes, we are used to changing schedules. The construction sector is flexible by nature – Byggföretagen's economic report shows that 4 out of 5 projects change staffing during the project cycle. We handle additions, reductions, and reallocations continuously without extra fees.",
    "faq.question6": "What does it cost to hire you as accommodation coordinator?",
    "faq.answer6":
      "Zero. We charge no fees, commissions, or setup costs. You only pay for the accommodations you actually rent. Our revenue comes from the rental margin – which means we have direct incentive to find the right accommodation at the right price for you.",
    "faq.question7": "What does the worker accommodation market look like in 2026?",
    "faq.answer7": "Demand for worker accommodation is rising sharply. According to Boverket's latest forecast (December 2025), Sweden's housing deficit stands at 52,300 units per year, while only 35,000 are estimated to start in 2026. At the same time, Byggföretagen's economic report shows construction employment is expected to rise to 369,500 people in 2025–2026. This creates enormous demand for temporary housing solutions, particularly in northern Sweden where the green transition is driving thousands of new jobs (Source: Boverket, 'Housing Construction Indicators', Dec 2025; Byggföretagen, Economic Report 2025).",
    "faq.question8": "Which industries need worker accommodation the most?",
    "faq.answer8": "The construction sector is the largest source of demand, followed by the energy sector. According to Byggföretagen, energy-related investments are increasing by 18 percent during 2024–2026, driven by wind power, nuclear energy, and data centers. We also see strong demand from infrastructure projects (roads, railways, tunnel construction) and industrial installations. Norrbotten and Västerbotten counties have the highest growth with projects like Northvolt's battery factory, H2 Green Steel's steel plant, and LKAB's transformation (Source: Byggföretagen, Economic Report 2025).",
    "faq.question9": "How does worker accommodation differ from hotels?",
    "faq.answer9": "Worker accommodation through StayOnSite costs on average 40–60% less than hotels for longer stays. You get fully furnished apartments with kitchen, washing machine, and internet – giving your employees a real home, not a hotel room. According to SCB's hotel price index (2025), the average hotel room price in Sweden is SEK 1,200–1,800/night, while worker accommodation starts from SEK 350/person/night depending on city and duration.",
    "faq.question10": "What laws apply to corporate rental of accommodation?",
    "faq.answer10": "Private property rental is regulated by the Private Rental Act (Privatuthyrningslagen). From July 2026, the law will be reformed with new rules that make it easier for smaller property owners to rent to companies. The standard deduction increases from SEK 40,000 to 50,000 per year, and block rental rules are simplified. StayOnSite handles all contracts and ensures all legal requirements are met (Source: Government proposition 2025/26:NN; Swedish Tax Agency, 'Renting out private housing', 2025).",
    "faq.question11": "How does StayOnSite's Zero-Fee Model work?",
    "faq.answer11": "Our Zero-Fee Model means the property owner receives 100% of the agreed rent – with no deductions. Unlike Samtrygg (15% fee) and Qasa (4.95% fee), StayOnSite charges 0% from the property owner. We earn from the margin between the fixed rent we pay and the price we charge the corporate client. The result: the property owner gets a guaranteed, fixed monthly income with no surprises.",
    "faq.question12": "Why choose StayOnSite over Airbnb for companies?",
    "faq.answer12": "Airbnb is designed for tourists, not professional work teams. With StayOnSite you get corporate invoicing, unified contracts for your entire team, a dedicated contact person, and accommodation adapted for longer stays. We handle everything from contracts to maintenance requests. Plus, you avoid Airbnb's service fee (which can be 14–20%) and the risk of bookings being cancelled by hosts. StayOnSite delivers reliability, not uncertainty.",

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
      "500+ accommodations arranged since 2013. We handle planning, contracts, and operations so you stay on schedule. 4.9 out of 5 customer rating.",
    "why.steps.plan.title": "Planning & proposals",
    "why.steps.plan.description":
      "Housing proposals within 24 hours – often within 3 hours. Send your inquiry via form, email, or WhatsApp. We map local landlords across our 40+ city network and respond with ready options including address, floor plan, and pricing.",
    "why.steps.plan.cta": "Send inquiry →",
    "why.steps.contracts.title": "Contracts & move-ins",
    "why.steps.contracts.description":
      "Choose the option that fits you. We handle leases, keys, and inspections with transparent 3–36 month terms. Everything included: furniture, electricity, internet, bed linen, and cleaning. Your workers receive complete move-in info in Swedish, English, or Polish.",
    "why.steps.contracts.cta": "Call us now →",
    "why.steps.operations.title": "Operations & reporting",
    "why.steps.operations.description":
      "One dedicated contact person throughout your project. Occupancy, weekly cleaning, and incidents reported directly to project management. We handle additions and changes continuously – 100+ corporate clients have chosen us for exactly this reliability.",
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
    "case.cta.button": "Send an email",
    "case.cta.description": "We help you every step of the way. Contact us directly for a personal response!",
    "case.cta.callDirect": "Call directly: 076-249 84 86",
    "case.cta.responseTime": "Response within 15 minutes",

    "references.stats.happyClients": "Happy clients",
    "references.stats.accommodations": "Accommodations arranged",
    "references.stats.responseTime": "Average response time",
    "references.stats.cities": "Cities in Sweden",

    "nav.homeowner": "For Homeowners",
    "nav.about": "About us",

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
    "homeowner.faq.question7": "What does the new Private Rental Act mean from July 2026?",
    "homeowner.faq.answer7": "The Swedish parliament has decided on a reform of the Private Rental Act taking effect July 2026. Key changes: you can rent out up to 2 properties without it being classified as commercial activity, the standard deduction increases from SEK 40,000 to 50,000 per year, and block rental rules are simplified. For you as a StayOnSite landlord, this means even better conditions – your guaranteed rent is fully legal and tax-optimized (Source: SOU 2025:65; Swedish Tax Agency, 'Private property rental', 2025).",
    "homeowner.faq.question8": "Is it really 0% in fees?",
    "homeowner.faq.answer8": "Yes, our Zero-Fee Model means you receive 100% of the agreed rent every month – with no deductions. Samtrygg charges 15% of rent, Qasa charges 4.95%. StayOnSite charges 0%. We earn from the price difference toward the corporate client. You pay nothing to us – we pay you.",
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

    "brand.nollavgift.name": "The Zero-Fee Model",
    "brand.nollavgift.tagline": "0% fees. 100% of the rent goes to you.",
    "brand.nollavgift.description": "StayOnSite's unique model where the property owner receives the full rent with no deductions – unlike competitors who charge 5–15% in fees.",

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
    "lp.husagare.formTitle": "Get a free income estimate",
    "lp.husagare.formSubtitle": "Leave your number – Kajsa will call you within 24h",
    "lp.husagare.submitButton": "Send – completely free & no obligation",
    "lp.husagare.bottomCta.title": "Ready to start earning from your property?",
    "lp.husagare.bottomCta.button": "Register your property now",
    "twotrack.company.tagline": "For companies",
    "twotrack.company.title": "Need worker accommodation?",
    "twotrack.company.description": "We handle everything — from contracts to move-in. One contact, one invoice, fully furnished.",
    "twotrack.company.cta": "See what we offer",
    "twotrack.homeowner.tagline": "For property owners",
    "twotrack.homeowner.title": "Rent your property to companies",
    "twotrack.homeowner.description": "Guaranteed rent every month, no deductions, 0% fee.",
    "twotrack.homeowner.cta": "How it works",
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
      "Zakwaterowanie pracownicze w Szwecji — organizujemy mieszkania",
    "hero.subtitle": "Od pierwszego inżyniera po ostatniego montera",
    "hero.cta": "Wyślij zapytanie",
    "hero.tagline": "Partner ds. wdrożeń w Szwecji",
    "hero.bullet1": "Mieszkania i domy - spełniamy Wasze potrzeby",
    "hero.bullet2": "Zawsze w pełni umeblowane i gotowe do zamieszkania",
    "hero.bullet3": "Pomagamy Ci - telefon, e-mail lub WhatsApp 24/7",
    "hero.ctaPhone": "Zadzwoń teraz",
    "hero.ctaWhatsapp": "Napisz na WhatsApp",
    "hero.ctaSubtext": "+46 73 628 77 09 · Telefon / E-mail / WhatsApp",
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
      "Odpowiadamy przez e-mail lub WhatsApp – zwykle w 15 minut, zawsze w ciągu doby",
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
      "Łatwo, sprawnie i prosto. Zajmują się wszystkim! Możemy skupić się na naszej pracy.",
    "references.testimonial1.author": "Frans Åberg",
    "references.testimonial2.quote":
      "Świetna i szybka obsługa, zawsze znajdują rozwiązania. Dziękujemy za dobrą współpracę!",
    "references.testimonial2.author": "Valle Jensen",
    "references.testimonial3.quote":
      "Współpraca, która po prostu płynie. Bez komplikacji, jasny dialog i wysoka jakość. Dokładnie tak, jak powinno to działać.",
    "references.testimonial3.author": "Per Svensson",
    "references.testimonial4.quote":
      "Zawsze równie profesjonalni.",
    "references.testimonial4.author": "Johanna Mårdh",
    "references.testimonial5.quote":
      "Stay On Site dostarcza usługi na poziomie jakości, który widać w każdym szczególe. Pomogli mi ze zakwaterowaniem zarówno w Sztokholmie, jak i w Mora — proces był przemyślany, sprawny i dobrze zorganizowany.",
    "references.testimonial5.author": "Tess Devlésa",
    "references.testimonial6.quote":
      "Szybka odpowiedź, jasna komunikacja i profesjonalne podejście. Polecam!",
    "references.testimonial6.author": "Philip Af Wetterstedt",
    "references.testimonial7.quote":
      "Kajsa to niezawodna i profesjonalna kobieta z serdecznym zaangażowaniem i doskonałym wyczuciem jakości. Jej usługi przekraczają oczekiwania!",
    "references.testimonial7.author": "Charlotte Nilsson",
    "references.testimonial8.quote":
      "Jesteśmy bardzo zadowoleni z usługi. Szybka odpowiedź, dobra oferta i cała komunikacja przebiegała bardzo dobrze, doskonała współpraca. Dziękujemy Kajsa za wszelkie wskazówki.",
    "references.testimonial8.author": "Iragi Kulimishi",
    "references.testimonial9.quote":
      "Jesteśmy bardzo zadowoleni z usługi. Szybka reakcja, dobra oferta i cała komunikacja przebiegała bardzo dobrze. Dziękujemy Kajsa za całą pomoc.",
    "references.testimonial9.author": "Gintarė Kedienė",

    "heroForm.city": "Miejscowość",
    "heroForm.cityPlaceholder": "np. Boden, Gävle, Luleå",
    "heroForm.people": "Liczba osób",
    "heroForm.peoplePlaceholder": "Liczba",
    "heroForm.contact": "Telefon lub e-mail",
    "heroForm.contactPlaceholder": "073-123 45 67 lub nazwa@firma.pl",
    "heroForm.submit": "Uzyskaj propozycję",
    "heroForm.success": "Dziękujemy! Odezwiemy się w ciągu 24 godzin.",
    "heroForm.contactError": "Podaj prawidłowy numer telefonu lub e-mail",

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
    "faq.answer1": "W ciągu 24 godzin. Przedstawiamy propozycje zakwaterowania tego samego dnia. W nagłych przypadkach – w ciągu 3 godzin. Według Byggföretagen (Szwedzkiej Federacji Budownictwa) coraz więcej firm budowlanych planuje na krótki termin. Nasz średni czas odpowiedzi to poniżej 3 godzin dla stałych klientów.",
    "faq.question2": "W jakich miastach działacie?",
    "faq.answer2":
      "Ponad 40 miast w całej Szwecji – od Malmö na południu po Luleå na północy. Obejmujemy wszystkie 19 głównych rynków budowlanych oraz specjalne lokalizacje jak Boden, Oskarshamn i Säffle, gdzie trwają duże projekty energetyczne i infrastrukturalne. Według prognozy Boverket (grudzień 2025) w 2026 roku rozpocznie się budowa 35 000 mieszkań, co napędza zapotrzebowanie na tymczasowe zakwaterowanie pracownicze.",
    "faq.question3":
      "Ile kosztuje wynajem zakwaterowania za Waszym pośrednictwem?",
    "faq.answer3":
      "Otrzymujecie jasną ofertę all-inclusive. Cena zależy od liczby osób, lokalizacji i typu zakwaterowania. Wszystko w cenie: czynsz, prąd, internet, sprzątanie i pościel. Bez ukrytych kosztów. Nasi klienci oszczędzają średnio 20–30% w porównaniu z zakwaterowaniem hotelowym.",
    "faq.question4": "Czy zakwaterowanie jest umeblowane?",
    "faq.answer4":
      "Tak, zawsze w pełni umeblowane i gotowe do zamieszkania. Każde zakwaterowanie posiada łóżka, kuchnię, łazienkę, pralkę, Wi-Fi i miejsce do pracy. Od 2013 roku wyposażyliśmy ponad 500 zakwaterowań i dostosowujemy się do potrzeb – dodatkowe łóżka, krzesła biurowe czy parkingi dla pojazdów służbowych.",
    "faq.question5":
      "Czy możemy wprowadzać zmiany w rezerwacji po jej potwierdzeniu?",
    "faq.answer5":
      "Tak, jesteśmy przyzwyczajeni do zmiennych harmonogramów. Sektor budowlany jest z natury elastyczny – raport Byggföretagen pokazuje, że 4 na 5 projektów zmienia obsadę w trakcie realizacji. Obsługujemy zmiany na bieżąco bez dodatkowych opłat.",
    "faq.question6": "Ile kosztuje zatrudnienie Was jako koordynatora zakwaterowania?",
    "faq.answer6":
      "Zero. Nie pobieramy żadnych prowizji ani opłat konfiguracyjnych. Płacicie wyłącznie za faktycznie wynajmowane zakwaterowanie. Nasz przychód pochodzi z marży najmu – co oznacza, że mamy bezpośredni interes w znalezieniu odpowiedniego zakwaterowania w odpowiedniej cenie.",
    "faq.question7": "Jak wygląda rynek zakwaterowania pracowniczego w 2026 roku?",
    "faq.answer7": "Popyt na zakwaterowanie pracownicze gwałtownie rośnie. Według najnowszej prognozy Boverket (grudzień 2025) deficyt mieszkaniowy w Szwecji wynosi 52 300 jednostek rocznie, a w 2026 roku szacuje się rozpoczęcie budowy zaledwie 35 000. Jednocześnie raport Byggföretagen pokazuje, że zatrudnienie w budownictwie ma wzrosnąć do 369 500 osób w latach 2025–2026. Tworzy to ogromne zapotrzebowanie na tymczasowe rozwiązania mieszkaniowe (Źródło: Boverket, 'Wskaźniki budownictwa mieszkaniowego', gru 2025; Byggföretagen, Raport koniunkturalny 2025).",
    "faq.question8": "Które branże najbardziej potrzebują zakwaterowania pracowniczego?",
    "faq.answer8": "Sektor budowlany jest największym źródłem popytu, następnie sektor energetyczny. Według Byggföretagen inwestycje związane z energią rosną o 18 procent w latach 2024–2026, napędzane energią wiatrową, jądrową i centrami danych. Obserwujemy również silny popyt ze strony projektów infrastrukturalnych i instalacji przemysłowych. Norrbotten i Västerbotten mają największy wzrost (Źródło: Byggföretagen, Raport koniunkturalny 2025).",
    "faq.question9": "Czym różni się zakwaterowanie pracownicze od hotelu?",
    "faq.answer9": "Zakwaterowanie pracownicze przez StayOnSite kosztuje średnio 40–60% mniej niż hotel przy dłuższych pobytach. Otrzymujesz w pełni umeblowane mieszkania z kuchnią, pralką i internetem. Według indeksu cen hotelowych SCB (2025) średnia cena pokoju hotelowego w Szwecji wynosi 1 200–1 800 SEK/noc, podczas gdy zakwaterowanie pracownicze zaczyna się od 350 SEK/osobę/noc.",
    "faq.question10": "Jakie przepisy obowiązują przy wynajmie firmowym?",
    "faq.answer10": "Wynajem prywatnych mieszkań reguluje Privatuthyrningslagen. Od lipca 2026 roku prawo zostanie zreformowane – nowe zasady ułatwiają mniejszym właścicielom wynajem firmom. Odliczenie standardowe wzrasta z 40 000 do 50 000 SEK rocznie. StayOnSite obsługuje wszystkie umowy i zapewnia zgodność z przepisami (Źródło: Propozycja rządowa 2025/26:NN; Skatteverket, 2025).",
    "faq.question11": "Jak działa Model Zero-Opłat StayOnSite?",
    "faq.answer11": "Nasz Model Zero-Opłat oznacza, że właściciel nieruchomości otrzymuje 100% uzgodnionego czynszu – bez potrąceń. W przeciwieństwie do Samtrygg (15% opłaty) i Qasa (4,95% opłaty), StayOnSite pobiera 0% od właściciela. Zarabiamy na marży między stałym czynszem a ceną dla klienta firmowego.",
    "faq.question12": "Dlaczego wybrać StayOnSite zamiast Airbnb dla firm?",
    "faq.answer12": "Airbnb jest zaprojektowany dla turystów, nie dla profesjonalnych zespołów. Ze StayOnSite otrzymujesz fakturę firmową, jednolite umowy dla całego zespołu, dedykowaną osobę kontaktową i zakwaterowanie dostosowane do dłuższych pobytów. Obsługujemy wszystko od umów po zgłoszenia awarii. StayOnSite dostarcza niezawodność.",

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
      "Ponad 500 zorganizowanych zakwaterowań od 2013 roku. Przejmujemy planowanie, umowy i eksploatację. Ocena klientów: 4,9 na 5.",
    "why.steps.plan.title": "Planowanie i propozycje",
    "why.steps.plan.description":
      "Propozycje zakwaterowania w ciągu 24 godzin – często w 3 godziny. Wyślij zapytanie przez formularz, e-mail lub WhatsApp. Analizujemy sieć właścicieli w ponad 40 miastach i odpowiadamy gotowymi opcjami z adresem, planem i ceną.",
    "why.steps.plan.cta": "Wyślij zapytanie →",
    "why.steps.contracts.title": "Umowy i wprowadzki",
    "why.steps.contracts.description":
      "Wybierz opcję, która pasuje. Zajmujemy się umowami, kluczami i protokołami z jasnymi warunkami na 3–36 miesięcy. Wszystko w cenie: meble, prąd, internet, pościel i sprzątanie. Informacje dla pracowników po szwedzku, angielsku lub polsku.",
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
    "case.cta.button": "Wyślij e-mail",
    "case.cta.description": "Pomagamy na każdym kroku. Skontaktuj się z nami bezpośrednio, aby uzyskać osobistą odpowiedź!",
    "case.cta.callDirect": "Zadzwoń: 076-249 84 86",
    "case.cta.responseTime": "Odpowiedź w ciągu 15 minut",

    "references.stats.happyClients": "Zadowoleni klienci",
    "references.stats.accommodations": "Zapewnione zakwaterowania",
    "references.stats.responseTime": "Średni czas odpowiedzi",
    "references.stats.cities": "Miasta w Szwecji",

    "nav.homeowner": "Dla właścicieli",
    "nav.about": "O nas",

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
    "homeowner.faq.question7": "Co oznacza nowa ustawa o wynajmie prywatnym od lipca 2026?",
    "homeowner.faq.answer7": "Szwedzki parlament zdecydował o reformie ustawy o wynajmie prywatnym, obowiązującej od lipca 2026. Kluczowe zmiany: możesz wynajmować do 2 nieruchomości bez klasyfikacji jako działalność gospodarcza, odliczenie standardowe wzrasta z 40 000 do 50 000 SEK rocznie. Dla Ciebie jako wynajmującego przez StayOnSite oznacza to jeszcze lepsze warunki (Źródło: SOU 2025:65; Skatteverket, 2025).",
    "homeowner.faq.question8": "Czy to naprawdę 0% opłat?",
    "homeowner.faq.answer8": "Tak, nasz Model Zero-Opłat oznacza, że otrzymujesz 100% uzgodnionego czynszu co miesiąc – bez potrąceń. Samtrygg pobiera 15%, Qasa 4,95%. StayOnSite pobiera 0%. Zarabiamy na różnicy cenowej wobec klienta firmowego. Nie płacisz nam nic – to my płacimy Tobie.",
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

    "brand.nollavgift.name": "Model Zero-Opłat",
    "brand.nollavgift.tagline": "0% opłat. 100% czynszu dla Ciebie.",
    "brand.nollavgift.description": "Unikalny model StayOnSite, w którym właściciel otrzymuje pełny czynsz bez potrąceń – w przeciwieństwie do konkurentów pobierających 5–15% opłat.",

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
    "lp.husagare.formTitle": "Uzyskaj bezpłatną wycenę dochodu",
    "lp.husagare.formSubtitle": "Zostaw swój numer – Kajsa zadzwoni w ciągu 24h",
    "lp.husagare.submitButton": "Wyślij – całkowicie za darmo i bez zobowiązań",
    "lp.husagare.bottomCta.title": "Gotowy, aby zacząć zarabiać na swoim mieszkaniu?",
    "lp.husagare.bottomCta.button": "Zarejestruj swoją nieruchomość teraz",
    "twotrack.company.tagline": "Dla firm",
    "twotrack.company.title": "Potrzebujecie zakwaterowania pracowniczego?",
    "twotrack.company.description": "Zajmujemy się wszystkim — od umów po wprowadzenie. Jeden kontakt, jedna faktura, w pełni umeblowane.",
    "twotrack.company.cta": "Zobacz naszą ofertę",
    "twotrack.homeowner.tagline": "Dla właścicieli",
    "twotrack.homeowner.title": "Wynajmij swoją nieruchomość firmom",
    "twotrack.homeowner.description": "Gwarantowany czynsz co miesiąc, bez potrąceń, 0% opłat.",
    "twotrack.homeowner.cta": "Jak to działa",
  },
};
