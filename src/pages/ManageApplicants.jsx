import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ManageApplicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingCoverLetter, setViewingCoverLetter] = useState(null); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/applications/employer', {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        
        if (response.data.success) {
          setApplications(response.data.applications);
        } else if (Array.isArray(response.data)) {
          setApplications(response.data);
        }
      } catch (error) {
        toast.error("Could not load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await axios.put('http://localhost:5000/api/applications/status/' + appId, 
        { status: newStatus.toLowerCase() },
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.success("Applicant status updated!");
      setApplications(function(prevApps) {
        return prevApps.map(function(app) {
          if (app._id === appId) {
            return { ...app, status: newStatus.toLowerCase() };
          }
          return app;
        });
      });
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteApplicant = async (appId) => {
    if (!window.confirm("Remove this candidate permanently? This cannot be undone.")) return;
    const loadingToast = toast.loading("Removing candidate...");
    try {
      await axios.delete('http://localhost:5000/api/applications/delete/' + appId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      toast.dismiss(loadingToast);
      toast.success("Candidate removed.");
      setApplications(function(prevApps) { 
        return prevApps.filter(function(app) { return app._id !== appId; }); 
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to remove candidate.");
    }
  };

  const handleMessageCandidate = async (candidate, jobTitle) => {
    let candId = null;
    if (candidate) {
      if (candidate._id) candId = candidate._id;
    }
    if (!candId) {
      toast.error("Cannot message this candidate.");
      return;
    }

    let candName = "Candidate";
    if (candidate) {
      if (candidate.fullName) candName = candidate.fullName;
    }

    const initialText = window.prompt("Send a message to " + candName + " regarding the " + jobTitle + " role:");
    
    let hasText = false;
    if (initialText) {
      if (initialText.trim() !== '') {
        hasText = true;
      }
    }
    if (!hasText) return; 

    const loadingToast = toast.loading("Sending message...");
    try {
      await axios.post('http://localhost:5000/api/messages/send', 
        { receiverId: candId, text: initialText }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Message sent!");
      navigate('/messages'); 
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send message.");
    }
  };

  const getAvatarUrl = (user) => {
    if (!user) return null;
    let rawUrl = null;
    if (user.profilePictureUrl) rawUrl = user.profilePictureUrl;
    if (!rawUrl) return null;

    const cleanPath = rawUrl.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.startsWith('/')) return "http://localhost:5000" + cleanPath;
    return "http://localhost:5000/" + cleanPath;
  };
  const getAvatarFallback = (user) => {
    if (!user) return "C";
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    return "C";
  };

  const getStatusColor = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'pending') return "bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-500";
    if (s === 'reviewed') return "bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500";
    if (s === 'interviewing') return "bg-purple-50 text-purple-800 border-purple-200 focus:ring-purple-500";
    if (s === 'accepted') return "bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500";
    if (s === 'rejected') return "bg-rose-50 text-rose-800 border-rose-200 focus:ring-rose-500";
    return "bg-slate-50 text-slate-800 border-slate-200";
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return 'Pending';
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Candidate Pipeline...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12 font-sans pb-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PREMIUM HEADER */}
        <div className="mb-6 md:mb-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Candidate Pipeline
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">Review, status, and message candidates for your active jobs.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm md:text-base font-extrabold text-slate-800 uppercase tracking-wider">Total Applications</h3>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold border border-blue-100">
              {applications.length} Candidates
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">No Candidates Yet</h3>
              <p className="text-sm sm:text-base text-slate-500 font-medium">When job seekers apply to your postings, they will appear here.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4">
              {applications.map(function(app) {
                let jobTitle = "Unknown Job";
                if (app.job && app.job.title) jobTitle = app.job.title;let candidateData = null;
                if (app.user) candidateData = app.user;
                else if (app.applicant) candidateData = app.applicant;
                else if (app.candidate) candidateData = app.candidate;
                let candName = "Deleted User";
                let candHeadline = "No headline";
                
                if (candidateData) {
                  if (candidateData.fullName) candName = candidateData.fullName;
                  if (candidateData.candidateInfo && candidateData.candidateInfo.headline) {
                    candHeadline = candidateData.candidateInfo.headline;
                  }
                }

                const avatarUrl = getAvatarUrl(candidateData);

                return (
                  <div key={app._id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-5 hover:border-blue-300 hover:shadow-md transition duration-200 relative overflow-hidden">
                    
                    {/* Top Row: Avatar + Info */}
                    <div className="flex items-start justify-between gap-3 xl:w-2/5">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 relative">
                          {avatarUrl ? (
                            <>
                              <img src={avatarUrl} alt="Candidate" className="h-full w-full object-cover z-10 relative" onError={(e) => { e.target.style.display = 'none'; }} />
                              <span className="absolute inset-0 flex items-center justify-center font-extrabold text-slate-400 text-xl z-0">
                                {getAvatarFallback(candidateData)}
                              </span>
                            </>
                          ) : (
                            <span className="font-extrabold text-slate-400 text-xl z-0">{getAvatarFallback(candidateData)}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900 text-lg sm:text-xl leading-tight truncate">{candName}</p>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5 mb-1.5">{candHeadline}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 truncate max-w-full">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                            <span className="truncate">Applied: {jobTitle}</span>
                          </span>
                        </div>
                      </div>

                      {/* Trash Icon (Visible on small screens) */}
                      <button 
                        onClick={() => handleDeleteApplicant(app._id)}
                        className="xl:hidden text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-2 sm:p-2.5 rounded-full transition shadow-sm border border-slate-100 hover:border-rose-200 flex-shrink-0"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <hr className="border-slate-100 xl:hidden" />

                    {/* Bottom Row: Status Dropdown + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-3 flex-1">
                      
                      {/* Premium Status Dropdown */}
                      <div className="flex items-center gap-2.5 w-full sm:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">Status:</span>
                        <select 
                          value={capitalize(app.status)}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className={"text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg border shadow-sm cursor-pointer outline-none focus:ring-2 flex-1 sm:flex-none transition " + getStatusColor(app.status)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      {/* 🚨 THE SMART LAYOUT FIX: Beautiful responsive grouping */}
                      <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                        
                        {/* Cover Letter spans full width on mobile, inline on desktop */}
                        {app.coverLetter && (
                          <button 
                            onClick={() => setViewingCoverLetter({ name: candName, text: app.coverLetter })}
                            className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-lg shadow-amber-500/30 border border-amber-300 gap-1.5"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Read Cover Letter
                          </button>
                        )}

                        {/* Profile & Message neatly sit side-by-side (50/50) on mobile */}
                        <div className="flex gap-2.5 w-full sm:w-auto">
                          {candidateData ? (
                            <Link to={"/candidate/" + candidateData._id} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm">
                              Profile
                            </Link>
                          ) : (
                            <span className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-xs sm:text-sm font-bold border border-slate-200">N/A</span>
                          )}
                          
                          <button 
                            onClick={() => handleMessageCandidate(candidateData, jobTitle)}
                            disabled={!candidateData}
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-xs sm:text-sm font-bold transition shadow-sm gap-1.5"
                          >
                            Message
                            </button>
                        </div>
                        
                        {/* Trash Icon (Visible only on XL screens) */}
                        <button 
                          onClick={() => handleDeleteApplicant(app._id)}
                          className="hidden xl:flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-2.5 rounded-xl transition shadow-sm border border-slate-100 hover:border-rose-200"
                          title="Remove Candidate"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🚨 THE SHINY COVER LETTER MODAL */}
      {viewingCoverLetter && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-black text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {viewingCoverLetter.name}'s Cover Letter
              </h3>
              <button onClick={() => setViewingCoverLetter(null)} className="text-white hover:bg-amber-600/50 p-1.5 rounded-full transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium max-h-[60vh] overflow-y-auto">
                {viewingCoverLetter.text}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <button onClick={() => setViewingCoverLetter(null)} className="bg-white border border-slate-300 text-slate-700 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageApplicants;