// src/areas/common/CollectionViewer.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'
import { Eye } from 'lucide-react'
import TableDetailView from './TableDetailView'

/**
 * Renders one collection's data: search + paginated table + CSV export.
 */
const CollectionTable = ({ name, records, onViewDetails }) => {
  const ITEMS_PER_PAGE = 5
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
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
    link.setAttribute('download', `${name}_export_${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <button
          onClick={() => onViewDetails(name, records)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <Eye size={20} />
          View Details
        </button>
      </div>

      {/* Search box + Export button */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search rows..."
          className="w-2/3 px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleExport}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 font-medium text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, idx) => (
              <tr
                key={`${name}-${startIdx + idx}`}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2">
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
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No matching records.</p>
        )}
      </div>

      {/* Pagination controls for rows */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center space-x-2 mt-4">
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
      )}
    </div>
  )
}

/**
 * Fetches all collections, then renders a paginated list of CollectionTable components.
 * Adds a top-right search box to filter which collections are shown.
 */
const CollectionViewer = () => {
  const [collections, setCollections] = useState([]) // [ 'users', 'orders', … ]
  const [recordsMap, setRecordsMap] = useState({}) // { users: [ … ], orders: [ … ] }
  const [loading, setLoading] = useState(true)
  const [collectionSearch, setCollectionSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTable, setSelectedTable] = useState(null)
  const ITEMS_PER_PAGE_COLLECTIONS = 5
  const { showAppMessage } = useNotification()

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // 1) Get list of collection names
        const res = await getAllCollections()
        const list = res?.data?.data?.get_all_collections || []
        const names = list.map((c) => c.collection_name)
        setCollections(names)

        // 2) Fetch data for each collection in parallel
        const allFetches = names.map(async (colName) => {
          try {
            const r = await axios.get(
              `http://localhost:8000/api/collection/data/${colName}?files=false`
            )
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
  }, [showAppMessage])

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
    name.toLowerCase().includes(collectionSearch.trim().toLowerCase())
  )

  // Compute pagination for filtered collections
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCollections.length / ITEMS_PER_PAGE_COLLECTIONS)
  )
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE_COLLECTIONS
  const paginatedCollections = filteredCollections.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE_COLLECTIONS
  )

  const handleViewDetails = (tableName, records) => {
    setSelectedTable({ name: tableName, records })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#0f172a]">
          View All Collections
        </h2>

        {/* Search box for collections */}
        <input
          type="text"
          value={collectionSearch}
          onChange={(e) => {
            setCollectionSearch(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search collections..."
          className="w-1/3 px-3 py-2 border rounded-md"
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
              name={colName}
              records={recordsMap[colName] || []}
              onViewDetails={handleViewDetails}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
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
          )}
        </>
      )}

      {/* Table Detail View Modal */}
      {selectedTable && (
        <TableDetailView
          tableName={selectedTable.name}
          records={selectedTable.records}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  )
}

export default CollectionViewer
