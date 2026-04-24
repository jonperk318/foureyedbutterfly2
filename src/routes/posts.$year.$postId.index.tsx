import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

import Image from "../components/image";
import { trpc } from "../router";
import { NoResultsFound } from "../components/ui/no-results-found";
import { dateToString } from "../utils/date-to-string";
import { Show } from "@clerk/react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useAtom } from "jotai";
import { writePostIdAtom } from "../lib/atoms";

export const Route = createFileRoute("/posts/$year/$postId/")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId)
      await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const [_, setWritePostId] = useAtom(writePostIdAtom);
  const postQuery = useQuery(trpc.getPost.queryOptions(postId));
  const navigate = useNavigate();

  if (!postQuery.data) return <NoResultsFound />;

  return (
    <div className={`flex flex-col gap-12 px-4 xs:px-8 sm:px-16 md:px-24 lg:px-48 py-16 max-w-6xl`}>
      <div className={`text-4xl/16 md:text-5xl/20 lg:text-6xl/24`}>{postQuery.data.post.title}</div>
      <div className={`text-4xl md:text-5xl lg:text-6xl font-royalty-free text-primary text-right pb-8`}>
        {dateToString(postQuery.data.post.createdAt)}
      </div>
      {postQuery.data.post.draft && (
        <div className={`badge badge-xl badge-info`}>DRAFT</div>
      )}
      {postQuery.data.content.map((block) => (
        <div key={block.id} className={`w-full`}>
          {(() => {
            switch (block.contentType) {
              case "image": {
                return (
                  <Image
                    src={`/posts/${block.data}`}
                    alt={block.data}
                    className={`w-full`}
                  />
                );
              }
              case "video": {
                return <div>Can't do this yet :/</div>;
              }
              case "text": {
                return (
                  <div
                    className={`ql-editor`}
                    dangerouslySetInnerHTML={{ __html: block.data }}
                  />
                );
              }
            }
          })()}
        </div>
      ))}
      {postQuery.data && (
        <div className={`flex flex-col md:flex-row gap-4 w-full justify-between items-center`}>
          {postQuery.data.nextPost ? (
            <Link
              to={`/posts/${new Date(postQuery.data.nextPost.createdAt).getFullYear()}/${postQuery.data.nextPost.id}`}
              className={`text-secondary`}
            >
              {postQuery.data.nextPost.title}
            </Link>
          ) : (
            <div></div>
          )}
            <Show when="signed-in">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 1.05 }}>
                <HiOutlinePencilAlt
                  className={`size-10 hover:cursor-pointer text-primary`}
                  onClick={() => {
                    setWritePostId(postId);
                    navigate({ to: "/create/write" })
                  }}
                />
              </motion.div>
            </Show>
          {postQuery.data.previousPost ? (
            <Link
              to={`/posts/${new Date(postQuery.data.previousPost.createdAt).getFullYear()}/${postQuery.data.previousPost.id}`}
              className={`text-secondary`}
            >
              {postQuery.data.previousPost.title}
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
}
