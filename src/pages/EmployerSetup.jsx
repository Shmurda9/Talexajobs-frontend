import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function EmployerSetup() {
  const navigate = useNavigate();
  const profilePicRef = useRef(null);
  const logoRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    location: '',
    timezone: 'UTC',
    bio: '',
    portfolioUrl: '',
    hideEmail: false,
    
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    companyDescription: '',
    companyMission: '',
    companyCulture: ''
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);

  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) { userId = decoded.id; }
      else if (decoded._id) { userId = decoded._id; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchCurrentData = async () => {
      try {
        const res = await axios.get("https://talexajobs.onrender.com/api/users/" + userId, {
          headers: { Authorization: "Bearer " + token }
        });
        
        if (res.data.success) {
          const u = res.data.user;
          setFormData(prev => ({
            ...prev,
            fullName: u.fullName || '',
            companyName: u.employerInfo?.companyName || '',
            jobTitle: u.employerInfo?.posterJobTitle || '',
            industry: u.employerInfo?.industry || '',
            companySize: u.employerInfo?.companySize || '',
            companyMission: u.employerInfo?.companyMission || '',
            companyCulture: u.employerInfo?.companyCulture || '',
            hideEmail: u.hideEmail === true
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user data for setup.");
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentData();
  }, [token, userId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogo(file);
      setCompanyLogoPreview(URL.createObjectURL(file));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (formData.fullName === '' || formData.jobTitle === '') {
        toast.error("Please fill out your Name and Job Title.");
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.companyName === '') {
      toast.error("Company Name is required.");
      return;
    }

    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('fullName', formData.fullName);
      
      if (profilePic) { updateData.append('profilePicture', profilePic); }
      if (companyLogo) { updateData.append('companyLogo', companyLogo); }

      const empInfo = {
        posterJobTitle: formData.jobTitle,
        location: formData.location,
        timezone: formData.timezone,
        bio: formData.bio,
        personalWebsite: formData.portfolioUrl,
        companyName: formData.companyName,
        website: formData.companyWebsite,
        industry: formData.industry,
        companySize: formData.companySize,
        companyDescription: formData.companyDescription,
        companyMission: formData.companyMission,
        companyCulture: formData.companyCulture,
        setupCompleted: true 
      };

      updateData.append('employerInfo', JSON.stringify(empInfo));

      // Main save
      await axios.put('https://talexajobs.onrender.com/api/users/profile', updateData, {
        headers: { token: token, Authorization: "Bearer " + token, 'Content-Type': 'multipart/form-data' }
      });

      // Safely update privacy
      try {
        await axios.put('https://talexajobs.onrender.com/api/users/update-privacy', 
          { hideEmail: formData.hideEmail },
          { headers: { token: token, Authorization: "Bearer " + token } }
        );
      } catch (privacyErr) {
        console.warn("Privacy endpoint not ready, continuing anyway.");
      }

      // Fetch the fresh user data and update localStorage so the Bouncer knows you are done
      try {
        const freshRes = await axios.get("https://talexajobs.onrender.com/api/users/" + userId, {
          headers: { Authorization: "Bearer " + token }
        });
        if (freshRes.data.success && freshRes.data.user) {
          localStorage.setItem('user', JSON.stringify(freshRes.data.user));
        }
      } catch (err) {
        console.error("Could not refresh local storage", err);
      }

      toast.success("Profile setup complete!");
      // Force a hard reload to clear the bouncer's memory and send you to the dashboard
      window.location.href = '/employer-dashboard'; 
      
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold animate-pulse text-sm">Loading setup...</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all";

  const getInitial = (name) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "M";
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-sans flex justify-center">
      <div className="w-full max-w-2xl">
        
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-xs mx-auto">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0 rounded-full"></div>
            <div className={"absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 z-0 rounded-full transition-all duration-500 " + (step === 2 ? "w-full" : "w-1/2")}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">1</div>
              <span className="text-[10px] font-bold text-blue-700 mt-2 tracking-wide uppercase">The Human</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={"w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shadow-sm transition-colors duration-500 " + (step === 2 ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-400 border border-slate-200")}>2</div>
              <span className={"text-[10px] font-bold mt-2 tracking-wide uppercase " + (step === 2 ? "text-blue-700" : "text-slate-400")}>The Business</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-10">
          <div className="px-8 py-8 border-b border-slate-100 text-center">
             <h1 className="text-2xl font-black text-slate-900 tracking-tight">
               {step === 1 ? "Complete Your Personal Profile" : "Company Details"}
             </h1>
             <p className="text-sm text-slate-500 font-medium mt-2">
               {step === 1 ? "Candidates apply to people, not just companies." : "Help candidates learn about where they will work."}
             </p>
          </div>

          <div className="p-6 sm:p-8">
            
            {/* ================= STEP 1: PERSONAL DETAILS ================= */}
            <div className={step === 1 ? "block" : "hidden"}>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-300">{getInitial(formData.fullName)}</span>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => profilePicRef.current.click()}
                    className="absolute bottom-0 right-0 bg-slate-900 p-2 rounded-full border-2 border-white shadow-md hover:bg-slate-800 transition transform hover:scale-105 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
                <input type="file" accept="image/*" onChange={handleProfilePicChange} ref={profilePicRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Full Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Job Title <span className="text-rose-500">*</span></label>
                  <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Primary Timezone</label>
                  <select name="timezone" value={formData.timezone} onChange={handleChange} className={inputClass}>
                    <option value="UTC">UTC (GMT)</option>
                    <option value="EST">EST (New York)</option>
                    <option value="CST">CST (Chicago)</option>
                    <option value="PST">PST (Los Angeles)</option>
                    <option value="GMT">GMT (London)</option>
                    <option value="CET">CET (Berlin/Paris)</option>
                    <option value="IST">IST (India)</option>
                    <option value="AEST">AEST (Sydney)</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Professional Bio</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className={inputClass + " resize-none"}></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Portfolio / Website Link</label>
                <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} className={inputClass} placeholder="https://" />
              </div>

              <button type="button" onClick={nextStep} className="w-full bg-slate-900 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-md flex justify-center items-center gap-2">
                Continue to Company Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>

            {/* ================= STEP 2: COMPANY DETAILS ================= */}
            <div className={step === 2 ? "block" : "hidden"}>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative inline-block">
                  <div className="h-24 w-24 rounded-2xl border-4 border-slate-50 bg-slate-100 flex items-center justify-center shadow-md overflow-hidden">
                    {companyLogoPreview ? (
                      <img src={companyLogoPreview} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-slate-300">{getInitial(formData.companyName)}</span>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => logoRef.current.click()}
                    className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-full border-2 border-white shadow-md hover:bg-slate-800 transition transform hover:scale-105 cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoChange} ref={logoRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Company Name <span className="text-rose-500">*</span></label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Company Website</label>
                  <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} className={inputClass} placeholder="https://" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Industry</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Team Size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleChange} className={inputClass}>
                    <option value="">Select size...</option>
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="501-1000">501-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Company Overview</label>
                <textarea name="companyDescription" rows="3" value={formData.companyDescription} onChange={handleChange} className={inputClass + " resize-none"}></textarea>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Company Mission</label>
                <textarea name="companyMission" rows="2" value={formData.companyMission} onChange={handleChange} className={inputClass + " resize-none"}></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Culture & Values</label>
                <textarea name="companyCulture" rows="2" value={formData.companyCulture} onChange={handleChange} className={inputClass + " resize-none"}></textarea>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-6">
                <button type="button" onClick={prevStep} className="w-1/3 bg-white text-slate-700 border border-slate-300 text-sm font-bold py-3.5 rounded-xl hover:bg-slate-50 transition shadow-sm">
                  Back
                </button>
                <button type="button" onClick={handleSubmit} disabled={loading} className={"w-2/3 text-sm font-bold py-3.5 rounded-xl transition shadow-md " + (loading ? "bg-slate-400 text-white cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 text-white")}>
                  {loading ? "Saving Profile..." : "Finish Setup"}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerSetup;
