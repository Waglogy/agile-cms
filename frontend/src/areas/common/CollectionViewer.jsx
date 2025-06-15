// src/areas/common/CollectionViewer.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

const API_BASE = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['auth-token'] = token
  }
  return config
}, (error) => Promise.reject(error))

/**
 * Renders one collection's data: search + paginated table + CSV export.
 */
const CollectionTable = ({ tableName, records }) => {
  const ITEMS_PER_PAGE = 5
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handlePublish = async (rowId) => {
    try {
      setIsLoading(true)
      const response = await axios.post(
        'http://localhost:8000/api/collection/publish',
        {
          tableName: name,
          id: rowId,
        }
      )

      if (response.data.status) {
        showAppMessage('Record published successfully', 'success')
        window.location.reload()
      } else {
        throw new Error(response.data.message || 'Failed to publish record')
      }
    } catch (err) {
      console.error('Error publishing record:', err)
      showAppMessage(err.message || 'Failed to publish record', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRollback = async (rowId, currentVersion) => {
    try {
      setIsLoading(true)
      const response = await axios.post(
        'http://localhost:8000/api/collection/rollback',
        {
          tableName: name,
          id: rowId,
          version: currentVersion - 1, // Rollback to previous version
        }
      )

      if (response.data.status) {
        showAppMessage('Record rolled back successfully', 'success')
        window.location.reload()
      } else {
        throw new Error(response.data.message || 'Failed to rollback record')
      }
    } catch (err) {
      console.error('Error rolling back record:', err)
      showAppMessage(err.message || 'Failed to rollback record', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async (rowId) => {
    try {
      setIsLoading(true)
      const response = await axios.post(
        'http://localhost:8000/api/collection/collection/archive',
        {
          tableName: name,
          id: rowId,
        }
      )

      if (response.data.status) {
        showAppMessage('Record archived successfully', 'success')
        window.location.reload()
      } else {
        throw new Error(response.data.message || 'Failed to archive record')
      }
    } catch (err) {
      console.error('Error archiving record:', err)
      showAppMessage(err.message || 'Failed to archive record', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Convert various types into renderable strings
  const cleanValue = (value) => {
    if (value === null) return '—'
    if (typeof value === 'string') {
      // ISO date check (contains "T")
      if (value.includes('T')) {
        const date = new Date(value)
        return date.toLocaleString()
      }
      return value.replace(/^"+|"+$/g, '')
    }
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value)
      } catch {
        return '[object]'
      }
    }
    return String(value)
  }

  // Determines if a string is an image URL or base64
  const isImageUrl = (value) => {
    if (!value) return false
    if (typeof value === 'string') {
      // Detect base64 or image URLs
      return (
        value.startsWith('data:image/') ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value)
      )
    }
    if (typeof value === 'object' && value !== null) {
      // If any key in the object is a valid image (recursive for thumb/large/medium)
      return ['thumb', 'large', 'medium'].some(
        (size) =>
          value[size] &&
          ((typeof value[size] === 'string' && isImageUrl(value[size])) ||
            (typeof value[size] === 'object' &&
              (isImageUrl(value[size].base64) ||
                isImageUrl(value[size].imagePath))))
      )
    }
    return false
  }
  const getImageSrc = (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value.trim().replace(/^"+|"+$/g, '')
    if (typeof value === 'object' && value !== null) {
      // Prefer thumb, then large, then medium (customize order as you like)
      const sizeOrder = ['thumb', 'large', 'medium']
      for (let size of sizeOrder) {
        if (value[size]) {
          // Nested: can be base64 or imagePath string
          if (typeof value[size] === 'string') return value[size]
          if (value[size].base64) return value[size].base64
          if (value[size].imagePath) return value[size].imagePath
        }
      }
    }
    return ''
  }
  const isImageUrl = (value) => {
    if (!value) return false
    if (typeof value === 'string') {
      // Detect base64 or image URLs
      return (
        value.startsWith('data:image/') ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value)
      )
    }
    if (typeof value === 'object' && value !== null) {
      // If any key in the object is a valid image (recursive for thumb/large/medium)
      return ['thumb', 'large', 'medium'].some(
        (size) =>
          value[size] &&
          ((typeof value[size] === 'string' && isImageUrl(value[size])) ||
            (typeof value[size] === 'object' &&
              (isImageUrl(value[size].base64) ||
                isImageUrl(value[size].imagePath))))
      )
    }
    return false
  }
  const getImageSrc = (value) => {
    if (!value) return ''
    if (typeof value === 'string') return value.trim().replace(/^"+|"+$/g, '')
    if (typeof value === 'object' && value !== null) {
      // Prefer thumb, then large, then medium (customize order as you like)
      const sizeOrder = ['thumb', 'large', 'medium']
      for (let size of sizeOrder) {
        if (value[size]) {
          // Nested: can be base64 or imagePath string
          if (typeof value[size] === 'string') return value[size]
          if (value[size].base64) return value[size].base64
          if (value[size].imagePath) return value[size].imagePath
        }
      }
    }
    return ''
  }





  // Get the actual src (to strip quotes or get src from object)



  // Filter rows based on searchTerm (case-insensitive)
  const filtered = records.filter((record) =>
    Object.values(record).some((val) =>
      cleanValue(val).toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // If no rows at all
  if (records.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">{tableName}</h3>
        <p className="text-sm text-gray-500">
          No data available in this collection.
        </p>
      </div>
    )
  }

  // Determine column headers from the first record
  const columns = Object.keys(records[0])

  // Generate CSV string from all records (not paginated)
  const generateCSV = () => {
    if (records.length === 0) return ''

    // Helper to escape a single cell:
    const escapeCell = (cell) => {
      const str = cleanValue(cell)
      // If the string contains comma, quote or newline, wrap in double quotes and escape existing quotes
      if (/[,"\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Build header row
    const header = columns.map((col) => escapeCell(col)).join(',')

    // Build body rows
    const rows = records.map((row) =>
      columns.map((col) => escapeCell(row[col])).join(',')
    )

    return [header, ...rows].join('\r\n')
  }

  // Trigger download of the CSV file
  const handleExport = () => {
    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // Filename: collection name plus timestamp
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '')
    link.setAttribute('download', `${tableName}_export_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{tableName}</h3>

      {/* Search box + Export button */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => (
              <tr
                key={`${tableName}-${startIdx + idx}`}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {isImageUrl(row[col]) ? (
                      <img
                        src={getImageSrc(row[col])}
                        alt="img"
                        className="max-h-16 max-w-32 rounded border"
                        style={{ objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      cleanValue(row[col])
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                  <button
                    onClick={() => onViewDetails({ name, records: [row] })}
                    className="text-[#e75024] hover:text-[#d90429]"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  {row.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(row.id)}
                      disabled={isLoading}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}

                  {row.version > 1 && (
                    <button
                      onClick={() => handleRollback(row.id, row.version)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Rollback to v{row.version - 1}
                    </button>
                  )}

                  {row.status !== 'archived' && (
                    <button
                      onClick={() => handleArchive(row.id)}
                      disabled={isLoading}
                      className="text-gray-600 hover:text-black disabled:opacity-50"
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`
              px-3 py-1 rounded-md text-sm
              ${currentPage === 1
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
                  ${pageNum === currentPage
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-1 rounded-md text-sm
              ${currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Fetches all collections, then renders a paginated list of CollectionTable components.
 * Adds a top-right search box to filter which collections are shown.
 */
const CollectionViewer = () => {
  const { showAppMessage } = useNotification()
  const [collections, setCollections] = useState([])
  const [recordsMap, setRecordsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [collectionSearch, setCollectionSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTable, setSelectedTable] = useState(null)
  const ITEMS_PER_PAGE_COLLECTIONS = 5

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) Get list of collection names
        const res = await getAllCollections()
        const list = res?.data?.data?.get_all_collections || []
        const names = list
          .map((c) => c.table_name || c.collection_name)
          .filter((n) => typeof n === 'string' && n.trim() !== '')
        setCollections(names)

        // 2) Fetch data for each collection in parallel (only for non-excluded tables)
        const allFetches = names.map(async (colName) => {
          try {
            const r = await api.get(
              `/api/collection/data/${colName}?files=false`
            )
            console.log(r);
            
            return { name: colName, rows: r?.data?.data || [] }
          } catch (err) {
            console.error(`Failed to load data for ${colName}`, err)
            showAppMessage(`Failed to load data for ${colName}`, 'error')
            return { name: colName, rows: [] }
          }
        })

        const results = await Promise.all(allFetches)
        const map = {}
        results.forEach(({ name, rows }) => {
          map[name] = rows
        })
        setRecordsMap(map)
      } catch (err) {
        console.error(err)
        showAppMessage('Failed to load collections', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold text-[#0f172a] mb-4">
          View Collection Data
        </h2>
        <p className="text-gray-500">Loading all collections…</p>
      </div>
    )
  }

  // Filter collections by collectionSearch term
  const filteredCollections = collections.filter((name) =>
    name.toLowerCase().includes(collectionSearch.toLowerCase())
  )

  // Paginate collections
  const totalPages = Math.ceil(
    filteredCollections.length / ITEMS_PER_PAGE_COLLECTIONS
  )
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_COLLECTIONS
  const paginatedCollections = filteredCollections.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE_COLLECTIONS
  )

  if (loading) {
    return <div className="p-4">Loading collections...</div>
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search collections..."
          value={collectionSearch}
          onChange={(e) => setCollectionSearch(e.target.value)}
          className="border px-2 py-1 rounded w-full max-w-md"
        />
      </div>

      {filteredCollections.length === 0 ? (
        <p className="text-sm text-gray-500">
          {collectionSearch
            ? 'No collections match your search.'
            : 'No collections found.'}
        </p>
      ) : (
        <>
          {paginatedCollections.map((colName) => (
            <CollectionTable
              key={colName}
              tableName={colName}
              records={recordsMap[colName] || []}
            />
          ))}

          {/* Pagination controls for collections */}
          {filteredCollections.length > ITEMS_PER_PAGE_COLLECTIONS && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`
                  px-3 py-1 rounded-md text-sm
                  ${currentPage === 1
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
                      ${pageNum === currentPage
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`
                  px-3 py-1 rounded-md text-sm
                  ${currentPage === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CollectionViewer
