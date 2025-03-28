import React from 'react'
import logo from '../assets/bbLogo.png'

const Header = ({ title }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 ">
        <img
          src={logo || '/placeholder.svg'}
          alt="Logo"
          className="h-8 w-auto"
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center relative shadow-lg">
          <input
            type="search"
            placeholder="Search..."
            className="w-64 text-black px-4 py-2 pl-10 text-sm bg-blue-50 border border-blue-400 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg
            className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m2.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
            />
          </svg>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 shadow-lg rounded-full">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Icon */}
        <button className="flex  items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
          <svg
            className="w-8 h-8 text-gray-700 "
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12 2a5 5 0 0 1 5 5v1a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5Zm-7 18c0-3.313 2.686-6 6-6h2c3.314 0 6 2.687 6 6a1 1 0 1 1-2 0c0-2.205-1.794-4-4-4h-2c-2.205 0-4 1.795-4 4a1 1 0 1 1-2 0Z"
              clipRule="evenodd"
            />
          </svg>

          <span className="hidden md:block font-medium">{title}</span>
        </button>
      </div>
    </header>
  )
}

export default Header
