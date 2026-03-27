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
import { Sun, Moon, Camera } from "lucide-react";

import type { AppRouter } from "../server/trpc";
import { useTheme } from "../utils/theme-context";
import FadeInDiv from "../components/fade-in-div";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => <div className="loading-spinner"></div>,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });
  const { isLight, toggleIsLight } = useTheme();

  const fadeInInterval = 0.05;
  const activeProps = {
    className: `font-meno-banner-bold`
  }

  return (
    <>
      <div className={`min-h-screen bg-base-100 font-meno-banner`}>
        <div className="navbar h-30 bg-base-200 py-4 px-8 shadow-lg">
          <div className="flex-1">
            <div className="font-royalty-free text-4xl">
              Four Eyed Butterfly
            </div>
          </div>
          <div className="flex gap-12 flex-none">
            <FadeInDiv delay={0}>
              <Link
                className="text-primary hover:text-accent"
                to="/"
                activeProps={activeProps}
              >
                Home
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval}>
              <Link
                className="text-primary hover:text-accent"
                to="/about"
                activeProps={activeProps}
              >
                About
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 2}>
              <div className="text-primary hover:text-accent dropdown dropdown-hover dropdown-center">
                <div tabIndex={0} role="button" className="cursor-pointer mb-2">Posts</div>
                <ul
                  tabIndex={-1}
                  className="dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-20 shadow"
                >
                  <li>
                    <Link to="/posts/2025" className={`text-primary`} activeProps={activeProps}>
                      2025
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts/2026" className={`text-primary`} activeProps={activeProps}>
                      2026
                    </Link>
                  </li>
                </ul>
              </div>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 5}>
              <Link
                className="text-secondary hover:text-accent"
                to="/login"
                activeProps={activeProps}
              >
                Login
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 6}>
              <Link
                className="text-secondary hover:text-accent"
                to="/write"
                activeProps={activeProps}
              >
                Write
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 7}>
              <Link className="text-secondary hover:text-accent" to="/">
                Logout
              </Link>
            </FadeInDiv>
            {/* Theme toggle */}
            <FadeInDiv delay={fadeInInterval * 10}>
              <label className="swap hover:text-accent">
                <input
                  type="checkbox"
                  className="theme-controller"
                  value="valentine"
                  checked={isLight}
                  onClick={toggleIsLight}
                  readOnly
                />
                <Sun className="swap-on size-7" />
                <Moon className="swap-off size-7" />
              </label>
            </FadeInDiv>
            {/* Instagram */}
            <FadeInDiv delay={fadeInInterval * 11}>
              <a
                href="https://instagram.com/rubymaghoney/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Camera className="hover:text-accent size-7" />
              </a>
            </FadeInDiv>
          </div>
        </div>
        {isFetching ? <div className="loading-spinner"></div> : <Outlet />}
      </div>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
