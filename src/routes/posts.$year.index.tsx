import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuth } from "@clerk/react";

import Image from "../components/image";
import { trpc } from "../router";
import { NoResultsFound } from "../components/ui/no-results-found";
import { dateToString } from "../utils/date-to-string";

export const Route = createFileRoute("/posts/$year/")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { year } }) => {
    if (year)
      await queryClient.ensureQueryData(
        trpc.getPostsByYear.queryOptions({ year }),
      );
  },
});

function RouteComponent() {
  const year = Route.useParams({ select: (d) => d.year });
  const postsQuery = useQuery(trpc.getPostsByYear.queryOptions({ year }));
  const navigate = useNavigate();
  const { userId } = useAuth();

  if (!postsQuery.data || postsQuery.data?.length === 0)
    return <NoResultsFound />;

  return (
    <div className={`flex flex-col items-center justify-center gap-8 py-8`}>
      {postsQuery.data &&
        postsQuery.data
          .filter((postData) => !postData.post.draft || userId)
          .map((postData, i) => (
            <div
              className={`hero h-120 lg:h-80 ${i % 2 === 0 ? "bg-base-300" : "bg-base-200"} hover:cursor-pointer`}
              onClick={() =>
                navigate({ to: `/posts/${year}/${postData.post.id}` })
              }
              key={postData.post.title}
            >
              <motion.div
                className={`hero-content flex-col lg:flex-row gap-16`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1.05 }}
              >
                {i % 2 === 0 && (
                  <Image
                    src={
                      postData?.firstImage?.data
                        ? `/posts/${postData.firstImage.data}`
                        : "fish.jpeg"
                    }
                    alt={postData.post.title}
                    className={`max-w-xl min-w-sm`}
                  />
                )}
                <div className={`flex flex-col gap-8 text-4xl`}>
                  <h1 className={`text-primary`}>{postData.post.title}</h1>
                  <span className={`font-royalty-free`}>
                    {dateToString(postData.post.createdAt)}
                  </span>
                  {postData.post.draft && (
                    <div className={`badge badge-lg badge-info`}>DRAFT</div>
                  )}
                </div>
                {i % 2 !== 0 && (
                  <Image
                    src={
                      postData?.firstImage?.data
                        ? `/posts/${postData.firstImage.data}`
                        : "fish.jpeg"
                    }
                    alt={postData.post.title}
                    className={`max-w-lg`}
                  />
                )}
              </motion.div>
            </div>
          ))}
    </div>
  );
}
