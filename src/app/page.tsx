import HeroSection from "./_components/homepage/HeroSection";
import DemoVideoSection from "./_components/homepage/DemoVideoSection";
import FeaturesSection from "./_components/homepage/FeaturesSection";
import HowItWorksSection from "./_components/homepage/HowItWorksSection";
import TemplatesSection from "./_components/homepage/TemplatesSection";
import DocumentationSection from "./_components/homepage/DocumentationSection";
import CTASection from "./_components/homepage/CTASection";
import Footer from "./_components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground min-h-screen bg-gradient-to-b">
      {/* Hero Section */}
      <HeroSection />

      {/* Demo Video Section */}
      <DemoVideoSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      <TemplatesSection />

      {/* Documentation Section */}
      <DocumentationSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
