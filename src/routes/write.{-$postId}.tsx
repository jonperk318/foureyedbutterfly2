import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../router";
import { useState } from "react";

export const Route = createFileRoute("/write/{-$postId}")({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { postId } }) => {
    if (postId) await queryClient.ensureQueryData(trpc.getPost.queryOptions(postId));
  },
});

function RouteComponent() {
  const postId = Route.useParams({ select: (d) => d.postId });
  const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;
  const postData = postQuery?.data ? [...postQuery.data?.imageBlocks, ...postQuery.data?.textBlocks].sort((a, b) => a.index - b.index) : null

  const [postContent, setPostContent] = useState(postData ? postData : []);

  return (
    <div className={`flex w-full py-4 px-12`}>
    </div>
  )
}
