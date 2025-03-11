import React, { useEffect, useState } from "react";
import Dropdown from "../reusable-components/buttons/DropdownButton";
import GetData from "../api/super_admin/GetData";

function Sidebar({ setModalOpen, setModalContent, setCollection }) {
    const [data, setData] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const result = await GetData();
            setData(result);
        };
        fetchData();
    }, []);

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
        <div className="flex flex-col w-80 h-screen p-6 shadow-lg border-r border-gray-300 bg-white mt-20">
    <div className=" w-full p-3 rounded-lg ">
        <h1 className="text-l font-semibold text-black">COllECTION BULDER</h1>
        </div>
        <div className="flex mt-3 items-center text-black  p-10 flex-col bg-blue-300 rounded-lg" >
            <h3 className="text-l p-3 font-semibold ">Collection's</h3>
            <Dropdown isOpen={isDropdownOpen} toggleDropdown={() => handleClick("toggleDropdown")} />
       
        {isDropdownOpen && data && (
            <ul className="pl-8 mt-3 space-y-2">
                {data.map((item, index) => (
                    <li key={index} className="list-disc">
                        <button
                            onClick={() => setCollection(item.collection_name, item.columns)}
                            className="text-blue-600 hover:underline capitalize focus:outline-none"
                        >
                            {item.collection_name}
                        </button>
                    </li>
                ))}
            </ul>
        )}
         </div>
       <div className="mt-5 ">
  <button
    className="flex shadow-lg items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onClick={() => handleClick("togglePopUp")}
  >
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
    <span>New Collection </span>
  </button>
</div>

    </div>
    
    );
}

export default Sidebar;