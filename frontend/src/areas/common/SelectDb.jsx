// SelectDb.jsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const SelectDb = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [selectedDb, setSelectedDb] = useState('')
  // Placeholder DB list; you can replace this with real data later
  const availableDbs = ['db1', 'db2', 'db3']

  useEffect(() => {
    // If no role was passed, send back to login
    if (!state || !state.role) {
      navigate('/', { replace: true })
    }
  }, [state, navigate])

  const onSubmit = (e) => {
    e.preventDefault()
    if (!selectedDb) return
    const role = state.role

    // After selecting a DB, navigate to the correct dashboard
    if (role === 'content_admin') {
      navigate('/content-admin/dashboard', {
        state: { db: selectedDb },
      })
    } else if (role === 'content_manager') {
      navigate('/content-manager/dashboard', {
        state: { db: selectedDb },
      })
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="h-screen w-screen bg-[#fefce8] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-[#1f1f1f] text-center">
          Select Database
        </h2>

        <div>
          <label className="block text-gray-700 mb-1" htmlFor="db">
            Choose a database
          </label>
          <select
            id="db"
            name="db"
            value={selectedDb}
            onChange={(e) => setSelectedDb(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e75024]"
          >
            <option value="" disabled>
              -- Select DB --
            </option>
            {availableDbs.map((db) => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#e75024] text-white font-semibold rounded-lg hover:bg-[#b60323] transition"
        >
          Continue
        </button>
      </form>
    </div>
  )
}

export default SelectDb
