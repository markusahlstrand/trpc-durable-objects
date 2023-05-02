import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory<Context = any> {
  state: DurableObjectState;
  context: Context;

  name?: string;

  constructor(state: DurableObjectState, context: Context, name?: string) {
    this.state = state;
    this.context = context;
    this.name = name;
  }

  createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    return { req, resHeaders, state: this.state, name: this.name };
  }
}

export type Context = {
  req: Request;
  resHeaders: Headers;
  state: DurableObjectState;
};
