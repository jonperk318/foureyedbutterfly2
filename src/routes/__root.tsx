import {
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { QueryClient } from "@tanstack/react-query";

import type { AppRouter } from "../server/trpc";
import { Spinner } from "../components/ui/spinner";
import { IoMenu } from "react-icons/io5";
import { Navbar } from "../components/navbar";
import { NavbarMobile } from "../components/navbar-mobile";

export interface RouterAppContext {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  pendingComponent: () => <Spinner />,
});

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  return (
    <>
      <div className={`min-h-screen bg-base-100 font-meno-banner max-lg:collapse`}>
        <input id="navbar-1-toggle" className="peer hidden" type="checkbox" />
        <label htmlFor="navbar-1-toggle" className="fixed inset-0 hidden max-lg:peer-checked:block"></label>
        <div className={`collapse-title navbar h-30 bg-base-200 py-4 px-8 shadow-lg z-20`}>
          <div className={`navbar-start`}>
            <div className={`font-royalty-free text-3xl sm:text-4xl`}>
              Four Eyed Butterfly
            </div>
          </div>
          <div className={`navbar-end hidden lg:flex gap-12 flex-none items-center`}>
            <Navbar />
          </div>
          <div className={`navbar-end lg:hidden`}>
            <div className={`dropdown`}>
              <label htmlFor="navbar-1-toggle" className="btn btn-lg btn-ghost lg:hidden">
                <IoMenu className={`size-12`} />
              </label>
            </div>
          </div>
        </div>
        <div className="collapse-content lg:hidden z-1 bg-base-300 shadow-lg">
          <ul className="menu menu-xl flex flex-col gap-4 justify-center items-center w-full">
            <NavbarMobile />
          </ul>
        </div>
        {isFetching ? <div className={`loading-spinner`}></div> : <Outlet />}
      </div>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
