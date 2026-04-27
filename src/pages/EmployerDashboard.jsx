import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function EmployerDashboard() {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem("user");
  const userData = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        if (res.data.success) {
          setMyJobs(res.data.jobs);
        }
      } catch (error) {
        toast.error("Could not load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [token, navigate]);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Permanently delete this job posting? This cannot be undone.")) return;
    const loadingToast = toast.loading("Deleting job...");
    try {
      await axios.delete('http://localhost:5000/api/jobs/delete/' + jobId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      toast.dismiss(loadingToast);
      toast.success("Job deleted successfully.");
      setMyJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete job.");
    }
  };

  const getAdminStatusBadge = (status) => {
    const safeStatus = status ? status.toLowerCase() : 'pending';
    if (safeStatus === 'approved') {
      return (
        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-emerald-200 flex items-center gap-1 w-fit shadow-sm flex-shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Approved
        </span>
      );
    }
    if (safeStatus === 'rejected') {
      return (
        <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-rose-200 flex items-center gap-1 w-fit shadow-sm flex-shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> Rejected
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-amber-200 flex items-center gap-1 w-fit shadow-sm flex-shrink-0">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pending Review
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Employer Dashboard...</p>
      </div>
    );
  }

return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        
        {/* PREMIUM HEADER */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg gap-5 sm:gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              Employer Command Center
            </h1>
            <p className="text-slate-300 mt-2 font-medium text-sm sm:text-base">
              Welcome back, {userData && userData.employerInfo ? userData.employerInfo.companyName : "Employer"}. Manage your postings.
            </p>
          </div>
          <Link to="/post-job" className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition shadow-md whitespace-nowrap relative z-10 text-sm sm:text-base">
            + Post New Job
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm md:text-base font-extrabold text-slate-800 uppercase tracking-wider">Active Postings</h3>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold border border-blue-100">
              {myJobs.length} Jobs
            </span>
          </div>

          {myJobs.length === 0 ? (
            <div className="text-center text-slate-500 p-12 sm:p-16 flex flex-col items-center">
              <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Jobs Posted</h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium mb-6">You haven't listed any jobs on the platform yet.</p>
              <Link to="/post-job" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition shadow-md text-sm sm:text-base">
                Create First Posting
              </Link>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {myJobs.map((job) => (
                <div key={job._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-blue-300 hover:shadow-md transition duration-200">
                  
                  {/* Left Side: Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                      <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight truncate">{job.title ? job.title : "Untitled Job"}</h3>
                      {getAdminStatusBadge(job.adminStatus)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 font-bold mt-2">
                      <span className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 max-w-full">
                        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="truncate">{job.location ? job.location : "Remote"}</span>
                      </span>
                      
                      <div className="flex gap-2 sm:gap-3">
                        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                          {job.employmentType ? job.employmentType : "Full-time"}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {job.salary ? "$" + job.salary.toLocaleString() : "Negotiable"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t border-slate-100 lg:border-none mt-2 lg:mt-0">
                    
                    <Link 
                      to="/manage-applicants" 
                      className="w-full sm:w-auto flex-1 lg:flex-none flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      View Applicants
                    </Link>

                    {/* 🚨 THE NEW EDIT BUTTON */}
                    <Link 
                      to={"/edit-job/" + job._id} 
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-white text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </Link>

                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-white text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;