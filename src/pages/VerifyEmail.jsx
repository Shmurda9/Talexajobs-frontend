import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function VerifyEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); 
  
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
      toast.error("Session expired. Please log in to request a new code.");
      navigate('/login');
      return;
    }
    
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying your email...");

    try {
      await axios.post('https://talexajobs.onrender.com/api/auth/verify-email', {
        email: userEmail,
        code: code
      });
      toast.dismiss(loadingToast);
      toast.success("Email verified successfully! You can now log in.");
      navigate('/login');
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMsg = error.response?.data?.message || "Invalid or expired code.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("Session expired. Please log in again.");
      navigate('/login');
      return;
    }
    
    setResendLoading(true);
    const resendToast = toast.loading("Sending new code...");
    
    try {
      await axios.post('https://talexajobs.onrender.com/api/auth/resend-verification', { email: userEmail });
      toast.dismiss(resendToast);
      toast.success("A fresh 6-digit code has been sent to your email!");
    } catch (error) {
      toast.dismiss(resendToast);
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* LEFT SIDE: The Clean Form Area */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] bg-white lg:px-12 xl:px-20 shadow-2xl z-10 relative overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group mb-12">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className="font-bold text-[24px] tracking-tight text-slate-900 lowercase pt-0.5">
              talexajobs
            </span>
          </Link>

          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Verify your email
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Enter the 6-digit code sent to your email.
            </p>
            {userEmail && <p className="mt-1 text-sm font-bold text-blue-600">{userEmail}</p>}
          </div>

          <div className="mt-8">
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
                  autoComplete="one-time-code"className="appearance-none block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-center text-4xl font-extrabold tracking-widest transition-all shadow-sm text-slate-900" 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading || code.length !== 6} 
                  className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-black text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>
              </div>
              
            </form>

            <div className="mt-8 border-t border-slate-100 pt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Didn't receive a code?{' '}
                <button 
                  onClick={handleResend} 
                  disabled={resendLoading}
                  className="font-bold text-slate-900 hover:text-blue-600 transition ml-1 disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Premium Image Area (Hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Team Working"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-slate-900/20 to-transparent mix-blend-multiply"></div>
        
        {/* Premium Text overlay */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h3 className="text-3xl font-black mb-3">Activate Your Access.</h3>
          <p className="text-lg font-medium text-slate-300 max-w-xl">Verify your identity to step inside the global network and unlock exclusive opportunities.</p>
        </div>
      </div>

    </div>
  );
}

export default VerifyEmail;