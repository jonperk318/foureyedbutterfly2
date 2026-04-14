import { useQuery } from "@tanstack/react-query"
import { MdImageNotSupported } from "react-icons/md";
import { Dispatch, SetStateAction } from "react";
import { IoReload } from "react-icons/io5";

import { trpc } from "../router"
import Image from "./image";
import { PostContent } from "../routes/create.write.{-$postId}";


type SelectMediaProps = {
  mediaType: "image" | "video";
  index: number;
  content: PostContent
  setContent: Dispatch<SetStateAction<PostContent>>
}

export const SelectMedia = ({mediaType, index, content, setContent}: SelectMediaProps) => {
  const mediaQuery = useQuery({...trpc.getAllMedia.queryOptions(), refetchInterval: 1000 * 15,})

  return (
    <div className={`p-3 md:p-4`}>
      {mediaQuery.data ? (
        <>
          <div className={`flex flex-col md:flex-row justify-around md:justify-between items-center h-60 md:h-24`}>
            <h1 className={`text-sm lg:text-lg`}>Select the {mediaType} to place within this content block</h1>
            <IoReload
              className={`size-7 hover:cursor-pointer`}
              onClick={() => mediaQuery.refetch()}
            />
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
            {mediaQuery.data.map((file) => (
              <div className={`indicator rounded-box shadow-sm bg-base-100 p-2 md:p-3 w-full place-items-center justify-center`} key={file.name}>
                <span className={`indicator-item`}>
                  <input type="radio" className={`radio radio-accent`} name="select-file" onChange={() => setContent(prev => prev.map((block, i) => (file.name && i === index) ? {...block, data: file.name} : block))} defaultChecked={content[index].data === file.name} />
                </span>
                <Image alt={file.name ? file.name : "Uploaded image/video"} src={`posts/${file.name}`} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`flex flex-col h-64 gap-4 items-center justify-center`}>
          <h1>No media found</h1>
          <MdImageNotSupported className={`size-12`} />
        </div>
      )}
    </div>
  )
}
