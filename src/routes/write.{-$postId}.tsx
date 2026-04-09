import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IoAdd, IoImage, IoVideocam, IoDocumentText } from "react-icons/io5";
import { Show } from "@clerk/react";

import { trpc } from "../router";
import { postText, postImages } from "../server/schema";
import { GoBack } from "../components/go-back";
import { Upload } from "../components/upload";

export const Route = createFileRoute("/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId) await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

type PostText = Omit<typeof postText.$inferSelect, "id" | "postId">
type PostImage = Omit<typeof postImages.$inferSelect, "id" | "postId">
export type PostContent = (PostText | PostImage)[]

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;

  const [postContent, setPostContent] = useState<PostContent>(postQuery?.data ? postQuery.data.content : []);

  const NewBlock = () => {
    return (
      <div className={`divider divider-primary w-full`}>
        <div className={`dropdown dropdown-hover dropdown-center`}>
          <div tabIndex={0} role="button" className={`btn btn-circle btn-soft ring-2 btn-secondary hover:btn-accent`}>
            <IoAdd className={`size-20`} />
          </div>
          <ul tabIndex={-1} className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-32 shadow mt-2`}>
            <li onClick={() => setPostContent(prev => [...prev, {index: 0, slug: ""}])}><a><IoImage className={`size-7`} /> Image</a></li>
            <li><a><IoVideocam className={`size-7`} /> Video</a></li>
            <li><a><IoDocumentText className={`size-7`} /> Text</a></li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col w-full py-4 px-12`}>
      <Show when="signed-in">
        <NewBlock />
        {postContent.map((block) => {
          return (
            <>
              <div className={``}>
                {"slug" in block ? (
                  <>
                    <Upload setContent={setPostContent} index={block.index} />
                    <div>{block.slug}</div>
                  </>
                ) : (
                  <div>{block.content}</div>
                )}
              </div>
              <NewBlock />
            </>
          )
        })}
      </Show>
      <Show when="signed-out">
        <GoBack />
      </Show>
    </div>
  )
}
