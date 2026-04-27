import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading("Verifying credentials...");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", formData);
      
      toast.dismiss(loadingToast);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Welcome back, " + user.fullName.split(" ")[0] + "!");

        if (user.role === "admin") {
          setTimeout(() => { window.location.href = "/admin"; }, 1000);
          return;
        }
        
        let isProfileComplete = false;
        if (user.role === "jobSeeker" && user.candidateInfo && user.candidateInfo.headline) {
          isProfileComplete = true; 
        } else if (user.role === "employer" && user.employerInfo && user.employerInfo.companyName) {
          isProfileComplete = true; 
        }

        setTimeout(() => {
          if (isProfileComplete) {
            if (user.role === "employer") {
              window.location.href = "/employer-dashboard";
            } else {
              window.location.href = "/dashboard";
            }
          } else {
            window.location.href = "/profile-setup";
          }
        }, 1000);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Login error:", error);
      
      if (error.response && error.response.data && error.response.data.requiresVerification) {
        toast.error("Please verify your email address before logging in.");
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }

      const errorMsg = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : "Login failed. Check your email and password.";
        
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-slate-50 overflow-hidden">
      
      {/* Premium Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center relative z-10">
        <Link to="/" className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
        </Link>
        
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500 max-w-xs">
          Enter your credentials to access your professional workspace.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Frosted Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-[2rem] sm:px-12 border border-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  name="remember-me" 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer transition" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-black text-blue-600 hover:text-blue-500 transition">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign In 
                </button>
            </div>
            
          </form>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <p className="text-center text-sm font-medium text-slate-500">
              Need to create an account?{' '}
              <Link to="/register" className="font-black text-blue-600 hover:text-blue-500 transition ml-1">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;