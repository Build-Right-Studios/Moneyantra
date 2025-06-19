import React, { useEffect, useState } from "react";

export default function DisplayCAs({ data }) {
    const [txns, setTxns] = useState([]);

    useEffect(() => {
        if (!data || !data.folios) return;

        const allTransactions = [];
        data.folios.forEach((folio) => {
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
        <div className="p-6 max-w-8xl h-auto mx-auto">
            <h1 className="text-6xl font-bold mt-16 mb-4">Parsed CAS</h1>

            {txns.length === 0 ? (
                <p className="text-xl text-gray-700">No transactions found.</p>
            ) : (
                <>
                    <p className="text-2xl mb-6">
                        Showing transactions for: <strong>{txns[0].scheme}</strong>
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
    );
}
