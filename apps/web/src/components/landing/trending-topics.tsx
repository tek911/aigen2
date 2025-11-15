"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

export function TrendingTopics() {
  // Mock data - would come from tRPC in real implementation
  const topics = [
    { id: "1", title: "Should AI be regulated?", category: "Technology", debates: 156 },
    { id: "2", title: "Is remote work the future?", category: "Culture", debates: 89 },
    { id: "3", title: "Climate change solutions", category: "Environment", debates: 234 },
    { id: "4", title: "Universal basic income", category: "Economics", debates: 127 },
  ];

  return (
    <section className="py-16 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold">Trending Topics</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {topic.category}
                  </Badge>
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{topic.debates} active debates</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
