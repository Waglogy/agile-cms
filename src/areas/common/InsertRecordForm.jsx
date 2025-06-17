// src/areas/common/InsertRecordForm.jsx

import React, { useEffect, useState } from 'react'
import {
  getAllCollections,
  getCollectionByName,
} from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const SYSTEM_FIELDS = [
  'id',
  'status',
  'version',
  'created_at',
  'updated_at',
  'published_at',
]

const ITEMS_PER_PAGE = 6

const EXCLUDED_TABLES = [
  'content_versions',
  'logs',
  'roles',
  'settings',
  'user_roles',
  'users',
  'images',
  'utbl_image_galleries',
]

const InsertRecordForm = () => {
  const [collections, setCollections] = useState([])
  const [collectionSearch, setCollectionSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [schema, setSchema] = useState([])
  const [formData, setFormData] = useState({})
  const [selectedFiles, setSelectedFiles] = useState({})
  const [richTextFields, setRichTextFields] = useState({})
  const { showAppMessage } = useNotification()

  // Fetch all collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getAllCollections()
        const list = res?.data?.data?.get_all_collections || []
        setCollections(
          list
            .filter((c) => !EXCLUDED_TABLES.includes(c.collection_name))
            .map((c) => c.collection_name)
        )
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to load collections', 'error')
      }
    }
    fetchCollections()
  }, [showAppMessage])

  // Fetch schema on collection select
  useEffect(() => {
    if (!selectedCollection) return

    const fetchSchema = async () => {
      try {
        const res = await getCollectionByName(selectedCollection)
        const columns = res?.data?.data || []
        const meta = res?.data?.meta_data || {}

        const filtered = columns
          .filter((col) => !SYSTEM_FIELDS.includes(col.column_name))
          .map((col) => {
            let is_multiple = false
            const m = typeof meta[col.column_name] === 'string'
              && meta[col.column_name].match(/is_multiple=(t|f)/)
            if (m) is_multiple = m[1] === 't'
            return { ...col, is_multiple }
          })

        setSchema(filtered)
        setFormData({})
        setSelectedFiles({})
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to fetch schema', 'error')
      }
    }

    fetchSchema()
  }, [selectedCollection, showAppMessage])

  // Handle non-file field changes
  const handleChange = (key, value, type) => {
    let processed = value

    if (type === 'integer') {
      processed = value === '' ? null : parseInt(value, 10) || null
    } else if (type === 'boolean') {
      processed = Boolean(value)
    } else if (value === '') {
      processed = null
    }

    setFormData((prev) => ({ ...prev, [key]: processed }))
  }

  // Track selected files per field
  const handleFileSelection = (fieldName, files) => {
    setSelectedFiles((prev) => ({ ...prev, [fieldName]: files }))
  }

  // Toggle rich text editor
  const toggleRichText = (field) => {
    setRichTextFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    const submitData = new FormData()

    // Append files first
    Object.entries(selectedFiles).forEach(([field, fileList]) => {
      Array.from(fileList).forEach((file) => {
        submitData.append(field, file)
      })
    })

    // Append other fields
    schema.forEach((f) => {
      if (f.data_type !== 'jsonb') {
        const val = formData[f.column_name]
        if (val !== null && val !== undefined) {
          submitData.append(f.column_name, val)
        }
      }
    })

    // Collection name
    submitData.append('collectionName', selectedCollection)

    try {
      const res = await axios.post(
        'http://localhost:8000/api/collection/insert',
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'auth-token': localStorage.getItem('token'),
          },
        }
      )

      if (res.data.status) {
        showAppMessage('Record inserted successfully', 'success')
        setFormData({})
        setSelectedFiles({})
      } else {
        throw new Error(res.data.message || 'Insert failed')
      }
    } catch (err) {
      console.error(err)
      showAppMessage(err.message || 'Failed to insert record', 'error')
    }
  }

  // Filter & paginate collections
  const filtered = collections.filter((name) =>
    name.toLowerCase().includes(collectionSearch.trim().toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE)

  // Quill config
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  }
  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
  ]

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold mb-4">Insert Record into Tables</h2>

      {/* Search & Pagination */}
      <div className="flex justify-between mb-6">
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
            className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 disabled:bg-gray-200"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md ${currentPage === i + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-100'
                }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 disabled:bg-gray-200"
          >
            Next
          </button>
        </div>
      </div>

      {/* Collection Cards */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">
          {collectionSearch ? 'No tables match.' : 'No tables found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {pageItems.map((name) => (
            <div
              key={name}
              className="border rounded-lg p-4 bg-gray-50 flex justify-between"
            >
              <span className="font-semibold">{name}</span>
              <button
                onClick={() =>
                  setSelectedCollection(
                    selectedCollection === name ? null : name
                  )
                }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {selectedCollection === name ? 'Close' : 'Insert'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Insert Form */}
      {selectedCollection && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            Insert into "{selectedCollection}"
          </h3>

          {schema.length === 0 ? (
            <p>Loading schema…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              {schema.map((field) => (
                <div key={field.column_name}>
                  <div className="flex justify-between mb-1">
                    <label className="text-gray-700">
                      {field.column_name}
                      {!field.is_nullable && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {field.data_type === 'text' && (
                      <button
                        type="button"
                        onClick={() => toggleRichText(field.column_name)}
                        className="text-sm text-blue-600"
                      >
                        {richTextFields[field.column_name]
                          ? 'Plain'
                          : 'Rich Text'}
                      </button>
                    )}
                  </div>

                  {field.data_type === 'jsonb' ? (
                    <input
                      type="file"
                      multiple={field.is_multiple}
                      accept="image/*"
                      onChange={(e) =>
                        handleFileSelection(
                          field.column_name,
                          e.target.files
                        )
                      }
                      className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 rounded"
                    />
                  ) : field.data_type === 'text' &&
                    richTextFields[field.column_name] ? (
                    <ReactQuill
                      theme="snow"
                      value={formData[field.column_name] || ''}
                      onChange={(c) =>
                        handleChange(field.column_name, c, 'text')
                      }
                      modules={quillModules}
                      formats={quillFormats}
                      className="h-48 mb-12 border rounded"
                    />
                  ) : (
                    <input
                      type={
                        field.data_type === 'integer'
                          ? 'number'
                          : field.data_type === 'boolean'
                            ? 'checkbox'
                            : 'text'
                      }
                      required={!field.is_nullable}
                      checked={
                        field.data_type === 'boolean'
                          ? formData[field.column_name] === true
                          : undefined
                      }
                      value={
                        field.data_type === 'boolean'
                          ? undefined
                          : formData[field.column_name] ?? ''
                      }
                      onChange={(e) =>
                        handleChange(
                          field.column_name,
                          e.target.value,
                          field.data_type
                        )
                      }
                      className="w-full px-3 py-2 border rounded"
                      placeholder={`Enter ${field.column_name}`}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                className="bg-[#e75024] text-white px-4 py-2 rounded hover:bg-[#a30220]"
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
