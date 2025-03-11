import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import MenuBar from "../../components/MenuBar";
const ContentManager = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [formData, setFormData] = useState({});
  const [collectionData, setCollectionData] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/collection");
      setCollections(res.data.data.get_all_collections || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  const handleCollectionSelect = async (collectionName) => {
    const collection = collections.find((col) => col.collection_name === collectionName);
    if (!collection) return;

    setSelectedCollection(collection);
    setAttributes(collection.columns.map((col) => col.column_name) || []);

    const initialFormData = {};
    collection.columns.forEach((col) => {
      if (col.column_name !== "id") {
        initialFormData[col.column_name] = "";
      }
    });
    setFormData(initialFormData);

    try {
      const res = await axios.get(`http://localhost:3000/api/collection/data/${collectionName}`);
      setCollectionData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching collection data:", error);
      setCollectionData([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCollection) {
      alert("Please select a collection first.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/collection/insert", {
        ...formData,
        collectionName: selectedCollection.collection_name,
      });
      alert("Data inserted successfully!");
      handleCollectionSelect(selectedCollection.collection_name);
    } catch (err) {
      console.error("Error inserting data:", err);
      alert("Failed to insert data.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.post("http://localhost:3000/api/collection/delete", {
        tableName: selectedCollection.collection_name,
        id: id
      });
      alert("Data deleted successfully!");
      handleCollectionSelect(selectedCollection.collection_name);
    } catch (err) {
      console.error("Error deleting data:", err);
      alert("Failed to delete data.");
    }
  };

  const handleEdit = (record) => {
    setEditData(record);
    setFormData(record);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      delete updateData.id; // Remove the id property from the updateData object

      await axios.post("http://localhost:3000/api/collection/update", {
        tableName: selectedCollection.collection_name,
        id: formData.id,
        updateData: updateData,
      });

      alert("Data updated successfully!");
      setEditData(null);
      handleCollectionSelect(selectedCollection.collection_name);
    } catch (err) {
      console.error("Error updating data:", err);
      alert("Failed to update data.");
    }
  };

  return (
    <>
      <Header title="Content Manager" />

      <div className="flex">
        <MenuBar />
        <div className="p-4 mt-20 mx-auto bg-white w-full h-screen ">
          <h2 className="text-2xl mb-4 text-gray-800">Content Manager</h2>

          <select
            className="w-full p-2 mb-4 border border-gray-300 text-black rounded"
            onChange={(e) => handleCollectionSelect(e.target.value)}
          >
            <option value="">Select a collection</option>
            {collections.map((col) => (
              <option key={col.collection_name} value={col.collection_name}>
                {col.collection_name}
              </option>
            ))}
          </select>

          {selectedCollection && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="text-lg mb-3 text-black">
                {editData ? "Edit Record" : `Add to ${selectedCollection.collection_name}`}
              </h3>
              <form onSubmit={editData ? handleUpdate : handleSubmit}>
                {attributes.map((attr) =>
                  attr !== "id" ? (
                    <div key={attr} className="mb-3">
                      <label className="block mb-1 text-black">{attr}</label>
                      <input
                        type="text"
                        name={attr}
                        value={formData[attr] || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 text-black rounded"
                      />
                    </div>
                  ) : null
                )}
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded mr-2"
                >
                  {editData ? "Update" : "Save"}
                </button>
                {editData && (
                  <button
                    type="button"
                    onClick={() => setEditData(null)}
                    className="bg-gray-500 text-white p-2 rounded"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          )}

          {collectionData.length > 0 && (
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr>
                  {attributes.map((attr) => (
                    <th key={attr} className="bg-gray-200 p-3 border-b-2 border-gray-300 text-left text-black">
                      {attr}
                    </th>
                  ))}
                  <th className="bg-gray-200 p-3 border-b-2 border-gray-300 text-left text-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {collectionData.map((row) => (
                  <tr key={row.id}>
                    {attributes.map((attr) => (
                      <td key={attr} className="p-3 border-b border-gray-300 text-black">
                        {row[attr]}
                      </td>
                    ))}
                    <td className="p-3 border-b border-gray-300">
                      <button
                        onClick={() => handleEdit(row)}
                        className="bg-green-500 text-white p-2 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white p-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentManager;
