import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAbc } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import '../../App.css';
import axiosInstance from '../../utils/axiosInstance';

function Login() {
  const [loginPage, setLoginPage] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (!loginPage && !name) {
      setError("Name is required.");
      return;
    }

    try {
      const endpoint = loginPage ? '/login' : '/signup';
      const payload = loginPage
        ? { email, password }
        : { name, email, password };

      const response = await axiosInstance.post(endpoint, payload);

      if (response.data && response.data.authToken) {
        localStorage.setItem("token", response.data.authToken);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Please try again later.");
      }
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-0'> {}
      <div className='flex flex-col sm:flex-row bg-white shadow-lg w-full sm:w-3/4 h-auto sm:h-[575px] border rounded-2xl border-transparent overflow-hidden'> {}

        {/* Left Panel */}
        <div className='flex items-center justify-center w-full sm:w-2/5 h-67 lg:h-120 md:h-120 xl:h-120 sm:h-120 quicksand text-white bg-[#33658a] rounded-t-2xl rounded-b-none sm:rounded-tl-2xl sm:rounded-bl-2xl sm:rounded-tr-none flex-col gap-4 sm:gap-10 p-4'> {/* Adjusted height, border radius, padding, and gap */}
          <h1 className='mb-2 text-3xl sm:text-5xl text-center'>{loginPage ? "Hello, User!" : "Welcome Back!"}</h1> {}
          <p className='para mb-4 text-base sm:text-2xl text-center px-4'>
            {loginPage ? "Enter your details and get started with us." : "Let’s pick up where you left off!"}
          </p>
          <button
            onClick={() => {
              setError("");
              setLoginPage(!loginPage);
            }}
            className='border-2 rounded-3xl border-white btn hover:bg-white hover:text-[#33658a] px-6 py-2 text-lg sm:text-base'
          >
            {loginPage ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Right Panel */}
        <div className='flex items-center justify-center flex-col gap-2 w-full sm:w-3/5 h-auto sm:h-full quicksand text-[#33658a] p-4 sm:p-0'> {}
          <h1 className='text-3xl sm:text-5xl mb-4 text-center'>{loginPage ? "Sign In to Moneyantra" : "Create Account"}</h1> {}

          <form className='mt-4 w-full max-w-sm px-4 sm:px-0' onSubmit={handleLogin}> {}
            {!loginPage && (
              <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
                <MdAbc className='text-2xl sm:text-3xl text-black' /> {}
                <input
                  type="text"
                  placeholder='Enter your name'
                  className='pl-2 w-full outline-none text-black text-base sm:text-base' 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
              <IoMailOutline className='text-2xl sm:text-3xl text-black' /> {}
              <input
                type="email"
                placeholder='Enter your email'
                className='pl-2 w-full outline-none text-black text-base sm:text-base' 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='flex items-center border-2 border-black rounded-sm p-1 mb-4'>
              <TbLockPassword className='text-2xl sm:text-3xl text-black' /> {}
              <input
                type="password"
                placeholder='Enter your password'
                className='pl-2 w-full outline-none text-black text-base sm:text-base' 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className='text-red-600 text-center mb-4 text-sm sm:text-base'>{error}</p>} {}

            {loginPage && <p className='text-center mt-2 mb-4 text-sm sm:text-base'>Forgot your password?</p>} {}

            <div className='flex justify-center'>
              <button type='submit' className='primary-btn w-full sm:w-auto px-8 py-3 text-lg sm:text-base'> {}
                {loginPage ? "SIGN IN" : "SIGN UP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
