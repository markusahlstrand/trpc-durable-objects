import { Router, Context } from 'cloudworker-router';

export interface Env {
  DUMMY_VAR: string;
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

const router = new Router<Env>();

router.get('/', async (ctx: Context<Env>) => {
  return new Response('Hello world');
});

router.get('/env', async (ctx: Context<Env>) => {
  return new Response(ctx.env.DUMMY_VAR);
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
