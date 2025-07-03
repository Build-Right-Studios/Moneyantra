import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// PortfolioOverview Component
function PortfolioOverview() {
    return (
        <div className="w-full p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Portfolio Overview</h2>
                <div className="bg-green-100 p-2 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M18 14v4h-4M4 18h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg shadow-md">
                    <p className="text-purple-700 text-base sm:text-lg font-semibold mb-2">Total Value</p>
                    <p className="text-purple-900 text-xl sm:text-2xl font-extrabold">₹50,00,000</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg shadow-md">
                    <p className="text-green-700 text-base sm:text-lg font-semibold mb-2">Returns</p>
                    <p className="text-green-900 text-xl sm:text-2xl font-extrabold">15.35% XIRR</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 h-3 rounded-full" style={{ width: '70%' }}></div>
            </div>
        </div>
    );
}

// PortfolioSection Component
function PortfolioSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.5 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } }
    };

    return (
        <motion.div
            ref={ref}
            className="min-h-screen flex items-center justify-center px-4 py-8"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <section className="w-full max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Text Section */}
                <motion.section
                    className="w-full md:w-1/2 p-6 bg-white" // Adjusted width for responsiveness
                    variants={containerVariants} // Apply variants to this section as well if you want its children to stagger
                >
                    <motion.div variants={itemVariants} className="mt-10 mb-3 ">

                        <span className="bg-blue-100 text-blue-800 text-xs lg:text-xl font-semibold px-3 py-1 rounded-2xl">
                            India’s Most Trusted Mutual Fund Tooling Platform
                        </span>
                    </motion.div>

                    <motion.h2 variants={itemVariants}>
                        <span className="text-[#f26419] text-4xl sm:text-5xl font-bold">Portfolio Insights</span><br />
                        <span className="text-[#33658a] text-3xl sm:text-4xl font-bold">To Help You Reach Your Dreams</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-base sm:text-lg mt-6 text-gray-700 font-medium">
                        Will your portfolio create long-term wealth? Do you have the right funds? Do you need to
                        change your funds? Are you getting good returns? Moneyantra can help you know.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-6">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="bg-orange-500 text-white px-4 py-2 sm:py-3 rounded-md hover:bg-orange-600 transition font-semibold">
                            Review Now
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="border border-gray-300 text-gray-800 px-4 py-2 sm:py-3 rounded-md hover:bg-gray-100 transition font-semibold">
                            View Demo
                        </motion.button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-wrap mt-6 gap-4 text-gray-600 text-sm sm:text-base">
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
                    </motion.div>
                </motion.section>

                {/* PortfolioOverview (Image Section) */}
                <motion.section className="w-full lg:w-1/2" variants={imageVariants}>
                    <PortfolioOverview />
                </motion.section>
            </section>
        </motion.div>
    );
}

export default PortfolioSection;
