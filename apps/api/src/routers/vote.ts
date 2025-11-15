import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { submitVoteSchema } from "@arena/shared";
import { z } from "zod";

export const voteRouter = router({
  submit: protectedProcedure.input(submitVoteSchema).mutation(async ({ ctx, input }) => {
    const debate = await ctx.prisma.debate.findUnique({
      where: { id: input.debateId },
      include: {
        participants: true,
      },
    });

    if (!debate) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
    }

    if (debate.status !== "VOTING" && debate.status !== "COMPLETED") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Debate is not in voting phase",
      });
    }

    // Check if user already voted
    const existing = await ctx.prisma.vote.findUnique({
      where: {
        debateId_voterId: {
          debateId: input.debateId,
          voterId: ctx.user.id,
        },
      },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "You have already voted on this debate",
      });
    }

    // Create vote
    const vote = await ctx.prisma.vote.create({
      data: {
        debateId: input.debateId,
        voterId: ctx.user.id,
        winnerId: input.winnerId,
        bestArgument: input.bestArgumentId,
        bestSources: input.bestSourcesUserId,
        mostRespectful: input.mostRespectfulUserId,
        changedMyMind: input.changedMyMind,
        reasoning: input.reasoning,
      },
    });

    // Award XP for voting
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        xp: { increment: 5 },
      },
    });

    return vote;
  }),

  getResults: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const votes = await ctx.prisma.vote.findMany({
        where: { debateId: input.debateId },
        include: {
          voter: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Aggregate results
      const results = {
        totalVotes: votes.length,
        winnerVotes: new Map<string, number>(),
        bestArgumentVotes: new Map<string, number>(),
        bestSourcesVotes: new Map<string, number>(),
        mostRespectfulVotes: new Map<string, number>(),
        mindChanges: votes.filter((v) => v.changedMyMind).length,
      };

      for (const vote of votes) {
        if (vote.winnerId) {
          results.winnerVotes.set(
            vote.winnerId,
            (results.winnerVotes.get(vote.winnerId) || 0) + 1
          );
        }
        if (vote.bestArgument) {
          results.bestArgumentVotes.set(
            vote.bestArgument,
            (results.bestArgumentVotes.get(vote.bestArgument) || 0) + 1
          );
        }
        if (vote.bestSources) {
          results.bestSourcesVotes.set(
            vote.bestSources,
            (results.bestSourcesVotes.get(vote.bestSources) || 0) + 1
          );
        }
        if (vote.mostRespectful) {
          results.mostRespectfulVotes.set(
            vote.mostRespectful,
            (results.mostRespectfulVotes.get(vote.mostRespectful) || 0) + 1
          );
        }
      }

      return {
        ...results,
        winnerVotes: Object.fromEntries(results.winnerVotes),
        bestArgumentVotes: Object.fromEntries(results.bestArgumentVotes),
        bestSourcesVotes: Object.fromEntries(results.bestSourcesVotes),
        mostRespectfulVotes: Object.fromEntries(results.mostRespectfulVotes),
      };
    }),
});
