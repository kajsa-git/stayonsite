import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingPhoneButton from '@/components/FloatingPhoneButton';
import SEO from '@/components/SEO';
import DirectContact from '@/components/landing/DirectContact';
import InquiryForm from '@/components/InquiryForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Building2, FileCheck, Headphones, CheckCircle2, Star } from 'lucide-react';

const CorporateHousingSweden = () => {
  const { setLanguage } = useLanguage();

  // Set language to English when this page loads
  useEffect(() => {
    setLanguage('en');
  }, [setLanguage]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Corporate Housing Sweden',
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'StayOnSite',
      'telephone': '+46 76-249 84 86',
      'url': 'https://stayonsite.se'
    },
    'description': 'Fully furnished apartments for business teams across Sweden. Flexible terms, all-inclusive pricing. The professional Airbnb alternative.',
    'areaServed': {
      '@type': 'Country',
      'name': 'Sweden'
    },
    'serviceType': 'Corporate Housing',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.8',
      'reviewCount': '70'
    }
  };

  const faqData = [
    {
      question: "What is corporate housing?",
      answer: "Corporate housing refers to fully furnished apartments or houses rented by companies for their employees on temporary assignments. Unlike hotels, these provide a home-like environment with full kitchens, living spaces, and flexible lease terms - typically from 30 days to several months."
    },
    {
      question: "How is this different from Airbnb?",
      answer: "While Airbnb focuses on short-term tourist stays, corporate housing is designed for business needs: guaranteed availability, professional invoicing, dedicated account management, and apartments vetted for working professionals. We handle all paperwork and provide consistent quality across all properties."
    },
    {
      question: "What cities in Sweden do you cover?",
      answer: "We specialize in locations across Sweden including Umeå, Luleå, Boden, Gävle, Västerås, Örebro, Linköping, Norrköping, Säffle and many more. We can find accommodation wherever your project is located."
    },
    {
      question: "What's included in the price?",
      answer: "All-inclusive pricing covers: fully furnished apartments, utilities (electricity, water, heating), high-speed internet, cleaning, linens, and kitchen equipment. No hidden fees or surprise costs."
    },
    {
      question: "How quickly can you arrange accommodation?",
      answer: "We typically respond the same day and can have accommodation ready within 24-48 hours for urgent requests. For planned projects, we recommend booking 1-2 weeks in advance."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Corporate Housing Sweden | Airbnb Alternative for Business Teams"
        description="Looking for Airbnb for your business team in Sweden? We offer fully furnished apartments with professional invoicing, flexible 30+ day terms, and dedicated support. The smart Airbnb alternative."
        keywords="airbnb sweden business, airbnb alternative sweden, corporate housing sweden, furnished apartments sweden business, accommodation umeå, accommodation örebro, housing luleå, corporate housing norrland, airbnb gävle business, accommodation västerås company, housing linköping norrköping"
        canonical="https://stayonsite.se/en/corporate-housing-sweden"
        structuredData={[structuredData, faqSchema]}
      />

      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative isolate flex items-center min-h-[85vh] md:min-h-[800px] overflow-hidden pt-20 bg-primary">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-main.webp')" }}
          />

          <div className="absolute inset-0 z-10 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent" />
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-90" />

          <div className="container mx-auto px-6 md:px-12 relative z-20">
            <div className="max-w-[800px]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-block bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                  The Airbnb Alternative for Business
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white mb-6"
              >
                Corporate Housing Sweden
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-8 max-w-2xl"
              >
                Fully furnished apartments for your business team. Flexible terms, all-inclusive pricing, dedicated support. Available across Sweden.
              </motion.p>

              <DirectContact language="en" className="mb-10" />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-wrap gap-6 text-white/70"
              >
                {['30+ day flexible terms', 'All-inclusive pricing', 'Same day response'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-accent" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Personal Touch - Team */}
        <section className="py-12 bg-white border-b">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img src="/images/kajsa.webp" alt="Kajsa" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-lg font-semibold text-nordic-900">Meet Kajsa & Team</p>
                <p className="text-nordic-600">Your dedicated support team - we speak English!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Stats */}
        <section className="py-16 bg-nordic-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { value: '70+', label: 'Happy Clients' },
                { value: '500+', label: 'Accommodations' },
                { value: 'Same day', label: 'Response Time' },
                { value: '40+', label: 'Cities Covered' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <p className="text-sm text-nordic-600 uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
                How We Help Your Business
              </h2>
              <p className="text-lg text-nordic-600 max-w-2xl mx-auto">
                From finding the perfect accommodation to managing everything during the stay
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Building2,
                  title: 'Find & Book',
                  description: 'We search our network of 500+ verified properties to find the perfect match for your team\'s needs and budget.'
                },
                {
                  icon: FileCheck,
                  title: 'Handle Paperwork',
                  description: 'Professional invoicing, contracts, and documentation. Everything you need for corporate accounting.'
                },
                {
                  icon: Headphones,
                  title: 'Ongoing Support',
                  description: 'Dedicated account manager available via phone and WhatsApp. We solve problems fast so your team can focus on work.'
                }
              ].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                    <service.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-nordic-900 mb-3">{service.title}</h3>
                  <p className="text-nordic-600 leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-2xl md:text-3xl text-nordic-800 font-light italic mb-8 leading-relaxed">
                "StayOnSite made relocating our team to Sweden incredibly smooth. Professional service, great apartments, and they handled everything."
              </blockquote>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 bg-nordic-200 rounded-full overflow-hidden">
                  <img src="/images/mats-testimonial.webp" alt="Client" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-nordic-900">Project Manager</p>
                  <p className="text-sm text-nordic-600">International Construction Company</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-nordic-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold text-nordic-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-nordic-900 mb-3">{item.question}</h3>
                  <p className="text-nordic-600 leading-relaxed">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + Form */}
        <section className="py-20 bg-primary">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Find Housing for Your Team?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Contact us now - we typically respond the same day
              </p>
              <DirectContact language="en" className="justify-center mb-12" />
            </div>
          </div>
        </section>

        <InquiryForm />
      </main>

      <Footer />
      <FloatingPhoneButton />
    </div>
  );
};

export default CorporateHousingSweden;
