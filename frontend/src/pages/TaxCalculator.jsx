import React, { useState } from "react";
import NavbarLogin from '../components/Navbarlogin';
import Footer from '../components/Footer.jsx';

export default function TaxCalculator() {
  // Removed email state as it's not in the target UI
  const [financialYear, setFinancialYear] = useState("FY-2023-24"); // Default to FY-2023-24 as per image
  const [taxRateDisplay, setTaxRateDisplay] = useState(30); // User-facing input in percent, default to 30%
  const [portfolioData, setPortfolioData] = useState([]); // Initialize as empty, data loaded by button
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(null);

  const dummyPortfolio = [
    {
      isin: 'INE001A01025',
      SchemeCode: 'AXISBLUECHIP',
      assetName: 'Axis Bluechip Fund',
      assetType: 'equity',
      purchase_date: '2022-05-10',
      transaction_date: '2024-06-15',
      purchase_nav: 100,
      nav: 150,
      outstanding_quantity: 10,
      amount: -1500,
      Category: 'Equity Fund',
      subCategory: 'Large Cap',
      exemption: 100000,
      nav2018: 120,
      category_condition: 'bought-before-apr-2023-sold-before-23jul-2024',
      stcg_date: 365,
      equity_gf_31jan2018: 'yes',
      ltcg_indexation: 'no'
    },
    {
      isin: 'INE001A01018',
      SchemeCode: 'HDFCBANK',
      assetName: 'HDFC Bank Stock',
      assetType: 'equity',
      purchase_date: '2023-01-20',
      transaction_date: '2024-07-01',
      purchase_nav: 150,
      nav: 180,
      outstanding_quantity: 5,
      amount: -900,
      Category: 'Equity Fund',
      subCategory: 'Banking',
      exemption: 100000,
      nav2018: 160,
      category_condition: 'bought-before-apr-2023-sold-before-23jul-2024',
      stcg_date: 365,
      equity_gf_31jan2018: 'yes',
      ltcg_indexation: 'no'
    },
    {
      isin: 'INF179KC1234',
      SchemeCode: 'ICICIPRUDDEBT',
      assetName: 'ICICI Prudential Debt Fund',
      assetType: 'debt',
      purchase_date: '2021-03-01',
      transaction_date: '2024-05-20',
      purchase_nav: 50,
      nav: 65,
      outstanding_quantity: 20,
      amount: -1300,
      Category: 'Debt Fund',
      subCategory: 'Gilt Fund',
      exemption: 0,
      nav2018: 0,
      category_condition: 'bought-before-apr-2023-sold-before-23jul-2024',
      stcg_date: 1095,
      equity_gf_31jan2018: 'no',
      ltcg_indexation: 'yes'
    },
    {
      isin: 'INE001A01111',
      SchemeCode: 'RELIANCEEQUITY',
      assetName: 'Reliance Industries Stock',
      assetType: 'equity',
      purchase_date: '2025-01-01',
      transaction_date: '2025-06-01',
      purchase_nav: 200,
      nav: 250,
      outstanding_quantity: 4,
      amount: -1000,
      Category: 'Equity Fund',
      subCategory: 'Energy',
      exemption: 100000,
      nav2018: 0,
      category_condition: 'bought-after-apr-2023-sold-after-23jul-2024',
      stcg_date: 365,
      equity_gf_31jan2018: 'yes',
      ltcg_indexation: 'no'
    }
  ];
  // Helper function to create tax slab object (as per your backend expectation)
  const getTaxSlabObject = (ratePercent) => ({
    shortTermEquityRate: 0.15,
    longTermEquityRate: 0.10,
    shortTermOtherRate: ratePercent / 100, // This uses the user's input
    longTermDebtRate: 0.20,
    longTermOtherRate: 0.20,
    ltcgExemptionLimitEquity: 100000
  });

  const calculateTax = async () => {
    setLoading(true);
    setErrorDisplay(null);
    setResults(null); // Clear previous results

    try {
      if (!financialYear || isNaN(taxRateDisplay) || !portfolioData.length) {
        throw new Error("Please ensure Financial Year, Tax Slab, and Portfolio Data are selected/loaded.");
      }

      const currentTaxSlab = getTaxSlabObject(taxRateDisplay);

      const response = await fetch("http://localhost:8080/api/calculate-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: portfolioData,
          financialYear: financialYear,
          taxSlab: currentTaxSlab
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`API Error (${response.status}): ${errorJson.error || errorText}`);
        } catch {
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setErrorDisplay(error.message);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDummyPortfolio = () => {
    setPortfolioData(dummyPortfolio);
    alert("Dummy portfolio loaded! You can now calculate tax.");
    setErrorDisplay(null);
    setResults(null); // Clear previous results when loading new data
  };

  return (
    <>
      <NavbarLogin />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Calculate Tax Section - Matches image_ac2554.png */}
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Calculate Tax for Current Financial Year</h2>

          <div className="space-y-2">
            <label htmlFor="financialYear" className="block font-medium">Select Financial Year:</label>
            <select
              id="financialYear"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="FY-2024-25">FY-2024-25</option>
              <option value="FY-2023-24">FY-2023-24</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="taxSlab" className="block font-medium">Select Tax Slab:</label>
            {/* The image shows a dropdown for 30%, but your code uses an input type="number" */}
            {/* Keeping it as input type="number" as it provides more flexibility for the "Other STCG" rate */}
            {/* If you strictly want a dropdown with fixed options like 30%, 20%, etc., you'd change this to a <select> */}
            <input
              id="taxSlab"
              type="number"
              step="1" // Assuming whole percentage values like 10, 20, 30
              min="0"
              max="100"
              value={taxRateDisplay}
              onChange={(e) => setTaxRateDisplay(parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 30"
            />
            {/* If you want a dropdown for Tax Slab similar to the image */}
            {/*
            <select
                id="taxSlab"
                value={taxRateDisplay}
                onChange={(e) => setTaxRateDisplay(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="30">30%</option>
                <option value="20">20%</option>
                <option value="10">10%</option>
            </select>
            */}
          </div>

          {/* Button to load dummy data - kept for testing convenience */}
          <button
            onClick={loadDummyPortfolio}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
          >
            Load Dummy Portfolio (for testing)
          </button>

          <button
            onClick={calculateTax}
            disabled={loading || !portfolioData.length} // Disable if loading or no portfolio data
            // Tailwind CSS for the purple button as seen in the image
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CALCULATING..." : "CALCULATE TAX"}
          </button>
        </div>

        {errorDisplay && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{errorDisplay}</span>
          </div>
        )}

        {/* Results Display Section - Matches image_ac2ffa.png */}
        {results && (
          <div className="space-y-6">
            {/* LTCG Summary */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-xl font-bold mb-3">LTCG Summary</h3> {/* Changed to text-xl font-bold */}
              <table className="w-full border-collapse text-left">
                <thead className="bg-white"> {/* Background white for header as per image */}
                  <tr>
                    <th className="p-2 font-bold">Total LTCG</th>
                    <th className="p-2 font-bold">Rate</th>
                    <th className="p-2 font-bold">Exemption</th>
                    <th className="p-2 font-bold">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(results.ltcgDetails) && results.ltcgDetails.length > 0 ? (
                    results.ltcgDetails.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200"> {/* Added border-t for separator lines */}
                        <td className="p-2">₹{(parseFloat(row.Total) || 0).toFixed(2)}</td>
                        <td className="p-2">{(parseFloat(row.Rate) || 0) * 100}%</td>
                        <td className="p-2">₹{(parseFloat(row.Exemption) || 0).toFixed(2)}</td>
                        <td className="p-2">₹{(parseFloat(row.Tax) || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-2 text-center text-gray-500">No LTCG details available.</td></tr>
                  )}
                </tbody>
              </table>
              <p className="mt-4 text-md font-semibold"> {/* Adjusted font size and weight */}
                Total LTCG Tax: ₹{(parseFloat(results.totalLTCGTax) || 0).toFixed(2)}
              </p>
            </div>

            {/* STCG Summary */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-xl font-bold mb-3">STCG Summary</h3> {/* Changed to text-xl font-bold */}
              <table className="w-full border-collapse text-left">
                <thead className="bg-white"> {/* Background white for header as per image */}
                  <tr>
                    <th className="p-2 font-bold">Total STCG</th>
                    <th className="p-2 font-bold">Rate</th>
                    <th className="p-2 font-bold">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(results.stcgDetails) && results.stcgDetails.length > 0 ? (
                    results.stcgDetails.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-200"> {/* Added border-t for separator lines */}
                        <td className="p-2">₹{(parseFloat(row.Total) || 0).toFixed(2)}</td>
                        <td className="p-2">{(parseFloat(row.Rate) || 0) * 100}%</td>
                        <td className="p-2">₹{(parseFloat(row.Tax) || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="p-2 text-center text-gray-500">No STCG details available.</td></tr>
                  )}
                </tbody>
              </table>
              <p className="mt-4 text-md font-semibold"> {/* Adjusted font size and weight */}
                Total STCG Tax: ₹{(parseFloat(results.totalSTCGTax) || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}