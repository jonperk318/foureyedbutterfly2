import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import Image from "../components/image";
import { trpc } from "../router";
import { Spinner } from "../components/spinner";

export const Route = createFileRoute("/posts/")({
  component: RouteComponent,
});

export const postYears = ["2024", "2025", "2026"]

function RouteComponent() {
  const firstImagesQuery = useQuery(trpc.getFirstImagesOfYears.queryOptions(postYears))
  const navigate = useNavigate();

  if (firstImagesQuery.isPending) return <Spinner/>

  return (
    <div className={`flex flex-col items-center justify-center gap-8 p-8`}>
      {firstImagesQuery.data && firstImagesQuery.data.map((yearData, i) => (
        <div className={`relative flex items-center justify-center h-120 w-full rounded-box outline-4 overflow-hidden`} key={yearData.year}>
          <motion.div className={`absolute w-full overflow-hidden rounded-box hover:cursor-pointer`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 1.05 }} onClick={() => navigate({ to: `/posts/${yearData.year}` })}>
            <Image
              src={yearData.image ? `/posts/${yearData.image}` : "fish.jpeg"}
              alt={yearData.year}
              className={`w-full h-120 object-cover rounded-box`}
            />
          </motion.div>
          <div
            className={`absolute flex items-center justify-center w-full h-full ${i % 2 === 0 ? "bg-primary/30" : "bg-secondary/30"} text-[400px] font-royalty-free rounded-box pointer-events-none`}
          >
            {yearData.year}
          </div>
        </div>
      ))}
    </div>
  );
}
