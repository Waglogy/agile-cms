import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './areas/public/loginForm.component'
import SignupForm from './areas/public/signupForm.components'
import AdminPage from './areas/admin/dashboard/systemadmin/AdminPage'
import ContentBuilder from './areas/admin/dashboard/systemadmin/ContentBuilder'
import ContentManager from './areas/contentManager/contentManager'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        {/* Admin Panel Route */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/content-builder" element={<ContentBuilder />} />
        <Route path="/admin/content-manager" element={<ContentManager />} />
      </Routes>
    </Router>
  )
}

export default App
