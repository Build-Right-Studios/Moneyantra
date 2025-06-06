import React from "react";
import { FaFacebook } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaSquareInstagram } from "react-icons/fa6";

function Footer() {
    return (
        <footer class="moneyantra-footer">
            <div class="footer-top">
                <div class="footer-logo-section">
                    <img src='media/images/moneyantra.ico' alt="image"></img>
                </div>

                <div class="footer-links-group">
                    <h4 class="footer-heading">Quick Links <span class="underline"></span></h4>
                    <ul>
                        <li><a href="#">Terms & Condition</a></li>
                        <li><a href="#">Blog & News</a></li>
                        <li><a href="#">Get in Touch</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>

                <div class="footer-links-group">
                    <h4 class="footer-heading">Our Services <span class="underline"></span></h4>
                    <ul>
                        <li><a href="#">Dashboard</a></li>
                        <li><a href="#">Tax Calculation</a></li>
                        <li><a href="#">CSV Report</a></li>
                    </ul>
                </div>

                <div class="footer-address">
                    <h4 class="footer-heading">Address <span class="underline"></span></h4>
                    <p>City XX234</p>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-social">
                    <span>Follow us :  </span>
                    <FaFacebook />
                    <FaSquareXTwitter />
                    <FaSquareInstagram />

                </div>
                <p class="footer-copyright">All rights reserved | @2025 Moneyantra</p>
            </div>
        </footer>
    );
}

export default Footer;