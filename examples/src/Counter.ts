import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from '../../src/context';
import { createProxy } from '../../src';
import { Env } from './env';

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
  triggerAlarm: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      console.log('alarm triggered');
      ctx.state.storage.setAlarm(Date.now() + 5000);
    }),
});

export async function counterAlarm(state: DurableObjectState) {
  const count: number | undefined = await state.storage.get('count');

  console.log(`alarm with counter: ${count}`);
}

export type CounterRouter = typeof counterRouter;

// @ts-ignore
export const Counter = createProxy<CounterRouter, Env>(
  counterRouter,
  counterAlarm,
);
