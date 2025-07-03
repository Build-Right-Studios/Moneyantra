<div className="text-justify flex flex-col items-center md:items-start"></div>
import { FaFacebookF, FaXTwitter, FaInstagram } from "react-icons/fa6";

function Footer() {
    return (
        <footer className="w-full bg-[#124e78] text-white pt-10 box-border">
            <div className="flex flex-wrap justify-around px-5 mb-10 md:px-10">
                <div className="flex flex-col items-start mb-5 min-w-[150px] md:items-center text-center md:text-left">
                    <img src='.\media\images\moneyantra.ico' className="h-40 w-40 mb-2 items-center" alt="Moneyantra Logo" />
                    <div className="text-justify flex flex-col items-center md:items-start">
                        <p className="text-gray-300 text-lg mt-2 w-80 lg:text-justify">
                            India’s most trusted MF Portfolio
                            tooling platform. Helping investors and
                            advisors manage MF portfolios using
                            our expert guidance and tool sets. </p>
                    </div>
                </div>

                <div className="mb-2 mt-4 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl font-bold mb-4 relative pb-1">
                        Tax Tools
                        <span className="absolute left-1/2 lg:left-9 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Tax Calculator</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Tax Simulator </a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Tax harvesting</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Portfolio Review</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Portfolio Rebalancing</a></li>
                    </ul>
                </div>

                <div className="mb-2 mt-4 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl mt-6 font-bold mb-4 relative pb-1">
                        Company
                        <span className="absolute left-1/2 lg:left-9 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">About Us</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Tax Experts</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Blog</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Careers</a></li>
                    </ul>
                </div>

                <div className="mb-2 mt-4 min-w-[180px] text-center md:text-left">
                    <h4 className="text-xl font-bold mb-4 relative pb-1">
                        Support
                        <span className="absolute left-1/2 lg:left-9 -translate-x-1/2 bottom-0 w-3/5 h-1 bg-[#F26419] md:left-0 md:translate-x-0"></span>
                    </h4>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Help Center</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Contact Us</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Tax FAQ</a></li>
                        <li className="mb-2"><a href="#" className="text-white hover:text-gray-300 text-base transition duration-300 no-underline">Live Chat</a></li>
                    </ul>
                </div>
            </div>

            <div className="bg-[#2f4858] py-3 px-5 flex flex-col items-center text-center">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300 no-underline">
                        <FaFacebookF size={24} />
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300 no-underline">
                        <FaXTwitter size={24} />
                    </a>
                    <a href="#" className="text-white hover:text-gray-300 transition duration-300 no-underline">
                        <FaInstagram size={24} />
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
