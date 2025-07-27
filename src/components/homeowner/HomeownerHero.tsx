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
  return <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden" style={{
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6)), url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-nordic-900 mb-8 leading-tight">
            {t('homeowner.hero.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-nordic-800 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            {t('homeowner.hero.subtitle')}
          </p>

          {/* Income highlight */}
          <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md p-8 md:p-10 mb-12 max-w-2xl mx-auto border border-amber-300/40 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 transform hover:scale-[1.02] bg-zinc-50 rounded-xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center justify-center mb-6">
              <span className="text-3xl font-display text-gradient bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-semibold md:text-3xl">
                {t('homeowner.hero.incomeRange')}
              </span>
            </div>
            <p className="relative z-10 text-nordic-700 font-light text-lg leading-relaxed text-center">
              {t('homeowner.hero.incomeDescription')}
            </p>
          </div>
          
          {/* CTA Button */}
          <Button onClick={scrollToForm} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-light text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {t('homeowner.hero.cta')}
          </Button>
        </div>
      </div>

    </section>;
};
export default HomeownerHero;