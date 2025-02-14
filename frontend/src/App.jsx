import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./areas/dashboard/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Default Route (Redirect to Admin Panel) */}
        <Route path="*" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
