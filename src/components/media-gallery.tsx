import { useQuery } from "@tanstack/react-query"
import { MdImageNotSupported } from "react-icons/md";

import { trpc } from "../router"
import Image from "./image";


export const MediaGallery = () => {
  const mediaQuery = useQuery(trpc.media.queryOptions())
  console.log(mediaQuery.data)
  return (
    <div className={`p-4`}>
      {mediaQuery.data ? (
        <div className={`grid grid-cols-3`}>
          {mediaQuery.data.map((file) => (
            <Image alt={file.name} src={`posts/${file.name}`} />
          ))}
        </div>
      ) : (
        <div className={`flex flex-col h-64 gap-4 items-center justify-center`}>
          <h1>No media found</h1>
          <MdImageNotSupported className={`size-12`} />
        </div>
      )}
    </div>
  )
}
