import React from "react";
import { FaPhone } from "react-icons/fa6";
import { TfiEmail } from "react-icons/tfi";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";

function Getintouch() {
    return (
        <div className="touch">
            <h1>Get In Touch</h1>
            <div className="touch-2">
                <div className="box">
                    <FaPhone />
                    <div className="text">
                        <span>Email</span>
                        <h6>Moneyantra@gmail.com</h6>
                    </div>

                </div>
                <div className="box">
                    <TfiEmail />
                    
                    <div className="text">
                        <span>Phone Number</span>
                        <h6>+000 946 (862) 091</h6>
                    </div>
                </div>
                <div className="box">
                    <HiOutlineBuildingOffice2 />
                    <div className="text">
                        <span>Visit Our Office</span>
                        <h6>suntower 456</h6>
                    </div>
                </div>
            </div>

            <div className="contact_us">
                <h1>Don’t Hesitate To Contact Us</h1>

                <div className="contact">
                    <div class="contact-container">
                        <div class="form-section">
                            <div class="input-group">
                                <div class="input-field">
                                    <label for="name">Name</label>
                                    <input type="text" id="name" placeholder=" "></input>
                                </div>
                                <div class="input-field">
                                    <label for="email">Email</label>
                                    <input type="email" id="email" placeholder=" "></input>
                                </div>
                            </div>
                            <div class="input-group">
                                <div class="input-field">
                                    <label for="phone">Phone</label>
                                    <input type="tel" id="phone" placeholder=" "></input>
                                </div>
                                <div class="input-field">
                                    <label for="subject">Subject</label>
                                    <input type="text" id="subject" placeholder=" "></input>
                                </div>
                            </div>
                            <div class="message-field">
                                <label for="message">Your Message :</label>
                                <textarea id="message" rows="8" placeholder=" "></textarea>
                            </div>
                            <button type="submit" class="submit-button">Submit</button>
                        </div>
                        <div class="map-section">
                            <img src="https://via.placeholder.com/400x500/E0E0E0/808080?text=Map+Placeholder" alt="Map" class="map-placeholder"></img>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Getintouch;