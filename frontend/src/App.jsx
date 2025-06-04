import { useState } from 'react'
import './App.css'
import Homepage from './pages/landing_page/home/Homepage.jsx'
import LoginSignup from './pages/Auth/LoginSignup'
import Login from './pages/Auth/Login'

function App() {
  return (
    <div>
      {/* You can toggle between components or show based on auth state */}
      {/* <LoginSignup /> */}
      {/* <Login /> */}
      <Homepage />
    </div>
  )
}

export default App
