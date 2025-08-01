import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarLogin from "../components/Navbarlogin";
import Footer from "../components/Footer.jsx";

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
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/user-portfolio", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        const portfolioArray = Array.isArray(data.portfolio)
          ? data.portfolio
          : Object.values(data.portfolio || {});
        setPortfolioData(portfolioArray);
      } catch (err) {
        console.error("Portfolio fetch error:", err);
        setErrorDisplay(err.response?.data?.error || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const calculateTax = async () => {
    setLoading(true);
    setErrorDisplay(null);
    setResults(null);

    try {
      if (!financialYear || isNaN(taxRateDisplay)) {
        throw new Error("Please ensure Financial Year and Tax Slab are valid.");
      }

      const parsed = portfolioData[0];

      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.folios)) {
        throw new Error("Invalid portfolio structure.");
      }

      const response = await axios.post(
        "https://asia-south1-moneyantra-465713.cloudfunctions.net/calculate_tax_http",
        {
          cas_json: parsed,
          financial_year: financialYear,
          tax_slab: taxRateDisplay / 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const taxSummary = response.data?.tax_summary;

      // Normalize to expected structure
      const ltcgDetails = (taxSummary?.ltcg?.details || []).map((item) => ({
        rate: (item["LTCG Rate"] || 0) * 100,
        exemption: item["Exemption"] || 0,
        gain: item["Total LTCG"] || 0,
        tax: item["LTCG Tax"] || 0,
      }));

      const stcgDetails = (taxSummary?.stcg?.details || []).map((item) => ({
        rate: (item["STCG Rate"] || 0) * 100,
        gain: item["Total STCG"] || 0,
        tax: item["STCG Tax"] || 0,
      }));

      setResults({
        ltcgDetails,
        totalLtcgTax: taxSummary?.ltcg?.total || 0,
        stcgDetails,
        totalStcgTax: taxSummary?.stcg?.total || 0,
      });

      console.log("Full response from backend:", taxSummary);
    } catch (error) {
      console.error("Tax calculation error:", error);
      setErrorDisplay(
        error?.response?.data?.error || error.message || "Failed to calculate tax"
      );
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
            <label htmlFor="financialYear" className="block font-medium">
              Select Financial Year:
            </label>
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
            <label htmlFor="taxSlab" className="block font-medium">
              Enter Other STCG Rate (%):
            </label>
            <input
              id="taxSlab"
              type="number"
              step="1"
              min="0"
              max="100"
              value={isNaN(taxRateDisplay) ? "" : taxRateDisplay}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTaxRateDisplay(isNaN(val) ? "" : val);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g., 30"
            />
          </div>

          <button
            onClick={calculateTax}
            className="bg-[#124e78] text-white px-6 py-2 rounded-full hover:bg-[#F26419]"
            disabled={loading}
          >
            {loading ? "Calculating..." : "Calculate Tax"}
          </button>

          {portfolioData.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              No portfolio data found. Please upload or check authentication.
            </p>
          )}
        </div>

        {errorDisplay && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error: </strong>
            {errorDisplay}
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {/* LTCG Section */}
            {results.totalLtcgTax > 0 && (
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
                    {results.ltcgDetails.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row.rate}%</td>
                        <td className="p-2">₹{(row.exemption || 0).toFixed(2)}</td>
                        <td className="p-2">₹{(row.gain || 0).toFixed(2)}</td>
                        <td className="p-2">₹{(row.tax || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 font-semibold">
                  Total LTCG Tax: ₹{(results.totalLtcgTax || 0).toFixed(2)}
                </p>
              </div>
            )}



            {/* STCG Section */}
            {results.totalStcgTax > 0 && (
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
                    {results.stcgDetails.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{row.rate}%</td>
                        <td className="p-2">₹{(row.gain || 0).toFixed(2)}</td>
                        <td className="p-2">₹{(row.tax || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 font-semibold">
                  Total STCG Tax: ₹{(results.totalStcgTax || 0).toFixed(2)}
                </p>
              </div>
            )}


          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
