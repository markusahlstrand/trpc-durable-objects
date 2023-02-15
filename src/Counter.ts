import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;

const router = t.router;

export const counterRouter = router({
  up: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const count: number | undefined = await ctx.state.storage.get('count');
      const newCount = (count || 0) + 1;

      await ctx.state.storage.put('count', newCount);
      return `Count: ${newCount}`;
    }),
  down: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const count: number | undefined = await ctx.state.storage.get('count');
      const newCount = (count || 0) - 1;

      await ctx.state.storage.put('count', newCount);
      return `Count: ${newCount}`;
    }),
});

export type CounterRouter = typeof counterRouter;
