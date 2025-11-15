import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTopicSchema, searchTopicsSchema } from "@arena/shared";
import { slugify } from "@arena/shared";

export const topicRouter = router({
  list: publicProcedure.input(searchTopicsSchema).query(async ({ ctx, input }) => {
    const skip = (input.page - 1) * input.pageSize;

    const where = input.category ? { category: input.category } : {};

    const orderBy =
      input.sortBy === "trending"
        ? { trendingScore: "desc" as const }
        : input.sortBy === "heat"
        ? { heat: "desc" as const }
        : input.sortBy === "recent"
        ? { createdAt: "desc" as const }
        : { title: "asc" as const };

    const [topics, total] = await Promise.all([
      ctx.prisma.topic.findMany({
        where,
        orderBy,
        skip,
        take: input.pageSize,
        include: {
          _count: {
            select: {
              debates: true,
              camps: true,
            },
          },
        },
      }),
      ctx.prisma.topic.count({ where }),
    ]);

    return {
      items: topics,
      total,
      page: input.page,
      pageSize: input.pageSize,
      hasMore: skip + topics.length < total,
    };
  }),

  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const topic = await ctx.prisma.topic.findUnique({
      where: { id: input.id },
      include: {
        camps: {
          include: {
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            debates: true,
            evidence: true,
          },
        },
      },
    });

    if (!topic) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
    }

    return topic;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const topic = await ctx.prisma.topic.findUnique({
        where: { slug: input.slug },
        include: {
          camps: {
            include: {
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
          _count: {
            select: {
              debates: true,
              evidence: true,
            },
          },
        },
      });

      if (!topic) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      }

      return topic;
    }),

  create: protectedProcedure.input(createTopicSchema).mutation(async ({ ctx, input }) => {
    const slug = slugify(input.title);

    // Check if topic already exists
    const existing = await ctx.prisma.topic.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "A topic with this title already exists",
      });
    }

    const topic = await ctx.prisma.topic.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        category: input.category,
      },
    });

    // Create default Pro and Con camps
    await Promise.all([
      ctx.prisma.camp.create({
        data: {
          topicId: topic.id,
          position: "Pro",
          description: `Supporting the pro position on ${topic.title}`,
        },
      }),
      ctx.prisma.camp.create({
        data: {
          topicId: topic.id,
          position: "Con",
          description: `Supporting the con position on ${topic.title}`,
        },
      }),
    ]);

    return topic;
  }),

  trending: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(
    async ({ ctx, input }) => {
      const topics = await ctx.prisma.topic.findMany({
        orderBy: {
          trendingScore: "desc",
        },
        take: input.limit,
        include: {
          _count: {
            select: {
              debates: true,
            },
          },
        },
      });

      return topics;
    }
  ),

  search: publicProcedure.input(z.object({ query: z.string() })).query(async ({ ctx, input }) => {
    const topics = await ctx.prisma.topic.findMany({
      where: {
        OR: [
          { title: { contains: input.query, mode: "insensitive" } },
          { description: { contains: input.query, mode: "insensitive" } },
        ],
      },
      take: 20,
      include: {
        _count: {
          select: {
            debates: true,
          },
        },
      },
    });

    return topics;
  }),
});
