import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAvailableDatabases } from '../../api/collectionApi'
import axios from 'axios'
import API_BASE_URL from '../../api/config'

const SelectDb = () => {
  const { state } = useLocation()
  const navigate = useNavigate()

  // toggle between selecting vs. creating
  const [mode, setMode] = useState('select')
  const [selectedDb, setSelectedDb] = useState('')
  const [newDbName, setNewDbName] = useState('')

  const [availableDb, setAvailableDb] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'success'

  const fetchAvailableDatabases = async () => {
    try {
      const { data } = await getAvailableDatabases()
      if (data.success) {
        setAvailableDb(data.data)
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchAvailableDatabases()
  }, [])

  useEffect(() => {
    if (!state || !state.role) {
      navigate('/', { replace: true })
    }
  }, [state, navigate])

  const onSubmit = async e => {
    e.preventDefault()
    const dbName = mode === 'create' ? newDbName.trim() : selectedDb
    if (!dbName) return

    try {
      const response = await axios.post(
        `${API_BASE_URL}/init`,
        { db_name: dbName },
        { withCredentials: true }
      )

      localStorage.setItem('token', response.data.jwtToken)
      const role = state.role
      const path =
        role === 'content_admin'
          ? '/content-admin/dashboard'
          : role === 'content_manager'
            ? '/content-manager/dashboard'
            : '/'

      navigate(path)
    } catch (err) {
      console.error(err)
      // handle error state if needed
    }
  }

  return (
    <div className="h-screen w-screen bg-[#fefce8] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-[#1f1f1f] text-center">
          {mode === 'select' ? 'Select Database' : 'Create New Database'}
        </h2>

        {/* Mode toggle */}
        <div className="flex justify-center gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="mode"
              value="select"
              checked={mode === 'select'}
              onChange={() => setMode('select')}
              className="form-radio"
            />
            <span className="ml-2">Select Existing</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="mode"
              value="create"
              checked={mode === 'create'}
              onChange={() => setMode('create')}
              className="form-radio"
            />
            <span className="ml-2">Create New</span>
          </label>
        </div>

        {status === 'loading' && (
          <p className="text-center text-gray-500">Loading databases...</p>
        )}
        {status === 'error' && (
          <p className="text-center text-red-500">Failed to load databases.</p>
        )}

        {status === 'success' && mode === 'select' && (
          <div>
            <label htmlFor="db" className="block text-gray-700 mb-1">
              Choose a database
            </label>
            <select
              id="db"
              value={selectedDb}
              onChange={e => setSelectedDb(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e75024]"
            >
              <option value="" disabled>
                -- Select DB --
              </option>
              {availableDb
                .filter(
                  db =>
                    !['template0', 'template1', 'postgres'].includes(db.datname)
                )
                .map(db => (
                  <option key={db.datname} value={db.datname}>
                    {db.datname}
                  </option>
                ))}
            </select>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <label htmlFor="newDb" className="block text-gray-700 mb-1">
              New Database Name
            </label>
            <input
              id="newDb"
              type="text"
              value={newDbName}
              onChange={e => setNewDbName(e.target.value)}
              required
              placeholder="e.g. mydatabase"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e75024]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={
            mode === 'select'
              ? status !== 'success' || !selectedDb
              : newDbName.trim() === ''
          }
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${(mode === 'select'
            ? status === 'success' && selectedDb
            : newDbName.trim())
            ? 'bg-[#e75024] hover:bg-[#b60323]'
            : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          {mode === 'select' ? 'Continue' : 'Create & Continue'}
        </button>
      </form>
    </div>
  )
}

export default SelectDb
