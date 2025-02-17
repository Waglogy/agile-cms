import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./areas/public/loginForm.component";
import AdminPage from "./areas/admin/dashboard/systemadmin/AdminPage";
import ContentBuilder from "./areas/admin/dashboard/systemadmin/ContentBuilder";


function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<LoginForm/>}/>
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/content-builder" element={<ContentBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
