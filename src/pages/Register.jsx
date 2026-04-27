import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Register() {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'jobSeeker', 
    companyName: '',
    posterJobTitle: '',
    agreedToTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const loadingToast = toast.loading("Creating your account...");
    localStorage.removeItem('token');

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        companyName: formData.role === 'employer' ? formData.companyName : '',
        posterJobTitle: formData.role === 'employer' ? formData.posterJobTitle : ''
      };

      await axios.post('http://localhost:5000/api/auth/register', payload);
      
      toast.dismiss(loadingToast);
      toast.success("Account created! Please check your email.");
      
      navigate('/verify-email', { state: { email: formData.email } });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed. Check your information.");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans bg-slate-50 overflow-hidden">
      
      {/* Premium Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-400/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex flex-col items-center relative z-10">
        <Link to="/" className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
        </Link>

        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-slate-500">
          Join thousands of professionals and employers worldwide.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        {/* Frosted Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-[2rem] sm:px-12 border border-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Premium Role Selector Cards */}
            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-3 tracking-wide">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-200 ${formData.role === 'jobSeeker' ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-blue-200 bg-white'}`}>
                  <input type="radio" name="role" value="jobSeeker" checked={formData.role === 'jobSeeker'} onChange={handleChange} className="sr-only" />
                  <svg className={`w-8 h-8 mb-2 transition-colors ${formData.role === 'jobSeeker' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                  <span className={`font-black text-sm ${formData.role === 'jobSeeker' ? 'text-blue-700' : 'text-slate-600'}`}>Find a Job</span>
                </label>
                
                <label className={`relative flex flex-col items-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-200 ${formData.role === 'employer' ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-slate-200 hover:border-blue-200 bg-white'}`}>
                  <input type="radio" name="role" value="employer" checked={formData.role === 'employer'} onChange={handleChange} className="sr-only" />
                  <svg className={`w-8 h-8 mb-2 transition-colors ${formData.role === 'employer' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className={`font-black text-sm ${formData.role === 'employer' ? 'text-blue-700' : 'text-slate-600'}`}>Hire Talent</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
            </div>

            {/* Smooth drop-down animation for Employer fields */}
            <div className={`space-y-6 overflow-hidden transition-all duration-500 ease-in-out ${formData.role === 'employer' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Company Name</label>
                <input type="text" name="companyName" required={formData.role === 'employer'} value={formData.companyName} onChange={handleChange} className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Your Job Title</label>
                <input type="text" name="posterJobTitle" required={formData.role === 'employer'} value={formData.posterJobTitle} onChange={handleChange} className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Password</label>
                <input type="password" name="password" required minLength="8" value={formData.password} onChange={handleChange} className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
              </div>
            </div>

            <div className="flex items-start pt-2">
              <div className="flex items-center h-5 mt-0.5">
                <input id="agreedToTerms" name="agreedToTerms" type="checkbox" required checked={formData.agreedToTerms} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer transition" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreedToTerms" className="font-bold text-slate-600 cursor-pointer">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline transition">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-500 hover:underline transition">Privacy Policy</a>.
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-all duration-200">
                Create Account
              </button>
            </div>
            
          </form>

          <div className="mt-8 border-t border-slate-100 pt-8">
            <p className="text-center text-sm font-medium text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-blue-600 hover:text-blue-500 transition ml-1">
                Log in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;