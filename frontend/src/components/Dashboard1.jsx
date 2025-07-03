import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function Dashboard1() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get("/dashboard");
                setDashboardData(response.data);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(err?.response?.data?.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
    if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

    const { name, totalAmount, investedAmount, profit, profitPercent } = dashboardData;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Welcome, {name}</h2>
            <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-semibold text-green-600">
                        ₹ {Number(totalAmount).toLocaleString("en-IN")}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Invested Amount:</span>
                    <span className="font-semibold text-blue-600">
                        ₹ {Number(investedAmount).toLocaleString("en-IN")}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Profit:</span>
                    <span
                        className={`font-semibold ${
                            profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        ₹ {Number(profit).toLocaleString("en-IN")}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Profit %:</span>
                    <span
                        className={`font-semibold ${
                            profitPercent >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {profitPercent}%
                    </span>
                </div>
            </div>
        </div>
    );
}
