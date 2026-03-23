import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import prisma from "@/lib/db";
import { CredentialType } from "@/generated/prisma/enums";

export const credentialsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const credentials = await prisma.credentials.findMany({
        where: {
          userId: ctx.auth.user.id,
        },
      });
      return credentials;
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
