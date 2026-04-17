import { Dispatch, SetStateAction } from 'react';
import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';

import { PostContent } from '../routes/create.write.{-$postId}';


type TextEditorProps = {
  index: number;
  content: PostContent;
  setContent: Dispatch<SetStateAction<PostContent>>;
}

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
]

export const TextEditor = ({ index, content, setContent }: TextEditorProps) => {

  return (
    <ReactQuill
      theme="snow"
      className="ring-2"
      value={content[index].data}
      onChange={(newValue) => setContent(prev => prev.map((block, i) => i === index ? {...block, data: newValue} : block))}
      readOnly={false}
      modules={{
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline"],
            ['link'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': colors }, { 'background': colors }],
            ['clean'],
            [{ 'font': [] }],
            [{ 'align': [] }],
          ]
        }
      }}
    />
  )
}
