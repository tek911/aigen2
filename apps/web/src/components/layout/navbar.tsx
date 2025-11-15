"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          Arena
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/topics" className="text-sm font-medium hover:text-primary transition-colors">
            Topics
          </Link>
          <Link href="/debates" className="text-sm font-medium hover:text-primary transition-colors">
            Debates
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            Leaderboard
          </Link>

          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Profile
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
