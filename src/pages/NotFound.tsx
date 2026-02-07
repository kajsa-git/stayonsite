import { Link } from "react-router-dom";
import { useEffect } from "react";
import SEO from "@/components/SEO";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-nordic-100">
      <SEO
        title={t('seo.notFound.title')}
        description={t('seo.notFound.description')}
        noindex
      />
      <Header />
      
      <main className="flex-grow flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]" />
           <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>

        <div className="container mx-auto px-6 md:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="font-display text-9xl md:text-[220px] font-bold text-primary/5 select-none"
          >
            404
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-8 -mt-16 md:-mt-24 relative"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary">
              {t('seo.notFound.title') || "Sidan hittades inte"}
            </h2>
            <p className="text-xl text-primary/60 max-w-xl mx-auto font-light leading-relaxed">
              {t('seo.notFound.description') || "Vi kunde tyvärr inte hitta sidan du letade efter. Den kan ha flyttats eller tagits bort."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="group rounded-full h-16 px-10 bg-accent hover:bg-accent text-white text-lg font-bold shadow-2xl shadow-accent/20 transition-all duration-500 hover:scale-105 active:scale-95"
              >
                <Link to="/">
                  <Home className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Gå till startsidan
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="rounded-full h-16 px-10 border-primary/10 bg-white/50 text-primary hover:bg-white hover:border-primary/20 text-lg font-bold backdrop-blur-sm transition-all duration-500 hover:scale-105 active:scale-95"
              >
                <Link to="#" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
                  <ArrowLeft className="mr-3 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  Gå tillbaka
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
