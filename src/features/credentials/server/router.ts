import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { CredentialType } from "@/generated/prisma/enums";

const ITEMS_PER_PAGE = 5;

export const credentialsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * ITEMS_PER_PAGE;

      const matchedTypes = Object.values(CredentialType).filter((type) =>
        type.toLowerCase().includes(input.search.trim().toLowerCase())
      );

      const where = {
        userId: ctx.auth.user.id,
        type: { in: matchedTypes },
      };

      const [credentials, totalCount] = await Promise.all([
        prisma.credentials.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: ITEMS_PER_PAGE,
        }),
        prisma.credentials.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

      return {
        credentials,
        pagination: {
          page: input.page,
          totalPages,
          totalCount,
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
        },
      };
    }),
  listAll: protectedProcedure.query(async ({ ctx }) => {
    return prisma.credentials.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),
  getByType: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType) }))
    .query(async ({ ctx, input }) => {
      const credentials = await prisma.credentials.findMany({
        where: {
          userId: ctx.auth.user.id,
          type: input.type,
        },
      });
      return credentials;
    }),
  create: protectedProcedure
    .input(z.object({ type: z.enum(CredentialType), apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const credentials = await prisma.credentials.create({
        data: {
          type: input.type,
          userId: ctx.auth.user.id,
          apiKey: input.apiKey,
        },
      });
      return credentials;
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credentials = await prisma.credentials.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      return credentials;
    }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), type: z.enum(CredentialType), apiKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const credentials = await prisma.credentials.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: {
          type: input.type,
          apiKey: input.apiKey,
        },
      });
      return credentials;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const credentials = await prisma.credentials.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
      return credentials;
    }),
});
// export type definition of API
export type CredentialsRouter = typeof credentialsRouter;
