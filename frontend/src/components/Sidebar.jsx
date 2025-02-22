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
        <div className="flex flex-col w-45 h-screen p-4 shadow-lg border-r ">
            <h1 className="text-l font-bold">Content-Type Builder</h1>
            <hr />
            <div className="flex mt-5">
                <h3>Collection Types</h3>
                <Dropdown isOpen={isDropdownOpen} toggleDropdown={() => handleClick("toggleDropdown")} />
            </div>
            {isDropdownOpen && data && (
                <ul className="pl-10 mt-3">
                    {data.map((item, index) => (
                        <li key={index} className="mb-2 list-disc">
                            <button
                                onClick={() => setCollection(item.collection_name, item.columns)}
                                className="text-blue-600 hover:underline capitalize"
                            >
                                {item.collection_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div>
                <button
                    className="text-blue-600 mt-5 hover:underline"
                    onClick={() => handleClick("togglePopUp")}
                >
                    Add New Collection Type
                </button>
            </div>
        </div>
    );
}

export default Sidebar;