import { router, publicProcedure } from "../trpc";
import { leaderboardSchema } from "@arena/shared";

export const leaderboardRouter = router({
  get: publicProcedure.input(leaderboardSchema).query(async ({ ctx, input }) => {
    // For simplicity, just query users by ELO
    // In production, this would use the Leaderboard table with proper period tracking
    const users = await ctx.prisma.user.findMany({
      orderBy: { eloRating: "desc" },
      take: input.limit,
      select: {
        id: true,
        username: true,
        avatar: true,
        eloRating: true,
        credibilityScore: true,
        wins: true,
        losses: true,
        totalDebates: true,
        badges: {
          where: { isEquipped: true },
          include: { badge: true },
          take: 3,
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      score: user.eloRating,
      change: 0, // Would need historical data
      stats: {
        wins: user.wins,
        losses: user.losses,
        totalDebates: user.totalDebates,
        winRate: user.totalDebates > 0 ? (user.wins / user.totalDebates) * 100 : 0,
        credibilityScore: user.credibilityScore,
      },
      badges: user.badges.map((ub) => ub.badge.code),
    }));
  }),

  getByTopic: publicProcedure
    .input(leaderboardSchema.extend({ topicId: z => z.string() }))
    .query(async ({ ctx, input }) => {
      // Get users who have debated this topic, ranked by performance
      const participants = await ctx.prisma.debateParticipant.findMany({
        where: {
          debate: {
            topicId: input.topicId,
            status: "COMPLETED",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              eloRating: true,
            },
          },
          debate: {
            select: {
              winnerId: true,
            },
          },
        },
      });

      // Aggregate stats by user
      const userStats = new Map<
        string,
        {
          user: any;
          wins: number;
          total: number;
        }
      >();

      for (const participant of participants) {
        const existing = userStats.get(participant.userId);
        const isWin = participant.debate.winnerId === participant.userId;

        if (existing) {
          existing.total++;
          if (isWin) existing.wins++;
        } else {
          userStats.set(participant.userId, {
            user: participant.user,
            wins: isWin ? 1 : 0,
            total: 1,
          });
        }
      }

      // Convert to array and sort by win rate
      const leaderboard = Array.from(userStats.values())
        .map((stats) => ({
          ...stats.user,
          wins: stats.wins,
          total: stats.total,
          winRate: (stats.wins / stats.total) * 100,
        }))
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, input.limit);

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.id,
        username: entry.username,
        avatar: entry.avatar,
        score: entry.winRate,
        change: 0,
        stats: {
          wins: entry.wins,
          total: entry.total,
          winRate: entry.winRate,
        },
      }));
    }),
});
