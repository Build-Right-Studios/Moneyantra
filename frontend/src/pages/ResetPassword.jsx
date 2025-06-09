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
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='flex flex-col bg-white shadow-md w-2/5 h-[450px] rounded-2xl border border-transparent'>
        {/* Top Panel */}
        <div className='flex flex-col items-center justify-center quicksand text-white w-full h-1/2 bg-[#33658a] rounded-tl-2xl rounded-tr-2xl'>
            <h1 className='tex-5xl'>Reset your Password</h1>
        </div>
        {/* Down Panel */}
        <div className='flex flex-col items-center justify-center quicksand text-[#33658a] w-full h-1/2'>
            <form onSubmit={handleforgotpassword}>
                <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
                    <TbLockPassword className='text-3xl text-black' />
                    <input
                        type="password"
                        placeholder='Enter new password.'
                        className='pl-2 w-[360px] outline-none text-black'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                {error && <p className='text-red-600 text-center'>{error}</p>}
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

export default ResetPassword