import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { MdAbc } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import '../../App.css'
import axiosInstance from '../../utils/axiosInstance';

function Login() {

    const [loginPage, setLoginPage] = useState(true)
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if(!loginPage) {
            if(!name) {
                setError("Name is required.");
                return;
            }
        }

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            setError("Email is required.");
            return;
        } 
        // else if (!emailRegex.test(email)) {
        //     setError("Please enter a valid email address.");
        //     return;
        // }

        if (!password) {
            setError("Password is required.");
            return;
        }

        if(loginPage){
            try {
                const response = await axiosInstance.post('/login', {
                    email: email,
                    password: password
                })

                if(response.data && response.data.authToken){
                    localStorage.setItem("token", response.data.authToken)
                    navigate('/dashboard')
                }         
            } catch (error) {
                if(error.response && error.response.data && error.response.data.message)
                    setError(error.response.data.message)
                else
                    setError("Please try after some time.")
            }                
        }
        else {
            try {
                const response = await axiosInstance.post('/signup', {
                    name : name, 
                    email: email, 
                    password: password
                })
                if(response.data && response.data.authToken){
                    localStorage.setItem("token", response.data.authToken)
                    navigate('/dashboard')
                }
            } catch (error) {
                if(error.response && error.response.data && error.response.data.message)
                    setError(error.response.data.message)
                else
                    setError("Please try after some time.")
            }
        }
}

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <div className='flex flex-row bg-white shadow-md w-3/4 h-[575px] border rounded-2xl border-transparent'>
            {/* Left Panel */}
            <div className='flex items-center justify-center w-2/5 h-[100%] quicksand text-white bg-[#33658a] rounded-tl-2xl rounded-bl-2xl flex-col gap-10'>
                <h1 className='mb-4 text-5xl'>{loginPage ? "Hello, User!":"Welcome Back!"}</h1>
                <p className='para mb-11 text-2xl'>{loginPage ? "Enter your details and get started with us.":"Let’s pick up where you left off!"}</p>
                <button onClick={()=> {setLoginPage(!loginPage)}} className='border-2 rounded-3xl border-white btn hover:bg-white hover:text-[#33658a]'>{loginPage ? "Sign Up":"Sign In"}</button>
            </div>
            {/* Right Panel */}
            <div className='flex items-center justify-center flex-col gap-2 w-3/5 h-[100%] quicksand text-[#33658a]'>
                <h1 className='text-5xl mb-4'>{loginPage ? "Sign In to Moneyantra":"Create Account"}</h1>
                <form className='mt-4'>
                    {!loginPage && (
                        <div className='flex flex-row items-center justify-center mb-2 border-2 border-black rounded-sm  p-1'>
                            <MdAbc className='text-3xl text-black'/>
                            <input 
                                type="text" 
                                placeholder='Enter your name'
                                className='pl-2 w-[360px] outline-none text-black'
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </div>
                    )}
                    <div className='flex flex-row items-center justify-center mb-2 border-2 border-black rounded-sm  p-1'>
                        <IoMailOutline className='text-3xl text-black'/>
                        <input 
                            type="email" 
                            placeholder='Enter your email'
                            className='pl-2 w-[360px] outline-none text-black'
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    <div className='flex flex-row items-center justify-center border-2 border-black rounded-sm p-1 mb-4'>
                        <TbLockPassword className='text-3xl text-black'/>
                        <input 
                            type="password" 
                            placeholder='Enter your password'
                            className='pl-2 w-[360px] outline-none text-black' 
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>

                    {loginPage && <p className='text-center mt-4 mb-4'>Forgot your password ?</p>}

                    <div className='flex justify-center'>
                        <button type='submit' className='primary-btn' onClick={handleLogin}>{loginPage ? "SIGN IN":"SIGN UP"}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login