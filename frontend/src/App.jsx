import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminPage from "./areas/dashboard/AdminPage";
import LoginForm from "./areas/public/loginForm.component";


function App() {
  return (
    <Router>
      <Routes>
        <Route path = "/" element={<LoginForm/>}/>
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPage />} />
        
        {/* Default Route (Redirect to Admin Panel) */}
        {/* <Route path="*" element={<AdminPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
