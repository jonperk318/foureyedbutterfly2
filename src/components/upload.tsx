import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/react";
import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import { trpc } from "../router";
import { IoCloudUpload, IoReload } from "react-icons/io5";

export const Upload = () => {
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = new AbortController();
  const [image, setImage] = useState<null | string>(null);
  const authParamsQuery = useQuery({
    ...trpc.uploadImageAuth.queryOptions(),
    staleTime: 1000 * 60 * 60,
  }); // 1 hour
  const mediaQuery = useQuery({
    ...trpc.getAllMedia.queryOptions(),
    refetchInterval: 1000 * 15,
  }); // 15 seconds

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const onReloadClick = () => {
    fileInputRef.current.value = "";
    setImage(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];

    authParamsQuery.refetch();
    if (!authParamsQuery.data) return;
    const { signature, expire, token, publicKey } = authParamsQuery.data;

    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name, // Optionally set a custom file name
        folder: "/posts",
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      }).then(() => {
        toast.success("File uploaded successfully!");
        mediaQuery.refetch();
      });
      console.log("Upload response:", uploadResponse);
    } catch (error) {
      let errorString;
      if (error instanceof ImageKitAbortError) {
        errorString = `Upload aborted: ${error.reason}`;
      } else if (error instanceof ImageKitInvalidRequestError) {
        errorString = `Invalid request: ${error.message}`;
      } else if (error instanceof ImageKitUploadNetworkError) {
        errorString = `Network error: ${error.message}`;
      } else if (error instanceof ImageKitServerError) {
        errorString = `Server error: ${error.message}`;
      } else {
        errorString = `Upload error: ${error}`;
      }
      toast.error(errorString);
      console.error(errorString);
    }
  };

  return (
    <div className={`flex flex-col p-8 gap-4 items-center text-sm lg:text-lg`}>
      {progress === 100 ? (
        <div className={`flex gap-4 items-center`}>
          <h1>Upload a new image or video</h1>
          <IoReload
            className={`size-7 hover:cursor-pointer`}
            onClick={onReloadClick}
          />
        </div>
      ) : (
        <h1>Upload images and videos to add to posts</h1>
      )}
      <input
        className="hidden w-full rounded-box bg-base-200"
        type="file"
        id="file-input"
        ref={fileInputRef}
        onChange={onImageChange}
        disabled={progress > 0}
      />
      <label
        htmlFor="file-input"
        className={`btn lg:btn-lg btn-wide flex items-center gap-4 ${progress > 0 && "btn-disabled"}`}
      >
        <IoCloudUpload className={`size-10`} />
        Select file
      </label>
      {image && <img alt="Preview image" src={image} />}
      <button
        type="button"
        onClick={handleUpload}
        className={`btn lg:btn-lg btn-wide`}
        disabled={!image || progress > 0}
      >
        Upload file
      </button>
      <div
        className={`flex justify-between items-center w-full flex-col md:flex-row gap-2`}
      >
        <h1 className={`sm:w-sm`}>Upload progress: </h1>
        <progress
          value={progress}
          max={100}
          className={`progress progress-secondary mr-4`}
        />
        <h1>{Math.floor(progress)}%</h1>
      </div>
    </div>
  );
};
