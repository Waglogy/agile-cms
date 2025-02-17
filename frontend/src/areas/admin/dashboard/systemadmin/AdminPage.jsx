import React from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

const AdminPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-zinc-800">Welcome, Super Admin</h2>
          <p className="text-zinc-600 mt-2">Start building your page by dragging components from the sidebar.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
