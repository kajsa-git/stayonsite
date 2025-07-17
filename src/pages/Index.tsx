
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import CityLinks from '@/components/CityLinks';
import References from '@/components/References';
import FAQ from '@/components/FAQ';
import InquiryForm from '@/components/InquiryForm';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <Services />
          <CityLinks />
          <References />
          <FAQ />
          <InquiryForm />
        </main>
        <Footer />
      </div>
  );
};

export default Index;
