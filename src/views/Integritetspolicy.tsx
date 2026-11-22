'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { OPEN_CONSENT_SETTINGS_EVENT } from '@/lib/openai-pixel';

const UPDATED = '22 november 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl font-semibold text-nordic-900">{title}</h2>
      {children}
    </section>
  );
}

export default function Integritetspolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 md:pt-32">
        <h1 className="font-heading text-3xl font-bold text-nordic-900 md:text-4xl">Integritetspolicy</h1>
        <p className="mt-2 text-sm text-gray-600">Senast uppdaterad {UPDATED}</p>

        <div className="mt-10 space-y-10 text-base leading-7 text-nordic-800">
          <Section title="Vem ansvarar för dina uppgifter">
            <p>
              StayOnSite AB (org.nr 559213-7102) ansvarar för de personuppgifter vi samlar in via stayonsite.se,
              e-post, telefon och SMS. Frågor om dina uppgifter skickar du till{' '}
              <a href="mailto:kajsa@stayonsite.se" className="font-medium underline">kajsa@stayonsite.se</a> eller
              ringer <span className="whitespace-nowrap">076-249 84 86</span>.
            </p>
          </Section>

          <Section title="Vilka uppgifter vi samlar in">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Företag som söker boende:</strong> namn, företag, e-post, telefon, ort, antal personer och det du
                skriver i dina meddelanden.
              </li>
              <li>
                <strong>Husägare och uthyrare:</strong> namn, telefon, e-post, adress, uppgifter om bostaden, bilder,
                önskad hyra samt namn och tidpunkt när du godkänner publicering eller avtal.
              </li>
              <li>
                <strong>Kontakt med oss:</strong> e-post och SMS som du skickar till oss och vi till dig.
              </li>
              <li>
                <strong>Besök på webbplatsen:</strong> om du godkänner cookies, uppgifter om hur du använder sajten och
                vilka annonser du kommit från.
              </li>
            </ul>
          </Section>

          <Section title="Varför vi använder uppgifterna">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Besvara förfrågningar, matcha boenden med hyresgäster och ta fram och följa upp avtal. Det gör vi för att
                kunna fullgöra avtal med dig eller på grund av vårt berättigade intresse av att driva verksamheten.
              </li>
              <li>
                Visa din bostad på vår hemsida och för potentiella hyresgäster. Det gör vi bara efter att du godkänt
                publiceringen, och din exakta adress och dina kontaktuppgifter visas aldrig offentligt.
              </li>
              <li>Mäta hur våra annonser fungerar. Det gör vi bara om du godkänner cookies.</li>
              <li>Fakturera och bokföra, eftersom lagen kräver det.</li>
            </ul>
          </Section>

          <Section title="Vilka som får ta del av uppgifterna">
            <p>
              När vi föreslår en bostad för ett företag delar vi de uppgifter som behövs för uthyrningen. Vi använder
              också leverantörer som hanterar uppgifter för vår räkning: Vercel (drift av webbplatsen), Turso
              (databas), Cloudflare (lagring av bilder), Resend (e-post), Fortnox (fakturering) och Anthropic
              (AI-stöd för att granska bilder och texter och föreslå svar på meddelanden).
            </p>
            <p>
              Om du godkänner cookies får Google, Meta, Microsoft (Clarity) och OpenAI uppgifter om besök och skickade
              formulär samt kontaktuppgifter i hashad form, för att vi ska kunna mäta våra annonser.
            </p>
            <p>
              Några av leverantörerna finns i USA. Överföringen sker då med stöd av EU:s ramverk för dataöverföringar
              mellan EU och USA eller EU-kommissionens standardavtalsklausuler.
            </p>
          </Section>

          <Section title="Hur länge vi sparar uppgifterna">
            <p>
              Vi sparar uppgifterna så länge vi har kontakt med dig eller behöver dem för att matcha boenden, och tar bort
              dem när de inte längre behövs eller när du ber oss om det. Underlag för bokföring sparar vi i sju år enligt
              bokföringslagen.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Vi använder cookies för att mäta annonser och besök bara om du godkänner det. Du kan ändra ditt val när som
              helst.
            </p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT))}
              className="inline-flex min-h-11 items-center rounded-full border border-nordic-300 px-5 text-sm font-semibold text-nordic-900 hover:bg-nordic-50"
            >
              Ändra cookieinställningar
            </button>
          </Section>

          <Section title="Dina rättigheter">
            <p>
              Du har rätt att få veta vilka uppgifter vi har om dig, få fel rättade, få uppgifter raderade, invända mot
              eller begränsa hur vi använder dem och återkalla ett samtycke. Hör av dig till oss så hjälper vi dig. Är du
              inte nöjd med hur vi hanterar dina uppgifter kan du klaga hos Integritetsskyddsmyndigheten (imy.se).
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
