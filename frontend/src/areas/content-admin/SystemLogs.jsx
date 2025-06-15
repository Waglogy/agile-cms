import React, { useEffect, useState } from 'react'
import axios from 'axios'

const SystemLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 10

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8000/api/collection/logs/system-logs'
      )
      setLogs(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate paginated logs
  const indexOfLastLog = currentPage * logsPerPage
  const indexOfFirstLog = indexOfLastLog - logsPerPage
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog)

  const totalPages = Math.ceil(logs.length / logsPerPage)

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-[#e75024]">System Logs</h2>
      {loading ? (
        <p className="text-gray-500">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs available.</p>
      ) : (
        <>
          <div className="space-y-4">
            {currentLogs.map((log) => (
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

          {/* Pagination controls */}
          <div className="flex justify-end mt-6 space-x-2">
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default SystemLogs
