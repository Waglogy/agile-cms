import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichTextTest = () => {
  const [value, setValue] = useState('');
  const quillRef = useRef();

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Rich Text Editor Test</h2>
      <div className="h-[300px]">
        <ReactQuill 
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
          className="h-[250px]"
        />
      </div>
      <div className="mt-12">
        <h3 className="text-xl mb-2">Output:</h3>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </div>
    </div>
  );
};

export default RichTextTest;