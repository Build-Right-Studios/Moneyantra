import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquareInstagram } from "react-icons/fa6";

function Footer() {
    return (
        <footer className="moneyantra-footer">
            <div className="footer-top">
                <div className="footer-logo-section gap-0">
                    <img src='media/images/moneyantra.ico' className="h-40 w-40 " alt="image"></img>
                    <div className="text-justify flex flex-col">
                        <span>India’s most trusted MF Portfolio</span>
                        <span>tooling platform. Helping investors and</span>
                        <span>advisors manage MF portfolios using</span>
                        <span> our expert guidance and tool sets.</span>
                    </div>


                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Tax Tools<span className="underline"></span></h4>
                    <ul>
                        <li><a href="#">Tax Calculator</a></li>
                        <li><a href="#">Tax Simulator </a></li>
                        <li><a href="#">Tax harvesting</a></li>
                        <li><a href="#">Portfolio Review</a></li>
                        <li><a href="#">Portfolio Rebalancing</a></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Company<span className="underline"></span></h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Tax Experts</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Careers</a></li>
                    </ul>
                </div>

                <div className="footer-links-group">
                    <h4 className="footer-heading">Support<span className="underline"></span></h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Tax FAQ</a></li>
                        <li><a href="#">Live Chat</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
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