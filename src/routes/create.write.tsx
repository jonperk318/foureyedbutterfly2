import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IoIosArrowDropdownCircle,
  IoIosArrowDropupCircle,
  IoIosSend,
} from "react-icons/io";
import { IoTrashBin } from "react-icons/io5";
import { HiDocumentPlus } from "react-icons/hi2";
import { useAtom } from "jotai";
import { DayPicker } from "react-day-picker";
import toast from "react-hot-toast";

import { postContent } from "../server/schema";
import { SelectMedia } from "../components/select-media";
import { NewWriteBlock } from "../components/new-write-block";
import { TextEditor } from "../components/text-editor";
import { writePostIdAtom, writePostContentAtom } from "../lib/atoms";
import { trpc } from "../router";
import { Spinner } from "../components/ui/spinner";

export const Route = createFileRoute("/create/write")({
  component: RouteComponent,
});

export type PostContent = Omit<typeof postContent.$inferSelect, "postId">[];

function RouteComponent() {
  const navigate = useNavigate();
  const [writePostId, setWritePostId] = useAtom(writePostIdAtom);
  const postQuery = useQuery(trpc.getPost.queryOptions(writePostId));

  const [title, setTitle] = useState<string>(postQuery?.data?.post.title || "");
  const [content, setContent] = useAtom(writePostContentAtom);
  const [date, setDate] = useState<Date | undefined>(
    postQuery?.data?.post.createdAt
      ? new Date(postQuery.data.post.createdAt)
      : undefined,
  );
  const [draft, setDraft] = useState<boolean>(
    !!postQuery?.data?.post.draft ? postQuery.data.post.draft : false,
  );

  useEffect(() => {
    if (postQuery?.data?.content) {
      setContent(postQuery.data.content);
    }
  }, [])

  const createPostMutation = useMutation(
    trpc.createPost.mutationOptions({
      onSuccess: (response) => {
        toast.success(`Post ${response.post.id} created successfully!`);
        const year = new Date(response.post.createdAt).getFullYear();
        navigate({ to: `/posts/${year}/${response.post.id}` });
      },
    }),
  );

  const updatePostMutation = useMutation(
    trpc.updatePost.mutationOptions({
      onSuccess: (response) => {
        toast.success(`Post ${response.post.id} updated successfully!`);
        const year = new Date(response.post.createdAt).getFullYear();
        navigate({ to: `/posts/${year}/${response.post.id}` });
      },
    }),
  );

  const memoizedContent = useMemo(() => content, [content]);

  if (postQuery.isPending) return <Spinner />

  return (
    <>
      <div className={`flex flex-col-reverse md:flex-row justify-between`}>
        <fieldset className="fieldset w-full text-lg">
          <legend className="fieldset-legend ml-2">Title</legend>
          <input
            type="text"
            className="input input-lg w-full"
            placeholder="Give this post a title..."
            onChange={(e) => setTitle(e.target.value)}
            value={title ? title : ""}
          />
        </fieldset>
        <button
          className={`btn btn-error btn-soft`}
          onClick={() =>
            document.getElementById("clear-new-post-modal")?.showModal()
          }
        >
          <HiDocumentPlus className={`size-7`} />
          New post
        </button>
        <dialog id="clear-new-post-modal" className={`modal`}>
          <div className={`modal-box ring-warning ring-2`}>
            <h1 className={`font-bold text-lg text-warning`}>
              Warning! Starting a new post will clear your progress. Make sure
              to save first!
            </h1>
            <div className={`modal-action`}>
              <form method="dialog">
                <button
                  className={`btn btn-soft`}
                  id="delete-files-modal-cancel"
                >
                  Cancel
                </button>
              </form>
              <form method="dialog">
                <button
                  className={`btn btn-warning btn-soft`}
                  id="delete-files-modal-cancel"
                  onClick={() => {
                    setWritePostId(null);
                    setContent([]);
                    setTitle("");
                    setDate(undefined);
                    setDraft(false);
                  }}
                >
                  Reset page
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
      <NewWriteBlock index={0} />
      {memoizedContent.map((block, i) => {
        return (
          <div key={block.id}>
            <div
              className={`flex flex-col w-full items-center rounded-box bg-base-200 outline-4 gap-4 pb-2`}
            >
              <>
                <div
                  className={`flex flex-col md:flex-row items-center justify-between w-full p-2 gap-4`}
                >
                  <div className={`badge badge-secondary badge-xl`}>
                    Block {i + 1}
                  </div>
                  <div className={`flex flex-col sm:flex-row gap-4`}>
                    <button
                      className={`btn`}
                      onClick={() =>
                        i > 0 &&
                        setContent((prev) => {
                          const newList = [...prev];
                          [newList[i], newList[i - 1]] = [
                            newList[i - 1],
                            newList[i],
                          ];
                          return newList;
                        })
                      }
                    >
                      <IoIosArrowDropupCircle className={`size-7`} />
                      Move up
                    </button>
                    <button
                      className={`btn`}
                      onClick={() =>
                        i < content.length &&
                        setContent((prev) => {
                          const newList = [...prev];
                          [newList[i], newList[i + 1]] = [
                            newList[i + 1],
                            newList[i],
                          ];
                          return newList;
                        })
                      }
                    >
                      <IoIosArrowDropdownCircle className={`size-7`} />
                      Move down
                    </button>
                  </div>
                  <button
                    className={`btn btn-error btn-soft`}
                    onClick={() =>
                      setContent((prev) =>
                        prev.filter((_, index) => index !== i),
                      )
                    }
                  >
                    <IoTrashBin className={`size-7`} />
                    Delete block
                  </button>
                </div>
                {block.contentType === "image" ? (
                  <>
                    <div
                      className={`bg-base-300 rounded-box shadow h-100 overflow-y-auto`}
                    >
                      <SelectMedia mediaType="image" index={i} />
                    </div>
                    <div
                      className={`badge ${block.data === "" ? "badge-warning" : "badge-accent"} md:badge-xl p-4`}
                    >
                      {block.data === "" ? "Please select a file" : block.data}
                    </div>
                  </>
                ) : block.contentType === "video" ? (
                  <div>Uh oh! Can't do this yet :/</div>
                ) : (
                  <div
                    className={`bg-base-300 rounded-box shadow h-85 overflow-y-auto w-full p-4`}
                  >
                    <TextEditor index={i} />
                  </div>
                )}
              </>
            </div>
            <NewWriteBlock index={i + 1} />
          </div>
        );
      })}
      <div
        className={`flex flex-col md:flex-row justify-between items-center gap-4 h-12 pb-8`}
      >
        <fieldset className={`fieldset`}>
          <legend className="fieldset-legend ml-2 text-lg">Date</legend>
          <button
            popoverTarget="rdp-popover"
            className={`input input-border`}
            style={{ anchorName: "--rdp" } as React.CSSProperties}
          >
            {date ? date.toLocaleDateString() : "Pick a custom date"}
          </button>
          <div
            popover="auto"
            id="rdp-popover"
            className={`dropdown`}
            style={{ positionAnchor: "--rdp" } as React.CSSProperties}
          >
            <DayPicker
              className="react-day-picker"
              mode="single"
              selected={date}
              onSelect={setDate}
            />
          </div>
          {!date && (
            <p className="label ml-2 mt-2">Leave blank to use today's date</p>
          )}
        </fieldset>
        <fieldset className={`fieldset`}>
          <legend className="fieldset-legend ml-2 text-lg">Draft</legend>
          <label className="label">
            <input
              type="checkbox"
              className="checkbox"
              checked={draft}
              onChange={() => setDraft(!draft)}
            />
            Select to mark the post as draft
          </label>
        </fieldset>
        <button
          className={`btn btn-primary`}
          onClick={() => {
            if (writePostId && postQuery.data) {
              updatePostMutation.mutate({
                id: postQuery.data.post.id,
                ...(title !== postQuery.data?.post.title && {title: title || "Untitled"}),
                ...(draft !== postQuery.data?.post.draft && {draft}),
                content,
                ...(postQuery.data.post.createdAt && date !== new Date(postQuery.data?.post.createdAt) && { createdAt: date ? String(date) : undefined }),
              });
            } else {
              createPostMutation.mutate({
                title: title ? title : "Untitled",
                draft,
                content,
                createdAt: date ? String(date) : undefined,
              })
            }
          }}
          disabled={!title || createPostMutation.isPending || updatePostMutation.isPending}
        >
          <IoIosSend className={`size-7`} />
          {createPostMutation.isPending || updatePostMutation.isPending ? (
            <span className={`loading loading-spinner`} />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </>
  );
}
