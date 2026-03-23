import { z } from "zod";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { NotificationStatus } from "@/generated/prisma/enums";

export const notificationsRouter = createTRPCRouter({
  getAll: baseProcedure
    .query(async () => {
      const data = await prisma.notification.findMany();
      return data;
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
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.notification.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

    }),
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.notification.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          readAt: new Date(),
          status: NotificationStatus.READ
        },
      });
    }),
});
// export type definition of API
export type NotificationsRouter = typeof notificationsRouter;
