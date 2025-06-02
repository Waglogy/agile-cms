// src/areas/common/CollectionViewer.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'

/**
 * Renders one collection’s data: search + paginated table.
 */
const CollectionTable = ({ name, records }) => {
  const ITEMS_PER_PAGE = 5
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Convert various types into renderable strings
  const cleanValue = (value) => {
    if (value === null) return '—'
    if (typeof value === 'string') {
      // ISO date check (contains “T”)
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

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{name}</h3>

      {/* Search box for rows */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search rows..."
          className="w-full px-3 py-2 border rounded-md"
        />
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
                    {cleanValue(row[col])}
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
    </div>
  )
}

export default CollectionViewer
