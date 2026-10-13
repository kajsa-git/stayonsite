'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlogPost } from '@/data/blog-posts';
import { useTranslation } from '@/hooks/use-translation';
import BlogLayout from './BlogLayout';

export default function ChecklistaPersonalboende() {
  const post = getBlogPost('checklista-personalboende-boendebrief')!;
  const { t } = useTranslation();

  return (
    <BlogLayout post={post}>
      <p>
        Ska ni ordna <strong>personalboende för ett arbetslag</strong>? Börja med ett
        gemensamt underlag innan ni ber om priser. Den här fria mallen samlar
        boendebrief, bemanning per projektfas och kontroller inför bokning och inflyttning.
        Fyll i briefen och skicka den till StayOnSite, så hjälper vi er att hitta boende.
      </p>
      <div className="not-prose my-8 flex flex-col items-start gap-3">
        <Button asChild size="lg">
          <a href="/downloads/checklista-personalboende.pdf" download="checklista-personalboende.pdf">
            <Download data-icon="inline-start" aria-hidden="true" />
            {t('projectChecklist.download')}
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">{t('projectChecklist.format')}</p>
      </div>
      <p>
        Skicka den ifyllda briefen till{' '}
        <a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a>.
        Vi går igenom arbetslagets behov och hjälper er att hitta boende för projektet.
      </p>

      <h2>1. Gör en boendebrief som går att söka efter</h2>
      <p>
        Ange arbetsplatsens faktiska adress, inte bara kommunen. Två bostäder i samma
        kommun kan ge helt olika restider. Lägg till lagets skifttider och den längsta
        restid som fungerar i projektet.
      </p>
      <ul>
        <li><strong>Arbetsplats:</strong> adress, skiftstart och högsta accepterade restid.</li>
        <li><strong>Bemanning:</strong> antal personer, krav på egna eller delade sovrum och antal bäddar.</li>
        <li><strong>Period:</strong> in- och utflyttningsdatum, ankomsttid och eventuell osäkerhet i slutdatum.</li>
        <li><strong>Fordon:</strong> antal bilar, servicebilar, släp och eventuella höjdbegränsningar.</li>
        <li><strong>Vardagen:</strong> kök, tvätt, wifi, linne och behov av städning.</li>
        <li><strong>Budget:</strong> belopp, om det gäller per person, natt eller månad och hur moms ska anges i offerten.</li>
        <li><strong>Ansvar:</strong> vem som bokar och vem som godkänner ändringar under perioden.</li>
      </ul>
      <p>
        Skriv gärna vilka krav som är absoluta och vilka som kan anpassas. Om eget
        sovrum är ett krav men flera adresser fungerar ska båda uppgifterna finnas med.
        Lämna okända uppgifter öppna och ange när de kan bekräftas.
      </p>

      <h2>2. Planera bemanningen i faser</h2>
      <p>
        Antalet personer vid projektstart är inte alltid samma som under resten av
        uppdraget. Fyll i datum och antal personer för etablering, huvudarbete och
        avslut. Lägg också till rotation och hemresor när de påverkar boendet.
      </p>
      <p>
        Berätta för oss om ni kan behöva fler bäddar, färre bostäder eller en längre
        period. Vi går igenom vilka alternativ och villkor som gäller. Utse en
        person som samlar ändringarna så att vi får ett tydligt besked.
      </p>
      <p>
        För en större boendeplan finns mer om kapacitet, sökradie och reservlösningar
        på sidan om <Link href="/projektboende">projektboende för bygg, industri och montage</Link>.
      </p>

      <h2>3. Jämför boendealternativen på samma grund</h2>
      <p>
        Be oss räkna på samma antal personer, samma period och samma service när
        ni jämför våra boendeförslag. Ett pris per bädd och natt går inte att jämföra direkt med en
        månadshyra för ett helt hus.
      </p>
      <ul>
        <li>Vilket totalbelopp gäller för er planerade period?</li>
        <li>Ingår el, värme, wifi, linne, löpande städning och slutstädning?</li>
        <li>Finns deposition, startavgifter eller andra tillägg?</li>
        <li>Vad händer med priset vid förlängning eller ändrad bemanning?</li>
        <li>Vilken adress, rumsfördelning och parkering omfattar offerten?</li>
      </ul>
      <p>
        Räkna transporten separat. Om ni jämför ett billigare boende längre bort
        med ett närmare alternativ behöver ni även bedöma fordon, bränsle och den
        tid som resorna tar. Skriv ned era antaganden så att jämförelsen kan följas.
      </p>

      <h2>4. Bekräfta det praktiska före ankomst</h2>
      <p>
        Skicka adress, ankomsttid och information om nycklar till arbetslaget.
        Bekräfta att bostaden är städad och att utrustningen fungerar. Dokumentera
        inventarier och befintliga skador tillsammans med den boendeansvariga.
      </p>
      <p>
        Kontrollera hur wifi, tvätt och parkering används och vem laget kontaktar
        vid fel. Bestäm när nästa avstämning sker och vem som hanterar förändrade datum.
        Den andra sidan i PDF-mallen har rutor för dessa kontroller och öppna frågor.
      </p>

      <h2>Använd briefen på er projektort</h2>
      <p>
        Samma mall kan användas på olika orter. Arbetsplatsens adress, lokal tillgång
        och tidpunkten för projektet avgör vilka alternativ som går att erbjuda.
        Här hittar ni våra lokala kontaktvägar:
      </p>
      <ul>
        <li><Link href="/stad/boden">Företagsboende och personalboende i Boden</Link></li>
        <li><Link href="/stad/lulea">Företagsboende och personalboende i Luleå</Link></li>
        <li><Link href="/stad/oskarshamn">Företagsboende och personalboende i Oskarshamn</Link></li>
        <li><Link href="/stad/saffle">Företagsboende och personalboende i Säffle</Link></li>
        <li><Link href="/stad/gavle">Företagsboende och personalboende i Gävle</Link></li>
      </ul>
      <p>
        För arbete vid OKG finns även en <Link href="/blogg/personalboende-okg-oskarshamn-guide">
          särskild guide om boende i Oskarshamn och nära Simpevarp
        </Link>.
      </p>

      <h2>Vanliga frågor om mallen</h2>
      <h3>Hur skickar vi boendebriefen till StayOnSite?</h3>
      <p>
        Fyll i PDF-mallen och mejla den till{' '}
        <a href="mailto:kajsa@stayonsite.se">kajsa@stayonsite.se</a>, så hjälper vi er
        att hitta boende för arbetslaget. Mallen är gratis och kräver ingen registrering.
      </p>
      <h3>Kan PDF-mallen fyllas i digitalt?</h3>
      <p>
        Ja. Ladda ned filen och öppna den i en PDF-läsare som stöder formulär.
        Spara en egen kopia när ni har fyllt i den. Den går också att skriva ut.
      </p>
      <h3>Vad gör vi om slutdatum eller bemanning inte är bestämt?</h3>
      <p>
        Ange det ni vet, markera det som är preliminärt och bestäm datum för nästa
        avstämning. Vi går igenom villkoren för ändringar med er innan ni bokar.
      </p>
    </BlogLayout>
  );
}
