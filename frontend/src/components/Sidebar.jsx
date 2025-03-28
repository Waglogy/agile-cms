import React, { useEffect, useState } from 'react'
import Dropdown from '../reusable-components/buttons/DropdownButton'
import GetData from '../api/super_admin/GetData'

function Sidebar({ setModalOpen, setModalContent, setCollection }) {
  const [data, setData] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const result = await GetData()
      setData(result)
    }
    fetchData()
  }, [])

  const handleClick = (action) => {
    try {
      switch (action) {
        case 'toggleDropdown':
          setIsDropdownOpen(!isDropdownOpen)
          break
        case 'togglePopUp':
          setModalOpen(true)
          setModalContent('Collection Type')
          break
        default:
          console.log('NO INPUT')
          break
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col w-80 h-full p-6 bg-gradient-to-b from-blue-50 to-white border-r border-gray-200">
      {/* Header Section */}
      <div className="w-full p-4 mt-5 shadow-sm"></div>

      {/* Create New Collection Button */}
      <button
        className="flex items-center justify-center gap-2 w-full px-6 py-3 mt-4 text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => handleClick('togglePopUp')}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>Create New Collection</span>
      </button>

      {/* Collections Section */}
      <div className="flex mt-6 items-center p-6 flex-col bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-gray-800">Collections</h3>
          <Dropdown
            isOpen={isDropdownOpen}
            toggleDropdown={() => handleClick('toggleDropdown')}
            className="text-blue-600 hover:text-blue-700"
          />
        </div>

        {isDropdownOpen && data && (
          <ul className="w-full mt-4 space-y-2">
            {data.map((item, index) => (
              <li key={index} className="w-full">
                <button
                  onClick={() =>
                    setCollection(item.collection_name, item.columns)
                  }
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <span className="capitalize">{item.collection_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Collection Button */}
    </div>
  )
}

export default Sidebar
