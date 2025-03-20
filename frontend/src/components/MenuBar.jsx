import React from 'react';
import { FiHome, FiFileText, FiSettings, FiUser } from "react-icons/fi";

const MenuBar = () => {
    return (
        <div className="flex flex-col w-60 border-r border-gray-200 h-screen pt-5 bg-white mt-20">
            <div className="flex flex-col gap-4 px-6">
                <a href="/admin" className="group flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <FiHome size={20} className="mr-3 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Home</span>
                </a>
                <a href="/admin/content-builder" className="group flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <FiFileText size={20} className="mr-3 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Collection</span>
                </a>
                <a href="/admin/content-manager" className="group flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <FiUser size={20} className="mr-3 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Content Admin</span>
                </a>
                <a href="/" className="group flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <FiSettings size={20} className="mr-3 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Settings</span>
                </a>
            </div>
        </div>
    );
};

export default MenuBar;
