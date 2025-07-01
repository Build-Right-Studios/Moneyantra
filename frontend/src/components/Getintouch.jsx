import React from "react";
import {
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAccessTime,
} from "react-icons/md";

function GetInTouch() {
    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 mb-5">
            <h1 className="text-3xl p-4 font-semibold text-center mb-8 text-gray-800">
                Get Expert Tax Guidance
            </h1>
            <div className="text-sm p-4 text-center justify-between">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat fuga adipisci distinctio sed voluptatibus, ullam fugiat nihil tenetur reiciendis ducimus itaque atque odio laudantium, explicabo consequatur vero odit iste. Atque? ipsum dolor sit amet consectetur adipisicing elit. Suscipit quaerat, itaque vitae voluptatum ex repellat cumque molestiae quo ratione dolorem.</p>
            </div>


            <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2">
                <div className="bg-white p-4 rounded-xl shadow-md flex-1">
                    <p className="text-lg font-medium text-gray-700 mb-4">
                        Schedule a Consultation
                    </p>
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="name" className="block text-sm font-medium mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Your Name"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="email" className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="123-456-7890"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    placeholder="Reason for consultation"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-1">
                                Your Message
                            </label>
                            <textarea
                                id="message"
                                rows="6"
                                placeholder="How can we help you?"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#33658A] text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Submit
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-md flex-1">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                        Contact Information
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Our tax experts are available to help you navigate complex investment tax scenarios.
                        Get personalized guidance from certified professionals.
                    </p> <br />

                    <div className="flex items-start mb-4">
                        <div className="text-white bg-blue-500 p-3 rounded-lg mr-4">
                            <MdEmail size={16} />
                        </div>
                        <div className="px-3">
                            <h4 className="text-lg font-medium text-gray-800">Email Support</h4>
                            <p className="text-gray-600">support@moneyantra.com</p>
                        </div>
                    </div>

                    <div className="flex items-start mb-4">
                        <div className="text-white bg-orange-500 p-3 rounded-lg mr-4">
                            <MdPhone size={16} />
                        </div>
                        <div className="px-3">
                            <h4 className="text-lg font-medium text-gray-800">Phone Support</h4>
                            <p className="text-gray-600">+91 965 472 9997
                                <br />
                                Monday - Friday, 9AM - 7PM IST
                            </p>
                            
                        </div>
                    </div>

                    <div className="flex items-start ">
                        <div className="text-white bg-sky-500 p-3 rounded-lg mr-4">
                            <MdAccessTime size={16} />
                        </div>
                        <div className="px-3">
                            <h4 className="text-lg font-medium text-gray-800">
                                Expert Consultation
                            </h4>
                            <p className="text-gray-600">Monday - Friday: 9:00 AM - 7:00 PM</p>
                        </div>
                    </div>                  
                </div>
            </div>
        </div>
    );
}

export default GetInTouch;
