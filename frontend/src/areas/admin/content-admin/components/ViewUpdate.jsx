import React, { useState, useEffect } from 'react'
import axios from '../../../../api/axios'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const ViewUpdate = () => {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [collectionData, setCollectionData] = useState([])
  const [editData, setEditData] = useState(null)
  const [editorStates, setEditorStates] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/collection')
        setCollections(response.data.data.get_all_collections)
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }
    fetchData()
  }, [])

  const handleCollectionSelect = async (collectionName) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/collection/data/${collectionName}`
      )
      setCollectionData(response.data.data)
      setSelectedCollection(collectionName)
    } catch (error) {
      console.error('Error fetching collection data:', error)
    }
  }

  const handleEdit = (record) => {
    setEditData(record)
    const initialEditorStates = {}
    Object.keys(record).forEach((key) => {
      initialEditorStates[key] = false
    })
    setEditorStates(initialEditorStates)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const postData = {
        tableName: selectedCollection,
        id: editData.id,
        updateData: { ...editData },
      }
      await axios.post('http://localhost:3000/api/collection/update', postData)
      alert('Content updated successfully!')
      setEditData(null)
      handleCollectionSelect(selectedCollection)
    } catch (err) {
      console.error('Failed to update content:', err)
      alert('Failed to update content')
    }
  }

  const handleDelete = async (id) => {
    try {
      const postData = {
        tableName: selectedCollection,
        id: id,
      }
      await axios.post('http://localhost:3000/api/collection/delete', postData)
      alert('Content deleted successfully!')
      handleCollectionSelect(selectedCollection)
    } catch (err) {
      console.error('Failed to delete content:', err)
      alert('Failed to delete content')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">View/Update Content</h1>
      <div className="mb-4">
        <label className="block mb-2">Select Table</label>
        <select
          value={selectedCollection}
          onChange={(e) => handleCollectionSelect(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select</option>
          {collections.map((col) => (
            <option key={col.collection_name} value={col.collection_name}>
              {col.collection_name}
            </option>
          ))}
        </select>
      </div>

      {selectedCollection &&
        Array.isArray(collectionData) &&
        collectionData.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {Object.keys(collectionData[0]).map((key) => (
                    <th key={key} className="px-4 py-2 border">
                      {key}
                    </th>
                  ))}
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collectionData.map((row, index) => (
                  <tr key={index}>
                    {Object.entries(row).map(([key, value], i) => {
                      let renderedValue

                      if (typeof value === 'string' && value.includes('<')) {
                        renderedValue = (
                          <div dangerouslySetInnerHTML={{ __html: value }} />
                        )
                      } else if (
                        typeof value === 'object' &&
                        value !== null &&
                        (value.thumb || value.medium || value.large)
                      ) {
                        renderedValue = (
                          <img
                            src={value.thumb || value.medium || value.large}
                            alt="media"
                            className="h-12 w-auto object-contain"
                          />
                        )
                      } else if (typeof value === 'object' && value !== null) {
                        renderedValue = (
                          <pre className="text-xs whitespace-pre-wrap">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        )
                      } else {
                        renderedValue =
                          value !== undefined && value !== null ? value : 'N/A'
                      }

                      return (
                        <td key={i} className="px-4 py-2 border">
                          {renderedValue}
                        </td>
                      )
                    })}

                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleEdit(row)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {editData && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-bold mb-4">Edit Content</h2>
          <form onSubmit={handleUpdate}>
            {Object.keys(editData).map((key) => (
              <div key={key} className="mb-4">
                <label className="block mb-2">{key}</label>
                {editorStates[key] ? (
                  <ReactQuill
                    theme="snow"
                    value={editData[key]}
                    onChange={(value) =>
                      setEditData({ ...editData, [key]: value })
                    }
                    className="bg-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={editData[key]}
                    onChange={(e) =>
                      setEditData({ ...editData, [key]: e.target.value })
                    }
                    className="p-2 border rounded w-full"
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setEditorStates((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                  className="text-sm mt-2 text-blue-500 hover:text-blue-700"
                >
                  {editorStates[key]
                    ? 'Switch to Text Input'
                    : 'Switch to Rich Editor'}
                </button>
              </div>
            ))}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ViewUpdate
