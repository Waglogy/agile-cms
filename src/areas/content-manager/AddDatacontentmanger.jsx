import React, { useEffect, useState, lazy, Suspense } from 'react'
import {
  getAllCollections,
  getCollectionByName,
  insertDataToCollection,
} from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'
import axios from 'axios'
import 'react-quill/dist/quill.snow.css'
import { Upload, X } from 'lucide-react'

// Use React.lazy instead of next/dynamic
const ReactQuillEditor = lazy(() => import('react-quill'))

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
  const [collections, setCollections] = useState([])
  const [collectionSearch, setCollectionSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [schema, setSchema] = useState([])
  const [formData, setFormData] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [richTextFields, setRichTextFields] = useState({})
  const { showAppMessage } = useNotification()
  const [imagePreviews, setImagePreviews] = useState({})
  const [uploadingImages, setUploadingImages] = useState({})

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

  useEffect(() => {
    if (!selectedCollection) return
    const fetchSchema = async () => {
      try {
        const res = await getCollectionByName(selectedCollection)
        const columns = res?.data?.data || []
        const meta_data = res?.data?.meta_data || {}
        const filtered = columns
          .filter((col) => !SYSTEM_FIELDS.includes(col.column_name))
          .map((col) => {
            const meta = meta_data[col.column_name]
            let is_multiple = false
            if (meta && typeof meta === 'string') {
              const m = meta.match(/is_multiple=(t|f)/)
              is_multiple = m?.[1] === 't'
            }
            return { ...col, is_multiple }
          })

        setSchema(filtered)
        setFormData({})
        setUploadedFiles({})
        // Reset rich text field toggles when schema changes
        const rtFields = {}
        filtered.forEach((field) => {
          rtFields[field.column_name] = false
        })
        setRichTextFields(rtFields)
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to fetch schema', 'error')
      }
    }
    fetchSchema()
  }, [selectedCollection, showAppMessage])

  // Handle file uploads (no changes here)
  const handleFileUpload = async (fieldName, files, isMultiple) => {
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const uploadRes = await axios.post(
        'http://localhost:8000/api/insert',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (uploadRes.data.status) {
        const fileUrls = uploadRes.data.data.map((file) => file.url)
        setUploadedFiles((prev) => ({
          ...prev,
          [fieldName]: isMultiple
            ? [...(prev[fieldName] || []), ...fileUrls]
            : fileUrls,
        }))
        setFormData((prev) => ({
          ...prev,
          [fieldName]: isMultiple
            ? JSON.stringify([
                ...(prev[fieldName] ? JSON.parse(prev[fieldName]) : []),
                ...fileUrls,
              ])
            : JSON.stringify(fileUrls[0]),
        }))
        showAppMessage('Files uploaded successfully', 'success')
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      showAppMessage('Failed to upload files', 'error')
    }
  }

  // Remove a file (no changes)
  const removeFile = (fieldName, fileUrl, isMultiple) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((url) => url !== fileUrl),
    }))
    setFormData((prev) => {
      if (isMultiple) {
        const updated = uploadedFiles[fieldName].filter(
          (url) => url !== fileUrl
        )
        return {
          ...prev,
          [fieldName]: JSON.stringify(updated),
        }
      } else {
        return {
          ...prev,
          [fieldName]: JSON.stringify(''),
        }
      }
    })
  }

  // Handle input changes for form fields
  const handleChange = (key, value, type) => {
    if (type === 'jsonb') return
    let processedValue = value
    if (type === 'integer') {
      processedValue = value === '' ? 0 : parseInt(value, 10) || 0
    } else if (type === 'boolean') {
      processedValue = Boolean(value)
    }
    setFormData((prev) => ({ ...prev, [key]: processedValue }))
  }

  // Handle rich text change
  const handleRichTextChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // Toggle rich text mode for a field
  const handleToggleRichText = (field) => {
    setRichTextFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
    setFormData((prev) => ({
      ...prev,
      [field]: '', // Reset the content when switching modes for clarity
    }))
  }

  // Submit new record
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCollection) return
    const payload = {}
    for (const key in formData) {
      const val = formData[key]
      if (val !== '' && val != null) payload[key] = val
    }
    try {
      await insertDataToCollection(selectedCollection, payload)
      showAppMessage('Record inserted successfully', 'success')
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

  const handleImageChange = async (fieldName, event) => {
    const files = Array.from(event.target.files)
    const isMultiple = schema.find(
      (field) => field.column_name === fieldName
    )?.is_multiple

    if (!isMultiple && files.length > 1) {
      showAppMessage('This field only accepts a single image')
      return
    }

    setUploadingImages((prev) => ({ ...prev, [fieldName]: true }))

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('image', file)
      })

      const response = await axios.post(
        'http://localhost:8000/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      const uploadedImages = response.data.urls || []

      // Update form data with image URLs
      setFormData((prev) => ({
        ...prev,
        [fieldName]: isMultiple
          ? [...(prev[fieldName] || []), ...uploadedImages]
          : uploadedImages[0],
      }))

      // Update previews
      const newPreviews = {}
      files.forEach((file, index) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews[`${fieldName}_${Date.now()}_${index}`] = reader.result
          setImagePreviews((prev) => ({ ...prev, ...newPreviews }))
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      showAppMessage('Failed to upload image')
    } finally {
      setUploadingImages((prev) => ({ ...prev, [fieldName]: false }))
    }
  }

  const removeImage = (fieldName, index) => {
    setFormData((prev) => {
      const newValue = Array.isArray(prev[fieldName])
        ? prev[fieldName].filter((_, i) => i !== index)
        : null
      return { ...prev, [fieldName]: newValue }
    })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold text-[#0f172a] mb-4">
        Insert Record into Tables
      </h2>
      {/* Search + Pagination */}
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

      {/* Grid of collection "cards" */}
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

      {/* Render insert form */}
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
                <div key={field.column_name} className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.column_name}
                    {field.data_type === 'jsonb' &&
                      (field.is_multiple ? ' (Multiple Images)' : ' (Image)')}
                  </label>

                  {/* For text: toggle between normal input and rich text */}
                  {field.data_type === 'text' ? (
                    <div>
                      <div className="flex items-center mb-2">
                        <label className="mr-2 text-xs font-semibold text-gray-500">
                          Use Rich Text
                        </label>
                        <input
                          type="checkbox"
                          checked={richTextFields[field.column_name] || false}
                          onChange={() =>
                            handleToggleRichText(field.column_name)
                          }
                          className="w-4 h-4"
                        />
                      </div>
                      {richTextFields[field.column_name] ? (
                        <Suspense fallback={<div>Loading editor...</div>}>
                          <ReactQuillEditor
                            theme="snow"
                            value={formData[field.column_name] || ''}
                            onChange={(content) => {
                              setFormData((prev) => ({
                                ...prev,
                                [field.column_name]: content,
                              }))
                            }}
                          />
                        </Suspense>
                      ) : (
                        <input
                          type="text"
                          value={formData[field.column_name] || ''}
                          onChange={(e) =>
                            handleChange(
                              field.column_name,
                              e.target.value,
                              field.data_type
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder={`Enter ${field.column_name}`}
                        />
                      )}
                    </div>
                  ) : field.data_type === 'jsonb' ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          multiple={field.is_multiple}
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(
                              field.column_name,
                              e.target.files,
                              field.is_multiple
                            )
                          }
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                        />
                      </div>
                      {uploadedFiles[field.column_name]?.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {uploadedFiles[field.column_name].map(
                            (fileUrl, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={fileUrl}
                                  alt={`Uploaded ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFile(
                                      field.column_name,
                                      fileUrl,
                                      field.is_multiple
                                    )
                                  }
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type={
                        field.data_type === 'boolean'
                          ? 'checkbox'
                          : field.data_type === 'integer'
                          ? 'number'
                          : 'text'
                      }
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
                      min={field.data_type === 'integer' ? 0 : undefined}
                      step={field.data_type === 'integer' ? 1 : undefined}
                      onChange={(e) =>
                        handleChange(
                          field.column_name,
                          e.target.value,
                          field.data_type
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-md ${
                        field.data_type === 'boolean' ? 'w-4 h-4' : ''
                      }`}
                      placeholder={`Enter ${field.column_name}`}
                    />
                  )}
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
