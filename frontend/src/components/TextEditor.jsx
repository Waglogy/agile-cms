import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit' // Make sure this is correct

const TextEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit], // Remove parentheses, just pass the object
    content: '<p>Hello, world!</p>',
  })

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-3">Tiptap Rich Text Editor</h2>
      <div className="border border-gray-200 rounded-lg p-2">
        <EditorContent editor={editor} className="min-h-[200px] p-2" />
      </div>
    </div>
  )
}

export default TextEditor
