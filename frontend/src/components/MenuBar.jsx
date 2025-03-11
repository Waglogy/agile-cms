import React from 'react';
import { FiHome, FiFileText, FiSettings,FiUser } from "react-icons/fi";

const MenuBar = () => {
    return(
      <div className="flex gap-6 items-center flex-col w-60 border-r border-gray-200 h-screen pt-5 bg-white mt-20  ">
        <div className='flex gap-6  flex-col  space-x-3 text-xl font-semibold '> 
      <a href="/admin" className="group flex items-center font-semibold justify-start w-full text-gray-700 hover:text-red-500 mr-5 transition-colors duration-300">
          <FiHome size={24} className="mr-3 " />
          <span className="text-sm  group-hover:opacity-100  font-semibold transition-opacity duration-300">Home</span>
      </a>
      <a href="/admin/content-builder" className="group flex font-semibold items-center justify-start w-full text-gray-700 hover:text-red-500 transition-colors duration-300">
          <FiFileText size={24} className="mr-3" />
          <span className="text-sm  group-hover:opacity-100 font-semibold transition-opacity duration-300">Collection</span>
      </a>
      <a href="/admin/content-manager" className="group font-semibold flex items-center justify-start w-full text-gray-700 hover:text-red-500 transition-colors duration-300">
          <FiUser size={24} className="mr-3" />
          <span className="text-sm  group-hover:opacity-100 font-semibold transition-opacity duration-300">Content-Admin</span>
      </a>
      <a href="/" className="group flex items-center font-semibold justify-start w-full text-gray-700 hover:text-red-500 transition-colors duration-300">
          <FiSettings size={24} className="mr-3 font-semibold" />
          <span className="text-sm  group-hover:opacity-100 font-semibold transition-opacity duration-300">Settings</span>
      </a>
      </div>
  </div>
  
    );
}

export default MenuBar;
