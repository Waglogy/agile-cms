/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "./header.component";
import Sidebar from "./sidebar.component";

export default function Dashboard({ children, sideBarType = 2 }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar sideBarType={sideBarType} />
      <div className="flex-1">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
