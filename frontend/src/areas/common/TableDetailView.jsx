// src/areas/common/TableDetailView.jsx

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNotification } from '../../context/NotificationContext'

const TableDetailView = ({ tableName, records, onClose }) => {
  const [filteredRecords, setFilteredRecords] = useState([])
  const [status, setStatus] = useState('all')
  const { showAppMessage } = useNotification()
  const isSingleRecord = records.length === 1

  useEffect(() => {
    fetchFilteredData()
  }, [status])


const handleArchive = async (id) => {
  try {
    const res = await axios.post(
      'http://localhost:8000/api/collection/archive',
      {
        tableName,
        id,
      }
    )
    if (res.data?.status) {
      showAppMessage('Archived successfully', 'success')
      fetchFilteredData()
    } else {
      showAppMessage(res.data?.message || 'Archive failed', 'error')
    }
  } catch (err) {
    console.error(err)
    showAppMessage('Archive failed', 'error')
  }
}

  const fetchFilteredData = async () => {
    try {
      if (isSingleRecord) {
        setFilteredRecords(records)
      } else if (status === 'all') {
        setFilteredRecords(records)
      } else {
        const res = await axios.get(
          `http://localhost:8000/api/collection/published/${tableName}`
        )
        const data = res.data?.data || []
        const filtered = data.filter((row) => row.status === status)
        setFilteredRecords(filtered)
      }
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to fetch filtered data', 'error')
    }
  }

  const handleRollback = async (id, version) => {
    try {
      const res = await axios.post(
        'http://localhost:8000/api/collection/rollback',
        {
          tableName,
          id,
          version,
        }
      )
      if (res.data?.status) {
        showAppMessage('Rollback successful', 'success')
        fetchFilteredData()
      } else {
        showAppMessage(res.data?.message || 'Rollback failed', 'error')
      }
    } catch (err) {
      console.error(err)
      showAppMessage('Rollback failed', 'error')
    }
  }

  const renderValue = (value) => {
    if (value === null) return '—'
    if (typeof value === 'string' && value.includes('T')) {
      const date = new Date(value)
      return date.toLocaleString()
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value)
      } catch {
        return '[object]'
      }
    }
    return String(value)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-6xl p-6 rounded-lg shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {tableName} - {isSingleRecord ? 'Record Details' : 'Records'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-lg"
          >
            &times;
          </button>
        </div>

        {!isSingleRecord && (
          <div className="mb-4 flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border">
            <thead className="bg-gray-100">
              <tr>
                {filteredRecords &&
                  filteredRecords.length > 0 &&
                  filteredRecords[0] &&
                  Object.keys(filteredRecords[0]).map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 border font-medium text-gray-700"
                    >
                      {col}
                    </th>
                  ))}
                {!isSingleRecord && (
                  <th className="px-4 py-2 border font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRecords && filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="border-t">
                    {Object.keys(record).map((col) => (
                      <td key={col} className="px-4 py-2 border">
                        {renderValue(record[col])}
                      </td>
                    ))}
                    {!isSingleRecord && (
                      <td className="px-4 py-2 border">
                        {record.version > 1 && (
                          <button
                            onClick={() =>
                              handleRollback(record.id, record.version - 1)
                            }
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Rollback to v{record.version - 1}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="100%"
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    No records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TableDetailView
