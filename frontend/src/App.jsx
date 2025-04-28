/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import DesktopOnlyRoute from "./areas/DesktopOnlyRoute";

import SelectDb from "./areas/public/pages/selectDb.component";

import SystemAdminDashboard from "./areas/admin/system-admin/SystemAdminDashboard";
import CreateTableComponent from "./areas/admin/system-admin/modules/TableCreation/createTable.component";
import UpdateTableComponent from "./areas/admin/system-admin/modules/TableUpdate/updateTablecomponent";
import ContentAdminDashboard from "./areas/admin/content-admin/ContentAdminDashboard";
import AddContent from "./areas/admin/content-admin/components/AddContent";
import Contents from "./areas/admin/content-admin/components/Contents";
import ViewUpdate from "./areas/admin/content-admin/components/ViewUpdate";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return (
    <>
      <Routes>
        <Route exact path="/" element={<SelectDb />} />

        {/* System Admin */}
        <Route
          exact
          path="/system-admin/dashboard"
          element={
            <DesktopOnlyRoute>
              <SystemAdminDashboard />
            </DesktopOnlyRoute>
          }
        />
        <Route
          path="/system-admin/modules/table-creation"
          element={<CreateTableComponent />}
        />
        <Route
          path="/system-admin/modules/table-update"
          element={
            <DesktopOnlyRoute>
              <UpdateTableComponent />
            </DesktopOnlyRoute>
          }
        />

        {/* Content Admin */}
        <Route
          path="/content-admin"
          element={
            <DesktopOnlyRoute>
              <ContentAdminDashboard />
            </DesktopOnlyRoute>
          }
        >
          <Route path="add" element={<AddContent />} />
          <Route path="contents" element={<Contents />} />
          <Route path="view-update" element={<ViewUpdate />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
