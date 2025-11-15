import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users, Zap } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Debate Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Debate Smarter,
            <br />
            Think Deeper
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Engage in structured debates with ELO rankings, AI moderation, and a community that
            rewards intellectual honesty and mind-changing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                Start Debating <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/debates">
              <Button size="lg" variant="outline">
                Watch Live Debates
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-lg bg-card border">
              <Trophy className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Ranked Competition</h3>
              <p className="text-sm text-muted-foreground">
                Climb the leaderboard with ELO-based rankings
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <Zap className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">AI Arbitration</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed feedback from advanced AI analysis
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <Users className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Respectful Community</h3>
              <p className="text-sm text-muted-foreground">
                Toxic content automatically filtered and moderated
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
