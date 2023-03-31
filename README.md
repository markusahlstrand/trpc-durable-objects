# TRPC Durable Objects

After playing around with Durable Objects for a while I realized that this conceptually really is an RPC setup, you create a stub and want to interact with a remote object. I had a look at [itty-durable](https://github.com/kwhitley/itty-durable) which is a cool solution, but it doesn't provide strict typing. A few weeks ago I bumped into the [TRPC](https://trpc.io/) framework that seems to be the perfect solution for doing typesafe RPC.

This package provides a factory for creating both the strictly typed stub and server for a durable object using a TRPC-router.

## Installation

```bash
npm install trpc-durable-objects --save
```

## Usage

The first step is to create a TRPC router:

```
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from '../../src/context';

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
```

The router will be executed within a durable object but the types are exposed so the stub or proxy will be strictly typed.

The router is then passed to the factory method:

```javascript
import { CounterRouter, counterRouter } from './Counter';
import { createProxy } from 'trpc-durable-object';

export const Counter = createProxy<CounterRouter>(counterRouter);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const counter = Counter.getInstanceByName(env.COUNTER, 'dummy-id');

    // increase the counter value
    const body = await counter.up.query();

    ...
  },
};
```

The factory method will return a proxy that can be used to interact with the durable object. The proxy will be strictly typed and will provide a stub that can be used to interact with the durable object.

The getInstanceByName is slightly slower than the getInstance method as it needs to look up in which instance the durable object is located. It is also possible to work with the DurableObjectId's directly which is faster:

```javascript
import { CounterRouter, counterRouter } from './Counter';
import { createProxy } from 'trpc-durable-object';

export const Counter = createProxy<CounterRouter>(counterRouter);

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const id = env.Counter.newUniqueId();
    const counter = Counter.getInstance(env.COUNTER, id);

    // increase the counter value
    const body = await counter.up.query();

    ...
  },
};
```

### Using alarms

It's possible to pass a second parameter to the createProxy factory method that will be executed once an alarm is triggered within the durable object instance:

```
async function counterAlarm(state: DurableObjectState) {
  const count: number | undefined = await state.storage.get('count');

  console.log(`alarm with counter: ${count}`);
}

export const Counter = createProxy<CounterRouter>(counterRouter, counterAlarm);

```
