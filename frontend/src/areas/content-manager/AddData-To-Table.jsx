// src/areas/common/InsertRecordForm.jsx

import React, { useEffect, useState } from 'react'
import {
  getAllCollections,
  getCollectionByName,
  insertDataToCollection,
} from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const SYSTEM_FIELDS = [
  'id',
  'status',
  'version',
  'created_at',
  'updated_at',
  'published_at',
]

const ITEMS_PER_PAGE = 6

const InsertRecordForm = () => {
  const [collections, setCollections] = useState([]) // [ 'users', 'orders', … ]
  const [collectionSearch, setCollectionSearch] = useState('') // filter text
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [schema, setSchema] = useState([]) // array of { column_name, … }
  const [formData, setFormData] = useState({}) // { field1: value, … }
  const { showAppMessage } = useNotification()

  // Fetch all collection names on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getAllCollections()
        const list = res?.data?.data?.get_all_collections || []
        setCollections(list.map((c) => c.collection_name))
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to load collections', 'error')
      }
    }
    fetchCollections()
  }, [showAppMessage])

  // Fetch schema whenever a collection is selected
  useEffect(() => {
    if (!selectedCollection) return

    const fetchSchema = async () => {
      try {
        const res = await getCollectionByName(selectedCollection)
        const columns = res?.data?.data || []
        const filtered = columns.filter(
          (col) => !SYSTEM_FIELDS.includes(col.column_name)
        )
        setSchema(filtered)
        setFormData({}) // reset any previous inputs
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to fetch schema', 'error')
      }
    }

    fetchSchema()
  }, [selectedCollection, showAppMessage])

  // Handle input changes for form fields
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // Submit new record
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCollection) return

    // build payload only with non-empty values
    const payload = {}
    for (const key in formData) {
      const val = formData[key]
      if (val !== '' && val != null) payload[key] = val
    }

    try {
      await insertDataToCollection(selectedCollection, payload)
      showAppMessage('Record inserted successfully', 'success')
      // After inserting, clear form and optionally re-fetch schema if needed
      setFormData({})
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to insert data', 'error')
    }
  }

  // Filter collections by search term
  const filtered = collections.filter((name) =>
    name.toLowerCase().includes(collectionSearch.trim().toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedCollections = filtered.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  )

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold text-[#0f172a] mb-4">
        Insert Record into Tables
      </h2>

      {/* Search + Pagination for collection list */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          value={collectionSearch}
          onChange={(e) => {
            setCollectionSearch(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search tables..."
          className="w-1/3 px-3 py-2 border rounded-md"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`
              px-3 py-1 rounded-md text-sm
              ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`
                px-3 py-1 rounded-md text-sm
                ${
                  pageNum === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
              >
                {pageNum}
              </button>
            )
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-1 rounded-md text-sm
              ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Next
          </button>
        </div>
      </div>

      {/* Grid of collection “cards” with Insert button */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 mb-6">
          {collectionSearch
            ? 'No tables match your search.'
            : 'No tables found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {paginatedCollections.map((colName) => (
            <div
              key={colName}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition flex justify-between items-center"
            >
              <span className="font-semibold text-gray-800">{colName}</span>
              <button
                onClick={() =>
                  setSelectedCollection(
                    selectedCollection === colName ? null : colName
                  )
                }
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                {selectedCollection === colName ? 'Close' : 'Insert'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Render insert form when a table is selected */}
      {selectedCollection && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Insert into "{selectedCollection}"
          </h3>
          {schema.length === 0 ? (
            <p className="text-sm text-gray-500">
              Loading schema for {selectedCollection}…
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {schema.map((field) => (
                <div key={field.column_name}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.column_name}
                  </label>
                  <input
                    type="text"
                    value={formData[field.column_name] || ''}
                    onChange={(e) =>
                      handleChange(field.column_name, e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder={`Enter ${field.column_name}`}
                  />
                </div>
              ))}

              <button
                type="submit"
                className="bg-[#e75024] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
              >
                Insert Record
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default InsertRecordForm
