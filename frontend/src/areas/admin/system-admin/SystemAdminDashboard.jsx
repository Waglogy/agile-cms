/* eslint-disable no-unused-vars */
import React from 'react'
import { useState, useEffect } from 'react'
import Dashboard from '../common/dashboard-components/dashboard.component'

export default function SystemAdminDashboard() {
  const [table, setTable] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetch('http://localhost:3000/api/collection')
      .then((res) => res.json())
      .then((response) => {
        console.log('Fetched response:', response)
        const { data } = response
        const { get_all_collections } = data
        if (Array.isArray(get_all_collections)) {
          setTable(get_all_collections)
        } else {
          console.error('Data is not an array:', get_all_collections)
          setTable([])
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err)
        setTable([])
      })
  }, [])

  const filteredTable = table.filter((collection) =>
    collection.collection_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredTable.length / itemsPerPage)
  const displayedData = filteredTable.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <>
      <section className="hidden lg:block">
        <Dashboard>
          <div className="flex items-center justify-center mt-9">
            <div className="text-center text-slate-700">
              <p className="text-4xl font-semibold text-[#124277]">
                Welcome System Admin!
              </p>
            </div>
          </div>

          <div className="mt-6 px-6">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // reset to page 1 on search
              }}
              className="mb-4 px-4 py-2 border rounded-lg w-full max-w-md"
            />
          </div>

          <div className="mt-2">
            <div className="p-6">
              <table className="min-w-full bg-white rounded-lg shadow-lg overflow-hidden font-inter">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 border-b text-left text-lg font-semibold text-gray-700">
                      Tables
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((collection, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 border-b text-gray-800 font-medium">
                        {collection.collection_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </Dashboard>
      </section>

      <section className="relative block lg:hidden w-[90%] mx-auto">
        <div className="mt-36 flex flex-col items-center justify-center">
          <p className="text-base font-semibold text-center">
            Bytesberry Technologies
          </p>
        </div>

        <div className="mt-10 text-center text-xs font-semibold">
          This dashboard is currently accessible only on Desktops and Laptops.
          Please visit us using a desktop device for the best experience.
        </div>
      </section>
    </>
  )
}
