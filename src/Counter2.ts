import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;

const router = t.router;

export const counter2Router = router({
  hi: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const count: number = (await ctx.state.storage.get('count')) || 0;
      await ctx.state.storage.put('count', count + 1);
      return `hola ${input ?? 'counter 2'} ${count}`;
    }),
});
