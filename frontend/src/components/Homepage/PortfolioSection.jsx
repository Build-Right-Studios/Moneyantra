import portImage from './port.png';

function PortfolioSection() {
    return (
        <div className="mt-4 p-4 sm:p-0 md:px-10">
            <section className="py-4 sm:p-4 flex flex-col md:flex-row bg-[#f9fbfb] items-center justify-center gap-10">
                
                <section className="w-full h-600px md:w-1/2 bg-[#f9fbfb] p-4 rounded-lg ">
                    <div className="mb-4 pt-2">
                        <span className="bg-blue-100 text-blue-800 text-base sm:text-lg font-semibold px-3 py-1 rounded-full">
                            India&apos;s Most Trusted Tax Calculator
                        </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        <span className='text-[#33658a]'>Calculate Your</span>{" "}
                        <span className="text-[#f26419]">Investment Tax</span>{" "}
                        <span className='text-[#33658a]'>Accurately</span>
                    </h2>
                    <p className="text-gray-700 text-base sm:text-lg mb-6">
                        Smart tax calculations for your investment returns. Get precise tax liability, optimize your portfolio,
                        and maximize your after-tax returns with Moneyantra.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <button className="bg-orange-500 text-white px-6 py-2 text-sm sm:text-base rounded-2xl hover:bg-orange-600 transition">
                            Calculate Tax Now
                        </button>
                        <button className="border border-gray-300 text-gray-800 px-6 py-2 text-sm sm:text-base rounded-md hover:bg-gray-100 transition">
                            View Demo
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

                <section className="w-full md:w-1/2 flex justify-center items-center">
                    <img
                        src={portImage}
                        alt="Portfolio Preview"
                        className="rounded-lg shadow-md w-full max-w-[400px] sm:max-w-[500px] h-auto"
                    />
                </section>
            </section>
        </div>
    );
}

export default PortfolioSection;
