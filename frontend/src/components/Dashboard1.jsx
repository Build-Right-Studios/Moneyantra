import React from 'react';

const StatCard = ({ icon, title, value, valueColor }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
            <div className="p-3 rounded-full flex items-center justify-center" style={{ backgroundColor: icon.bgColor }}>
                <i className={`${icon.className} h-6 w-6 flex items-center justify-center`} style={{ color: icon.color }}></i>
            </div>

            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
            </div>
        </div>
    );
};
function Dashboard1() {
    const stats = [
        {
            icon: {
                className: "fas fa-briefcase",
                bgColor: "#E0F2FE",
                color: "#2563EB"
            },
            title: "Total Portfolio",
            value: "₹24,20,000",
            valueColor: "text-gray-800"
        },
        {
            icon: {
                className: "fas fa-briefcase",
                bgColor: "#E0F2FE",
                color: "#2563EB"
            },
            title: "Total Invested",
            value: "₹21,50,000",
            valueColor: "text-gray-800"
        },
        {
            icon: {
                className: "fas fa-briefcase",
                bgColor: "#E0F2FE",
                color: "#2563EB"
            },
            title: "Total Profit",
            value: "₹2,70,000",
            valueColor: "text-gray-800"
        },
        {
            icon: {
                className: "fas fa-chart-pie",
                bgColor: "#ECFDF5", 
                color: "#10B981" 
            },
            title: "Profit %",
            value: "10%",
            valueColor: "text-green-600" 
        }
    ];

    return (
        <div className="bg-gray-100 p-8">

        </div>
    )

}

export default Dashboard1;