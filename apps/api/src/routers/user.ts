import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { updateProfileSchema } from "@arena/shared";

export const userRouter = router({
  getProfile: publicProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId || ctx.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User ID required" });
      }

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          eloRating: true,
          credibilityScore: true,
          level: true,
          xp: true,
          totalDebates: true,
          wins: true,
          losses: true,
          draws: true,
          mindChanges: true,
          debateStyle: true,
          currentStreak: true,
          longestStreak: true,
          createdAt: true,
          badges: {
            include: {
              badge: true,
            },
            where: {
              isEquipped: true,
            },
            take: 5,
          },
          achievements: {
            include: {
              achievement: true,
            },
            orderBy: {
              unlockedAt: "desc",
            },
            take: 10,
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        ...user,
        winRate: user.totalDebates > 0 ? (user.wins / user.totalDebates) * 100 : 0,
      };
    }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          username: true,
          bio: true,
          avatar: true,
        },
      });

      return user;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        eloRating: true,
        credibilityScore: true,
        totalDebates: true,
        wins: true,
        losses: true,
        draws: true,
        mindChanges: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Get rank
    const higherRatedUsers = await ctx.prisma.user.count({
      where: {
        eloRating: {
          gt: user.eloRating,
        },
      },
    });

    return {
      ...user,
      rank: higherRatedUsers + 1,
      winRate: user.totalDebates > 0 ? (user.wins / user.totalDebates) * 100 : 0,
    };
  }),

  getDebateHistory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        page: z.number().default(1),
        pageSize: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.pageSize;

      const [debates, total] = await Promise.all([
        ctx.prisma.debateParticipant.findMany({
          where: { userId: input.userId },
          include: {
            debate: {
              include: {
                topic: true,
                participants: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        username: true,
                        avatar: true,
                        eloRating: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: "desc",
          },
          skip,
          take: input.pageSize,
        }),
        ctx.prisma.debateParticipant.count({
          where: { userId: input.userId },
        }),
      ]);

      return {
        items: debates.map((p) => p.debate),
        total,
        page: input.page,
        pageSize: input.pageSize,
        hasMore: skip + debates.length < total,
      };
    }),

  getStances: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const stances = await ctx.prisma.userStance.findMany({
        where: { userId: input.userId },
        include: {
          topic: true,
        },
        orderBy: {
          changedAt: "desc",
        },
      });

      return stances;
    }),

  updateStance: protectedProcedure
    .input(
      z.object({
        topicId: z.string(),
        position: z.string(),
        confidence: z.number().min(1).max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if stance exists
      const existing = await ctx.prisma.userStance.findUnique({
        where: {
          userId_topicId: {
            userId: ctx.user.id,
            topicId: input.topicId,
          },
        },
      });

      const stance = await ctx.prisma.userStance.upsert({
        where: {
          userId_topicId: {
            userId: ctx.user.id,
            topicId: input.topicId,
          },
        },
        update: {
          position: input.position,
          confidence: input.confidence,
          previousPosition: existing?.position,
          changedAt: new Date(),
        },
        create: {
          userId: ctx.user.id,
          topicId: input.topicId,
          position: input.position,
          confidence: input.confidence,
        },
      });

      // Check if user changed their mind
      if (existing && existing.position !== input.position) {
        await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            mindChanges: { increment: 1 },
          },
        });
      }

      return stance;
    }),
});
