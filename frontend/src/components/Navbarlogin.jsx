import React, { useState, useEffect } from "react";
import { RiMenu3Fill } from 'react-icons/ri';
import { IoMdClose } from 'react-icons/io';

function NavbarLogin() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
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
    }, [isOpen]);

    return (
        <>
            <nav className="bg-gray-100 h-20 sticky top-0 w-full z-50 flex justify-between items-center px-5 shadow-lg md:px-10">
                <div className="flex items-center gap-2 font-2xl">
                    <img className="h-10 w-10 mr-2 rounded-4xl" src='media/images/moneyantra.ico' alt="image"></img>
                    <h5 className="flex text-4xl font-bold">
                        <span className="text-[#33658a]">MONEY</span>
                        <span className="text-[#f26419]">ANTRA</span>
                    </h5>
                </div>

                <div className="hidden md:flex space-x-4">
                    <a href="/dashboard" className="font-bold m-2 h-auto w-auto rounded-full text-base p-2 bg-[#33658a] text-white no-underline hover:underline">Dashboard</a>
                    <a href="#" className="font-bold m-2 h-auto w-auto rounded-full text-base p-2 bg-[#33658a] text-white no-underline hover:underline">Calculate Tax</a>
                    <a href="/parse-cas" className="font-bold m-2 h-auto w-auto rounded-full text-base p-2 bg-[#33658a] text-white no-underline hover:underline">Parse CAS</a>
                    <a href="#" className="font-bold h-auto m-2 w-auto rounded-full text-base p-2 bg-[#33658a] text-white no-underline hover:underline">Logout</a>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-black focus:outline-none">
                        {isOpen ? <IoMdClose className='text-4xl text-white' /> : <RiMenu3Fill className='text-3xl' />}
                    </button>
                </div>
            </nav>

            <div
                className={`
              fixed top-0 left-0 w-[420px] h-[300px] bg-gray-900 bg-opacity-95 z-40 md:hidden
              flex flex-col items-center justify-center space-y-8
              transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}
              transition-transform duration-300 ease-in-out
            `}
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
            >
                <a href="#" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={() => setIsOpen(false)}>Dashboard</a>
                <a href="#" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={() => setIsOpen(false)}>Calculate Tax</a>
                <a href="/parse-cas" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={() => setIsOpen(false)}>Parse CAS</a>
                <a href="#" className="text-white text-2xl hover:text-blue-400 transition duration-300" onClick={() => setIsOpen(false)}>Logout</a>
            </div>
        </>
    );

}

export default NavbarLogin;