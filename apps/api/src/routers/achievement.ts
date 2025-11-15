import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const achievementRouter = router({
  listAll: publicProcedure.query(async ({ ctx }) => {
    const achievements = await ctx.prisma.achievement.findMany({
      orderBy: [{ tier: "asc" }, { name: "asc" }],
    });

    return achievements;
  }),

  getUserAchievements: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userAchievements = await ctx.prisma.userAchievement.findMany({
        where: { userId: input.userId },
        include: {
          achievement: true,
        },
        orderBy: {
          unlockedAt: "desc",
        },
      });

      return userAchievements;
    }),

  getProgress: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        wins: true,
        totalDebates: true,
        mindChanges: true,
        currentStreak: true,
        eloRating: true,
      },
    });

    if (!user) {
      return [];
    }

    const allAchievements = await ctx.prisma.achievement.findMany();
    const unlockedAchievements = await ctx.prisma.userAchievement.findMany({
      where: { userId: ctx.user.id },
      select: { achievementId: true },
    });

    const unlockedIds = new Set(unlockedAchievements.map((ua) => ua.achievementId));

    // Calculate progress for each achievement
    const progress = allAchievements.map((achievement) => {
      const isUnlocked = unlockedIds.has(achievement.id);
      let currentProgress = 0;

      const req = achievement.requirement as any;

      switch (req.type) {
        case "wins":
          currentProgress = user.wins;
          break;
        case "mind_changes":
          currentProgress = user.mindChanges;
          break;
        case "streak":
          currentProgress = user.currentStreak;
          break;
        case "elo":
          currentProgress = user.eloRating;
          break;
        case "debates":
          currentProgress = user.totalDebates;
          break;
        default:
          currentProgress = 0;
      }

      const percentage = isUnlocked
        ? 100
        : Math.min((currentProgress / req.count) * 100, 100);

      return {
        achievement,
        isUnlocked,
        progress: percentage,
        current: currentProgress,
        required: req.count,
      };
    });

    return progress;
  }),

  listBadges: publicProcedure.query(async ({ ctx }) => {
    const badges = await ctx.prisma.badge.findMany({
      orderBy: { rarity: "asc" },
    });

    return badges;
  }),

  getUserBadges: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userBadges = await ctx.prisma.userBadge.findMany({
        where: { userId: input.userId },
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: "desc",
        },
      });

      return userBadges;
    }),

  equipBadge: protectedProcedure
    .input(z.object({ badgeId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Unequip all other badges
      await ctx.prisma.userBadge.updateMany({
        where: {
          userId: ctx.user.id,
          isEquipped: true,
        },
        data: {
          isEquipped: false,
        },
      });

      // Equip this badge
      await ctx.prisma.userBadge.updateMany({
        where: {
          userId: ctx.user.id,
          badgeId: input.badgeId,
        },
        data: {
          isEquipped: true,
        },
      });

      return { success: true };
    }),
});
