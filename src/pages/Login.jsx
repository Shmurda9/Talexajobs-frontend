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
      const response = await axios.post("https://talexajobs.onrender.com/api/auth/login", formData);
      
      toast.dismiss(loadingToast);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Welcome back, " + user.fullName.split(" ")[0] + "!");

        if (user.role === "admin") {
          navigate("/admin");
          return;
        }
        
        let isProfileComplete = false;
        if (user.role === "jobSeeker" && user.candidateInfo && user.candidateInfo.headline) {
          isProfileComplete = true; 
        } else if (user.role === "employer" && user.employerInfo && user.employerInfo.companyDescription) {
          isProfileComplete = true; 
        }

        // Instantly route based on profile status
        if (isProfileComplete) {
          if (user.role === "employer") {
            navigate("/employer-dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          // If setup is missing, route them to their specific setup flows
          if (user.role === "employer") {
             navigate("/employer-setup");
          } else {
             navigate("/profile-setup");
          }
        }
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
    <div className="min-h-screen flex font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* LEFT SIDE: The Clean Form Area */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-[45%] xl:w-[40%] bg-white lg:px-20 xl:px-24 shadow-2xl z-10 relative">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Brand Logo - Updated to match Navbar */}
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
              Welcome back
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm" 
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="appearance-none block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
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
                  <Link to="/forgot-password" className="font-bold text-blue-600 hover:text-blue-800 transition">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-black text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign In 
                </button>
              </div>
              
            </form>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <p className="text-center text-sm font-medium text-slate-500">
                Don't have an account?{' '}

                <Link to="/register" className="font-bold text-slate-900 hover:text-blue-600 transition ml-1">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Premium Image Area (Hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 bg-slate-900">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
          alt="Modern Architecture"
        />
        {/* Subtle gradient overlay to make it look expensive */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/60 via-slate-900/20 to-transparent mix-blend-multiply"></div>
        
        {/* Optional Premium Text overlay on the image */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h3 className="text-3xl font-black mb-3">Your Next Great Hire is Waiting.</h3>
          <p className="text-lg font-medium text-blue-100 max-w-xl">Join the world's most exclusive network of top-tier talent and industry-leading employers.</p>
        </div>
      </div>

    </div>
  );
}

export default Login;