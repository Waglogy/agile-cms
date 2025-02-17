import React from 'react';
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

const Dropdown = ({ isOpen, toggleDropdown }) => {
  return (
    <div className="dropdown dispaly-flex items-center ml-2">
      {isOpen ? (
        <FiChevronDown onClick={toggleDropdown} className="cursor-pointer" />
      ) : (
        <FiChevronRight onClick={toggleDropdown} className="cursor-pointer" />
      )}
    </div>
  );
};

export default Dropdown;
