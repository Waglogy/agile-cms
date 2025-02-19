import React from 'react'
import { FiHome,FiFileText } from "react-icons/fi";

const MenuBar = () => {
    return(
        <div className="flex gap-4 items-center flex-col w-10 border-r h-screen pt-5">
        <a href="/admin"><FiHome size={20} className="text-zinc-700" /></a>
        <a href="/admin/content-builder"><FiFileText size={20} /></a>
        
      </div>
    )
}
export default MenuBar;