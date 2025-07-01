import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
// import portImage from './port.png'; // Remove this import as it's no longer needed
// import PortfolioOverview from './PortfolioOverview'; // This import caused the error, embedding the component below

// Embedded PortfolioOverview component for self-containment
function PortfolioOverview() {
  return (
    <div className="p-6 bg-gray-50"> {/* Removed min-h-screen as it's a sub-component */}
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Portfolio Overview</h1>
        {/* Changed to a general growth/chart icon */}
        <div className="bg-green-100 p-2 rounded-full">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M18 14v4h-4M4 18h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div> <br />

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-3 mx-3">
        {/* Total Value Card */}
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4  rounded-lg shadow-md flex flex-col justify-between">
          <p className="text-purple-700 text-lg font-semibold mb-3">Total Value</p>
          <p className="text-purple-900 text-4xl font-extrabold">₹12,45,890</p>
        </div> 

        {/* Returns Card */}
        <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg shadow-md flex flex-col justify-between">
          <p className="text-green-700 text-lg font-semibold mb-3">Returns</p>
          <p className="text-green-900 text-4xl font-extrabold">+₹2,34,567</p>
        </div>
      </div> <br />

      {/* Progress Bar Section */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        {/* The inner progress bar with a gradient */}
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-700 h-3 rounded-full" 
          style={{ width: '70%' }} // Example width, you can make this dynamic
        ></div>
      </div>
    </div>
  );
}
// End of embedded PortfolioOverview component

function PortfolioSection() {
    const ref = useRef(null);
    
    const inView = useInView(ref, { once: true, amount: 0.5 });

    // Variants for staggered animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Delay between animating each child
                delayChildren: 0.2 // Delay before the first child animates
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const imageVariants = { // This variant will now apply to the PortfolioOverview component container
        hidden: { opacity: 0, x: 100 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } }
    };

    return (
        // Attach the ref to the main section for scroll detection
        <motion.div
            ref={ref}
            className="min-h-screen flex items-center justify-center p-8" // Removed bg-[#2f4858]
            initial="hidden"
            animate={inView ? "visible" : "hidden"} // Animate based on inView status
            variants={containerVariants} // Apply container variants for staggering
        >
            <section className="container mx-auto pt-4 flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl"> {/* Added gap and changed flex-row to flex-col for smaller screens */}
                {/* Text Section */}
                <motion.section
                    className="w-full md:w-1/2 p-6 bg-white" // Adjusted width for responsiveness
                    variants={containerVariants} // Apply variants to this section as well if you want its children to stagger
                >
                    <motion.div variants={itemVariants} className="mt-10 mb-3 ">
                        <span className="bg-blue-100 text-blue-800 text-lg font-semibold px-3 py-1 rounded-2xl">
                            India&apos;s Most Trusted Tax Calculator
                        </span>
                    </motion.div> 
                    <motion.h2 variants={itemVariants}> {/* Responsive text size */}
                        <span className='text-[#33658a] text-6xl font-bold'>Calculate Your</span><br />
                        <span className="text-[#f26419] text-6xl font-bold">Investment Tax</span><br />
                        <span className='text-[#33658a] text-6xl font-bold'>Accurately </span>
                    </motion.h2> <br />

                    <motion.p variants={itemVariants} className="text-lg my-6 font-medium">
                        <div className="text-gray-700 mt-10">
                                    Smart tax calculations for your investment returns. Get precise tax liability, optimize your portfolio,
                                    and maximize your after-tax returns with Moneyantra.
                        </div>
                    </motion.p> <br />
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 mb-6"> {/* Increased gap to 'gap-5' */}
                        <motion.button
                            whileHover={{ scale: 1.05 }} // Scale up on hover
                            whileTap={{ scale: 0.95 }} // Scale down on tap
                            // 2. Made button fully round: "rounded-full" (was rounded-2xl)
                            // Increased horizontal padding for a fuller look: "px-8" (was px-6)
                            // Increased vertical padding slightly: "py-3" (was py-2)
                            className="bg-orange-500 text-white px-4 py-3 rounded-full hover:bg-orange-600 transition font-semibold"
                        >
                            Calculate Tax Now
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            // 2. Made button fully round: "rounded-full" (was rounded-md)
                            // Increased horizontal padding for a fuller look: "px-8" (was px-6)
                            // Increased vertical padding slightly: "py-3" (was py-2)
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

                {/* Image Section - Replaced with PortfolioOverview component */}
                <motion.section
                    className="w-full md:w-1/2 flex justify-center items-center mt-8 md:mt-0" // Adjusted width and margin for responsiveness
                    variants={imageVariants} // Apply image specific variants to the container of PortfolioOverview
                >
                    <PortfolioOverview /> {/* Render the PortfolioOverview component here */}
                </motion.section>
            </section>
        </motion.div>
    );
}

export default PortfolioSection;
