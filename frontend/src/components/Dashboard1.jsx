import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const StatCard = ({ icon, title, value, valueColor }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: icon.bgColor }}>
                <i className={`${icon.className} text-xl`} style={{ color: icon.color }}></i>
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
};

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

    const stats = [
        {
            icon: {
                className: "fas fa-wallet",
                bgColor: "#E0F2FE",
                color: "#2563EB"
            },
            title: "Total Portfolio",
            value: `₹ ${Number(totalAmount).toLocaleString("en-IN")}`,
            valueColor: "text-gray-800"
        },
        {
            icon: {
                className: "fas fa-piggy-bank",
                bgColor: "#F3E8FF",
                color: "#9333EA"
            },
            title: "Total Invested",
            value: `₹ ${Number(investedAmount).toLocaleString("en-IN")}`,
            valueColor: "text-gray-800"
        },
        {
            icon: {
                className: "fas fa-coins",
                bgColor: "#FEF9C3",
                color: "#CA8A04"
            },
            title: "Total Profit",
            value: `₹ ${Number(profit).toLocaleString("en-IN")}`,
            valueColor: profit >= 0 ? "text-green-600" : "text-red-600"
        },
        {
            icon: {
                className: "fas fa-chart-line",
                bgColor: "#ECFDF5",
                color: "#10B981"
            },
            title: "Profit %",
            value: `${profitPercent}%`,
            valueColor: profitPercent >= 0 ? "text-green-600" : "text-red-600"
        }
    ];

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            <h2 className="text-3xl font-bold text-center mb-8">Welcome, {name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>
        </div>
    );
}
