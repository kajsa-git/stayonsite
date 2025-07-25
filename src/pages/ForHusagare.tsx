import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import HomeownerHero from '@/components/homeowner/HomeownerHero';
import HomeownerBenefits from '@/components/homeowner/HomeownerBenefits';
import HomeownerProcess from '@/components/homeowner/HomeownerProcess';
import HomeownerTestimonials from '@/components/homeowner/HomeownerTestimonials';
import HomeownerFAQ from '@/components/homeowner/HomeownerFAQ';
import HomeownerForm from '@/components/homeowner/HomeownerForm';

const ForHusagare = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HomeownerHero />
        <HomeownerBenefits />
        <HomeownerProcess />
        <HomeownerTestimonials />
        <HomeownerFAQ />
        <HomeownerForm />
      </main>
      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default ForHusagare;