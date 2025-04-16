import React, { useState, useEffect } from 'react';
import axios from "../../../../api/axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AddContent = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [formData, setFormData] = useState({});
  const [editorStates, setEditorStates] = useState({});

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/collection");
        if (response.data.status && response.data.data.get_all_collections) {
          setCollections(response.data.data.get_all_collections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  const handleCollectionSelect = (collectionName) => {
    const collection = collections.find(col => col.collection_name === collectionName);
    if (collection) {
      const initialFormData = {};
      const initialEditorStates = {};
      collection.columns.forEach(col => {
        if (col.column_name !== 'id') {
          initialFormData[col.column_name] = '';
          initialEditorStates[col.column_name] = col.column_name.toLowerCase().includes('description');
        }
      });
      setFormData(initialFormData);
      setEditorStates(initialEditorStates);
      setSelectedCollection(collectionName);
    }
  };

  const handleEditorChange = (content, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: content
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const postData = {
        collectionName: selectedCollection,
        ...formData,
      };
      await axios.post("http://localhost:3000/api/collection/insert", postData);
      alert('Content added successfully!');
      setFormData({});
    } catch (err) {
      console.error("Failed to add content:", err);
      alert('Failed to add content');
    }
  };

  const handleFileChange = (event, fieldName) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: reader.result // Store base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Content</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Select Collection</label>
          <select
            value={selectedCollection}
            onChange={(e) => handleCollectionSelect(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select a collection</option>
            {collections.map((col) => (
              <option key={col.collection_name} value={col.collection_name}>
                {col.collection_name}
              </option>
            ))}
          </select>
        </div>
        {selectedCollection && Object.keys(formData).map((key) => (
          <div key={key} className="mb-4">
            <label className="block mb-2">{key}</label>
            {key.toLowerCase().includes('image') ? (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, key)}
                className="p-2 border rounded w-full"
              />
            ) : editorStates[key] ? (
              <ReactQuill
                theme="snow"
                value={formData[key]}
                onChange={(value) => handleEditorChange(value, key)}
                className="bg-white"
              />
            ) : (
              <input
                type="text"
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="p-2 border rounded w-full"
              />
            )}
            <button
              type="button"
              onClick={() => setEditorStates(prev => ({ ...prev, [key]: !prev[key] }))}
              className="text-sm mt-2 text-blue-500 hover:text-blue-700"
            >
              {editorStates[key] ? 'Switch to Text Input' : 'Switch to Rich Editor'}
            </button>
          </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={!selectedCollection}
        >
          Add Content
        </button>
      </form>
    </div>
  );
};

export default AddContent;