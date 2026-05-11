import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function MyProfile() {
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  
  // File States (Avatar file completely removed since it's now handled in Settings)
  const [documentFile, setDocumentFile] = useState(null); 

  // Candidate States
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');

  // Employer States
  const [companyName, setCompanyName] = useState(''); 
  const [companyDescription, setCompanyDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setUserData(userObj);
      
      if (userObj.role) setUserRole(userObj.role);

      if (userObj.role === 'jobSeeker') {
        if (userObj.candidateInfo) {
          const cInfo = userObj.candidateInfo;
          if (cInfo.headline) setHeadline(cInfo.headline);
          if (cInfo.location) setLocation(cInfo.location);
          if (cInfo.salaryExpectation) setSalaryExpectation(cInfo.salaryExpectation);
          if (cInfo.skills && Array.isArray(cInfo.skills)) {
            setSkills(cInfo.skills.join(', '));
          }
        }
      } else if (userObj.role === 'employer') {
        if (userObj.employerInfo) {
          const eInfo = userObj.employerInfo;
          if (eInfo.companyName) setCompanyName(eInfo.companyName);
          if (eInfo.companyDescription) setCompanyDescription(eInfo.companyDescription);
          if (eInfo.industry) setIndustry(eInfo.industry);
          if (eInfo.companySize) setCompanySize(eInfo.companySize);
          if (eInfo.companyLocation) setCompanyLocation(eInfo.companyLocation);
        }
      }
    }
  }, []);

  // 🚨 UPDATED TO ALWAYS FETCH THE UNIVERSAL PROFILE PICTURE
  const getAvatarSrc = () => {
    if (userData && userData.profilePictureUrl) {
      let pUrl = userData.profilePictureUrl;
      if (!pUrl.startsWith('http')) {
        const cleanPath = pUrl.replace(/\\/g, '/');
        pUrl = "https://talexajobs.onrender.com/" + cleanPath;
      }
      return pUrl;
    }
    // Fallback if no picture is set
    return null; 
  };

  const getResumeUrl = () => {
    if (userData && userData.candidateInfo && userData.candidateInfo.resumeUrl) {
      const cleanPath = userData.candidateInfo.resumeUrl.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) return cleanPath;
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return "#";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Updating your profile...");
    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      
      if (userRole === 'jobSeeker') {
        let skillsArray = [];
        if (skills) {
          skillsArray = skills.split(',').map(function(skill) { return skill.trim(); }).filter(function(skill) { return skill !== ""; });
        }
        
        const candidateInfo = {
          headline: headline,
          location: location,
          salaryExpectation: salaryExpectation,
          skills: skillsArray
        };
        
        formData.append('candidateInfo', JSON.stringify(candidateInfo));
        if (documentFile) formData.append('resume', documentFile);
        
      } else {
        const employerInfo = {
          companyName: companyName,
          companyDescription: companyDescription,
          industry: industry,
          companySize: companySize,
          companyLocation: companyLocation
        };
        
        formData.append('employerInfo', JSON.stringify(employerInfo));
      }

      const response = await axios.put('https://talexajobs.onrender.com/api/users/profile', formData, {
        headers: {
          'Authorization': "Bearer " + token,
          'token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.user) {
        const oldUserStr = localStorage.getItem('user');
        let updatedUser = response.data.user;
        if (oldUserStr) {
          const oldUserObj = JSON.parse(oldUserStr);
          updatedUser = { ...oldUserObj, ...response.data.user };
        }
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.dismiss(loadingToast);
      toast.success("Profile fully updated!");
      
      setTimeout(function() {
        window.location.href = '/dashboard'; 
      }, 1000);

    } catch (error) {
      console.error("Update error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const renderSkillBadges = () => {
    if (!skills) return null;
    const skillArray = skills.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ""; });
    if (skillArray.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
        {skillArray.map(function(skill, i) {
          return (
            <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-bold border border-blue-200 shadow-sm">
              {skill}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {userRole === 'employer' ? 'Company Profile' : 'Digital Resume'}
          </h1>
          <p className="mt-2 text-slate-500 font-medium text-sm md:text-base">
            {userRole === 'employer' ? 'Manage your corporate identity to attract top talent.' : 'Optimize your profile to stand out to global employers.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          </div>

          <div className="px-6 sm:px-10 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20 mb-8 border-b border-slate-100 pb-8 relative z-10">
                
                {/* 🚨 THE FIX: Clean, read-only picture. No camera hover! */}
                <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl flex-shrink-0 flex items-center justify-center">
                  {getAvatarSrc() ? (
                    <img src={getAvatarSrc()} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-5xl text-slate-400 font-bold">
                      {userData && userData.fullName ? userData.fullName.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                
                <div className="text-center sm:text-left mb-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{userData ? userData.fullName : "User"}</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">
                    {userRole === 'employer' ? 'Company Logo' : 'Profile Picture'}
                    </p>
                  <p className="text-xs text-blue-600 mt-2 hover:underline cursor-pointer" onClick={() => window.location.href='/settings'}>
                    Edit photo in Settings →
                  </p>
                </div>
              </div>
              
              {userRole === 'jobSeeker' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">Professional Headline</label>
                    <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Professional Headline" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-2">Location</label>
                      <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, State, or Remote" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-2">Target Salary</label>
                      <input type="text" value={salaryExpectation} onChange={(e) => setSalaryExpectation(e.target.value)} placeholder="Target Salary" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">Top Skills</label>
                    <p className="text-xs text-slate-500 mb-2 font-medium">Separate each skill with a comma.</p>
                    <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Enter skills separated by commas" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                    
                    {renderSkillBadges()}
                  </div>
                  
                  <div className="pt-8 mt-4 border-t border-slate-100">
                    <label className="block text-sm font-extrabold text-slate-800 mb-3">Resume Document (PDF)</label>
                    
                    {userData && userData.candidateInfo && userData.candidateInfo.resumeUrl && (
                      <div className="mb-4">
                        <a href={getResumeUrl()}
                        target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Current Uploaded Resume
                        </a>
                      </div>
                    )}
                    <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                      <input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="text-slate-500">
                        <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="font-bold text-slate-700">Click to upload a new resume</p>
                        <p className="text-xs mt-1">PDF files only. Max size 5MB.</p>
                        {documentFile && (
                          <p className="mt-3 text-sm font-bold text-green-600 bg-green-50 inline-block px-3 py-1 rounded-md">
                            Selected: {documentFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">Company Name</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" required />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">Company Overview</label>
                    <textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows="5" placeholder="Provide a brief overview of your company..." className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900 leading-relaxed"></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-2">Industry</label>
                      <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-extrabold text-slate-800 mb-2">Company Size</label>
                      <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900 bg-white">
                        <option value="">Select Company Size</option>
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">51-200 Employees</option>
                        <option value="201+">201+ Employees</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">Headquarters Location</label>
                    <input type="text" value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} placeholder="Headquarters Location" className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm font-medium text-slate-900" />
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button type="submit" disabled={loading} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-10 rounded-xl shadow-lg transition disabled:opacity-50 text-sm md:text-base flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-pulse flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Saving Changes...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save Profile Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MyProfile;