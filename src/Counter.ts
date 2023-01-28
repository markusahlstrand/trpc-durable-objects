import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from './context';
import { appRouter } from './router';

export class Counter implements DurableObject {
  state: DurableObjectState;
  count: number = 0;

  constructor(state: DurableObjectState) {
    this.state = state;

    this.state.blockConcurrencyWhile(async () => {
      const count = await this.state.storage.get<number>('count');

      this.count = count || 0;
    });
  }

  async fetch(request: Request) {
    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext,
    });
  }
}
