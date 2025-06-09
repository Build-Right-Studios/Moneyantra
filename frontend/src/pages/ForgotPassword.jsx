import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { IoMailOutline } from "react-icons/io5";
import axiosInstance from '../utils/axiosInstance';

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleforgotpassword = async (e) => {
        e.preventDefault();
        if(!email) {
            setError("Please Enter your email.");
            return;
        }
        try {
            const response = await axiosInstance.post('/forgot-password', {
                email: email
            })
            if (response.data && response.data.success) {
                localStorage.setItem("token", response.data.authToken);
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='flex flex-col bg-white shadow-md w-2/5 h-[450px] border rounded-2xl border-transparent'>
            {/* Top Panel */}
            <div className='flex items-center justify-center w-full h-1/2 quicksand text-white bg-[#33658a] rounded-tl-2xl rounded-tr-2xl flex-col'>
                <h1 className='tex-5xl'>Forgot your Password</h1>
                <p className='text-xl text-center'>We will send you an email with instructions on how to reset your password.</p>
            </div>
            {/* Down Panel */}
            <div className='flex flex-col items-center justify-center w-full h-1/2 quicksand text-[#33658a]'>
                <form onSubmit={handleforgotpassword}>
                    <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
                        <IoMailOutline className='text-3xl text-black' />
                        <input
                            type="email"
                            placeholder='Enter your email'
                            className='pl-2 w-[360px] outline-none text-black'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    {error && <p className='text-red-600 text-center'>{error}</p>}
                    <div className='text-center'>
                        <Link to='/login'>Already have an account ? Login.</Link>
                    </div>
                    <div className='flex justify-center'>
                        <button type='submit' className='primary-btn'>
                            SUBMIT
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default ForgotPassword