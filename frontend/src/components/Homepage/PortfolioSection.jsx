import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import portImage from './port.png';
import { GoArrowRight } from "react-icons/go";

function PortfolioSection() {
    const ref = useRef(null);

    const inView = useInView(ref, { once: true, amount: 0.5 });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
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
        // Attach the ref to the main section for scroll detection
        <motion.div
            ref={ref}
            className="mt-4 p-4"
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <section className="pt-5 flex flex-col md:flex-row items-center justify-center gap-8">
                <motion.section
                    className="w-full md:w-1/2 bg-white p-4 rounded-lg max-w-3xl mx-auto"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mt-10 mb-3 ">
                        <span className="bg-blue-100 text-blue-800 text-lg font-semibold px-3 py-1 rounded-2xl">
                            India’s Most Trusted Mutual Fund Tooling Platform
                        </span>
                    </motion.div>
                    <motion.h2 variants={itemVariants}> {/* Responsive text size */}
                        <span className="text-[#f26419] text-6xl font-bold">Portfolio Insights  </span><br />
                        <span className='text-[#33658a] text-6xl font-bold'>to Help You Reach Your Dreams</span><br />

                    </motion.h2> <br />

                    <motion.p variants={itemVariants} className="text-lg my-6 font-medium">
                        <div className="text-gray-700 mt-10">
                            Will your portfolio create long-term wealth? Do you have the right funds? Do you need to
                            change your funds? Are you getting good returns? Moneyantra can help you know.
                        </div>
                    </motion.p> <br />
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mb-6"> {/* Increased gap to 'gap-5' */}
                        <motion.button
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            className="bg-orange-500 text-white flex flex-row items-center justify-center gap-2 px-4 py-3 rounded-full hover:bg-orange-600 transition font-semibold"
                        >
                            Review Now <GoArrowRight/>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="border border-gray-300 text-gray-800 px-4 py-3 rounded-full hover:bg-gray-100 transition font-semibold"
                        >
                            View Demo
                        </motion.button>
                    </motion.div> <br />
                    <motion.div variants={itemVariants} className="flex flex-wrap mt-4 gap-6 text-gray-600"> {/* Added flex-wrap for smaller screens */}
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

                {/* Image Section */}
                <motion.section
                    className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0" // Adjusted width and margin for responsiveness
                    variants={imageVariants} // Apply image specific variants
                >
                    <img
                        src={portImage}
                        alt="Portfolio Preview"
                        className="mx-auto rounded-lg shadow-md w-full max-w-lg h-auto" // Adjusted image size for responsiveness
                    />
                </motion.section>
            </section>
        </motion.div>
    );
}

export default PortfolioSection;