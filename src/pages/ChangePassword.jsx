import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(function(prev) { return { ...prev, [name]: value }; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 🚨 NOTE: We will build this endpoint in the backend next!
      const res = await axios.post('https://talexajobs.onrender.com/api/users/change-password', formData, {
        headers: { token: token, Authorization: "Bearer " + token }
      });

      if (res.data.success) {
        toast.success("Password updated securely!");
        navigate('/settings');
      }
    } catch (error) {
      let msg = "Failed to update password.";
      if (error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Change Password</h1>
          <p className="text-slate-500 text-sm mt-2">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} required className={inputClass} placeholder="Enter your old password" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required className={inputClass} placeholder="Minimum 6 characters" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} placeholder="Type new password again" />
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-3">
            <button type="submit" disabled={loading} className={"w-full py-3.5 rounded-xl font-black text-white transition shadow-md flex justify-center items-center gap-2 " + (loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700")}>
              {loading ? "Verifying..." : "Update Password securely"}
              </button>
            <button type="button" onClick={() => navigate('/settings')} className="w-full py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
              Cancel & Go Back
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ChangePassword;