import React from 'react'
import {
  LayoutDashboard,
  PlusSquare,
  Eye,
  User,
  BookOpen,
  LogOut,
} from 'lucide-react'

// --- Sidebar component ---
const Sidebar = ({ current }) => {
  const navItems = [
    {
      to: '/content-manager/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={24} />,
    },
    {
      to: 'content-manager/add-data',
      label: 'Add Data',
      icon: <PlusSquare size={24} />,
    },
    {
      to: '/content-manager/collection-view',
      label: 'Show Tables',
      icon: <Eye size={24} />,
    },
    {
      to: '/content-manager/profile',
      label: 'Profile',
      icon: <User size={24} />,
    },
  ]

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[#e75024] flex flex-col p-4 border-r border-[#b90325]">
      <div className="text-[#fefefe] text-2xl font-bold mb-10 px-2 tracking-tight">
        Agile CMS
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon }) => {
          const isActive = current === to
          return (
            <a
              key={to}
              href={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#facc15] text-[#1f1f1f]'
                  : 'text-[#fefefe] hover:bg-[#b90325] hover:text-white'
              }`}
            >
              {icon}
              <span>{label}</span>
            </a>
          )
        })}
      </nav>
      <div className="flex-grow"></div>
      <a
        href="/logout"
        className="flex items-center gap-2 text-[#fefefe] px-3 py-2 rounded-md font-medium hover:bg-[#b90325] hover:text-white transition-all"
      >
        <LogOut size={20} /> Logout
      </a>
    </aside>
  )
}

// --- Dashboard content ---
const ContentManagerDashboard = () => {
  // You can fetch real data with useEffect/useState if needed
  const stats = [
    { label: 'My Tables', value: 8, icon: BookOpen },
    { label: 'My Entries', value: 45, icon: PlusSquare },
    { label: 'Profile Views', value: 110, icon: Eye },
  ]

  const recentActivity = [
    "Added a new quiz to 'Science Questions'",
    "Updated 'History MCQs' table",
    'Profile information changed',
    'Entry approved by Admin',
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar current="/content-manager/dashboard" />

      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#e75024] mb-2">
            Content Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome! Here’s your snapshot for the day—recent activity, quick
            stats, and everything you need to manage your content smoothly.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className="flex items-center p-4 bg-white rounded-xl shadow border gap-4"
            >
              <div className="p-2 rounded-full bg-[#facc15] text-[#1f1f1f]">
                <stat.icon size={28} />
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow border">
          <h2 className="text-lg font-semibold mb-3 text-[#e75024]">
            Recent Activity
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
            {recentActivity.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

export default ContentManagerDashboard
