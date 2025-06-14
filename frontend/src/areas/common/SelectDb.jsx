import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAvailableDatabases } from '../../api/collectionApi'
import axios from 'axios'
import API_BASE_URL from '../../api/config'

const SelectDb = () => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [selectedDb, setSelectedDb] = useState('')
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

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDb) return

    const role = state.role
    const path =
      role === 'content_admin'
        ? '/content-admin/dashboard'
        : role === 'content_manager'
          ? '/content-manager/dashboard'
          : '/'

    const response = await axios.post(`${API_BASE_URL}/init`, {
      db_name: selectedDb
    }, {
      withCredentials: true
    })

    console.log(response);

    // save the jwt token in local storage.
    localStorage.setItem('token', response?.data?.jwtToken)


    navigate(path)
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

        {status === 'loading' && (
          <p className="text-center text-gray-500">Loading databases...</p>
        )}

        {status === 'error' && (
          <p className="text-center text-red-500">Failed to load databases.</p>
        )}

        {status === 'success' && (
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
              {availableDb
                .filter((dbObj) => dbObj.datname !== 'template0' && dbObj.datname !== 'template1' && dbObj.datname !== 'postgres')
                .map((dbObj) => (
                  <option key={dbObj.datname} value={dbObj.datname}>
                    {dbObj.datname}
                  </option>
                ))}

            </select>
          </div>
        )}


        <button
          type="submit"
          disabled={status !== 'success'}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${status === 'success'
            ? 'bg-[#e75024] hover:bg-[#b60323]'
            : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          Continue
        </button>
      </form>
    </div>
  )
}

export default SelectDb
