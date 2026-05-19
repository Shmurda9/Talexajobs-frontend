import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Upgraded alerts to toasts

function ResetPassword() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  let userEmail = "";
  if (location.state) {
    if (location.state.email) {
      userEmail = location.state.email;
    }
  }

  const handleCodeChange = (e) => {
    const numbersOnly = e.target.value.replace(/\D/g, '');
    setCode(numbersOnly);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  let isButtonDisabled = false;
  if (loading) isButtonDisabled = true;
  if (code.length !== 6) isButtonDisabled = true;
  if (!newPassword) isButtonDisabled = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Session expired. Please request a new code.");
      navigate('/forgot-password');
      return;
    }
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying code and resetting password...");
    
    try {
      await axios.post('https://talexajobs.onrender.com/api/auth/reset-password', {
        email: userEmail,
        code: code,
        newPassword: newPassword
      });
      
      toast.dismiss(loadingToast);
      toast.success("Password reset successful! You can now log in.");
      navigate('/login');
    } catch (error) {
      toast.dismiss(loadingToast);
      let errorMsg = "Invalid or expired code.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
              Create New Password
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Enter the 6-digit code sent to your email.
            </p>
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
                  autoComplete="one-time-code" 
                  className="appearance-none block w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-center text-4xl font-extrabold tracking-widest transition-all shadow-sm text-slate-900" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type="password" 
                    required 
                    minLength="8" 
                    value={newPassword} 
                    onChange={handlePasswordChange}
                    autoComplete="new-password" 
                    className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isButtonDisabled} 
                  className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-black text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
              
            </form>

            <div className="mt-8 border-t border-slate-100 pt-8 pb-8 text-center">
              <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition flex items-center justify-center gap-2">
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
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Modern Architecture"
        />
        {/* Subtle gradient overlay to make it look expensive */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-slate-900/20 to-transparent mix-blend-multiply"></div>
        
        {/* Premium Text overlay on the image */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h3 className="text-3xl font-black mb-3">Secure Your Future.</h3>
          <p className="text-lg font-medium text-slate-300 max-w-xl">Regain access to your workspace and connect with elite employers globally.</p>
        </div>
      </div>

    </div>
  );
}

export default ResetPassword;