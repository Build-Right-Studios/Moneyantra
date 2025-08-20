import React, { useState, useEffect } from "react";
import { RiMenu3Fill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../utils/axiosInstance";

function NavbarLogin() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTaxOpen, setIsTaxOpen] = useState(false);
    const [isCasOpen, setIsCasOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('no-scroll');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('no-scroll');
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        try {
            await axiosInstance.post('/logout');
            console.log("Backend confirmed logout and CAS file deletion.");
        } catch (error) {
            console.error("Error during logout or file deletion on server:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("casData");
            navigate('/');
            window.scrollTo(0, 0);
        }
    };

    const handleDashboardClick = () => {
        navigate("/dashboard");
        window.scrollTo(0, 0);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <>
            <nav className="bg-gray-100 h-20 sticky top-0 w-full z-50 flex justify-between items-center px-5 shadow-lg md:px-10">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleDashboardClick}
                >
                    <img
                        className="h-10 w-10 mr-2 rounded-full"
                        src='/media/images/moneyantra.png'
                        alt="Moneyantra Logo"
                    />
                    <h5 className="flex items-center text-4xl font-bold">
                        <span className="text-[#33658a]">MONEY</span>
                        <span className="text-[#f26419]">ANTRA</span>
                    </h5>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-4">
                    <a href="/dashboard" className="font-bold m-2 mx-3 text-base p-2 bg-[#33658a] text-white no-underline hover:underline">Dashboard</a>

                    <div className="relative" onMouseEnter={() => setIsTaxOpen(true)} onMouseLeave={() => setIsTaxOpen(false)}>
                        <button className="font-bold m-2  text-base px-8 py-2 bg-[#33658a] text-white no-underline">
                            Tax
                        </button>
                        {isTaxOpen && (
                            <div className="absolute top-full left-0 bg-white border rounded-md shadow-lg z-10 w-48">
                                <a href="/calculate-tax" className="block p-2 text-sm text-[#33658a] hover:bg-gray-100 no-underline">
                                    Calculate Tax
                                </a>
                                <a href="/simulate-tax" className="block p-2 text-sm text-[#33658a] hover:bg-gray-100 no-underline">
                                    Simulate Tax
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="relative" onMouseEnter={() => setIsCasOpen(true)} onMouseLeave={() => setIsCasOpen(false)}>
                        <button className="font-bold mt-2 mb-2  text-base px-3 py-2 bg-[#33658a] text-white no-underline">
                            Parse CAS
                        </button>
                        {isCasOpen && (
                            <div className="absolute top-full left-0  bg-white border rounded-md shadow-lg z-10 w-48">
                                <a href="/parse-cas" className="block p-2 text-sm text-[#33658a] hover:bg-gray-100 no-underline">
                                    Parse CAS
                                </a>
                                <a href="/display-cas" className="block p-2 text-sm text-[#33658a] hover:bg-gray-100 no-underline">
                                    Display CAS
                                </a>
                            </div>
                        )}
                    </div>

                    <a
                        href="#"
                        onClick={handleLogout}
                        className="font-bold m-2 text-base p-2 bg-[#33658a] text-white no-underline hover:underline"
                    >
                        Logout
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={toggleMobileMenu} className="text-black focus:outline-none">
                        {isMobileMenuOpen ? <IoMdClose className='text-4xl text-black' /> : <RiMenu3Fill className='text-3xl' />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                className={`
                    fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-95 z-40 md:hidden 
                    flex flex-col items-center justify-center space-y-8
                    transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    transition-transform duration-300 ease-in-out
                `}
                style={{ pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }}
            >
                <a href="/dashboard" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={toggleMobileMenu}>Dashboard</a>
                <a href="/calculate-tax" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={toggleMobileMenu}>Calculate Tax</a>
                <a href="/simulate-tax" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={toggleMobileMenu}>Simulate Tax</a>
                <a href="/parse-cas" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={toggleMobileMenu}>Parse CAS</a>
                <a href="/display-cas" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={toggleMobileMenu}>Display CAS</a>
            </div>
        </>
    );
}

export default NavbarLogin;