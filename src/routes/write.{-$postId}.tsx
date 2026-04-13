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
    if (postId)
      await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

type PostText = Omit<typeof postText.$inferSelect, "id" | "postId">;
type PostImage = Omit<typeof postImages.$inferSelect, "id" | "postId">;
export type PostContent = (PostText | PostImage)[];

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;

  const [postContent, setPostContent] = useState<PostContent>(
    postQuery?.data ? postQuery.data.content : [],
  );

  const NewBlock = () => {
    return (
      <div className={`divider divider-primary w-full mb-24`}>
        <div className={`dropdown dropdown-hover dropdown-center`}>
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-circle btn-soft ring-2 btn-secondary hover:btn-accent`}
          >
            <IoAdd className={`size-20`} />
          </div>
          <ul
            tabIndex={-1}
            className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-32 shadow mt-2`}
          >
            <li
              onClick={() =>
                setPostContent((prev) => [...prev, { index: 0, slug: "" }])
              }
            >
              <a>
                <IoImage className={`size-7`} /> Image
              </a>
            </li>
            <li>
              <a>
                <IoVideocam className={`size-7`} /> Video
              </a>
            </li>
            <li>
              <a>
                <IoDocumentText className={`size-7`} /> Text
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col w-full py-4 px-12`}>
      <Show when="signed-in">
        <div className={`bg-base-300 mb-10 mt-4 rounded-box shadow`}>
          <Upload />
        </div>
        <NewBlock />
        {postContent.map((block) => {
          return (
            <div key={block.index}>
              <div className={`flex`}>
                {"slug" in block ? (
                  <div className={``}>
                    <div>{block.slug}</div>
                  </div>
                ) : (
                  <div>{block.content}</div>
                )}
              </div>
              <NewBlock />
            </div>
          );
        })}
      </Show>
      <Show when="signed-out">
        <GoBack />
      </Show>
    </div>
  );
}
