import { useEffect, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import { IoTrashBin } from "react-icons/io5";
import { HiDocumentPlus } from "react-icons/hi2";
import { useAtom } from "jotai";

import { postContent } from "../server/schema";
import { SelectMedia } from "../components/select-media";
import { NewWriteBlock } from "../components/new-write-block";
import { TextEditor } from "../components/text-editor";
import { writePostIdAtom, writePostContentAtom } from "../lib/atoms";

export const Route = createFileRoute("/create/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId)
      await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

export type PostContent = Omit<typeof postContent.$inferSelect, "postId">[]

function RouteComponent() {
  const [postId, setPostId] = useAtom(writePostIdAtom);
  const newPostId = Route.useParams({ select: (d) => d.postId });
  useEffect(() => {
    if (newPostId !== postId) setPostId(newPostId);
  }, [newPostId]);
  const [content, setContent] = useAtom(writePostContentAtom);

  const memoizedContent = useMemo(() => content, [content]);

  console.log(content)

  return (
    <>
      <div className={`flex justify-end`}>
        <button className={`btn btn-error btn-soft`} onClick={() => document.getElementById("clear-new-post-modal")?.showModal()}>
          <HiDocumentPlus className={`size-7`} />
          New post
        </button>
        <dialog id="clear-new-post-modal" className={`modal`}>
          <div className={`modal-box ring-warning ring-2`}>
            <h1 className={`font-bold text-lg text-warning`}>Warning! Starting a new post will clear your progress. Make sure to save first!</h1>
            <div className={`modal-action`}>
              <form method="dialog">
                <button className={`btn btn-soft`} id="delete-files-modal-cancel">Cancel</button>
              </form>
              <button className={`btn btn-warning btn-soft`} onClick={() => setContent([])}>
                <Link to="/create/write">
                  Leave page
                </Link>
              </button>
            </div>
          </div>
        </dialog>
      </div>
      <NewWriteBlock index={0} />
      {memoizedContent.map((block, i) => {
        return (
          <div key={block.id}>
            <div className={`flex flex-col w-full items-center rounded-box bg-base-200 outline-4 outline-dotted gap-4 pb-2`}>
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
                      <SelectMedia mediaType="image" index={i} />
                    </div>
                    <div className={`badge ${block.data === "" ? "badge-warning" : "badge-accent"} md:badge-xl p-4`}>{block.data === "" ? "Please select a file" : block.data}</div>
                  </>
                ) : block.contentType === "video" ? (
                  <div>Uh oh! Can't do this yet :/</div>
                ) : (
                  <div className={`bg-base-300 rounded-box shadow h-70 overflow-y-auto w-full p-4`}>
                    <TextEditor index={i} />
                    <div className="w-full pt-4 ql-editor" dangerouslySetInnerHTML={{ __html: block.data }} />
                  </div>
                )}
              </>
            </div>
            <NewWriteBlock index={i + 1} />
          </div>
        );
      })}
      <div className={`h-12`}>Footer</div>
    </>
  );
}
