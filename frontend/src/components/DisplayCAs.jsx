import { useEffect, useState } from "react";
import NavbarLogin from "./Navbarlogin";
import Footer from "./Footer";
import axiosInstance from "../utils/axiosInstance";

export default function DisplayCAs() {
    const [groupedTxns, setGroupedTxns] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null); // This will hold the 'casData' object from the response

    // Effect to fetch CAS data from the backend
    useEffect(() => {
        const fetchCasData = async () => {
            setLoading(true);

            try {
                const res = await axiosInstance.get("/get-cas");
                console.log("Response from /get-cas:", res.data); // Log the full response
                console.log("Does res.data?.casData exist?", !!res.data?.casData);

                if (res.data && res.data.casData) {
                    setData(res.data.casData); // Set 'data' state to the 'casData' object directly
                    localStorage.setItem("casData", JSON.stringify(res.data.casData));
                    setError("");
                } else {
                    setError("No CAS data found for this user from the server or data is empty.");
                    setData(null);
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || "Failed to load CAS data from the server.";
                setError(errorMessage);
                setData(null);
                console.error("Error fetching CAS data:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };

        fetchCasData();
    }, []);

    // Effect to process and group transactions when 'data' changes
    useEffect(() => {
        console.log("Data state updated, attempting to group transactions:", data);

        // *** CRITICAL CHANGE HERE ***
        // Based on your provided JSON, 'folios' is directly under 'data' (which is casData)
        // NOT under data.data
        if (!data || !data.folios || !Array.isArray(data.folios)) {
            console.warn("Invalid or missing data structure (expected data.folios to be an array). Resetting groupedTxns.", data);
            setGroupedTxns({});
            return;
        }

        const schemeMap = {};
        // *** CRITICAL CHANGE HERE ***
        // Iterate directly over data.folios
        data.folios.forEach((folio) => {
            if (folio.schemes && Array.isArray(folio.schemes)) {
                folio.schemes.forEach((scheme) => {
                    const key = scheme.scheme;
                    if (!schemeMap[key]) {
                        schemeMap[key] = [];
                    }

                    if (scheme.transactions && Array.isArray(scheme.transactions)) {
                        scheme.transactions.forEach((t) => {
                            const processedTransaction = {
                                folio: folio.folio,
                                amc: folio.amc,
                                scheme: scheme.scheme,
                                date: t.date,
                                description: t.description,
                                amount: (t.amount !== null && !isNaN(parseFloat(t.amount))) ? parseFloat(t.amount) : null,
                                units: (t.units !== null && !isNaN(parseFloat(t.units))) ? parseFloat(t.units) : null,
                                nav: (t.nav !== null && !isNaN(parseFloat(t.nav))) ? parseFloat(t.nav) : null,
                                balance: (t.balance !== null && !isNaN(parseFloat(t.balance))) ? parseFloat(t.balance) : null,
                                type: t.type,
                                dividend_rate: t.dividend_rate,
                            };

                            const isDisplayable = processedTransaction.date && processedTransaction.type;

                            if (isDisplayable) {
                                schemeMap[key].push(processedTransaction);
                            } else {
                                console.warn("Skipping transaction due to missing essential fields or invalid numeric values after processing:", t);
                            }
                        });
                    } else {
                         console.warn(`Scheme '${scheme.scheme}' in folio '${folio.folio}' has no transactions or transactions is not an array.`, scheme);
                    }
                });
            } else {
                console.warn(`Folio '${folio.folio}' has no schemes or schemes is not an array.`, folio);
            }
        });

        console.log("Final grouped transactions:", schemeMap);
        setGroupedTxns(schemeMap);
    }, [data]);

    const formatNumber = (num, decimals = 0) => {
        if (num === null || num === undefined) return "-";
        if (isNaN(num)) return "-";

        const isNegative = num < 0;
        const absoluteNum = Math.abs(num).toFixed(decimals);
        const [intPart, decPart] = absoluteNum.split(".");

        let lastThree = intPart.slice(-3);
        let otherNumbers = intPart.slice(0, -3);

        if (otherNumbers !== "") {
            lastThree = "," + lastThree;
        }

        const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        const result = decPart ? `${formattedInt}.${decPart}` : formattedInt;

        return isNegative ? `-${result}` : result;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <NavbarLogin />
            <div className="flex-grow p-4 max-w-7xl mx-auto w-full">
                <h1 className="text-5xl font-bold mb-8 text-center mt-10 text-[#33658a]">
                    Your Parsed CAS Data
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl text-gray-700">Loading your CAS data...</p>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl text-red-600 text-center">{error}</p>
                    </div>
                ) : Object.keys(groupedTxns).length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-xl text-gray-700 text-center">
                            No valid transactions found in your Consolidated Account Statement.
                            Please ensure your uploaded CAS contains transaction details.
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedTxns).map(([schemeName, txns], index) => (
                        <div key={index} className="mb-12 border rounded-lg shadow-md p-4 bg-white">
                            <h2 className="text-2xl font-semibold mb-4 text-blue-800 border-b pb-2">
                                {schemeName}
                                {txns[0]?.amc && <span className="text-lg text-gray-600 ml-3">({txns[0].amc})</span>}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider rounded-tl-md">Date</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wider">Amount (₹)</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wider">Units</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wider">NAV (₹)</th>
                                            <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wider">Balance Units</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wider rounded-tr-md">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {txns.map((t, i) => (
                                            <tr key={i} className={i % 2 ? "bg-gray-50" : "bg-white"}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {t.date ? new Date(t.date).toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "2-digit",
                                                    }) : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {t.amount !== null ? `₹${formatNumber(t.amount, 0)}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {t.units !== null ? formatNumber(t.units, 4) : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {t.nav !== null ? `₹${formatNumber(t.nav, 2)}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {t.balance !== null ? formatNumber(t.balance, 4) : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-left">
                                                    {t.type}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Footer />
        </div>
    );
}