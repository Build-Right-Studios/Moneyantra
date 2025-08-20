import React, { useState } from 'react';
import NavbarLogin from '../components/Navbarlogin';
import Footer from '../components/Footer';

const SimulateTax = () => {
  const [financialYear, setFinancialYear] = useState('FY-2024-25');
  const [stcgRate, setStcgRate] = useState(30);
  const [liquidationAmount, setLiquidationAmount] = useState('');

  const handleSimulateTax = () => {
    console.log('Simulating tax with the following details:');
    console.log('Financial Year:', financialYear);
    console.log('STCG Rate:', stcgRate);
    console.log('Liquidation Amount:', liquidationAmount);
    // Add your tax simulation logic here
  };

  return (
    <>
    <NavbarLogin/>
     <div className="flex justify-center items-start p-10 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Simulate Tax</h2>

        {/* Amount to be Liquidated */}
        <div className="mb-6">
          <label htmlFor="liquidation-amount" className="block text-sm font-medium text-gray-700">
            How much amount needs to be liquidated
          </label>
          <input
            type="number"
            id="liquidation-amount"
            name="liquidation-amount"
            value={liquidationAmount}
            onChange={(e) => setLiquidationAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter amount"
          />
        </div>

        {/* Simulate Tax Button */}
        <button
          onClick={handleSimulateTax}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#33658a] hover:bg-[#f26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Simulate Tax
        </button>

      </div>
    </div>  
    <Footer/>
    </>
  );
};

export default SimulateTax;