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
import { IoMoon, IoSunny } from "react-icons/io5";
import { RiInstagramFill } from "react-icons/ri";
import { Show, useAuth, UserButton } from "@clerk/react";

import type { AppRouter } from "../server/trpc";
import { darkModeAtom } from "../utils/atoms";
import FadeInDiv from "../components/fade-in-div";
import { useAtom } from "jotai/react";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => <div className={`loading-spinner`}></div>,
});

function RootComponent() {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const isFetching = useRouterState({ select: (s) => s.isLoading });
  const { isSignedIn } = useAuth();

  const fadeInInterval = 0.05;
  const activeProps = {
    className: `font-meno-banner-bold`,
  };

  return (
    <>
      <div className={`min-h-screen bg-base-100 font-meno-banner`}>
        <div className={`navbar h-30 bg-base-200 py-4 px-8 shadow-lg z-20`}>
          <div className={`navbar-start`}>
            <div className={`font-royalty-free text-4xl`}>
              Four Eyed Butterfly
            </div>
          </div>
          <div className={`navbar-end flex gap-12 flex-none items-center`}>
            <FadeInDiv initialDelay={0}>
              <Link
                className={`text-primary hover:text-accent`}
                to="/"
                activeProps={activeProps}
              >
                Home
              </Link>
            </FadeInDiv>
            <FadeInDiv initialDelay={fadeInInterval}>
              <Link
                className={`text-primary hover:text-accent`}
                to="/about"
                activeProps={activeProps}
              >
                About
              </Link>
            </FadeInDiv>
            <FadeInDiv initialDelay={fadeInInterval * 2}>
              <div
                className={`text-primary hover:text-accent dropdown dropdown-hover dropdown-center`}
              >
                <div role="button" className={`cursor-pointer`}>
                  <Link to="/posts" activeProps={activeProps}>
                    Posts
                  </Link>
                </div>
                <ul
                  tabIndex={-1}
                  className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-20 shadow`}
                >
                  <li>
                    <Link
                      to="/posts/2025"
                      className={`text-primary`}
                      activeProps={activeProps}
                    >
                      2025
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/posts/2026"
                      className={`text-primary`}
                      activeProps={activeProps}
                    >
                      2026
                    </Link>
                  </li>
                </ul>
              </div>
            </FadeInDiv>
            {isSignedIn ? (
              <FadeInDiv initialDelay={fadeInInterval * 6}>
                <Link
                  className={`text-secondary hover:text-accent`}
                  to="/write"
                  activeProps={activeProps}
                >
                  Write
                </Link>
              </FadeInDiv>
            ) : (
              <FadeInDiv initialDelay={fadeInInterval * 6}>
                <Link
                  className={`text-secondary hover:text-accent`}
                  to="/login"
                  activeProps={activeProps}
                >
                  Login
                </Link>
              </FadeInDiv>
            )}
            {/* Theme toggle */}
            <FadeInDiv initialDelay={fadeInInterval * 10}>
              <label className={`swap hover:text-accent`}>
                <input
                  type="checkbox"
                  className={`theme-controller`}
                  value="valentine"
                  checked={darkMode}
                  onClick={() => setDarkMode(!darkMode)}
                  readOnly
                />
                <IoSunny className={`swap-on size-7`} />
                <IoMoon className={`swap-off size-7`} />
              </label>
            </FadeInDiv>
            {/* Instagram */}
            <FadeInDiv initialDelay={fadeInInterval * 11}>
              <a
                href="https://instagram.com/rubymaghoney/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <RiInstagramFill className={`hover:text-accent size-7`} />
              </a>
            </FadeInDiv>
            <Show when="signed-in">
              <FadeInDiv>
                <UserButton />
              </FadeInDiv>
            </Show>
          </div>
        </div>
        {isFetching ? <div className={`loading-spinner`}></div> : <Outlet />}
      </div>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
