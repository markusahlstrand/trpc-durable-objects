import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    return { req, resHeaders, state: this.state };
  }
}

export type Context = {
  req: Request;
  resHeaders: Headers;
  state: DurableObjectState;
};
