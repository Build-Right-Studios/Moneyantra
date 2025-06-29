import { useEffect, useState } from "react";
import NavbarLogin from "./Navbarlogin";
import Footer from "./Footer";
import axiosInstance from "../utils/axiosInstance";

export default function DisplayCAs() {
    const [groupedTxns, setGroupedTxns] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosInstance.get("/get-cas");
                console.log("Fetched CAS data:", res.data);

                if (res.data?.casData) {
                    setData(res.data.casData);
                } else {
                    setError("No CAS data found for this user.");
                }
            } catch (err) {
                setError(
                    err.response?.data?.message || "Failed to load CAS data."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!data || !data.data?.folios) return;

        const schemeMap = {};
        data.data.folios.forEach((folio) => {
            folio.schemes.forEach((scheme) => {
                const key = scheme.scheme;
                if (!schemeMap[key]) {
                    schemeMap[key] = [];
                }
                scheme.transactions.forEach((t) =>
                    schemeMap[key].push({
                        folio: folio.folio,
                        amc: folio.amc,
                        scheme: scheme.scheme,
                        ...t,
                    })
                );
            });
        });
        setGroupedTxns(schemeMap);
    }, [data]);

    return (
        <div>
            <NavbarLogin />
            <div className="p-10 max-w-7xl mx-auto min-h-[500px]">
                <h1 className="text-6xl font-bold m-8 text-center mt-10">
                    Parsed CAS
                </h1>

                {loading ? (
                    <p className="text-xl text-gray-700">Loading...</p>
                ) : error ? (
                    <p className="text-xl text-red-600">{error}</p>
                ) : Object.keys(groupedTxns).length === 0 ? (
                    <p className="text-xl text-gray-700">
                        No transactions found in CAS.
                    </p>
                ) : (
                    Object.entries(groupedTxns).map(([schemeName, txns], index) => (
                        <div key={index} className="mb-12">
                            <h2 className="text-3xl font-semibold m-4 text-blue-900">
                                {schemeName}
                            </h2>
                            <div className="overflow-x-auto p-4 m-4 max-sm:p-0 max-sm:m-0">
                                <table className="min-w-full border-collapse">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2">Units</th>
                                            <th className="px-4 py-2">NAV</th>
                                            <th className="px-4 py-2">Balance</th>
                                            <th className="px-4 py-2">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {txns.map((t, i) => (
                                            <tr key={i} className={i % 2 ? "bg-gray-100" : "bg-white"}>
                                                <td className="px-4 py-2">
                                                    {t.date
                                                        ? new Date(t.date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "2-digit",
                                                        })
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-2">{t.amount ? Math.round(t.amount) : "—"}</td>
                                                <td className="px-4 py-2">
                                                    {t.units ? parseFloat(t.units).toFixed(4) : "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {t.nav ? parseFloat(t.nav).toFixed(2) : "—"}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {t.balance ? parseFloat(t.balance).toFixed(4) : "—"}
                                                </td>
                                                <td className="px-4 py-2">{t.type}</td>
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
