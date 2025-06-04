import { useState } from 'react'
import './App.css'
import Homepage from './pages/landing_page/Homepage.jsx'
import LoginSignup from './pages/Auth/LoginSignup'
import Login from './pages/Auth/Login'
import {Routes, Route} from 'react-router-dom';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element = {<Homepage />} />
        <Route path='/login' element = {<Login />} />
      </Routes>
    </div>
  )
}

export default App
