import { IoAdd, IoDocumentText, IoImage, IoVideocam } from "react-icons/io5";
import { useAtom } from "jotai";

import { contentTypeEnum } from "../server/schema";
import { writePostContentAtom } from "../lib/atoms";

export const NewWriteBlock = ({ index }: { index: number }) => {
  const [_, setContent] = useAtom(writePostContentAtom);
  const handleNewBlock = (
    contentType: (typeof contentTypeEnum.enumValues)[number],
  ) => {
    setContent((prev) => [
      ...prev.slice(0, index),
      { contentType, data: "", id: Math.random() },
      ...prev.slice(index),
    ]);
  };

  return (
    <div className={`divider divider-primary w-full h-24`}>
      <div className={`dropdown dropdown-hover dropdown-center`}>
        <div
          tabIndex={0}
          role="button"
          className={`btn btn-circle btn-soft ring-2 btn-secondary hover:btn-accent mb-2`}
        >
          <IoAdd className={`size-20`} />
        </div>
        <ul
          tabIndex={-1}
          className={`dropdown-content menu z-1 bg-base-300 rounded-box p-2 w-32 shadow`}
        >
          <li onClick={() => handleNewBlock("image")}>
            <a>
              <IoImage className={`size-7`} /> Image
            </a>
          </li>
          <li onClick={() => handleNewBlock("video")}>
            <a>
              <IoVideocam className={`size-7`} /> Video
            </a>
          </li>
          <li onClick={() => handleNewBlock("text")}>
            <a>
              <IoDocumentText className={`size-7`} /> Text
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
