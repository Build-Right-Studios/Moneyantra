import React, { useState } from 'react';

function App() {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="flex h-screen font-sans">
      {/* Left Panel */}
      <div className="w-1/2 bg-teal-500 text-white flex flex-col items-center justify-center p-10">
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

      {/* Right Panel */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className="text-3xl font-bold text-teal-500 mb-6">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {/* Social Icons */}
        <div className="flex gap-4 mb-4">
          <button className="border rounded-full p-2">🌐</button>
          <button className="border rounded-full p-2">📧</button>
          <button className="border rounded-full p-2">💼</button>
        </div>

        <p className="text-gray-500 mb-4">
          or use your email for registration:
        </p>

        {/* Form */}
        <form className="flex flex-col gap-4 w-full max-w-xs">
          {isSignUp && (
            <input
              type="text"
              placeholder="Name"
              className="border p-2 rounded"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white rounded-full py-2 hover:bg-teal-600 transition"
          >
            {isSignUp ? "SIGN UP" : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
