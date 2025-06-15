import React, { useState, useEffect } from 'react'
import { Pencil, Trash, Plus } from 'lucide-react'
import { useNotification } from '../../context/NotificationContext'
import {
  alterCollection,
  getAllCollections,
  deleteCollection,
} from '../../api/collectionApi'

const SUPPORTED_TYPES = [
  'TEXT',
  'INTEGER',
  'BOOLEAN',
  'TIMESTAMP',
  'DATE',
  'NUMERIC',
  'JSONB',
]

const EXCLUDED_TABLES = [
  'content_versions',
  'logs',
  'roles',
  'settings',
  'user_roles',
  'users',
  'images',
  'image_galleries',
]

const TableManager = () => {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [updatedFields, setUpdatedFields] = useState([])
  const { showAppMessage } = useNotification()

  const fetchTables = async () => {
    try {
      const response = await getAllCollections()
      const collectionList = response.data?.data?.get_all_collections

      if (!Array.isArray(collectionList)) {
        showAppMessage('No collections found or invalid response', 'error')
        return
      }

      const mapped = collectionList
        .filter((table) => !EXCLUDED_TABLES.includes(table.collection_name))
        .map((table) => ({
          name: table.collection_name,
          fields: table.columns.map((col) => ({
            name: col.column_name,
            originalName: col.column_name,
            type: SUPPORTED_TYPES.includes(col.data_type.toUpperCase())
              ? col.data_type.toUpperCase()
              : '',
            comment: '',
            action: 'type',
          })),
        }))

      setTables(mapped)
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to load tables', 'error')
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const handleEdit = (table) => {
    setSelectedTable(table)
    setUpdatedFields(table.fields)
  }

  const updateField = (index, key, value) => {
    const newFields = [...updatedFields]
    newFields[index][key] = value
    setUpdatedFields(newFields)
  }

  const handleAddColumn = () => {
    setUpdatedFields([
      ...updatedFields,
      {
        name: '',
        type: '',
        comment: '',
        action: 'add',
      },
    ])
  }

  const handleDropColumn = (index) => {
    const updated = [...updatedFields]
    updated[index].action = 'drop'
    setUpdatedFields(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      for (const field of updatedFields) {
        const type = field.type?.toUpperCase()
        const payload = {
          tableName: selectedTable.name,
          columnName: field.originalName || field.name,
        }

        if (field.action === 'drop') {
          payload.columnName = field.originalName
          payload.action = 'drop'
          await alterCollection(payload)
          continue
        }

        if (field.action === 'add') {
          if (!SUPPORTED_TYPES.includes(type)) {
            showAppMessage(
              `Invalid type "${type}" for column "${field.name}"`,
              'error'
            )
            continue
          }
          payload.action = 'add'
          payload.columnType = type
          if (field.comment) payload.comment = field.comment
          await alterCollection(payload)
          continue
        }

        if (field.originalName !== field.name) {
          payload.action = 'rename'
          payload.newName = field.name
          await alterCollection(payload)
        }

        if (field.comment?.trim()) {
          payload.action = 'comment'
          payload.comment = field.comment
          await alterCollection(payload)
        }

        if (SUPPORTED_TYPES.includes(type)) {
          payload.action = 'type'
          payload.columnType = type
          await alterCollection(payload)
        }
      }

      showAppMessage('Table altered successfully', 'success')
      fetchTables()
      setSelectedTable(null)
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to alter table', 'error')
    }
  }
  const handleDeleteTable = async (collectionName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the collection "${collectionName}"?`
    )
    if (!confirmed) return

    try {
      const res = await deleteCollection(collectionName)
      if (res.data.success) {
        showAppMessage(`Collection "${collectionName}" deleted`, 'success')
        fetchTables()
      } else {
        showAppMessage(
          res.data.message || 'Failed to delete collection',
          'error'
        )
      }
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to delete collection', 'error')
    }
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-xl font-bold mb-4 text-[#e75024]">
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
                  <td className="py-2 flex gap-2">
                    <button
                      onClick={() => handleEdit(table)}
                      className="text-sm text-[#e75024] flex items-center gap-1 hover:underline"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTable(table.name)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      <Trash size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <button
            type="button"
            onClick={handleAddColumn}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Add Column
          </button>

          {updatedFields.map((field, index) =>
            field.action === 'drop' ? (
              <div key={index} className="line-through text-gray-400">
                {field.originalName} (marked for deletion)
              </div>
            ) : (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start"
              >
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
                  <select
                    value={field.type}
                    onChange={(e) => updateField(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">-- Select Type --</option>
                    {SUPPORTED_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type === 'JSONB' ? 'Image' : type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Comment
                  </label>
                  <input
                    type="text"
                    placeholder="Optional comment"
                    value={field.comment || ''}
                    onChange={(e) =>
                      updateField(index, 'comment', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleDropColumn(index)}
                    className="text-xs text-red-600 mt-2 hover:underline"
                  >
                    <Trash size={12} className="inline-block mr-1" />
                    Drop column
                  </button>
                </div>
              </div>
            )
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="bg-[#e75024] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
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

export default TableManager
