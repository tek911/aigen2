import { router, protectedProcedure } from "../trpc";
import { z } from "zod";

export const notificationRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id,
      };

      if (input.unreadOnly) {
        where.isRead = false;
      }

      const notifications = await ctx.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      return notifications;
    }),

  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.notification.update({
        where: {
          id: input.notificationId,
          userId: ctx.user.id,
        },
        data: {
          isRead: true,
        },
      });

      return { success: true };
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.notification.updateMany({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.notification.count({
      where: {
        userId: ctx.user.id,
        isRead: false,
      },
    });

    return { count };
  }),
});
