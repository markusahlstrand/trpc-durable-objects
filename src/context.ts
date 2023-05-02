import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory<Env = any> {
  state: DurableObjectState;

  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  createContext({ req, resHeaders }: FetchCreateContextFnOptions) {
    return { req, resHeaders, state: this.state, env: this.env };
  }
}

export type Context = {
  req: Request;
  resHeaders: Headers;
  state: DurableObjectState;
  env: any;
};
