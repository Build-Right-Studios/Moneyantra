import React, { useEffect, useState } from 'react';
import NavbarLogin from '../components/Navbarlogin';
import Footer from '../components/Footer';
import axiosInstance from "../utils/axiosInstance";

const SimulateTax = () => {
  const [financialYear, setFinancialYear] = useState('FY-2024-25');
  const [stcgRate, setStcgRate] = useState(30);
  const [liquidationAmounts, setLiquidationAmounts] = useState({}); // store per scheme
  const [schemes, setSchemes] = useState([]);
  const [fullPortfolio, setFullPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await axiosInstance.get("/api/user-portfolio");
        const portfolioData = response.data;

        setFullPortfolio(portfolioData);

        const allSchemes = [];
        if (portfolioData.casData && Array.isArray(portfolioData.casData.folios)) {
          portfolioData.casData.folios.forEach(folio => {
            if (Array.isArray(folio.schemes)) {
              allSchemes.push(...folio.schemes);
            }
          });
        }

        const schemeList = [...new Set(allSchemes.map(s => s.scheme))]
          .map(name => {
            const allInstances = allSchemes.filter(s => s.scheme === name);
            const totalUnits = allInstances.reduce((sum, s) => sum + parseFloat(s.close), 0);
            const currentValue = allInstances.reduce((sum, s) => sum + parseFloat(s.valuation?.value || 0), 0);

            return {
              name: name,
              totalUnits: totalUnits,
              currentValue: currentValue
            };
          });

        setSchemes(schemeList);

      } catch (err) {
        console.error("Error fetching portfolio data:", err);
        setError("Failed to load portfolio data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioData();
  }, []);

  const handleInputChange = (schemeName, value) => {
    setLiquidationAmounts(prev => ({
      ...prev,
      [schemeName]: value
    }));
  };

  const handleSubmit = (scheme) => {
    const amount = liquidationAmounts[scheme.name] || 0;
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    console.log("Liquidating:", {
      scheme: scheme.name,
      amount: amount,
      financialYear,
      stcgRate
    });

    // 🔗 here you can call backend API to process liquidation
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-xl font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <>
      <NavbarLogin />
      <div className="flex justify-center items-start p-4 sm:p-10 bg-gray-100">
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-xl flex justify-center font-bold p-4 text-gray-800">
            SELECT A SCHEME
          </h2>

          {schemes.length > 0 ? (
            <ul className="space-y-4">
              {schemes.map((scheme, index) => (
                <li
                  key={index}
                  className="p-4 border border-gray-300 rounded-md shadow-sm bg-white"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    {/* Scheme Name + Input */}
                    <div className="flex-1">
                      <div className="font-bold mb-2">{scheme.name}</div>

                      <input
                        type="number"
                        value={liquidationAmounts[scheme.name] || ""}
                        onChange={(e) => handleInputChange(scheme.name, e.target.value)}
                        placeholder="Enter amount to liquidate"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />

                      {/* Submit Button */}
                      <button
                        onClick={() => handleSubmit(scheme)}
                        className="mt-2 w-full sm:w-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#33658a] hover:bg-[#f26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit
                      </button>
                    </div>

                    {/* Scheme Value and Units */}
                    <div className="text-right sm:w-1/3">
                      <p className="font-bold">₹{scheme.currentValue.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">Units: {scheme.totalUnits.toFixed(4)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              No schemes found in your portfolio.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SimulateTax;
