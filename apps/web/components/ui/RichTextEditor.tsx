'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TOOLBAR_BTN =
  'px-2 py-1 rounded text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 transition-colors';

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[180px] px-4 py-3 focus:outline-none text-neutral-900',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // 외부에서 value가 바뀔 때 동기화 (모달 열릴 때)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-neutral-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 bg-neutral-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={[TOOLBAR_BTN, editor.isActive('bold') ? 'bg-neutral-200' : ''].join(' ')}
          title="굵게"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={[TOOLBAR_BTN, editor.isActive('italic') ? 'bg-neutral-200' : ''].join(' ')}
          title="기울임"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={[
            TOOLBAR_BTN,
            editor.isActive('heading', { level: 2 }) ? 'bg-neutral-200' : '',
          ].join(' ')}
          title="제목 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={[
            TOOLBAR_BTN,
            editor.isActive('heading', { level: 3 }) ? 'bg-neutral-200' : '',
          ].join(' ')}
          title="제목 3"
        >
          H3
        </button>
        <div className="w-px h-5 bg-neutral-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={[TOOLBAR_BTN, editor.isActive('bulletList') ? 'bg-neutral-200' : ''].join(' ')}
          title="글머리 기호"
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={[TOOLBAR_BTN, editor.isActive('orderedList') ? 'bg-neutral-200' : ''].join(' ')}
          title="번호 목록"
        >
          1. 목록
        </button>
        <div className="w-px h-5 bg-neutral-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={[TOOLBAR_BTN, editor.isActive('blockquote') ? 'bg-neutral-200' : ''].join(' ')}
          title="인용구"
        >
          &ldquo;&rdquo;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={TOOLBAR_BTN}
          title="구분선"
        >
          —
        </button>
      </div>

      {/* 에디터 본문 */}
      <div className="bg-white">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}
