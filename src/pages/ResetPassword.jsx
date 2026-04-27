import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

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
      alert("Session expired. Please request a new code.");
      navigate('/forgot-password');
      return;
    }
    if (code.length !== 6) {
      alert("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://talexajobs.onrender.com/api/auth/reset-password', {
        email: userEmail,
        code: code,
        newPassword: newPassword
      });
      alert("Password reset successful! You can now log in.");
      navigate('/login');
    } catch (error) {
      let errorMsg = "Invalid or expired code.";
      if (error.response) {
        if (error.response.data) {
          if (error.response.data.message) {
            errorMsg = error.response.data.message;
          }
        }
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Create New Password</h2>
        <p className="mt-2 text-sm text-slate-600">Enter the 6-digit code sent to your email.</p>
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
                autoComplete="one-time-code" /* 🚨 THE BROWSER AUTOFILL BLOCKER */
                className="appearance-none block w-full px-3 py-4 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-4xl font-extrabold tracking-widest transition" 
                placeholder="••••••" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                New Password
              </label>
              <input 
                type="password" 
                required 
                minLength="8" 
                value={newPassword} 
                onChange={handlePasswordChange}
                autoComplete="new-password" /* 🚨 TELLS THE BROWSER THIS IS A NEW PASSWORD */
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 transition" 
                placeholder="Min. 8 characters" 
              />
            </div>
            <div>
              <button 
                type="submit" 
                disabled={isButtonDisabled} 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;