function StatsSection() {
    const stats = [
        { value: "25,000+", label: "Happy Users" },
        { value: "150,000+", label: "Tax Calculations" },
        { value: "45%", label: "Avg. Tax Savings" },
        { value: "99.8%", label: "Accuracy Rate" },
    ];

    return (
        <div className="bg-[#2f4858] p-4">
            <div className="h-[80px] text-amber-400 mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {stats.map((stat, idx) => (
                    <div key={idx}>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <p className="text-gray-300 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StatsSection;