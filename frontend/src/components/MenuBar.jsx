import React from 'react'
import { FiHome,FiFileText } from "react-icons/fi";

const MenuBar = () => {
    return(
        <div className="flex gap-4 items-center flex-col w-10 border-r h-[100vh] pt-5">
        <a href="/"><FiHome size={20} className="text-zinc-700" /></a>
        <FiFileText size={20} />
      </div>
    )
}
export default MenuBar;