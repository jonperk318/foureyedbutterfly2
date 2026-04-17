import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import { IoTrashBin } from "react-icons/io5";

import { trpc } from "../router";
import { postContent } from "../server/schema";
import { SelectMedia } from "../components/select-media";
import { NewWriteBlock } from "../components/new-write-block";
import { TextEditor } from "../components/text-editor";

export const Route = createFileRoute("/create/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId)
      await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

export type PostContent = Omit<typeof postContent.$inferSelect, "postId">[]

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;

  const [content, setContent] = useState<PostContent>(
    postQuery?.data ? postQuery.data.content : [],
  );

  const memoizedContent = useMemo(() => content, [content]);

  console.log(content)

  return (
    <>
      <NewWriteBlock index={0} setContent={setContent} />
      {memoizedContent.map((block, i) => {
        return (
          <div key={block.id}>
            <div className={`flex flex-col items-center rounded-box bg-base-200 outline-4 outline-dotted gap-4 pb-2`}>
              <>
                <div className={`flex flex-col md:flex-row items-center justify-between w-full p-2 gap-4`}>
                  <div className={`badge badge-primary badge-xl`}>
                    Block {i + 1}
                  </div>
                  <div className={`flex flex-col sm:flex-row gap-4`}>
                    <button className={`btn`} onClick={() => i > 0 && setContent(prev => {
                      const newList = [...prev];
                      [newList[i], newList[i - 1]] = [newList[i - 1], newList[i]];
                      return newList;
                    })}>
                      <IoIosArrowDropupCircle className={`size-7`} />
                      Move up
                    </button>
                    <button className={`btn`} onClick={() => i < content.length && setContent(prev => {
                      const newList = [...prev];
                      [newList[i], newList[i + 1]] = [newList[i + 1], newList[i]];
                      return newList;
                    })}>
                      <IoIosArrowDropdownCircle className={`size-7`} />
                      Move down
                    </button>
                  </div>
                  <button className={`btn btn-error`} onClick={() => setContent(prev => prev.filter((_, index) => index !== i))}>
                    <IoTrashBin className={`size-7`} />
                    Delete block
                  </button>
                </div>
                {block.contentType === "image" ? (
                  <>
                    <div className={`bg-base-300 rounded-box shadow h-100 overflow-y-auto`}>
                      <SelectMedia mediaType="image" index={i} content={content} setContent={setContent} />
                    </div>
                    <div className={`badge ${block.data === "" ? "badge-warning" : "badge-accent"} md:badge-xl p-4`}>{block.data === "" ? "Please select a file" : block.data}</div>
                  </>
                ) : block.contentType === "video" ? (
                  <div>Uh oh! Can't do this yet :/</div>
                ) : (
                  <div className={`bg-base-300 rounded-box shadow h-50 overflow-y-auto w-full p-4`}>
                    <TextEditor index={i} content={memoizedContent} setContent={setContent} />
                    <div className="w-full pt-4 ql-editor" dangerouslySetInnerHTML={{ __html: block.data }} />
                  </div>
                )}
              </>
            </div>
            <NewWriteBlock index={i + 1} setContent={setContent} />
          </div>
        );
      })}
      <div className={`h-12`}>Footer</div>
    </>
  );
}
