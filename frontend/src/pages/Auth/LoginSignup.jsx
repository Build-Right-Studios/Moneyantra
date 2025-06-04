import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { name, email, password, mode: isSignUp ? "signup" : "signin" };
    console.log("Form Submitted:", formData);
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 bg-teal-500 text-white flex flex-col items-center justify-center p-10 relative z-10">
        <h2 className="text-3xl font-bold mb-4">
          {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
        </h2>
        <p className="mb-6 text-center px-4">
          {isSignUp
            ? "To keep connected with us please login with your personal info"
            : "Enter your personal details and start your journey with us"}
        </p>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-teal-500 transition"
        >
          {isSignUp ? "SIGN IN" : "SIGN UP"}
        </button>
      </div>

      {/* Right Panel with Slide Animation */}
      <div className="w-1/2 bg-white relative overflow-hidden flex items-center justify-center p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute w-full max-w-xs"
          >
            <h2 className="text-3xl font-bold text-teal-500 mb-6">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            <div className="flex gap-4 mb-4">
              <button className="border rounded-full p-2">🌐</button>
              <button className="border rounded-full p-2">📧</button>
              <button className="border rounded-full p-2">💼</button>
            </div>

            <p className="text-gray-500 mb-4 text-sm">
              or use your email for registration:
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {isSignUp && (
                <input
                  type="text"
                  placeholder="Name"
                  className="border p-2 rounded"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2 rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="submit"
                className="bg-teal-500 text-white rounded-full py-2 hover:bg-teal-600 transition"
              >
                {isSignUp ? "SIGN UP" : "SIGN IN"}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
