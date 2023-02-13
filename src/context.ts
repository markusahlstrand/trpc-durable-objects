import { inferAsyncReturnType } from '@trpc/server';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    console.log('create context: ' + typeof this.state);

    const user = { name: req.headers.get('username') ?? 'anonymous' };
    return { req, resHeaders, state: this.state };
  }
}

export type Context = {
  req: Request;
  resHeaders: Headers;
  state: DurableObjectState;
};
