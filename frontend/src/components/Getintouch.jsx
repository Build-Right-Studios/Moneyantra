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

            <div className="contact_us px-4 py-12 bg-white">
                <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10">
                    Don’t Hesitate To Contact Us
                </h1>

                <div className="contact flex flex-col md:flex-row gap-10 justify-center items-start max-w-6xl mx-auto">
                    {/* Form Section */}
                    <div className="form-section w-full md:w-1/2 space-y-6 bg-white p-6 rounded-xl shadow-md">
                        {/* Row 1 */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" id="name" placeholder=" " className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" id="email" placeholder=" " className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                                <input type="tel" id="phone" placeholder=" " className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                                <input type="text" id="subject" placeholder=" " className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                        </div>

                        {/* Message Field */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-1">Your Message:</label>
                            <textarea id="message" rows="8" placeholder=" " className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"></textarea>
                        </div>

                        <button type="submit" className="bg-[#33658A] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                            Submit
                        </button>
                    </div>

                    {/* Map Section */}
                    <div className="map-section w-full md:w-1/2 flex justify-center items-center">
                        <img src="/media/images/git.png" alt="map" className="w-full max-w-md rounded-xl " />
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Getintouch;