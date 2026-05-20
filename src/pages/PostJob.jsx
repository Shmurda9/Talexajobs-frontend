import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [currency, setCurrency] = useState("$");
  
  const [formData, setFormData] = useState({
    title: "",
    category: "", 
    location: "",
    isRemote: false, 
    employmentType: "Full-time",
    experienceLevel: "Entry Level",
    education: "High School Diploma or equivalent",
    salary: "",
    deadline: "",
    description: "",
    responsibilities: "", 
    skills: "", 
    perks: "",
    applicationLink: "" 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(function(prev) {
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleSalaryChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    
    if (rawValue === "") {
      setFormData(prev => ({ ...prev, salary: "" }));
      return;
    }
    
    const formattedValue = Number(rawValue).toLocaleString("en-US");
    setFormData(prev => ({ ...prev, salary: formattedValue }));
  };

  const toggleRemote = () => {
    setFormData(function(prev) {
      return { ...prev, isRemote: !prev.isRemote };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in as an Employer to post a job.");
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading("Publishing job...");

    try {
      let finalLocation = formData.location.trim();
      if (formData.isRemote && !finalLocation.toLowerCase().includes("remote")) {
        if (finalLocation) {
          finalLocation = finalLocation + " (Remote)";
        } else {
          finalLocation = "Remote";
        }
      }

      const numericSalary = Number(formData.salary.replace(/,/g, ""));

      const payload = {
        title: formData.title,
        category: formData.category ? formData.category : "Other",
        location: finalLocation,
        isRemote: formData.isRemote, 
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        education: formData.education,
        salary: numericSalary, 
        deadline: formData.deadline ? formData.deadline : undefined,
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').map(function(item){ return item.trim(); }).filter(function(item){ return item !== ""; }),
        skills: formData.skills.split(',').map(function(item){ return item.trim(); }).filter(function(item){ return item !== ""; }),
        perks: formData.perks.split(',').map(function(item){ return item.trim(); }).filter(function(item){ return item !== ""; }),
        applicationLink: formData.applicationLink 
      };

      await axios.post("https://talexajobs.onrender.com/api/jobs/post", payload, {
        headers: {
          token: token,
          Authorization: "Bearer " + token
        }
      });

      toast.dismiss(loadingToast);
      toast.success("Success! Your job has been posted and is awaiting Admin approval.");
      navigate('/employer-dashboard'); 

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error posting job:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error("Failed to post job: " + error.response.data.message);
      } else {
        toast.error("Failed to post job. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm";
  const labelClass = "block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          
          <div className="bg-slate-900 px-8 py-12 border-b border-slate-800 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col items-center">
                <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Create a Job Posting</h2>
                <p className="text-blue-200 font-medium text-sm md:text-base max-w-lg">
                  Fill out the details below to attract top-tier talent on TalexaJobs.
                </p>
             </div>
          </div>
          
          <div className="px-6 py-10 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Core Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
                  </div>
                  
                  <div>
                    <label className={labelClass}>Category</label>
                    <input 
                      type="text" 
                      list="job-categories" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      required 
                      className={inputClass} 
                    />
                    <datalist id="job-categories">
                      <option value="Customer Support"></option>
                      <option value="Virtual Assistant"></option>
                      <option value="Data Entry"></option>
                      <option value="Chat Support Agent"></option>
                      <option value="Transcriptionist"></option>
                      <option value="Social Media Moderator"></option>
                      <option value="Content Writing"></option>
                      <option value="Online Tutor"></option>
                      <option value="Call Center Agent"></option>
                      <option value="Tech Support"></option>
                      <option value="Dropshipping Assistant"></option>
                      <option value="Translation"></option>
                      <option value="Community Manager"></option>
                      <option value="QA Testing"></option>
                      <option value="Virtual Receptionist"></option>
                      <option value="Lead Generation"></option>
                      <option value="Proofreading"></option>
                      <option value="Order Processing"></option>
                      <option value="IT Helpdesk"></option>
                      <option value="Telemarketing"></option>
                      <option value="Search Engine Evaluation"></option>
                      <option value="Data Annotation"></option>
                      <option value="E-commerce Manager"></option>
                      <option value="Graphic Design"></option>
                      <option value="Web Development"></option>
                      <option value="IT"></option>
                      <option value="Finance"></option>
                      <option value="Healthcare"></option>
                      <option value="Education"></option>
                      <option value="Construction"></option>
                      <option value="Delivery"></option>
                      <option value="Care Assistance"></option>
                      <option value="Warehouse"></option>
                      <option value="Retail"></option>
                      <option value="Hospitality"></option>
                      <option value="Real Estate"></option>
                      <option value="Legal"></option>
                      <option value="Marketing"></option>
                      <option value="Human Resources"></option>
                      <option value="Sales"></option>
                      <option value="Other"></option>
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className={inputClass} />
                  </div>
                  
                  <div 
                    onClick={toggleRemote}
                    className={"flex items-center justify-between p-4 rounded-xl border transition cursor-pointer mt-2 md:mt-0 md:-mb-1 shadow-sm " + (formData.isRemote ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200 hover:border-blue-200")}
                  >
                    <div>
                      <h4 className={"text-sm font-extrabold " + (formData.isRemote ? "text-purple-800" : "text-slate-900")}>Remote Flexibility</h4>
                      <p className={"text-xs font-medium mt-0.5 " + (formData.isRemote ? "text-purple-600" : "text-slate-500")}>Can this job be done from anywhere?</p>
                    </div>
                    <div className={"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + (formData.isRemote ? "bg-purple-600" : "bg-slate-300")}>
                      <span className={"inline-block h-5 w-5 transform rounded-full bg-white transition-transform " + (formData.isRemote ? "translate-x-6" : "translate-x-1")}></span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Requirements & Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={inputClass + " cursor-pointer"}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={inputClass + " cursor-pointer"}>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Minimum Education</label>
                    <select name="education" value={formData.education} onChange={handleChange} className={inputClass + " cursor-pointer"}>
                      <option value="None Required">None Required</option>
                      <option value="High School Diploma or equivalent">High School / GED</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">3</span>
                  Role Description
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Job Summary</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required className={inputClass} rows="3"></textarea>
                  </div>
                  <div>
                    <label className={labelClass}>Key Responsibilities <span className="text-slate-400 font-normal normal-case tracking-normal">(One per line)</span></label>
                    <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} className={inputClass} rows="4"></textarea>
                  </div>
                  <div>
                    <label className={labelClass}>Required Skills <span className="text-slate-400 font-normal normal-case tracking-normal">(Comma separated)</span></label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Compensation & Routing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CLEAN CURRENCY & SALARY COMBO */}
                  <div>
                    <label className={labelClass}>Yearly Salary</label>
                    <div className="flex relative shadow-sm rounded-xl">
                      <select 
                        value={currency} 
                        onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-4 py-3.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 z-10 cursor-pointer"
                      >
                        <option value="$">$</option>
                        <option value="€">€</option>
                        <option value="£">£</option>
                        <option value="¥">¥</option>
                        <option value="₦">₦</option>
                      </select>
                      <input 
                        type="text" 
                        name="salary" 
                        value={formData.salary} 
                        onChange={handleSalaryChange} 
                        required 
                        className="appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-r-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputClass + " cursor-pointer"} />
                  </div>
                </div>
                <div className="mt-6">
                  <label className={labelClass}>Benefits & Perks <span className="text-slate-400 font-normal normal-case tracking-normal">(Comma separated)</span></label>
                  <input type="text" name="perks" value={formData.perks} onChange={handleChange} className={inputClass} />
                </div>
                
                <div className="mt-6">
                  <label className={labelClass}>External Application Link <span className="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span></label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <input type="text" name="applicationLink" value={formData.applicationLink} onChange={handleChange} className={inputClass + " pl-11"} placeholder="https://yourcompany.com/careers/apply" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-lg font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  )}
                  {loading ? "Publishing Job..." : "Publish Job Worldwide"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostJob;