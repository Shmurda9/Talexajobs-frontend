import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function JobBoard() {
  const navigate = useNavigate(); 
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minSalary, setMinSalary] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 5; 

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [applyingJobId, setApplyingJobId] = useState(null);

  // 🚨 NEW STATE FOR THE SUGGESTED JOBS MODAL
  const [showSuggestedModal, setShowSuggestedModal] = useState(false);

  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  let userRole = null;
  let currentUser = null;

  if (token && token.length > 10) {
    try {
      userRole = JSON.parse(atob(token.split(".")[1])).role;
    } catch (e) {
      console.error("Token error", e);
    }
  }

  if (userStr && userStr.length > 5) {
    try {
      currentUser = JSON.parse(userStr);
    } catch (e) {
      console.error("User parse error", e);
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, locationFilter, remoteOnly, minSalary]);

  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/jobs/all");
        if (response.data.jobs && Array.isArray(response.data.jobs)) {
          setJobs(response.data.jobs);
        } else if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else {
          setJobs([]); 
        }

        let isJobSeeker = false;
        if (userRole == "jobSeeker") {
            isJobSeeker = true;
        }

        if (token && isJobSeeker == true) {
          const bookmarkRes = await axios.get("https://talexajobs.onrender.com/api/bookmarks/my-bookmarks", {
            headers: { token: token, Authorization: "Bearer " + token }
          });
          if (bookmarkRes.data.success && bookmarkRes.data.savedJobs) {
            const savedIds = bookmarkRes.data.savedJobs.map(job => job._id);
            setSavedJobs(savedIds);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobsData();
  }, [token, userRole]);

  const handleBookmarkClick = async (jobId) => {
    if (token == null || token == "") {
      toast.error("You must be logged in to save jobs.");
      return;
    }
    try {
      const response = await axios.post("https://talexajobs.onrender.com/api/bookmarks/toggle/" + jobId, {}, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      if (response.data.isSaved) {
        setSavedJobs([...savedJobs, jobId]);
        toast.success("Job saved to your bookmarks.");
      } else {
        setSavedJobs(savedJobs.filter(id => {
            if (id == jobId) { return false; }
            return true;
        }));
        toast.success("Job removed from bookmarks.");
      }
    } catch (error) {
      toast.error("Failed to save job. Please try again.");
    }
  };

  const initiateApply = (jobId) => {
    if (token == null || token == "") {
      toast.error("You must be logged in to apply for jobs.");
      return;
    }

    if (currentUser && currentUser.role == "jobSeeker") {
      let hasHeadline = false;
      if (currentUser.candidateInfo && currentUser.candidateInfo.headline) {
          hasHeadline = true;
      }
      
      if (hasHeadline == false) {
        toast.error("You must complete your profile before you can apply for jobs.");
        navigate("/my-profile"); 
        return;
      }
    }

    setApplyingJobId(jobId);
    setCoverLetterText("");
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!applyingJobId) return;

    const loadingToast = toast.loading("Submitting application...");

    try {
      await axios.post("https://talexajobs.onrender.com/api/applications/apply", 
        { jobId: applyingJobId, coverLetter: coverLetterText }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Application submitted successfully.");
      setShowApplyModal(false);
      setSelectedJob(null); 
    } catch (error) {
      toast.dismiss(loadingToast);
      let isRestricted = false;
      if (error.response && error.response.status == 403) {
          isRestricted = true;
      }
      
      if (isRestricted == true) {
          toast.error("Your account has been restricted. Please check your email for details.");
      } else {
          toast.error("Failed to apply. You may have already applied for this position.");
      }
    }
  };

  const handleMessageEmployer = async (job) => {
    if (token == null || token == "") {
      toast.error("You must be logged in to send messages.");
      return;
    }
    
    let hasUser = false;
    if (job.user && job.user._id) { hasUser = true; }
    
    if (hasUser == false) {
      toast.error("Cannot message this employer (Account hidden or deleted).");
      return;
    }

    setSelectedJob(null);
    navigate("/messages", { state: { prefilledContact: job.user } });
  };

  const filteredJobs = jobs.filter((job) => {
    let isApproved = false;
    if (job.adminStatus == "approved") { isApproved = true; }
    
    let isPrivileged = false;
    if (userRole == "admin" || userRole == "employer") { isPrivileged = true; }
    
    if (isPrivileged == false && isApproved == false) { return false; }

    if (searchTerm && searchTerm.length > 0) {
      const term = searchTerm.toLowerCase();
      let titleMatch = false;
      if (job.title && job.title.toLowerCase().includes(term)) { titleMatch = true; }
      
      let descMatch = false;
      if (job.description && job.description.toLowerCase().includes(term)) { descMatch = true; }
      
      let compMatch = false;
      if (job.user && job.user.employerInfo && job.user.employerInfo.companyName) {
        if (job.user.employerInfo.companyName.toLowerCase().includes(term)) { compMatch = true; }
      }
      
      if (titleMatch == false && descMatch == false && compMatch == false) return false;
    }

    if (categoryFilter && categoryFilter.length > 0) {
        let catMatch = false;
        if (job.category == categoryFilter) { catMatch = true; }
        if (catMatch == false) return false;
    }
    
    if (locationFilter && locationFilter.length > 0) {
        const jobLoc = job.location ? job.location.toLowerCase() : "";
        if (jobLoc.includes(locationFilter.toLowerCase()) == false) return false;
    }
    
    if (remoteOnly == true) {
        const jobLoc = job.location ? job.location.toLowerCase() : "";
        let isTaggedRemote = false;

        if (job.isRemote === true) { isTaggedRemote = true; }
        if (jobLoc.includes("remote")) { isTaggedRemote = true; }
        if (jobLoc.includes("work from home")) { isTaggedRemote = true; }

        if (isTaggedRemote == false) { return false; } 
    }
    
    if (minSalary && minSalary.length > 0) {
      const salaryTarget = Number(minSalary);
      const jobSalary = Number(job.salary);
      if (jobSalary == null || jobSalary < salaryTarget) return false;
    }
    
    return true;
  });
  
  const getRecommendedJobs = () => {
    let isJobSeeker = false;
    if (currentUser && currentUser.role == "jobSeeker" && currentUser.candidateInfo) {
        isJobSeeker = true;
    }
    if (isJobSeeker == false) return [];
    
    const headline = currentUser.candidateInfo.headline ? currentUser.candidateInfo.headline.toLowerCase() : "";
    if (headline == null || headline.length < 1) return [];

    const keywords = headline.split(" ").filter(word => word.length > 3);
    if (keywords.length == 0) return [];
    const recommendations = jobs.filter(job => {
      let isApproved = false;
      if (job.adminStatus == "approved") { isApproved = true; }
      if (isApproved == false) return false;
      
      const title = job.title ? job.title.toLowerCase() : "";
      const category = job.category ? job.category.toLowerCase() : "";
      return keywords.some(keyword => title.includes(keyword) || category.includes(keyword));
    });

    return recommendations.slice(0, 2); 
  };

  const recommendedJobs = getRecommendedJobs();

  // 🚨 THE ONE-TIME SESSION POP-UP LOGIC
  useEffect(() => {
    if (recommendedJobs.length > 0) {
      const hasSeenPopup = sessionStorage.getItem('hasSeenSuggestedJobs');
      if (!hasSeenPopup) {
        setShowSuggestedModal(true);
        sessionStorage.setItem('hasSeenSuggestedJobs', 'true');
      }
    }
  }, [recommendedJobs.length]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const indexOfLastJob = currentPage * JOBS_PER_PAGE;
  const indexOfFirstJob = indexOfLastJob - JOBS_PER_PAGE;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const getLogo = (user) => {
    if (user == null) return null;
    if (user.employerInfo && user.employerInfo.logoUrl) return user.employerInfo.logoUrl;
    if (user.profilePictureUrl) return user.profilePictureUrl;
    return null;
  };

  const getAvatarLetter = (user) => {
    if (user == null) return "C";
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName.charAt(0).toUpperCase();
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    return "C";
  };

  const getDisplayName = (user) => {
    if (user == null) return "Confidential Employer";
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName;
    if (user.fullName) return user.fullName;
    return "Confidential Employer";
  };

  const renderJobCard = (job, isSpecial = false) => {
    const uniqueKey = job._id + Math.random().toString();
    
    let isApproved = false;
    if (job.adminStatus == "approved") { isApproved = true; }
    
    const logoUrl = getLogo(job.user);
    const isBookmarked = savedJobs.includes(job._id);
    const jobLocStr = job.location ? job.location.toLowerCase() : "";
    
    let showRemoteBadge = false;
    if (job.isRemote == true || jobLocStr.includes("remote") == true || jobLocStr.includes("work from home") == true) {
        showRemoteBadge = true;
    }

    let cardClass = "bg-white border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition duration-200 overflow-hidden ";
    if (isApproved == false) {
      cardClass += "border-rose-200 bg-rose-50";
    } else if (isSpecial == true) {
      cardClass += "border-amber-200 bg-gradient-to-b from-amber-50/50 to-white";
    } else {
      cardClass += "border-slate-200";
    }

    let actionButton = null;
    let isEmployerOrAdmin = false;
    if (userRole == "employer" || userRole == "admin") { isEmployerOrAdmin = true; }
    
    if (isEmployerOrAdmin == false) {
      let hasAppLink = false;
      if (job.applicationLink && job.applicationLink.length > 0) { hasAppLink = true; }
      
      if (hasAppLink == true) {
        actionButton = (
          <a href={job.applicationLink} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs sm:text-sm text-center flex items-center justify-center gap-1.5">
            Apply Externally
          </a>
        );
      } else {
        actionButton = (
          <button onClick={() => initiateApply(job._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs sm:text-sm text-center">
            Apply Now
          </button>
        );
      }
    }
    
    return (
      <div key={uniqueKey} className={cardClass}>
        {userRole == "admin" ? (
          isApproved == false ? (
            <div className="mb-3 sm:mb-4 bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md inline-block border border-rose-200 tracking-wide uppercase">
              Hidden: Waiting for Admin Approval
            </div>
          ) : null
        ) : null}
        
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="font-extrabold text-slate-400 text-xl sm:text-2xl">{getAvatarLetter(job.user)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug line-clamp-2">{job.title}</h3>
              <Link to={job.user && job.user._id ? "/employer/" + job.user._id : "#"} className="text-blue-600 hover:text-blue-800 transition font-bold text-xs sm:text-sm mt-1 truncate inline-block max-w-full">
                {getDisplayName(job.user)}
              </Link>
            </div>
          </div>

          <div className="flex-shrink-0 pt-1">
            {isEmployerOrAdmin == false ? (
              <button onClick={() => handleBookmarkClick(job._id)} className="text-slate-400 hover:text-blue-600 transition" title="Save Job">
                  {isBookmarked == true ? (
                    <span className="text-blue-600 text-xl">★</span>
                  ) : (
                    <span className="text-slate-400 text-xl">☆</span>
                  )}
              </button>
            ) : null}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {showRemoteBadge == true ? (
            <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
              Remote / Flexible
            </span>
          ) : null}
          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
            {job.employmentType || "Full-time"}
          </span>
          <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
            {job.experienceLevel || "Entry Level"}
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
            {job.salary ? "$" + job.salary.toLocaleString() : "Negotiable"}
          </span>
        </div>

        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
          {job.description}
        </p>

        {job.skills ? (
          job.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
              {job.skills.slice(0, 4).map((skill, idx) => (
                <span key={idx} className="text-[10px] sm:text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 ? (
                 <span className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 py-1">+{job.skills.length - 4} more</span>
              ) : null}
            </div>
          ) : null
        ) : null}

        <div className="flex flex-row gap-2 sm:gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => setSelectedJob(job)} className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition shadow-sm text-xs sm:text-sm text-center">
            View Details
          </button>
          
          {actionButton}
        </div>
      </div>
    );
  };

  if (loading == true) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10 font-sans relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Career Opportunities</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">Discover your next role at top-tier companies.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 sm:mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                Search Filters
              </h2>
              
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Keywords</label>
                <div className="relative">
                  <input type="text" placeholder="Title, company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition shadow-sm bg-slate-50 hover:bg-white" />
                </div>
              </div>
              
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="block w-full py-2.5 sm:py-3 px-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-slate-50 hover:bg-white shadow-sm font-medium">
                  <option value="">All Categories</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Virtual Assistant">Virtual Assistant</option>
                  <option value="Data Entry">Data Entry</option>
                  <option value="Chat Support Agent">Chat Support Agent</option>
                  <option value="Transcriptionist">Transcriptionist</option>
                  <option value="Social Media Moderator">Social Media Moderator</option>
                  <option value="Content Writing">Content Writing & Copywriting</option>
                  <option value="Online Tutor">Online Tutor</option>
                  <option value="Call Center Agent">Call Center Agent</option>
                  <option value="Tech Support">Tech Support</option>
                  <option value="Dropshipping Assistant">Dropshipping Assistant</option>
                  <option value="Translation">Translation & Localization</option>
                  <option value="Community Manager">Community Manager</option>
                  <option value="QA Testing">QA Testing</option>
                  <option value="Virtual Receptionist">Virtual Receptionist</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Proofreading">Proofreading & Editing</option>
                  <option value="Order Processing">Order Processing</option>
                  <option value="IT Helpdesk">IT Helpdesk</option>
                  <option value="Telemarketing">Telemarketing</option>
                  <option value="Search Engine Evaluation">Search Engine Evaluation</option>
                  <option value="Data Annotation">Data Annotation</option>
                  <option value="E-commerce Manager">E-commerce Manager</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="IT">IT & Engineering</option>
                  <option value="Finance">Finance & Accounting</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Construction">Construction</option>
                  <option value="Delivery">Delivery & Logistics</option>
                  <option value="Care Assistance">Care Assistance</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Retail">Retail</option>
                  <option value="Hospitality">Hospitality & Tourism</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Legal">Legal</option>
                  <option value="Marketing">Marketing & PR</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales & Business Dev</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div 
                className={"mb-2 flex items-center p-3 sm:p-3.5 rounded-xl border cursor-pointer transition shadow-sm " + (remoteOnly ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200 hover:border-blue-200 hover:bg-blue-50")} 
                onClick={() => {
                  if (remoteOnly == true) { setRemoteOnly(false); } else { setRemoteOnly(true); }
                }}
              >
                <div className={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors " + (remoteOnly ? "bg-purple-600" : "bg-slate-300")}>
                  <span className={"inline-block h-3 w-3 transform rounded-full bg-white transition-transform " + (remoteOnly ? "translate-x-5" : "translate-x-1")}></span>
                </div>
                <label className={"ml-3 block text-xs sm:text-sm font-bold pointer-events-none " + (remoteOnly ? "text-purple-700" : "text-slate-800")}>
                  Remote jobs only
                </label>
              </div>
            </div>
          </div>

          {/* Job Feed */}
          <div className="w-full lg:w-3/4">
            
            <div className="mb-4 flex justify-between items-center text-xs sm:text-sm text-slate-500 font-bold">
              <span>Showing {filteredJobs.length} {filteredJobs.length == 1 ? "Opportunity" : "Opportunities"}</span>
            </div>

            {filteredJobs.length == 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border border-slate-200 shadow-sm mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No matches found</h3>
                <p className="text-slate-500 text-xs sm:text-sm">Adjust your filters to discover more opportunities.</p>
              </div>
              ) : (
              <div className="grid gap-4 sm:gap-5">
                {currentJobs.map((job) => renderJobCard(job, false))}
              </div>
            )}

            {totalPages > 1 ? (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
                <span className="text-xs sm:text-sm font-bold text-slate-500">
                  Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span>
                </span>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={currentPage == 1} className="px-3 sm:px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm flex items-center gap-1">
                    Prev
                  </button>
                  
                  <div className="hidden sm:flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                      const isActive = currentPage == i + 1;
                      const baseClass = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg text-sm font-bold transition ";
                      const activeClass = isActive ? "bg-blue-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100";
                      return (
                        <button key={i} onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={baseClass + activeClass}>
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={currentPage == totalPages} className="px-3 sm:px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs sm:text-sm flex items-center gap-1">
                    Next
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>

      {/* 🚨 PREMIUM SUGGESTED JOBS MODAL */}
      {showSuggestedModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Recommended for You</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Based on your profile headline.</p>
                </div>
              </div>
              <button onClick={() => setShowSuggestedModal(false)} className="text-slate-400 hover:text-rose-500 transition bg-white hover:bg-rose-50 rounded-full p-2 border border-slate-200 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50/50">
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedJobs.map((job) => renderJobCard(job, true))}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowSuggestedModal(false)} className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md w-full sm:w-auto text-center">
                View All Jobs
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Detail View Modal */}
      {selectedJob ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-slate-200 flex flex-col relative">
            <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-start sm:items-center z-10 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 truncate">{selectedJob.title}</h3>
                <p className="text-xs sm:text-sm text-blue-600 font-bold truncate mt-0.5 sm:mt-1">{getDisplayName(selectedJob.user)}</p>
                </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-700 transition bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full p-2 flex-shrink-0">
                Close
              </button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex flex-wrap gap-2">
                {(selectedJob.isRemote == true || (selectedJob.location && selectedJob.location.toLowerCase().includes("remote"))) ? (
                  <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">Remote / Flexible</span>
                  ) : null}
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">{selectedJob.employmentType || "Full-time"}</span>
                <span className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">{selectedJob.location}</span>
                {selectedJob.salary ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">${selectedJob.salary.toLocaleString()}</span>
                ) : null}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm sm:text-base">Job Description</h4>
                <p className="text-slate-600 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities ? (
                selectedJob.responsibilities.length > 0 ? (
                  <div>
                    <h4 className="font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm sm:text-base">Key Responsibilities</h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                      {selectedJob.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                    </ul>
                  </div>
                ) : null
              ) : null}

              {selectedJob.perks ? (
                selectedJob.perks.length > 0 ? (
                  <div>
                    <h4 className="font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm sm:text-base">Benefits & Perks</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.perks.map((perk, i) => (
                        <span key={i} className="text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md flex items-center">
                          {perk}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null
              ) : null}

              {selectedJob.deadline ? (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 sm:p-4 flex items-center text-rose-700 text-xs sm:text-sm font-bold shadow-sm mt-4">
                  Application Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </div>
              ) : null}
            </div>
            
            <div className="sticky bottom-0 bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 z-10 rounded-b-2xl">
              <button onClick={() => setSelectedJob(null)} className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-sm order-3 sm:order-1">
                Cancel
              </button>
              
              {userRole == "jobSeeker" ? (
                <button onClick={() => handleMessageEmployer(selectedJob)} className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 order-2">
                  Message
                </button>
              ) : null}

              {userRole == "jobSeeker" ? (
                selectedJob.applicationLink && selectedJob.applicationLink.length > 0 ? (
                  <a href={selectedJob.applicationLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition order-1 sm:order-3 flex items-center justify-center gap-2">
                    Apply on Company Site
                  </a>
                  ) : (
                  <button onClick={() => initiateApply(selectedJob._id)} className="w-full sm:w-auto px-8 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition order-1 sm:order-3">
                    Apply Now
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Apply Form Modal */}
      {showApplyModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900 bg-opacity-70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col overflow-hidden">
            
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-slate-900">Submit Application</h3>
                 <p className="text-xs text-slate-500 font-medium mt-1">Include a brief message to stand out.</p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-rose-500 transition bg-white hover:bg-rose-50 rounded-full p-2 border border-slate-200 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
               <label className="block text-sm font-bold text-slate-700 mb-2">Cover Letter / Pitch <span className="text-slate-400 font-normal">(Optional)</span></label>
               <textarea 
                 rows="5" 
                 value={coverLetterText} 
                 onChange={(e) => setCoverLetterText(e.target.value)} 
                 className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-slate-700 shadow-inner bg-slate-50 transition" 
                 placeholder="Hi there! I believe I am a great fit for this role because..."
               ></textarea>
               <p className="text-xs text-slate-400 mt-2 text-right">Your profile and resume will be attached automatically.</p>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setShowApplyModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">
                 Cancel
               </button>
               <button onClick={submitApplication} className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md flex items-center gap-2">
                 Send Application
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
            </div>

          </div>
        </div>
      ) : null}

    </div>
  );
}

export default JobBoard;
