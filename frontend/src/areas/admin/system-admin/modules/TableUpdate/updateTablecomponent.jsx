import React, { useState, useEffect } from "react";
import axios from "../../../../../api/axios";
import { CONTENT_ADMIN_ALTER_TABLE } from "../../../../../api/api_routing_urls";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Remove this line
// import "bootstrap/scss/bootstrap.scss";

const UpdateTableComponent = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTable, setEditTable] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnType, setNewColumnType] = useState("TEXT");
  const [showDeleteTableModal, setShowDeleteTableModal] = useState(false);
  const [showDeleteColumnModal, setShowDeleteColumnModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const fieldTypes = ["TEXT", "INTEGER", "BOOLEAN", "TIMESTAMP", "DATE", "NUMERIC", "JSONB"];

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/collection");
      if (response.data.status && response.data.data.get_all_collections) {
        // Transform the API response to match the expected format
        const tables = response.data.data.get_all_collections.map(collection => ({
          name: collection.collection_name,
          columns: collection.columns.map(column => ({
            name: column.column_name,
            type: column.data_type
          }))
        }));
        setTables(tables);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tables:", error);
      setLoading(false);
    }
  };

  const handleEdit = (table) => {
    setEditTable(table);
  };

  const handleAddColumn = async () => {
    if (!newColumnName || !newColumnType) return;

    try {
      const postData = {
        tableName: editTable.name,
        columnName: newColumnName,
        columnType: newColumnType,
        constraints: "NOT NULL"
      };

      await axios.post(CONTENT_ADMIN_ALTER_TABLE, postData);
      fetchTables();
      setNewColumnName("");
      setNewColumnType("TEXT");
      toast.success("Column added successfully!");
    } catch (error) {
      console.error("Error adding column:", error);
      toast.error("Error adding column");
    }
  };

  const handleDeleteTable = async (tableName) => {
    setSelectedTable(tableName);
    setShowDeleteTableModal(true);
  };

  const confirmDeleteTable = async () => {
    try {
      const postData = {
        collectionName: selectedTable.toLowerCase().replace(/\s+/g, "_")
      };
      await axios.post(
        "http://localhost:3000/api/collection/delete-collection",
        postData
      );
      fetchTables();
      toast.success("Table deleted successfully!");
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Error deleting table");
    }
    setShowDeleteTableModal(false);
  };

  const handleDeleteColumn = async (tableName, columnName) => {
    setSelectedTable(tableName);
    setSelectedColumn(columnName);
    setShowDeleteColumnModal(true);
  };

  const confirmDeleteColumn = async () => {
    try {
      await axios.post("http://localhost:3000/api/collection/attribute/delete", {
        tableName: selectedTable,
        columnName: selectedColumn
      });
      fetchTables();
      toast.success("Column deleted successfully!");
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Error deleting column");
    }
    setShowDeleteColumnModal(false);
  };

  if (loading) return <div>Loading tables...</div>;

  return (
    <div className="p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Delete Table Modal */}
      <Transition appear show={showDeleteTableModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowDeleteTableModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
      
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Delete
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete table {selectedTable}?
                    </p>
                  </div>
      
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowDeleteTableModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={confirmDeleteTable}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Delete Column Modal */}
      <Transition appear show={showDeleteColumnModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowDeleteColumnModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>
      
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Delete
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete column {selectedColumn} from table {selectedTable}?
                    </p>
                  </div>
      
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setShowDeleteColumnModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={confirmDeleteColumn}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Existing JSX */}
      <h1 className="text-2xl font-bold mb-8">Manage Tables</h1>
  

      {editTable ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Editing Table: {editTable.name}</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Add New Column</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name"
                className="p-2 border rounded"
              />
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value)}
                className="p-2 border rounded"
              >
                {fieldTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddColumn}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Column
              </button>
            </div>
          </div>

          <button
            onClick={() => setEditTable(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Back to Table List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tables.map((table) => (
            <div key={table.name} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{table.name}</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(table)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.name)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
  
              <div className="mt-4">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Columns:</h4>
                <ul className="space-y-2">
                  {table.columns.map((column, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">
                        <span className="font-medium">{column.name}</span> ({column.type})
                      </span>
                      <button
                        onClick={() => handleDeleteColumn(table.name, column.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdateTableComponent;