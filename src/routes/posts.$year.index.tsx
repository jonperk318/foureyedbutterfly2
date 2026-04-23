import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

import Image from "../components/image";
import { trpc } from "../router";
import { Spinner } from "../components/spinner";

export const Route = createFileRoute("/posts/$year/")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { year } }) => {
    if (year)
      await queryClient.ensureQueryData(trpc.getPostsByYear.queryOptions({ year }));
  },
});

function RouteComponent() {
  const year = Route.useParams({ select: (d) => d.year });
  const postsQuery = useQuery(trpc.getPostsByYear.queryOptions({ year }))
  const navigate = useNavigate();

  if (postsQuery.isPending) return <Spinner/>

  return (
    <div className={`flex flex-col items-center justify-center gap-8 py-8 px-24`}>
      {postsQuery.data && postsQuery.data.map((postData, i) => (
          <div className={`hero h-80 bg-base-200 rounded-box outline-4 hover:cursor-pointer`} onClick={() => navigate({ to: `/posts/${year}/${postData.post.id}` })} key={postData.post.title}>
            <motion.div className={`hero-content flex-col lg:flex-row gap-16`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 1.05 }}>
              {i % 2 === 0 && <Image src={postData?.firstImage?.data ? `/posts/${postData.firstImage.data}` : "fish.jpeg"} alt={postData.post.title} className={`max-w-lg`} />}
              <div>
                <h1 className={`text-5xl text-primary`}>
                  {postData.post.title}
                </h1>
                {postData.post.createdAt && <p className={`pt-6`}>{new Date(postData.post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
              </div>
              {i % 2 !== 0 && <Image src={postData?.firstImage?.data ? `/posts/${postData.firstImage.data}` : "fish.jpeg"} alt={postData.post.title} className={`max-w-lg`} />}
            </motion.div>
          </div>
      ))}
    </div>
  );
}
