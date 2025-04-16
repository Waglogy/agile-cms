/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
import { Link } from "react-router-dom";

import { MdOutlineDashboardCustomize, MdOutlineCreate, MdOutlineCollections, MdOutlineManageSearch } from "react-icons/md";

export default function SystemAdminSidebar({
  // keep the pathname later to highlight the selected text
  
  pathname,
}) {
  return (
    <section>
      <div className="text-slate-700">
        <ul>
          {/* Dashboard */}
          <li>
            <div className="flex items-center gap-x-2 mb-4">
              <MdOutlineDashboardCustomize size={20} />
              <div className="text-lg cursor-pointer">
                <Link to="/system-admin/dashboard" className="py-1">
                  <p
                    className={`shrink-0 ${
                      pathname.includes("/system-admin/dashboard")
                        ? "text-slate-700 font-semibold"
                        : "text-slate-700 font-normal"
                    }`}
                  >
                    Dashboard
                  </p>
                </Link>
              </div>
            </div>
          </li>

          {/* Create Collection */}
          <li>
            <div className="flex items-center gap-x-2 mb-4">
              <MdOutlineCreate size={20} />
              <div className="text-lg cursor-pointer">
                <Link
                  to="/system-admin/modules/table-creation"
                  className="py-1"
                >
                  <p
                    className={`shrink-0 ${
                      pathname.includes("/system-admin/modules/table-creation")
                        ? "text-slate-700 font-semibold"
                        : "text-slate-700 font-normal"
                    }`}
                  >
                    Create Table
                  </p>
                </Link>
              </div>
            </div>
          </li>

          {/* View/Update Collection */}
          <li>
            <div className="flex items-center gap-x-2 mb-4">
              <MdOutlineCollections size={20} />
              <div className="text-lg cursor-pointer">
                <Link to="/system-admin/modules/table-update" className="py-1">
                  <p
                    className={`shrink-0 ${
                      pathname.includes("/system-admin/modules/table-update")
                        ? "text-slate-700 font-semibold"
                        : "text-slate-700 font-normal"
                    }`}
                  >
                    View/Update Table
                  </p>
                </Link>
              </div>
            </div>
          </li>

          {/* Content Manager */}
          <li>
            <div className="flex items-center gap-x-2 mb-4">
              <MdOutlineManageSearch size={20} />
              <div className="text-lg cursor-pointer">
                <Link to="/content-admin" className="py-1">
                  <p
                    className={`shrink-0 ${
                      pathname.includes("/system-admin/content-manager")
                        ? "text-slate-700 font-semibold"
                        : "text-slate-700 font-normal"
                    }`}
                  >
                    Content Manager
                  </p>
                </Link>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
