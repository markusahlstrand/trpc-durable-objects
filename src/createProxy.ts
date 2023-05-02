import {
  CreateTRPCClientOptions,
  createTRPCProxyClient,
  httpBatchLink,
  loggerLink,
} from '@trpc/client';
import { FetchEsque } from '@trpc/client/dist/internals/types';
import { AnyRootConfig, AnyRouter, initTRPC, Router } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { AnyRouterDef } from '@trpc/server/dist/core/router';
import { Context, ContextFactory } from './context';

const t = initTRPC.context<Context>().create();

export { AnyRootConfig, AnyRouter, Router };

export function createProxy<
  TRouter extends Router<AnyRouterDef<AnyRootConfig, any>>,
  Context = any,
>(router: AnyRouter, alarm?: (state: DurableObjectState) => Promise<void>) {
  return class DOProxy implements DurableObject {
    state: DurableObjectState;

    context: Context;

    constructor(state: DurableObjectState, context: Context) {
      this.state = state;
      this.context = context;
    }

    static getFactory(namespace: DurableObjectNamespace) {
      return {
        getInstanceByName: (name: string) =>
          this.getInstanceByName(namespace, name),
        getInstanceById: (id: string) => this.getInstanceById(namespace, id),
        getInstance: (id: DurableObjectId) => this.getInstance(namespace, id),
      };
    }

    static getInstanceByName(namespace: DurableObjectNamespace, name: string) {
      const durableObjectId = namespace.idFromName(name);

      return DOProxy.getInstance(namespace, durableObjectId);
    }

    static getInstanceById(namespace: DurableObjectNamespace, id: string) {
      const durableObjectId = namespace.idFromString(id);

      return DOProxy.getInstance(namespace, durableObjectId);
    }

    static getInstance(namespace: DurableObjectNamespace, id: DurableObjectId) {
      const stub = namespace.get(id);

      const proxy = createTRPCProxyClient<TRouter>({
        links: [
          loggerLink(),
          httpBatchLink({
            url: 'http://localhost:8787/trpc',
            fetch: stub.fetch.bind(stub) as unknown as FetchEsque,
          }),
        ],
      } as CreateTRPCClientOptions<TRouter>);

      return proxy;
    }

    async alarm() {
      if (alarm) {
        await alarm(this.state);
      }
    }

    async fetch(request: Request) {
      const contextFactory = new ContextFactory(this.state, this.context);

      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: router,
        createContext: contextFactory.createContext.bind(this),
      });
    }
  };
}
