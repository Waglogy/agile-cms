// src/areas/common/CollectionEditor.jsx
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNotification } from '../../context/NotificationContext'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// Modify the EXCLUDED_TABLES constant
const EXCLUDED_TABLES = [
  'content_versions',
  'logs',
  'roles',
  'settings',
  'user_roles',
  'users',
]

const CollectionEditor = () => {
  const { showAppMessage } = useNotification()
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('')
  const [records, setRecords] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null })
  const [searchTerm, setSearchTerm] = useState('')
  const [tableMetadata, setTableMetadata] = useState({}) // Store table metadata
  const [richTextFields, setRichTextFields] = useState({}) // Track which fields use rich text

  // System fields to exclude from display
  const systemFields = [
    'created_at',
    'updated_at',
    'published_at',
    'version',
    'status',
    'images',
    ' image_galleries',
  ]

  // Filter tables based on search term
  const filteredTables = tables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add this utility function at the top level of the component
  const cleanDataValue = (value) => {
    if (typeof value !== 'string') return value

    // Remove extra quotes, PostgreSQL Versioning text, and clean up the string
    return value
      .replace(/^"|"$/g, '') // Remove surrounding quotes
      .replace(/PostgreSQL Versioning/g, '') // Remove PostgreSQL Versioning text
      .replace(/\t/g, '') // Remove tab characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim() // Remove leading/trailing whitespace
  }

  // Delete entire collection/table
  const deleteCollection = async () => {
    if (!selectedTable) return

    if (
      !window.confirm(
        `Are you sure you want to delete the table "${selectedTable}"? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      const res = await axios.post(
        'http://localhost:8000/api/collection/delete-collection',
        {
          collectionName: selectedTable,
        }, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      }
      )

      if (res.data.status) {
        showAppMessage('Table deleted successfully.', 'success')
        // Reset state
        setSelectedTable('')
        setRecords([])
        // Refresh tables list
        const tablesRes = await axios.get(
          'http://localhost:8000/api/collection', {
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        }
        )
        if (tablesRes.data?.data?.get_all_collections) {
          const tablesData = tablesRes.data.data.get_all_collections.map(
            (collection) => collection.collection_name
          )
          setTables(tablesData)
        }
      } else {
        showAppMessage('Failed to delete table.', 'error')
      }
    } catch (err) {
      console.error('Error deleting table:', err)
      showAppMessage('Failed to delete table.', 'error')
    }
  }

  // Modify the useEffect that fetches tables to filter out excluded tables
  useEffect(() => {
    const fetchTables = async () => {
      try {
        console.log('Starting to fetch tables...')
        const res = await axios.get('http://localhost:8000/api/collection', {
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        })

        if (res.data?.data?.get_all_collections) {
          const tablesData = res.data.data.get_all_collections
            .filter(
              (collection) =>
                !EXCLUDED_TABLES.includes(collection.collection_name)
            )
            .map((collection) => collection.collection_name)
          setTables(tablesData)

          // Store metadata for each table (excluding system tables)
          const metadata = {}
          res.data.data.get_all_collections
            .filter(
              (collection) =>
                !EXCLUDED_TABLES.includes(collection.collection_name)
            )
            .forEach((collection) => {
              metadata[collection.collection_name] = collection.columns.filter(
                (col) => !systemFields.includes(col.column_name)
              )
            })
          setTableMetadata(metadata)
        }
      } catch (err) {
        console.error('Error fetching tables:', err)
        showAppMessage('Failed to fetch tables.', 'error')
        setTables([])
      }
    }

    fetchTables()
  }, [showAppMessage])

  // Fetch table data when selectedTable changes
  useEffect(() => {
    if (!selectedTable) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await axios.get(
          `http://localhost:8000/api/collection/data/${selectedTable}?files=false`, {
          headers: {
            'auth-token': localStorage.getItem('token')
          }
        }
        )
        // Clean the data when it's received
        const cleanedRecords = (res.data.data || []).map((record) => {
          const cleanedRecord = {}
          Object.keys(record).forEach((key) => {
            cleanedRecord[key] = cleanDataValue(record[key])
          })
          return cleanedRecord
        })
        setRecords(cleanedRecords)
      } catch (err) {
        console.error(err)
        showAppMessage(`Failed to fetch data for ${selectedTable}`, 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedTable, showAppMessage])

  // Add Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
      [{ align: [] }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
    ],
  }

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'link',
    'image',
    'color',
    'background',
    'align',
    'indent',
    'blockquote',
    'code-block',
  ]

  // Add toggle function for rich text editor
  const toggleRichText = (fieldName) => {
    setRichTextFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }))
  }

  // Modify startEdit to initialize rich text state
  const startEdit = (row) => {
    setEditingId(row.id)
    setEditData({ ...row })
    // Initialize rich text fields based on data type
    const richTextState = {}
    Object.keys(row).forEach((key) => {
      if (typeof row[key] === 'string' && row[key].includes('<p>')) {
        richTextState[key] = true
      }
    })
    setRichTextFields(richTextState)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleChange = (col, value) => {
    setEditData((prev) => ({ ...prev, [col]: value }))
  }

  const saveRow = async () => {
    const { id, ...updates } = editData
    const original = records.find((r) => r.id === id) || {}
    const updateData = {}

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== original[key]) {
        updateData[key] = cleanDataValue(updates[key])
      }
    })

    if (!Object.keys(updateData).length) {
      showAppMessage('No changes to save.', 'info')
      cancelEdit()
      return
    }

    try {
      await axios.post('http://localhost:8000/api/collection/update', {
        tableName: selectedTable,
        id: String(id),
        updateData,
      }, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      })

      showAppMessage('Row updated successfully.', 'success')

      // Update local state with cleaned data
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updateData } : r))
      )
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to update row.', 'error')
    } finally {
      cancelEdit()
    }
  }

  // Delete a single row from the table
  const deleteRow = async (id) => {
    if (!selectedTable || !id) return

    try {
      const res = await axios.post(
        'http://localhost:8000/api/collection/delete',
        {
          tableName: selectedTable,
          id: String(id),
        }, {
        headers: {
          'auth-token': localStorage.getItem('token')
        }
      }
      )

      if (res.data.status) {
        showAppMessage('Row deleted successfully.', 'success')
        // Update local state by removing the deleted row
        setRecords((prev) => prev.filter((record) => record.id !== id))
      } else {
        showAppMessage('Failed to delete row.', 'error')
      }
    } catch (err) {
      console.error('Error deleting row:', err)
      showAppMessage('Failed to delete row.', 'error')
    } finally {
      // Close the confirmation modal
      setDeleteConfirm({ show: false, id: null })
    }
  }

  const columns = records[0] ? Object.keys(records[0]) : []

  return (
    <div className="bg-white p-6 rounded-xl shadow border space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0f172a]">Edit Table Data</h2>
        {selectedTable && (
          <button
            onClick={deleteCollection}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Delete Table
          </button>
        )}
      </div>

      {/* Table Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTables.map((tableName) => (
            <div
              key={tableName}
              onClick={() => setSelectedTable(tableName)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedTable === tableName
                ? 'bg-blue-50 border-blue-500'
                : 'hover:bg-gray-50'
                }`}
            >
              <h3 className="font-medium text-gray-900">{tableName}</h3>
              {tableMetadata[tableName] && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>Fields: {tableMetadata[tableName].length}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tableMetadata[tableName].slice(0, 3).map((col) => (
                      <span
                        key={col.column_name}
                        className="px-2 py-1 bg-gray-100 rounded text-xs"
                      >
                        {col.column_name}
                      </span>
                    ))}
                    {tableMetadata[tableName].length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        +{tableMetadata[tableName].length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? 'No tables found matching your search.'
              : 'No tables available.'}
          </div>
        )}
      </div>

      {/* Table Data Section */}
      {selectedTable && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">
            Table Data: {selectedTable}
          </h3>
          {loading ? (
            <p>Loading table data…</p>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    {columns
                      .filter((col) => !systemFields.includes(col))
                      .map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 font-medium text-gray-700"
                        >
                          {col}
                        </th>
                      ))}
                    <th className="px-4 py-2 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row, idx) => {
                    const isEditing = row.id === editingId
                    return (
                      <tr
                        key={row.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        {columns
                          .filter((col) => !systemFields.includes(col))
                          .map((col) => (
                            <td key={col} className="px-4 py-2">
                              {isEditing ? (
                                <div className="space-y-2">
                                  {typeof row[col] === 'string' && (
                                    <button
                                      type="button"
                                      onClick={() => toggleRichText(col)}
                                      className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                                    >
                                      {richTextFields[col]
                                        ? 'Switch to Plain Text'
                                        : 'Use Rich Text Editor'}
                                    </button>
                                  )}
                                  {richTextFields[col] ? (
                                    <div className="border rounded-md">
                                      <ReactQuill
                                        theme="snow"
                                        value={editData[col] || ''}
                                        onChange={(content) =>
                                          handleChange(col, content)
                                        }
                                        modules={quillModules}
                                        formats={quillFormats}
                                        className="h-48 mb-12"
                                      />
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={editData[col] ?? ''}
                                      onChange={(e) =>
                                        handleChange(col, e.target.value)
                                      }
                                      className="w-full border rounded px-2 py-1"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div
                                  className="prose max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      typeof row[col] === 'string' &&
                                        row[col].includes('<p>')
                                        ? row[col]
                                        : String(row[col]),
                                  }}
                                />
                              )}
                            </td>
                          ))}
                        <td className="px-4 py-2 space-x-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={saveRow}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(row)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirm({ show: true, id: row.id })
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No data in selected table.</p>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete this row? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteRow(deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionEditor
