import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export Prisma types for use across the app
export * from "@prisma/client";

// Utility function to calculate ELO
export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  result: number, // 1 for win, 0.5 for draw, 0 for loss
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  return Math.round(kFactor * (result - expectedScore));
}

// Calculate XP for level
export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

// Get level from XP
export function getLevelFromXp(xp: number): number {
  let level = 1;
  while (xp >= getXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

// Calculate credibility score
export function calculateCredibilityScore(
  wins: number,
  losses: number,
  sourcesUsed: number,
  factChecksPassed: number,
  toxicityViolations: number
): number {
  const winRate = wins / Math.max(1, wins + losses);
  const sourceBonus = Math.min(sourcesUsed / 100, 0.2);
  const factCheckBonus = Math.min(factChecksPassed / 50, 0.2);
  const toxicityPenalty = Math.min(toxicityViolations / 10, 0.3);

  const score = 50 + (winRate * 30) + (sourceBonus * 50) + (factCheckBonus * 50) - (toxicityPenalty * 50);
  return Math.max(0, Math.min(100, score));
}

// Topic heat calculation
export function calculateTopicHeat(
  recentDebates: number,
  activeDebates: number,
  views: number,
  recencyWeight: number = 0.5
): number {
  const debateScore = (recentDebates * 2) + activeDebates;
  const viewScore = views / 100;
  return (debateScore * recencyWeight) + (viewScore * (1 - recencyWeight));
}

// Debate quality metrics
export interface DebateQualityMetrics {
  argumentDiversity: number;
  sourceCredibility: number;
  rhetoricalQuality: number;
  logicalConsistency: number;
  overallScore: number;
}

export function aggregateQualityMetrics(
  arguments: Array<{
    qualityScore: number | null;
    toxicityScore: number | null;
    hasFallacies: boolean;
  }>
): number {
  if (arguments.length === 0) return 0;

  const avgQuality =
    arguments.reduce((sum, arg) => sum + (arg.qualityScore || 0), 0) / arguments.length;
  const avgToxicity =
    arguments.reduce((sum, arg) => sum + (arg.toxicityScore || 0), 0) / arguments.length;
  const fallacyPenalty = arguments.filter((arg) => arg.hasFallacies).length / arguments.length;

  return Math.max(0, Math.min(100, avgQuality - avgToxicity * 20 - fallacyPenalty * 15));
}
