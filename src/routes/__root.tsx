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

  return (
    <>
      <div className={`min-h-screen bg-base-200 font-meno-banner`}>
        <div className="navbar h-30 bg-base-100 py-4 px-8">
          <div className="flex-1">
            <div className="font-royalty-free text-4xl">
              Four Eyed Butterfly
            </div>
          </div>
          <div className="flex gap-12 flex-none">
            <FadeInDiv delay={0}>
              <Link
                className="text-primary hover:text-info"
                to="/"
                activeProps={{ className: `font-extrabold` }}
              >
                Home
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval}>
              <Link
                className="text-primary hover:text-info"
                to="/about"
                activeProps={{ className: `font-extrabold` }}
              >
                About
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 2}>
              <div className="text-primary hover:text-info dropdown dropdown-center">
                <div tabIndex={0} className="cursor-pointer">
                  Posts
                </div>
                <ul
                  tabIndex={-1}
                  className="menu dropdown-content bg-base-300 rounded-box p-2 mt-3"
                >
                  <li>
                    <Link to="/posts/2025" className={`text-primary`}>
                      2025
                    </Link>
                  </li>
                  <li>
                    <Link to="/posts/2026" className={`text-primary`}>
                      2026
                    </Link>
                  </li>
                </ul>
              </div>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 5}>
              <Link
                className="text-secondary hover:text-info"
                to="/login"
                activeProps={{ className: `font-extrabold` }}
              >
                Login
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 6}>
              <Link
                className="text-secondary hover:text-info"
                to="/write"
                activeProps={{ className: `font-extrabold` }}
              >
                Write
              </Link>
            </FadeInDiv>
            <FadeInDiv delay={fadeInInterval * 7}>
              <Link className="text-secondary hover:text-info" to="/">
                Logout
              </Link>
            </FadeInDiv>
            {/* Theme toggle */}
            <FadeInDiv delay={fadeInInterval * 10}>
              <label className="swap text-primary hover:text-info">
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
                <Camera className="text-primary hover:text-info size-7" />
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
