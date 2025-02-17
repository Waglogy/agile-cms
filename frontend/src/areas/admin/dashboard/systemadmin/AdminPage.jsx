import React from "react";
import MenuBar from "../../../../components/MenuBar";
import Header from "../../../../components/Header";

const AdminPage = () => {
  return (
    <div>
      <Header />
      <div className="flex">
        <MenuBar />
        <div className="w-full h-screen p-4">
         {/* Content Area */}
          <h2 className="text-2xl font-semibold text-zinc-800">Welcome, Super Admin</h2>
          <p className="text-zinc-600 mt-2">Start building your page by dragging components from the sidebar.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
