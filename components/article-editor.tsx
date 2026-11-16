
"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

type ArticleEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function ArticleEditor({
    value,
    onChange,
}: ArticleEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: "noopener noreferrer",
                    target: "_blank",
                },
            }),
            Image,
            Placeholder.configure({
                placeholder: "Write your news article here...",
            }),
        ],
        content: value || "",
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "min-h-[300px] w-full p-4 focus:outline-none [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full",
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value || "");
        }
    }, [editor, value]);

    if (!editor) {
        return <div className="border rounded-lg p-4">Loading editor...</div>;
    }

    const buttonClass = (active: boolean) =>
        `px-3 py-2 text-sm rounded border ${active
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`;

    const addLink = () => {
        const url = window.prompt("Enter the link URL:");
        if (url) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt("Enter the image URL:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
                <button type="button" className={buttonClass(editor.isActive("bold"))}
                    onClick={() => editor.chain().focus().toggleBold().run()}>
                    Bold
                </button>

                <button type="button" className={buttonClass(editor.isActive("italic"))}
                    onClick={() => editor.chain().focus().toggleItalic().run()}>
                    Italic
                </button>

                <button type="button" className={buttonClass(editor.isActive("heading", { level: 2 }))}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    Heading
                </button>

                <button type="button" className={buttonClass(editor.isActive("bulletList"))}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    Bullet List
                </button>

                <button type="button" className={buttonClass(editor.isActive("orderedList"))}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    Numbered List
                </button>

                <button type="button" className={buttonClass(editor.isActive("blockquote"))}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    Quote
                </button>

                <button type="button" className={buttonClass(false)} onClick={addLink}>
                    Add Link
                </button>

                <button type="button" className={buttonClass(false)} onClick={addImage}>
                    Add Image
                </button>
            </div>

            <EditorContent editor={editor} />
        </div>
    );
}
