import portImage from './port.png';

function PortfolioSection() {
    return (
        <div className="mt-4 p-4">
            <section className="pt-4 flex flex-row items-center justify-center">
                {/* Text Section */}
                <section className="w-1/2 bg-white p-4 rounded-lg max-w-3xl mx-auto">
                    <div className="mb-4 pt-4">
                        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                            India&apos;s Most Trusted Tax Calculator
                        </span>
                    </div>
                    <h2 className="text-5xl font-bold mb-3">
                        <span className='text-[#33658a]'>Calculate Your</span>
                        <span className="text-[#f26419]">Investment Tax</span>
                        <span className='text-[#33658a]'>Accurately </span>
                    </h2>
                    <p className="text-gray-700 mb-6">
                        Smart tax calculations for your investment returns. Get precise tax liability, optimize your portfolio,
                        and maximize your after-tax returns with Moneyantra.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button className="bg-orange-500 text-white px-6 py-2 rounded-2xl hover:bg-orange-600 transition">
                            Calculate Tax Now
                        </button>
                        <button className="border border-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-100 transition">
                            View Demo
                        </button>
                    </div>
                    <div className="flex mt-4 gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">✔</span>
                            <span>100% Accurate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-blue-600">🔒</span>
                            <span>Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-500">📊</span>
                            <span>Detailed Reports</span>
                        </div>
                    </div>
                </section>

                {/* Image Section */}
                <section className="w-1/2 flex justify-center items-center">
                    <img
                        src={portImage}
                        alt="Portfolio Preview"
                        className="mx-auto rounded-lg shadow-md w-[500px] h-[200px] max-w-2xl"
                    />
                </section>
            </section>
        </div>
    );
}

export default PortfolioSection;
