import React, { useState, useEffect } from "react";
import NavbarLogin from '../components/Navbarlogin';
import Footer from '../components/Footer.jsx';

export default function TaxCalculator() {
  const [financialYear, setFinancialYear] = useState("FY-2023-24");
  const [taxRateDisplay, setTaxRateDisplay] = useState(30);
  const [portfolioData, setPortfolioData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); // Adjust key if needed
        const res = await fetch("http://localhost:8080/api/user-portfolio", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch portfolio data.");
        }

        const data = await res.json();
        setPortfolioData(data.portfolio || []);
      } catch (err) {
        setErrorDisplay(err.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const getTaxSlabObject = (ratePercent) => ({
    shortTermEquityRate: 0.15,
    longTermEquityRate: 0.10,
    shortTermOtherRate: ratePercent / 100,
    longTermDebtRate: 0.20,
    longTermOtherRate: 0.20,
    ltcgExemptionLimitEquity: 100000
  });

  const calculateTax = async () => {
    setLoading(true);
    alert("Button Clicked")
    setErrorDisplay(null);
    setResults(null);

    try {
      if (!financialYear || isNaN(taxRateDisplay) || !portfolioData.length) {
        throw new Error("Please ensure Financial Year, Tax Slab, and Portfolio Data are loaded.");
      }

      const currentTaxSlab = getTaxSlabObject(taxRateDisplay);

      const response = await fetch("http://localhost:8080/api/calculate-tax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: portfolioData,
          financialYear,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarLogin />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Calculate Tax for Current Financial Year</h2>

          <div className="space-y-2">
            <label htmlFor="financialYear" className="block font-medium">Select Financial Year:</label>
            <select
              id="financialYear"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="FY-2024-25">FY-2024-25</option>
              <option value="FY-2023-24">FY-2023-24</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="taxSlab" className="block font-medium">Enter Other STCG Rate (%):</label>
            <input
              id="taxSlab"
              type="number"
              step="1"
              min="0"
              max="100"
              value={taxRateDisplay}
              onChange={(e) => setTaxRateDisplay(parseFloat(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 30"
            />
          </div>

          <button
            onClick={calculateTax}
            // disabled={loading || !portfolioData.length}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
          >
            {/* {loading ? "Calculating..." : "Calculate Tax"} */}
            Calculate Tax
          </button>
        </div>

        {errorDisplay && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>{errorDisplay}
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* LTCG Table */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-xl font-bold mb-3">LTCG Details</h3>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="p-2 font-bold">Rate</th>
                    <th className="p-2 font-bold">Exemption</th>
                    <th className="p-2 font-bold">Gain</th>
                    <th className="p-2 font-bold">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {results.ltcgDetails?.length ? results.ltcgDetails.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.rate}%</td>
                      <td className="p-2">₹{(row.exemption || 0).toFixed(2)}</td>
                      <td className="p-2">₹{(row.gain || 0).toFixed(2)}</td>
                      <td className="p-2">₹{(row.tax || 0).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="p-2 text-center text-gray-500">No LTCG details available.</td></tr>
                  )}
                </tbody>
              </table>
              <p className="mt-4 font-semibold">Total LTCG Tax: ₹{(results.totalLtcgTax || 0).toFixed(2)}</p>
            </div>

            {/* STCG Table */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-xl font-bold mb-3">STCG Details</h3>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="p-2 font-bold">Rate</th>
                    <th className="p-2 font-bold">Gain</th>
                    <th className="p-2 font-bold">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {results.stcgDetails?.length ? results.stcgDetails.map((row, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{row.rate}%</td>
                      <td className="p-2">₹{(row.gain || 0).toFixed(2)}</td>
                      <td className="p-2">₹{(row.tax || 0).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="p-2 text-center text-gray-500">No STCG details available.</td></tr>
                  )}
                </tbody>
              </table>
              <p className="mt-4 font-semibold">Total STCG Tax: ₹{(results.totalStcgTax || 0).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
