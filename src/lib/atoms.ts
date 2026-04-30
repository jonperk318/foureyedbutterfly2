import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { postContent } from "../server/schema";

export const darkModeAtom = atomWithStorage("darkMode", false);

export const writePostIdAtom = atom<string | null>(null);
export type PostContent = Omit<typeof postContent.$inferSelect, "postId">[];
export const writePostContentAtom = atom<PostContent>([]);
