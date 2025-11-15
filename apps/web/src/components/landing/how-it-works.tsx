import { UserPlus, Search, MessageSquare, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up and set your initial stances on topics you care about.",
    },
    {
      icon: Search,
      title: "Find Debates",
      description: "Browse topics or get matched with opponents at your skill level.",
    },
    {
      icon: MessageSquare,
      title: "Engage & Debate",
      description: "Present arguments, cite sources, and respond to your opponent.",
    },
    {
      icon: Trophy,
      title: "Get Feedback",
      description: "Receive AI analysis, peer votes, and improve your skills.",
    },
  ];

  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes and begin your journey to becoming a better debater.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto left-0 right-0">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
