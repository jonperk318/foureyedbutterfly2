import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/react";

import { routeTree } from "./routeTree.gen";
import type { AppRouter } from "./server/trpc";
import { Spinner } from "./components/ui/spinner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      onError: (error: any) => {
        const message =
          error?.message || error?.data?.message || "An error occurred";
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
          try {
            let token: string | null = null;
            
            // Try primary: tokenGetter set by Wrap component (most reliable)
            if (tokenGetter) {
              token = await tokenGetter();
            }
            
            // Fallback: use Clerk's client API
            if (!token) {
              const clerkClient = (window as any).Clerk;
              if (clerkClient?.session) {
                token = await clerkClient.session.getToken();
              }
            }
            
            // Final fallback: try __clerk internal API
            if (!token) {
              token = await (window as any).__clerk?.session?.getToken?.();
            }
            
            if (token) {
              return {
                Authorization: `Bearer ${token}`,
              };
            }
          } catch (error) {
            console.warn("Failed to get auth token:", error);
          }
          return {};
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
    defaultPendingComponent: () => <Spinner />,
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
