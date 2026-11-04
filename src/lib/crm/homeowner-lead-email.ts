export const HUS_REGISTRATION_URL = "https://www.hyrutsmart.se/registrera";

type Locale = "sv" | "en" | "pl";

const copy = {
  sv: {
    subject: "Nästa steg: berätta om din bostad – StayOnSite",
    greeting: "Hej!",
    thanks: "Tack för ditt intresse för att hyra ut din bostad via StayOnSite!",
    next: "För att vi ska kunna se om din bostad passar våra företagskunders behov behöver vi veta lite mer om den. Registrera din bostad hos Hyr ut smart, vår tjänst för bostadsregistrering, och lägg gärna till bilder om du har.",
    button: "Registrera din bostad",
    conditions: "Det är kostnadsfritt att registrera bostaden. Du väljer själv om den får publiceras och om du vill gå vidare med en uthyrning.",
    question: "Har du frågor? Svara gärna på mejlet eller ring mig på 076-249 84 86.",
    signoff: "Vänliga hälsningar",
  },
  en: {
    subject: "Next step: tell us about your property – StayOnSite",
    greeting: "Hi!",
    thanks: "Thank you for your interest in renting out your property through StayOnSite!",
    next: "To help us see whether your property meets our corporate customers’ needs, please tell us a little more about it. Register it with Hyr ut smart, our property registration service, and add photos if you have them.",
    button: "Register your property",
    conditions: "Registration is free. You decide whether your property can be published and whether you want to go ahead with a rental. The registration form is in Swedish.",
    question: "Questions? Please reply to this email or call me on 076-249 84 86.",
    signoff: "Best regards",
  },
  pl: {
    subject: "Następny krok: opowiedz nam o swojej nieruchomości – StayOnSite",
    greeting: "Cześć!",
    thanks: "Dziękuję za zainteresowanie wynajmem nieruchomości za pośrednictwem StayOnSite!",
    next: "Abyśmy mogli sprawdzić, czy Twoja nieruchomość odpowiada potrzebom naszych klientów firmowych, potrzebujemy kilku dodatkowych informacji. Zarejestruj ją w Hyr ut smart, naszym serwisie rejestracji nieruchomości, i dodaj zdjęcia, jeśli je masz.",
    button: "Zarejestruj nieruchomość",
    conditions: "Rejestracja jest bezpłatna. To Ty decydujesz, czy nieruchomość może zostać opublikowana i czy chcesz ją wynająć. Formularz jest w języku szwedzkim.",
    question: "Masz pytania? Odpowiedz na tę wiadomość lub zadzwoń do mnie pod numer 076-249 84 86.",
    signoff: "Pozdrawiam",
  },
} satisfies Record<Locale, Record<string, string>>;

export function buildHomeownerLeadConfirmationEmail(locale: Locale) {
  const c = copy[locale];
  const text = [
    c.greeting, "", c.thanks, "", c.next, "",
    `${c.button}: ${HUS_REGISTRATION_URL}`, "", c.conditions, "",
    c.question, "", c.signoff, "Kajsa Sihlén", "StayOnSite",
  ].join("\n");
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#0f1c2e;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#0f1c2e;border-bottom:4px solid #ff6300;padding:24px 32px;color:#ffffff;font-family:Georgia,serif;font-size:26px;font-weight:700;">Stay<span style="color:#ff6300;">On</span>Site</div>
    <div style="padding:32px;line-height:1.6;font-size:15px;">
      <p>${c.greeting}</p>
      <p>${c.thanks}</p>
      <p>${c.next}</p>
      <p style="margin:28px 0;"><a href="${HUS_REGISTRATION_URL}" style="display:inline-block;background:#ff6300;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;">${c.button}</a></p>
      <p>${c.conditions}</p>
      <p>${c.question}</p>
      <p>${c.signoff}<br>Kajsa Sihlén<br>StayOnSite</p>
    </div>
  </div>
</body>
</html>`;
  return { subject: c.subject, text, html };
}
