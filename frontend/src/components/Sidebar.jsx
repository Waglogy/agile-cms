import React, { useState } from "react";
import Dropdown from "../reusable-components/buttons/DropdownButton";

const Sidebar = ({ isModalOpen, setModalOpen, setModalContent }) => {
  const data = ["apple", "banana", "cat"];
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const handleClick = (action) => {
    try {
      switch (action) {
        case "toggleDropdown":
          setIsDropdownOpen(!isDropdownOpen);
          break;
        case "togglePopUp":
          setModalOpen(true);
          setModalContent("Collection Type");
          break;
        default:
          console.log("NO INPUT");
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-45 h-screen p-4 shadow-lg border-r">
      <h1 className="text-l font-bold">Content-Type Builder</h1>
      <hr />
      <div className="flex mt-5">
        <h3>Collection Types</h3>
        <Dropdown isOpen={isDropdownOpen} toggleDropdown={() => handleClick("toggleDropdown")} />
      </div>
      {isDropdownOpen && (
        <ul className="pl-10 mt-3">
          {data.map((item, index) => (
            <li key={index} className="mb-2 list-disc">{item}</li>
          ))}
        </ul>
      )}
      <div>
        <a href="#" className="text-blue-600 mt-5" onClick={() => handleClick("togglePopUp")}>New Collection Type</a>
      </div>
    </div>
  );
};

export default Sidebar;
