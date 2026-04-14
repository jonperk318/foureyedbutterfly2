import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IoAdd, IoImage, IoVideocam, IoDocumentText } from "react-icons/io5";

import { trpc } from "../router";
import { postContent } from "../server/schema";
import { SelectMedia } from "../components/select-media";

export const Route = createFileRoute("/create/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId)
      await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

export type PostContent = Omit<typeof postContent.$inferSelect, "id" | "postId">[]

type NewBlockProps = {
  index: number
}

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;

  const [content, setContent] = useState<PostContent>(
    postQuery?.data ? postQuery.data.content : [],
  );

  const NewBlock = ({index}: NewBlockProps) => {
    return (
      <div className={`divider divider-primary w-full`}>
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
            className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-32 shadow`}
          >
            <li
              onClick={() =>
                setContent((prev) => [...prev.slice(0, index), { contentType: "image", data: "" }, ...prev.slice(index)])
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

  console.log(content)

  return (
    <>
      <NewBlock index={0} />
      {content.map((block, i) => {
        return (
          <div key={`${i} ${block.data}`}>
            <div className={`flex`}>
              {block.contentType === "image" ? (
                <div className={`flex flex-col place-items-center gap-4 pb-2`}>
                  <div className={`bg-base-200 rounded-box shadow h-100 overflow-y-auto`}>
                    <SelectMedia mediaType="image" index={i} content={content} setContent={setContent} />
                  </div>
                  <div className={`badge ${block.data === "" ? "badge-warning" : "badge-accent"} badge-xl p-4`}>{block.data === "" ? "Please select a file" : block.data}</div>
                </div>
              ) : (
                <div>{block.data}</div>
              )}
            </div>
            <NewBlock index={i + 1} />
          </div>
        );
      })}
      <div className={`h-12`}></div>
    </>
  );
}
