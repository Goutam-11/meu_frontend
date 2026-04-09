import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { AgentType, CredentialType, Status } from "@/generated/prisma/enums";
import { TRPCError } from "@trpc/server";

const ITEMS_PER_PAGE = 5;

export const agentsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * ITEMS_PER_PAGE;

      // Get paginated data
      const [agents, totalCount] = await Promise.all([prisma.agent.findMany({
        where: {
          userId: ctx.auth.user.id,
          name: {
            contains: input.search,
            mode: "insensitive", // case-insensitive
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: ITEMS_PER_PAGE,
      }),
        prisma.agent.count({
          where: {
            userId: ctx.auth.user.id,
          }
      })]);

      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      return {
        agents,
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
    return await prisma.agent.findUnique({
      where: {
        id: input.id,
        userId: ctx.auth.user.id,
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        llmModel: z.optional(z.string().min(2).max(100)),
        credentialId: z.optional(z.string()),
        exchangeId: z.string(),
        type: z.enum(AgentType),
        temperature: z.optional(z.number().min(0).max(1)),
        market: z.object({
          symbols: z.array(z.string().min(2).max(100)),
          agentCycles: z.number().min(1),
        }),
        risk: z.object({
          maxRiskPerTradePct: z.number().min(2).max(100),
          maxDailyLossPct: z.number().min(2).max(100),
          maxOpenPositions: z.number().min(2).max(100),
        }),
        capital: z.object({
          allocated: z.number().min(2).max(100),
          currency: z.string().min(2).max(100),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
  
      return await prisma.agent.create({
        data: {
          name: input.name, 
          type: input.type,
          credentialId: input.credentialId,
          exchangeId: input.exchangeId,
          temperature: input.temperature,
          market: {
            symbols: input.market.symbols,
            agentCycles: input.market.agentCycles,
          },
          risk: {
            maxRiskPerTradePct: input.risk.maxRiskPerTradePct,
            maxDailyLossPct: input.risk.maxDailyLossPct,
            maxOpenPositions: input.risk.maxOpenPositions,
          },
          capital: {
            allocated: input.capital.allocated,
            currency: input.capital.currency,
          },
          llmModel: input.llmModel,
          userId: ctx.auth.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.agent.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),
  statusChange: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(Status) }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.agent.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          status: input.status,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(100),
        llmModel: z.optional(z.string().min(2).max(100)),
        credentialId: z.optional(z.string().min(2).max(100)),
        type: z.enum(AgentType),
        temperature: z.optional(z.number().min(0).max(1)),
        exchangeId: z.string().min(2).max(100),
        market: z.object({
          symbols: z.array(z.string().min(2).max(100)),
          agentCycles: z.number().min(1),
        }),
        risk: z.object({
          maxRiskPerTradePct: z.number().min(2).max(100),
          maxDailyLossPct: z.number().min(2).max(100),
          maxOpenPositions: z.number().min(2).max(100),
        }),
        capital: z.object({
          allocated: z.number().min(2).max(100),
          currency: z.string().min(2).max(100),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
     
      return await prisma.agent.update({
        where: { id: input.id },
        data: {
          name: input.name, 
          type: input.type,
          credentialId: input.credentialId,
          temperature: input.temperature,
          exchangeId: input.exchangeId,
          market: {
            symbols: input.market.symbols,
            agentCycles: input.market.agentCycles,
          },
          risk: {
            maxRiskPerTradePct: input.risk.maxRiskPerTradePct,
            maxDailyLossPct: input.risk.maxDailyLossPct,
            maxOpenPositions: input.risk.maxOpenPositions,
          },
          capital: {
            allocated: input.capital.allocated,
            currency: input.capital.currency,
          },
          llmModel: input.llmModel,
          userId: ctx.auth.user.id,
        },
      });
    }),
  runs: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.agentRuns.findMany({
        where: {
          agentId: input.agentId,
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
// export type definition of API
export type AgentRouter = typeof agentsRouter;
