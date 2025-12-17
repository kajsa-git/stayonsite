import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
const HomeownerHero = () => {
  const {
    t
  } = useLanguage();
  const scrollToForm = () => {
    const formElement = document.getElementById('homeowner-form');
    if (formElement) {
      formElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section
    id="hero"
    className="relative isolate flex items-end md:items-center bg-cover bg-center text-white min-h-[65vh] md:min-h-[480px] lg:min-h-[520px] overflow-hidden pt-20 md:pt-24"
    style={{
    backgroundImage: `url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`
  }}>
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />

      <div className="container mx-auto px-6 md:px-8 relative py-16 md:py-10">
        <div className="max-w-3xl space-y-5">
          <h1 className="font-display text-5xl md:text-[56px] lg:text-[64px] font-semibold leading-[1.1] tracking-tight">
            {t('homeowner.hero.title')}
          </h1>
          <p className="max-w-2xl text-base md:text-lg text-white/75">
            {t('homeowner.hero.subtitle')}
          </p>

          <div className="rounded-2xl bg-white/95 text-nordic-900 shadow-lg border border-white/30 p-4 md:p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-2xl font-light text-nordic-900">Tjäna 3 000 – 8 000 kr/månad</p>
                <p className="text-sm text-nordic-600 mt-1">Vi hjälper dig hitta rätt hyresgäst</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={scrollToForm} className="rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white px-6">
                  {t('homeowner.hero.cta')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HomeownerHero;
