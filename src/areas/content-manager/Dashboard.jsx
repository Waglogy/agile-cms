// src/areas/common/ContentManagerDashboard.jsx
import React, { useEffect, useState } from 'react'
import { BookOpen, PlusSquare, Eye } from 'lucide-react'
import Sidebar from '../common/Sidebar'
import axios from 'axios'

const ContentManagerDashboard = () => {
  const [collections, setCollections] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Assuming user email is stored in localStorage
  const userEmail = localStorage.getItem('user_email') || ''

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch all collections
        const resCollections = await axios.get(
          'http://localhost:8000/api/collection',
          {
            headers: { 'auth-token': localStorage.getItem('token') }
          }
        )
        const allCollections = resCollections?.data?.data?.get_all_collections || []

        // Fetch system logs
        const resLogs = await axios.get(
          'http://localhost:8000/api/collection/logs/system-logs',
          {
            headers: { 'auth-token': localStorage.getItem('token') }
          }
        )
        const allLogs = resLogs?.data?.data || []

        setCollections(allCollections)
        setLogs(allLogs)
      } catch (err) {
        console.error('Dashboard API error:', err)
        setCollections([])
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Derive stats
  const myTables = collections.length
  const myEntries = logs.filter(log => log.user_email === userEmail && ['insert', 'update'].includes(log.action_type)).length
  const profileViews = logs.filter(log => log.action_type === 'view_profile').length

  // Recent activity by this user
  const recentActivity = logs
    .filter(log => log.user_email === userEmail)
    .slice(0, 5)
    .map(log => {
      const action = log.action_type.replace('_', ' ')
      const table = log.table_name ? ` on '${log.table_name}'` : ''
      return `${action}${table}`
    })

  const stats = [
    { label: 'My Tables', value: myTables, icon: BookOpen },
    { label: 'My Entries', value: myEntries, icon: PlusSquare },
    { label: 'Profile Views', value: profileViews, icon: Eye },
  ]

  if (loading) {
    return <div className="p-4 text-gray-600">Loading dashboard…</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#e75024] mb-2">
            Content Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here’s your customized overview based on your recent activity.
          </p>
        </div>
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="flex items-center p-4 bg-white rounded-xl shadow border gap-4">
              <div className="p-2 rounded-full bg-[#facc15] text-[#1f1f1f]">
                <stat.icon size={28} />
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow border">
          <h2 className="text-lg font-semibold mb-3 text-[#e75024]">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <div className="text-gray-500 text-sm">No recent activity.</div>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
              {recentActivity.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

export default ContentManagerDashboard
