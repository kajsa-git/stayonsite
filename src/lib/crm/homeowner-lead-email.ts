export const HOMEOWNER_REGISTRATION_URL = "https://www.stayonsite.se/registrera-bostad";

type Locale = "sv" | "en" | "pl";

const copy = {
  sv: {
    subject: "Slutför registreringen av din bostad",
    greeting: "Hej!",
    intro: "Du har påbörjat registreringen av din bostad hos oss. För att vi ska kunna matcha den med våra hyresgäster behöver vi resten av uppgifterna: adress, storlek, hyra och gärna bilder. Det tar ett par minuter.",
    label: "Fyll i bostadens uppgifter",
    button: "Registrera bostaden",
    followUp: "När du har fyllt i uppgifterna återkommer vi om nästa steg. Du kan känna dig trygg med att din exakta adress aldrig visas offentligt, och inget visas online utan ditt godkännande.",
    question: "Har du frågor? SMS:a eller ring oss direkt: 076-249 84 86.",
    signoff: "Med vänliga hälsningar,",
    organization: "StayOnSite",
  },
  en: {
    subject: "Complete your property registration",
    greeting: "Hi!",
    intro: "You have started registering your property with us. To match it with our tenants, we need the rest of the details: address, size, rent and ideally photos. It takes a few minutes.",
    label: "Add your property details",
    button: "Register the property",
    followUp: "Once you have completed the details, we will contact you about the next step. Your exact address is never shown publicly, and nothing is published online without your approval. The registration form is in Swedish.",
    question: "Questions? Text or call us directly: 076-249 84 86.",
    signoff: "Best regards,",
    organization: "StayOnSite",
  },
  pl: {
    subject: "Dokończ rejestrację nieruchomości",
    greeting: "Cześć!",
    intro: "Rozpocząłeś rejestrację nieruchomości u nas. Aby dopasować ją do potrzeb naszych najemców, potrzebujemy pozostałych informacji: adres, powierzchnia, czynsz i najlepiej zdjęcia. Zajmie to kilka minut.",
    label: "Uzupełnij dane nieruchomości",
    button: "Zarejestruj nieruchomość",
    followUp: "Po uzupełnieniu danych skontaktujemy się z Tobą w sprawie kolejnego kroku. Dokładny adres nigdy nie jest widoczny publicznie, a bez Twojej zgody nic nie zostanie opublikowane online. Formularz jest w języku szwedzkim.",
    question: "Masz pytania? Napisz SMS lub zadzwoń bezpośrednio: 076-249 84 86.",
    signoff: "Pozdrawiam,",
    organization: "StayOnSite",
  },
} satisfies Record<Locale, Record<string, string>>;

export function buildHomeownerLeadConfirmationEmail(locale: Locale) {
  const c = copy[locale];
  const text = [
    c.greeting, "", c.intro, "", c.label,
    `${c.button}: ${HOMEOWNER_REGISTRATION_URL}`, "", c.followUp, "",
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
      <p style="margin:28px 0;"><a href="${HOMEOWNER_REGISTRATION_URL}" style="display:inline-block;background:#ff6300;color:#ffffff;padding:12px 24px;border-radius:9999px;text-decoration:none;font-weight:700;">${c.button}</a></p>
      <p>${c.followUp}</p>
      <p>${c.question}</p>
      <p>${c.signoff}<br>Kajsa Sihlén<br>${c.organization}</p>
    </div>
  </div>
</body>
</html>`;
  return { subject: c.subject, text, html };
}
