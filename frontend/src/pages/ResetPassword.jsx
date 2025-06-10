import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TbLockPassword } from "react-icons/tb";
import axiosInstance from '../utils/axiosInstance';

function ResetPassword() {

    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");

    const {name, token} = useParams();

    const navigate = useNavigate();

const handleforgotpassword = async (e) => {
        e.preventDefault();
        if(!newPassword) {
            setError("Please Enter your email.");
            return;
        }
        try {
            const response = await axiosInstance.post(`/reset-password/${name}/${token}`, {
                newPassword: newPassword
            })
            if (response.data && response.data.success) {
                navigate('/login')
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6'>
            <div className='flex flex-col bg-white shadow-md w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl h-full rounded-2xl border border-transparent'>
                {/* Top Panel */}
                <div className='flex flex-col items-center justify-center quicksand text-white w-full bg-[#33658a] rounded-tl-2xl rounded-tr-2xl p-4 text-center'>
                    <h1 className='text-xl sm:text-2xl md:text-3xl'>Reset your Password</h1>
                </div>
                {/* Down Panel */}
                <div className='flex flex-col items-center justify-center quicksand text-[#33658a] w-full h-1/2 p-4 sm:p-6'>
                    <form onSubmit={handleforgotpassword} className='w-full'>
                        <div className='flex items-center mb-4 border-2 border-black rounded-sm p-2 w-full'>
                            <TbLockPassword className='text-2xl sm:text-3xl text-black mr-2' />
                            <input
                                type="password"
                                placeholder='Enter new password.'
                                className='flex-grow pl-2 outline-none text-black text-base sm:text-lg'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className='text-red-600 text-center text-sm mb-4'>{error}</p>}
                        <div className='flex justify-center'>
                            <button type='submit' className='primary-btn bg-[#33658a] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity text-base sm:text-lg w-full'>
                                SUBMIT
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
  )
}

export default ResetPassword