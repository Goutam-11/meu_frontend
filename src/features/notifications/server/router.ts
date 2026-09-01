import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { NotificationStatus } from "@/generated/prisma/enums";
import {
  emitNotificationChange,
  getNotificationVersion,
  notificationIterator,
} from "@/lib/notification-events";

const ITEMS_PER_PAGE = 5;

export const notificationsRouter = createTRPCRouter({
  onUpdate: protectedProcedure.subscription(async function* (opts) {
    const iterator = notificationIterator(opts.signal);
    for (;;) {
      await iterator.next();
      yield { version: getNotificationVersion() };
    }
  }),
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * ITEMS_PER_PAGE;

      const where = {
        userId: ctx.auth.user.id,
        title: {
          contains: input.search.trim(),
          mode: "insensitive" as const,
        },
      };

      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: ITEMS_PER_PAGE,
        }),
        prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      return {
        notifications,
        pagination: {
          page: input.page,
          totalPages,
          totalCount,
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
        },
      };
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.notification.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const where = {
      userId: ctx.auth.user.id,
      status: NotificationStatus.UNREAD,
    };

    const [count, latest] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return { count, latest };
  }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await prisma.notification.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      emitNotificationChange(ctx.auth.user.id);
      return deleted;
    }),
  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await prisma.notification.updateMany({
      where: {
        userId: ctx.auth.user.id,
        status: NotificationStatus.UNREAD,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });
    if (result.count > 0) emitNotificationChange(ctx.auth.user.id);
    return { count: result.count };
  }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await prisma.notification.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          readAt: new Date(),
          status: NotificationStatus.READ
        },
      });
      emitNotificationChange(ctx.auth.user.id);
      return updated;
    }),
});
// export type definition of API
export type NotificationsRouter = typeof notificationsRouter;
