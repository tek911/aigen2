import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { joinCampSchema, submitCampResourceSchema } from "@arena/shared";

export const campRouter = router({
  get: publicProcedure.input(z.object({ campId: z.string() })).query(async ({ ctx, input }) => {
    const camp = await ctx.prisma.camp.findUnique({
      where: { id: input.campId },
      include: {
        topic: true,
        members: {
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
          orderBy: {
            contributionScore: "desc",
          },
          take: 50,
        },
        resources: {
          orderBy: {
            upvotes: "desc",
          },
        },
        strategies: {
          orderBy: {
            effectiveness: "desc",
          },
        },
      },
    });

    if (!camp) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Camp not found" });
    }

    return camp;
  }),

  listByTopic: publicProcedure
    .input(z.object({ topicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const camps = await ctx.prisma.camp.findMany({
        where: { topicId: input.topicId },
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      return camps;
    }),

  join: protectedProcedure.input(joinCampSchema).mutation(async ({ ctx, input }) => {
    const camp = await ctx.prisma.camp.findUnique({
      where: { id: input.campId },
    });

    if (!camp) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Camp not found" });
    }

    // Check if already a member
    const existing = await ctx.prisma.campMember.findUnique({
      where: {
        userId_campId: {
          userId: ctx.user.id,
          campId: input.campId,
        },
      },
    });

    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "Already a member of this camp" });
    }

    await ctx.prisma.campMember.create({
      data: {
        userId: ctx.user.id,
        campId: input.campId,
      },
    });

    // Update camp member count
    await ctx.prisma.camp.update({
      where: { id: input.campId },
      data: {
        memberCount: { increment: 1 },
      },
    });

    return { success: true };
  }),

  leave: protectedProcedure
    .input(z.object({ campId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.campMember.findUnique({
        where: {
          userId_campId: {
            userId: ctx.user.id,
            campId: input.campId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Not a member of this camp" });
      }

      await ctx.prisma.campMember.delete({
        where: { id: membership.id },
      });

      // Update camp member count
      await ctx.prisma.camp.update({
        where: { id: input.campId },
        data: {
          memberCount: { decrement: 1 },
        },
      });

      return { success: true };
    }),

  submitResource: protectedProcedure
    .input(submitCampResourceSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member
      const membership = await ctx.prisma.campMember.findUnique({
        where: {
          userId_campId: {
            userId: ctx.user.id,
            campId: input.campId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a camp member to submit resources",
        });
      }

      const resource = await ctx.prisma.campResource.create({
        data: {
          campId: input.campId,
          title: input.title,
          url: input.url,
          description: input.description,
        },
      });

      // Update contribution score
      await ctx.prisma.campMember.update({
        where: { id: membership.id },
        data: {
          contributionScore: { increment: 10 },
        },
      });

      return resource;
    }),
});
