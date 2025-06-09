import { useState } from 'react'
import './App.css'
import Homepage from './pages/landing_page/Homepage.jsx'
import LoginSignup from './pages/Auth/LoginSignup'
import Login from './pages/Auth/Login'
import {Routes, Route} from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element = {<Homepage />} />
        <Route path='/login' element = {<Login />} />
        <Route path='/dashboard' element = {<Dashboard />} />
        <Route path='/forgot-password' element = {<ForgotPassword />} />
      </Routes>
    </div>
  )
}

export default App
