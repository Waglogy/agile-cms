import React, { useState } from 'react'
import { X, ZoomIn } from 'lucide-react'

// Image Modal Component
const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Full size"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  )
}

// Table Detail View Component
const TableDetailView = ({ tableName, records, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState(null)
  const ITEMS_PER_PAGE = 10

  // Reuse the cleanValue function from CollectionViewer
  const cleanValue = (value) => {
    if (value === null) return '—'
    if (typeof value === 'string') {
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

  // Reuse the image detection functions from CollectionViewer
  const isImageUrl = (value) => {
    if (!value) return false
    if (typeof value === 'string') {
      return (
        value.startsWith('data:image/') ||
        /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value)
      )
    }
    if (typeof value === 'object' && value !== null) {
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
      const sizeOrder = ['thumb', 'large', 'medium']
      for (let size of sizeOrder) {
        if (value[size]) {
          if (typeof value[size] === 'string') return value[size]
          if (value[size].base64) return value[size].base64
          if (value[size].imagePath) return value[size].imagePath
        }
      }
    }
    return ''
  }

  // Filter and paginate records
  const filtered = records.filter((record) =>
    Object.values(record).some((val) =>
      cleanValue(val).toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  const columns = records.length > 0 ? Object.keys(records[0]) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{tableName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search in table..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginated.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-6 py-4 whitespace-nowrap">
                        {isImageUrl(row[col]) ? (
                          <div className="relative group">
                            <img
                              src={getImageSrc(row[col])}
                              alt=""
                              className="h-20 w-20 object-cover rounded cursor-pointer"
                              onClick={() =>
                                setSelectedImage(getImageSrc(row[col]))
                              }
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                              <ZoomIn
                                size={24}
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {cleanValue(row[col])}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIdx + 1} to{' '}
              {Math.min(startIdx + ITEMS_PER_PAGE, filtered.length)} of{' '}
              {filtered.length} entries
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      page === currentPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm bg-white border hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}

export default TableDetailView
