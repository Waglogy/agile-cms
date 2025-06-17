// Dashboard.jsx
import Sidebar from './Content-managerSidebar'
import { Users, FileText, Shield } from 'lucide-react'

const stats = [
  {
    title: 'Total Users',
    count: 124,
    icon: <Users className="w-6 h-6 text-blue-600" />,
    bg: 'bg-blue-100',
  },
  {
    title: 'Content Types',
    count: 8,
    icon: <FileText className="w-6 h-6 text-green-600" />,
    bg: 'bg-green-100',
  },
  {
    title: 'Roles',
    count: 4,
    icon: <Shield className="w-6 h-6 text-purple-600" />,
    bg: 'bg-purple-100',
  },
]

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Welcome to the CMS Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(({ title, count, icon, bg }) => (
            <div
              key={title}
              className={`rounded-2xl shadow p-5 ${bg} flex items-center gap-4`}
            >
              <div className="p-3 rounded-full bg-white shadow-inner">
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-700">{title}</h2>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
