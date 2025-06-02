// src/components/YourAPIs.jsx
import React, { useEffect, useState } from 'react'
import { getAllCollections } from '../../api/collectionApi'
import { useNotification } from '../../context/NotificationContext'
import API_BASE_URL from '../../api/config'

const YourAPIs = () => {
  const [collections, setCollections] = useState([])
  const { showAppMessage } = useNotification()

  useEffect(() => {
    fetchCollections()
  }, [])

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

  const copyToClipboard = (url) => {
    navigator.clipboard
      .writeText(url)
      .then(() => showAppMessage('URL copied to clipboard', 'success'))
      .catch(() => showAppMessage('Copy failed', 'error'))
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your GET APIs</h2>
      {collections.length === 0 ? (
        <p className="text-gray-500">No collections available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border text-left">Collection</th>
                <th className="px-4 py-2 border text-left">GET URL</th>
                <th className="px-4 py-2 border text-center">Copy</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => {
                const url = `${API_BASE_URL}/data/${col}`
                return (
                  <tr key={col} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-gray-700">{col}</td>
                    <td className="px-4 py-2 border break-all">
                      <code className="text-sm text-blue-600">{url}</code>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => copyToClipboard(url)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default YourAPIs
