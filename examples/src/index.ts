import { Router, Context } from 'cloudworker-router';
import { CounterRouter, counterRouter, counterAlarm } from './Counter';
import { createProxy } from '../../src';

// @ts-ignore
export const Counter = createProxy<CounterRouter, Context>(
  counterRouter,
  counterAlarm,
);

export interface Env {
  COUNTER: DurableObjectNamespace;
}

const router = new Router<Env>();

router.get('/', async (ctx: Context<Env>) => {
  return new Response('Hello world');
});

router.post('/', async (ctx: Context<Env>) => {
  const id = ctx.env.COUNTER.newUniqueId();

  const counter = Counter.getInstance(ctx.env.COUNTER, id);
  const body = await counter.up.query();
  return new Response('Hello world');
});

router.get('/:id/up', async (ctx: Context<Env>) => {
  const counter = Counter.getInstanceByName(ctx.env.COUNTER, ctx.params.id);

  const body = await counter.up.query();

  return new Response(JSON.stringify(body));
});

router.get('/:id/down', async (ctx: Context<Env>) => {
  const counter = Counter.getInstanceByName(ctx.env.COUNTER, ctx.params.id);

  const body = await counter.down.query();

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
