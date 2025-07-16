import Homepage from './pages/landing_page/Homepage.jsx'
import Login from './pages/Auth/Login'
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ParseCAS from './pages/ParseCAS.jsx'
import DisplayCAs from "./components/DisplayCAs";

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:name/:token' element={<ResetPassword />} />
        <Route path='/parse-cas' element={<ParseCAS />} />
        <Route path='/display-cas'  element={<DisplayCAs/>} />
      </Routes>
    </div>
  )
}

export default App


