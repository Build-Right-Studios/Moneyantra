import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdAbc } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { TbLockPassword } from "react-icons/tb";
import { RxCross2 } from "react-icons/rx";
import ReCAPTCHA from "react-google-recaptcha";
import '../../App.css';
import axiosInstance from '../../utils/axiosInstance';

function Login() {
  const [loginPage, setLoginPage] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email is required.");
    if (!password) return setError("Password is required.");
    if (!loginPage && !name) return setError("Name is required.");

    setLoading(true);
    recaptchaRef.current.execute();
  };

  const onReCAPTCHAChange = async (token) => {
    if (!token) {
      setError("reCAPTCHA verification failed. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = loginPage ? '/login' : '/signup';
      const payload = loginPage
        ? { email, password, recaptchaToken: token }
        : { name, email, password, recaptchaToken: token };

      const response = await axiosInstance.post(endpoint, payload);

      if (response.data?.authToken) {
        localStorage.setItem("token", response.data.authToken);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Please try again later.");
    } finally {
      recaptchaRef.current.reset();
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen font-serif bg-gray-100 p-4 sm:p-0 relative'>

      {/* Cross Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 right-10 text-gray-600 hover:text-[#33658a] transition-colors"
      >
        <RxCross2 size={40} />
      </button>

      <div className='flex flex-col sm:flex-row bg-white shadow-lg w-full sm:w-3/4 h-auto sm:h-[575px] border rounded-2xl border-transparent overflow-hidden'>

        {/* Left Panel */}
        <div className='flex items-center justify-center w-full sm:w-2/5 text-white bg-[#33658a] rounded-t-2xl sm:rounded-tl-2xl sm:rounded-bl-2xl flex-col gap-4 sm:gap-10 p-8'>
          <h1 className='mb-2 text-3xl sm:text-5xl text-center'>
            {loginPage ? "Hello, User!" : "Welcome Back!"}
          </h1>
          <p className='para mb-4 text-base sm:text-2xl text-center px-4'>
            {loginPage
              ? "Enter your details and get started with us."
              : "Let’s pick up where you left off!"}
          </p>
          <button
            onClick={() => {
              setError("");
              setLoginPage(!loginPage);
            }}
            className='border-2 rounded text-white border-white hover:text-[#33658a] px-6 py-2 text-lg'
          >
            {loginPage ? "Sign Up" : "Sign In"}
          </button>
        </div>

        {/* Right Panel */}
        <div className='flex items-center justify-center flex-col gap-2 w-full sm:w-3/5 text-[#33658a] p-4'>
          <h1 className='text-3xl sm:text-5xl mb-2 text-center'>
            {loginPage ? (
              <p className='text-3xl'>
                Sign In to
                <span className="text-[#33658A]"> MONEY</span>
                <span className="text-[#F26419]">ANTRA</span>
              </p>
            ) : (
              <p className="text-3xl">Create Account</p>
            )}
          </h1>

          <form className='mt-2 w-full max-w-sm' onSubmit={handleLogin}>
            {!loginPage && (
              <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
                <MdAbc className='text-2xl text-black' />
                <input
                  type="text"
                  placeholder='Enter your name'
                  className='pl-2 w-full outline-none text-black'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className='flex items-center mb-2 border-2 border-black rounded-sm p-1'>
              <IoMailOutline className='text-2xl text-black' />
              <input
                type="email"
                placeholder='Enter your email'
                className='pl-2 w-full outline-none text-black'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className='flex items-center border-2 border-black rounded-sm p-1 mb-4'>
              <TbLockPassword className='text-2xl text-black' />
              <input
                type="password"
                placeholder='Enter your password'
                className='pl-2 w-full outline-none text-black'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className='text-red-600 text-center mb-4'>{error}</p>}
            {loginPage && (
              <Link to='/forgot-password'>
                <p className='text-center mb-4'>Forgot your password?</p>
              </Link>
            )}

            <div className='flex justify-center'>
              <button
                type='submit'
                className='primary-btn text-white bg-[#33658a] rounded px-4 py-2'
                disabled={loading}
              >
                {loading ? "Processing..." : loginPage ? "SIGN IN" : "SIGN UP"}
              </button>
            </div>

            {/* Invisible reCAPTCHA */}
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

export default Login;
