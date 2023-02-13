import { Router, Context } from 'cloudworker-router';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { DoRouter } from './Counter';
import { counter2Router } from './Counter2';
import createProxy from './createProxy';

export const Counter2 = createProxy(counter2Router);

export interface Env {
  COUNTER: DurableObjectNamespace;
  COUNTER2: DurableObjectNamespace;
}

const router = new Router<Env>();

router.get('/', async (ctx: Context<Env>) => {
  return new Response('Hello world');
});

router.get('/hey', async (ctx: Context<Env>) => {
  const url = 'http://localhost:8787/trpc';

  const stub = ctx.env.COUNTER.get(ctx.env.COUNTER.idFromName('test'));

  const proxy = createTRPCProxyClient<DoRouter>({
    links: [loggerLink(), httpBatchLink({ url, fetch: stub.fetch.bind(stub) })],
  });

  const body = await proxy.hello.query();

  return new Response(JSON.stringify(body));
});

router.get('/ho', async (ctx: Context<Env>) => {
  const url = 'http://localhost:8787/trpc';

  const stub = ctx.env.COUNTER2.get(ctx.env.COUNTER2.idFromName('test2'));

  const proxy = createTRPCProxyClient<typeof counter2Router>({
    links: [loggerLink(), httpBatchLink({ url, fetch: stub.fetch.bind(stub) })],
  });

  const proxy2 = Counter2.getInstance(ctx.env.COUNTER2, 'test');

  const body = await proxy.hi.query();

  return new Response(JSON.stringify(body));
});

export { Counter } from './Counter';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
