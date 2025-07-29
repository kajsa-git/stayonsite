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
    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6)), url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Subtle overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-white/30"></div>
      
      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="max-w-2xl nordic-card p-8 md:p-10 border border-nordic-200">
          <span className="inline-block text-nordic-500 mb-3 text-sm uppercase tracking-wider font-heading">
            Stuga • Lägenhet • Hus
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight text-nordic-900">
            {t('homeowner.hero.title')}
          </h1>
          <p className="text-base md:text-lg text-nordic-800 mb-6 leading-relaxed font-light">
            {t('homeowner.hero.subtitle')}
          </p>
          
          {/* Income highlight */}
          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-6 mb-8 rounded-lg border border-amber-200/30">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl font-display text-gradient bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-semibold">
                {t('homeowner.hero.incomeRange')}
              </span>
            </div>
            <p className="text-nordic-700 font-light text-sm leading-relaxed text-center">
              {t('homeowner.hero.incomeDescription')}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <Button onClick={scrollToForm} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 py-2.5 h-auto font-light transition-colors duration-500">
              {t('homeowner.hero.cta')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Subtle wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,37.3C672,32,768,32,864,32C960,32,1056,32,1152,37.3C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z">
          </path>
        </svg>
      </div>
    </section>;
};
export default HomeownerHero;