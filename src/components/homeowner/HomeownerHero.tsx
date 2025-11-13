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
    className="relative section-spacing bg-cover bg-center text-nordic-900 pt-36 pb-24 md:pb-36 overflow-hidden nordic-texture border-t border-nordic-100"
    style={{
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Subtle overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/10"></div>
      
      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="max-w-2xl mx-auto nordic-card p-8 md:p-10 border border-nordic-200 text-center">
          <span className="inline-block text-nordic-500 mb-3 text-sm uppercase tracking-wider font-heading">
            Stuga • Lägenhet • Hus
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight text-nordic-900">
            {t('homeowner.hero.title')}
          </h1>
          <p className="text-base md:text-lg text-nordic-800 mb-8 leading-relaxed font-light">
            {t('homeowner.hero.subtitle')}
          </p>
          
          <div className="mb-8">
            <p className="text-xl md:text-2xl font-semibold text-nordic-900 mb-2">
              Tjäna 3 000 – 8 000 kr/månad
            </p>
            <p className="text-base md:text-lg text-nordic-800 leading-relaxed font-light">
              Vi hjälper dig med uthyrningen, du får betalt
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={scrollToForm} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 py-2.5 h-auto font-light transition-colors duration-500">
              {t('homeowner.hero.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default HomeownerHero;
