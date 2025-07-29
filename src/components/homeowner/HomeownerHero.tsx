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
  return <section id="hero" className="relative bg-cover bg-center text-nordic-900 pt-36 pb-24 md:pb-36 overflow-hidden nordic-texture" style={{
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1)), url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Subtle overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/10"></div>
      
      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="max-w-2xl mx-auto nordic-card pt-6 px-10 pb-10 md:pt-8 md:px-12 md:pb-12 border border-nordic-200 text-center">
          <span className="inline-block text-nordic-500 mb-6 text-xs uppercase tracking-widest font-heading">
            Stuga • Lägenhet • Hus
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-nordic-900">
            {t('homeowner.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-nordic-700 mb-10 leading-relaxed font-light max-w-xl mx-auto">
            {t('homeowner.hero.subtitle')}
          </p>
          
          <div className="mb-10 bg-nordic-50 rounded-lg p-6 border border-nordic-100">
            <p className="text-2xl md:text-3xl font-medium text-nordic-900 mb-3 leading-tight">
              Tjäna 3 000 – 8 000 kr/månad
            </p>
            <p className="text-lg md:text-xl text-nordic-600 leading-relaxed font-light">
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