import { LandingHero } from "@/components/landing/hero";
import { TrendingTopics } from "@/components/landing/trending-topics";
import { LiveDebates } from "@/components/landing/live-debates";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <LandingHero />
        <LiveDebates />
        <TrendingTopics />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
