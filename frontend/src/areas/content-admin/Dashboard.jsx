import React, { useEffect, useState } from 'react'
import { LayoutDashboard, FileText, Users, Plus } from 'lucide-react'
import DashboardLayout from '../common/DashboardLayout'
import ContentList from './ContentList'
import axios from 'axios'

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm border w-full sm:w-1/2 lg:w-1/4">
    <div className="p-2 rounded-full bg-[#facc15] text-[#1f1f1f] mr-4">
      <Icon size={20} />
    </div>
    <div>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-lg font-semibold text-gray-800">{value}</div>
    </div>
  </div>
)

const AdminDashboard = () => {
  const [collections, setCollections] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)
      try {
        // Fetch all collections (tables)
        const resCollections = await axios.get(
          'http://localhost:8000/api/collection'
        )
        const collectionsList =
          resCollections?.data?.data?.get_all_collections || []

        // Fetch logs
        const resLogs = await axios.get(
          'http://localhost:8000/api/collection/logs/system-logs'
        )
        const logsList = resLogs?.data?.data || []

        setCollections(collectionsList)
        setLogs(logsList)
      } catch (err) {
        // Optionally: Show a toast/notification
        console.error('Dashboard API error:', err)
        setCollections([])
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Get recent tables (newest first)
  const recentTables = collections.slice().reverse().slice(0, 3)

  // Total count
  const totalTables = collections.length

  // Get recent logs (newest first, up to 4)
  const recentLogs = logs.slice(0, 4)

  // Optionally, if you want to filter managers or published/draft stats,
  // you can expand the stats array using collection info or other APIs.

  const stats = [
    { icon: LayoutDashboard, title: 'Total Tables', value: totalTables },
    // Optional: You can add more stats if you have published/draft info.
    // { icon: FileText, title: 'Published Tables', value: 0 },
    // { icon: FileText, title: 'Draft Tables', value: 0 },
    // { icon: Users, title: 'Managers', value: 0 },
  ]

  return (
    <>
      <div className="bg-white p-5 rounded-xl shadow-sm border text-gray-700">
        <h2 className="text-xl font-bold text-[#d90429] mb-2">
          Welcome, Content Admin!
        </h2>
        <p className="text-sm leading-relaxed">
          This is your central dashboard where you can manage all the tables,
          assign content managers, and monitor activity across the system. Use
          the quick stats to get an overview, track recent updates, and view
          table assignments. Click "Add Table" to create a new schema.
        </p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>
      <div className="max-w-6xl mx-auto p-6">
        <ContentList tableName="tbl_articles" />
      </div>
      {/* Recent Tables */}
      <div className="bg-white rounded-xl p-4 shadow-sm border my-6">
        <h2 className="text-lg font-semibold mb-2 text-[#d90429]">
          3 Most Recent Tables
        </h2>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading recent tables…</div>
        ) : recentTables.length === 0 ? (
          <div className="text-gray-500 text-sm">No tables found.</div>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {recentTables.map((t, i) => (
              <li key={i}>
                <span className="font-medium">{t.collection_name}</span>
                {/* Optionally: <span> (Created: …) </span> */}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-2 text-[#d90429]">
          Recent System Logs
        </h2>
        {loading ? (
          <div className="text-gray-500 text-sm">Loading logs…</div>
        ) : recentLogs.length === 0 ? (
          <div className="text-gray-500 text-sm">No logs found.</div>
        ) : (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {recentLogs.map((log, i) => (
              <li key={i}>
                {log.action_type ? (
                  <span>
                    <span className="font-medium text-gray-900">
                      {log.action_type.replace('_', ' ').toUpperCase()}
                    </span>{' '}
                    {log.table_name && (
                      <>
                        on <span className="font-bold">{log.table_name}</span>
                      </>
                    )}
                    {log.user_email && (
                      <>
                        {' '}
                        by{' '}
                        <span className="text-gray-700">{log.user_email}</span>
                      </>
                    )}
                    <span className="ml-2 text-gray-400 text-xs">
                      {log.created_at &&
                        new Date(log.created_at).toLocaleString()}
                    </span>
                  </span>
                ) : (
                  <span>{JSON.stringify(log)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Table Assignments / Table List */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#d90429]">
            Table Assignments
          </h2>
          <button className="bg-[#d90429] hover:bg-[#a30220] text-white px-3 py-1 rounded text-sm flex items-center gap-1">
            <Plus size={16} /> Add Table
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-600">
                <th className="py-2">Table</th>
                <th className="py-2">Manager</th>
                {/* <th className="py-2">Last Updated</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-3 text-center text-gray-500">
                    Loading tables…
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-3 text-center text-gray-500">
                    No tables available.
                  </td>
                </tr>
              ) : (
                collections
                  .slice(0, 8) // just show a few
                  .map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 font-medium text-gray-800">
                        {row.collection_name}
                      </td>
                      <td className="py-2 text-gray-700">
                        {/* Manager name can be filled here if available in API */}
                        N/A
                      </td>
                      {/* <td className="py-2 text-gray-500">{row.updated}</td> */}
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
