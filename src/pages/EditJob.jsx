import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function EditJob() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(true);

  // 🚨 NOW INCLUDES EVERY FIELD FROM POST-JOB
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

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/jobs/job/" + id);
        
        if (response.data.success && response.data.job) {
          const job = response.data.job;
          
          // 🚨 SMART MAPPING: Converts database arrays back into text for editing!
          setFormData({
            title: job.title || "",
            category: job.category || "IT",
            location: job.location ? job.location.replace(" (Remote)", "") : "",
            isRemote: job.location ? job.location.toLowerCase().includes("remote") : false,
            employmentType: job.employmentType || "Full-time",
            experienceLevel: job.experienceLevel || "Entry Level",
            education: job.education || "High School Diploma or equivalent",
            salary: job.salary || "",
            deadline: job.deadline ? job.deadline.split('T')[0] : "", // Formats date for the input
            description: job.description || "",
            responsibilities: job.responsibilities ? job.responsibilities.join('\n') : "",
            skills: job.skills ? job.skills.join(', ') : "",
            perks: job.perks ? job.perks.join(', ') : "",
            applicationLink: job.applicationLink || ""
          });
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Could not load job details. It may have been deleted.");
        navigate("/employer-dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to edit this job.");
      return;
    }

    const loadingToast = toast.loading("Saving changes...");

    try {
      let finalLocation = formData.location.trim();
      if (formData.isRemote && !finalLocation.toLowerCase().includes("remote")) {
        finalLocation = finalLocation ? finalLocation + " (Remote)" : "Remote";
      }

      // 🚨 SAVES EVERYTHING BACK TO THE DATABASE
      const payload = {
        title: formData.title,
        category: formData.category || "Other",
        location: finalLocation,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        education: formData.education,
        salary: Number(formData.salary),
        deadline: formData.deadline || undefined,
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').map(item => item.trim()).filter(item => item !== ""),
        skills: formData.skills.split(',').map(item => item.trim()).filter(item => item !== ""),
        perks: formData.perks.split(',').map(item => item.trim()).filter(item => item !== ""),
        applicationLink: formData.applicationLink
      };

      await axios.put("https://talexajobs.onrender.com/api/jobs/update/" + id, payload, {
        headers: {
          token: token,
          Authorization: "Bearer " + token
        }
      });

      toast.dismiss(loadingToast);
      toast.success("Success! Your job posting has been updated.");
      navigate("/employer-dashboard"); 

    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error updating job:", error);
      toast.error("Failed to update job. Check your connection.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Job Details...</p>
      </div>
    );
  }

  const inputClass = "appearance-none block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all shadow-sm";
  const labelClass = "block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation Back */}
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition font-bold text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm w-fit">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          
          {/* PREMIUM HEADER */}
          <div className="bg-slate-900 px-8 py-10 border-b border-slate-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             <div className="relative z-10 flex items-center gap-4">
                <div className="h-14 w-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Edit Job Posting</h2>
                  <p className="text-blue-200 font-medium text-sm mt-1">Update your active pipeline details.</p>
                </div>
             </div>
          </div>

          <div className="px-6 py-10 sm:p-12">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* SECTION 1 */}
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
                    <input type="text" list="edit-job-categories" name="category" value={formData.category} onChange={handleChange} required className={inputClass} />
                    <datalist id="edit-job-categories">
                      <option value="Information Technology (IT)" />
                      <option value="Finance" />
                      <option value="Healthcare" />
                      <option value="Education" />
                      <option value="Retail & Hospitality" />
                      <option value="Construction" />
                    </datalist>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 md:mt-0 md:-mb-1">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Remote Flexibility</h4>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Can this job be done from anywhere?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isRemote" checked={formData.isRemote} onChange={handleChange} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2 */}
              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Requirements & Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={labelClass}>Employment Type</label>
                    <select name="employmentType" value={formData.employmentType} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Experience Level</label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Minimum Education</label>
                    <select name="education" value={formData.education} onChange={handleChange} className={`${inputClass} cursor-pointer`}>
                      <option value="None Required">None Required</option>
                      <option value="High School Diploma or equivalent">High School / GED</option>
                      <option value="Associate Degree">Associate Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3 */}
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
                    <label className={labelClass}>Key Responsibilities (One per line)</label>
                    <textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} className={inputClass} rows="4"></textarea>
                  </div>
                  <div>
                    <label className={labelClass}>Required Skills (Comma separated)</label>
                    <input type="text" name="skills" value={formData.skills} onChange={handleChange} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* SECTION 4 */}
              <div>
                <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-6 flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-700 h-6 w-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Compensation & Routing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Yearly Salary (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-bold">$</span>
                      </div>
                      <input type="number" name="salary" value={formData.salary} onChange={handleChange} required className={`${inputClass} pl-8`} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Application Deadline</label>
                    <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={`${inputClass} cursor-pointer`} />
                  </div>
                </div>
                <div className="mt-6">
                  <label className={labelClass}>Benefits & Perks (Comma separated)</label>
                  <input type="text" name="perks" value={formData.perks} onChange={handleChange} className={inputClass} />
                </div>
                
                <div className="mt-6">
                  <label className={labelClass}>External Application Link (Optional)</label>
                  <p className="text-xs text-slate-500 mb-2 font-medium">If you want candidates to apply on your own website, paste the URL here.</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <input type="text" name="applicationLink" value={formData.applicationLink} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="https://yourcompany.com/careers/apply" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => navigate("/employer-dashboard")} className="w-full sm:w-1/3 flex justify-center py-4 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none transition">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="w-full sm:w-2/3 flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-lg font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  {loading ? "Saving..." : "Save Job Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditJob;