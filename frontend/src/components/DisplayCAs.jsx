import { useEffect, useState } from "react";
import NavbarLogin from "./Navbarlogin";
import Footer from "./Footer";
import axiosInstance from "../utils/axiosInstance";

export default function DisplayCAs() {
    const [groupedTxns, setGroupedTxns] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    const sendErrorEmail = async (message) => {
        try {
            await axiosInstance.post("/send-cas-error-mail", {
                errorMessage: message,
            });
        } catch (err) {
            console.error("Failed to send error email:", err);
        }
    };

    useEffect(() => {
        const fetchCasData = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get("/get-cas");

                if (res.data && res.data.casData) {
                    setData(res.data.casData);
                    localStorage.setItem("casData", JSON.stringify(res.data.casData));
                    setError("");
                } else {
                    const msg = "No CAS data found for this user from the server or data is empty.";
                    setError(msg);
                    setData(null);
                    await sendErrorEmail(msg);
                }
            } catch (err) {
                const navigate = useNavigate();
                navigate("/parse-cas");
                const errorMessage = err.response?.data?.message || err.message || "Failed to load CAS data from the server.";
                setError(errorMessage);
                setData(null);
                await sendErrorEmail(errorMessage);
                console.error("Error fetching CAS data:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };

        fetchCasData();
    }, []);

    useEffect(() => {
        console.log("Data state updated, attempting to group transactions:", data);

        if (!data || !data.folios || !Array.isArray(data.folios)) {
            console.warn("Invalid or missing data structure (expected data.folios to be an array). Resetting groupedTxns.", data);
            setGroupedTxns({});
            return;
        }

        const schemeMap = {};
        let hasMissingIsin = false;

        data.folios.forEach((folio) => {
            if (folio.schemes && Array.isArray(folio.schemes)) {
                folio.schemes.forEach((scheme) => {
                    if (!scheme.isin) {
                        hasMissingIsin = true;
                    }

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
                                isin: scheme.isin,
                                date: t.date,
                                description: t.description,
                                amount: (t.amount !== null && !isNaN(parseFloat(t.amount))) ? parseFloat(t.amount) : null,
                                units: (t.units !== null && !isNaN(parseFloat(t.units))) ? parseFloat(t.units) : null,
                                nav: (t.nav !== null && !isNaN(parseFloat(t.nav))) ? parseFloat(t.nav) : null,
                                balance: (t.balance !== null && !isNaN(parseFloat(t.balance))) ? parseFloat(t.balance) : null,
                                type: t.type,
                                dividend_rate: t.dividend_rate,
                            };

                            const isDisplayable =
                                processedTransaction.date &&
                                processedTransaction.type &&
                                processedTransaction.nav !== null;

                            if (isDisplayable) {
                                schemeMap[key].push(processedTransaction);
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

        if (hasMissingIsin) {
            const msg = "An error has occurred and our team is looking into this. You'll get an email once it's resolved.";
            setError(msg);
            setGroupedTxns({});
            sendErrorEmail(msg);
        } else {
            setError("");
            setGroupedTxns(schemeMap);
        }
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

    const renderDetail = (label, value) => (
        <div className="flex justify-between items-center py-1">
            <span className="text-gray-600 text-sm">{label}:</span>
            <span className="font-medium text-gray-800 text-sm">{value}</span>
        </div>
    );

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
                        <div key={index} className="mb-12 md:border rounded-lg md:shadow-md md:p-4 bg-white">
                            {/* Mobile View */}
                            <div className="md:hidden">
                                <div className="mb-6 border rounded-xl shadow-md p-4 bg-white">
                                    {/* AMC Card */}
                                    <p className=" font-bold text-center">
                                        AMC : {txns[0]?.amc}
                                    </p>

                                    {/* Fund Card */}
                                    <div className="border rounded-lg shadow-sm p-3 mb-4 bg-gray-50">
                                        <p className="text-base font-semibold text-gray-800 mb-2">
                                            {schemeName}{" "}
                                            {txns[0]?.isin && (
                                                <span className="text-xs text-gray-500">({txns[0].isin})</span>
                                            )}
                                        </p>

                                        {/* Transactions */}
                                        <div className="grid gap-2">
                                            {txns.map((t, i) => (
                                                <div
                                                    key={i}
                                                    className={`rounded-lg border p-3 shadow-sm ${["purchase", "purchase_sip"].includes(t.type?.toLowerCase())
                                                        ? "border-green-400 bg-green-50"
                                                        : t.type?.toLowerCase() === "redemption"
                                                            ? "border-red-400 bg-red-50"
                                                            : "border-gray-300 bg-gray-50"
                                                        }`}
                                                >


                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs text-gray-500">
                                                            {t.date
                                                                ? new Date(t.date).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "2-digit",
                                                                })
                                                                : "-"}
                                                        </span>
                                                        <span
                                                            className={`font-bold text-xs ${["purchase", "purchase_sip"].includes(t.type?.toLowerCase())
                                                                    ? "text-green-700"
                                                                    : t.type?.toLowerCase() === "redemption"
                                                                        ? "text-red-700"
                                                                        : "text-gray-600"
                                                                }`}
                                                        >
                                                            {t.type}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-x-3 text-xs p-2 text-gray-700">
                                                        <p>
                                                            <span className="font-medium">Amount:</span>{" "}
                                                            {t.amount !== null ? `₹${formatNumber(t.amount, 0)}` : "-"}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Units:</span>{" "}
                                                            {t.units !== null ? formatNumber(t.units, 4) : "-"}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">NAV:</span>{" "}
                                                            {t.nav !== null ? `₹${formatNumber(t.nav, 2)}` : "-"}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Balance:</span>{" "}
                                                            {t.balance !== null ? formatNumber(t.balance, 4) : "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <div className="hidden md:block">
                                <h2 className=" sm text-2xl font-semibold mb-4 text-blue-800 border-b pb-2">
                                    {schemeName}
                                    {txns[0]?.amc && <span className="text-lg text-gray-600 ml-3">({txns[0].amc})</span>}
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-md">
                                        <thead className="bg-[#33658a] text-white">
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
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {t.amount !== null ? `${formatNumber(t.amount, 0)}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {t.units !== null ? formatNumber(t.units, 4) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {t.nav !== null ? `${formatNumber(t.nav, 2)}` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {t.balance !== null ? formatNumber(t.balance, 4) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {t.type}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    ))
                )}
            </div>
            <Footer />
        </div>
    );
}