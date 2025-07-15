"use client";

import "@xyflow/react/dist/style.css";
import TemplatesSection from "./_components/HomePage/TemplatesSection";
import DocumentationSection from "./_components/HomePage/DocumentationSection";
import Footer from "./_components/HomePage/Footer";
import CanvasPreviewSection from "./_components/HomePage/CanvasPreviewSection";
import DemoVideoSection from "./_components/HomePage/DemoVideoSection";
import FeaturesSection from "./_components/HomePage/FeaturesSection";
import CTASection from "./_components/HomePage/CTASection";
import HowItWorksSection from "./_components/HomePage/HowItWorksSection";
import HeroSection from "./_components/HomePage/HeroSection";

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
