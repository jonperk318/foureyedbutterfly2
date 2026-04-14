import { useMutation, useQuery } from "@tanstack/react-query"
import { MdImageNotSupported } from "react-icons/md";
import { useState } from "react";
import { IoCloseCircle, IoTrashBin } from "react-icons/io5";
import toast from "react-hot-toast";

import { trpc } from "../router"
import Image from "./image";


export const MediaGallery = () => {
  const mediaQuery = useQuery({...trpc.getAllMedia.queryOptions(), refetchInterval: 1000 * 15,})
  const deleteMediaMutation = useMutation(trpc.deleteMedia.mutationOptions())

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelectedFiles = (fileName: string | undefined) => {
    if (!fileName) return
    setSelectedFiles(prev =>
      prev.includes(fileName) ? prev.filter(item => item !== fileName) : [...prev, fileName]
    );
  };

  const handleDelete = () => {
    deleteMediaMutation.mutate(selectedFiles, {
      onSuccess: (response) => {
        document.getElementById("delete-files-modal-cancel")?.click();
        toast.success(`Successfully deleted ${response.deleted} file${response.deleted === 1 ? "" : "s"}`)
        setSelectedFiles([]);
        mediaQuery.refetch();
      },
      onError: (error) => {
        console.error(error);
        toast.error(`Error deleting files: ${error}`)
      },
    })
  }

  return (
    <div className={`p-3 md:p-4`}>
      {mediaQuery.data ? (
        <>
          <div className={`flex flex-col md:flex-row justify-around md:justify-between items-center h-48 md:h-24`}>
            <h1 className={`text-sm lg:text-lg`}>Select and delete uploaded images and videos</h1>
            <div className={`flex flex-col sm:flex-row gap-4`}>
              <button className={`btn btn-accent`} onClick={() => setSelectedFiles([])} disabled={selectedFiles.length === 0}>
                <IoCloseCircle className={`size-7`} />
                Clear Selection
              </button>
              <button className={`btn btn-warning`} disabled={selectedFiles.length === 0} onClick={() => document.getElementById("delete-files-modal")?.showModal()}>
                <IoTrashBin className={`size-7`} />
                Delete Files
              </button>
              <dialog id="delete-files-modal" className={`modal`}>
                <div className={`modal-box ring-warning ring-2`}>
                  <h1 className={`font-bold text-lg text-warning`}>Delete the following files?</h1>
                  <div className={`flex flex-col py-4`}>
                    {selectedFiles.map(fileName => (
                      <p>{fileName}</p>
                    ))}
                  </div>
                  <div className={`modal-action`}>
                    <form method="dialog">
                      <button className={`btn btn-soft`} id="delete-files-modal-cancel">Cancel</button>
                    </form>
                    <button className={`btn btn-warning btn-soft`} onClick={handleDelete}>
                      {deleteMediaMutation.isPending ? (
                        <div className={`loading loading-spinner`} />
                      ) : (
                        <div>Delete</div>
                      )}
                    </button>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
            {mediaQuery.data.map((file) => (
              <div className={`indicator rounded-box shadow-sm bg-base-100 p-2 md:p-3 w-full place-items-center justify-center`} key={file.name}>
                <span className={`indicator-item`}>
                  <input type="checkbox" className={`checkbox checkbox-xl checkbox-accent`} onChange={() => toggleSelectedFiles(file.name)} checked={file.name ? selectedFiles.includes(file.name) : false} />
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
