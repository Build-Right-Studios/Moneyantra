import React from "react";

function Navbar() {
    return (
        <div className="bg-[#f7f6f2] h-20 fixed top-0 w-full z-50 flex justify-between items-center px-5 shadow-lg">
            <div className="flex items-center">
                <img className="h-10 lg:h-12 w-10 lg:w-12 rounded-full mr-4" src='.\media\images\moneyantra.ico' alt="Moneyantra Logo" />
                <h5 className="hidden sm:block">
                    <span className="text-[#33658A] text-2xl font-bold">MONEY</span>
                    <span className="text-[#F26419] text-2xl font-bold">ANTRA</span>
                </h5>
            </div>

            <div className="group bg-[#33658A] p-2 px-4 rounded-4xl no-underline">
                <a href="/login"
                    className="bg-[#33658A] rounded-4xl text-white font-bold no-underline">
                    LOGIN
                </a>
            </div>
        </div>
    );
}

export default Navbar;