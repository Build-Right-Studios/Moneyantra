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
        if (
          portfolioData.casData &&
          Array.isArray(portfolioData.casData.folios) &&
          portfolioData.casData.folios.length > 0
        ) {
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
      portfolio.casData.folios.forEach((folio) => {
        if (Array.isArray(folio.schemes)) {
          allSchemes.push(...folio.schemes);
        }
      });
    }

    const schemeList = [...new Set(allSchemes.map((s) => s.scheme))].map((name) => {
      const allInstances = allSchemes.filter((s) => s.scheme === name);
      const totalUnits = allInstances.reduce(
        (sum, s) =>
          sum +
          parseFloat(s.close || s.transactions?.slice(-1)[0]?.balance || 0),
        0
      );
      const currentValue = allInstances.reduce(
        (sum, s) => sum + parseFloat(s.valuation?.value || 0),
        0
      );
      const currentNAV = totalUnits > 0 ? currentValue / totalUnits : 0;

      return {
        name,
        isin: allInstances[0]?.isin || "",
        amfi: allInstances[0]?.amfi || "",
        totalUnits,
        currentValue,
        currentNAV,
        transactions: allInstances.flatMap((s) => s.transactions || []),
      };
    });
    setSchemes(schemeList);
  };

  const handleInputChange = (schemeName, value) => {
    setLiquidationAmounts((prev) => ({
      ...prev,
      [schemeName]: value,
    }));

    setSchemeErrors((prev) => {
      const copy = { ...prev };
      delete copy[schemeName];
      return copy;
    });
  };

  const handleLiquidateAll = () => {
    const allValues = {};
    schemes.forEach((scheme) => {
      allValues[scheme.name] = scheme.currentValue.toFixed(2);
    });
    setLiquidationAmounts(allValues);
  };

  const handleSimulationAndTax = async () => {
    if (!fullPortfolio) {
      setError("Portfolio data not available.");
      return;
    }

    setSimulating(true);
    const updatedPortfolio = JSON.parse(JSON.stringify(fullPortfolio));
    let hasValidAmount = false;
    let hasError = false;

    const tasks = schemes.map(async (scheme) => {
      const amount = parseFloat(liquidationAmounts[scheme.name]);
      if (isNaN(amount) || amount <= 0) return null;

      if (amount > scheme.currentValue + 0.0001) {
        setSchemeErrors((prev) => ({
          ...prev,
          [scheme.name]: `Insufficient funds. You can liquidate a maximum of ₹${Number(
            scheme.currentValue
          ).toFixed(2)}.`,
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
        isin: scheme.isin || null,
      };

      updatedPortfolio.casData.folios.forEach((folio) => {
        const matchingSchemes = folio.schemes.filter((s) => s.scheme === scheme.name);
        matchingSchemes.forEach((folioScheme) => {
          if (!folioScheme.transactions) {
            folioScheme.transactions = [];
          }
          folioScheme.transactions.push(newTransaction);
        });
      });

      return true;
    });

    await Promise.all(tasks);

    if (hasError) {
      setSimulating(false);
      return;
    }

    if (!hasValidAmount) {
      setSimulating(false);
      setError("Please enter at least one valid amount to simulate.");
      return;
    }

    setFullPortfolio(updatedPortfolio);
    setSimulating(false);

    handleCalculateTax(updatedPortfolio);
  };

  const handleCalculateTax = async (portfolioToUse) => {
    setCalculating(true);
    setTaxResults(null);
    setError(null);
    try {
      if (!portfolioToUse)
        throw new Error("Portfolio data not available for tax calculation.");

      const response = await axios.post(
        "https://asia-south1-moneyantra-test.cloudfunctions.net/calc-tax",
        {
          cas_json: portfolioToUse.casData,
          financial_year: financialYear,
          tax_slab: stcgRate / 100,
        },
        { headers: { "Content-Type": "application/json" } }
      );

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

  if (loading && !taxResults) {
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
          <h2 className="text-xl flex justify-center font-bold text-gray-800">
            Simulate a Redemption
          </h2>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold p-4 text-gray-800">
              SELECT SCHEMES TO LIQUIDATE
            </h3>
            <button
              onClick={handleLiquidateAll}
              className="px-4 py-2 bg-[#33658a] text-white text-sm rounded hover:bg-[#f26419]"
            >
              Liquidate All
            </button>
          </div>

          {schemes.length > 0 ? (
            <>
              <ul className="space-y-4">
                {schemes.map((scheme, index) => (
                  <li
                    key={index}
                    className="p-4 border border-gray-300 rounded-md shadow-sm bg-white"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-bold mb-2">{scheme.name}</div>
                        <p className="text-sm text-gray-500">
                          ISIN: {scheme.isin || "N/A"}
                        </p>
                        <div className="block sm:hidden text-left mt-2">
                          <p className="font-bold">
                            ₹{Number(scheme.currentValue).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Units: {Number(scheme.totalUnits).toFixed(4)}
                          </p>
                          <p className="text-sm text-gray-600">
                            NAV: {Number(scheme.currentNAV).toFixed(4)}
                          </p>
                        </div>
                        <input
                          type="number"
                          value={liquidationAmounts[scheme.name] || ""}
                          onChange={(e) =>
                            handleInputChange(scheme.name, e.target.value)
                          }
                          placeholder="Enter amount to liquidate"
                          className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                        {schemeErrors[scheme.name] && (
                          <p className="mt-2 text-sm text-red-600">
                            {schemeErrors[scheme.name]}
                          </p>
                        )}
                      </div>
                      <div className="hidden sm:block text-right sm:w-1/3">
                        <p className="font-bold">
                          ₹{Number(scheme.currentValue).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Units: {Number(scheme.totalUnits).toFixed(4)}
                        </p>
                        <p className="text-sm text-gray-600">
                          NAV: {Number(scheme.currentNAV).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSimulationAndTax}
                className="mt-8 w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#33658a] hover:bg-[#f26419] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={simulating || calculating}
              >
                {simulating || calculating
                  ? "Processing..."
                  : "Simulate"}
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500">
              No schemes found in your portfolio.
            </p>
          )}

          {taxResults && (
            <div className="bg-white rounded shadow p-6 mt-8">
              <h3 className="text-xl font-bold mb-3">Tax Calculation Summary</h3>

              {/* STCG Table */}
              {taxResults.stcgDetails.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-lg mb-2">
                    Short-Term Capital Gains (STCG)
                  </h4>
                  <p className="font-bold text-md text-right">
                    Total STCG Tax: ₹{Number(taxResults.totalStcgTax).toFixed(2)}
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse text-left">
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

              {/* LTCG Table */}
              {taxResults.ltcgDetails.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-lg mb-2">
                    Long-Term Capital Gains (LTCG)
                  </h4>
                  <p className="font-bold text-md text-right">
                    Total LTCG Tax: ₹{Number(taxResults.totalLtcgTax).toFixed(2)}
                  </p>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full border-collapse text-left">
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
