import { createFileRoute } from "@tanstack/react-router";

import Image from "../components/image";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div className={`flex flex-col md:flex-row gap-8 p-12 h-max w-full items-center justify-around`}>
      <div className={`flex flex-col items-center justify-center text-xl lg:text-2xl`}>
        <div className={`text-7xl lg:text-8xl font-adorn-copperplate`}>Bashful</div>
        <div>-ruby m.</div>
      </div>
      <Image className={`w-80`} src="flowers.png" alt="Flowers" />
    </div>
  );
}
