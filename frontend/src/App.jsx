import Homepage from './pages/landing_page/Homepage.jsx'
import Login from './pages/Auth/Login'
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import ParseCAS from './pages/ParseCAS.jsx'
import DisplayCAs from "./components/DisplayCAs";
import TaxCalculator from "./pages/TaxCalculator.jsx";
import Simulate_tax from './pages/Simulate_tax.jsx';

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token"); 
    if (!token) {
      return <Navigate to="/login" replace />; 
    }
    return children;
  };

  return (
    <div>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:name/:token' element={<ResetPassword />} />

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/parse-cas'
          element={
            <ProtectedRoute>
              <ParseCAS />
            </ProtectedRoute>
          }
        />
        <Route
          path='/display-cas'
          element={
            <ProtectedRoute>
              <DisplayCAs />
            </ProtectedRoute>
          }
        />
        <Route
          path='/simulate-tax'
          element={
            <ProtectedRoute>
              <Simulate_tax/>
            </ProtectedRoute>
          }
        />
        <Route
          path='/calculate-tax'
          element={
            <ProtectedRoute>
              <TaxCalculator />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
