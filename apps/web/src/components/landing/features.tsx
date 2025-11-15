import { Brain, Target, Trophy, MessageSquare, Shield, TrendingUp } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Get detailed feedback on argument quality, fallacies, and rhetoric from Claude AI.",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Debate opponents at your skill level with ELO-based matchmaking.",
    },
    {
      icon: Trophy,
      title: "Achievements & Badges",
      description: "Unlock rewards for participation, quality arguments, and mind-changing moments.",
    },
    {
      icon: MessageSquare,
      title: "Multiple Formats",
      description: "Choose from Lightning, Standard, Deep Dive, or Team Battle debate formats.",
    },
    {
      icon: Shield,
      title: "Toxicity Protection",
      description: "Real-time moderation filters toxic content while preserving passionate debate.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Watch your credibility score, ELO rating, and skills improve over time.",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Arena?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've built the most advanced platform for structured, respectful, and rewarding debates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
