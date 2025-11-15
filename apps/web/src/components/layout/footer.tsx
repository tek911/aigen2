import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Arena</h3>
            <p className="text-sm text-muted-foreground">
              Competitive debate platform with AI arbitration. Elevate discourse through structured
              debate.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/topics" className="text-muted-foreground hover:text-primary">
                  Browse Topics
                </Link>
              </li>
              <li>
                <Link href="/debates" className="text-muted-foreground hover:text-primary">
                  Active Debates
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-primary">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/guidelines" className="text-muted-foreground hover:text-primary">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Arena Debate Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
