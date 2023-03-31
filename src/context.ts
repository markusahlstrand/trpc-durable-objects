import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory {
  state: DurableObjectState;

  name?: string;

  constructor(state: DurableObjectState, name?: string) {
    this.state = state;
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
