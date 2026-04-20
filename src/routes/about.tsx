import { createFileRoute } from "@tanstack/react-router";

import Image from "../components/image";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className={`relative flex items-center justify-center h-120 w-full`}>
        <div className={`absolute w-full overflow-hidden`}>
          <Image
            src="half-moon-bay.jpg"
            alt="Half Moon Bay"
            className={`w-full h-120 object-cover`}
          />
        </div>
        <div
          className={`absolute text-center max-w-lg bg-base-100/80 text-xl text-base-content p-8 rounded-box`}
        >
          <h2>
            &quot;I remembered that the real world was wide, and that a varied
            field of hopes and fears, of sensations and excitements, awaited
            those who had the courage to go fourth into its expanse, to seek
            real knowledge of life amidst its perils.&quot;
          </h2>
          <p className={`italic text-right pt-6 pr-16`}>&#8212; Jane Eyre</p>
        </div>
      </div>
      <div className={`flex flex-col items-center justify-center gap-4`}>
        <div className={`hero min-h-120`}>
          <div className={`hero-content flex-col lg:flex-row gap-16`}>
            <Image src="fish.jpeg" alt="Fish" className={`max-w-sm`} />
            <div>
              <h1 className={`text-5xl text-primary`}>
                The four-eyed butterfly
              </h1>
              <p className={`pt-6`}>This is a blurb</p>
            </div>
          </div>
        </div>
        <div className={`hero min-h-120 bg-base-200`}>
          <div className={`hero-content flex-col lg:flex-row-reverse gap-16`}>
            <Image src="bio-pic.jpg" alt="Bio Pic" />
            <div>
              <h1 className={`text-5xl text-primary`}>About the Author</h1>
              <p className={`pt-6 text-right`}>This is a blurb</p>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}
