import React, { useRef, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginForm from './areas/public/loginForm.component'
import SignupForm from './areas/public/signupForm.components'
import AdminPage from './areas/admin/dashboard/systemadmin/AdminPage'
import ContentBuilder from './areas/admin/dashboard/systemadmin/ContentBuilder'
import ContentManager from './areas/contentManager/contentManager'
import MediaLibrary from './areas/contentManager/mediaLibrary'
import { Init } from './areas/admin/dashboard/systemadmin/Init'

function App() {
  // for the init component
  const [databases, setDatabases] = useState([])
  const databasesRef = useRef()
  const clickHandler = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:3000/api/list-databases')
    const data = await res.json()
    console.log(data)

    // Update both ref and state
    databasesRef.current = data.data
    setDatabases(data.data)

    console.log(`this is databasesref: `, databasesRef.current)
  }
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<SignupForm />} />
    //     <Route path="/login" element={<LoginForm />} />
    //     {/*  protected Panel Routes */}

    //     {/* need to wrap with a auth context */}

    //     <Route path="/init" element={<Init />} />
    //     <Route path="/admin" element={<AdminPage />} />
    //     <Route path="/admin/content-builder" element={<ContentBuilder />} />
    //     <Route path="/admin/content-manager" element={<ContentManager />} />
    //     <Route path="/admin/media-library" element={<MediaLibrary />} />
    //   </Routes>
    // </Router>
    <div>
      <h1>this is hello from the init page</h1>
      <div>
        {/* <select name="" id=""></select> */}
        <button onClick={clickHandler}>click me :D</button>
      </div>

      <div>
        {databases.length > 0 && (
          <div>
            select database for your project :3
            {databases.map((database, idx) => (
              <h1 key={idx}>{database.datname}</h1>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
