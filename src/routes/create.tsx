import { Show } from '@clerk/react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

import { GoBack } from '../components/go-back'

export const Route = createFileRoute('/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className={`flex flex-col justify-center w-full py-4 px-6 md:px-12`}>
      <Show when="signed-in">
        <Outlet />
      </Show>
      <Show when="signed-out">
        <div className={`flex justify-center items-center`}>
          <GoBack />
        </div>
      </Show>
    </div>
  )
}
