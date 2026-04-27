import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ProfileSetup() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [candidateFile, setCandidateFile] = useState(null);
  const [employerFile, setEmployerFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [candidateData, setCandidateData] = useState({
    headline: "",
    bio: "",
    location: "",
    salaryExpectation: "",
    openToWork: true,
    isContactPublic: false,
    skills: [], 
    workExperience: [],
    education: []
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "Intermediate" });
  const [newWork, setNewWork] = useState({ jobTitle: "", companyName: "", startDate: "", endDate: "", description: "" });
  const [newEdu, setNewEdu] = useState({ schoolName: "", degree: "", fieldOfStudy: "", graduationYear: "" });

  const [employerData, setEmployerData] = useState({
    companyDescription: "",
    mission: "",
    culture: "",
    website: "",
    industry: "",
    companySize: "",
    companyLocation: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setUserRole(user.role);

      if (user.profilePictureUrl) setProfilePicPreview(user.profilePictureUrl);
      
      if (user.role === "jobSeeker" && user.candidateInfo) {
        if (user.candidateInfo.headline) setIsUpdating(true);
        setCandidateData({
          headline: user.candidateInfo.headline || "",
          bio: user.candidateInfo.bio || "",
          location: user.candidateInfo.location || "",
          salaryExpectation: user.candidateInfo.salaryExpectation || "",
          openToWork: user.candidateInfo.openToWork ?? true,
          isContactPublic: user.candidateInfo.isContactPublic || false,
          skills: user.candidateInfo.skills || [],
          workExperience: user.candidateInfo.workExperience || [],
          education: user.candidateInfo.education || []
        });
      }

      if (user.role === "employer" && user.employerInfo) {
        if (user.employerInfo.companyDescription) setIsUpdating(true);
        setEmployerData({
          companyDescription: user.employerInfo.companyDescription || "",
          mission: user.employerInfo.mission || "",
          culture: user.employerInfo.culture || "",
          website: user.employerInfo.website || "",
          industry: user.employerInfo.industry || "",
          companySize: user.employerInfo.companySize || "",
          companyLocation: user.employerInfo.companyLocation || ""
        });
      }
    } catch (error) {
      console.error("Failed to parse user data");
    }
  }, [navigate]);

  const handleCandidateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCandidateData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEmployerChange = (e) => {
    const { name, value } = e.target;
    setEmployerData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = () => {
    if (newSkill.name.trim() === "") return;
    setCandidateData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    setNewSkill({ name: "", level: "Intermediate" });
  };
  
  const removeSkill = (index) => {
    setCandidateData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };
  const addWork = () => {
    if (newWork.jobTitle.trim() === "" || newWork.companyName.trim() === "") return;
    setCandidateData(prev => ({ ...prev, workExperience: [...prev.workExperience, newWork] }));
    setNewWork({ jobTitle: "", companyName: "", startDate: "", endDate: "", description: "" });
  };
  
  const removeWork = (index) => {
    setCandidateData(prev => ({ ...prev, workExperience: prev.workExperience.filter((_, i) => i !== index) }));
  };

  const addEdu = () => {
    if (newEdu.schoolName.trim() === "" || newEdu.degree.trim() === "") return;
    setCandidateData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    setNewEdu({ schoolName: "", degree: "", fieldOfStudy: "", graduationYear: "" });
  };
  
  const removeEdu = (index) => {
    setCandidateData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const maxSteps = userRole === "jobSeeker" ? 4 : 3;

  const nextStep = () => setCurrentStep(prev => (prev < maxSteps ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Saving profile data...");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      if (profilePicFile) formData.append("profilePicture", profilePicFile);

      if (userRole === "jobSeeker") {
        formData.append("candidateInfo", JSON.stringify(candidateData));
        if (candidateFile) formData.append("resume", candidateFile);
      } else if (userRole === "employer") {
        formData.append("employerInfo", JSON.stringify(employerData));
        if (employerFile) formData.append("companyLogo", employerFile);
      }

      const response = await axios.put("http://localhost:5000/api/users/profile", formData, {
        headers: { Authorization: "Bearer " + token }
      });

      const userStr = localStorage.getItem("user");
      if (userStr) {
          const userObj = JSON.parse(userStr);
          if (response.data.user && response.data.user.profilePictureUrl) {
            userObj.profilePictureUrl = response.data.user.profilePictureUrl;
          }
          if (userRole === "jobSeeker" && response.data.user && response.data.user.candidateInfo) {
            userObj.candidateInfo = response.data.user.candidateInfo;
          }
          if (userRole === "employer" && response.data.user && response.data.user.employerInfo) {
            userObj.employerInfo = response.data.user.employerInfo;
          }
          localStorage.setItem("user", JSON.stringify(userObj));
      }

      toast.dismiss(loadingToast);
      toast.success(isUpdating ? "Profile updated successfully!" : "Setup complete!");
      
      if (userRole === "employer") {
        navigate("/employer-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!userRole) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Loading workspace...</div>;

  const stepProgress = (currentStep / maxSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* PROGRESS BAR */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Step {currentStep} of {maxSteps}
            </h2>
            <span className="text-sm font-bold text-blue-600">{Math.round(stepProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: stepProgress + "%" }}></div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
          <div className="px-6 py-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
              {isUpdating ? "Edit Your Profile" : "Profile Setup"}
            </h2>

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">

              {/* ======================================================= */}
              {/* CANDIDATE STEPS                                         */}
              {/* ======================================================= */}
              {userRole === "jobSeeker" && (
                <>
                  {/* STEP 1: Basic Info */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Basic Information</h3>
                      
                      <div className="flex flex-col items-center justify-center mb-6">
                        <div className="h-24 w-24 rounded-full border-4 border-slate-50 bg-slate-100 shadow-md overflow-hidden flex items-center justify-center relative mb-3 hover:border-blue-100 transition-colors cursor-pointer group">
                          {profilePicPreview ? (
                            <img src={profilePicPreview} alt="Profile" className="h-full w-full object-cover group-hover:opacity-80 transition-opacity" />
                          ) : (
                            <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          )}
                          <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className="text-sm font-bold text-blue-600">Upload Photo</p>
                      </div>

                      <div>
                        <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Professional Title</label>
                        <input type="text" name="headline" value={candidateData.headline} onChange={handleCandidateChange} placeholder="e.g. Registered Nurse, Retail Manager, Civil Engineer" required className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Location</label>
                        <input type="text" name="location" value={candidateData.location} onChange={handleCandidateChange} placeholder="e.g. City, State, Country" required className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">Open to Work</h4>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">Let employers know you are actively looking for opportunities.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="openToWork" checked={candidateData.openToWork} onChange={handleCandidateChange} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Bio & Skills */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Professional Summary & Skills</h3>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Bio Summary</label>
                        <textarea name="bio" value={candidateData.bio} onChange={handleCandidateChange} rows="4" placeholder="Briefly describe your background, experience, and the kind of roles you are looking for..." className="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm"></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Professional Skills</label>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                          <input type="text" value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} placeholder="e.g. Customer Service, Data Analysis, Machine Operation" className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                          <div className="flex gap-2">
                            <select value={newSkill.level} onChange={(e) => setNewSkill({...newSkill, level: e.target.value})} className="flex-1 sm:w-40 px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm">
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Expert">Expert</option>
                            </select>
                            <button type="button" onClick={addSkill} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md">Add</button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-4">
                          {candidateData.skills.map((skill, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                              {skill.name} <span className="text-xs font-medium text-blue-600/70 bg-blue-100/50 px-1.5 py-0.5 rounded-md">{skill.level}</span>
                              <button type="button" onClick={() => removeSkill(index)} className="text-blue-400 hover:text-rose-500 font-black ml-1 transition-colors">&times;</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Experience & Education */}
                  {currentStep === 3 && (
                    <div className="space-y-8 animate-fade-in">
                      
                      {/* Work Experience Section */}
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Work Experience</h3>
                        
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Job Title</label>
                              <input type="text" placeholder="Your Job Title" value={newWork.jobTitle} onChange={(e) => setNewWork({...newWork, jobTitle: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Company / Organization</label>
                              <input type="text" placeholder="Company Name" value={newWork.companyName} onChange={(e) => setNewWork({...newWork, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label>
                              <input type="text" placeholder="e.g. Jan 2021" value={newWork.startDate} onChange={(e) => setNewWork({...newWork, startDate: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">End Date</label>
                              <input type="text" placeholder="e.g. Present, or Dec 2023" value={newWork.endDate} onChange={(e) => setNewWork({...newWork, endDate: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Description (Optional)</label>
                            <textarea placeholder="Briefly describe your responsibilities and achievements..." value={newWork.description} onChange={(e) => setNewWork({...newWork, description: e.target.value})} rows="2" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                          </div>
                          <button type="button" onClick={addWork} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Experience
                          </button>
                        </div>

                        {/* Display Added Work Experience */}
                        {candidateData.workExperience.length > 0 && (
                          <div className="space-y-3 mt-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added Experience</h4>
                            {candidateData.workExperience.map((work, index) => (
                              <div key={index} className="group flex justify-between items-start bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-300 transition">
                                <div>
                                  <p className="font-black text-slate-900">{work.jobTitle} <span className="text-slate-400 font-medium mx-1">at</span> {work.companyName}</p>
                                  <p className="text-xs font-bold text-blue-600 mt-1">{work.startDate} — {work.endDate}</p>
                                  {work.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{work.description}</p>}
                                </div>
                                <button type="button" onClick={() => removeWork(index)} className="text-slate-300 hover:text-rose-500 transition p-2 bg-slate-50 rounded-lg group-hover:bg-rose-50 border border-transparent group-hover:border-rose-100">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Education Section */}
                      <div className="pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Education or Training</h3>
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 mb-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Institution / School Name</label>
                              <input type="text" placeholder="Name of School or Institution" value={newEdu.schoolName} onChange={(e) => setNewEdu({...newEdu, schoolName: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Degree / Certificate</label>
                              <input type="text" placeholder="Degree or Certificate Name" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                          </div>
                          <button type="button" onClick={addEdu} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add Education
                          </button>
                        </div>

                        {candidateData.education.length > 0 && (
                          <div className="space-y-3 mt-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added Education</h4>
                            {candidateData.education.map((edu, index) => (
                              <div key={index} className="group flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-blue-300 transition">
                                <div>
                                  <p className="font-black text-slate-900">{edu.degree}</p>
                                  <p className="text-sm font-medium text-slate-500 mt-0.5">{edu.schoolName}</p>
                                </div>
                                <button type="button" onClick={() => removeEdu(index)} className="text-slate-300 hover:text-rose-500 transition p-2 bg-slate-50 rounded-lg group-hover:bg-rose-50 border border-transparent group-hover:border-rose-100">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Resume & Final Details */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Final Details</h3>
                      
                      <div>
                        <label className="block text-sm font-extrabold text-slate-700 mb-2 tracking-wide">Expected Salary (Optional)</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold">$</span>
                          </div>
                          <input type="text" name="salaryExpectation" placeholder="e.g. 50,000" value={candidateData.salaryExpectation} onChange={handleCandidateChange} className="appearance-none block w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm" />
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 p-8 rounded-2xl text-center transition-colors group relative">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Upload Your Resume</h4>
                        <p className="text-sm font-medium text-slate-500 mb-6">PDF format up to 5MB</p>
                        
                        <div className="relative inline-block">
                          <input type="file" accept=".pdf" onChange={(e) => setCandidateFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <button type="button" className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-xl shadow-sm group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                            {candidateFile ? candidateFile.name : "Select PDF File"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ======================================================= */}
              {/* EMPLOYER STEPS (Untouched)                                */}
              {/* ======================================================= */}
              {userRole === "employer" && (
                <>
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Company Basics</h3>
                      
                      <div className="flex flex-col items-center justify-center mb-6">
                        <div className="h-24 w-24 rounded-lg border-4 border-slate-50 bg-slate-100 shadow-md overflow-hidden flex items-center justify-center relative mb-3">
                          {profilePicPreview ? (
                            <img src={profilePicPreview} alt="Logo" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">Logo</span>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => {
                            setEmployerFile(e.target.files[0]);
                            setProfilePicPreview(URL.createObjectURL(e.target.files[0]));
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className="text-sm font-bold text-blue-600 cursor-pointer">Upload Company Logo</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700">Company Website</label>
                        <input type="url" name="website" value={employerData.website} onChange={handleEmployerChange} className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700">Headquarters Location</label>
                        <input type="text" name="companyLocation" value={employerData.companyLocation} onChange={handleEmployerChange} required className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Industry & Size</h3>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700">Industry</label>
                        <input type="text" name="industry" value={employerData.industry} onChange={handleEmployerChange} required className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700">Company Size</label>
                        <select name="companySize" value={employerData.companySize} onChange={handleEmployerChange} required className="mt-2 block w-full px-4 py-3 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                          <option value="">Select size...</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="500+">500+ employees</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Mission & Culture</h3>
                      
                      <div>
                        <label className="block text-sm font-bold text-slate-700">Company Description</label>
                        <textarea name="companyDescription" value={employerData.companyDescription} onChange={handleEmployerChange} rows="3" required className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700">Company Mission</label>
                        <textarea name="mission" value={employerData.mission} onChange={handleEmployerChange} rows="2" className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700">Company Culture</label>
                        <textarea name="culture" value={employerData.culture} onChange={handleEmployerChange} rows="2" className="mt-2 block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between gap-4">
                {currentStep > 1 ? (
                  <button type="button" onClick={prevStep} className="w-1/3 py-4 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition shadow-sm">
                    &larr; Back
                  </button>
                ) : (
                  <button type="button" onClick={() => navigate(-1)} className="w-1/3 py-4 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition shadow-sm">
                    Cancel
                  </button>
                )}

                {currentStep < maxSteps ? (
                  <button type="button" onClick={nextStep} className="w-2/3 py-4 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition">
                    Continue to Next Step &rarr;
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="w-2/3 py-4 px-4 rounded-xl shadow-lg shadow-blue-600/30 text-sm font-black text-white bg-blue-600 hover:bg-blue-500 transition disabled:opacity-70 flex items-center justify-center gap-2">
                    {loading ? "Saving Profile..." : "Complete Setup"}
                    {!loading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
