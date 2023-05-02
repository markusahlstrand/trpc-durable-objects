import { Router, Context } from 'cloudworker-router';
import { Counter } from './Counter';
import { Env } from './env';

export { Counter };

const router = new Router<Env>();

router.get('/', async (ctx: Context<Env>) => {
  const id = ctx.env.COUNTER.newUniqueId();

  const counter = Counter.getInstance(ctx.env.COUNTER, id);
  const body = await counter.echo.query();
  return new Response('Test variable: ' + body);
});

router.post('/', async (ctx: Context<Env>) => {
  const id = ctx.env.COUNTER.newUniqueId();

  const counter = Counter.getInstance(ctx.env.COUNTER, id);
  const body = await counter.up.mutate();
  return new Response('Hello world');
});

router.get('/:id/up', async (ctx: Context<Env>) => {
  const counter = Counter.getInstanceByName(ctx.env.COUNTER, ctx.params.id);

  const body = await counter.up.mutate();

  return new Response(JSON.stringify(body));
});

router.get('/:id/down', async (ctx: Context<Env>) => {
  const counter = Counter.getInstanceByName(ctx.env.COUNTER, ctx.params.id);

  const body = await counter.down.mutate();

  return new Response(JSON.stringify(body));
});

router.get('/:id/trigger', async (ctx: Context<Env>) => {
  const counter = Counter.getInstanceByName(ctx.env.COUNTER, ctx.params.id);

  await counter.triggerAlarm.query();

  return new Response('triggered alarm');
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
