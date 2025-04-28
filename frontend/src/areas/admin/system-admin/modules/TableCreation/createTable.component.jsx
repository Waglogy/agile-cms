import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../../api/axios";
import { CONTENT_ADMIN_CREATE_COLLECTION } from "../../../../../api/api_routing_urls";

const CreateTableComponent = () => {
  const [tableName, setTableName] = useState("");
  const [fields, setFields] = useState([{ name: "", type: "TEXT" }]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // Remove "IMAGE" from the fieldTypes array
const fieldTypes = [
  'TEXT',
  'INTEGER',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'NUMERIC',
  'JSONB',
  'IMAGE',
]

  const addField = () => {
    setFields([...fields, { name: "", type: "TEXT" }]);
  };

  const removeField = (index) => {
    if (fields.length > 1) {
      const updatedFields = fields.filter((_, i) => i !== index);
      setFields(updatedFields);
    }
  };

  const handleFieldNameChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].name = value;
    setFields(updatedFields);
  };

  const handleFieldTypeChange = (index, value) => {
    const updatedFields = [...fields];
    updatedFields[index].type = value;
    setFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const schema = {};
      fields.forEach((field) => {
        if (field.name && field.type) {
          schema[field.name] = {
            type: field.type,
            constraints: "NOT NULL"
          };
        }
      });

      const postData = {
        tableName: tableName.toLowerCase().replace(/\s+/g, "_"),
        schema: schema
      };

      // Add debugging logs
      console.log("Post Data:", postData);

      const response = await axios.post(CONTENT_ADMIN_CREATE_COLLECTION, postData);

      if (response.status === 200) {
        alert("Table created successfully!");
        setTableName("");
        setFields([{ name: "", type: "TEXT" }]);
        navigate("/system-admin/modules/table-update"); // Redirect after successful creation
      }
    } catch (error) {
      console.error("Error creating table:", error);
      alert("Error creating table");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-8 text-center">Create New Table</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="mb-6">
            <label className="block mb-2 font-medium">Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Table Fields</label>
            {fields.map((field, index) => (
             <div key={index} className="flex flex-col gap-1 mb-3">
  <div className="flex gap-2">
    <input
      type="text"
      value={field.name}
      onChange={(e) => handleFieldNameChange(index, e.target.value)}
      placeholder="Field name"
      className="flex-1 p-2 border rounded"
      required
    />
    <select
      value={field.type}
      onChange={(e) => handleFieldTypeChange(index, e.target.value)}
      className="p-2 border rounded"
    >
      {fieldTypes.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
    <button
      type="button"
      onClick={() => removeField(index)}
      className="bg-red-500 text-white px-3 py-1 rounded"
    >
      Remove
    </button>
  </div>
  
  {/* 👇 Optional helper UI for IMAGE type */}
  {field.type === "IMAGE" && (
    <span className="text-xs text-blue-500 mt-1 ml-1">
      This field will store an image (e.g., profile picture, product photo).
    </span>
  )}
</div>

            ))}
            <button
              type="button"
              onClick={addField}
              className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
            >
              Add Field
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            {isLoading ? "Creating..." : "Create Table"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTableComponent;
