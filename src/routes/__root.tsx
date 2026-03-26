import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { QueryClient } from "@tanstack/react-query";
import { Sun, Moon } from "lucide-react";

import type { AppRouter } from "../server/trpc";
import { useTheme } from "../utils/theme-context";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => (<div className="loading-spinner"></div>),
});

type NavigationItem = {
  name: string;
  to?: string;
  color: string;
}

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });
  const { isLight, toggleIsLight } = useTheme();

  const navigation = [
    { name: "Home", to: "/", color: "text-primary", },
    { name: "About", to: "/about", color: "text-primary", },
    { name: "Posts", to: "/posts", color: "text-primary", },
    { name: "Login", to: "/login", color: "text-secondary", },
    { name: "Logout", color: "text-secondary", },
    { name: "Write", to: "/write", color: "text-secondary", },
  ].filter(Boolean) as NavigationItem[];

  return (
    <>
      <div className={`min-h-screen bg-base-300`}>
        <div className="navbar bg-base-100 p-4">
          <div className="flex-1">
            <div className="font-royalty-free text-4xl">Four Eyed Butterfly</div>
          </div>
          <div className="flex gap-8 flex-none">
            {
              navigation.map(elm => (
                <div key={elm.name} className={`${elm.color}`}>
                  {elm.name}
                </div>
              ))
            }
            { /* Theme toggle */ }
            <label className="swap swap-rotate text-primary">
              <input type="checkbox" className="theme-controller" value="valentine" checked={isLight} onClick={toggleIsLight} readOnly/>
              <Sun className="swap-off" />
              <Moon className="swap-on" />
            </label>
          </div>
        </div>
        {isFetching ? (
          <div className="loading-spinner"></div>
        ) : (
          <Outlet/>
        )}
      </div>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
