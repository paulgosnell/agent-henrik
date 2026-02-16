"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ label, value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function btn(
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title: string
  ) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          active
            ? "bg-[var(--foreground)] text-[var(--background)]"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        {icon}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">
        {label}
      </label>
      <div className="border border-[var(--border)] rounded overflow-hidden">
        <div className="flex items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--muted)]">
          {btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={14} />, "Bold")}
          {btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={14} />, "Italic")}
          {btn(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={14} />, "Heading 2")}
          {btn(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 size={14} />, "Heading 3")}
          {btn(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List size={14} />, "Bullet List")}
          {btn(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={14} />, "Ordered List")}
        </div>
        <EditorContent
          editor={editor}
          className="prose prose-sm prose-invert max-w-none p-3 min-h-[200px] bg-[var(--background)] text-[var(--foreground)] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]"
        />
      </div>
    </div>
  );
}
