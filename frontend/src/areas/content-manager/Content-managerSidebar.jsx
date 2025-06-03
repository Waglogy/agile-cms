import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Settings,
  Table,
  FileText,
  Wrench,
  PlusSquare,
  Eye,
  Code,
} from 'lucide-react' // added Table icon

const Sidebar = ({ mobile }) => {
  const { pathname } = useLocation()

  const navItems = [
    {
      to: '/content-manager/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={28} />,
    },
   
    { to: '/content-manager/insert-data', label: 'Add data', icon: <PlusSquare size={28} /> },
    { to: '/content-manager/collection-view', label: 'Show Tables', icon: <Eye size={28} /> },
  ]

  return (
    <aside
      className={`w-64 h-full bg-[#e75024] p-4 ${
        mobile ? '' : 'border-r border-[#b90325]'
      }`}
    >
      <div className="text-[#fefefe] text-2xl font-bold mb-6 px-2 tracking-tight">
        Agile CMS – Build, Edit, Publish… Faster
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
