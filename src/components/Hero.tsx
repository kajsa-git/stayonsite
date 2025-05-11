
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative bg-cover bg-center text-gray-800 pt-32 pb-20 md:pb-32" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?ixlib=rb-4.0.3&auto=format&fit=crop&w=2965&q=80')" }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gray-900/40"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl glass-card bg-white/80 p-8 rounded-2xl shadow-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-primary-600">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full"
              onClick={() => {
                document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('hero.cta')}
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-white/60 border-primary-300 hover:bg-primary-100 text-primary-700 rounded-full"
              onClick={() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.services')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z">
          </path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
