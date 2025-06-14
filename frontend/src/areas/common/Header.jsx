// Header.js (imports)
import { Menu } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import logo from '../../assets/bbLogo.png'
import { getUserRole } from '../../utils/roleManager'

const Header = ({ toggleSidebar }) => {
  const mockNotifications = [
    'New user registered',
    'Task "Design CMS UI" marked complete',
    'Server restarted at 3:00 AM',
  ]

  // Get role from localStorage
  const role = getUserRole()
  const displayRole =
    role === 'content_admin' ? 'Content Admin' : 'Content Manager'

  return (
    <header className="bg-[#fefce8] mx-4 md:mx-6 mt-4 rounded-xl shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="block md:hidden text-[#d90429]"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#d90429] tracking-tight">
            <img src={logo} alt="Agile CMS" className="w-40 h-10" />
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown notifications={mockNotifications} />
          <span className="text-[#1f1f1f] text-sm font-medium bg-[#facc15] px-3 py-1 rounded-full">
            {displayRole}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
