import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/react";
import { Dispatch, useRef, useState, SetStateAction } from "react";

import { trpcRaw } from "../router";
import { PostContent } from "../routes/write.{-$postId}";


type UploadProps = {
  setContent : Dispatch<SetStateAction<PostContent>>;
  index: number;
}

export const Upload = ( { setContent, index }: UploadProps ) => {
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortController = new AbortController();

    const handleUpload = async () => {
      const fileInput = fileInputRef.current;
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file to upload");
        return;
      }

      const file = fileInput.files[0];

      let authParams;
      try {
        authParams = await trpcRaw.uploadImageAuth.query();
      } catch (authError) {
        console.error("Failed to authenticate for upload:", authError);
        return;
      }
      if (!authParams) return
      const { signature, expire, token, publicKey } = authParams;

      try {
        const uploadResponse = await upload({
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name, // Optionally set a custom file name
          onProgress: (event) => {
              setProgress((event.loaded / event.total) * 100);
          },
          abortSignal: abortController.signal,
        }).then(result => {
          console.log(result)
          setContent(prev => prev.map(block => block.index === index ? {...block, slug: file.name} : block))
        });
        console.log("Upload response:", uploadResponse);
      } catch (error) {
          if (error instanceof ImageKitAbortError) {
              console.error("Upload aborted:", error.reason);
          } else if (error instanceof ImageKitInvalidRequestError) {
              console.error("Invalid request:", error.message);
          } else if (error instanceof ImageKitUploadNetworkError) {
              console.error("Network error:", error.message);
          } else if (error instanceof ImageKitServerError) {
              console.error("Server error:", error.message);
          } else {
              console.error("Upload error:", error);
          }
      }
    };

    return (
        <>
            <input type="file" ref={fileInputRef} />
            <button type="button" onClick={handleUpload} className={`btn`}>
                Upload file
            </button>
            <br />
            Upload progress: <progress value={progress} max={100} className={`progress progress-primary`}></progress>
        </>
    );
};
