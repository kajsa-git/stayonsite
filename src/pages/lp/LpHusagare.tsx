import SEO from '@/components/SEO';
import LpHeroForm from '@/components/lp/LpHeroForm';
import LpTrustBadges from '@/components/lp/LpTrustBadges';
import LpTestimonials from '@/components/lp/LpTestimonials';
import LpBottomCTA from '@/components/lp/LpBottomCTA';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import { useFacebookPixel } from '@/hooks/use-facebook-pixel';
import { useUtmCapture } from '@/hooks/use-utm-capture';

const LpHusagare = () => {
  useFacebookPixel();
  const utmParams = useUtmCapture();

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Tjäna 10 000–30 000 kr/mån på ditt boende | StayOnSite"
        description="Vi hyr din bostad till en fast månadshyra – du får betalt utan avdrag. Få en gratis intäktsbedömning inom 24 timmar."
        noindex
      />

      {/* Simple logo bar — NOT clickable */}
      <div className="flex items-center justify-center h-14 border-b border-primary/5 bg-white">
        <span className="text-xl font-heading font-bold text-primary tracking-tight">
          Stay<span className="text-accent">On</span>Site
        </span>
      </div>

      <main>
        <LpHeroForm utmParams={utmParams} />
        <LpTrustBadges />
        <LpTestimonials />
        <LpBottomCTA />
      </main>

      <FloatingPhoneButton />
    </div>
  );
};

export default LpHusagare;
