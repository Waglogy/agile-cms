import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaPlus, FaList, FaEdit } from 'react-icons/fa';

const ContentAdminSidebar = ({ pathname }) => {
  return (
    <nav>
      <ul className="space-y-1">
        <li>
          <Link
            to="add"
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              pathname.includes('add')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaPlus className="w-5 h-5" />
            <span className="ml-3">Add Content</span>
          </Link>
        </li>
        <li>
          <Link
            to="contents"
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              pathname.includes('contents')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaList className="w-5 h-5" />
            <span className="ml-3">Contents</span>
          </Link>
        </li>
        <li>
          <Link
            to="view-update"
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
              pathname.includes('view-update')
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaEdit className="w-5 h-5" />
            <span className="ml-3">View/Update</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default ContentAdminSidebar;