import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./areas/admin/dashboard/systemadmin/AdminPage";
import LoginForm from "./areas/public/loginForm.component";


function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<LoginForm/>}/>
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
