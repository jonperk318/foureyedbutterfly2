import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { trpc } from "../router";
import { postContent } from "../server/schema";
import { useQuery } from "@tanstack/react-query";


export const darkModeAtom = atomWithStorage("darkMode", false);

export const writePostIdAtom = atom<string | undefined>(undefined);

export type PostContent = Omit<typeof postContent.$inferSelect, "postId">[]

// Internal writable atom that stores the mutable content
const _contentBaseAtom = atom<PostContent>([]);

// Public writable atom that syncs from query on read but allows manual updates
export const writePostContentAtom = atom<PostContent>(
  (get) => {
    const postId = get(writePostIdAtom);
    const postQuery = postId ? useQuery(trpc.getPost.queryOptions(postId)) : null;
    const baseContent = get(_contentBaseAtom);

    if (postQuery?.data?.content && baseContent.length === 0) {
      return postQuery.data.content;
    }

    return baseContent;
  },
  (get, set, newValue: PostContent) => {
    set(_contentBaseAtom, newValue);
  }
);
