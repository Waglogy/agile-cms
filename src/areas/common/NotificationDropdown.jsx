// components/NotificationDropdown.js
import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

const NotificationDropdown = ({ notifications = [] }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative " ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-[#d90429] hover:text-[#a30220] transition"
        aria-label="Notifications"
      >
        <Bell size={22} />
      </button>

      {open && (
        <div className="absolute mt-6  right-0 mt-2 w-72 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-200">
          <div className="px-4 py-2 border-b text-sm font-semibold text-gray-700">
            Notifications
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500">
                No new notifications
              </li>
            ) : (
              notifications.map((note, i) => (
                <li
                  key={i}
                  className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer transition"
                >
                  {note}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
