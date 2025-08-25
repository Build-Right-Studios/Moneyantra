import React, { useEffect, useState } from 'react';
import NavbarLogin from '../components/Navbarlogin';
import { useNavigate } from "react-router-dom";
import Footer from '../components/Footer';
import axiosInstance from "../utils/axiosInstance";
import axios from 'axios';

const SimulateTax = () => {
  const [financialYear, setFinancialYear] = useState('FY-2025-26');
  const [stcgRate, setStcgRate] = useState(30);
  const [liquidationAmounts, setLiquidationAmounts] = useState({});
  const [schemes, setSchemes] = useState([]);
  const [fullPortfolio, setFullPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulatedTransactions, setSimulatedTransactions] = useState([]);
  const [taxResults, setTaxResults] = useState(null);
  const [schemeErrors, setSchemeErrors] = useState({});
  const [simulating, setSimulating] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/user-portfolio");
        const portfolioData = response.data;
        if (portfolioData.casData && Array.isArray(portfolioData.casData.folios) && portfolioData.casData.folios.length > 0) {
          setFullPortfolio(portfolioData);
          recalculateSchemes(portfolioData);
        } else {
          setFullPortfolio(null);
          navigate("/parse-cas");
        }
      } catch (err) {
        navigate("/parse-cas");
        setError("Failed to load portfolio data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioData();
  }, []);

  const recalculateSchemes = (portfolio) => {
    const allSchemes = [];
    if (portfolio.casData && Array.isArray(portfolio.casData.folios)) {
      portfolio.casData.folios.forEach(folio => {
        if (Array.isArray(folio.schemes)) {
          allSchemes.push(...folio.schemes);
        }
      });
    }

    const schemeList = [...new Set(allSchemes.map(s => s.scheme))]
      .map(name => {
        const allInstances = allSchemes.filter(s => s.scheme === name);
        const totalUnits = allInstances.reduce((sum, s) => sum + parseFloat(s.close || s.transactions?.slice(-1)[0]?.balance || 0), 0);
        const currentValue = allInstances.reduce((sum, s) => sum + parseFloat(s.valuation?.value || 0), 0);
        const currentNAV = totalUnits > 0 ? currentValue / totalUnits : 0;

        return {
          name,
          isin: allInstances[0]?.isin || "",
          amfi: allInstances[0]?.amfi || "",
          totalUnits,
          currentValue,
          currentNAV,
          transactions: allInstances.flatMap(s => s.transactions || [])
        };
      });
    setSchemes(schemeList);
  };

  const handleInputChange = (schemeName, value) => {
    setLiquidationAmounts(prev => ({
      ...prev,
      [schemeName]: value
    }));

    setSchemeErrors(prev => {
      const copy = { ...prev };
      delete copy[schemeName];
      return copy;
    });
  };

  const handleAllSimulations = async () => {
    if (!fullPortfolio) {
      setError("Portfolio data not available.");
      return;
    }

    setSimulating(true);
    const updatedPortfolio = JSON.parse(JSON.stringify(fullPortfolio));
    let hasValidAmount = false;
    let hasError = false;

    // Prepare tasks for parallel NAV fetching
    const tasks = schemes.map(async (scheme) => {
      const amount = parseFloat(liquidationAmounts[scheme.name]);
      if (isNaN(amount) || amount <= 0) return null;

      if (amount > scheme.currentValue) {
        setSchemeErrors((prev) => ({
          ...prev,
          [scheme.name]: `Insufficient funds. You can liquidate a maximum of ₹${Number(
            scheme.currentValue
          ).toFixed(2)}.`
        }));
        hasError = true;
        return null;
      } else {
        setSchemeErrors((prev) => {
          const copy = { ...prev };
          delete copy[scheme.name];
          return copy;
        });
      }

      hasValidAmount = true;

      let latestNAV = scheme.currentNAV;
      if (scheme.isin) {
        try {
          const navResponse = await axiosInstance.get(`/api/nav/${scheme.isin}`);
          latestNAV = navResponse.data.nav || scheme.currentNAV;
        } catch (err) {
          console.error(`Failed to fetch NAV for ${scheme.name}`, err);
        }
      }

      const unitsToRedeem = amount / latestNAV;
      const newTransaction = {
        date: new Date().toISOString().split("T")[0],
        description: "REDEMPTION",
        amount: -amount,
        units: -unitsToRedeem,
        nav: latestNAV,
        type: "REDEMPTION",
        dividend_rate: null,
        isin: scheme.isin || null
      };

      updatedPortfolio.casData.folios.forEach((folio) => {
        const folioScheme = folio.schemes.find((s) => s.scheme === scheme.name);
        if (folioScheme) {
          if (!folioScheme.transactions) {
            folioScheme.transactions = [];
          }
          folioScheme.transactions.push(newTransaction);
        }
      });

      return { schemeName: scheme.name, transaction: newTransaction };
    });

    // Run all NAV fetch + transaction creations in parallel
    const results = await Promise.all(tasks);

    // Filter valid results
    const validTransactions = results.filter((r) => r !== null);

    if (hasError) {
      setSimulating(false);
      return;
    }

    if (!hasValidAmount) {
      setSimulating(false);
      setError("Please enter at least one valid amount to simulate.");
      return;
    }

    setSimulatedTransactions(validTransactions);
    setTaxResults(null);
    setFullPortfolio(updatedPortfolio);
    setSimulating(false);
  };

  const handleCalculateTax = async (portfolioToUse) => {
    setCalculating(true);
    setTaxResults(null);
    setError(null);
    try {
      if (!portfolioToUse) throw new Error("Portfolio data not available for tax calculation.");
      console.log(portfolioToUse.casData);

      const response = await axios.post(
        "https://asia-south1-moneyantra-test.cloudfunctions.net/calc-tax",
        {
          cas_json: portfolioToUse.casData,
          financial_year: financialYear,
          tax_slab: stcgRate / 100,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("TAX API RAW RESPONSE:", response.data);

      const taxSummary = response.data?.tax_summary;
      if (!taxSummary) throw new Error("Invalid response from tax calculation API.");

      const stcgDetails = (taxSummary?.stcg?.details || []).map((item) => ({
        folio: item.Folio || "N/A",
        isin: item.ISIN || "N/A",
        schemeName: item.SchemeName || "N/A",
        gain: Number(item["Total STCG"] || 0),
        tax: Number(item["STCG Tax"] || 0),
      }));

      const ltcgDetails = (taxSummary?.ltcg?.details || []).map((item) => ({
        folio: item.Folio || "N/A",
        isin: item.ISIN || "N/A",
        schemeName: item.SchemeName || "N/A",
        gain: Number(item["Total LTCG"] || 0),
        tax: Number(item["LTCG Tax"] || 0),
      }));

      setTaxResults({
        stcgDetails,
        totalStcgTax: Number(taxSummary?.stcg?.total || 0),
        ltcgDetails,
        totalLtcgTax: Number(taxSummary?.ltcg?.total || 0),
      });

    } catch (err) {
      setError(err.message || "Failed to calculate tax.");
      navigate("/simulate-tax");
    } finally {
      setCalculating(false);
    }
  };

  if (loading && !taxResults && !simulatedTransactions.length) {
    return (
      <div>
        <NavbarLogin />
        <div className="flex justify-center items-center h-screen bg-white">
          <p className="text-xl font-semibold text-gray-700">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavbarLogin />
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <p className="text-xl font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarLogin />
      <div className="flex justify-center items-start p-4 sm:p-10 bg-gray-100">
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-xl flex justify-center font-bold p-4 text-gray-800">
            Simulate a Redemption
          </h2>
          <h3 className="text-lg font-bold p-4 text-gray-800">
            SELECT SCHEMES TO LIQUIDATE
          </h3>
          {schemes.length > 0 ? (
            <>
              <ul className="space-y-4">
                {schemes.map((scheme, index) => (
                  <li key={index} className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-bold mb-2">{scheme.name}</div>
                        <p className="text-sm text-gray-500">ISIN: {scheme.isin || "N/A"}</p>
                        <input
                          type="number"
                          value={liquidationAmounts[scheme.name] || ""}
                          onChange={(e) => handleInputChange(scheme.name, e.target.value)}
                          placeholder="Enter amount to liquidate"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {schemeErrors[scheme.name] && (
                          <p className="mt-2 text-sm text-red-600">{schemeErrors[scheme.name]}</p>
                        )}
                      </div>
                      <div className="text-right sm:w-1/3">
                        <p className="font-bold">₹{Number(scheme.currentValue).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Units: {Number(scheme.totalUnits).toFixed(4)}</p>
                        <p className="text-sm text-gray-600">NAV: {Number(scheme.currentNAV).toFixed(4)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleAllSimulations}
                className="mt-8 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#33658a] hover:bg-[#f26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={simulating}
              >
                {simulating ? "Simulating..." : "Simulate All"}
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500">No schemes found in your portfolio.</p>
          )}

          {simulatedTransactions.length > 0 && (
            <div className="mt-8 p-6 border-t-2 border-gray-200 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Simulated Transactions</h3>
              {simulatedTransactions.map((tx, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                  <div className="font-semibold text-gray-900">{tx.schemeName}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700 mt-2">
                    <div><span className="font-semibold">Description:</span> {tx.transaction.description}</div>
                    <div><span className="font-semibold">Amount:</span> ₹{Number(tx.transaction.amount).toFixed(2)}</div>
                    <div><span className="font-semibold">Units Liquidated:</span> {Number(tx.transaction.units).toFixed(4)}</div>
                    <div><span className="font-semibold">NAV Used:</span> {Number(tx.transaction.nav).toFixed(4)}</div>
                    <div><span className="font-semibold">ISIN:</span> {tx.transaction.isin || "N/A"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {simulatedTransactions.length > 0 && !taxResults && (
            <button
              onClick={() => handleCalculateTax(fullPortfolio)}
              className="mt-4 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#f26419] hover:bg-[#33658a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={calculating}
            >
              {calculating ? "Calculating Tax..." : "Calculate Tax"}
            </button>
          )}

          {taxResults && (
            <div className="bg-white rounded shadow p-6 mt-8">
              <h3 className="text-xl font-bold mb-3">Tax Calculation Summary</h3>

              {taxResults.totalStcgTax > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg mb-2">Short-Term Capital Gains (STCG) Tax</h4>
                  <p className="font-bold text-md text-right">Total STCG Tax: ₹{Number(taxResults.totalStcgTax).toFixed(2)}</p>

                  <div className="sm:hidden space-y-4 mt-4">
                    {taxResults.stcgDetails.map((row, idx) => (
                      <div key={idx} className="p-4 border rounded-lg shadow bg-gray-50">
                        <p className="font-bold text-gray-800">{row.schemeName}</p>
                        <p className="text-sm text-gray-600">Folio: {row.folio}</p>
                        <p className="text-sm text-gray-600">ISIN: {row.isin}</p>
                        <p className="text-sm text-gray-600">Gain: ₹{Number(row.gain).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Tax: ₹{Number(row.tax).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border-collapse text-left mt-2">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                          <th className="py-2 px-4">Scheme Name</th>
                          <th className="py-2 px-4">Folio</th>
                          <th className="py-2 px-4">ISIN</th>
                          <th className="py-2 px-4 text-right">Gain</th>
                          <th className="py-2 px-4 text-right">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxResults.stcgDetails.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="py-2 px-4">{row.schemeName}</td>
                            <td className="py-2 px-4">{row.folio}</td>
                            <td className="py-2 px-4">{row.isin}</td>
                            <td className="py-2 px-4 text-right">₹{Number(row.gain).toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">₹{Number(row.tax).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {taxResults.totalLtcgTax > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-lg mb-2">Long-Term Capital Gains (LTCG) Tax</h4>
                  <p className="font-bold text-md text-right">Total LTCG Tax: ₹{Number(taxResults.totalLtcgTax).toFixed(2)}</p>

                  <div className="sm:hidden space-y-4 mt-4">
                    {taxResults.ltcgDetails.map((row, idx) => (
                      <div key={idx} className="p-4 border rounded-lg shadow bg-gray-50">
                        <p className="font-bold text-gray-800">{row.schemeName}</p>
                        <p className="text-sm text-gray-600">Folio: {row.folio}</p>
                        <p className="text-sm text-gray-600">ISIN: {row.isin}</p>
                        <p className="text-sm text-gray-600">Gain: ₹{Number(row.gain).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Tax: ₹{Number(row.tax).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border-collapse text-left mt-2">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                          <th className="py-2 px-4">Scheme Name</th>
                          <th className="py-2 px-4">Folio</th>
                          <th className="py-2 px-4">ISIN</th>
                          <th className="py-2 px-4 text-right">Gain</th>
                          <th className="py-2 px-4 text-right">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxResults.ltcgDetails.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-200">
                            <td className="py-2 px-4">{row.schemeName}</td>
                            <td className="py-2 px-4">{row.folio}</td>
                            <td className="py-2 px-4">{row.isin}</td>
                            <td className="py-2 px-4 text-right">₹{Number(row.gain).toFixed(2)}</td>
                            <td className="py-2 px-4 text-right">₹{Number(row.tax).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SimulateTax;