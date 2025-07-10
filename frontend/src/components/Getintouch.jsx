import React, { useState } from "react"; 
import {
    MdEmail,
    MdPhone,
    MdLocationOn,
    MdAccessTime,
} from "react-icons/md";

function GetInTouch() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        portfolio: "Under ₹10 Lakhs", 
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        setResponseMessage("");
        setPreviewUrl("");

        try {
            const response = await fetch("http://localhost:8080/sendemail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setResponseMessage("Your consultation request has been sent successfully!");
                setPreviewUrl(data.previewUrl);
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    portfolio: "Under ₹10 Lakhs",
                    message: "",
                });
            } else {
                setResponseMessage(`Failed to send request: ${data.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setResponseMessage("There was an error sending your request. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 mb-5">
            <h1 className="text-3xl p-4 font-semibold text-center mb-8 text-gray-800">
                Get Expert Guidance
            </h1>
            <div className="text-sm p-2 text-center pb-4 justify-between">
                <p>
                    Need help with reviewing your portfolio? Our team of experts is here to
                    assist you with personalized guidance and support.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2">
                <div className="bg-white p-4 rounded-xl shadow-md flex-1">
                    <p className="text-lg font-medium text-gray-700 mb-4">
                        Schedule a Consultation
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    placeholder="John"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    placeholder="Doe"
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="john@example.com"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                placeholder="+91 98765 43210"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="portfolio" className="block text-sm font-medium mb-1">
                                Investment Portfolio Size
                            </label>
                            <select
                                id="portfolio"
                                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={formData.portfolio}
                                onChange={handleChange}
                            >
                                <option>Under ₹10 Lakhs</option>
                                <option>₹10 Lakhs - ₹50 Lakhs</option>
                                <option>₹50 Lakhs - ₹1 Crore</option>
                                <option>Over ₹1 Crore</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-1">
                                How can we help you?
                            </label>
                            <textarea
                                id="message"
                                rows="4"
                                placeholder="Describe your tax calculation needs or questions..."
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#D3752B] text-white font-medium py-3 rounded-lg hover:bg-[#c16521] transition duration-300"
                            disabled={loading}
                        >
                            {loading ? "Scheduling..." : "Schedule Free Consultation"}
                        </button>
                    </form>

                    {responseMessage && (
                        <div className={`mt-4 p-3 rounded-lg ${responseMessage.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            <p>{responseMessage}</p>
                            {previewUrl && (
                                <p>
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                        View Sent Email (Ethereal Preview)
                                    </a>
                                </p>
                            )}
                        </div>
                    )}
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
                            <p className="text-gray-600">Book appointment link from arthgyaan </p>
                            <p className="text-gray-600"> or similar for moneyantra</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default GetInTouch;