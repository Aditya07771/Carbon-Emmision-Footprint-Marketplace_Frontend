import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyAlgorandSection from "@/components/WhyAlgorandSection";
import ForNGOsSection from "@/components/ForNGOsSection";
import ExplorerSection from "@/components/ExplorerSection";
import MarketSection from "@/components/MarketSection";
import OnboardingCTA from "@/components/OnboardingCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <WhyAlgorandSection />
      <ForNGOsSection />
      <ExplorerSection />
      <MarketSection />
      <OnboardingCTA />
      <Footer />
    </main>
  );
};

export default Index;
