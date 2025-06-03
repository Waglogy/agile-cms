// DashboardLayout.js
import Sidebar from './Content-managerSidebar'
import Header from '../common/Header'
import { Outlet } from 'react-router-dom'

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#fefce8] text-[#1f1f1f] relative">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {children || <Outlet />} 
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
