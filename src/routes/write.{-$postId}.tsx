import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IoAdd, IoImage, IoVideocam, IoDocumentText } from "react-icons/io5";

import { trpc } from "../router";
import { postText, postImages } from "../server/schema";

export const Route = createFileRoute("/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId) await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;

  const [postContent, setPostContent] = useState<(typeof postText.$inferSelect | typeof postImages.$inferSelect)[]>(postQuery?.data ? postQuery.data.content : []);

  const NewBlock = () => {
    return (
      <div className={`divider divider-primary w-full`}>
        <div className={`dropdown dropdown-hover dropdown-center`}>
          <div tabIndex={0} role="button" className={`btn btn-circle btn-soft ring-2 btn-secondary hover:btn-accent`}>
            <IoAdd className={`size-20`} />
          </div>
          <ul tabIndex={-1} className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-32 shadow mt-2`}>
            <li><a><IoImage className={`size-7`} /> Image</a></li>
            <li><a><IoVideocam className={`size-7`} /> Video</a></li>
            <li><a><IoDocumentText className={`size-7`} /> Text</a></li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex w-full py-4 px-12`}>
      <NewBlock />
      {postContent.map((block) => {
        return (
          <>
            <div className={``}>
              {"slug" in block ? (
                <div>{block.slug}</div>
              ) : (
                <div>{block.content}</div>
              )}
            </div>
            <NewBlock />
          </>
        )
      })}
    </div>
  )
}
