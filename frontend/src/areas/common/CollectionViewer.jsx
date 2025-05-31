import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const CollectionViewer = () => {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [records, setRecords] = useState([])
  const { showAppMessage } = useNotification()

  useEffect(() => {
    fetchCollections()
  }, [])

  useEffect(() => {
    if (selectedCollection) fetchData()
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

  const fetchData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/collection/data/${selectedCollection}?files=false`
      )
      const rows = res?.data?.data || []
      setRecords(rows)
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to load collection data', 'error')
    }
  }

  const cleanValue = (value) => {
    if (value === null) return '—'
    if (typeof value === 'string') return value.replace(/^"+|"+$/g, '')
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (value?.includes?.('T')) {
      const date = new Date(value)
      return date.toLocaleString()
    }
    return value
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold text-[#0f172a] mb-4">
        View Collection Data
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
          <option value="">-- Choose a collection --</option>
          {collections.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((record, i) => (
            <div
              key={i}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition"
            >
              {Object.entries(record).map(([key, val]) => (
                <div key={key} className="mb-2">
                  <span className="font-semibold text-gray-700">{key}: </span>
                  <span className="text-gray-900">{cleanValue(val)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : selectedCollection ? (
        <p className="text-sm text-gray-500">
          No data available in this collection.
        </p>
      ) : null}
    </div>
  )
}

export default CollectionViewer
