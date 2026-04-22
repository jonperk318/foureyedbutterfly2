import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/react";

import { routeTree } from "./routeTree.gen";
import type { AppRouter } from "./server/trpc";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      onError: (error: any) => {
        const message =
          error?.message ||
          error?.data?.message ||
          "An error occurred";
        toast.error(message);
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data === undefined) {
        toast.error(`Something went wrong: ${error.message}`);
      }
    },
  }),
});

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "/trpc",
        async headers() {
          if (!tokenGetter) {
            return {};
          }

          try {
            const token = await tokenGetter();
            return {
              Authorization: token ? `Bearer ${token}` : '',
            };
          } catch (error) {
            const message = `Failed to get token: ${error}`
            console.error(message);
            toast.error(message);
            return {};
          }
        },
      }),
    ],
  }),
  queryClient,
});

export function createRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: {
      trpc,
      queryClient,
    },
    defaultPendingComponent: () => (
      <div className={`p-2 text-2xl`}>
        <div className={`loading loading-spinner text-secondary`} />
      </div>
    ),
    Wrap: function WrapComponent({ children }) {
      const { getToken } = useAuth();
      setTokenGetter(getToken);

      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
