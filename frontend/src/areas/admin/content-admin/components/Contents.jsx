import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Contents = () => {
  const [collections, setCollections] = useState([])
  const [selectedCollection, setSelectedCollection] = useState('')
  const [collectionData, setCollectionData] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/collection')
      console.log('Fetched collections:', response.data)
      return response.data?.data?.get_all_collections || []
    } catch (err) {
      console.error('Error fetching collections:', err)
      throw new Error('Failed to load collections.')
    }
  }

  const fetchCollectionData = async (collectionName) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/collection/data/${collectionName}`
      )
      console.log('Fetched collection data:', response.data)
      return response.data?.data || []
    } catch (err) {
      console.error('Error fetching collection data:', err)
      throw new Error('Failed to load collection data.')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const collectionsData = await fetchCollections()
        setCollections(collectionsData)
        setError(null)
      } catch (err) {
        setError(err.message)
        setCollections([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleCollectionSelect = async (collectionName) => {
    setIsLoading(true)
    try {
      const data = await fetchCollectionData(collectionName)
      setCollectionData(data)
      setSelectedCollection(collectionName)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCollectionData([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Contents</h1>

      {isLoading && <div className="mb-4">Loading...</div>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block mb-2">Select Collection</label>
        <select
          value={selectedCollection}
          onChange={(e) => handleCollectionSelect(e.target.value)}
          className="p-2 border rounded w-full max-w-md"
        >
          <option value="">Select a collection</option>
          {collections.length > 0 ? (
            collections.map((col) => (
              <option key={col.collection_name} value={col.collection_name}>
                {col.collection_name || 'Unnamed Collection'}
              </option>
            ))
          ) : (
            <option disabled>No collections available</option>
          )}
        </select>
      </div>

      {selectedCollection && collectionData.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                {Object.keys(collectionData[0] || {}).map((key) => (
                  <th key={key} className="px-4 py-2 border font-semibold">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collectionData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-2 border">
                      {typeof value === 'string' && value.includes('<') ? (
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                      ) : typeof value === 'object' ? (
                        <pre className="text-xs">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCollection && collectionData.length === 0 && !isLoading && (
        <div className="text-gray-500 mt-4">
          No data available for this collection.
        </div>
      )}
    </div>
  )
}

export default Contents
