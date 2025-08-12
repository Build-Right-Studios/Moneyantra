import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoMailOutline } from "react-icons/io5";
import axiosInstance from '../utils/axiosInstance';
import ReCAPTCHA from "react-google-recaptcha";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const recaptchaRef = useRef(null); // ✅ Ref for reCAPTCHA

    // Triggered when form is submitted
    const handleforgotpassword = (e) => {
        e.preventDefault();

        setError("");

        if (!email) {
            setError("Please Enter your email.");
            return;
        }

        setLoading(true);
        recaptchaRef.current.execute(); // ✅ Execute invisible reCAPTCHA
    };

    // Triggered after reCAPTCHA passes
    const onReCAPTCHAChange = async (token) => {
        if (!token) {
            setError("reCAPTCHA verification failed. Please try again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/forgot-password', {
                email: email,
                recaptchaToken: token
            });

            if (response.data && response.data.success) {
                localStorage.setItem("token", response.data.authToken);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            setError("Something went wrong. Please try again later.");
        } finally {
            recaptchaRef.current.reset(); // ✅ Reset for next attempt
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4'>
            <div className='flex flex-col bg-white shadow-md w-auto sm:w-3/5 h-[450px] border rounded-2xl border-transparent'>
                {/* Top Panel */}
                <div className='flex items-center justify-center w-auto h-1/2 p-4 quicksand text-white bg-[#33658a] rounded-tl-2xl rounded-tr-2xl flex-col'>
                    <h1 className='tex-2xl sm:text-4xl text-center'>Forgot your Password</h1>
                    <p className='text-sm sm:text-xl text-center mt-3'>
                        We will send you an email with instructions on how to reset your password.
                    </p>
                </div>
                {/* Bottom Panel */}
                <div className='flex flex-col items-center justify-center w-auto h-1/2 quicksand text-[#33658a]'>
                    <form onSubmit={handleforgotpassword}>
                        <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
                            <IoMailOutline className='text-3xl text-black' />
                            <input
                                type="email"
                                placeholder='Enter your email'
                                className='pl-2 w-[auto] sm:w-[380px] outline-none text-black'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        {error && <p className='text-red-600 text-center'>{error}</p>}
                        <div className='text-center'>
                            <Link to='/login'>Already have an account? Login.</Link>
                        </div>
                        <div className='flex justify-center'>
                            <button
                                type='submit'
                                className='primary-btn sm:w-auto mt-2 text-white bg-[#33658a] rounded px-4 py-2 sm:text-base'
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "SUBMIT"}
                            </button>
                        </div>

                        {/* ✅ Invisible reCAPTCHA */}
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey="6LeLKp8rAAAAADJpPrh4iqDLf97zRmapZcRl6i6z" 
                            size="invisible"
                            onChange={onReCAPTCHAChange}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
