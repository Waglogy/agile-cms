// src/components/SystemLogs.js
import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE =
  import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'

// Create axios instance with auth token interceptor
const api = axios.create({
  baseURL: API_BASE,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['auth-token'] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

const ITEMS_PER_PAGE = 10

const SystemLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/collection/logs/system-logs')
      setLogs(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter logs based on search term
  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      log.action_type?.toLowerCase().includes(searchLower) ||
      log.user_email?.toLowerCase().includes(searchLower) ||
      log.table_name?.toLowerCase().includes(searchLower) ||
      log.record_id?.toString().includes(searchLower) ||
      JSON.stringify(log.details)?.toLowerCase().includes(searchLower)
    )
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#e75024]">System Logs</h2>
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1) // Reset to first page on search
          }}
          className="px-3 py-2 border rounded-md w-64"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-gray-500">
          {searchTerm ? 'No logs match your search.' : 'No logs available.'}
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-4 shadow-sm bg-gray-50"
              >
                <p>
                  <strong>Action:</strong> {log.action_type}
                </p>
                <p>
                  <strong>User:</strong> {log.user_email}
                </p>
                <p>
                  <strong>Table:</strong> {log.table_name}
                </p>
                {log.record_id && (
                  <p>
                    <strong>Record ID:</strong> {log.record_id}
                  </p>
                )}
                <p>
                  <strong>Time:</strong>{' '}
                  {new Date(log.created_at).toLocaleString()}
                </p>
                <div className="mt-2">
                  <strong>Details:</strong>
                  <pre className="bg-gray-100 text-xs p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
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

          {/* Page Info */}
          <div className="text-center text-sm text-gray-500 mt-2">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)} of{' '}
            {filteredLogs.length} logs
          </div>
        </>
      )}
    </div>
  )
}

export default SystemLogs
