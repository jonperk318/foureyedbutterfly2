import { useAtom } from "jotai";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import { writePostContentAtom } from "../lib/atoms";

const colors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-neutral)",
  "var(--color-base-100)",
  "var(--color-base-200)",
  "var(--color-base-300)",
  "var(--color-base-content)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
];

const Quill = ReactQuill.Quill;
let Font = Quill.import("formats/font");
Font.whitelist = [
  "MenoBanner",
  "MenoBannerBold",
  "AdornCopperplate",
  "RoyaltyFree",
  "Cursive",
  "SansSerif",
  "Serif",
  "Monospace",
];
Quill.register(Font, true);

export const TextEditor = ({ index }: { index: number }) => {
  const [content, setContent] = useAtom(writePostContentAtom);

  return (
    <ReactQuill
      theme="snow"
      className="ring-2 min-h-24 p-2"
      value={content[index]?.data}
      onChange={(newValue) =>
        setContent((prev) =>
          prev.map((block, i) =>
            i === index ? { ...block, data: newValue } : block,
          ),
        )
      }
      readOnly={false}
      modules={{
        toolbar: {
          container: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: Font.whitelist }],
            ["bold", "italic", "underline"],
            ["link"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ color: colors }, { background: colors }],
            ["clean"],
            [{ align: [] }],
          ],
        },
      }}
      formats={[
        "header",
        "font",
        "bold",
        "italic",
        "underline",
        "link",
        "list",
        "color",
        "background",
        "align",
      ]}
    />
  );
};
