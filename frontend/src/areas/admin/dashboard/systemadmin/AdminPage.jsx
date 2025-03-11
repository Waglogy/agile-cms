import React from "react";
import MenuBar from "../../../../components/MenuBar";
import Header from "../../../../components/Header";

const AdminPage = () => {
  return (
    <div className="bg-white">
      <Header title="Super Admin" />
 
      <div className="flex">
        <MenuBar />
        
      <div>
     
      </div>
      <div class="flex justify-center items-center h-screen pb-100">
      <div class="bg-blue-500 p-6 text-white rounded-r-lg flex items-center space-x-3 text-xl font-semibold shadow-lg">
  <span class="text-3xl">👋</span>
  <span>Welcome, <span class="text-black">Super Admin</span>! Start building your content 🚀</span>
</div>
</div>
      </div>



    </div>
  );
};

export default AdminPage;
