'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onBlur: (content: string) => void;
}

export function RichTextEditor({ content, onBlur }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-invert max-w-none min-h-[200px] p-3 rounded-xl bg-white/5 border border-[var(--border-secondary)] focus:border-gold/40 focus:outline-none transition-colors text-[var(--text-primary)]',
      },
    },
    onBlur: ({ editor }) => {
      onBlur(editor.getHTML());
    },
  });

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-1.5 rounded text-xs font-bold transition-colors ${
            editor.isActive('bold')
              ? 'bg-gold/20 text-gold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-1.5 rounded text-xs italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-gold/20 text-gold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-1.5 rounded text-xs transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-gold/20 text-gold'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5'
          }`}
        >
          • List
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
