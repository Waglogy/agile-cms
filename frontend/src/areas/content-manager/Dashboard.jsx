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
      </div>
    </div>
  )
}

export default DashboardLayout
