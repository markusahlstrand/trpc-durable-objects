import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import { Context, ContextFactory } from './context';

const t = initTRPC.context<Context>().create();

const publicProcedure = t.procedure;

const router = t.router;

export class Counter implements DurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request) {
    const contextFactory = new ContextFactory(this.state);

    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: doRouter,
      createContext: contextFactory.createContext.bind(this),
    });
  }
}

export const doRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const count: number = (await ctx.state.storage.get('count')) || 0;
      await ctx.state.storage.put('count', count + 1);
      return `hello ${input ?? 'counter'} ${count}`;
    }),
});

export type DoRouter = typeof doRouter;
