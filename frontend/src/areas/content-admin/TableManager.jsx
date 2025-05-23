// src/components/TableManager.js
import React, { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import {
  alterCollection,
  getCollectionData,
  getAllCollections,
} from '../../api/collectionApi'

const TableManager = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [updatedFields, setUpdatedFields] = useState([])
  const { showAppMessage } = useNotification()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await getAllCollections()
      const collectionList = response.data?.data?.get_all_collections

      console.log('Tables:', collectionList) // for debugging

      if (!Array.isArray(collectionList)) {
        showAppMessage('No collections found or invalid response', 'error')
        return
      }

      const mapped = collectionList.map((table) => ({
        name: table.collection_name,
        fields: table.columns.map((col) => ({
          name: col.column_name,
          type: col.data_type,
        })),
      }))

      setTables(mapped)
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to load tables', 'error')
    }
  }



  const handleEdit = (table) => {
    setSelectedTable(table)
    setUpdatedFields(table.fields)
  }

  const updateField = (index, key, value) => {
    const newFields = [...updatedFields]
    newFields[index][key] = value
    setUpdatedFields(newFields)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      for (const field of updatedFields) {
        await alterCollection({
          tableName: selectedTable.name,
          columnName: field.name,
          columnType: field.type.toUpperCase(),
        })
      }

      showAppMessage('Table altered successfully', 'success')
      fetchTables()
      setSelectedTable(null)
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to alter table', 'error')
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 text-[#d90429]">
        {selectedTable
          ? `Update Table: ${selectedTable.name}`
          : 'Manage Tables'}
      </h2>

      {!selectedTable ? (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="py-2">Table Name</th>
              <th className="py-2">Fields</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 ? (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  No tables found.
                </td>
              </tr>
            ) : (
              tables.map((table, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">
                    {table.name}
                  </td>
                  <td className="py-2 text-gray-600">
                    {table.fields.length} fields
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleEdit(table)}
                      className="text-sm text-[#d90429] flex items-center gap-1 hover:underline"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {updatedFields.map((field, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Field Type
                </label>
                <input
                  type="text"
                  value={field.type}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          ))}

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="bg-[#d90429] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setSelectedTable(null)}
              className="text-sm text-gray-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
export default TableManager;
