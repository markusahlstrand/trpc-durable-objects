import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export class ContextFactory<Env = any> {
  state: DurableObjectState;
  env: Env;

  name?: string;

  constructor(state: DurableObjectState, env: Env, name?: string) {
    this.state = state;
    this.env = env;
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
  env: any;
};
