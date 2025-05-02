import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import axios from '../../../api/axios'
import Dashboard from '../common/dashboard-components/dashboard.component'

const ContentAdminDashboard = () => {
  const [collections, setCollections] = useState([])
  const [collectionData, setCollectionData] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const location = useLocation()
  const isRootContentAdmin = location.pathname === '/content-admin'

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/collection')
        if (response.data.status && response.data.data.get_all_collections) {
          const fetchedCollections = response.data.data.get_all_collections
          setCollections(fetchedCollections)
          fetchCollectionData(fetchedCollections)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
      }
    }

    const fetchCollectionData = async (collections) => {
      const data = {}
      for (const collection of collections) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/collection/data/${collection.collection_name}`
          )
          if (response.data.status) {
            data[collection.collection_name] = response.data.data
          }
        } catch (error) {
          console.error(
            `Error fetching data for ${collection.collection_name}:`,
            error
          )
        }
      }
      setCollectionData(data)
    }

    fetchCollections()
  }, [])

  const filteredCollections = collections.filter((c) =>
    c.collection_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage)
  const paginatedCollections = filteredCollections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <Dashboard sideBarType={3}>
      <div className="flex-1 p-8">
        {isRootContentAdmin ? (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome Content Manager</h1>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Total Tables: {collections.length}
                </h2>
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border px-4 py-2 rounded-md"
                />
              </div>

              {totalPages > 1 && (
                <div className="flex justify-end items-center space-x-2 mb-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {paginatedCollections.map((collection) => (
                  <div
                    key={collection.collection_name}
                    className="bg-white p-6 rounded-lg shadow-lg"
                  >
                    <h3 className="text-lg font-bold mb-2">
                      {collection.collection_name}
                    </h3>

                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr>
                          {collection.columns?.map((col) => (
                            <th
                              key={col.column_name}
                              className="px-4 py-2 border"
                            >
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
                                {collection.columns?.map((col) => {
                                  const value = row[col.column_name]
                                  let cellContent

                                  if (
                                    typeof value === 'string' &&
                                    value.includes('<')
                                  ) {
                                    cellContent = (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: value,
                                        }}
                                      />
                                    )
                                  } else if (
                                    value &&
                                    typeof value === 'object' &&
                                    (value.thumb || value.medium || value.large)
                                  ) {
                                    cellContent = (
                                      <img
                                        src={
                                          value.thumb ||
                                          value.medium ||
                                          value.large
                                        }
                                        alt="media"
                                        className="h-12 w-auto object-contain"
                                      />
                                    )
                                  } else if (typeof value === 'object') {
                                    cellContent = (
                                      <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    )
                                  } else {
                                    cellContent =
                                      value !== undefined ? value : 'N/A'
                                  }

                                  return (
                                    <td
                                      key={col.column_name}
                                      className="px-4 py-2 border"
                                    >
                                      {cellContent}
                                    </td>
                                  )
                                })}
                                <td className="px-4 py-2 border">—</td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>
    </Dashboard>
  )
}

export default ContentAdminDashboard
