import React, { useEffect, useState } from 'react'
import {
  getAllCollections,
  getCollectionByName,
  insertDataToCollection,
} from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const InsertRecordForm = () => {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [schema, setSchema] = useState([])
  const [formData, setFormData] = useState({})
  const { showAppMessage } = useNotification()

  useEffect(() => {
    fetchCollections()
  }, [])

  useEffect(() => {
    if (selectedCollection) fetchSchema()
  }, [selectedCollection])

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

const SYSTEM_FIELDS = [
  'id',
  'status',
  'version',
  'created_at',
  'updated_at',
  'published_at',
]

const fetchSchema = async () => {
  try {
    const res = await getCollectionByName(selectedCollection)
    const columns = res?.data?.data || []
    const filtered = columns.filter(
      (col) => !SYSTEM_FIELDS.includes(col.column_name)
    )
    setSchema(filtered)
  } catch (err) {
    console.error(err)
    showAppMessage('Failed to fetch schema', 'error')
  }
}



  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  if (!selectedCollection) return

  try {
    // Only include non-empty string values
    const payload = {}
    for (const key in formData) {
      const val = formData[key]
      if (val !== '' && val !== null && val !== undefined) {
        payload[key] = val
      }
    }

    await insertDataToCollection(selectedCollection, payload)
    showAppMessage('Record inserted successfully', 'success')
    setFormData({})
  } catch (err) {
    console.error(err)
    showAppMessage('Failed to insert data', 'error')
  }
}


  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold text-[#0f172a] mb-4">
        Insert Record into Tables
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Collection
        </label>
        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">-- Choose a Table --</option>
          {collections.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {schema.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="bg-[#d90429] text-white px-4 py-2 rounded-md hover:bg-[#a30220]"
          >
            Insert Record
          </button>
        </form>
      )}
    </div>
  )
}

export default InsertRecordForm
