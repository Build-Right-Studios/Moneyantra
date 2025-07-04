import React from 'react';
import NavbarLogin from '../components/Navbarlogin'; 
import Dashboard1 from '../components/Dashboard1.jsx'
import Footer from '../components/Footer.jsx'; 

function Dashboard() {
  return (
    <div>
      <NavbarLogin/> 
      <Dashboard1/>
      <Footer/>
    </div>
  );
}

export default Dashboard;