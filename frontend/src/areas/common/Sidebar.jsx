import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, Table } from 'lucide-react' // added Table icon

const Sidebar = ({ mobile }) => {
  const { pathname } = useLocation()

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    { to: '/create-table', label: 'Create Table', icon: <Table size={18} /> }, 
    { to: '/manage-tables', label: 'Manage Tables', icon: <Table size={18} /> },
    { to: '/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  ]

  return (
    <aside
      className={`w-64 h-full bg-[#d90429] p-4 ${
        mobile ? '' : 'border-r border-[#b90325]'
      }`}
    >
      <div className="text-[#fefefe] text-2xl font-bold mb-6 px-2 tracking-tight">
        Agile CMS
      </div>
      <nav className="flex flex-col space-y-1 text-sm">
        {navItems.map(({ to, label, icon }) => {
          const isActive = pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-[#facc15] text-[#1f1f1f]'
                  : 'text-[#fefefe] hover:bg-[#b90325] hover:text-white'
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
