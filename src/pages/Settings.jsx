import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  
  const [initialEmail, setInitialEmail] = useState('');
  const [userRole, setUserRole] = useState(''); 
  
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Added Candidate specific fields to the main flat state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    bio: '',
    portfolioUrl: '',
    // Employer fields
    jobTitle: '',
    businessEmail: '',
    companyName: '',
    companyWebsite: '',
    industry: '',
    companySize: '',
    companyDescription: '',
    companyMission: '',
    companyCulture: '',
    // Candidate fields
    contactEmail: '',
    salaryExpectation: '',
    skills: '' 
  });
  
  // Dynamic arrays for Candidate history
  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation] = useState([]);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPic, setPreviewPic] = useState(null);

  const token = localStorage.getItem('token');
  
  let userId = null;
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      if (decoded.id) { userId = decoded.id; }
      else if (decoded._id) { userId = decoded._id; }
      else if (decoded.userId) { userId = decoded.userId; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  useEffect(() => {
    if (!token) { 
      navigate('/login'); 
      return; 
    }
    const fetchMyData = async () => {
      try {
        const res = await axios.get("https://talexajobs.onrender.com/api/users/" + userId, {
          headers: { Authorization: "Bearer " + token }
        });
        if (res.data.success) {
          const u = res.data.user;
          const fetchedRole = u.role || 'employer';
          setUserRole(fetchedRole);
          
          let flatData = {
            fullName: u.fullName || '',
            email: u.email || '',
            location: '',
            bio: '',
            portfolioUrl: '',
            jobTitle: '',
            businessEmail: '',
            companyName: '',
            companyWebsite: '',
            industry: '',
            companySize: '',
            companyDescription: '',
            companyMission: '',
            companyCulture: '',
            contactEmail: '',
            salaryExpectation: '',
            skills: ''
          };

          if (fetchedRole === 'jobSeeker' && u.candidateInfo) {
             const c = u.candidateInfo;
             if (c.location) flatData.location = c.location;
             if (c.bio) flatData.bio = c.bio;
             if (c.portfolioUrl || c.portfolioLink) flatData.portfolioUrl = c.portfolioUrl || c.portfolioLink;
             if (c.contactEmail) flatData.contactEmail = c.contactEmail;
             if (c.salaryExpectation) flatData.salaryExpectation = c.salaryExpectation;
             
             // Convert skills array to comma separated string for easy editing
             if (c.skills && Array.isArray(c.skills)) {
                flatData.skills = c.skills.map(s => typeof s === 'object' ? s.name : s).join(', ');
             }
             if (c.workExperience) setWorkExperience(c.workExperience);
             if (c.education) setEducation(c.education);
             
          } else if (fetchedRole === 'employer' && u.employerInfo) {
             const e = u.employerInfo;
             flatData.location = e.companyLocation || e.location || '';
             flatData.bio = e.bio || u.bio || '';
             flatData.portfolioUrl = e.personalWebsite || e.website || u.portfolioUrl || '';
             flatData.jobTitle = e.posterJobTitle || '';
             flatData.businessEmail = e.businessEmail || '';
             flatData.companyName = e.companyName || '';
             flatData.companyWebsite = e.website || '';
             flatData.industry = e.industry || '';
             flatData.companySize = e.companySize || '';
             flatData.companyDescription = e.companyDescription || '';
             flatData.companyMission = e.companyMission || '';
             flatData.companyCulture = e.companyCulture || '';
          }

          setFormData(flatData);
          setInitialEmail(u.email || ''); 

          if (u.profilePictureUrl) {
            let pUrl = u.profilePictureUrl;
            if (!pUrl.startsWith("http")) {
              const cleanPath = pUrl.split('\\').join('/');
              pUrl = "https://talexajobs.onrender.com/" + cleanPath;
            }
            setPreviewPic(pUrl);
          }
        }
      } catch (error) {
        toast.error("Could not load profile data.");
      }
    };
    if (userId) { fetchMyData(); }
  }, [token, userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewPic(URL.createObjectURL(file));
      setIsEditing(true); 
    }
  };

  // Handlers for dynamic array inputs
  const handleArrayChange = (setter, index, field, value) => {
    setter(prev => {
      const newArray = [...prev];
      newArray[index] = { ...newArray[index], [field]: value };
      return newArray;
    });
  };

  const addArrayItem = (setter, emptyItem) => {
    setter(prev => [...prev, emptyItem]);
  };

  const removeArrayItem = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = new FormData();
      updateData.append('fullName', formData.fullName);
      updateData.append('location', formData.location);
      updateData.append('bio', formData.bio);
      updateData.append('portfolioUrl', formData.portfolioUrl);

      if (selectedFile) updateData.append('profilePicture', selectedFile);
      
      if (userRole === 'jobSeeker') {
         // Parse skills string back into an array
         const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
         
         updateData.append('candidateInfo', JSON.stringify({ 
             location: formData.location,
             bio: formData.bio,
             portfolioLink: formData.portfolioUrl,
             contactEmail: formData.contactEmail,
             salaryExpectation: formData.salaryExpectation ? Number(formData.salaryExpectation) : null,
             skills: skillsArray,
             workExperience: workExperience,
             education: education
         }));
      } else if (userRole === 'employer') {
         updateData.append('employerInfo', JSON.stringify({ 
             location: formData.location,
             bio: formData.bio,
             personalWebsite: formData.portfolioUrl,
             posterJobTitle: formData.jobTitle,
             businessEmail: formData.businessEmail,
             companyName: formData.companyName,
             website: formData.companyWebsite,
             industry: formData.industry,
             companySize: formData.companySize,
             companyDescription: formData.companyDescription,
             companyMission: formData.companyMission,
             companyCulture: formData.companyCulture
         }));
      }

      const res = await axios.put('https://talexajobs.onrender.com/api/users/profile', updateData, {
        headers: { token: token, Authorization: "Bearer " + token, 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        if (formData.email !== initialEmail) {
            await axios.post('https://talexajobs.onrender.com/api/users/request-email-change',
              { newEmail: formData.email }, 
              { headers: { token: token, Authorization: "Bearer " + token } }
            );
            
            toast.success("Profile saved! Check your new email for a verification code.");
            setShowOtpModal(true); 
            setLoading(false);
            return; 
        }
        toast.success("Account settings updated successfully!");
        setIsEditing(false);
        setTimeout(function() {
          if (userRole === 'employer') { navigate('/employer-dashboard'); }
          else { navigate('/dashboard'); }
        }, 1500);
      }
    } catch (error) {
      let msg = "Failed to update settings.";
      if (error.response?.data?.message) { msg = error.response.data.message; }
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await axios.post('https://talexajobs.onrender.com/api/users/verify-email-change', 
        { otpCode: otpCode }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );

      if (res.data.success) {
        toast.success("Email successfully verified and updated!");
        setShowOtpModal(false);
        setInitialEmail(formData.email);
        setIsEditing(false);
        
        setTimeout(function() {
          if (userRole === 'employer') { navigate('/employer-dashboard'); }
          else { navigate('/dashboard'); }
        }, 1500);
      }
    } catch (error) {
      let msg = "Invalid or expired code.";
      if (error.response?.data?.message) { msg = error.response.data.message; }
      toast.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const inputClass = isEditing 
    ? "w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-slate-900 shadow-sm" 
    : "w-full px-4 py-3.5 rounded-xl border border-slate-200 outline-none transition bg-slate-50 text-slate-500 cursor-not-allowed font-medium";

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Account Settings</h1>
            <p className="text-slate-500 text-sm">Manage your core identity credentials.</p>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-full sm:w-auto bg-slate-900 text-white font-bold py-3 sm:py-2.5 px-6 rounded-xl hover:bg-slate-800 transition shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col items-center pb-6 border-b border-slate-100">
            <div 
              onClick={() => { if (isEditing) fileInputRef.current.click() }}
              className={"relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-md group " + (isEditing ? "cursor-pointer bg-slate-200" : "bg-slate-100")}
            >
              {previewPic ? (
                <img src={previewPic} alt="Preview" className={"h-full w-full object-cover " + (!isEditing && "opacity-80")} />
              ) : (
                <span className="text-4xl text-slate-400 font-bold">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                </span>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                </div>
              )}
            </div>
            {isEditing && <p className="text-sm text-slate-500 mt-3 font-medium">Tap image to change</p>}
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Email (Private)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} required className={inputClass} />
              {isEditing && <p className="text-xs text-blue-600 mt-2 font-bold flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Changing email requires verification</p>}
            </div>
          </div>

          {/* ---------------- EMPLOYER SPECIFIC FIELDS ---------------- */}
          {userRole === 'employer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="e.g. Hiring Manager" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Email (Public)</label>
                <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="e.g. hiring@company.com" />
              </div>
            </div>
          )}

          {/* ---------------- CANDIDATE SPECIFIC FIELDS ---------------- */}
          {userRole === 'jobSeeker' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Public Contact Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="For employers to reach you" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Expected Salary ($)</label>
                <input type="number" name="salaryExpectation" value={formData.salaryExpectation} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="e.g. 85000" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Austin, TX" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Portfolio / Website Link</label>
              <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} disabled={!isEditing} placeholder="https://" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Bio</label>
            <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} disabled={!isEditing} placeholder="A brief introduction about yourself..." className={inputClass + " resize-none"} />
          </div>

          {/* ---------------- CANDIDATE ADVANCED FIELDS (SKILLS, EXPERIENCE, EDUCATION) ---------------- */}
          {userRole === 'jobSeeker' && (
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-8">
              
              {/* SKILLS */}
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-4">Professional Skills</h2>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Enter skills separated by commas</label>
                <textarea 
                  name="skills" 
                  rows="2" 
                  value={formData.skills} 
                  onChange={handleChange} 
                  disabled={!isEditing} 
                  placeholder="e.g. React, Node.js, Project Management, Graphic Design" 
                  className={inputClass + " resize-none"} 
                />
              </div>

              {/* WORK EXPERIENCE */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900">Work Experience</h2>
                  {isEditing && (
                    <button type="button" onClick={() => addArrayItem(setWorkExperience, { jobTitle: '', companyName: '', startDate: '', endDate: '', description: '' })} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition">
                      + Add Role
                    </button>
                  )}
                </div>
                
                {workExperience.length === 0 && !isEditing ? (
                  <p className="text-slate-400 italic text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">No experience added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {workExperience.map((exp, index) => (
                      <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 relative">
                        {isEditing && (
                          <button type="button" onClick={() => removeArrayItem(setWorkExperience, index)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Job Title</label>
                            <input type="text" value={exp.jobTitle || ''} onChange={(e) => handleArrayChange(setWorkExperience, index, 'jobTitle', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="Software Engineer" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Company</label>
                            <input type="text" value={exp.companyName || ''} onChange={(e) => handleArrayChange(setWorkExperience, index, 'companyName', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="Google" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                            <input type="text" value={exp.startDate || ''} onChange={(e) => handleArrayChange(setWorkExperience, index, 'startDate', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="Jan 2020" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                            <input type="text" value={exp.endDate || ''} onChange={(e) => handleArrayChange(setWorkExperience, index, 'endDate', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="Present" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                          <textarea rows="2" value={exp.description || ''} onChange={(e) => handleArrayChange(setWorkExperience, index, 'description', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm resize-none"} placeholder="What did you do?" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EDUCATION */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-slate-900">Education & Training</h2>
                  {isEditing && (
                    <button type="button" onClick={() => addArrayItem(setEducation, { degree: '', schoolName: '' })} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition">
                      + Add Education
                    </button>
                  )}
                </div>
                
                {education.length === 0 && !isEditing ? (
                  <p className="text-slate-400 italic text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">No education added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 relative">
                        {isEditing && (
                          <button type="button" onClick={() => removeArrayItem(setEducation, index)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Degree / Certificate</label>
                            <input type="text" value={edu.degree || ''} onChange={(e) => handleArrayChange(setEducation, index, 'degree', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="BSc Computer Science" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Institution Name</label>
                            <input type="text" value={edu.schoolName || ''} onChange={(e) => handleArrayChange(setEducation, index, 'schoolName', e.target.value)} disabled={!isEditing} className={inputClass + " py-2 text-sm"} placeholder="University of Texas" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ---------------- EMPLOYER ADVANCED FIELDS ---------------- */}
          {userRole === 'employer' && (
            <div className="pt-6 mt-6 border-t border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6">Company Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} disabled={!isEditing} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Website</label>
                  <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="https://" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder="e.g. Technology" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Team Size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleChange} disabled={!isEditing} className={inputClass}>
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

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Overview</label>
                <textarea name="companyDescription" rows="3" value={formData.companyDescription} onChange={handleChange} disabled={!isEditing} className={inputClass + " resize-none"} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Mission</label>
                <textarea name="companyMission" rows="2" value={formData.companyMission} onChange={handleChange} disabled={!isEditing} className={inputClass + " resize-none"} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Culture & Values</label>
                <textarea name="companyCulture" rows="2" value={formData.companyCulture} onChange={handleChange} disabled={!isEditing} className={inputClass + " resize-none"} />
              </div>
            </div>
          )}

          <div className="pt-6 pb-2">
            <button 
              type="button" 
              onClick={() => navigate('/change-password')} 
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Change Account Password
            </button>
          </div>

          {isEditing && (
            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button type="button" onClick={() => { setIsEditing(false); setFormData({...formData, email: initialEmail}); }} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition order-2 sm:order-1">
                Cancel
                </button>
              <button type="submit" disabled={loading} className={"w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white transition shadow-sm order-1 sm:order-2 " + (loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}>
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}
        </form>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden flex flex-col">
            
            <div className="bg-blue-50 px-6 py-8 text-center border-b border-blue-100">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900">Verify Your Email</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">We sent a 6-digit code to <strong className="text-slate-700">{formData.email}</strong></p>
            </div>
            
            <div className="p-6 text-center">
               <input 
                 type="text" 
                 maxLength="6"
                 value={otpCode}
                 onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                 className="w-full text-center text-3xl tracking-[0.5em] font-black border border-slate-300 rounded-xl py-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-slate-800 shadow-inner bg-slate-50 transition placeholder-slate-300" 
                 placeholder="------"
               />
               <p className="text-xs text-rose-500 mt-3 font-bold">Code expires in 10 minutes</p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
               <button onClick={handleVerifyOtp} disabled={verifyingOtp} className={"w-full py-3.5 rounded-xl font-black text-white transition shadow-md " + (verifyingOtp ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}>
                {verifyingOtp ? "Verifying..." : "Verify & Update Email"}
               </button>
               <button onClick={() => setShowOtpModal(false)} className="w-full py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition">
                 Cancel
               </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}

export default Settings;
