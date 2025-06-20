import { useEffect, useState } from "react";
import NavbarLogin from "./Navbarlogin";
import Footer from "./Footer";
import axiosInstance from "../utils/axiosInstance";

export default function DisplayCAs() {
    const [txns, setTxns] = useState([]);
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

        const allTransactions = [];
        data.data.folios.forEach((folio) => {
            folio.schemes.forEach((scheme) => {
                scheme.transactions.forEach((t) =>
                    allTransactions.push({
                        folio: folio.folio,
                        amc: folio.amc,
                        scheme: scheme.scheme,
                        ...t,
                    })
                );
            });
        });
        setTxns(allTransactions);
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
                ) : txns.length === 0 ? (
                    <p className="text-xl text-gray-700">
                        No transactions found in CAS.
                    </p>
                ) : (
                    <>
                        <p className="text-2xl mb-6">
                            Showing transactions for:{" "}
                            <strong>{txns[0].scheme}</strong>
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-blue-900 text-white">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Folio</th>
                                        <th className="px-4 py-2">Scheme</th>
                                        <th className="px-4 py-2">Description</th>
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
                                            <td className="px-4 py-2">{t.date}</td>
                                            <td className="px-4 py-2">{t.folio}</td>
                                            <td className="px-4 py-2">{t.scheme}</td>
                                            <td className="px-4 py-2">{t.description}</td>
                                            <td className="px-4 py-2">{t.amount ?? "—"}</td>
                                            <td className="px-4 py-2">{t.units ?? "—"}</td>
                                            <td className="px-4 py-2">{t.nav ?? "—"}</td>
                                            <td className="px-4 py-2">{t.balance ?? "—"}</td>
                                            <td className="px-4 py-2">{t.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
