import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import {
  AnyRootConfig,
  AnyRouter,
  DefaultDataTransformer,
  DefaultErrorShape,
  initTRPC,
  RootConfig,
  Router,
} from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { AnyRouterDef, CreateRouterInner } from '@trpc/server/dist/core/router';
import { Context, ContextFactory } from './context';

const t = initTRPC.context<Context>().create();

export default function createProxy(router: AnyRouter) {
  return class DOProxy implements DurableObject {
    state: DurableObjectState;

    constructor(state: DurableObjectState) {
      this.state = state;
    }

    static getInstance<
      TRouter extends Router<AnyRouterDef<AnyRootConfig, any>>,
    >(namespace: DurableObjectNamespace, name: string) {
      const stub = namespace.get(namespace.idFromName(name));

      const proxy = createTRPCProxyClient<TRouter>({
        links: [
          loggerLink(),
          httpBatchLink({
            url: 'http://localhost:8787/trpc',
            fetch: stub.fetch.bind(stub),
          }),
        ],
      });

      return proxy;
    }

    async fetch(request: Request) {
      const contextFactory = new ContextFactory(this.state);

      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: router,
        createContext: contextFactory.createContext.bind(this),
      });
    }
  };
}
