/* Home — Dark Governance design
   Assembles all sections in order */

import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import InstitutionalSection from "@/components/InstitutionalSection";
import GovernanceSection from "@/components/GovernanceSection";
import PublicationsSection from "@/components/PublicationsSection";
import AppsSection from "@/components/AppsSection";
import TalksSection from "@/components/TalksSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "oklch(0.11 0.012 255)",
        color: "oklch(0.91 0.008 65)",
      }}
    >
      <Navigation />
      <main>
        <HeroSection />
        <InstitutionalSection />
        <GovernanceSection />
        <PublicationsSection />
        <AppsSection />
        <TalksSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
