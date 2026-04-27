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

  const handleApply = async (jobId) => {
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

    const coverLetter = window.prompt("Please provide a brief cover letter or introduction (Optional):");
    if (coverLetter == null) return; 

    const loadingToast = toast.loading("Submitting application...");

    try {
      await axios.post("https://talexajobs.onrender.com/api/applications/apply", 
        { jobId: jobId, coverLetter: coverLetter }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Application submitted successfully.");
      setSelectedJob(null); 
    } catch (error) {
      toast.dismiss(loadingToast);
      let isRestricted = false;
      if (error.response && error.response.status == 403) {
          isRestricted = true;
      }
      
      if (isRestricted == true) {
          toast.error("Your account has been restricted. Please check your email for details.", { duration: 5000, icon: "🚨" });
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

    const initialText = window.prompt("Send a message to " + getDisplayName(job.user) + " regarding the " + job.title + " role:");
    if (initialText == null || initialText.trim() == "") return; 

    const loadingToast = toast.loading("Sending message...");

    try {
      await axios.post("https://talexajobs.onrender.com/api/messages/send", 
        { receiverId: job.user._id, text: initialText, jobId: job._id }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Message sent.");
      setSelectedJob(null);
      navigate("/messages"); 
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send message.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    let isApproved = false;
    if (job.adminStatus == "approved") { isApproved = true; }
    
    let isPrivileged = false;
    if (userRole == "admin" || userRole == "employer") { isPrivileged = true; }
    
    if (isPrivileged == false && isApproved == false) { return false; }

    if (searchTerm && searchTerm.length > 0) {
      const term = searchTerm.toLowerCase();
      const titleMatch = job.title ? job.title.toLowerCase().includes(term) : false;
      const descMatch = job.description ? job.description.toLowerCase().includes(term) : false;
      let compMatch = false;
      
      if (job.user && job.user.employerInfo && job.user.employerInfo.companyName) {
        compMatch = job.user.employerInfo.companyName.toLowerCase().includes(term);
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
        if (job.isRemote == false && jobLoc.includes("remote") == false) return false;
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
  
  let showRecommendations = false;
  if (recommendedJobs.length > 0) {
      if (searchTerm.length < 1) {
          if (categoryFilter.length < 1) {
              if (currentPage == 1) {
                  showRecommendations = true;
              }
          }
      }
  }

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
    const uniqueKey = job._id || Math.random().toString();
    
    let isApproved = false;
    if (job.adminStatus == "approved") { isApproved = true; }
    
    const logoUrl = getLogo(job.user);
    const isBookmarked = savedJobs.includes(job._id);
    const jobLocStr = job.location ? job.location.toLowerCase() : "";
    
    let showRemoteBadge = false;
    if (job.isRemote == true || jobLocStr.includes("remote") == true) {
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
          <button onClick={() => handleApply(job._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs sm:text-sm text-center">
            Apply Now
          </button>
        );
      }
    }

    return (
      <div key={uniqueKey} className={cardClass}>
        {userRole == "admin" && isApproved == false && (
          <div className="mb-3 sm:mb-4 bg-rose-100 text-rose-800 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md inline-block border border-rose-200 tracking-wide uppercase">
            Hidden: Waiting for Admin Approval
          </div>
        )}
        
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
            {isEmployerOrAdmin == false && (
              <button onClick={() => handleBookmarkClick(job._id)} className="text-slate-400 hover:text-blue-600 transition" title="Save Job">
                  {isBookmarked == true ? (
                    <span className="text-blue-600 text-xl">★</span>
                  ) : (
                    <span className="text-slate-400 text-xl">☆</span>
                  )}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {showRemoteBadge == true && (
            <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
              Remote / Flexible
            </span>
          )}
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

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-5">
            {job.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="text-[10px] sm:text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && <span className="text-[10px] sm:text-xs font-bold text-slate-400 px-1 py-1">+{job.skills.length - 4} more</span>}
          </div>
        )}

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10 font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Career Opportunities</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">Discover your next role at top-tier companies.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
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
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Construction">Construction</option>
                  <option value="Delivery">Delivery & Logistics</option>
                  <option value="Care Assistance">Care Assistance</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-2 flex items-center bg-slate-50 hover:bg-blue-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 hover:border-blue-200 cursor-pointer transition shadow-sm" onClick={() => {
                  if (remoteOnly == true) { setRemoteOnly(false); } else { setRemoteOnly(true); }
              }}>
                <input type="checkbox" checked={remoteOnly} readOnly className="h-4 w-4 text-blue-600 rounded border-slate-300 pointer-events-none" />
                <label className="ml-3 block text-xs sm:text-sm text-slate-800 font-bold pointer-events-none">Remote jobs only</label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            
            {showRecommendations == true && (
              <div className="mb-8 bg-white border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✨</span>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Recommended for You</h2>
                </div>
                <p className="text-sm text-slate-500 mb-5 font-medium">Based on your profile headline.</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {recommendedJobs.map((job) => renderJobCard(job, true))}
                </div>
              </div>
            )}

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

            {totalPages > 1 && (
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
            )}

          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-slate-200 flex flex-col relative">
            <div className="sticky top-0 bg-white px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-start sm:items-center z-10 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 truncate">{selectedJob.title}</h3>
                <p className="text-xs sm:text-sm text-blue-600 font-bold truncate mt-0.5 sm:mt-1">{getDisplayName(selectedJob.user)}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-700 transition bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full p-2 flex-shrink-0">
                Close
              </button>
            </div>
            
            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex flex-wrap gap-2">
                {(selectedJob.isRemote == true || (selectedJob.location && selectedJob.location.toLowerCase().includes("remote"))) && (
                  <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">Remote / Flexible</span>
                )}
                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">{selectedJob.employmentType || "Full-time"}</span>
                <span className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">{selectedJob.location}</span>
                {selectedJob.salary && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold">${selectedJob.salary.toLocaleString()}</span>
                )}
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm sm:text-base">Job Description</h4>
                <p className="text-slate-600 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm sm:text-base">Key Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs sm:text-sm">
                    {selectedJob.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                  </ul>
                </div>
              )}

              {selectedJob.perks && selectedJob.perks.length > 0 && (
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
              )}

              {selectedJob.deadline && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 sm:p-4 flex items-center text-rose-700 text-xs sm:text-sm font-bold shadow-sm mt-4">
                  Application Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-slate-50 px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 z-10 rounded-b-2xl">
              <button onClick={() => setSelectedJob(null)} className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition shadow-sm order-3 sm:order-1">
                Cancel
              </button>
              
              {userRole == "jobSeeker" && (
                <button onClick={() => handleMessageEmployer(selectedJob)} className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 order-2">
                  Message
                </button>
              )}

              {userRole == "jobSeeker" && selectedJob.applicationLink && selectedJob.applicationLink.length > 0 && (
                <a href={selectedJob.applicationLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition order-1 sm:order-3 flex items-center justify-center gap-2">
                  Apply on Company Site
                </a>
              )}
              
              {userRole == "jobSeeker" && (selectedJob.applicationLink == null || selectedJob.applicationLink.length == 0) && (
                <button onClick={() => handleApply(selectedJob._id)} className="w-full sm:w-auto px-8 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition order-1 sm:order-3">
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default JobBoard;