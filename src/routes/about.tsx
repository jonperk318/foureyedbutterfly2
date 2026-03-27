import { createFileRoute } from '@tanstack/react-router'

import Image from "../components/image";

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className={`hero h-110`} style={{ backgroundImage: "url(https://ik.imagekit.io/jayandsparrow/half-moon-bay.jpg?updatedAt=1770565626111)"}}>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-lg bg-base-100/75 text-xl text-neutral p-8 rounded-box">
            <h1>
              &quot;I remembered that the real world was wide, and that a varied
              field of hopes and fears, of sensations and excitements, awaited
              those who had the courage to go fourth into its expanse, to seek
              real knowledge of life amidst its perils.&quot;
            </h1>
            <p className='italic text-right pt-6 pr-16'>&#8212; Jane Eyre</p>
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-center gap-4`}>
        <Image src='fish.jpeg' alt='Fish' />
        <div>
        </div>
        <Image src='bio-pic.jpg' alt='Bio Pic' />
      </div>
    </>
  )
}
