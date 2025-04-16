import React, { useState, useEffect } from 'react';
import { fetchCollections, fetchCollectionData } from "../../../../api/content-manager/collectionApi";

const Contents = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collectionData, setCollectionData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const collectionsData = await fetchCollections();
        console.log('Fetched collections:', collectionsData);
        setCollections(collectionsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections. Please try again later.');
        setCollections([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCollectionSelect = async (collectionName) => {
    try {
      const data = await fetchCollectionData(collectionName);
      console.log('Fetched collection data:', data); // Debug log
      setCollectionData(data);
      setSelectedCollection(collectionName);
      setError(null);
    } catch (error) {
      console.error('Error fetching collection data:', error);
      setError('Failed to load collection data. Please try again later.');
      setCollectionData([]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Contents</h1>
      {isLoading && <div className="mb-4">Loading collections...</div>}
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
          className="p-2 border rounded"
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
      {selectedCollection && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {Object.keys(collectionData[0] || {}).map((key) => (
                  <th key={key} className="px-4 py-2 border">
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
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Contents;