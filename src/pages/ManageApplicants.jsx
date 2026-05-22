import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function ManageApplicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingCoverLetter, setViewingCoverLetter] = useState(null); 
  
  const [deleteModalAppId, setDeleteModalAppId] = useState(null);
  const [messageModalData, setMessageModalData] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await axios.get('https://talexajobs.onrender.com/api/applications/employer', {
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
      await axios.put('https://talexajobs.onrender.com/api/applications/status/' + appId, 
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

  const triggerDelete = (appId) => {
    setDeleteModalAppId(appId);
  };

  const confirmDeleteApplicant = async () => {
    if (!deleteModalAppId) return;
    const loadingToast = toast.loading("Removing candidate...");
    try {
      await axios.delete('https://talexajobs.onrender.com/api/applications/delete/' + deleteModalAppId, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      toast.dismiss(loadingToast);
      toast.success("Candidate removed.");
      setApplications(function(prevApps) { 
        return prevApps.filter(function(app) { return app._id !== deleteModalAppId; }); 
      });
      setDeleteModalAppId(null);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to remove candidate.");
      setDeleteModalAppId(null);
    }
  };

  const triggerMessage = (candidate, jobTitle) => {
    let candId = null;
    if (candidate && candidate._id) candId = candidate._id;
    
    if (!candId) {
      toast.error("Cannot message this candidate.");
      return;
    }

    let candName = "Candidate";
    if (candidate && candidate.fullName) candName = candidate.fullName;

    setMessageText("");
    setMessageModalData({ candId, candName, jobTitle });
  };

  const confirmMessageCandidate = async () => {
    if (!messageModalData || messageText.trim() === '') {
      toast.error("Please enter a message.");
      return;
    }

    setIsSending(true);
    const loadingToast = toast.loading("Sending message...");
    try {
      await axios.post('https://talexajobs.onrender.com/api/messages/send', 
        { receiverId: messageModalData.candId, text: messageText }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Message sent!");
      setMessageModalData(null);
      navigate('/messages'); 
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send message.");
      setIsSending(false);
    }
  };

  const getAvatarUrl = (user) => {
    if (!user) return null;
    let rawUrl = null;
    if (user.profilePictureUrl) rawUrl = user.profilePictureUrl;
    if (!rawUrl) return null;

    const cleanPath = rawUrl.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
    return "https://talexajobs.onrender.com/" + cleanPath;
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
        
        <div className="mb-6 md:mb-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Candidate Pipeline
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">Review, status, and message candidates for your active jobs.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-wider">Total Applications</h3>
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
                if (app.job && app.job.title) jobTitle = app.job.title;
                
                let candidateData = null;
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
                    
                    <div className="flex items-start justify-between gap-3 xl:w-2/5">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* BULLETPROOF AVATAR CONTAINER */}
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-slate-100 shadow-sm overflow-hidden bg-slate-200 flex items-center justify-center flex-shrink-0 relative">
                          <span className="font-bold text-slate-500 text-xl sm:text-2xl absolute inset-0 flex items-center justify-center z-0">
                            {getAvatarFallback(candidateData)}
                          </span>
                          {avatarUrl && (
                            <img src={avatarUrl} alt="Candidate" className="h-full w-full object-cover z-10 relative bg-white" onError={(e) => { e.target.style.display = 'none'; }} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-slate-900 text-lg sm:text-xl leading-tight break-words whitespace-normal">{candName}</p>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium break-words whitespace-normal mt-0.5 mb-1.5">{candHeadline}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 max-w-full">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                            <span className="break-words whitespace-normal">Applied: {jobTitle}</span>
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => triggerDelete(app._id)}
                        className="xl:hidden text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-2 sm:p-2.5 rounded-full transition shadow-sm border border-slate-100 hover:border-rose-200 flex-shrink-0"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <hr className="border-slate-100 xl:hidden" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-3 flex-1">
                      
                      <div className="flex items-center gap-2.5 w-full sm:w-auto bg-slate-50 p-1.5 rounded-xl border border-slate-100 flex-shrink-0">
                        <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider pl-2">Status:</span>
                        <select 
                          value={capitalize(app.status)}
                          onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                          className={"text-sm sm:text-base font-black px-4 py-2.5 rounded-xl border shadow-sm cursor-pointer outline-none focus:ring-2 flex-1 sm:flex-none transition " + getStatusColor(app.status)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Interviewing">Interviewing</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                        {app.coverLetter && (
                          <button 
                            onClick={() => setViewingCoverLetter({ name: candName, text: app.coverLetter })}
                            className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-sm font-black transition shadow-lg border border-amber-300 gap-1.5"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Read Cover Letter
                          </button>
                        )}

                        <div className="flex gap-2.5 w-full sm:w-auto">
                          {candidateData ? (
                            <Link to={"/candidate/" + candidateData._id} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition shadow-sm">
                              Profile
                            </Link>
                          ) : (
                            <span className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold border border-slate-200">N/A</span>
                          )}
                          
                          <button 
                            onClick={() => triggerMessage(candidateData, jobTitle)}
                            disabled={!candidateData}
                            className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition shadow-sm gap-1.5"
                          >
                            Message
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => triggerDelete(app._id)}
                          className="hidden xl:flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 p-3 sm:p-3.5 rounded-xl transition shadow-sm border border-slate-100 hover:border-rose-200"
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

      {/* COVER LETTER MODAL */}
      {viewingCoverLetter && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-black text-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {viewingCoverLetter.name}'s Cover Letter
              </h3>
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

      {/* PREMIUM DELETE WARNING MODAL */}
      {deleteModalAppId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="bg-rose-50 px-6 py-6 text-center border-b border-rose-100">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-xl font-black text-slate-900">Remove Candidate?</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">This action cannot be undone and their application will be permanently deleted.</p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
               <button onClick={() => setDeleteModalAppId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">
                 Cancel
               </button>
               <button onClick={confirmDeleteApplicant} className="flex-1 py-3 rounded-xl font-black text-white bg-rose-600 hover:bg-rose-700 transition shadow-md">
                 Remove
               </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MESSAGE CANDIDATE MODAL */}
      {messageModalData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-black text-slate-900">Message {messageModalData.candName}</h3>
                 <p className="text-xs text-slate-500 font-medium mt-1">Regarding the <strong className="text-slate-700">{messageModalData.jobTitle}</strong> role.</p>
              </div>
              <button onClick={() => setMessageModalData(null)} className="text-slate-400 hover:text-rose-500 transition bg-white hover:bg-rose-50 rounded-full p-2 border border-slate-200 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
               <textarea 
                 rows="4" 
                 value={messageText} 
                 onChange={(e) => setMessageText(e.target.value)} 
                 className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-slate-700 shadow-inner bg-slate-50 transition" 
                 placeholder={`Hi ${messageModalData.candName}, we would love to schedule an interview with you...`}
               ></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <button onClick={() => setMessageModalData(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 transition shadow-sm">
                 Cancel
               </button>
               <button onClick={confirmMessageCandidate} disabled={isSending} className={"px-6 py-2.5 rounded-xl font-bold text-white transition shadow-md flex items-center gap-2 " + (isSending ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}>
                 {isSending ? "Sending..." : "Send Message"}
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ManageApplicants;
