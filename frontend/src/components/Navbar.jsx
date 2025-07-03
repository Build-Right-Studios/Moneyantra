    import React from "react";

function Navbar() {
    return (
        <div className="bg-[#f7f6f2] h-20 fixed top-0 w-full z-50 flex justify-between items-center px-5 shadow-lg">
            <div className="flex items-center">
                <img className="h-10 lg:h-12 w-10 lg:w-12 rounded-full mr-4" src='.\media\images\moneyantra.ico' alt="Moneyantra Logo" /> {/* Placeholder image */}
                <h5 className="hidden sm:block"> {/* Hidden on small screens, shown on sm and up */}
                    <span className="text-[#33658A] text-2xl font-bold">MONEY</span>
                        <span className="text-[#F26419] text-2xl font-bold">ANTRA</span>
                </h5>
            </div>

            <div className="font-bold mr-4 h-auto text-white w-auto rounded-full text-base px-8 py-2 bg-[#33658a] hover:underline cursor-pointer transition duration-300">
                <a href="/login">
                    <span>LOGIN</span>
                </a>
            </div>
        </div>
    );
}

export default Navbar;