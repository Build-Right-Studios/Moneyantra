import React from "react";

// Inline SVG for Facebook Icon
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

// Inline SVG for X (Twitter) Icon
const TwitterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.46 2h-2.8l-7.38 8.48L4.31 2H2l8.83 12.83L2 22h2.8l7.38-8.48L19.69 22H22l-8.83-12.83zM11.5 17l-5.5-8h11L11.5 17z"></path>
    </svg>
);

// Inline SVG for Instagram Icon
const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);


function Footer() {
    return (
        <footer className="w-full bg-[#124e78] text-white pt-10 box-border">
            <div className="flex flex-wrap justify-around px-5 mb-10 md:px-10">
                <div className="flex flex-col items-start mb-5 min-w-[150px] md:items-center text-center md:text-left">
                    <img src='https://placehold.co/160x160/cccccc/000000?text=Logo' className="h-40 w-40 mb-2" alt="Moneyantra Logo" /> {/* Placeholder image */}
                    <div className="text-justify flex flex-col items-center md:items-start">
                        <span>India’s most trusted MF Portfolio</span>
                        <span>tooling platform. Helping investors and</span>
                        <span>advisors manage MF portfolios using</span>
                        <span> our expert guidance and tool sets.</span>
                    </div>
                </div>

                <div className="mb-5 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl font-bold mb-4 relative pb-1">
                        Tax Tools
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Tax Calculator</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Tax Simulator </a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Tax harvesting</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Portfolio Review</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Portfolio Rebalancing</a></li>
                    </ul>
                </div>

                <div className="mb-5 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl font-bold mb-4 relative pb-1">
                        Company
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">About Us</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Tax Experts</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Blog</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Careers</a></li>
                    </ul>
                </div>

                <div className="mb-5 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl font-bold mb-4 relative pb-1">
                        Support
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Help Center</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Contact Us</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Tax FAQ</a></li>
                        <li className="mb-2"><a href="#" className="text-gray-300 text-base hover:text-white transition duration-300">Live Chat</a></li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#2f4858] py-5 px-5 flex flex-col items-center text-center">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                        <FacebookIcon />
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                        <TwitterIcon />
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300">
                        <InstagramIcon />
                    </a>
                </div>
                <p className="text-sm text-gray-300">
                    © 2025 All rights reserved. Made with
                    <span className="text-red-500 px-1">❤️</span>
                    for Indian Investors.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
