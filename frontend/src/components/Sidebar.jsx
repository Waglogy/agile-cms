import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(false);

  // Components available for dragging
  const components = [
    { id: "rich-text", name: "Rich Text Editor" },
    { id: "button", name: "Button" },
    { id: "image", name: "Image Upload" },
  ];

  // Drag handler
  const handleDragStart = (event, component) => {
    event.dataTransfer.setData("componentId", component.id);
  };

  return (
    <div className="w-64 bg-white h-screen p-4 shadow-lg border-r">
      <h2 className="text-lg font-semibold text-zinc-700 mb-4">Admin Panel</h2>
      
      {/* Dropdown Section */}
      <div>
        <button
          onClick={() => setOpenDropdown(!openDropdown)}
          className="flex items-center justify-between w-full bg-zinc-100 p-2 rounded-md"
        >
          Drag & Drop Elements
          {openDropdown ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {openDropdown && (
          <div className="mt-2 bg-zinc-50 p-2 rounded-md border">
            {components.map((comp) => (
              <div
                key={comp.id}
                draggable
                onDragStart={(e) => handleDragStart(e, comp)}
                className="p-2 mb-2 bg-zinc-200 rounded cursor-move hover:bg-zinc-300"
              >
                {comp.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-5">
        <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
          Save
        </button>
        <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
          Publish
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
