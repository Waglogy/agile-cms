import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNotification } from '../../context/NotificationContext'

const STATUS_OPTIONS = ['draft', 'published', 'archived']

const ContentList = ({ tableName }) => {
  const [content, setContent] = useState([])
  const [statusFilter, setStatusFilter] = useState('published')
  const { showAppMessage } = useNotification()

  useEffect(() => {
    if (tableName) fetchContent()
  }, [tableName, statusFilter])

  const fetchContent = async () => {
    try {
      const res = await axios.get(
        `/api/collection/${statusFilter}/${tableName}`
      )
      setContent(res.data.data || [])
    } catch (err) {
      console.error(err)
      showAppMessage('Failed to fetch content', 'error')
    }
  }

  const handleRollback = async (id, version) => {
    try {
      await axios.post('/api/collection/rollback', {
        tableName,
        id,
        version,
      })
      showAppMessage('Rollback successful', 'success')
      fetchContent()
    } catch (err) {
      console.error(err)
      showAppMessage('Rollback failed', 'error')
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#e75024]">
          Content: {tableName}
        </h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="text-left bg-gray-100 text-gray-600">
            <th className="px-2 py-1">ID</th>
            <th className="px-2 py-1">Status</th>
            <th className="px-2 py-1">Version</th>
            <th className="px-2 py-1">Created At</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {content.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No content found.
              </td>
            </tr>
          ) : (
            content.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-2 py-1">{item.id}</td>
                <td className="px-2 py-1">{item.status}</td>
                <td className="px-2 py-1">{item.version}</td>
                <td className="px-2 py-1">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleRollback(item.id, item.version)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Rollback
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ContentList
