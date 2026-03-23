import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";

export const exchangeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.exchange.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        apiKey: z.string(),
        secret: z.string(),
        sandbox: z.boolean(),
        urls: z.object({
          public: z.string(),
          private: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.exchange.create({
        data: {
          userId: ctx.auth.user.id,
          name: input.name,
          apiKey: input.apiKey,
          secret: input.secret,
          sandbox: input.sandbox,
          urls: {
            public: input.urls.public,
            private: input.urls.private,
          },
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.exchange.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        apiKey: z.string(),
        secret: z.string(),
        sandbox: z.boolean(),
        urls: z.object({
          public: z.string(),
          private: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.exchange.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          name: input.name,
          apiKey: input.apiKey,
          secret: input.secret,
          sandbox: input.sandbox,
          urls: {
            public: input.urls.public,
            private: input.urls.private,
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.exchange.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
});
// export type definition of API
export type ExchangeRouter = typeof exchangeRouter;
