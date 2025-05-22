// src/pages/AdminDashboard.js
import React from 'react'
import { LayoutDashboard, FileText, Users, Plus } from 'lucide-react'
import DashboardLayout from '../common/DashboardLayout'

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
  const stats = [
    { icon: LayoutDashboard, title: 'Total Tables', value: 35 },
    { icon: FileText, title: 'Published Tables', value: 22 },
    { icon: FileText, title: 'Draft Tables', value: 8 },
    { icon: Users, title: 'Managers', value: 5 },
  ]

  const recentActivity = [
    'Table "Physics Questions" updated by Abhisek',
    'New manager "Ananya" added',
    'Draft table "History MCQs" created',
    '"Biology MCQs" published by Bhupesh',
  ]

  const tables = [
    { name: 'Biology Quiz', manager: 'Ananya', updated: '2 hours ago' },
    { name: 'Polity Archive', manager: 'Rohit', updated: 'Yesterday' },
    { name: 'Physics Basics', manager: 'Abhisek', updated: 'Just now' },
  ]

  return (
    <>
      {/* Welcome / Guide Text */}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h2 className="text-lg font-semibold mb-2 text-[#d90429]">
          Recent Activity
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          {recentActivity.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Table Assignments */}
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
                <th className="py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((row, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">{row.name}</td>
                  <td className="py-2 text-gray-700">{row.manager}</td>
                  <td className="py-2 text-gray-500">{row.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
