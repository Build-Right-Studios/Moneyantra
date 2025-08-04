import React, { useState, useEffect } from "react";
import axios from "axios";
import NavbarLogin from "../components/Navbarlogin";
import Footer from "../components/Footer.jsx";

export default function TaxCalculator() {
  const [financialYear, setFinancialYear] = useState("FY-2023-24");
  const [taxRateDisplay, setTaxRateDisplay] = useState(30);
  const [portfolioData, setPortfolioData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setStatusMessage("Loading your portfolio...");
      setErrorDisplay(null);

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

        if (portfolioArray.length === 0) {
          setPortfolioData(data); // fallback
        } else {
          setPortfolioData(portfolioArray[0]);
        }

        setStatusMessage("Portfolio loaded successfully.");
      } catch (err) {
        setErrorDisplay(err.response?.data?.error || "Failed to load portfolio");
        setStatusMessage("Failed to load portfolio.");
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
    setStatusMessage("Calculating tax...");

    try {
      if (!financialYear || isNaN(taxRateDisplay)) {
        throw new Error("Please ensure Financial Year and Tax Slab are valid.");
      }

      if (!portfolioData || typeof portfolioData !== "object") {
        throw new Error("Portfolio data is empty or invalid.");
      }

      const response = await axios.post(
        "https://asia-south1-moneyantra-465713.cloudfunctions.net/calculate_tax_http",
        {
          cas_json: portfolioData.casData,
          financial_year: financialYear,
          tax_slab: taxRateDisplay / 100,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const taxSummary = response.data?.tax_summary;

      if (!taxSummary) {
        throw new Error("Invalid response from tax calculation API.");
      }

      const stcgDetails = (taxSummary?.stcg?.details || []).map((item) => ({
        folio: item.Folio || "N/A",
        isin: item.ISIN || "N/A",
        schemeName: item.SchemeName || "N/A",
        rate: (item["STCG Rate"] || 0) * 100,
        gain: item["Total STCG"] || 0,
        tax: item["STCG Tax"] || 0,
      }));

      const ltcgDetails = (taxSummary?.ltcg?.details || []).map((item) => ({
        folio: item.Folio || "N/A",
        isin: item.ISIN || "N/A",
        schemeName: item.SchemeName || "N/A",
        rate: (item["LTCG Rate"] || 0) * 100,
        gain: item["Total LTCG"] || 0,
        tax: item["LTCG Tax"] || 0,
      }));

      setResults({
        stcgDetails,
        totalStcgTax: taxSummary?.stcg?.total || 0,
        ltcgDetails,
        totalLtcgTax: taxSummary?.ltcg?.total || 0,
        message: taxSummary?.statusMessage || "Success",
      });

      setStatusMessage(taxSummary?.statusMessage || "Tax calculation successful.");
    } catch (error) {
      setErrorDisplay(error.message || "Failed to calculate tax");
      setStatusMessage("Tax calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarLogin />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-xl font-bold">Calculate Tax for Current Financial Year</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <button
            onClick={calculateTax}
            className="bg-[#124e78] text-white px-6 py-2 rounded-full hover:bg-[#F26419]"
            disabled={loading || !portfolioData}
          >
            {loading ? "Calculating..." : "Calculate Tax"}
          </button>

          {statusMessage && (
            <div
              className={`text-sm p-2 rounded mt-3 ${
                errorDisplay
                  ? "text-red-700 bg-red-100"
                  : "text-green-700 bg-green-100"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {!portfolioData && !loading && (
            <p className="text-sm text-gray-500 mt-2">
              No portfolio data found. Please upload or check authentication.
            </p>
          )}
        </div>

        {errorDisplay && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mt-4">
            <strong className="font-bold">Error: </strong>
            {errorDisplay}
          </div>
        )}

        {results && results.totalStcgTax > 0 && (
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-xl font-bold mb-3">STCG Calculation Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 font-bold">Scheme Name</th>
                    <th className="py-3 px-4 font-bold">Folio</th>
                    <th className="py-3 px-4 font-bold">ISIN</th>
                    <th className="py-3 px-4 font-bold text-right">Rate</th>
                    <th className="py-3 px-4 font-bold text-right">Gain</th>
                    <th className="py-3 px-4 font-bold text-right">Tax</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {results.stcgDetails.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">{row.schemeName}</td>
                      <td className="py-3 px-4">{row.folio}</td>
                      <td className="py-3 px-4">{row.isin}</td>
                      <td className="py-3 px-4 text-right">{row.rate}%</td>
                      <td className="py-3 px-4 text-right">₹{row.gain.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">₹{row.tax.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 font-bold text-lg text-right">
              Total STCG Tax: ₹{results.totalStcgTax.toFixed(2)}
            </p>
          </div>
        )}

        {results && results.totalLtcgTax > 0 && (
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-xl font-bold mb-3">LTCG Calculation Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-4 font-bold">Scheme Name</th>
                    <th className="py-3 px-4 font-bold">Folio</th>
                    <th className="py-3 px-4 font-bold">ISIN</th>
                    <th className="py-3 px-4 font-bold text-right">Rate</th>
                    <th className="py-3 px-4 font-bold text-right">Gain</th>
                    <th className="py-3 px-4 font-bold text-right">Tax</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {results.ltcgDetails.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">{row.schemeName}</td>
                      <td className="py-3 px-4">{row.folio}</td>
                      <td className="py-3 px-4">{row.isin}</td>
                      <td className="py-3 px-4 text-right">{row.rate}%</td>
                      <td className="py-3 px-4 text-right">₹{row.gain.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">₹{row.tax.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 font-bold text-lg text-right">
              Total LTCG Tax: ₹{results.totalLtcgTax.toFixed(2)}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
