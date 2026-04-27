import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [employers, setEmployers] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedEmployer, setSelectedEmployer] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.role !== "admin") {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const headers = { headers: { token: token, Authorization: "Bearer " + token } };

        const empResponse = await axios.get("http://localhost:5000/api/users/admin/employers", headers);
        if (empResponse.data.success) {
          setEmployers(empResponse.data.employers);
        }

        const seekerResponse = await axios.get("http://localhost:5000/api/users/admin/seekers", headers);
        if (seekerResponse.data.success) {
          setSeekers(seekerResponse.data.seekers);
        }

        const jobResponse = await axios.get("http://localhost:5000/api/jobs/admin/all", headers);
        if (jobResponse.data.jobs && Array.isArray(jobResponse.data.jobs)) {
          setAllJobs(jobResponse.data.jobs);
        } else if (Array.isArray(jobResponse.data)) {
          setAllJobs(jobResponse.data);
        }

      } catch (error) {
        console.error("Admin Fetch Error:", error);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleVerifyEmployer = async (employerId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/users/admin/verify-employer/" + employerId,
        { status: newStatus },
        { headers: { token: token, Authorization: "Bearer " + token } }
      );

      const updatedEmployers = employers.map((emp) => {
        if (emp._id === employerId) {
          if (!emp.employerInfo) emp.employerInfo = {};
          emp.employerInfo.adminVerificationStatus = newStatus;
        }
        return emp;
      });

      setEmployers(updatedEmployers);
      if (selectedEmployer) setSelectedEmployer(null);
      toast.success("Employer has been marked as " + newStatus + "."); 
    } catch (error) {
      toast.error("Failed to update status."); 
    }
  };

  const handleJobStatus = async (jobId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://localhost:5000/api/jobs/admin/status/" + jobId,
        { adminStatus: newStatus },
        { headers: { token: token, Authorization: "Bearer " + token } }
      );

      const updatedJobs = allJobs.map((job) => {
        if (job._id === jobId) job.adminStatus = newStatus;
        return job;
      });

      setAllJobs(updatedJobs);
      setSelectedJob(null); 
      toast.success("Job has been " + newStatus + "."); 
    } catch (error) {
      toast.error("Failed to update job status."); 
    }
  };

  const handleDeleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    const isSure = window.confirm("Are you sure you want to delete this job permanently?");
    if (!isSure) return;

    try {
      await axios.delete("http://localhost:5000/api/jobs/delete/" + jobId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      setAllJobs(allJobs.filter((job) => job._id !== jobId));
      setSelectedJob(null); 
      toast.success("Job permanently deleted."); 
    } catch (error) {
      toast.error("Failed to delete job."); 
    }
    };

  const handleBlockUser = async (userId, currentStatus) => {
    const token = localStorage.getItem("token");
    const newStatus = !currentStatus;
    let actionWord = "unblock";
    if (newStatus === true) actionWord = "block";
    
    const isSure = window.confirm("Are you sure you want to " + actionWord + " this user?");
    if (!isSure) return;

    try {
      await axios.put("http://localhost:5000/api/users/admin/block/" + userId,
        { isBlocked: newStatus },
        { headers: { token: token, Authorization: "Bearer " + token } }
      );

      const updatedSeekers = seekers.map((s) => {
        if (s._id === userId) s.isBlocked = newStatus;
        return s;
      });
      setSeekers(updatedSeekers);
      toast.success("User " + actionWord + "ed successfully.");
    } catch (error) {
      toast.error("Failed to update user status.");
    }
  };

  const getJobStatus = (job) => {
    if (job && job.adminStatus) return job.adminStatus;
    return "pending";
  };

  const getEmployerStatus = (emp) => {
    if (emp && emp.employerInfo && emp.employerInfo.adminVerificationStatus) {
      return emp.employerInfo.adminVerificationStatus;
    }
    return "not_submitted";
  };

  const getEmployerName = (emp) => {
    if (emp && emp.employerInfo && emp.employerInfo.companyName) return emp.employerInfo.companyName;
    if (emp && emp.fullName) return emp.fullName;
    return "Confidential";
  };
  
  const getCompanyName = (user) => {
    if (!user) return "Confidential";
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName;
    if (user.fullName) return user.fullName;
    return "Confidential";
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-rose-200 text-center">
          <svg className="w-16 h-16 text-rose-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You do not have administrative privileges.</p>
          <button onClick={() => window.location.href = "/"} className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-800 transition">Return Home</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Initializing Command Center...</p>
      </div>
    );
  }

  const pendingJobs = allJobs.filter((job) => getJobStatus(job) === "pending");
  const liveJobs = allJobs.filter((job) => getJobStatus(job) === "approved");

  let tabClassPending = "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition shadow-sm border ";
  let tabClassEmployers = "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition shadow-sm border ";
  let tabClassSeekers = "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition shadow-sm border ";
  let tabClassLive = "flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition shadow-sm border ";

  let pendingBadgeClass = "px-2 py-0.5 rounded-md text-xs border ";
  let liveBadgeClass = "px-2 py-0.5 rounded-md text-xs border ";

  if (activeTab === "pending") {
    tabClassPending += "bg-amber-500 text-white border-amber-500";
    pendingBadgeClass += "bg-white text-amber-600 border-transparent";
  } else {
    tabClassPending += "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
    pendingBadgeClass += "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (activeTab === "employers") {
    tabClassEmployers += "bg-slate-800 text-white border-slate-800";
  } else {
    tabClassEmployers += "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
  }

  if (activeTab === "seekers") {
    tabClassSeekers += "bg-indigo-600 text-white border-indigo-600";
  } else {
    tabClassSeekers += "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
  }

  if (activeTab === "live") {
    tabClassLive += "bg-blue-600 text-white border-blue-600";
    liveBadgeClass += "bg-white text-blue-600 border-transparent";
  } else {
    tabClassLive += "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
    liveBadgeClass += "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-lg gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Admin Command Center
            </h1>
            <p className="text-slate-400 mt-2 font-medium text-sm md:text-base">Manage employers, users, review job postings, and secure the platform.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
          <button onClick={() => setActiveTab("pending")} className={tabClassPending}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Review Queue
            {pendingJobs.length > 0 && (
              <span className={pendingBadgeClass}>{pendingJobs.length}</span>
            )}
          </button>

          <button onClick={() => setActiveTab("employers")} className={tabClassEmployers}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Manage Employers
          </button>

          <button onClick={() => setActiveTab("seekers")} className={tabClassSeekers}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Manage Users
          </button>
          
          <button onClick={() => setActiveTab("live")} className={tabClassLive}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            Live Jobs
            <span className={liveBadgeClass}>{liveJobs.length}</span>
          </button>
        </div>

        {activeTab === "employers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Registered Companies</h2>
            <div className="grid grid-cols-1 gap-4">
              {employers.map((emp) => {
                const empStatus = getEmployerStatus(emp);
                let badgeClass = "px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border ";
                
                if (empStatus === "approved") {
                  badgeClass += "bg-emerald-50 text-emerald-700 border-emerald-200";
                } else if (empStatus === "rejected") {
                  badgeClass += "bg-rose-50 text-rose-700 border-rose-200";
                } else {
                  badgeClass += "bg-amber-50 text-amber-700 border-amber-200";
                }

                return (
                  <div key={emp._id} className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight truncate">{getEmployerName(emp)}</h3>
                        <span className={badgeClass}>{empStatus.replace("_", " ")}</span>
                      </div>
                      <a href={"mailto:" + emp.email} className="text-sm text-slate-500 hover:text-blue-600 transition font-medium break-all">{emp.email}</a>
                      
                      {emp.employerInfo && emp.employerInfo.website && (
                        <div className="mt-1">
                           <a href={emp.employerInfo.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition font-bold truncate">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                             {emp.employerInfo.website}
                           </a>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button onClick={() => setSelectedEmployer(emp)} className="col-span-2 sm:col-span-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">View Profile</button>
                      <button onClick={() => handleVerifyEmployer(emp._id, "approved")} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">Approve</button>
                      <button onClick={() => handleVerifyEmployer(emp._id, "rejected")} className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "seekers" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Registered Job Seekers</h2>
            <div className="grid grid-cols-1 gap-4">
              {seekers.map((user) => {
                let isBlocked = user.isBlocked === true;
                return (
                  <div key={user._id} className={"border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition " + (isBlocked ? "border-rose-200 bg-rose-50" : "border-slate-200 hover:shadow-md")}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className={"font-extrabold text-lg leading-tight truncate " + (isBlocked ? "text-rose-900 line-through opacity-70" : "text-slate-900")}>{user.fullName}</h3>
                        {isBlocked ? (
                           <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border bg-rose-100 text-rose-800 border-rose-200">BLOCKED</span>
                        ) : (
                           <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">ACTIVE</span>
                        )}
                      </div>
                      <a href={"mailto:" + user.email} className={"text-sm font-medium break-all " + (isBlocked ? "text-rose-500" : "text-slate-500 hover:text-blue-600 transition")}>{user.email}</a>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {isBlocked ? (
                        <button onClick={() => handleBlockUser(user._id, isBlocked)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-2 px-6 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">Unblock User</button>
                      ) : (
                        <button onClick={() => handleBlockUser(user._id, isBlocked)} className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold py-2 px-6 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">Block User</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Awaiting Review</h2>
            {pendingJobs.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Queue is Empty</h3>
                <p className="text-slate-500 text-sm">No new jobs are waiting for review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingJobs.map((job) => (
                  <div key={job._id} className="border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight truncate">{job.title}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1 truncate">{getCompanyName(job.user)} - {job.location}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="bg-white text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{job.category}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedJob(job)} className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 font-bold py-2.5 px-6 rounded-lg text-sm transition shadow-md">Review Dossier</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "live" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-100">Live Public Jobs</h2>
            {liveJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm font-medium">No live jobs currently on the platform.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {liveJobs.map((job) => (
                  <div key={job._id} className="border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-slate-900 text-lg leading-tight truncate">{job.title}</h3>
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0">Live</span>
                      </div>
                      <p className="text-sm text-slate-500 font-medium truncate">{getCompanyName(job.user)}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                      <button onClick={() => setSelectedJob(job)} className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm w-full sm:w-auto">Details</button>
                      <button onClick={() => handleDeleteJob(job._id)} className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold py-2 px-4 rounded-lg text-sm transition shadow-sm w-full sm:w-auto flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {selectedEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 flex flex-col">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Company Profile
              </h3>
              <button onClick={() => setSelectedEmployer(null)} className="text-slate-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Owner</p>
                <p className="text-slate-900 font-bold">{selectedEmployer.fullName}</p>
                <a href={"mailto:" + selectedEmployer.email} className="text-blue-600 text-sm hover:underline">{selectedEmployer.email}</a>
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</p>
                <p className="text-slate-900 font-bold text-lg">
                  {selectedEmployer.employerInfo && selectedEmployer.employerInfo.companyName ? selectedEmployer.employerInfo.companyName : "Not Provided"}
                </p>
              </div>
              {selectedEmployer.employerInfo && selectedEmployer.employerInfo.website && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Website</p>
                  <a href={selectedEmployer.employerInfo.website} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline break-all">
                    {selectedEmployer.employerInfo.website}
                  </a>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Description</p>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {selectedEmployer.employerInfo && selectedEmployer.employerInfo.companyDescription ? selectedEmployer.employerInfo.companyDescription : "No description provided by the employer."}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => handleVerifyEmployer(selectedEmployer._id, "rejected")} className="px-5 py-2 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition shadow-sm w-full sm:w-auto">Reject</button>
              <button onClick={() => handleVerifyEmployer(selectedEmployer._id, "approved")} className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition w-full sm:w-auto">Approve Company</button>
            </div>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 flex flex-col">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-start sm:items-center z-10 gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate">{selectedJob.title}</h3>
                <p className="text-sm text-slate-500 font-medium truncate">{getCompanyName(selectedJob.user)}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-700 transition bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              
              {selectedJob.applicationLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col gap-1.5">
                  <h4 className="font-extrabold text-blue-900 flex items-center gap-1.5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    External Routing Enabled
                  </h4>
                  <p className="text-blue-700 text-sm font-medium">This employer is redirecting candidates to apply outside of Talexajobs:</p>
                  <a href={selectedJob.applicationLink} target="_blank" rel="noreferrer" className="text-blue-600 font-bold text-sm hover:underline break-all mt-1">
                    {selectedJob.applicationLink}
                  </a>
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap">{selectedJob.employmentType || "Full-time"}</span>
                <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap">{selectedJob.location}</span>
                {selectedJob.salary && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap">${selectedJob.salary.toLocaleString()}</span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">Job Description</h4>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedJob.description}</p>
              </div>
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">Key Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-sm">
                    {selectedJob.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
                  </ul>
                </div>
              )}
              {selectedJob.perks && selectedJob.perks.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">Benefits & Perks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.perks.map((perk, i) => (
                      <span key={i} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100">{perk}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-100 pb-1">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.map((skill, i) => (
                      <span key={i} className="text-xs font-bold bg-white text-slate-600 px-2 py-1 rounded-md border border-slate-200 shadow-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3 z-10 rounded-b-2xl">
              {getJobStatus(selectedJob) === "pending" ? (
                <>
                  <button onClick={() => handleJobStatus(selectedJob._id, "rejected")} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition shadow-sm">Reject</button>
                  <button onClick={() => handleJobStatus(selectedJob._id, "approved")} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition">Approve Posting</button>
                </>
              ) : (
                <button onClick={() => handleDeleteJob(selectedJob._id)} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md transition">Force Delete Job</button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;