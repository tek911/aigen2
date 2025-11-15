"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock } from "lucide-react";
import Link from "next/link";

export function LiveDebates() {
  // Mock data
  const liveDebates = [
    {
      id: "1",
      topic: "Is AI a threat to humanity?",
      participants: ["alex_debater", "sam_philosopher"],
      viewers: 42,
      timeRemaining: "5:23",
    },
    {
      id: "2",
      topic: "Should healthcare be free?",
      participants: ["taylor_facts", "jordan_logic"],
      viewers: 31,
      timeRemaining: "12:45",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Live Debates</h2>
          <Link href="/debates">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveDebates.map((debate) => (
            <Card key={debate.id} className="border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      LIVE
                    </Badge>
                    <CardTitle className="text-xl">{debate.topic}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{debate.viewers} watching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{debate.timeRemaining}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {debate.participants.map((p) => (
                        <Badge key={p} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/debate/${debate.id}`}>
                      <Button size="sm">Watch Now</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
