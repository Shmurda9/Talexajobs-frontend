import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // NEW STATE FOR RESEND
  
  const navigate = useNavigate();
  const location = useLocation();

  let userEmail = "";
  if (location.state && location.state.email) {
    userEmail = location.state.email;
  }

  const handleCodeChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, '');
    setCode(numbersOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      alert("Session expired. Please log in to request a new code.");
      navigate('/login');
      return;
    }
    
    if (code.length !== 6) {
      alert("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/verify-email', {
        email: userEmail,
        code: code
      });
      alert("Email verified successfully! You can now log in.");
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid or expired code.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🚨 THE NEW RESEND FUNCTION
  const handleResend = async () => {
    if (!userEmail) {
      alert("Session expired. Please log in again.");
      navigate('/login');
      return;
    }
    setResendLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email: userEmail });
      alert("A fresh 6-digit code has been sent to your email!");
    } catch (error) {
      alert("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Verify your email</h2>
        <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to your email.</p>
        {userEmail && <p className="mt-1 font-bold text-blue-600">{userEmail}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 text-center mb-2">
                6-Digit Security Code
              </label>
              <input 
                type="text" 
                maxLength="6" 
                required 
                value={code} 
                onChange={handleCodeChange} 
                autoComplete="one-time-code"
                className="appearance-none block w-full px-3 py-4 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-4xl font-extrabold tracking-widest transition" 
                placeholder="••••••" 
              />
            </div>
            <div>
              <button 
                type="submit" 
                disabled={loading || code.length !== 6} 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Account"}
              </button>
            </div>
          </form>

          {/* 🚨 THE NEW RESEND BUTTON */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Didn't receive a code?{' '}
              <button 
                onClick={handleResend} 
                disabled={resendLoading}
                className="font-bold text-blue-600 hover:text-blue-500 disabled:opacity-50 transition"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;