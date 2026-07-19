import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { TrustSection } from "@/components/sections/TrustSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { DisclaimerCard } from "@/components/ui/DisclaimerCard";
import { VisaTypesSection } from "@/components/sections/VisaTypesSection";
import { CountriesSection } from "@/components/sections/CountriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <VisaTypesSection />
      <CountriesSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
      <section id="about" className="section bg-surface">
        <div className="container-page">
          <DisclaimerCard />
        </div>
      </section>
      <ContactSection />
      <Footer />
    </main>
  );
}
