import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/react";
import { useQuery } from "@tanstack/react-query";
import { Dispatch, useRef, useState, SetStateAction } from "react";

import { trpc } from "../router";
import { PostContent } from "../routes/write.{-$postId}";


type UploadProps = {
  setContent : Dispatch<SetStateAction<PostContent>>;
  index: number;
}

export const Upload = ( { setContent, index }: UploadProps ) => {
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const abortController = new AbortController();

    const authenticator = async () => {
      try {
        const response = useQuery(trpc.uploadImageAuth.queryOptions());
        return response.data
      } catch (error) {
        console.error("Authentication error:", error);
        throw new Error("Authentication request failed");
      }
    };

    const handleUpload = async () => {
      const fileInput = fileInputRef.current;
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file to upload");
        return;
      }

      const file = fileInput.files[0];

      let authParams;
      try {
        authParams = await authenticator();
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
        });
        setContent(prev => prev.map(block => block.index === index ? {...block, slug: file.name} : block))
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
            {/* File input element using React ref */}
            <input type="file" ref={fileInputRef} />
            {/* Button to trigger the upload process */}
            <button type="button" onClick={handleUpload}>
                Upload file
            </button>
            <br />
            {/* Display the current upload progress */}
            Upload progress: <progress value={progress} max={100} className={`progress progress-primary`}></progress>
        </>
    );
};
