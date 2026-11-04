export const HUS_REGISTRATION_URL = "https://hyrutsmart.se/registrera";

type Locale = "sv" | "en" | "pl";

const copy = {
  sv: {
    subject: "Tack för din registrering – nästa steg",
    greeting: "Hej!",
    intro: "Tack för din registrering. För att vi ska kunna matcha ditt boende med våra hyresgäster så behöver vi uppgifter om ditt boende. Det görs via vår bostadsregistrering, HyrUtSmart.",
    label: "Fyll i bostaden",
    button: "Till bostadsregistreringen hos HyrUtSmart",
    followUp: "När du har fyllt i uppgifterna återkommer vi om nästa steg. Du kan känna dig trygg med att din exakta adress aldrig visas offentligt, och inget visas online utan ditt godkännande.",
    question: "Har du frågor? SMS:a eller ring oss direkt: 076-249 84 86.",
    signoff: "Med vänliga hälsningar,",
    organization: "HyrUtSmart – en del av StayOnSite",
  },
  en: {
    subject: "Thank you for registering – next steps",
    greeting: "Hi!",
    intro: "Thank you for registering. To match your property with our tenants, we need some details about it. You can provide them through HyrUtSmart, our property registration service.",
    label: "Add your property details",
    button: "Go to property registration at HyrUtSmart",
    followUp: "Once you have completed the details, we will contact you about the next step. Your exact address is never shown publicly, and nothing is published online without your approval. The registration form is in Swedish.",
    question: "Questions? Text or call us directly: 076-249 84 86.",
    signoff: "Best regards,",
    organization: "HyrUtSmart – part of StayOnSite",
  },
  pl: {
    subject: "Dziękujemy za rejestrację – następny krok",
    greeting: "Cześć!",
    intro: "Dziękujemy za rejestrację. Aby dopasować Twoją nieruchomość do potrzeb naszych najemców, potrzebujemy informacji na jej temat. Możesz je podać w HyrUtSmart, naszym formularzu rejestracji nieruchomości.",
    label: "Uzupełnij dane nieruchomości",
    button: "Przejdź do rejestracji w HyrUtSmart",
    followUp: "Po uzupełnieniu danych skontaktujemy się z Tobą w sprawie kolejnego kroku. Dokładny adres nigdy nie jest widoczny publicznie, a bez Twojej zgody nic nie zostanie opublikowane online. Formularz jest w języku szwedzkim.",
    question: "Masz pytania? Napisz SMS lub zadzwoń bezpośrednio: 076-249 84 86.",
    signoff: "Pozdrawiam,",
    organization: "HyrUtSmart – część StayOnSite",
  },
} satisfies Record<Locale, Record<string, string>>;

export function buildHomeownerLeadConfirmationEmail(locale: Locale) {
  const c = copy[locale];
  const text = [
    c.greeting, "", c.intro, "", c.label,
    `${c.button}: ${HUS_REGISTRATION_URL}`, "", c.followUp, "",
    c.question, "", c.signoff, "Kajsa Sihlén", c.organization,
  ].join("\n");
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#0f1c2e;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="background:#0f1c2e;border-bottom:4px solid #ff6300;padding:24px 32px;color:#ffffff;font-family:Georgia,serif;font-size:26px;font-weight:700;">Stay<span style="color:#ff6300;">On</span>Site</div>
    <div style="padding:32px;line-height:1.6;font-size:15px;">
      <p>${c.greeting}</p>
      <p>${c.intro}</p>
      <p><strong>${c.label}</strong></p>
      <p style="margin:28px 0;"><a href="${HUS_REGISTRATION_URL}" style="display:inline-block;background:#ff6300;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;">${c.button}</a></p>
      <p>${c.followUp}</p>
      <p>${c.question}</p>
      <p>${c.signoff}<br>Kajsa Sihlén<br>${c.organization}</p>
    </div>
  </div>
</body>
</html>`;
  return { subject: c.subject, text, html };
}
