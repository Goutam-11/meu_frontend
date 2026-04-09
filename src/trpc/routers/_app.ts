import { exchangeRouter } from '@/features/exchange/server/router';
import { createTRPCRouter, protectedProcedure } from '../init';
import { agentsRouter } from '@/features/agents/server/router';
import { credentialsRouter } from '@/features/credentials/server/router';
import { notificationsRouter } from '@/features/notifications/server/router';
import z from 'zod';
import { getExchangeData } from '@/lib/config';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  exchange: exchangeRouter,
  credentials: credentialsRouter,
  notifications: notificationsRouter,
  exData: createTRPCRouter({
    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const data = await getExchangeData(input.id);
  
        return {
          ...data,
          hasError:
            data.positionsError ||
            data.tradesError ||
            data.balanceError,
        };
      }),
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;