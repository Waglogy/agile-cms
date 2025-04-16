import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet for nested routes
import axios from '../../../api/axios';
import Dashboard from '../common/dashboard-components/dashboard.component';

const ContentAdminDashboard = () => {
  const [collections, setCollections] = useState([]);
  const [collectionData, setCollectionData] = useState({});

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/collection");
        if (response.data.status && response.data.data.get_all_collections) {
          setCollections(response.data.data.get_all_collections);
          fetchCollectionData(response.data.data.get_all_collections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    const fetchCollectionData = async (collections) => {
      const data = {};
      for (const collection of collections) {
        try {
          const response = await axios.get(`http://localhost:3000/api/collection/data/${collection.collection_name}`);
          if (response.data.status) {
            data[collection.collection_name] = response.data.data; // Ensure data is correctly assigned
          }
        } catch (error) {
          console.error(`Error fetching data for ${collection.collection_name}:`, error);
        }
      }
      setCollectionData(data);
    };

    fetchCollections();
  }, []);

  return (
    <Dashboard sideBarType={3}>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome Content Manager</h1>
        <Outlet /> {/* Render nested routes here */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Total Tables: {collections.length}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {collections.map((collection) => (
              <div
                key={collection.collection_name}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-bold mb-2">
                  {collection.collection_name}
                </h3>
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      {collection.columns?.map((col) => (
                        <th key={col.column_name} className="px-4 py-2 border">
                          {col.column_name}
                        </th>
                      ))}
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(
                      collectionData[collection.collection_name]
                    ) &&
                      collectionData[collection.collection_name].map(
                        (row, index) => (
                          <tr key={index}>
                            {collection.columns?.map((col) => (
                              <td
                                key={col.column_name}
                                className="px-4 py-2 border"
                              >
                                {typeof row[col.column_name] === 'string' &&
                                row[col.column_name].includes('<') ? (
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: row[col.column_name],
                                    }}
                                  />
                                ) : row[col.column_name] !== undefined ? (
                                  row[col.column_name]
                                ) : (
                                  'N/A'
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dashboard>
  )
};

export default ContentAdminDashboard;