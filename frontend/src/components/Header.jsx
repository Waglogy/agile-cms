import React from "react";
import logo from "../assets/bbLogo.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-md border-b">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="h-10" />
        <h1 className="text-lg font-semibold text-zinc-700">Admin Panel</h1>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
          Save
        </button>
        <button className="bg-zinc-700 text-white px-4 py-2 rounded-md hover:bg-zinc-600">
          Publish
        </button>
      </div>
    </header>
  );
};

export default Header;
