import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDebateSchema, submitArgumentSchema, searchDebatesSchema } from "@arena/shared";
import { calculateEloChange } from "@arena/database";
import { ModerationService, ArgumentQualityService, DebateAnalyzerService } from "@arena/ai-service";

const moderationService = new ModerationService();
const argumentQualityService = new ArgumentQualityService();
const debateAnalyzerService = new DebateAnalyzerService();

export const debateRouter = router({
  list: publicProcedure.input(searchDebatesSchema).query(async ({ ctx, input }) => {
    const skip = (input.page - 1) * input.pageSize;

    const where: any = {};
    if (input.topicId) where.topicId = input.topicId;
    if (input.format) where.format = input.format;
    if (input.status) where.status = input.status;
    if (input.userId) {
      where.participants = {
        some: {
          userId: input.userId,
        },
      };
    }

    const [debates, total] = await Promise.all([
      ctx.prisma.debate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: input.pageSize,
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
          _count: {
            select: {
              arguments: true,
              votes: true,
            },
          },
        },
      }),
      ctx.prisma.debate.count({ where }),
    ]);

    return {
      items: debates,
      total,
      page: input.page,
      pageSize: input.pageSize,
      hasMore: skip + debates.length < total,
    };
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const debate = await ctx.prisma.debate.findUnique({
      where: { id: input.id },
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
                badges: {
                  where: { isEquipped: true },
                  include: { badge: true },
                  take: 3,
                },
              },
            },
          },
        },
        arguments: {
          orderBy: { turnNumber: "asc" },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            sources: true,
            reactions: true,
          },
        },
        votes: {
          include: {
            voter: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        aiAnalysis: true,
      },
    });

    if (!debate) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
    }

    return debate;
  }),

  create: protectedProcedure.input(createDebateSchema).mutation(async ({ ctx, input }) => {
    const topic = await ctx.prisma.topic.findUnique({
      where: { id: input.topicId },
    });

    if (!topic) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
    }

    // Determine debate settings based on format
    const settings = {
      LIGHTNING: { turnDuration: 30, maxTurns: 10 },
      STANDARD: { turnDuration: 120, maxTurns: 15 },
      DEEP_DIVE: { turnDuration: 86400, maxTurns: 14 },
      TEAM_BATTLE: { turnDuration: 180, maxTurns: 15 },
    };

    const config = settings[input.format];

    const debate = await ctx.prisma.debate.create({
      data: {
        topicId: input.topicId,
        format: input.format,
        status: "CHALLENGE_ISSUED",
        turnDuration: config.turnDuration,
        maxTurns: config.maxTurns,
        isPublic: input.isPublic,
        allowSpectators: input.allowSpectators,
        scheduledAt: input.scheduledAt,
        participants: {
          create: {
            userId: ctx.user.id,
            position: input.position,
            isReady: true,
          },
        },
      },
      include: {
        topic: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    return debate;
  }),

  join: protectedProcedure
    .input(
      z.object({
        debateId: z.string(),
        position: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const debate = await ctx.prisma.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
      }

      if (debate.status !== "CHALLENGE_ISSUED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate already in progress" });
      }

      if (debate.participants.length >= 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is full" });
      }

      // Add participant
      await ctx.prisma.debateParticipant.create({
        data: {
          debateId: input.debateId,
          userId: ctx.user.id,
          position: input.position,
          isReady: true,
        },
      });

      // Update debate status
      await ctx.prisma.debate.update({
        where: { id: input.debateId },
        data: {
          status: "ACCEPTED",
        },
      });

      return { success: true };
    }),

  submitArgument: protectedProcedure
    .input(submitArgumentSchema)
    .mutation(async ({ ctx, input }) => {
      const debate = await ctx.prisma.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
          arguments: {
            orderBy: { turnNumber: "desc" },
            take: 1,
          },
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
      }

      if (debate.status !== "ACTIVE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not active" });
      }

      // Check if user is a participant
      const participant = debate.participants.find((p) => p.userId === ctx.user.id);
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a participant" });
      }

      // Check toxicity
      const toxicityCheck = await moderationService.checkToxicity(input.content);
      if (toxicityCheck.isToxic) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your argument contains inappropriate content",
        });
      }

      // Analyze argument quality
      const quality = await argumentQualityService.analyzeArgument(
        input.content,
        participant.position
      );
      const fallacies = await argumentQualityService.detectFallacies(input.content);

      // Determine turn number
      const nextTurn = debate.arguments.length > 0 ? debate.arguments[0].turnNumber + 1 : 1;

      // Create argument
      const argument = await ctx.prisma.argument.create({
        data: {
          debateId: input.debateId,
          userId: ctx.user.id,
          content: input.content,
          turnNumber: nextTurn,
          qualityScore: quality.overall,
          toxicityScore: toxicityCheck.score,
          hasFallacies: fallacies.hasFallacies,
          fallacies: fallacies.fallacies.map((f) => f.type),
          sources: {
            create: input.sources?.map((s) => ({
              url: s.url,
              title: s.title,
            })),
          },
        },
        include: {
          sources: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Update participant stats
      await ctx.prisma.debateParticipant.update({
        where: { id: participant.id },
        data: {
          argumentCount: { increment: 1 },
          qualityScore: (participant.qualityScore * participant.argumentCount + quality.overall) / (participant.argumentCount + 1),
        },
      });

      return argument;
    }),

  completeDebate: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const debate = await ctx.prisma.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          arguments: {
            include: {
              sources: true,
            },
          },
          votes: true,
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Debate not found" });
      }

      if (debate.status !== "VOTING") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Debate is not in voting phase" });
      }

      // Determine winner by votes
      const voteCounts = new Map<string, number>();
      for (const vote of debate.votes) {
        if (vote.winnerId) {
          voteCounts.set(vote.winnerId, (voteCounts.get(vote.winnerId) || 0) + 1);
        }
      }

      let winnerId: string | null = null;
      let maxVotes = 0;

      for (const [userId, count] of voteCounts.entries()) {
        if (count > maxVotes) {
          maxVotes = count;
          winnerId = userId;
        }
      }

      // Update debate
      await ctx.prisma.debate.update({
        where: { id: input.debateId },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          winnerId,
          winMethod: "PEER_VOTE",
        },
      });

      // Update participant stats and ELO
      if (winnerId && debate.participants.length === 2) {
        const winner = debate.participants.find((p) => p.userId === winnerId);
        const loser = debate.participants.find((p) => p.userId !== winnerId);

        if (winner && loser) {
          const eloChange = calculateEloChange(
            winner.user.eloRating,
            loser.user.eloRating,
            1
          );

          await Promise.all([
            ctx.prisma.user.update({
              where: { id: winnerId },
              data: {
                wins: { increment: 1 },
                totalDebates: { increment: 1 },
                eloRating: { increment: eloChange },
              },
            }),
            ctx.prisma.user.update({
              where: { id: loser.userId },
              data: {
                losses: { increment: 1 },
                totalDebates: { increment: 1 },
                eloRating: { decrement: eloChange },
              },
            }),
          ]);
        }
      }

      // Generate AI analysis
      if (debate.participants.length === 2) {
        const [participant1, participant2] = debate.participants;

        const analysis = await debateAnalyzerService.analyzeDebate(
          debate.topic?.title || "Unknown topic",
          {
            userId: participant1.userId,
            username: participant1.user.username,
            position: participant1.position,
            arguments: debate.arguments
              .filter((a) => a.userId === participant1.userId)
              .map((a) => ({
                id: a.id,
                content: a.content,
                turnNumber: a.turnNumber,
                sources: a.sources.map((s) => ({ url: s.url, title: s.title || undefined })),
              })),
          },
          {
            userId: participant2.userId,
            username: participant2.user.username,
            position: participant2.position,
            arguments: debate.arguments
              .filter((a) => a.userId === participant2.userId)
              .map((a) => ({
                id: a.id,
                content: a.content,
                turnNumber: a.turnNumber,
                sources: a.sources.map((s) => ({ url: s.url, title: s.title || undefined })),
              })),
          }
        );

        await ctx.prisma.aIAnalysis.create({
          data: {
            debateId: input.debateId,
            summary: "AI-generated analysis",
            winnerId: analysis.winner.userId,
            confidence: analysis.winner.confidence,
            argumentStructure: analysis.scores,
            evidenceQuality: analysis.scores,
            rhetoricEffectiveness: analysis.scores,
            logicalConsistency: analysis.scores,
            commonGround: analysis.commonGround,
            keyDisagreements: analysis.keyDisagreements,
            suggestions: analysis.suggestions,
          },
        });
      }

      return { success: true, winnerId };
    }),

  startDebate: protectedProcedure
    .input(z.object({ debateId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const debate = await ctx.prisma.debate.findUnique({
        where: { id: input.debateId },
        include: {
          participants: true,
        },
      });

      if (!debate) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (debate.participants.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Need at least 2 participants" });
      }

      await ctx.prisma.debate.update({
        where: { id: input.debateId },
        data: {
          status: "ACTIVE",
          startedAt: new Date(),
        },
      });

      return { success: true };
    }),
});
