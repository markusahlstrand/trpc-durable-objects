import { Router, Context } from 'cloudworker-router';
import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import type { AppRouter } from './router';

export interface Env {
  COUNTER: DurableObjectNamespace;
}

const router = new Router<Env>();

router.get('/', async (ctx: Context<Env>) => {
  return new Response('Hello world');
});

router.get('/hey', async (ctx: Context<Env>) => {
  const url = 'http://127.0.0.1:8787/trpc';

  const stub = ctx.env.COUNTER.get(ctx.env.COUNTER.idFromName('test'));

  // globalThis.fetch = stub.fetch;

  // const proxy = createTRPCProxyClient<AppRouter>({
  //   links: [loggerLink(), httpBatchLink({ url })],
  // });

  // const response = await proxy.hello.query();

  const response = await stub.fetch('http://localhost:8787/trpc/hello');

  const body = await response.json();

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
