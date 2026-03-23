import { exchangeRouter } from '@/features/exchange/server/router';
import { createTRPCRouter } from '../init';
import { agentsRouter } from '@/features/agents/server/router';
import { credentialsRouter } from '@/features/credentials/server/router';
import { notificationsRouter } from '@/features/notifications/server/router';
export const appRouter = createTRPCRouter({
  agents: agentsRouter,
  exchange: exchangeRouter,
  credentials: credentialsRouter,
  notifications: notificationsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;