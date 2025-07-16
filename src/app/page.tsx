import "@xyflow/react/dist/style.css";
import TemplatesSection from "./_components/homepage/TemplatesSection";
import DocumentationSection from "./_components/homepage/DocumentationSection";
import Footer from "./_components/homepage/Footer";
import CanvasPreviewSection from "./_components/homepage/CanvasPreviewSection";
import DemoVideoSection from "./_components/homepage/DemoVideoSection";
import FeaturesSection from "./_components/homepage/FeaturesSection";
import CTASection from "./_components/homepage/CTASection";
import HowItWorksSection from "./_components/homepage/HowItWorksSection";
import HeroSection from "./_components/homepage/HeroSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] bg-gradient-to-b text-[var(--foreground)]">
      {/* Hero Section */}
      <HeroSection />

      {/* Canvas Preview Section */}
      <CanvasPreviewSection />

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
