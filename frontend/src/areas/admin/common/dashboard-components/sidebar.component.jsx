/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useRef } from "react";
import { useLocation } from "react-router-dom";

import SystemAdminSidebar from "../../system-admin/SystemAdminSidebar";
import ContentAdminSidebar from "../../content-admin/ContentAdminSidebar";

import bbLogo from "../../../../assets/bbLogoInitial.png";

function Sidebar({ sideBarType, setSideBarType }) {
  const location = useLocation();
  const { pathname } = location;

  const sidebar = useRef(null);

  return (
    <div>
      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto text-white 
        lg:translate-x-0 transform h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-72
        lg:w-72 lg:sidebar-expanded:!w-72 2xl:!w-72 shrink-0 bg-slate-50 border border-r p-4 transition-all duration-200 ease-in-out`}
      >
        {/* Sidebar header */}
        <div className="mb-10">
          <div>
            <div className="w-[100%] border p-2 rounded-md bg-[#F3F0FF]">
              <div className="flex flex-col justify-start items-center gap-x-3">
                <div className="text-primary">
                  <img src={bbLogo} className="h-20 w-20" />
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-[#15391F]">
                    Bytesberry Technologies
                  </p>

                  <p className="text-xs text-[#15391F]">Gangtok, Sikkim</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {+sideBarType === +2 ? (
          <SystemAdminSidebar pathname={pathname} />
        ) : +sideBarType === +3 ? (
          <ContentAdminSidebar pathname={pathname} />
        ) : null}
      </div>
    </div>
  );
}

export default Sidebar;
