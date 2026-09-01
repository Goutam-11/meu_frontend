import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { exchangeKiteRequestToken, kiteLoginUrl } from "@/lib/kite";

const ITEMS_PER_PAGE = 5;

export const exchangeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.exchange.findMany({
      where: {
        userId: ctx.auth.user.id,
      },
    });
  }),
  getPaginated: protectedProcedure
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
        name: {
          contains: input.search.trim(),
          mode: "insensitive" as const,
        },
      };

      const [exchanges, totalCount] = await Promise.all([
        prisma.exchange.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: ITEMS_PER_PAGE,
        }),
        prisma.exchange.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      return {
        exchanges,
        pagination: {
          page: input.page,
          totalPages,
          totalCount,
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
        },
      };
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
  // Zerodha daily re-auth: exchange a login request_token for an access token
  kiteAuth: protectedProcedure
    .input(z.object({ id: z.string(), requestToken: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      return await exchangeKiteRequestToken(
        input.id,
        ctx.auth.user.id,
        input.requestToken.trim(),
      );
    }),
  kiteLoginUrl: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const exchange = await prisma.exchange.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
        select: { apiKey: true, name: true },
      });
      if (!exchange) return { loginUrl: null };
      return { loginUrl: kiteLoginUrl(exchange.apiKey ?? "") };
    }),
});
// export type definition of API
export type ExchangeRouter = typeof exchangeRouter;
