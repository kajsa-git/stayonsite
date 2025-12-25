
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import CityPage from "./pages/CityPage";
import ForHusagare from "./pages/ForHusagare";
import CorporateHousingSweden from "./pages/en/CorporateHousingSweden";
import ZakwaterowanieFirmowe from "./pages/pl/ZakwaterowanieFirmowe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('App component rendering');
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/stad/:citySlug" element={<CityPage />} />
              <Route path="/en/corporate-housing/:citySlug" element={<CityPage />} />
              <Route path="/pl/zakwaterowanie/:citySlug" element={<CityPage />} />
              <Route path="/for-husagare" element={<ForHusagare />} />
              <Route path="/en/corporate-housing-sweden" element={<CorporateHousingSweden />} />
              <Route path="/pl/zakwaterowanie-firmowe" element={<ZakwaterowanieFirmowe />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
